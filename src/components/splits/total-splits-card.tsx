import { SummaryCard } from "../summary-card";

interface TotalSplitsCardProps {
  pendingAmount?: number;
  completedAmount?: number;
}

export function TotalSplitsCard({
  completedAmount,
  pendingAmount,
}: TotalSplitsCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SummaryCard
        bgColor="bg-yellow-200"
        textColor="text-red-600"
        title="Pending Splits"
        amount={pendingAmount}
      />
      <SummaryCard
        bgColor="bg-lime-200"
        textColor="text-green-600"
        title="Completed Splits"
        amount={completedAmount}
      />
    </div>
  );
}
