import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authClient } from "../lib/auth-client.ts";
import { ErrorState, LoadingState } from "./QueryState.tsx";

export function RequireAuth() {
  const session = authClient.useSession();
  const location = useLocation();

  if (session.isPending) return <LoadingState label="Checking your session" />;
  if (session.error)
    return (
      <ErrorState
        message="We could not check your session."
        retry={() => void session.refetch()}
      />
    );
  if (!session.data)
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  return <Outlet />;
}
