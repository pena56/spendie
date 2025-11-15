import Layout from "@/components/layout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/achievements")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Layout title="Achievements">Hello "/_private/achievements"!</Layout>;
}
