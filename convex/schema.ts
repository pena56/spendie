import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,
  // If you're customizing the users table, make sure to include all required fields
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerified: v.optional(v.boolean()),
    phone: v.optional(v.string()),
    phoneVerified: v.optional(v.boolean()),
    image: v.optional(v.id("_storage")),
    isAnonymous: v.optional(v.boolean()),
  }).index("email", ["email"]),
});

export default schema;
