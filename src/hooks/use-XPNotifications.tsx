import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useXPNotifications() {
  const progress = useQuery(api.achievements.getUserProgress);
  const [lastXP, setLastXP] = useState<number | null>(null);

  useEffect(() => {
    if (progress?.currentXP !== undefined) {
      if (lastXP !== null && progress.currentXP > lastXP) {
        const xpGained = progress.currentXP - lastXP;
        toast.success(`+${xpGained} XP earned! 🎉`);
      }
      setLastXP(progress.currentXP);
    }
  }, [progress?.currentXP]);

  return progress;
}
