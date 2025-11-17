// convex/lib/authHelpers.ts
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import {
  customQuery,
  customMutation,
  customAction,
  customCtx,
} from "convex-helpers/server/customFunctions";
import {
  query as baseQuery,
  mutation as baseMutation,
  action as baseAction,
  internalQuery as baseInternalQuery,
  internalMutation as baseInternalMutation,
  internalAction as baseInternalAction,
} from "../_generated/server";
import { DataModel, Id } from "../_generated/dataModel";

// ============================================
// AUTHENTICATED CONTEXT TYPES
// ============================================

export type AuthenticatedQueryCtx = typeof customCtx & {
  userId: Id<"users">;
};

export type AuthenticatedMutationCtx = typeof customCtx & {
  userId: Id<"users">;
};

export type AuthenticatedActionCtx = typeof customCtx & {
  userId: Id<"users">;
};

// ============================================
// AUTHENTICATED QUERY
// ============================================

export const authenticatedQuery = customQuery(
  baseQuery,
  customCtx(async (ctx): Promise<{ userId: Id<"users"> }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("User not authenticated");
    }
    return { userId };
  })
);

// ============================================
// AUTHENTICATED MUTATION
// ============================================

export const authenticatedMutation = customMutation(
  baseMutation,
  customCtx(async (ctx): Promise<{ userId: Id<"users"> }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("User not authenticated");
    }
    return { userId };
  })
);

// ============================================
// AUTHENTICATED ACTION
// ============================================

export const authenticatedAction = customAction(
  baseAction,
  customCtx(async (ctx): Promise<{ userId: Id<"users"> }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("User not authenticated");
    }
    return { userId };
  })
);

// ============================================
// HELPER FUNCTION: Get Authenticated User ID
// ============================================

/**
 * Get the authenticated user ID or throw an error
 * Use this in regular queries/mutations/actions when you need userId
 */
export async function requireAuth(ctx: any): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new ConvexError("User not authenticated");
  }
  return userId;
}

/**
 * Get the authenticated user ID or return null
 * Use this when authentication is optional
 */
export async function optionalAuth(ctx: any): Promise<Id<"users"> | null> {
  return await getAuthUserId(ctx);
}
