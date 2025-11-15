import { Lock } from "lucide-react";

interface AchievementCardProps {
  isLocked?: boolean;
  icon?: string;
  name?: string;
  description?: string;
  xp?: number;
  price?: string;
}

export function AchievementCard({
  isLocked,
  icon,
  name,
  description,
  xp,
  price,
}: AchievementCardProps) {
  return (
    <div
      className={`border-2 border-black rounded-sm p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
        !isLocked
          ? "bg-linear-to-br from-yellow-200 via-pink-200 to-cyan-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          : "bg-gray-100 opacity-75"
      }`}
    >
      <div className="text-center">
        <div className="relative inline-block mb-4">
          <div
            className={`w-20 h-20 ${
              !isLocked ? "bg-white" : "bg-gray-300"
            } border-3 border-black rounded-full flex items-center justify-center text-5xl`}
          >
            {!isLocked ? icon : <Lock className="w-8 h-8 text-gray-500" />}
          </div>
          {!isLocked && (
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-300 border-2 border-black rounded-full flex items-center justify-center text-lg">
              ✓
            </div>
          )}
        </div>
        <h3 className="text-xl font-black mb-2">{name}</h3>
        <p className="text-sm font-bold text-gray-700 mb-3">{description}</p>
        <div className="flex items-center justify-center gap-2">
          <span className="bg-white border-2 border-black rounded-lg px-3 py-1 text-xs font-black">
            {xp} XP
          </span>
        </div>
        {price && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="bg-white border-2 border-black rounded-lg px-3 py-1 text-xs font-black">
              + New {price === "frame" ? "Frame" : "Avatar"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
