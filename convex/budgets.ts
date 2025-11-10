import { ConvexError, v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { TransactionCategories } from "../src/constants/categories";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const createBudget = mutation({
  args: {
    limit: v.number(),
    category: v.union(
      ...TransactionCategories.map((item) => v.literal(item.name))
    ),
    periodStart: v.number(),
    periodEnd: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    const now = Date.now();
    const { periodStart, periodEnd } = args;

    if (userId === null) {
      throw new ConvexError("User not aunthenticated");
    }

    if (periodEnd <= periodStart)
      throw new ConvexError("End date must be after start date");
    if (periodEnd - periodStart < 86400000)
      throw new ConvexError("Budget period must be at least 1 day"); // 24h ms

    const overlapping = await ctx.db
      .query("budgets")
      .withIndex("by_user_category", (q) =>
        q.eq("userId", userId).eq("category", args.category)
      )
      .filter((q) =>
        q.or(
          q.and(
            q.gt(q.field("periodStart"), periodStart),
            q.lt(q.field("periodStart"), periodEnd)
          ),
          q.and(
            q.gt(q.field("periodEnd"), periodStart),
            q.lt(q.field("periodEnd"), periodEnd)
          )
        )
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    if (overlapping.length > 0)
      throw new ConvexError(
        `Active budget already exists for ${args.category} in this period`
      );

    const budgetId = await ctx.db.insert("budgets", {
      ...args,
      userId,
      isActive: true,
    });

    const delayMs = Math.max(0, periodEnd - now);

    if (delayMs === 0) {
      // Edge case: Immediate end → Deactivate now
      await ctx.runMutation(internal.budgets.deactivateBudget, { budgetId });
    } else {
      const token = await ctx.scheduler.runAfter(
        delayMs,
        internal.budgets.deactivateBudget,
        { budgetId }
      );
      // Store token for later cancel
      await ctx.runMutation(internal.budgets.updateToken, {
        budgetId,
        token: token,
      });
    }
  },
});

export const updateBudget = mutation({
  args: {
    _id: v.id("budgets"),
    limit: v.number(),
    category: v.union(
      ...TransactionCategories.map((item) => v.literal(item.name))
    ),
    periodStart: v.number(),
    periodEnd: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    const now = Date.now();
    const { periodStart, periodEnd } = args;

    if (userId === null) {
      throw new ConvexError("User not aunthenticated");
    }

    if (periodEnd <= periodStart)
      throw new ConvexError("End date must be after start date");
    if (periodEnd - periodStart < 86400000)
      throw new ConvexError("Budget period must be at least 1 day"); // 24h ms
    // if (periodStart < now)
    //   throw new ConvexError("Start date cannot be in the past");

    const overlapping = await ctx.db
      .query("budgets")
      .withIndex("by_user_category", (q) =>
        q.eq("userId", userId).eq("category", args.category)
      )
      .filter((q) => q.neq(q.field("_id"), args._id))
      .filter((q) =>
        q.or(
          q.and(
            q.gt(q.field("periodStart"), periodStart),
            q.lt(q.field("periodStart"), periodEnd)
          ),
          q.and(
            q.gt(q.field("periodEnd"), periodStart),
            q.lt(q.field("periodEnd"), periodEnd)
          )
        )
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    if (overlapping.length > 0)
      throw new ConvexError(
        `Active budget already exists for ${args.category} in this period`
      );

    const existing = await ctx.db.get(args._id);

    if (!existing) throw new ConvexError("Budget not found");

    if (existing.userId !== userId) throw new ConvexError("Not Authorized");

    await ctx.db.patch(args._id, args);

    // Cancel old schedule if exists
    if (existing.scheduledToken) {
      try {
        await ctx.scheduler.cancel(existing.scheduledToken);
      } catch (e) {
        console.warn(`Failed to cancel schedule for ${args._id}: ${e}`);
      }
    }

    if (
      !existing.scheduledToken ||
      existing.periodStart !== args.periodStart ||
      existing.periodEnd !== args.periodEnd
    ) {
      const delayMs = Math.max(0, args.periodEnd - now);

      if (delayMs === 0) {
        await ctx.runMutation(internal.budgets.deactivateBudget, {
          budgetId: args._id,
        });
      } else {
        const newToken = await ctx.scheduler.runAfter(
          delayMs,
          internal.budgets.deactivateBudget,
          { budgetId: args._id }
        );
        await ctx.runMutation(internal.budgets.updateToken, {
          budgetId: args._id,
          token: newToken,
        });
      }
    }

    return { success: true, budgetId: args._id };
  },
});

export const deleteBudget = mutation({
  args: {
    budgetId: v.id("budgets"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthorized");

    const budget = await ctx.db.get(args.budgetId);
    if (!budget || budget.userId !== userId)
      throw new ConvexError("Budget not found or unauthorized");

    // Cancel scheduled deactivation if exists
    if (budget.scheduledToken) {
      try {
        await ctx.scheduler.cancel(budget.scheduledToken);
      } catch (e) {
        // Non-fatal: Task may have already run or not exist
        console.warn(`Failed to cancel schedule for ${args.budgetId}: ${e}`);
      }
    }

    // Delete the budget
    await ctx.db.delete(args.budgetId);

    return { success: true, budgetId: args.budgetId };
  },
});

export const updateToken = internalMutation({
  args: { budgetId: v.id("budgets"), token: v.id("_scheduled_functions") },
  handler: async (ctx, { budgetId, token }) => {
    await ctx.db.patch(budgetId, { scheduledToken: token });
  },
});

export const deactivateBudget = internalMutation({
  args: { budgetId: v.id("budgets") },
  handler: async (ctx, { budgetId }) => {
    const budget = await ctx.db.get(budgetId);
    if (!budget || !budget.isActive) return;

    await ctx.db.patch(budgetId, {
      isActive: false,
      scheduledToken: undefined,
    });
  },
});

export const getActiveBudgets = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new ConvexError("User not authenticated");
    }

    const budgets = await ctx.db
      .query("budgets")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", userId).eq("isActive", true)
      )
      .order("desc")
      .collect();

    if (budgets.length === 0) {
      return [];
    }

    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const periodEnd = budget.periodEnd;
        const txns = await ctx.db
          .query("transactions")
          .withIndex("by_user_category_date", (q) =>
            q
              .eq("userId", userId)
              .eq("category", budget.category)
              .gte("date", budget.periodStart)
              .lt("date", periodEnd)
          )
          .filter((q) => q.eq(q.field("type"), "expense"))
          .collect();

        const spent = Math.abs(txns.reduce((sum, txn) => sum + txn.amount, 0));

        return {
          ...budget,
          spent,
          remaining: budget.limit - spent,
          progress: budget.limit > 0 ? (spent / budget.limit) * 100 : 0,
          status:
            spent >= budget.limit
              ? "over"
              : spent > budget.limit * 0.8
              ? "near"
              : "on_track",
        };
      })
    );

    return budgetsWithSpent;
  },
});
