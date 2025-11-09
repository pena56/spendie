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
    .index("by_user_type", ["userId", "type"]),
});

export default schema;
