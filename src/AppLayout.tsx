import { Link, Outlet } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";

export function AppLayout() {
  const { session, logout } = useAuth();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 24px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <nav style={{ display: "flex", gap: 16 }}>
          <Link to="/meetings">Meetings</Link>
          <Link to="/org">Organization</Link>
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 14, color: "#64748b" }}>
            {session?.user.name} · {session?.user.organizationName}
          </span>
          <button onClick={logout}>Log out</button>
        </div>
      </header>
      <main style={{ flex: 1, padding: 24 }}>
        <Outlet />
      </main>
    </div>
  );
}
