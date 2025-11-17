// convex/workflows/insightsHelpers.ts
import { v } from "convex/values";
import { internalMutation, query } from "../_generated/server";

// ============================================
// UPDATE WORKFLOW STATUS
// ============================================

export const updateStatus = internalMutation({
  args: {
    userId: v.id("users"),
    workflowId: v.string(),
    status: v.string(),
    progress: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if status entry exists for this workflow
    const existing = await ctx.db
      .query("insightGenerationStatus")
      .withIndex("by_workflowId", (q) => q.eq("workflowId", args.workflowId))
      .first();

    if (existing) {
      // Update existing status
      await ctx.db.patch(existing._id, {
        status: args.status,
        progress: args.progress,
        updatedAt: Date.now(),
      });
    } else {
      // Create new status entry
      await ctx.db.insert("insightGenerationStatus", {
        userId: args.userId,
        workflowId: args.workflowId,
        status: args.status,
        progress: args.progress,
        updatedAt: Date.now(),
      });
    }
  },
});

// ============================================
// GET TRANSACTIONS FOR ANALYSIS
// ============================================

export const getTransactions = query({
  args: {
    userId: v.id("users"),
    startDate: v.number(),
  },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", args.userId).gte("date", args.startDate)
      )
      .collect();

    return transactions;
  },
});

// ============================================
// SAVE INSIGHTS TO DATABASE
// ============================================

export const saveInsights = internalMutation({
  args: {
    userId: v.id("users"),
    workflowId: v.string(),
    insights: v.array(
      v.object({
        title: v.string(),
        description: v.string(),
        category: v.string(),
        impact: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Deactivate old insights
    const oldInsights = await ctx.db
      .query("insights")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", args.userId).eq("isActive", true)
      )
      .collect();

    for (const insight of oldInsights) {
      await ctx.db.patch(insight._id, { isActive: false });
    }

    // Find the placeholder entry created when workflow started
    const existing = await ctx.db
      .query("insights")
      .filter((q) => q.eq(q.field("workflowId"), args.workflowId))
      .first();

    if (existing) {
      // Update the placeholder with actual insights
      await ctx.db.patch(existing._id, {
        insights: args.insights,
        generatedAt: Date.now(),
        isActive: true,
      });
    } else {
      // Create new entry if placeholder doesn't exist (shouldn't happen)
      await ctx.db.insert("insights", {
        userId: args.userId,
        workflowId: args.workflowId,
        insights: args.insights,
        generatedAt: Date.now(),
        isActive: true,
      });
    }
  },
});

// ============================================
// DELETE INSIGHT (Optional utility)
// ============================================

export const deleteInsight = internalMutation({
  args: { id: v.id("insights") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// ============================================
// CLEAN UP OLD STATUS ENTRIES (Optional)
// ============================================

export const cleanupOldStatuses = internalMutation({
  args: { olderThanDays: v.number() },
  handler: async (ctx, args) => {
    const cutoffTime = Date.now() - args.olderThanDays * 24 * 60 * 60 * 1000;

    const oldStatuses = await ctx.db.query("insightGenerationStatus").collect();

    for (const status of oldStatuses) {
      if (status.updatedAt < cutoffTime) {
        await ctx.db.delete(status._id);
      }
    }
  },
});
