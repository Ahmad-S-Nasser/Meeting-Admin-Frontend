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
    <div>
      <h1>New meeting</h1>
      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        <div className="field">
          <label className="field-label">Title</label>
          <input className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="field">
          <label className="field-label">Date &amp; time</label>
          <input
            className="input-field"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label className="field-label">Duration (minutes)</label>
          <input
            className="input-field"
            type="number"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            min={5}
          />
        </div>
        <div className="field">
          <label className="field-label">Attendee emails (comma-separated)</label>
          <input
            className="input-field"
            value={attendeesText}
            onChange={(e) => setAttendeesText(e.target.value)}
            placeholder="alice@example.com, bob@example.com"
          />
        </div>
        <fieldset className="field-group">
          <legend>Who can join</legend>
          <label className="radio-option">
            <input type="radio" name="visibility" checked={visibility === "Private"} onChange={() => setVisibility("Private")} />
            <span>
              <strong>Private</strong> — only the attendees above (or org members you invite later) can join.
            </span>
          </label>
          <label className="radio-option" style={{ marginBottom: 0 }}>
            <input type="radio" name="visibility" checked={visibility === "Any"} onChange={() => setVisibility("Any")} />
            <span>
              <strong>Any</strong> — literally anyone with the meeting's link can join, no account needed.
            </span>
          </label>
        </fieldset>
        {error && <p className="text-error">{error}</p>}
        <button className="btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Creating…" : "Create meeting"}
        </button>
      </form>
    </div>
  );
}
