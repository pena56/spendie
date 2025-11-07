import Layout from "@/components/layout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/transactions")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Layout title="Transactions">
      <p className="">Transaction page</p>
    </Layout>
  );
}
