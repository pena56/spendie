import BudgetsOverview from "@/components/dashboard/budgets-overview";
import { InsightCards } from "@/components/dashboard/insight-card";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import Layout from "@/components/layout";
import { LoadingScreen } from "@/components/loading-screen";
import { Button } from "@/components/ui/button";
import { EncryptedText } from "@/components/ui/encrypted-text";
import { Progress } from "@/components/ui/progress";
import { getDailyGreeting } from "@/constants/greetings";
import { showErrorMessage } from "@/lib/utils";
import {
  convexAction,
  convexQuery,
  useConvexMutation,
} from "@convex-dev/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { Bot } from "lucide-react";

export const Route = createFileRoute("/_private/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const greeting = getDailyGreeting();

  const { data, isLoading } = useQuery(
    convexAction(api.dashboard.getDashboardData, {})
  );

  const { data: insightStatus } = useQuery(
    convexQuery(api.workflows.insights.getCurrentInsightStatus, {})
  );

  const { data: insights } = useQuery(
    convexQuery(api.workflows.insights.getActiveInsights, {})
  );

  const { mutate: generateInsight, isPending } = useMutation({
    mutationFn: useConvexMutation(
      api.workflows.insights.startInsightGeneration
    ),
    onError: (err) => {
      showErrorMessage(err);
    },
  });

  return (
    <Layout title="Dashboard">
      {isLoading ? (
        <LoadingScreen title="Loading your dashboard..." />
      ) : (
        <>
          <div>
            <p className="font-black text-2xl">{greeting.greeting}</p>
            <p className="font-semibold">{greeting.motivation}</p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              {insightStatus && insightStatus?.progress > 0 && (
                <div className="flex flex-col gap-2 w-full">
                  <EncryptedText
                    text={`${insightStatus.status}`}
                    encryptedClassName="text-black"
                    revealedClassName="text-black font-black"
                    revealDelayMs={50}
                  />

                  {insightStatus.progress < 100 ? (
                    <Progress value={insightStatus.progress} />
                  ) : null}
                </div>
              )}
            </div>

            <Button
              onClick={() => generateInsight({})}
              disabled={
                (insightStatus?.progress &&
                  insightStatus?.progress > 0 &&
                  insightStatus?.progress &&
                  insightStatus?.progress < 100) ||
                data?.transactions?.length === 0
                  ? true
                  : false
              }
              isLoading={isPending}
              className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5"
            >
              <Bot
                className={
                  insightStatus?.progress &&
                  insightStatus?.progress > 0 &&
                  insightStatus?.progress &&
                  insightStatus?.progress < 100
                    ? "animate-bounce"
                    : ""
                }
              />
              Generate Smart Insights
            </Button>
          </div>

          <InsightCards data={insights} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
            <RecentTransactions data={data?.transactions} />

            <BudgetsOverview data={data?.budgets} />
          </div>
        </>
      )}
    </Layout>
  );
}
