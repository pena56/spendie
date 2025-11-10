import BudgetsOverview from "@/components/dashboard/budgets-overview";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import Layout from "@/components/layout";
import { getDailyGreeting } from "@/constants/greetings";
import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";

export const Route = createFileRoute("/_private/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const greeting = getDailyGreeting();

  const { data } = useQuery(convexQuery(api.dashboard.getDashboard, {}));

  return (
    <Layout title="Dashboard">
      <div>
        <p className="font-black text-2xl">{greeting.greeting}</p>
        <p className="font-semibold">{greeting.motivation}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
        <RecentTransactions data={data?.transactions} />

        <BudgetsOverview data={data?.budgets} />
      </div>
    </Layout>
  );
}
