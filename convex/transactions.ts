import * as z from "zod";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject, generateText } from "ai";
import { ConvexError, v } from "convex/values";
import {
  TransactionCategories,
  TransactionCategory,
} from "../src/constants/categories";
import { api, internal } from "./_generated/api";
import {
  authenticatedAction,
  authenticatedMutation,
  authenticatedQuery,
} from "./lib/authHelpers";

export const addTransaction = authenticatedMutation({
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
    const { userId } = ctx;

    const transactionId = await ctx.db.insert("transactions", {
      ...args,
      userId,
    });

    // ✨ Award XP after transaction is created
    const totalTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    await ctx.scheduler.runAfter(0, internal.achievements.onTransactionAdded, {
      userId,
      isFirstTransaction: totalTransactions.length === 1,
      hasReceipt: !!args.receiptStorageId,
      isVoice: args.source === "voice",
    });

    return transactionId;
  },
});

export const getTransactions = authenticatedQuery({
  args: {},
  handler: async (ctx) => {
    const { userId } = ctx;

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

export const deleteTransaction = authenticatedMutation({
  args: { id: v.id("transactions") },
  handler: async (ctx, args) => {
    const { userId } = ctx;
    const { id } = args;

    const existing = await ctx.db.get(id);

    if (!existing) throw new ConvexError("Transaction not found");
    if (existing.userId !== userId)
      throw new ConvexError("Unauthorized action.");

    await ctx.db.delete(id);
    return { success: true };
  },
});

export const updateTransaction = authenticatedMutation({
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
    const { userId } = ctx;

    const { _id, ...updates } = args;

    const existing = await ctx.db.get(_id);

    if (!existing) throw new ConvexError("Transaction not found");

    if (existing.userId !== userId) throw new ConvexError("Not Authorized");

    await ctx.db.patch(_id, updates);

    return await ctx.db.get(_id);
  },
});

// ============================================
// TRANSACTION SCHEMA
// ============================================

const transactionSchema = z.object({
  description: z.string().describe("Brief description of the transaction"),
  amount: z
    .number()
    .positive()
    .describe("Transaction amount (always positive)"),
  type: z.enum(["income", "expense"]).describe("Type of transaction"),
  category: z
    .string()
    .describe(
      `Category from: ${TransactionCategories.map((c) => c.name).join(", ")}`
    ),
  date: z
    .string()
    .optional()
    .describe("Date in YYYY-MM-DD format, or omit for today"),
  notes: z.string().optional().describe("Additional notes or context"),
});

// ============================================
// ACTION: Add Transaction from Voice
// ============================================

export const addTransactionFromVoice = authenticatedAction({
  args: {
    transcript: v.string(),
  },
  handler: async (ctx, { transcript }) => {
    const { userId } = ctx;

    const google = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });

    const todayDate = new Date().toISOString().split("T")[0];
    const categoryList = TransactionCategories.map((c) => c.name).join(", ");

    const prompt = `
      You are a financial transaction parser. Extract transaction details from this voice transcript.

      Transcript: "${transcript}"

      IMPORTANT RULES:
      1. Amount: ALWAYS return a positive number (e.g., 50.00, 4.50, 100)
      2. Type: Must be either "income" or "expense"
        - "expense" for: spent, bought, paid, purchased, cost
        - "income" for: earned, received, got paid, salary
      3. Category: MUST be one of these: ${categoryList}
        - Match the most appropriate category
        - Default to "General" if unclear
      4. Date: Use today's date (${todayDate}) if not specified
        - Format: YYYY-MM-DD
      5. Description: Brief summary (e.g., "Coffee at Starbucks", "Grocery shopping")
      6. Notes: Any extra context (optional)

      Examples:
      - "I spent 4.50 on coffee" → amount: 4.50, type: "expense", category: "Dining"
      - "bought groceries for 50 dollars" → amount: 50, type: "expense", category: "Groceries"
      - "earned 100 from freelance" → amount: 100, type: "income", category: "Income"

      Return ONLY a valid JSON object matching the schema. No explanation, no markdown.
    `;

    try {
      const { object } = await generateObject({
        model: google("gemini-2.5-flash-lite-preview-09-2025"),
        schema: transactionSchema,
        prompt,
        temperature: 0.3, // Lower temperature for more consistent parsing
      });

      // Validate category is valid
      const validCategories = TransactionCategories.map((c) => c.name);
      if (!validCategories.includes(object.category as TransactionCategory)) {
        console.warn(
          `Invalid category "${object.category}", defaulting to "General"`
        );
        object.category = "General";
      }

      // Parse and validate the full object
      const txnData = transactionSchema.parse(object);

      // Convert date string to timestamp
      const dateTimestamp = txnData.date
        ? new Date(txnData.date).getTime()
        : Date.now();

      // Create the transaction
      await ctx.runMutation(api.transactions.addTransaction, {
        description: txnData.description,
        amount: txnData.amount,
        type: txnData.type,
        category: txnData.category as TransactionCategory,
        date: dateTimestamp,
        notes: txnData.notes || `Added via voice: "${transcript}"`,
        source: "voice",
      });

      // Award XP after transaction is created
      const { transactions: totalTransactions } = await ctx.runQuery(
        api.transactions.getTransactions
      );

      await ctx.scheduler.runAfter(
        0,
        internal.achievements.onTransactionAdded,
        {
          userId,
          isFirstTransaction: totalTransactions.length === 1,
          hasReceipt: false,
          isVoice: true,
        }
      );

      return {
        success: true,
        transaction: {
          ...txnData,
          date: dateTimestamp,
        },
      };
    } catch (error: any) {
      // Handle specific error types
      if (error instanceof z.ZodError) {
        const issues = error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join(", ");
        throw new ConvexError(`Parsing error: ${issues}`);
      }

      if (error?.message?.includes("No object generated")) {
        // Fallback: Try with generateText instead
        return await fallbackTextParsing(ctx, transcript, userId);
      }

      throw new ConvexError(`AI error: ${error?.message || "Unknown error"}`);
    }
  },
});

// ============================================
// FALLBACK: Text-based Parsing
// ============================================

async function fallbackTextParsing(ctx: any, transcript: string, userId: any) {
  const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY!,
  });

  try {
    const { text } = await generateText({
      model: google("gemini-2.5-flash-lite-preview-09-2025"),
      prompt: `
        Extract transaction from: "${transcript}"

        Return ONLY valid JSON (no markdown):
        {
          "description": "string",
          "amount": number (positive),
          "type": "income" or "expense",
          "category": "one of: ${TransactionCategories.map((c) => c.name).join(
            ", "
          )}",
          "date": "YYYY-MM-DD or omit",
          "notes": "optional string"
        }
        `,
      temperature: 0.3,
    });

    // Clean and parse JSON
    const cleaned = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);
    const validated = transactionSchema.parse(parsed);

    const dateTimestamp = validated.date
      ? new Date(validated.date).getTime()
      : Date.now();

    await ctx.runMutation(api.transactions.addTransaction, {
      description: validated.description,
      amount: validated.amount,
      type: validated.type,
      category: validated.category,
      date: dateTimestamp,
      notes: validated.notes || `Added via voice: "${transcript}"`,
      source: "voice",
    });

    return {
      success: true,
      transaction: {
        ...validated,
        date: dateTimestamp,
      },
    };
  } catch (fallbackError: any) {
    throw new ConvexError(
      `Unable to parse transaction: ${fallbackError?.message}`
    );
  }
}

export const generateUploadUrl = authenticatedMutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

const transactionsSchema = z.array(transactionSchema);

export const addTransactionFromImage = authenticatedAction({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, { storageId }) => {
    const { userId } = ctx;

    const google = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });

    const todayDate = new Date().toISOString().split("T")[0];
    const categoryList = TransactionCategories.map((c) => c.name).join(", ");

    const prompt = `
      You are a financial transaction parser. Extract transaction details from this receipt or invoice image and extract ALL line items as separate financial transactions.
      Always return an array of transactions, even if only one.
      
      IMPORTANT RULES:
      1. Amount: ALWAYS return a positive number (e.g., 50.00, 4.50, 100)
      2. Type: Must be either "income" or "expense"
        - "expense" for: spent, bought, paid, purchased, cost
        - "income" for: earned, received, got paid, salary
      3. Category: MUST be one of these: ${categoryList}
        - Match the most appropriate category
        - Default to "General" if unclear
      4. Date: Use today's date (${todayDate}) if not specified
        - Format: YYYY-MM-DD
      5. Description: Brief summary (e.g., "Coffee at Starbucks", "Grocery shopping")
      6. Notes: Any extra context (optional)
      
      Return ONLY a valid array of JSON objects, no extra text.
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
          const dateTimestamp = txnData.date
            ? new Date(txnData.date).getTime()
            : Date.now();
          const category = txnData.category as TransactionCategory;

          // Insert via existing mutation
          const txnId = await ctx.runMutation(api.transactions.addTransaction, {
            ...txnData,
            category,
            date: dateTimestamp,
            source: "scan",
            receiptUrl: imageUrl,
            receiptStorageId: storageId,
          });

          // Award XP after transaction is created

          await ctx.scheduler.runAfter(
            0,
            internal.achievements.onTransactionAdded,
            {
              userId,
              isFirstTransaction: false,
              hasReceipt: true,
              isVoice: false,
            }
          );

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

export const getPreviousTransactions = authenticatedQuery({
  args: {
    userId: v.id("users"),
    date: v.number(),
  },
  handler: async (ctx, { date, userId }) => {
    const { userId: authUserId } = ctx;
    if (authUserId !== userId) {
      throw new ConvexError("Unauthorized");
    }

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
