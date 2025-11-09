import Layout from "@/components/layout";
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
  const { data: transactions } = useQuery(
    convexQuery(api.transactions.getTransactions, {})
  );

  const txs = Array.isArray(transactions) ? transactions : [];
  const { totalIncome, totalExpense } = txs.reduce(
    (
      totals: { totalIncome: number; totalExpense: number },
      transaction: { type?: string; amount?: number }
    ) => {
      if (transaction.type === "income") {
        // Assuming 'amount' is the field to sum
        totals.totalIncome += transaction.amount ?? 0;
      } else if (transaction.type === "expense") {
        totals.totalExpense += transaction.amount ?? 0;
      }
      return totals;
    },
    { totalIncome: 0, totalExpense: 0 }
  );

  return (
    <Layout title="Transactions">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TotalTransactionCard type="income" amount={totalIncome} />

        <TotalTransactionCard type="expense" amount={totalExpense} />
      </div>

      <DataTable
        columns={columns}
        data={Array.isArray(transactions) ? transactions : []}
      />

      <AddTransactionsButton />
    </Layout>
  );
}
