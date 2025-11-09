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
      return new ConvexError("User not aunthenticated");
    }

    return await ctx.db.insert("transactions", { ...args, userId });
  },
});

export const getTransactions = query({
  args: {},
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      return new ConvexError("User not aunthenticated");
    }

    let transactions = ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return transactions;
  },
});

export const deleteTransaction = mutation({
  args: { id: v.id("transactions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const { id } = args;

    if (userId === null) {
      return new ConvexError("User not aunthenticated");
    }

    const existing = await ctx.db.get(id);

    if (!existing) throw new ConvexError("Transaction not found");

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
      return new ConvexError("User not aunthenticated");
    }

    const { _id, ...updates } = args;

    const existing = await ctx.db.get(_id);

    if (!existing) throw new ConvexError("Transaction not found");

    await ctx.db.patch(_id, updates);

    return await ctx.db.get(_id);
  },
});
