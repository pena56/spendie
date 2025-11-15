import { api } from "convex/_generated/api";
import { FunctionReturnType } from "convex/server";
import { BotMessageSquare } from "lucide-react";

interface InsightCardProps {
  data?: FunctionReturnType<
    typeof api.dashboard.getDashboardData
  >["insights"]["insights"];
}

export function InsightCards({ data }: InsightCardProps) {
  if (!data) return null;

  const bgColors = ["bg-lime-300", "bg-cyan-300", "bg-indigo-300"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
      {data?.slice(0, 3)?.map((item, index) => (
        <div
          key={index}
          className={`${bgColors[index]} border-2 border-black rounded-sm p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`}
        >
          <div className="bg-white border-2 border-black rounded-full w-8 h-8 flex items-center justify-center mb-2">
            <BotMessageSquare className="w-5 h-5" />
          </div>

          <p className="text-xl font-black uppercase tracking-wide">
            {item.title}
          </p>

          <p className="text-sm font-black">{item.description}</p>
        </div>
      ))}
    </div>
  );
}
