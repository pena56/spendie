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
    image: v.optional(v.id("_storage")),
    isAnonymous: v.optional(v.boolean()),
  }).index("email", ["email"]),
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
      v.union(v.literal("manual"), v.literal("voice"), v.literal("scan"))
    ),
    receiptStorageId: v.optional(v.id("_storage")),
    receiptUrl: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "date"])
    .index("by_user_type", ["userId", "type"])
    .index("by_user_category", ["userId", "category"])
    .index("by_user_category_date", ["userId", "category", "date"]),
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
    .index("by_user_generated", ["userId", "generatedAt"]),
});

export default schema;
