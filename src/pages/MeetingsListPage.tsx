import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { meetingsApi, type Meeting } from "../api/meetings";
import { useAuth } from "../auth/AuthContext";

export function MeetingsListPage() {
  const { session } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    meetingsApi
      .list(session.token)
      .then(setMeetings)
      .catch(() => setError("Couldn't load meetings."));
  }, [session]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1>Meetings</h1>
        <Link to="/meetings/new">
          <button>New meeting</button>
        </Link>
      </div>

      {error && <p style={{ color: "#b91c1c" }}>{error}</p>}
      {!meetings && !error && <p>Loading…</p>}
      {meetings && meetings.length === 0 && <p>No meetings yet.</p>}

      <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        {meetings?.map((m) => (
          <li key={m.id}>
            <Link
              to={`/meetings/${m.id}`}
              style={{
                display: "block",
                padding: 12,
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <strong>{m.title}</strong>
              {m.status === "Cancelled" && <span style={{ marginLeft: 8, color: "#b91c1c", fontSize: 12 }}>Cancelled</span>}
              <div style={{ fontSize: 13, color: "#64748b" }}>{new Date(m.scheduledAt).toLocaleString()}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
