import { Password } from "@convex-dev/auth/providers/Password";
import { DataModel } from "./_generated/dataModel";
import { convexAuth } from "@convex-dev/auth/server";

import { DEFAULT_PERKS } from "../src/constants/prizes";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password<DataModel>({
      profile(params) {
        return {
          email: params.email as string,
          name: params.name as string,
        };
      },
    }),
  ],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      // Extract name from signup
      const { existingUserId, profile } = args;

      if (existingUserId) {
        // User already exists, optionally update
        return existingUserId;
      }

      // Create new user with name
      const userId = await ctx.db.insert("users", {
        name: profile.name,
        email: profile.email,
        image: profile.image,
        emailVerified: profile.emailVerified,
      });

      return userId;
    },
    async afterUserCreatedOrUpdated(ctx, args) {
      const user = await ctx.db.get(args.userId);

      if (!user) return;

      if (user.unlockedPerks && user.unlockedPerks.length > 0) {
        return;
      }

      const defaultPerks = [
        {
          type: "avatar" as const,
          id: DEFAULT_PERKS.avatar.id,
          acquiredAt: Date.now(),
        },
        {
          type: "frame" as const,
          id: DEFAULT_PERKS.frame.id,
          acquiredAt: Date.now(),
        },
      ];

      await ctx.db.patch(args.userId, {
        locale: "en-US",
        currency: "USD",
        isProfilePublic: true,
        image: DEFAULT_PERKS.avatar.id,
        frame: DEFAULT_PERKS.frame.id,
        unlockedPerks: defaultPerks,
        totalXP: 0,
        level: 1,
        currentStreak: 0,
        lastActivity: Date.now(),
      });
    },
  },
});
