// convex/achievements.ts
import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// ============================================
// CONFIGURATION: XP Actions & Levels
// ============================================

/**
 * XP rewards for different actions
 */
export const XP_REWARDS = {
  // Transaction actions
  ADD_TRANSACTION: 10,
  ADD_FIRST_TRANSACTION: 50,
  ADD_TRANSACTION_WITH_RECEIPT: 15,
  ADD_TRANSACTION_VIA_VOICE: 20,
  WEEKLY_TRANSACTION_STREAK: 25,
  MONTHLY_TRANSACTION_STREAK: 100,

  // Budget actions
  CREATE_BUDGET: 30,
  STAY_UNDER_BUDGET: 50,
  THREE_MONTHS_BUDGET_SUCCESS: 150,

  // Split bill actions
  CREATE_SPLIT_BILL: 20,
  SETTLE_SPLIT_BILL: 25,
  INVITE_FRIEND: 15,

  // Engagement
  DAILY_LOGIN: 5,
  WEEKLY_LOGIN_STREAK: 35,
  VIEW_INSIGHTS: 10,

  // Milestones
  TOTAL_50_TRANSACTIONS: 100,
  TOTAL_100_TRANSACTIONS: 200,
  TOTAL_500_TRANSACTIONS: 500,
} as const;

/**
 * Level thresholds - XP required to reach each level
 */
export const LEVEL_THRESHOLDS = [
  0, // Level 1
  100, // Level 2
  250, // Level 3
  500, // Level 4
  1000, // Level 5
  2000, // Level 6
  3500, // Level 7
  5500, // Level 8
  8000, // Level 9
  11000, // Level 10
  15000, // Level 11
  20000, // Level 12
  26000, // Level 13
  33000, // Level 14
  41000, // Level 15
  50000, // Level 16
];

/**
 * Calculate level from total XP
 */
export function calculateLevel(totalXP: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

/**
 * Get XP needed for next level
 */
export function getXPForNextLevel(currentLevel: number): number {
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  }
  return LEVEL_THRESHOLDS[currentLevel];
}

// ============================================
// MUTATIONS: Award XP & Check Achievements
// ============================================

/**
 * Internal helper function to award XP
 */
async function awardXPInternal(
  ctx: any,
  userId: Id<"users">,
  amount: number,
  reason: string
) {
  const user = await ctx.db.get(userId);
  if (!user) throw new Error("User not found");

  const currentXP = user.totalXP ?? 0;
  const currentLevel = user.level ?? 1;
  const newTotalXP = currentXP + amount;
  const newLevel = calculateLevel(newTotalXP);

  // Update user XP
  await ctx.db.patch(userId, {
    totalXP: newTotalXP,
    level: newLevel,
  });

  // Check if user leveled up
  const leveledUp = newLevel > currentLevel;
  const levelsGained = newLevel - currentLevel;

  // Check for achievement unlocks
  const newAchievements = await checkAndUnlockAchievements(
    ctx,
    userId,
    newTotalXP,
    user.unlockedAchievements ?? []
  );

  return {
    xpAwarded: amount,
    newTotalXP,
    leveledUp,
    newLevel,
    levelsGained,
    newAchievements,
  };
}

/**
 * Award XP to a user and check for level ups and achievement unlocks
 */
export const awardXP = internalMutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    return await awardXPInternal(ctx, args.userId, args.amount, args.reason);
  },
});

/**
 * Check and unlock achievements based on XP
 */
async function checkAndUnlockAchievements(
  ctx: any,
  userId: Id<"users">,
  totalXP: number,
  currentAchievements: Id<"achievements">[]
) {
  // Get all achievements user is eligible for but hasn't unlocked
  const allAchievements = await ctx.db
    .query("achievements")
    .withIndex("by_xp_required")
    .collect();

  const newlyUnlocked: Array<{
    achievement: any;
    prize?: any;
  }> = [];

  for (const achievement of allAchievements) {
    // Skip if already unlocked
    if (currentAchievements.includes(achievement._id)) continue;

    // Check if user has enough XP
    if (totalXP >= achievement.xpRequired) {
      // Add to unlocked achievements
      currentAchievements.push(achievement._id);

      // If achievement has a prize, unlock it
      if (achievement.prize) {
        const user = await ctx.db.get(userId);
        const unlockedPerks = user?.unlockedPerks ?? [];

        // Check if perk isn't already unlocked
        const alreadyHasPerk = unlockedPerks.some(
          (perk: {
            type: "avatar" | "frame";
            id: string;
            acquiredAt: number;
          }) =>
            perk.type === achievement.prize.type &&
            perk.id === achievement.prize.id
        );

        if (!alreadyHasPerk) {
          unlockedPerks.push({
            type: achievement.prize.type,
            id: achievement.prize.id,
            acquiredAt: Date.now(),
          });

          await ctx.db.patch(userId, {
            unlockedPerks,
          });
        }
      }

      newlyUnlocked.push({
        achievement,
        prize: achievement.prize,
      });
    }
  }

  // Update user's unlocked achievements
  if (newlyUnlocked.length > 0) {
    await ctx.db.patch(userId, {
      unlockedAchievements: currentAchievements,
    });
  }

  return newlyUnlocked;
}

// ============================================
// ACTION HANDLERS: Trigger XP Awards
// ============================================

/**
 * Called when user adds a transaction
 */
export const onTransactionAdded = internalMutation({
  args: {
    userId: v.id("users"),
    isFirstTransaction: v.boolean(),
    hasReceipt: v.boolean(),
    isVoice: v.boolean(),
  },
  handler: async (ctx, args) => {
    let xpAmount = XP_REWARDS.ADD_TRANSACTION;
    const reasons: string[] = ["Added transaction"];

    if (args.isFirstTransaction) {
      xpAmount += XP_REWARDS.ADD_FIRST_TRANSACTION - XP_REWARDS.ADD_TRANSACTION;
      reasons.push("First transaction!");
    }

    if (args.hasReceipt) {
      xpAmount +=
        XP_REWARDS.ADD_TRANSACTION_WITH_RECEIPT - XP_REWARDS.ADD_TRANSACTION;
      reasons.push("With receipt");
    }

    if (args.isVoice) {
      xpAmount +=
        XP_REWARDS.ADD_TRANSACTION_VIA_VOICE - XP_REWARDS.ADD_TRANSACTION;
      reasons.push("Via voice");
    }

    // Check for milestone achievements
    const totalTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const count = totalTransactions.length;
    if (count === 50) {
      xpAmount += XP_REWARDS.TOTAL_50_TRANSACTIONS;
      reasons.push("50 transactions milestone!");
    } else if (count === 100) {
      xpAmount += XP_REWARDS.TOTAL_100_TRANSACTIONS;
      reasons.push("100 transactions milestone!");
    } else if (count === 500) {
      xpAmount += XP_REWARDS.TOTAL_500_TRANSACTIONS;
      reasons.push("500 transactions milestone!");
    }

    // Award XP using the internal helper function
    await awardXPInternal(ctx, args.userId, xpAmount, reasons.join(", "));
  },
});

/**
 * Called when user creates a budget
 */
export const onBudgetCreated = internalMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await awardXPInternal(
      ctx,
      args.userId,
      XP_REWARDS.CREATE_BUDGET,
      "Created a budget"
    );
  },
});

/**
 * Called when user stays under budget for the period
 */
export const onBudgetSuccess = internalMutation({
  args: {
    userId: v.id("users"),
    consecutiveMonths: v.number(),
  },
  handler: async (ctx, args) => {
    let xpAmount: number = XP_REWARDS.STAY_UNDER_BUDGET;
    let reason = "Stayed under budget";

    if (args.consecutiveMonths >= 3) {
      xpAmount = XP_REWARDS.THREE_MONTHS_BUDGET_SUCCESS;
      reason = "3 months budget success streak!";
    }

    await awardXPInternal(ctx, args.userId, xpAmount, reason);
  },
});

/**
 * Called when user creates a split bill
 */
export const onSplitBillCreated = internalMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await awardXPInternal(
      ctx,
      args.userId,
      XP_REWARDS.CREATE_SPLIT_BILL,
      "Created a split bill"
    );
  },
});

/**
 * Called when user settles a split bill
 */
export const onSplitBillSettled = internalMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await awardXPInternal(
      ctx,
      args.userId,
      XP_REWARDS.SETTLE_SPLIT_BILL,
      "Settled a split bill"
    );
  },
});

/**
 * Called on daily login
 */
export const onDailyLogin = internalMutation({
  args: {
    userId: v.id("users"),
    streakDays: v.number(),
  },
  handler: async (ctx, args) => {
    let xpAmount: number = XP_REWARDS.DAILY_LOGIN;
    let reason = "Daily login";

    if (args.streakDays % 7 === 0 && args.streakDays > 0) {
      xpAmount = XP_REWARDS.WEEKLY_LOGIN_STREAK;
      reason = `${args.streakDays} day login streak!`;
    }

    await awardXPInternal(ctx, args.userId, xpAmount, reason);
  },
});

// ============================================
// QUERIES: Get User Progress
// ============================================

/**
 * Get user's XP progress and achievements
 */
export const getUserProgress = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    const currentXP = user.totalXP ?? 0;
    const currentLevel = user.level ?? 1;
    const nextLevel = currentLevel + 1;
    const xpForCurrentLevel = LEVEL_THRESHOLDS[currentLevel - 1] ?? 0;
    const xpForNextLevel = getXPForNextLevel(currentLevel);
    const xpProgress = currentXP - xpForCurrentLevel;
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    const progressPercentage = (xpProgress / xpNeeded) * 100;

    // Get unlocked achievement IDs
    const unlockedAchievementIds = user.unlockedAchievements ?? [];

    // Get all achievements with locked/unlocked status
    const allAchievements = await ctx.db
      .query("achievements")
      .withIndex("by_xp_required")
      .collect();

    const achievementsWithStatus = allAchievements.map((achievement) => ({
      ...achievement,
      isLocked: !unlockedAchievementIds.includes(achievement._id),
      isUnlocked: unlockedAchievementIds.includes(achievement._id),
    }));

    // Separate unlocked and locked achievements
    const unlockedAchievements = achievementsWithStatus.filter(
      (a) => a.isUnlocked
    );
    const lockedAchievements = achievementsWithStatus.filter((a) => a.isLocked);

    return {
      currentXP,
      currentLevel,
      nextLevel,
      xpForNextLevel,
      xpProgress,
      xpNeeded,
      progressPercentage: Math.min(100, progressPercentage),
      unlockedAchievements,
      availableAchievements: achievementsWithStatus,
      lockedAchievements,
      unlockedPerks: user.unlockedPerks ?? [],
      currentStreak: user.currentStreak ?? 0,
    };
  },
});

/**
 * Get all available perks (avatars & frames)
 */
export const getAvailablePerks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    const unlockedPerks = user.unlockedPerks ?? [];

    // Get all achievements that have prizes
    const achievementsWithPrizes = await ctx.db.query("achievements").collect();

    const allPerks = achievementsWithPrizes
      .filter((a) => a.prize)
      .map((a) => ({
        ...a.prize!,
        achievementName: a.name,
        achievementId: a._id,
        xpRequired: a.xpRequired,
        unlocked: unlockedPerks.some(
          (p) => p.type === a.prize!.type && p.id === a.prize!.id
        ),
      }));

    return {
      avatars: allPerks.filter((p) => p.type === "avatar"),
      frames: allPerks.filter((p) => p.type === "frame"),
      unlockedPerks,
    };
  },
});
