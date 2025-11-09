import { formatCurrency } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";

interface TotalTransactionCardProps {
  type: "income" | "expense";
  amount?: number;
  changePercent?: number;
}

export function TotalTransactionCard({
  type,
  amount = 0,
  changePercent = 0,
}: TotalTransactionCardProps) {
  const isIncome = type === "income";

  const title = isIncome ? "Income" : "Expense";
  const bgClass = isIncome ? "bg-lime-200" : "bg-pink-200";
  const percentColor = isIncome ? "text-green-700" : "text-red-700";
  const Icon = isIncome ? TrendingUp : TrendingDown;

  return (
    <div
      className={`${bgClass} border-2 border-black rounded-sm p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all`}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-black uppercase tracking-wide">{title}</p>
        <div className="bg-white border-2 border-black rounded-full p-2">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-3xl font-black">{formatCurrency(amount)}</p>
      <p className={`text-sm font-bold ${percentColor}`}>
        {changePercent >= 0 ? `+${changePercent}%` : `${changePercent}%`} from
        last month
      </p>
    </div>
  );
}
