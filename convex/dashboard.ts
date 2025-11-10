import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";
import { ConvexError } from "convex/values";

export const getDashboard = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new ConvexError("User not authenticated");
    }

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(5);

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

    return {
      transactions,
      budgets: budgetsWithSpent,
    };
  },
});
