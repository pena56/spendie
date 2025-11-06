import { Button } from "@/components/ui/button";
import { useAuthActions } from "@convex-dev/auth/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Authenticated } from "convex/react";

export const Route = createFileRoute("/dashboard/")({
  component: RouteComponent,
});

/**
 * Renders the dashboard view with a link to the site root and a Signout button shown only to authenticated users.
 *
 * @returns The React element for the dashboard page. The Signout button invokes `signOut()` when clicked.
 */
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