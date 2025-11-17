import { LoadingScreen } from "@/components/loading-screen";
import { LoginForm } from "@/components/login-form";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useConvexAuth, useMutation } from "convex/react";
import { useEffect } from "react";

function PrivateLayout() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  const updateActivity = useMutation(api.user.updateLastActivity);

  useEffect(() => {
    if (isAuthenticated) {
      updateActivity();
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return <LoadingScreen hideTips={false} />;
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <Outlet />;
}

export const Route = createFileRoute("/_private")({
  component: PrivateLayout,
});
