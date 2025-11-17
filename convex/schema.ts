import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { TransactionCategories } from "../src/constants/categories";

const schema = defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerified: v.optional(v.boolean()),
    phone: v.optional(v.string()),
    phoneVerified: v.optional(v.boolean()),
    image: v.optional(v.string()),
    background: v.optional(v.string()),
    frame: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
    currency: v.optional(v.string()),
    locale: v.optional(v.string()),
    isProfilePublic: v.optional(v.boolean()),
    totalXP: v.optional(v.number()),
    level: v.optional(v.number()),
    unlockedAchievements: v.optional(v.array(v.id("achievements"))),
    unlockedPerks: v.optional(
      v.array(
        v.object({
          type: v.union(v.literal("avatar"), v.literal("frame")),
          id: v.string(),
          acquiredAt: v.number(),
        })
      )
    ),
    currentStreak: v.optional(v.number()),
    lastActivity: v.optional(v.number()),
  })
    .searchIndex("search_name", {
      searchField: "name",
    })
    .index("email", ["email"])
    .index("name", ["name"])
    .index("by_total_xp", ["totalXP"]),
  achievements: defineTable({
    name: v.string(),
    description: v.string(),
    xpRequired: v.number(),
    isTiered: v.boolean(),
    prize: v.optional(
      v.object({
        type: v.union(v.literal("avatar"), v.literal("frame")),
        id: v.string(),
        animation: v.optional(v.string()),
      })
    ),
    icon: v.string(),
    category: v.string(),
  }).index("by_xp_required", ["xpRequired"]),
  transactions: defineTable({
    userId: v.id("users"),
    description: v.string(),
    amount: v.number(),
    type: v.union(v.literal("income"), v.literal("expense")),
    category: v.union(
      ...TransactionCategories.map((item) => v.literal(item.name))
    ),
    date: v.number(),
    notes: v.optional(v.string()),
    source: v.optional(
      v.union(
        v.literal("manual"),
        v.literal("voice"),
        v.literal("scan"),
        v.literal("split")
      )
    ),
    receiptStorageId: v.optional(v.id("_storage")),
    receiptUrl: v.optional(v.string()),
    splitBillId: v.optional(v.id("splitBills")),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "date"])
    .index("by_user_type", ["userId", "type"])
    .index("by_user_category", ["userId", "category"])
    .index("by_user_category_date", ["userId", "category", "date"])
    .index("by_split_bill", ["splitBillId"]),
  budgets: defineTable({
    userId: v.id("users"),
    category: v.union(
      ...TransactionCategories.map((item) => v.literal(item.name))
    ),
    limit: v.number(),
    periodStart: v.number(),
    periodEnd: v.number(),
    isActive: v.boolean(),
    notes: v.optional(v.string()),
    scheduledToken: v.optional(v.id("_scheduled_functions")),
  })
    .index("by_user_category_period", ["userId", "category", "periodStart"])
    .index("by_user_active", ["userId", "isActive"])
    .index("by_user_category", ["userId", "category"]),
  insights: defineTable({
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
    generatedAt: v.number(),
    isActive: v.boolean(),
  })
    .index("by_user_active", ["userId", "isActive"])
    .index("by_user_generated", ["userId", "generatedAt"])
    .index("by_workflowId", ["workflowId"]),
  insightGenerationStatus: defineTable({
    userId: v.id("users"),
    workflowId: v.string(),
    status: v.string(),
    progress: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_workflowId", ["workflowId"]),
  invites: defineTable({
    senderId: v.id("users"),
    recipientId: v.optional(v.id("users")),
    splitBIllsId: v.id("splitBills"),
    message: v.optional(v.string()),
    sharePercentage: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("expired")
    ),
    expiresAt: v.number(),
  })
    .index("by_recipient_pending", ["recipientId", "status"])
    .index("by_sender_target", ["senderId", "splitBIllsId"]),
  participants: defineTable({
    userId: v.id("users"),
    sharePercentage: v.number(),
    joinedAt: v.number(),
    settled: v.boolean(),
    settledAmount: v.number(),
    splitBillsId: v.id("splitBills"),
  })
    .index("by_user", ["userId"])
    .index("by_user_splitBills", ["splitBillsId", "userId"]),
  splitBills: defineTable({
    creatorId: v.id("users"),
    description: v.string(),
    totalAmount: v.number(),
    category: v.union(
      ...TransactionCategories.filter((c) => c.type === "expense").map((item) =>
        v.literal(item.name)
      )
    ),
    date: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("settled"),
      v.literal("cancelled")
    ),
    notes: v.optional(v.string()),
  })
    .index("by_creator_date", ["creatorId", "date"])
    .index("by_status", ["status"]),
});

export default schema;
