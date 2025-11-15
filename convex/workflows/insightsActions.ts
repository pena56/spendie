// convex/workflows/insightsActions.ts
"use node";

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import Firecrawl from "@mendable/firecrawl-js";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { api } from "../_generated/api";

// ============================================
// TYPES
// ============================================

type Transaction = {
  type: "income" | "expense";
  category: string;
  amount: number;
  [key: string]: any;
};

type CategorySpending = {
  total: number;
  count: number;
};

type TopCategory = {
  category: string;
  total: number;
  count: number;
  average: number;
};

type UserSpendingData = {
  totalSpent: number;
  transactionCount: number;
  topCategories: TopCategory[];
  timeRange: string;
};

type Insight = {
  title: string;
  description: string;
  category: string;
  impact: string;
};

// ============================================
// ACTION: Get User Spending Data
// ============================================

export const getUserSpendingData = internalAction({
  args: { userId: v.id("users") },
  handler: async (ctx, args): Promise<UserSpendingData> => {
    // Get transactions from last 3 months
    const threeMonthsAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;

    const transactions: Transaction[] = await ctx.runQuery(
      api.workflows.insightsHelpers.getTransactions,
      {
        userId: args.userId,
        startDate: threeMonthsAgo,
      }
    );

    // Group by category
    const categorySpending: Record<string, CategorySpending> = {};

    for (const transaction of transactions) {
      if (transaction.type !== "expense") continue;

      if (!categorySpending[transaction.category]) {
        categorySpending[transaction.category] = { total: 0, count: 0 };
      }

      categorySpending[transaction.category].total += transaction.amount;
      categorySpending[transaction.category].count += 1;
    }

    // Get top 3 spending categories
    const topCategories: TopCategory[] = Object.entries(categorySpending)
      .map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        average: data.total / data.count,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);

    return {
      totalSpent: transactions.reduce(
        (sum: number, t: Transaction) =>
          t.type === "expense" ? sum + t.amount : sum,
        0
      ),
      transactionCount: transactions.length,
      topCategories,
      timeRange: "last 3 months",
    };
  },
});

// ============================================
// ACTION: Scrape Financial Trends
// ============================================

export const scrapeFinancialTrends = internalAction({
  args: {},
  handler: async (ctx, args): Promise<string> => {
    const firecrawl = new Firecrawl({
      apiKey: process.env.FIRECRAWL_API_KEY!,
    });

    const sources = [
      "https://www.nerdwallet.com/blog/finance/financial-trends/",
      "https://www.bankrate.com/personal-finance/",
    ];

    const scrapedData: string[] = [];

    try {
      // Scrape the first source
      const result = await firecrawl.scrape(sources[0], {
        formats: ["markdown"],
      });

      if (result.markdown) {
        scrapedData.push(result.markdown);
      }
    } catch (error) {
      console.error("Error scraping trends:", error);
      // Use fallback data if scraping fails
      scrapedData.push(`
        Top Financial Trends 2024:
        - Dining out costs have increased by 15% year over year
        - Average restaurant spending: $300/month per person
        - Meal kit subscriptions growing 25% annually
        - Coffee shop visits averaging $150/month
        - Grocery inflation at 8% annually
        - Gas prices fluctuating between $3-4 per gallon
        - Streaming services averaging $50/month per household
        - Healthcare costs rising 6% annually
      `);
    }

    return scrapedData.join("\n\n");
  },
});

// ============================================
// ACTION: Generate Insights with AI (Vercel AI SDK)
// ============================================

export const generateInsightsWithAI = internalAction({
  args: {
    userSpending: v.any(),
    trends: v.string(),
  },
  handler: async (ctx, args): Promise<Insight[]> => {
    const prompt = `
You are a personal finance advisor. Analyze this user's spending and provide exactly 3 actionable insights.

User's Spending Data:
${JSON.stringify(args.userSpending, null, 2)}

Market Trends:
${args.trends}

Generate exactly 3 insights in this JSON format:
[
  {
    "title": "Short, catchy title (max 50 chars)",
    "description": "Detailed, actionable advice (2-3 sentences, max 200 chars)",
    "category": "one of the user's top categories or 'General'",
    "impact": "high, medium, or low"
  }
]

Focus on:
1. Comparing user's spending to market averages
2. Identifying concrete savings opportunities
3. Highlighting positive habits or areas that need attention
4. Being specific with dollar amounts and percentages when possible

Return ONLY valid JSON, no markdown formatting or extra text.
`;

    try {
      const { text } = await generateText({
        model: google("gemini-2.0-flash-exp"),
        prompt,
        temperature: 0.7,
      });

      // Clean up markdown if present
      const cleanText = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      const insights: Insight[] = JSON.parse(cleanText);

      // Validate insights
      if (!Array.isArray(insights) || insights.length === 0) {
        throw new Error("Invalid insights format");
      }

      return insights.slice(0, 3);
    } catch (error) {
      console.error("Error generating insights:", error);

      const userSpendingTyped = args.userSpending as UserSpendingData;

      // Fallback insights if AI fails
      return [
        {
          title: "Track Your Top Spending Category",
          description: `Your highest spending is in ${
            userSpendingTyped.topCategories[0]?.category || "expenses"
          }. Set a budget to better manage this category and identify savings opportunities.`,
          category: userSpendingTyped.topCategories[0]?.category || "General",
          impact: "high",
        },
        {
          title: "Great Progress on Tracking!",
          description: `You've recorded ${userSpendingTyped.transactionCount} transactions. Keep up the consistent tracking to gain better insights into your spending patterns.`,
          category: "General",
          impact: "medium",
        },
        {
          title: "Review Your Monthly Average",
          description: `You're spending an average of ${Math.round(
            userSpendingTyped.totalSpent / 3
          )}/month. Compare this to your income to ensure you're saving adequately for your goals.`,
          category: "General",
          impact: "medium",
        },
      ];
    }
  },
});
