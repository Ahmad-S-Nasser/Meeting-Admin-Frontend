import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { meetingsApi, type MeetingVisibility } from "../api/meetings";
import { ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export function NewMeetingPage() {
  const { session } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [attendeesText, setAttendeesText] = useState("");
  const [visibility, setVisibility] = useState<MeetingVisibility>("Private");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setError(null);
    setSubmitting(true);

    const attendees = attendeesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((email) => ({ email }));

    try {
      const meeting = await meetingsApi.create(
        {
          title,
          scheduledAt: new Date(scheduledAt).toISOString(),
          durationMinutes,
          visibility,
          attendees,
        },
        session.token,
      );
      navigate(`/meetings/${meeting.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create the meeting.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 480 }}>
      <h1>New meeting</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required style={{ display: "block", width: "100%" }} />
        </label>
        <label>
          Date &amp; time
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            required
            style={{ display: "block", width: "100%" }}
          />
        </label>
        <label>
          Duration (minutes)
          <input
            type="number"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            min={5}
            style={{ display: "block", width: "100%" }}
          />
        </label>
        <label>
          Attendee emails (comma-separated)
          <input
            value={attendeesText}
            onChange={(e) => setAttendeesText(e.target.value)}
            placeholder="alice@example.com, bob@example.com"
            style={{ display: "block", width: "100%" }}
          />
        </label>
        <fieldset style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 12 }}>
          <legend style={{ fontSize: 13, color: "#64748b" }}>Who can join</legend>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
            <input type="radio" name="visibility" checked={visibility === "Private"} onChange={() => setVisibility("Private")} />
            <span>
              <strong>Private</strong> — only the attendees above (or org members you invite later) can join.
            </span>
          </label>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <input type="radio" name="visibility" checked={visibility === "Any"} onChange={() => setVisibility("Any")} />
            <span>
              <strong>Any</strong> — literally anyone with the meeting's link can join, no account needed.
            </span>
          </label>
        </fieldset>
        {error && <p style={{ color: "#b91c1c", fontSize: 14 }}>{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? "Creating…" : "Create meeting"}
        </button>
      </form>
    </div>
  );
}
