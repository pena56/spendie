import { internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { FunctionReturnType } from "convex/server";
import { authenticatedAction } from "./lib/authHelpers";

type getDashboardResult = {
  transactions: FunctionReturnType<
    typeof internal.dashboard.getDashboardTransactions
  >;
  budgets: FunctionReturnType<typeof internal.dashboard.getDashboardBudgets>;
};

export const getDashboardData = authenticatedAction({
  args: {},
  handler: async (ctx): Promise<getDashboardResult> => {
    const { userId } = ctx;

    const transactions = await ctx.runQuery(
      internal.dashboard.getDashboardTransactions,
      { userId }
    );

    const budgets = await ctx.runQuery(internal.dashboard.getDashboardBudgets, {
      userId,
    });

    return { transactions, budgets };
  },
});

export const getDashboardTransactions = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(5);

    return transactions;
  },
});

export const getDashboardBudgets = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    const budgets = await ctx.db
      .query("budgets")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", userId).eq("isActive", true)
      )
      .order("desc")
      .take(5);

    const budgetsWithSpent =
      budgets.length === 0
        ? []
        : await Promise.all(
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

              const spent = Math.abs(
                txns.reduce((sum, txn) => sum + txn.amount, 0)
              );

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
