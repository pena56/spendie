interface AchievementStatsProps {
  level?: number;
  xp?: number;
  achievements?: number;
  streak?: number;
}

export function AcheivementStats({
  achievements,
  level,
  streak,
  xp,
}: AchievementStatsProps) {
  return (
    <div className="grid grid-col-1 md:grid-cols-4 gap-4">
      <div className="bg-yellow-200 border-2 border-black rounded-sm p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center">
        <p className="text-4xl font-black">{level}</p>
        <p className="text-sm font-black uppercase tracking-wide">Level</p>
      </div>
      <div className="bg-lime-200 border-2 border-black rounded-sm p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center">
        <p className="text-4xl font-black">{xp}</p>
        <p className="text-sm font-black uppercase tracking-wide">Total XP</p>
      </div>
      <div className="bg-pink-200 border-2 border-black rounded-sm p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center">
        <p className="text-4xl font-black">{achievements}</p>
        <p className="text-sm font-black uppercase tracking-wide">
          Achievements
        </p>
      </div>
      <div className="bg-cyan-200 border-2 border-black rounded-sm p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center">
        <p className="text-4xl font-black">{streak}</p>
        <p className="text-sm font-black uppercase tracking-wide">Day Streak</p>
      </div>
    </div>
  );
}
