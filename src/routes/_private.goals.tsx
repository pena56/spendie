import Layout from "@/components/layout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/goals")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Layout title="Savings Goals">
      <p className="">Goals Page</p>
    </Layout>
  );
}
