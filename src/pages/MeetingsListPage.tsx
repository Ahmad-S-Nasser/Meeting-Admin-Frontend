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
      <div className="row-between" style={{ marginBottom: 24 }}>
        <h1>Meetings</h1>
        <Link to="/meetings/new">
          <button className="btn-primary">New meeting</button>
        </Link>
      </div>

      {error && <p className="text-error">{error}</p>}
      {!meetings && !error && <p className="text-muted">Loading…</p>}
      {meetings && meetings.length === 0 && <p className="text-muted">No meetings yet.</p>}

      <ul className="list-plain stack">
        {meetings?.map((m) => (
          <li key={m.id}>
            <Link to={`/meetings/${m.id}`} className="card glow-card meeting-row">
              <strong>{m.title}</strong>
              {m.status === "Cancelled" && <span className="badge badge-danger">Cancelled</span>}
              <div className="text-small text-muted">{new Date(m.scheduledAt).toLocaleString()}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
