import Layout from "@/components/layout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Layout title="Dashboard">
      <p className="">Hey there Champ</p>
    </Layout>
  );
}
