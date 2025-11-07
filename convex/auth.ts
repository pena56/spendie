import { Password } from "@convex-dev/auth/providers/Password";
import { DataModel } from "./_generated/dataModel";
import { convexAuth } from "@convex-dev/auth/server";

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
  },
});
