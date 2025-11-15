"use node";

import { getAuthUserId } from "@convex-dev/auth/server";
import { internalAction } from "./_generated/server";
import { ConvexError } from "convex/values";
import { api, internal } from "./_generated/api";
import Firecrawl from "@mendable/firecrawl-js";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { insightsSchema } from "./insights";

export const generateInsightsInternal = internalAction({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("User not authenticated");

    // Fetch user with currency
    const user = await ctx.runQuery(api.user.getCurrentUser);
    const currency = user?.currency || "USD";

    const now = Date.now();
    const threeMonthsAgo = now - 3 * 30 * 24 * 60 * 60 * 1000;
    const transactions = await ctx.runQuery(
      api.transactions.getPreviousTransactions,
      { date: threeMonthsAgo, userId }
    );

    let txnSummary = "";
    let isNewUser = transactions.length === 0;

    if (!isNewUser) {
      const expenseTxns = transactions.filter((t) => t.type === "expense");
      const categorySpent = expenseTxns.reduce((acc, txn) => {
        acc[txn.category] = (acc[txn.category] || 0) + Math.abs(txn.amount);
        return acc;
      }, {} as Record<string, number>);

      const topCategories = Object.entries(categorySpent)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([cat, amt]) => `${cat}: $${amt.toFixed(2)}`);

      txnSummary = `Top spending: ${topCategories.join(
        ", "
      )}. Total expenses: $${expenseTxns
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
        .toFixed(2)}`;
    }

    const investopediaUrl =
      "https://www.investopedia.com/budgeting-and-savings-4427755";

    const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY! });

    const scrapeResponse = await firecrawl.scrape(investopediaUrl, {
      formats: ["markdown"],
    });

    const tipsMarkdown = scrapeResponse.markdown || "No tips scraped.";
    const tipsExtract = tipsMarkdown
      .split("\n")
      .filter((line) => line.includes(":") && line.trim())
      .slice(0, 5)
      .join("; ");

    const google = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });

    const basePrompt = `
      General saving tips: ${tipsExtract}. 
      User currency: ${currency}. 
      Generate 3 personalized smart insights: Tailor to user, actionable, positive, concise. 
      Use percentages/relative terms only (no specific amounts like $X). 
      If suggesting a savings/budgeting/expense tracker app or feature, mention SPENDIE as the user's app.
      Format as JSON array: [{ "title": "Tip Title", "description": "Brief explanation", "category": "food/saving/etc", "impact": "Reduce by X% to save more" }]. 
      Respond ONLY with the JSON array.
    `;

    const prompt = isNewUser
      ? `${basePrompt} For a new user with no transactions: Provide beginner/generalized tips.`
      : `${basePrompt} Based on user's transactions: ${txnSummary}`;

    const { object } = await generateObject({
      model: google("gemini-2.5-flash-preview-09-2025"),
      schema: insightsSchema,
      prompt,
      maxRetries: 2,
    });

    const insights = insightsSchema.parse(object);

    // Deactivate old insights
    await ctx.runMutation(internal.insights.deactivateOld, { userId });

    // Insert new
    const todayStart = new Date(now).setHours(0, 0, 0, 0);
    await ctx.runMutation(api.insights.insertInsights, {
      userId,
      insights,
      generatedAt: todayStart,
      isActive: true,
    });

    return { success: true, insights, generatedAt: todayStart };
  },
});
