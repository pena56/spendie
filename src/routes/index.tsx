import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

/**
 * Renders the root application page with navigation links to authentication routes.
 *
 * @returns A JSX element containing the "Home Page" text and links to `/auth/login` and `/auth/register`.
 */
function App() {
  return (
    <div className="min-h-screen">
      Home Page
      <Link to="/auth/login">Login</Link>
      <Link to="/auth/register">Register</Link>
    </div>
  );
}