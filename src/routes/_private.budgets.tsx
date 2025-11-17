import { AddBudgetsButton } from "@/components/budgets/add-budgets-button";
import { BudgetCard } from "@/components/budgets/budget-card";
import TotalBudgetCard from "@/components/budgets/total-budget-card";
import { EmptyState } from "@/components/empty-state";
import Layout from "@/components/layout";
import { LoadingScreen } from "@/components/loading-screen";
import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";

export const Route = createFileRoute("/_private/budgets")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading } = useQuery(
    convexQuery(api.budgets.getActiveBudgets, {})
  );

  return (
    <Layout title="Budgets">
      {isLoading ? (
        <LoadingScreen title="Loading your budgets..." />
      ) : (
        <>
          <TotalBudgetCard
            totalBudget={data?.totals.totalBudget}
            remaining={data?.totals.totalRemaining}
            totalSpent={data?.totals.totalSpent}
          />

          {data?.budgets?.length === 0 ? (
            <EmptyState
              title="No budgets"
              description="You've not created any budget yet."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data?.budgets.map((budget) => (
                <BudgetCard key={budget._id} data={budget} />
              ))}
            </div>
          )}

          <AddBudgetsButton />
        </>
      )}
    </Layout>
  );
}
