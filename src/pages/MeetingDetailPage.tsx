import { useEffect, useState, type FormEvent } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { meetingsApi, type Meeting } from "../api/meetings";
import { ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export function MeetingDetailPage() {
  const { id = "" } = useParams();
  const { session } = useAuth();
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [anyLinkUrl, setAnyLinkUrl] = useState<string | null>(null);
  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [inviteStatus, setInviteStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    meetingsApi
      .get(id, session.token)
      .then(setMeeting)
      .catch(() => setError("Couldn't load this meeting."));
  }, [id, session]);

  const handleCancel = async () => {
    if (!session || !window.confirm("Cancel this meeting?")) return;
    setBusy(true);
    try {
      await meetingsApi.cancel(id, session.token);
      setMeeting(await meetingsApi.get(id, session.token));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't cancel this meeting.");
    } finally {
      setBusy(false);
    }
  };

  const handleUnblock = async (participantExternalId: string) => {
    if (!session) return;
    setBusy(true);
    try {
      await meetingsApi.unblockParticipant(id, participantExternalId, session.token);
      setMeeting(await meetingsApi.get(id, session.token));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't unblock this participant.");
    } finally {
      setBusy(false);
    }
  };

  const handleGetAnyLink = async () => {
    if (!session) return;
    setInviteStatus(null);
    try {
      const { url } = await meetingsApi.getOrCreateAnyJoinLink(id, session.token);
      setAnyLinkUrl(url);
    } catch (err) {
      setInviteStatus(err instanceof ApiError ? err.message : "Couldn't create a link.");
    }
  };

  const handleInviteGuest = async (e: FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setInviteStatus(null);
    try {
      const { url } = await meetingsApi.inviteGuest(id, guestEmail, guestName || undefined, session.token);
      setInviteStatus(`Invite sent to ${guestEmail}. Link: ${url}`);
      setGuestEmail("");
      setGuestName("");
    } catch (err) {
      setInviteStatus(err instanceof ApiError ? err.message : "Couldn't send the invite.");
    }
  };

  if (error) return <p className="text-error">{error}</p>;
  if (!meeting) return <p className="text-muted">Loading…</p>;

  return (
    <div>
      <Link to="/meetings">&larr; Back to meetings</Link>
      <div style={{ marginTop: 12 }}>
        <h1>
          {meeting.title}
          {meeting.status === "Cancelled" && <span className="badge badge-danger">Cancelled</span>}
        </h1>
        <p className="text-muted">
          {new Date(meeting.scheduledAt).toLocaleString()}
          {meeting.durationMinutes ? ` · ${meeting.durationMinutes} min` : ""}
        </p>
        {meeting.description && <p>{meeting.description}</p>}
      </div>

      <h3 style={{ marginTop: 24 }}>Attendees</h3>
      <ul className="list-plain stack">
        {meeting.attendees.map((a, i) => (
          <li key={i} className="card">
            {a.name}
            {a.email ? <span className="text-muted"> ({a.email})</span> : ""}
          </li>
        ))}
      </ul>

      {/* Unblocking only makes sense outside an active call - there's nothing live to
          reconnect them to mid-call, so this lives here rather than on the call page. */}
      {meeting.isOrganizer && meeting.blockedParticipants.length > 0 && (
        <>
          <h3 style={{ marginTop: 24 }}>Blocked</h3>
          <ul className="list-plain stack">
            {meeting.blockedParticipants.map((b) => (
              <li key={b.participantExternalId} className="card row-between">
                <span>
                  {b.name}
                  {b.email && b.email !== b.name ? <span className="text-muted"> ({b.email})</span> : ""}
                </span>
                <button className="btn-secondary" onClick={() => handleUnblock(b.participantExternalId)} disabled={busy}>
                  Unblock
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {meeting.isOrganizer && meeting.status !== "Cancelled" && (
        <>
          <h3 style={{ marginTop: 24 }}>Invite someone</h3>
          {meeting.visibility === "Any" ? (
            <div>
              <button className="btn-secondary" onClick={handleGetAnyLink}>
                Get shareable link
              </button>
              {anyLinkUrl && (
                <p className="text-small card" style={{ wordBreak: "break-all", marginTop: 12 }}>
                  Anyone with this link can join: <br />
                  <code>{anyLinkUrl}</code>
                </p>
              )}
            </div>
          ) : (
            <form onSubmit={handleInviteGuest} className="row" style={{ flexWrap: "wrap" }}>
              <input
                className="input-field"
                type="email"
                placeholder="Email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                required
                style={{ marginBottom: 0, flex: "1 1 200px" }}
              />
              <input
                className="input-field"
                placeholder="Name (optional)"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                style={{ marginBottom: 0, flex: "1 1 160px" }}
              />
              <button className="btn-secondary" type="submit">
                Invite
              </button>
            </form>
          )}
          {inviteStatus && <p className="text-small text-muted" style={{ marginTop: 8 }}>{inviteStatus}</p>}
        </>
      )}

      {meeting.status !== "Cancelled" && (
        <div className="row" style={{ marginTop: 24 }}>
          <button className="btn-primary" onClick={() => navigate(`/meetings/${id}/call`)}>
            Join call
          </button>
          <button className="btn-danger" onClick={handleCancel} disabled={busy}>
            {busy ? "Cancelling…" : "Cancel meeting"}
          </button>
        </div>
      )}
    </div>
  );
}
