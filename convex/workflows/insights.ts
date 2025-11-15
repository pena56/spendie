// convex/workflows/insights.ts
import { WorkflowManager } from "@convex-dev/workflow";
import { ConvexError, v } from "convex/values";
import { components, internal } from "../_generated/api";
import { mutation, query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const workflow = new WorkflowManager(components.workflow, {
  workpoolOptions: {
    defaultRetryBehavior: {
      maxAttempts: 3,
      initialBackoffMs: 100,
      base: 2,
    },
    retryActionsByDefault: true,
  },
});

// ============================================
// WORKFLOW DEFINITION
// ============================================

export const generateInsightsWorkflow = workflow.define({
  args: { userId: v.id("users") },
  returns: v.any(),
  handler: async (step, args): Promise<any> => {
    // Step 1: Update status - Analyzing spending patterns
    await step.runMutation(internal.workflows.insightsHelpers.updateStatus, {
      userId: args.userId,
      workflowId: step.workflowId,
      status: "Analyzing your spending patterns...",
      progress: 10,
    });

    // Step 2: Get user spending data
    const userSpending = await step.runAction(
      internal.workflows.insightsActions.getUserSpendingData,
      { userId: args.userId }
    );

    // Step 3: Update status - Scraping financial trends
    await step.runMutation(internal.workflows.insightsHelpers.updateStatus, {
      userId: args.userId,
      workflowId: step.workflowId,
      status: "Getting insights from top dining trends...",
      progress: 30,
    });

    // Step 4: Scrape financial trends
    const trends = await step.runAction(
      internal.workflows.insightsActions.scrapeFinancialTrends,
      {}
    );

    // Step 5: Update status - Comparing data
    await step.runMutation(internal.workflows.insightsHelpers.updateStatus, {
      userId: args.userId,
      workflowId: step.workflowId,
      status: "Comparing your dining expenses...",
      progress: 50,
    });

    // Step 6: Update status - Generating AI insights
    await step.runMutation(internal.workflows.insightsHelpers.updateStatus, {
      userId: args.userId,
      workflowId: step.workflowId,
      status: "Getting your smart insights ready...",
      progress: 70,
    });

    // Step 7: Generate insights with AI
    const insights = await step.runAction(
      internal.workflows.insightsActions.generateInsightsWithAI,
      {
        userSpending,
        trends,
      }
    );

    // Step 8: Save insights to database
    await step.runMutation(internal.workflows.insightsHelpers.saveInsights, {
      userId: args.userId,
      workflowId: step.workflowId,
      insights: insights.slice(0, 3), // Maximum 3 insights
    });

    // Step 9: Complete
    await step.runMutation(internal.workflows.insightsHelpers.updateStatus, {
      userId: args.userId,
      workflowId: step.workflowId,
      status: "Complete! Your insights are ready.",
      progress: 100,
    });

    return insights;
  },
});

// ============================================
// KICK OFF WORKFLOW
// ============================================

export const startInsightGeneration = mutation({
  args: {},
  handler: async (ctx): Promise<string> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");

    // Check if there's already a recent insight (within last 24 hours)
    const recentInsight = await ctx.db
      .query("insights")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", userId).eq("isActive", true)
      )
      .first();

    if (recentInsight) {
      const hoursSinceGeneration =
        (Date.now() - recentInsight.generatedAt) / (1000 * 60 * 60);

      if (hoursSinceGeneration < 24) {
        throw new ConvexError(
          "You can only generate insights once every 24 hours. Please try again later."
        );
      }
    }

    // Start the workflow
    const workflowId = await workflow.start(
      ctx,
      internal.workflows.insights.generateInsightsWorkflow,
      { userId },
      {
        context: { name: "Insight Generation" },
      }
    );

    // Store placeholder entry
    await ctx.db.insert("insights", {
      userId,
      workflowId: workflowId as string,
      insights: [],
      generatedAt: Date.now(),
      isActive: true,
    });

    return workflowId;
  },
});

// ============================================
// GET WORKFLOW STATUS
// ============================================

export const getWorkflowStatus = query({
  args: { workflowId: v.string() },
  returns: v.object({
    isRunning: v.boolean(),
    isComplete: v.boolean(),
    hasFailed: v.boolean(),
    error: v.optional(v.string()),
    currentStatus: v.optional(v.string()),
    progress: v.optional(v.number()),
  }),
  handler: async (ctx, args) => {
    const status = await ctx.runQuery(components.workflow.journal.load, {
      workflowId: args.workflowId,
    });

    const isComplete = !!status.workflow.runResult;
    const hasFailed = status.workflow.runResult?.kind === "failed";
    const error =
      status.workflow.runResult?.kind === "failed"
        ? status.workflow.runResult.error
        : undefined;
    const isRunning = status.journalEntries.length > 0 && !isComplete;

    // Get current status from the insightGenerationStatus table
    const statusEntry = await ctx.db
      .query("insightGenerationStatus")
      .withIndex("by_workflowId", (q) => q.eq("workflowId", args.workflowId))
      .first();

    return {
      isRunning,
      isComplete,
      hasFailed,
      error,
      currentStatus: statusEntry?.status,
      progress: statusEntry?.progress,
    };
  },
});

// ============================================
// GET ACTIVE INSIGHTS
// ============================================

export const getActiveInsights = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const insights = await ctx.db
      .query("insights")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", userId).eq("isActive", true)
      )
      .order("desc")
      .first();

    return insights;
  },
});

// ============================================
// GET USER'S CURRENT STATUS (FOR UI POLLING)
// ============================================

export const getCurrentInsightStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    // Get the most recent status for this user
    const status = await ctx.db
      .query("insightGenerationStatus")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .first();

    if (!status) {
      return { status: "idle", progress: 0 };
    }

    return {
      status: status.status,
      progress: status.progress,
      workflowId: status.workflowId,
    };
  },
});

// ============================================
// CANCEL WORKFLOW (Optional)
// ============================================

export const cancelInsightGeneration = mutation({
  args: { workflowId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify the workflow belongs to this user
    const insight = await ctx.db
      .query("insights")
      .filter((q) => q.eq(q.field("workflowId"), args.workflowId))
      .first();

    if (!insight || insight.userId !== userId) {
      throw new Error("Workflow not found or unauthorized");
    }

    // Cancel the workflow - cast string to WorkflowId type
    await workflow.cancel(ctx, args.workflowId as any);

    // Update status
    const statusEntry = await ctx.db
      .query("insightGenerationStatus")
      .withIndex("by_workflowId", (q) => q.eq("workflowId", args.workflowId))
      .first();

    if (statusEntry) {
      await ctx.db.patch(statusEntry._id, {
        status: "Cancelled",
        progress: 0,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});
