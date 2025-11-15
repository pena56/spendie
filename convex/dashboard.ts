import { getAuthUserId } from "@convex-dev/auth/server";
import { action, internalQuery, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { api, internal } from "./_generated/api";
import { FunctionReturnType } from "convex/server";

type getDashboardResult = {
  transactions: FunctionReturnType<
    typeof internal.dashboard.getDashboardTransactions
  >;
  budgets: FunctionReturnType<typeof internal.dashboard.getDashboardBudgets>;
  insights: FunctionReturnType<typeof api.workflows.insights.getActiveInsights>;
  insightStatus: FunctionReturnType<
    typeof api.workflows.insights.getCurrentInsightStatus
  >;
};

export const getDashboardData = action({
  args: {},
  handler: async (ctx): Promise<getDashboardResult> => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new ConvexError("User not authenticated");
    }

    const transactions = await ctx.runQuery(
      internal.dashboard.getDashboardTransactions,
      { userId }
    );

    const budgets = await ctx.runQuery(internal.dashboard.getDashboardBudgets, {
      userId,
    });

    const insights = await ctx.runQuery(
      api.workflows.insights.getActiveInsights
    );

    const insightStatus = await ctx.runQuery(
      api.workflows.insights.getCurrentInsightStatus
    );

    return { transactions, budgets, insights, insightStatus };
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
