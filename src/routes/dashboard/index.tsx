import { Button } from "@/components/ui/button";
import { useAuthActions } from "@convex-dev/auth/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Authenticated } from "convex/react";

export const Route = createFileRoute("/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { signOut } = useAuthActions();

  return (
    <div>
      <Link to="/">Home</Link>

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
