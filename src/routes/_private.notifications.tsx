import Layout from "@/components/layout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/notifications")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Layout title="Notifications">
      <p className="">Notification</p>
    </Layout>
  );
}
