import Layout from "@/components/layout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/budgets")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Layout title="Budgets">
      <p className="">Budgets Page</p>
    </Layout>
  );
}
