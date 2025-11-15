import { AcheivementStats } from "@/components/acheivements/acheivement-stats";
import { AchievementCard } from "@/components/acheivements/achievement-card";
import Layout from "@/components/layout";
import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";

export const Route = createFileRoute("/_private/achievements")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = useQuery(convexQuery(api.achievements.getUserProgress, {}));

  return (
    <Layout title="Achievements">
      <AcheivementStats
        achievements={data?.unlockedAchievements?.length}
        level={data?.currentLevel}
        streak={data?.currentStreak}
        xp={data?.currentXP}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data?.availableAchievements?.map((item) => (
          <AchievementCard
            key={item._id}
            description={item.description}
            icon={item.icon}
            isLocked={item.isLocked}
            name={item.name}
            xp={item.xpRequired}
            price={item.prize?.type}
          />
        ))}
      </div>
    </Layout>
  );
}
