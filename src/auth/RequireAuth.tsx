import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function RequireAuth() {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p>Loading…</p>;
  if (!session) return <Navigate to="/login" state={{ from: location }} replace />;

  return <Outlet />;
}
