import { Link, Outlet } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";

export function AppLayout() {
  const { session, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-header">
        <nav className="app-nav">
          <Link to="/meetings">Meetings</Link>
          <Link to="/org">Organization</Link>
        </nav>
        <div className="row">
          <span className="text-muted text-small">
            {session?.user.name} · {session?.user.organizationName}
          </span>
          <button className="btn-secondary" onClick={logout}>
            Log out
          </button>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
