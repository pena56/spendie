import { Link, useRouter } from "@tanstack/react-router";
import { Button } from "../ui/button";
import { FunctionReturnType } from "convex/server";
import { api } from "convex/_generated/api";
import { TransactionCategories } from "@/constants/categories";
import { AmountDisplay } from "../amount-display";
import { EmptyState } from "../empty-state";

interface RecentTransactionsProps {
  data?: FunctionReturnType<
    typeof api.dashboard.getDashboardData
  >["transactions"];
}

export default function RecentTransactions({ data }: RecentTransactionsProps) {
  const router = useRouter();

  return (
    <div className="border-2 border-black rounded-sm p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-black text-xl">Recent Transactions</p>

        {data && data?.length > 0 && (
          <Link to="/transactions">
            <Button variant={"link"}>View all</Button>
          </Link>
        )}
      </div>

      <div className="flex flex-col space-y-2">
        {data?.length === 0 ? (
          <EmptyState
            btnLabel="Add Transaction"
            description="No recent transactions available"
            title="No transaction"
            onBtnClick={() => router.navigate({ to: "/transactions" })}
          />
        ) : (
          data?.map((item) => (
            <RecentTransactionCard key={item._id} data={item} />
          ))
        )}
      </div>
    </div>
  );
}

interface RecentTransactionCardProps {
  data?: FunctionReturnType<
    typeof api.dashboard.getDashboardData
  >["transactions"][0];
}

function RecentTransactionCard({ data }: RecentTransactionCardProps) {
  if (!data) return null;

  const category = TransactionCategories.find(
    (item) => item.name === data.category
  );

  return (
    <div className="flex items-center gap-4 p-2 bg-gray-50 rounded-sm border-2 border-gray-200 hover:border-black transition-colors">
      <div
        className={`w-10 h-10 ${category?.color} border-2 border-black rounded-sm flex items-center justify-center font-black text-base`}
      >
        {category && <category.icon />}
      </div>
      <div className="flex-1">
        <p className="font-bold">{data.description}</p>
        <p className="text-sm text-gray-600 font-semibold">{data.category}</p>
      </div>
      <p
        className={`text-lg font-black ${
          data.type === "income" ? "text-green-600" : "text-red-600"
        }`}
      >
        <AmountDisplay amount={data.amount} />
      </p>
    </div>
  );
}
