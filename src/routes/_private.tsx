import { LoginForm } from "@/components/login-form";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";

function LoadingSpinner() {
  return <div>Loading...</div>;
}

function PrivateLayout() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <Outlet />;
}

export const Route = createFileRoute("/_private")({
  component: PrivateLayout,
});
