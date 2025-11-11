import * as z from "zod";

import { getAuthUserId } from "@convex-dev/auth/server";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
} from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";

export const insightsSchema = z.array(
  z.object({
    title: z.string().min(1).max(100),
    description: z.string().min(1).max(500),
    category: z.string().min(1).max(50),
    impact: z.string().min(1).max(100),
  })
);

export const deactivateOld = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const now = Date.now();
    const todayStart = new Date(now).setHours(0, 0, 0, 0);

    const oldInsights = await ctx.db
      .query("insights")
      .withIndex("by_user_generated", (q) => q.eq("userId", userId))
      .filter((q) => q.lt(q.field("generatedAt"), todayStart))
      .collect();

    await Promise.all(
      oldInsights.map((insight) =>
        ctx.db.patch(insight._id, { isActive: false })
      )
    );
  },
});

export const insertInsights = mutation({
  args: {
    userId: v.id("users"),
    insights: v.array(
      v.object({
        title: v.string(),
        description: v.string(),
        category: v.string(),
        impact: v.string(),
      })
    ),
    generatedAt: v.number(),
    isActive: v.boolean(),
  },
  handler(ctx, { generatedAt, insights, isActive, userId }) {
    return ctx.db.insert("insights", {
      userId,
      insights,
      generatedAt,
      isActive: true,
    });
  },
});

export const getTodaysInsights = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const now = Date.now();
    const todayStart = new Date(now).setHours(0, 0, 0, 0);

    const activeInsights = await ctx.db
      .query("insights")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", userId).eq("isActive", true)
      )
      .filter((q) => q.gte(q.field("generatedAt"), todayStart))
      .first();

    return activeInsights;
  },
});

type InsightsResult = {
  insights: z.infer<typeof insightsSchema>;
  generatedAt: number;
  isCached: boolean;
};

export const getInsights = action({
  args: {},
  handler: async (ctx): Promise<InsightsResult> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("User not authenticated");

    // Check for today's active (via internal query)
    const activeInsights = await ctx.runQuery(
      internal.insights.getTodaysInsights,
      { userId }
    );

    if (activeInsights) {
      return {
        insights: activeInsights.insights,
        generatedAt: activeInsights.generatedAt,
        isCached: true,
      };
    }

    // Generate new
    const result = await ctx.runAction(
      internal.firecrawl.generateInsightsInternal
    );
    return {
      insights: result.insights,
      generatedAt: result.generatedAt,
      isCached: false,
    };
  },
});
