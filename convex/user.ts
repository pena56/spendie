import { getAuthUserId } from "@convex-dev/auth/server";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import { Scrypt } from "lucia";
import { LEVEL_THRESHOLDS } from "./achievements";
import {
  authenticatedAction,
  authenticatedMutation,
  authenticatedQuery,
} from "./lib/authHelpers";

function getXPForNextLevel(currentLevel: number): number {
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  }
  return LEVEL_THRESHOLDS[currentLevel];
}

export const getCurrentUser = authenticatedQuery({
  handler: async (ctx) => {
    const { userId } = ctx;

    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }

    // Calculate XP progress
    const currentXP = user.totalXP ?? 0;
    const currentLevel = user.level ?? 1;
    const xpForCurrentLevel = LEVEL_THRESHOLDS[currentLevel - 1] ?? 0;
    const xpForNextLevel = getXPForNextLevel(currentLevel);
    const xpProgress = currentXP - xpForCurrentLevel;
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    const percentageProgress =
      xpNeeded > 0 ? Math.min(100, (xpProgress / xpNeeded) * 100) : 100;

    // Get all achievements that have prizes
    const achievementsWithPrizes = await ctx.db.query("achievements").collect();

    const unlockedPerks = user.unlockedPerks ?? [];

    // Extract all avatars and frames from achievements
    const allAvatars = achievementsWithPrizes
      .filter((achievement) => achievement.prize?.type === "avatar")
      .map((achievement) => ({
        id: achievement.prize!.id,
        name: achievement.name,
        description: achievement.description,
        achievementId: achievement._id,
        xpRequired: achievement.xpRequired,
        animation: achievement.prize!.animation,
        isUnlocked: unlockedPerks.some(
          (perk: {
            type: "avatar" | "frame";
            id: string;
            acquiredAt: number;
          }) => perk.type === "avatar" && perk.id === achievement.prize!.id
        ),
        unlockedAt: unlockedPerks.find(
          (perk: {
            type: "avatar" | "frame";
            id: string;
            acquiredAt: number;
          }) => perk.type === "avatar" && perk.id === achievement.prize!.id
        )?.acquiredAt,
      }));

    const allFrames = achievementsWithPrizes
      .filter((achievement) => achievement.prize?.type === "frame")
      .map((achievement) => ({
        id: achievement.prize!.id,
        name: achievement.name,
        description: achievement.description,
        achievementId: achievement._id,
        xpRequired: achievement.xpRequired,
        animation: achievement.prize!.animation,
        isUnlocked: unlockedPerks.some(
          (perk: {
            type: "avatar" | "frame";
            id: string;
            acquiredAt: number;
          }) => perk.type === "frame" && perk.id === achievement.prize!.id
        ),
        unlockedAt: unlockedPerks.find(
          (perk: {
            type: "avatar" | "frame";
            id: string;
            acquiredAt: number;
          }) => perk.type === "frame" && perk.id === achievement.prize!.id
        )?.acquiredAt,
      }));

    return {
      ...user,
      percentageProgress,
      xpForNextLevel,
      xpProgress,
      xpNeeded,
      availableAvatars: allAvatars,
      availableFrames: allFrames,
    };
  },
});

export const updateUserInfo = authenticatedMutation({
  args: {
    locale: v.optional(v.string()),
    currency: v.optional(v.string()),
    image: v.optional(v.string()),
    frame: v.optional(v.string()),
    background: v.optional(v.string()),
    name: v.optional(v.string()),
    isProfilePublic: v.optional(v.boolean()),
  },
  handler: async (ctx, arg) => {
    const { userId } = ctx;

    const user = await ctx.db.patch(userId, arg);

    return user;
  },
});

export const changePassword = authenticatedAction({
  args: {
    oldPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the current authenticated user
    const { userId } = ctx;

    // Get the user's password account
    const passwordAccount = await ctx.runQuery(
      internal.user.getPasswordAccount,
      { userId }
    );

    if (!passwordAccount) {
      throw new ConvexError(
        "No password authentication configured for this user"
      );
    }

    // The password hash is stored in the secret field
    const storedHash = passwordAccount.secret;

    if (!storedHash) {
      throw new ConvexError("No password hash found");
    }

    const scrypt = new Scrypt();
    const isValid = await scrypt.verify(storedHash, args.oldPassword);

    if (!isValid) {
      throw new ConvexError("Incorrect Old Password");
    }

    const newPasswordHash = await scrypt.hash(args.newPassword);

    // Update the password via internal mutation
    await ctx.runMutation(internal.user.updatePassword, {
      accountId: passwordAccount._id,
      newPasswordHash,
    });

    return { success: true };
  },
});

// Internal query to get password account
export const getPasswordAccount = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const accounts = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) =>
        q.eq("userId", args.userId).eq("provider", "password")
      )
      .collect();

    return accounts[0] || null;
  },
});

// Internal mutation to update password
export const updatePassword = internalMutation({
  args: {
    accountId: v.id("authAccounts"),
    newPasswordHash: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.accountId, {
      secret: args.newPasswordHash,
    });
  },
});

export const deleteAccount = authenticatedAction({
  args: {
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the current authenticated user
    const { userId } = ctx;

    // Get the user's password account and verify password
    const passwordAccount = await ctx.runQuery(
      internal.user.getPasswordAccount,
      { userId }
    );

    if (!passwordAccount?.secret) {
      throw new Error("Password verification required");
    }

    // Verify password using Scrypt
    const { Scrypt } = await import("lucia");
    const scrypt = new Scrypt();
    const isValid = await scrypt.verify(passwordAccount.secret, args.password);

    if (!isValid) {
      throw new Error("Invalid password");
    }

    // Execute the deletion process
    await ctx.runMutation(internal.user.deleteAccountData, { userId });

    return { success: true };
  },
});

/**
 * INTERNAL MUTATION - Actually deletes all user data
 * This ensures all related data is cleaned up properly
 */
export const deleteAccountData = internalMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { userId } = args;

    // 1. Handle split bills where user is creator
    const createdSplitBills = await ctx.db
      .query("splitBills")
      .withIndex("by_creator_date", (q) => q.eq("creatorId", userId))
      .collect();

    for (const splitBill of createdSplitBills) {
      // Delete all participants in this split bill
      const participants = await ctx.db
        .query("participants")
        .withIndex("by_user_splitBills", (q) =>
          q.eq("splitBillsId", splitBill._id)
        )
        .collect();

      for (const participant of participants) {
        await ctx.db.delete(participant._id);
      }

      // Delete all invites for this split bill
      const invites = await ctx.db
        .query("invites")
        .withIndex("by_sender_target", (q) =>
          q.eq("senderId", userId).eq("splitBIllsId", splitBill._id)
        )
        .collect();

      for (const invite of invites) {
        await ctx.db.delete(invite._id);
      }

      // Delete the split bill
      await ctx.db.delete(splitBill._id);
    }

    // 2. Handle participations in other users' split bills
    const participations = await ctx.db
      .query("participants")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const participation of participations) {
      // If user hasn't settled, you might want to handle this differently
      // For now, we'll just remove them from the split bill
      await ctx.db.delete(participation._id);
    }

    // 3. Delete invites (sent and received)
    const sentInvites = await ctx.db.query("invites").collect();

    for (const invite of sentInvites) {
      if (invite.senderId === userId || invite.recipientId === userId) {
        await ctx.db.delete(invite._id);
      }
    }

    // 4. Delete all transactions
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const transaction of transactions) {
      // Delete receipt from storage if exists
      if (transaction.receiptStorageId) {
        await ctx.storage.delete(transaction.receiptStorageId);
      }
      await ctx.db.delete(transaction._id);
    }

    // 5. Delete all budgets
    const budgets = await ctx.db
      .query("budgets")
      .withIndex("by_user_active", (q) => q.eq("userId", userId))
      .collect();

    for (const budget of budgets) {
      // Cancel scheduled functions if any
      if (budget.scheduledToken) {
        await ctx.scheduler.cancel(budget.scheduledToken);
      }
      await ctx.db.delete(budget._id);
    }

    // 6. Delete all insights
    const insights = await ctx.db
      .query("insights")
      .withIndex("by_user_active", (q) => q.eq("userId", userId))
      .collect();

    for (const insight of insights) {
      await ctx.db.delete(insight._id);
    }

    // 7. Delete user's profile image and background from storage
    const user = await ctx.db.get(userId);
    if (user?.image) {
      // If image is stored in Convex storage, extract ID and delete
      // This assumes image URLs follow pattern: https://...convex.cloud/api/storage/...
      // You may need to adjust based on your actual image storage
    }

    // 8. Delete auth accounts
    const authAccounts = await ctx.db.query("authAccounts").collect();

    for (const account of authAccounts) {
      if (account.userId === userId) {
        await ctx.db.delete(account._id);
      }
    }

    // 9. Delete auth sessions
    const authSessions = await ctx.db.query("authSessions").collect();

    for (const session of authSessions) {
      if (session.userId === userId) {
        await ctx.db.delete(session._id);
      }
    }

    // 10. Finally, delete the user
    await ctx.db.delete(userId);

    return { success: true };
  },
});

// Track daily login and streak
export const updateLastActivity = authenticatedMutation({
  args: {},
  handler: async (ctx) => {
    const { userId } = ctx;

    const user = await ctx.db.get(userId);
    if (!user) return;

    const now = Date.now();
    const lastActivity = user.lastActivity ?? 0;
    const oneDayMs = 24 * 60 * 60 * 1000;

    // Check if it's a new day
    const isNewDay = now - lastActivity > oneDayMs;

    if (isNewDay) {
      // Calculate streak
      const isConsecutiveDay = now - lastActivity < 2 * oneDayMs;
      const currentStreak = isConsecutiveDay
        ? (user.currentStreak ?? 0) + 1
        : 1;

      await ctx.db.patch(userId, {
        lastActivity: now,
        currentStreak,
      });

      // ✨ Award XP for daily login
      await ctx.scheduler.runAfter(0, internal.achievements.onDailyLogin, {
        userId,
        streakDays: currentStreak,
      });
    }
  },
});
