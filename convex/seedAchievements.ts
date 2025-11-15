// convex/seedAchievements.ts
import { mutation } from "./_generated/server";

/**
 * Run this once to populate your achievements table
 * Call it from your Convex dashboard or a setup script
 */
export const seedAchievements = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if achievements already exist
    const existing = await ctx.db.query("achievements").first();
    if (existing) {
      console.log("Achievements already seeded");
      return { message: "Achievements already exist" };
    }

    const achievements = [
      // Beginner Achievements
      {
        name: "Getting Started",
        description: "Complete your first transaction",
        xpRequired: 0,
        isTiered: false,
        icon: "🎯",
        category: "beginner",
      },
      {
        name: "Budget Conscious",
        description: "Create your first budget",
        xpRequired: 100,
        isTiered: false,
        icon: "💰",
        category: "budget",
        prize: {
          type: "avatar" as const,
          id: "avat_1",
          animation: "bounce",
        },
      },
      {
        name: "Record Keeper",
        description: "Add 10 transactions",
        xpRequired: 250,
        isTiered: false,
        icon: "📝",
        category: "transactions",
      },

      // Intermediate Achievements
      {
        name: "Social Spender",
        description: "Create your first split bill",
        xpRequired: 500,
        isTiered: false,
        icon: "🤝",
        category: "social",
        prize: {
          type: "frame" as const,
          id: "frm_diagonal_capsule",
        },
      },
      {
        name: "Organized Spender",
        description: "Reach 50 total transactions",
        xpRequired: 1000,
        isTiered: false,
        icon: "📊",
        category: "transactions",
        prize: {
          type: "avatar" as const,
          id: "avat_2",
        },
      },
      {
        name: "Budget Master",
        description: "Stay under budget for 3 consecutive months",
        xpRequired: 2000,
        isTiered: false,
        icon: "🏆",
        category: "budget",
        prize: {
          type: "avatar" as const,
          id: "avat_3",
          animation: "shine",
        },
      },

      // Advanced Achievements
      {
        name: "Voice Commander",
        description: "Add 25 transactions via voice",
        xpRequired: 3500,
        isTiered: false,
        icon: "🎤",
        category: "advanced",
        prize: {
          type: "frame" as const,
          id: "frm_triple_rounded",
        },
      },
      {
        name: "Receipt Collector",
        description: "Upload 50 receipts",
        xpRequired: 5500,
        isTiered: false,
        icon: "🧾",
        category: "advanced",
        prize: {
          type: "avatar" as const,
          id: "avat_4",
        },
      },
      {
        name: "Century Club",
        description: "Reach 100 total transactions",
        xpRequired: 8000,
        isTiered: false,
        icon: "💯",
        category: "transactions",
        prize: {
          type: "frame" as const,
          id: "frm_leaf",
          animation: "glow",
        },
      },

      // Expert Achievements
      {
        name: "Consistency Champion",
        description: "Maintain a 30-day login streak",
        xpRequired: 11000,
        isTiered: false,
        icon: "🔥",
        category: "engagement",
        prize: {
          type: "avatar" as const,
          id: "avat_5",
          animation: "flame",
        },
      },
      {
        name: "Financial Guru",
        description: "Reach 500 total transactions",
        xpRequired: 15000,
        isTiered: false,
        icon: "🧙",
        category: "expert",
        prize: {
          type: "avatar" as const,
          id: "avat_6",
          animation: "sparkle",
        },
      },
      {
        name: "Split Bill Legend",
        description: "Create and settle 50 split bills",
        xpRequired: 20000,
        isTiered: false,
        icon: "👑",
        category: "social",
        prize: {
          type: "frame" as const,
          id: "frm_corner_bump",
          animation: "rainbow",
        },
      },

      // Tiered Achievements
      {
        name: "Level 5 Champion",
        description: "Reach Level 5",
        xpRequired: 1000,
        isTiered: true,
        icon: "⭐",
        category: "levels",
        prize: {
          type: "avatar" as const,
          id: "avat_7",
        },
      },
      {
        name: "Level 10 Master",
        description: "Reach Level 10",
        xpRequired: 11000,
        isTiered: true,
        icon: "⭐⭐",
        category: "levels",
        prize: {
          type: "avatar" as const,
          id: "avat_8",
          animation: "pulse",
        },
      },
      {
        name: "Level 15 Legend",
        description: "Reach Level 15",
        xpRequired: 41000,
        isTiered: true,
        icon: "⭐⭐⭐",
        category: "levels",
        prize: {
          type: "frame" as const,
          id: "frm_organic_blob",
          animation: "cosmic",
        },
      },
    ];

    // Insert all achievements
    const results = [];
    for (const achievement of achievements) {
      const id = await ctx.db.insert("achievements", achievement);
      results.push(id);
    }

    return {
      message: `Successfully seeded ${results.length} achievements`,
      ids: results,
    };
  },
});
