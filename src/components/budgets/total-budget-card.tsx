import { SummaryCard } from "../summary-card";

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
      <SummaryCard
        title="Total Budget"
        amount={totalBudget}
        bgColor="bg-white"
        textColor="text-black"
      />
      <SummaryCard
        title="Total Spent"
        amount={totalSpent}
        bgColor="bg-red-100"
        textColor="text-red-600"
      />
      <SummaryCard
        title="Remaining"
        amount={remaining}
        bgColor="bg-green-100"
        textColor="text-green-600"
      />
    </div>
  );
}
