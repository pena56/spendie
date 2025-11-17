import { EmptyState } from "@/components/empty-state";
import Layout from "@/components/layout";
import { LoadingScreen } from "@/components/loading-screen";
import { AddSplitsButton } from "@/components/splits/add-splits-button";
import { PendingInvites } from "@/components/splits/pending-invites";
import { SplitCard } from "@/components/splits/split-card";
import { TotalSplitsCard } from "@/components/splits/total-splits-card";
import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";

export const Route = createFileRoute("/_private/splits")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading } = useQuery(
    convexQuery(api.splits.getUserSplits, {})
  );

  return (
    <Layout title="Split Bills">
      {isLoading ? (
        <LoadingScreen title="Loading your split bills..." />
      ) : (
        <>
          <TotalSplitsCard
            completedAmount={data?.completedSettlements}
            pendingAmount={data?.pendingSettlement}
          />

          <PendingInvites invites={data?.pendingInvites} />

          {data?.splits?.length === 0 ? (
            <EmptyState
              title="No split bills"
              description="You've not created any split bills yet."
            />
          ) : (
            <div>
              <h2 className="text-xl font-bold mb-2">Active Split Bills</h2>

              <div className="flex flex-col gap-6">
                {data?.splits?.map((item) => (
                  <SplitCard key={item?.id} data={item} />
                ))}
              </div>
            </div>
          )}

          <AddSplitsButton />
        </>
      )}
    </Layout>
  );
}
