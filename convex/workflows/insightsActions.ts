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
  args: {
    currency: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    const firecrawl = new Firecrawl({
      apiKey: process.env.FIRECRAWL_API_KEY!,
    });

    const sources = ["https://www.bankrate.com/personal-finance/"];
    const scrapedData: string[] = [];

    try {
      // Step 1: Scrape the main page to get article links
      const mainPage = await firecrawl.scrape(sources[0], {
        formats: ["markdown"],
      });

      if (!mainPage.markdown) {
        throw new Error("Failed to scrape main page");
      }

      // Step 2: Extract article URLs from markdown links
      // Regex to match markdown links: [text](url)
      const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
      const matches = [...mainPage.markdown.matchAll(linkRegex)];

      // Filter for article URLs (typically contain /articles/ or /finance/ in path)
      const articleUrls = matches
        .map((match) => match[2])
        .filter((url) => {
          // Filter for actual article URLs from bankrate.com
          return (
            url.includes("bankrate.com") &&
            !url.includes("#") && // Skip anchor links
            !url.includes("?") && // Skip links with query params
            (url.includes("/finance/") ||
              url.includes("/banking/") ||
              url.includes("/investing/") ||
              url.includes("/credit-cards/") ||
              url.includes("/mortgages/"))
          );
        })
        // Remove duplicates
        .filter((url, index, self) => self.indexOf(url) === index)
        // Take first 5
        .slice(0, 5);

      console.log(`Found ${articleUrls.length} article URLs:`, articleUrls);

      // Step 3: Scrape each article
      if (articleUrls.length === 0) {
        throw new Error("No article URLs found");
      }

      for (let i = 0; i < articleUrls.length; i++) {
        try {
          console.log(
            `Scraping article ${i + 1}/${articleUrls.length}: ${articleUrls[i]}`
          );

          const articleResult = await firecrawl.scrape(articleUrls[i], {
            formats: ["markdown"],
          });

          if (articleResult.markdown) {
            // Add article with header for context
            scrapedData.push(
              `\n=== Article ${i + 1}: ${articleUrls[i]} ===\n${
                articleResult.markdown
              }`
            );
          }

          // Add a small delay to avoid rate limiting
          if (i < articleUrls.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        } catch (articleError) {
          console.error(
            `Error scraping article ${articleUrls[i]}:`,
            articleError
          );
          // Continue with other articles even if one fails
        }
      }

      if (scrapedData.length === 0) {
        throw new Error("Failed to scrape any articles");
      }

      console.log(`Successfully scraped ${scrapedData.length} articles`);
      return scrapedData.join("\n\n");
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

        Note: This is fallback data. Live article scraping temporarily unavailable.
      `);

      return scrapedData.join("\n\n");
    }
  },
});

// export const scrapeFinancialTrends = internalAction({
//   args: {
//     currency: v.string(), // e.g., "USD", "EUR", "GBP", "NGN", etc.
//   },
//   handler: async (ctx, args): Promise<string> => {
//     const { currency } = args;

//     const firecrawl = new Firecrawl({
//       apiKey: process.env.FIRECRAWL_API_KEY!,
//     });

//     // Map currency to country/region for better search results
//     const currencyToRegion: Record<string, string> = {
//       USD: "United States",
//       EUR: "Europe",
//       GBP: "United Kingdom",
//       NGN: "Nigeria",
//       CAD: "Canada",
//       AUD: "Australia",
//       JPY: "Japan",
//       CNY: "China",
//       INR: "India",
//       BRL: "Brazil",
//       ZAR: "South Africa",
//       // Add more as needed
//     };

//     const region = currencyToRegion[currency] || currency;
//     const scrapedData: string[] = [];

//     try {
//       // Step 1: Search for financial articles based on currency/region
//       const searchQuery = `${region} personal finance trends ${new Date().getFullYear()}`;
//       const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
//         searchQuery
//       )}`;

//       console.log(`Searching for: ${searchQuery}`);

//       // Use Firecrawl to scrape Google search results
//       const searchResults = await firecrawl.scrape(searchUrl, {
//         formats: ["markdown"],
//       });

//       if (!searchResults.markdown) {
//         throw new Error("Failed to scrape search results");
//       }

//       // Step 2: Extract article URLs from search results
//       const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
//       const matches = [...searchResults.markdown.matchAll(linkRegex)];

//       // Filter for reputable financial news sources
//       const reputableDomains = [
//         "reuters.com",
//         "bloomberg.com",
//         "ft.com",
//         "wsj.com",
//         "cnbc.com",
//         "forbes.com",
//         "businessinsider.com",
//         "marketwatch.com",
//         "investopedia.com",
//         "nytimes.com",
//         "bbc.com",
//         "theguardian.com",
//         "economist.com",
//         // Add region-specific sources
//         "vanguardngr.com", // Nigeria
//         "punchng.com", // Nigeria
//         "thisday.ng", // Nigeria
//       ];

//       const articleUrls = matches
//         .map((match) => match[2])
//         .filter((url) => {
//           // Check if URL is from a reputable domain
//           const isReputable = reputableDomains.some((domain) =>
//             url.includes(domain)
//           );
//           // Skip Google's internal links and ads
//           const isValidArticle =
//             !url.includes("google.com") &&
//             !url.includes("youtube.com") &&
//             !url.includes("#") &&
//             !url.includes("/search?");

//           return isReputable && isValidArticle;
//         })
//         // Remove duplicates
//         .filter((url, index, self) => self.indexOf(url) === index)
//         // Take first 5
//         .slice(0, 5);

//       console.log(`Found ${articleUrls.length} article URLs:`, articleUrls);

//       // Step 3: If Google search didn't yield enough results, try currency-specific fallback sources
//       if (articleUrls.length < 3) {
//         console.log("Not enough URLs from search, using fallback sources...");
//         const fallbackSources = getCurrencySpecificSources(currency);

//         for (const source of fallbackSources) {
//           try {
//             const mainPage = await firecrawl.scrape(source, {
//               formats: ["markdown"],
//             });

//             if (mainPage.markdown) {
//               const linkMatches = [...mainPage.markdown.matchAll(linkRegex)];
//               const sourceUrls = linkMatches
//                 .map((match) => match[2])
//                 .filter((url) => url.includes(new URL(source).hostname))
//                 .slice(0, 3);

//               articleUrls.push(...sourceUrls);
//             }
//           } catch (error) {
//             console.error(`Error scraping fallback source ${source}:`, error);
//           }
//         }
//       }

//       // Step 4: Scrape each article
//       if (articleUrls.length === 0) {
//         throw new Error("No article URLs found");
//       }

//       const urlsToScrape = articleUrls.slice(0, 2);

//       for (let i = 0; i < urlsToScrape.length; i++) {
//         try {
//           console.log(
//             `Scraping article ${i + 1}/${urlsToScrape.length}: ${
//               urlsToScrape[i]
//             }`
//           );

//           const articleResult = await firecrawl.scrape(urlsToScrape[i], {
//             formats: ["markdown"],
//           });

//           if (articleResult.markdown) {
//             scrapedData.push(
//               `\n=== Article ${i + 1}: ${urlsToScrape[i]} ===\n${
//                 articleResult.markdown
//               }`
//             );
//           }

//           // Add delay to avoid rate limiting
//           if (i < urlsToScrape.length - 1) {
//             await new Promise((resolve) => setTimeout(resolve, 1500));
//           }
//         } catch (articleError) {
//           console.error(
//             `Error scraping article ${urlsToScrape[i]}:`,
//             articleError
//           );
//         }
//       }

//       if (scrapedData.length === 0) {
//         throw new Error("Failed to scrape any articles");
//       }

//       console.log(
//         `Successfully scraped ${scrapedData.length} articles for ${currency}`
//       );
//       return scrapedData.join("\n\n");
//     } catch (error) {
//       console.error("Error scraping trends:", error);

//       // Use currency-specific fallback data
//       const fallbackData = getCurrencyFallbackData(currency, region);
//       scrapedData.push(fallbackData);

//       return scrapedData.join("\n\n");
//     }
//   },
// });

// Helper function to get currency-specific sources
function getCurrencySpecificSources(currency: string): string[] {
  const sources: Record<string, string[]> = {
    USD: [
      "https://www.bankrate.com/personal-finance/",
      "https://www.investopedia.com/personal-finance-4427760",
    ],
    EUR: [
      "https://www.ft.com/personal-finance",
      "https://www.bloomberg.com/europe",
    ],
    GBP: [
      "https://www.theguardian.com/uk/money",
      "https://www.ft.com/personal-finance",
    ],
    NGN: [
      "https://www.vanguardngr.com/category/business/",
      "https://punchng.com/topics/business/",
    ],
    // Add more currency-specific sources
  };

  return sources[currency] || sources.USD;
}

// Helper function for currency-specific fallback data
function getCurrencyFallbackData(currency: string, region: string): string {
  return `
    Top Financial Trends 2024 - ${region} (${currency}):
    - Personal finance trends vary by region and currency
    - Cost of living adjustments affecting ${currency} holders
    - Regional economic conditions impacting spending patterns
    - Currency-specific inflation rates and purchasing power
    - Local market trends and investment opportunities
    - Regional banking and financial services developments
    
    Note: This is fallback data for ${currency}. Live article scraping temporarily unavailable.
    For the most current information, please try again later or check local financial news sources.
  `;
}

// ============================================
// ACTION: Generate Insights with AI (Vercel AI SDK)
// ============================================

export const generateInsightsWithAI = internalAction({
  args: {
    userSpending: v.any(),
    trends: v.string(),
    currency: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Insight[]> => {
    const prompt = `
      You are a personal finance advisor. Analyze this user's spending and provide exactly 3 actionable insights.

      User's Spending Data is in ${args.currency}:
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
      5. Every amount should be formatted in ${args.currency}

      Return ONLY valid JSON, no markdown formatting or extra text.
    `;

    try {
      const { text } = await generateText({
        model: google("gemini-2.5-flash"),
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
