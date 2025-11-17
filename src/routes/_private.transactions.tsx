import Layout from "@/components/layout";
import { LoadingScreen } from "@/components/loading-screen";
import { AddTransactionsButton } from "@/components/transactions/add-transactions-button";
import { columns } from "@/components/transactions/columns";
import { DataTable } from "@/components/transactions/data-table";
import { TotalTransactionCard } from "@/components/transactions/total-transaction-card";
import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";

export const Route = createFileRoute("/_private/transactions")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: transactions, isLoading } = useQuery(
    convexQuery(api.transactions.getTransactions, {})
  );

  return (
    <Layout title="Transactions">
      {isLoading ? (
        <LoadingScreen title="Loading your transactions..." />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TotalTransactionCard
              type="income"
              amount={transactions?.income.total}
              changePercent={transactions?.income.change}
            />

            <TotalTransactionCard
              type="expense"
              amount={transactions?.expenses.total}
              changePercent={transactions?.expenses.change}
            />
          </div>

          <DataTable
            columns={columns}
            data={transactions?.transactions || []}
          />

          <AddTransactionsButton />
        </>
      )}
    </Layout>
  );
}
