import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { TransactionCategories } from "../src/constants/categories";

export const addTransaction = mutation({
  args: {
    amount: v.number(),
    description: v.string(),
    type: v.union(v.literal("income"), v.literal("expense")),
    category: v.union(
      ...TransactionCategories.map((item) => v.literal(item.name))
    ),
    date: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new ConvexError("User not aunthenticated");
    }

    return await ctx.db.insert("transactions", { ...args, userId });
  },
});

export const getTransactions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new ConvexError("User not authenticated");
    }

    // Fetch all transactions, ordered by date desc (recent first)
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    if (transactions.length === 0) {
      return {
        transactions: [],
        income: { total: 0, change: 0 },
        expenses: { total: 0, change: 0 },
      };
    }

    // Calculate month boundaries (current date: Nov 10, 2025)
    const now = Date.now();
    const currentMonth = new Date(now);
    const currentStart = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    ).getTime();
    const currentEnd = now;

    const lastMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1
    );
    const lastStart = new Date(
      lastMonth.getFullYear(),
      lastMonth.getMonth(),
      1
    ).getTime();
    const lastEnd = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      0
    ).getTime(); // Last day of prev month

    // Filter and sum current month
    const currentIncomeTxns = transactions.filter(
      (txn) =>
        txn.type === "income" &&
        txn.date >= currentStart &&
        txn.date <= currentEnd
    );
    const currentExpenseTxns = transactions.filter(
      (txn) =>
        txn.type === "expense" &&
        txn.date >= currentStart &&
        txn.date <= currentEnd
    );

    const currentIncome = currentIncomeTxns.reduce(
      (sum, txn) => sum + txn.amount,
      0
    );
    const currentExpenses = Math.abs(
      currentExpenseTxns.reduce((sum, txn) => sum + txn.amount, 0)
    );

    // Filter and sum last month
    const lastIncomeTxns = transactions.filter(
      (txn) =>
        txn.type === "income" && txn.date >= lastStart && txn.date <= lastEnd
    );
    const lastExpenseTxns = transactions.filter(
      (txn) =>
        txn.type === "expense" && txn.date >= lastStart && txn.date <= lastEnd
    );

    const lastIncome = lastIncomeTxns.reduce((sum, txn) => sum + txn.amount, 0);
    const lastExpenses = Math.abs(
      lastExpenseTxns.reduce((sum, txn) => sum + txn.amount, 0)
    );

    // Compute MoM changes (%)
    const incomeChange =
      lastIncome > 0
        ? Math.round(((currentIncome - lastIncome) / lastIncome) * 100)
        : 0;
    const expensesChange =
      lastExpenses > 0
        ? Math.round(((currentExpenses - lastExpenses) / lastExpenses) * 100)
        : 0;

    return {
      transactions,
      income: { total: currentIncome, change: incomeChange },
      expenses: { total: currentExpenses, change: expensesChange },
    };
  },
});
export const deleteTransaction = mutation({
  args: { id: v.id("transactions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const { id } = args;

    if (userId === null) {
      throw new ConvexError("User not aunthenticated");
    }

    const existing = await ctx.db.get(id);

    if (!existing) throw new ConvexError("Transaction not found");
    if (existing.userId !== userId)
      throw new ConvexError("Unauthorized action.");

    await ctx.db.delete(id);
    return { success: true };
  },
});

export const updateTransaction = mutation({
  args: {
    _id: v.id("transactions"),
    amount: v.number(),
    description: v.string(),
    type: v.union(v.literal("income"), v.literal("expense")),
    category: v.union(
      ...TransactionCategories.map((item) => v.literal(item.name))
    ),
    date: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new ConvexError("User not aunthenticated");
    }

    const { _id, ...updates } = args;

    const existing = await ctx.db.get(_id);

    if (!existing) throw new ConvexError("Transaction not found");

    if (existing.userId !== userId) throw new ConvexError("Not Authorized");

    await ctx.db.patch(_id, updates);

    return await ctx.db.get(_id);
  },
});
