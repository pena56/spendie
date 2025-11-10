import { formatCurrency } from "@/lib/utils";

interface BudgetCardProps {
  title: string;
  amount?: number;
  bgColor: string;
  textColor: string;
}

const BudgetCard: React.FC<BudgetCardProps> = ({
  title,
  amount = 0,
  bgColor,
  textColor,
}) => {
  return (
    <div
      className={`${bgColor} border-2 border-black rounded-sm p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`}
    >
      <p className="text-sm font-black uppercase tracking-wide mb-2 text-gray-600">
        {title}
      </p>
      <p className={`text-2xl font-black ${textColor}`}>
        {formatCurrency(amount)}
      </p>
    </div>
  );
};

export default function TotalBudgetCard({
  totalBudget,
  totalSpent,
  remaining,
}: {
  totalBudget?: number;
  totalSpent?: number;
  remaining?: number;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <BudgetCard
        title="Total Budget"
        amount={totalBudget}
        bgColor="bg-white"
        textColor="text-black"
      />
      <BudgetCard
        title="Total Spent"
        amount={totalSpent}
        bgColor="bg-red-100"
        textColor="text-red-600"
      />
      <BudgetCard
        title="Remaining"
        amount={remaining}
        bgColor="bg-green-100"
        textColor="text-green-600"
      />
    </div>
  );
}
