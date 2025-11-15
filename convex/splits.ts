import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { TransactionCategories } from "../src/constants/categories";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const createSplit = mutation({
  args: {
    description: v.string(),
    totalAmount: v.number(),
    category: v.union(
      ...TransactionCategories.filter((c) => c.type === "expense").map((item) =>
        v.literal(item.name)
      )
    ),
    date: v.number(),
    notes: v.optional(v.string()),
    participants: v.array(
      v.object({
        name: v.string(),
        userId: v.id("users"),
        sharePercentage: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthorized");

    const now = Date.now();

    const splitId = await ctx.db.insert("splitBills", {
      creatorId: userId,
      description: args.description,
      totalAmount: args.totalAmount,
      category: args.category,
      date: args.date,
      status: args.participants.length > 1 ? "active" : "pending",
      notes: args.notes,
    });

    await ctx.scheduler.runAfter(0, internal.achievements.onSplitBillCreated, {
      userId,
    });

    await ctx.db.insert("participants", {
      userId,
      sharePercentage: 100,
      joinedAt: now,
      settled: false,
      settledAmount: 0,
      splitBillsId: splitId,
    });

    for (const participant of args.participants) {
      if (participant.userId === userId) {
        // Current user: Update creator's share if provided
        await ctx.db.patch(
          // Find creator's participant ID (assume first/last; or query)
          (
            await ctx.db
              .query("participants")
              .withIndex("by_user_splitBills", (q) =>
                q.eq("splitBillsId", splitId).eq("userId", userId)
              )
              .first()
          )?._id!,
          { sharePercentage: participant.sharePercentage }
        );
      } else {
        // Other user: Send invite
        const targetUser = await ctx.db.get(participant.userId);
        if (!targetUser)
          throw new ConvexError(`Participant ${participant.name} not found`);

        await ctx.db.insert("invites", {
          expiresAt: args.date,
          senderId: userId,
          splitBIllsId: splitId,
          status: "pending",
          recipientId: targetUser._id,
          sharePercentage: participant.sharePercentage,
          message: `Join "${args.description}" split?`,
        });
      }
    }
  },
});

export const getUserSplits = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthorized");

    const pendingInvites = await ctx.db
      .query("invites")
      .withIndex("by_recipient_pending", (q) =>
        q.eq("recipientId", userId).eq("status", "pending")
      )
      .order("desc")
      .collect();

    // Get user's participations to find joined splits
    const participations = await ctx.db
      .query("participants")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    // Get user's created splits
    const createdSplits = await ctx.db
      .query("splitBills")
      .withIndex("by_creator_date", (q) => q.eq("creatorId", userId))
      .order("desc")
      .collect();

    // Collect unique split IDs (joined + created)
    const splitIds = new Set([
      ...participations.map((p) => p.splitBillsId),
      ...createdSplits.map((s) => s._id),
    ]);

    if (splitIds.size === 0) {
      return {
        pendingSettlement: 0,
        completedSettlements: 0,
        splits: [],
      };
    }

    // Fetch all relevant splits
    const splitPromises = Array.from(splitIds).map((id) => ctx.db.get(id));
    const splits = (await Promise.all(splitPromises)).filter(Boolean) as any[];

    // Sort splits by date desc
    splits.sort((a, b) => b.date - a.date);

    // Compute aggregates (now from txns for precision)
    let pendingSettlement = 0;
    let completedSettlements = 0;
    for (const participation of participations) {
      const split = splits.find((s) => s._id === participation.splitBillsId);
      if (split) {
        const userShare =
          split.totalAmount * (participation.sharePercentage / 100);

        // Query user's txns for this split to get actual settled amount
        const userTxns = await ctx.db
          .query("transactions")
          .withIndex("by_split_bill", (q) => q.eq("splitBillId", split._id))
          .filter((q) => q.eq(q.field("userId"), userId))
          .collect();

        const settledFromTxns = Math.abs(
          userTxns.reduce((sum, txn) => sum + txn.amount, 0) // Abs for expenses
        );

        completedSettlements += settledFromTxns;
        pendingSettlement += userShare - settledFromTxns; // Remaining
      }
    }

    const enrichedPendingInvites = await Promise.all(
      pendingInvites.map(async (invite) => {
        const split = await ctx.db.get(invite.splitBIllsId);
        if (!split || split.status === "cancelled") return null;

        const sender = await ctx.db.get(invite.senderId);
        const numParticipants = await ctx.db
          .query("participants")
          .withIndex("by_user_splitBills", (q) =>
            q.eq("splitBillsId", invite.splitBIllsId)
          )
          .collect()
          .then((part) => part.length);

        const expectedSettlement =
          split.totalAmount * (invite.sharePercentage / 100);

        return {
          id: invite._id,
          message: invite.message || `Join the "${split.description}" split?`,
          invitedBy: sender?.name || "Unknown User",
          expectedSettlement,
          totalAmount: split.totalAmount,
          numberOfParticipants: numParticipants,
        };
      })
    ).then((results) => results.filter(Boolean)); // Filter nulls

    // For each split, fetch participants and map to response format
    const splitsWithDetails = await Promise.all(
      splits.map(async (split) => {
        // Fetch all participants for this split
        const splitParticipants = await ctx.db
          .query("participants")
          .withIndex("by_user_splitBills", (q) =>
            q.eq("splitBillsId", split._id)
          )
          .collect();

        // Fetch user details and compute contributed/expected/progress for each participant
        const participantPromises = splitParticipants.map(async (p) => {
          const user = await ctx.db.get(p.userId);

          // Query this participant's txns for the split
          const participantTxns = await ctx.db
            .query("transactions")
            .withIndex("by_split_bill", (q) => q.eq("splitBillId", split._id))
            .filter((q) => q.eq(q.field("userId"), p.userId))
            .collect();

          const contributed = Math.abs(
            participantTxns.reduce((sum, txn) => sum + txn.amount, 0)
          );
          const expected = split.totalAmount * (p.sharePercentage / 100);
          const progress =
            expected > 0 ? ((contributed / expected) * 100).toFixed(1) : "0";

          return {
            id: user?._id || p.userId,
            name: user?.name || "Unknown User",
            image: user?.image,
            background: user?.background,
            contributed,
            expected,
            progress,
          };
        });
        const participants = await Promise.all(participantPromises);

        // User's participation for this split
        const userParticipation = splitParticipants.find(
          (p) => p.userId === userId
        );
        const isOwner = split.creatorId === userId;
        const isSettled = split.status === "settled";
        const userShare = userParticipation
          ? split.totalAmount * (userParticipation?.sharePercentage / 100 || 0)
          : 0;

        // Query user's txns for this split
        const userTxns = await ctx.db
          .query("transactions")
          .withIndex("by_split_bill", (q) => q.eq("splitBillId", split._id))
          .filter((q) => q.eq(q.field("userId"), userId))
          .collect();

        const amountSettled = Math.abs(
          userTxns.reduce((sum, txn) => sum + txn.amount, 0)
        );
        const remainingAmount = Math.max(0, userShare - amountSettled); // Non-negative

        return {
          id: split._id,
          description: split.description,
          totalAmount: split.totalAmount,
          category: split.category,
          date: split.date,
          isSettled,
          amountSettled,
          remainingAmount,
          isOwner,
          participants,
        };
      })
    );

    return {
      pendingSettlement,
      completedSettlements,
      pendingInvites: enrichedPendingInvites,
      splits: splitsWithDetails,
    };
  },
});

export const searchAvailableParticipants = query({
  args: {
    name: v.string(),
  },
  handler: async (ctx, { name }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthorized");

    // Search for users by name
    const users = await ctx.db
      .query("users")
      .withSearchIndex("search_name", (q) => q.search("name", name))
      .collect();

    // Filter out self in JavaScript
    const filteredUsers = users.filter((user) => user._id !== userId);

    // Project only needed fields
    return filteredUsers.map((user) => ({
      userId: user._id,
      image: user.image,
      name: user.name,
    }));
  },
});

export const settleParticipantShare = mutation({
  args: {
    splitId: v.id("splitBills"),
    amount: v.number(),
  },
  handler: async (ctx, { splitId, amount }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthorized");

    // Fetch split
    const split = await ctx.db.get(splitId);
    if (!split) throw new ConvexError("Split bill not found");
    if (split.status === "settled")
      throw new ConvexError("Split already fully settled");
    if (split.status === "cancelled")
      throw new ConvexError("Cannot settle cancelled split");

    // Fetch user's participation
    const userParticipation = await ctx.db
      .query("participants")
      .withIndex("by_user_splitBills", (q) =>
        q.eq("splitBillsId", splitId).eq("userId", userId)
      )
      .first();

    if (!userParticipation)
      throw new ConvexError("You are not a participant in this split");

    const fullShare =
      split.totalAmount * (userParticipation.sharePercentage / 100);
    const currentSettled = userParticipation.settledAmount;
    const remainingBefore = fullShare - currentSettled;

    if (amount > remainingBefore)
      throw new ConvexError(
        `Amount exceeds remaining share of ${remainingBefore}`
      );
    if (amount <= 0) throw new ConvexError("Amount must be positive");

    const now = Date.now();

    // Create transaction for this partial/full payment
    const txnId = await ctx.db.insert("transactions", {
      userId,
      description: `${split.description} (Partial Split Payment)`,
      amount: amount,
      type: "expense",
      category: split.category,
      date: now, // Or split.date
      source: "split",
      splitBillId: splitId,
      notes: `Partial payment toward ${fullShare} share (${amount} of remaining ${remainingBefore})`,
    });

    // Update participation
    const newSettledAmount = currentSettled + amount;
    const isFullySettled = newSettledAmount >= fullShare;

    await ctx.db.patch(userParticipation._id, {
      settledAmount: newSettledAmount,
      settled: isFullySettled,
    });

    // Check if all participants settled (optional: mark split settled)
    const allParticipants = await ctx.db
      .query("participants")
      .withIndex("by_user_splitBills", (q) => q.eq("splitBillsId", splitId))
      .collect();

    const allSettled = allParticipants.every((p) => p.settled);
    if (allSettled) {
      await ctx.db.patch(splitId, { status: "settled" });
    }

    await ctx.scheduler.runAfter(0, internal.achievements.onSplitBillSettled, {
      userId,
    });

    return {
      success: true,
      transactionId: txnId,
      updatedSettledAmount: newSettledAmount,
      remainingAfter: fullShare - newSettledAmount,
      isFullySettled,
    };
  },
});

export const respondToSplitInvite = mutation({
  args: {
    inviteId: v.id("invites"),
    action: v.union(v.literal("accept"), v.literal("reject")),
  },
  handler: async (ctx, { inviteId, action }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthorized");

    // Fetch invite
    const invite = await ctx.db.get(inviteId);
    if (!invite) throw new ConvexError("Invite not found");
    if (invite.status !== "pending")
      throw new ConvexError("Invite is no longer pending");
    if (Date.now() > invite.expiresAt) {
      await ctx.db.patch(inviteId, { status: "expired" });
      throw new ConvexError("Invite has expired");
    }

    // Validate recipient
    if (invite.recipientId && invite.recipientId !== userId) {
      throw new ConvexError("Not the recipient of this invite");
    }

    if (action === "reject") {
      await ctx.db.patch(inviteId, { status: "declined" });
      return { success: true, action: "rejected" };
    }

    // Action: "accept"
    // Fetch the split
    const split = await ctx.db.get(invite.splitBIllsId);
    if (!split) throw new ConvexError("Associated split not found");
    if (split.status === "settled" || split.status === "cancelled") {
      throw new ConvexError("Cannot join a settled or cancelled split");
    }

    // Check if already participant (avoid dupes)
    const existingParticipant = await ctx.db
      .query("participants")
      .withIndex("by_user_splitBills", (q) =>
        q.eq("splitBillsId", invite.splitBIllsId).eq("userId", userId)
      )
      .first();

    if (existingParticipant) {
      throw new ConvexError("You are already a participant in this split");
    }

    const now = Date.now();

    // Add to participants with sharePercentage from invite
    await ctx.db.insert("participants", {
      userId,
      sharePercentage: invite.sharePercentage,
      joinedAt: now,
      settled: false,
      settledAmount: 0,
      splitBillsId: invite.splitBIllsId,
    });

    // Update invite status
    await ctx.db.patch(inviteId, { status: "accepted" });

    // Update split status if needed (e.g., from "pending" to "active" if enough participants)
    const currentParticipants = await ctx.db
      .query("participants")
      .withIndex("by_user_splitBills", (q) =>
        q.eq("splitBillsId", invite.splitBIllsId)
      )
      .collect();

    const newStatus = currentParticipants.length > 1 ? "active" : "pending";
    await ctx.db.patch(invite.splitBIllsId, { status: newStatus });

    // Optional: Recalculate shares if even split desired (or keep custom from invites)

    // Optional: Notify creator

    return { success: true, action: "accepted", splitId: invite.splitBIllsId };
  },
});
