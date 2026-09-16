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

  if (error) return <p style={{ color: "#b91c1c" }}>{error}</p>;
  if (!meeting) return <p>Loading…</p>;

  return (
    <div style={{ maxWidth: 480 }}>
      <Link to="/meetings">&larr; Back to meetings</Link>
      <h1>{meeting.title}</h1>
      {meeting.status === "Cancelled" && <p style={{ color: "#b91c1c" }}>Cancelled</p>}
      <p>
        {new Date(meeting.scheduledAt).toLocaleString()}
        {meeting.durationMinutes ? ` · ${meeting.durationMinutes} min` : ""}
      </p>
      {meeting.description && <p>{meeting.description}</p>}

      <h3>Attendees</h3>
      <ul>
        {meeting.attendees.map((a, i) => (
          <li key={i}>
            {a.name}
            {a.email ? ` (${a.email})` : ""}
          </li>
        ))}
      </ul>

      {/* Unblocking only makes sense outside an active call - there's nothing live to
          reconnect them to mid-call, so this lives here rather than on the call page. */}
      {meeting.isOrganizer && meeting.blockedParticipants.length > 0 && (
        <>
          <h3>Blocked</h3>
          <ul>
            {meeting.blockedParticipants.map((b) => (
              <li key={b.participantExternalId}>
                {b.name}
                {b.email && b.email !== b.name ? ` (${b.email})` : ""}{" "}
                <button onClick={() => handleUnblock(b.participantExternalId)} disabled={busy}>
                  Unblock
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {meeting.isOrganizer && meeting.status !== "Cancelled" && (
        <>
          <h3>Invite someone</h3>
          {meeting.visibility === "Any" ? (
            <div>
              <button onClick={handleGetAnyLink}>Get shareable link</button>
              {anyLinkUrl && (
                <p style={{ fontSize: 14, wordBreak: "break-all" }}>
                  Anyone with this link can join: <br />
                  <code>{anyLinkUrl}</code>
                </p>
              )}
            </div>
          ) : (
            <form onSubmit={handleInviteGuest} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input type="email" placeholder="Email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} required />
              <input placeholder="Name (optional)" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
              <button type="submit">Invite</button>
            </form>
          )}
          {inviteStatus && <p style={{ fontSize: 14 }}>{inviteStatus}</p>}
        </>
      )}

      {meeting.status !== "Cancelled" && (
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <button onClick={() => navigate(`/meetings/${id}/call`)}>Join call</button>
          <button onClick={handleCancel} disabled={busy}>
            {busy ? "Cancelling…" : "Cancel meeting"}
          </button>
        </div>
      )}
    </div>
  );
}
