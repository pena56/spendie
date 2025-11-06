import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <div className="min-h-screen">
      Home Page
      <Link to="/auth/login">Login</Link>
      <Link to="/auth/register">Register</Link>
    </div>
  );
}
