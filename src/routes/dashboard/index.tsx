import { Button } from "@/components/ui/button";
import { useAuthActions } from "@convex-dev/auth/react";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { Authenticated } from "convex/react";

export const Route = createFileRoute("/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { signOut } = useAuthActions();
  const { data: user } = useSuspenseQuery(
    convexQuery(api.user.getCurrentUser, {})
  );

  return (
    <div className="flex flex-col space-y-4">
      <Link to="/">Home</Link>

      <p className="">Welcome {user?.name}</p>

      <Authenticated>
        <Button
          size="sm"
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => void signOut()}
        >
          Signout
        </Button>
      </Authenticated>
    </div>
  );
}
