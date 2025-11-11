import * as z from "zod";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { ConvexError, v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { TransactionCategories } from "../src/constants/categories";
import { api } from "./_generated/api";

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
    source: v.optional(
      v.union(v.literal("manual"), v.literal("voice"), v.literal("scan"))
    ),
    receiptStorageId: v.optional(v.id("_storage")),
    receiptUrl: v.optional(v.string()),
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

const transactionSchema = z.object({
  description: z.string().min(1).max(200),
  amount: z
    .number()
    .min(-999999)
    .max(999999)
    .refine((val) => val !== 0, "Amount cannot be zero"),
  type: z.enum(["income", "expense"]),
  category: z.enum(TransactionCategories.map((item) => item.name)),
  date: z.number().optional(),
  notes: z.string().optional(),
});

export const addTransactionFromVoice = action({
  args: {
    transcript: v.string(),
  },
  handler: async (ctx, { transcript }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("User not authenticated");

    const google = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });

    const prompt = `
      Analyze this voice transcript and extract a single financial transaction.
      Transcript: "${transcript}"
      
      Rules:
      - Amount: Positive for both income (e.g., "earned 100") or expense (e.g., "spent 4.50").
      - Type: Infer from amount/context ("income" or "expense").
      - Category: Choose from: ${TransactionCategories.map((c) => c.name).join(
        ", "
      )}.
      - Date: Use today's date (timestamp) unless specified; otherwise, now.
      - Description: Concise summary.
      - Notes: Any extra details.
      
      Respond ONLY with the structured JSON object, no extra text.
    `;

    try {
      const { object } = await generateObject({
        model: google("gemini-2.5-flash-preview-09-2025"),
        schema: transactionSchema,
        prompt,
        maxRetries: 2,
      });

      // Validate/enhance parsed object
      const txnData = transactionSchema.parse({
        ...object,
      });

      await ctx.runMutation(api.transactions.addTransaction, {
        ...txnData,
        date: object.date ?? Date.now(),
        source: "voice",
      });

      // Optional: Award XP, check achievements
      // await api.achievements.awardXp(ctx, { userId, amount: 10 }); // Example

      return { success: true, transaction: txnData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ConvexError(`Parsing error:${error}`);
      }
      throw new ConvexError(`Gemini API error: ${error}`);
    }
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("You must be logged in to upload a file.");
    }

    return await ctx.storage.generateUploadUrl();
  },
});

const transactionsSchema = z.array(transactionSchema);

export const addTransactionFromImage = action({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, { storageId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("User not authenticated");

    const google = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });

    const prompt = `
      Analyze this receipt or invoice image and extract ALL line items as separate financial transactions.
      Always return an array of transactions, even if only one.
      
      Rules:
      - Amount: Extract per item; positive for income (e.g., invoice to you), positive for expense (e.g., purchases).
      - Type: Infer from context ("income" for payments received, "expense" for costs).
      - Category: Choose from: ${TransactionCategories.map((c) => c.name).join(
        ", "
      )}.
      - If you cannot determine a date, use today's date: ${
        new Date().toISOString().split("T")[0]
      }.
      - Description: Concise per item (e.g., "Coffee at Starbucks").
      - Notes: Item details, quantity, or vendor notes.
      
      Respond ONLY with the structured JSON array of objects, no extra text.
    `;

    const imageUrl = await ctx.storage.getUrl(storageId);

    if (!imageUrl) {
      throw new ConvexError("File URL not found.");
    }

    try {
      const { object } = await generateObject({
        model: google("gemini-2.5-flash-preview-09-2025"),
        schema: transactionsSchema,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image", image: imageUrl },
            ],
          },
        ],
        maxRetries: 2,
      });

      const txnDatas = transactionsSchema.parse(object);

      if (txnDatas.length === 0) {
        throw new ConvexError("No transactions extracted from image");
      }

      await Promise.all(
        txnDatas.map(async (txnData) => {
          const date = txnData.date ?? Date.now();

          // Insert via existing mutation
          const txnId = await ctx.runMutation(api.transactions.addTransaction, {
            ...txnData,
            date,
            source: "scan",
            receiptUrl: imageUrl,
            receiptStorageId: storageId,
          });

          return { id: txnId, ...txnData };
        })
      );

      return { success: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ConvexError(`Parsing error: ${error}`);
      }
      throw new ConvexError(`Gemini API error: ${error}`);
    }
  },
});

export const getPreviousTransactions = query({
  args: {
    userId: v.id("users"),
    date: v.number(),
  },
  handler: async (ctx, { date, userId }) => {
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", userId).gte("date", date)
      )
      .order("desc")
      .collect();

    return transactions;
  },
});
