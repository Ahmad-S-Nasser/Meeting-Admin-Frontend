import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "react-router-dom";
import { CallRoom } from "coon-meeting-sdk";
import { guestApi, type GuestJoinPreview } from "../api/guest";
import { ApiError } from "../api/client";
import { downloadRecording } from "../utils/downloadRecording";

const COON_MEETING_API_BASE_URL = import.meta.env.VITE_COON_MEETING_API_BASE_URL;

// Fully anonymous - no AuthContext/RequireAuth here at all. Never renders isHost/kick/block -
// a guest is never this SDK's notion of a host.
export function GuestJoinPage() {
  const { token = "" } = useParams();

  const [preview, setPreview] = useState<GuestJoinPreview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [participantToken, setParticipantToken] = useState<string | null>(null);
  const [permissions, setPermissions] = useState({ canShareScreen: false, canRecord: false });

  useEffect(() => {
    guestApi
      .preview(token)
      .then((p) => {
        setPreview(p);
        if (p.prefilledName) setName(p.prefilledName);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 410) setLoadError("This invite has expired.");
        else if (err instanceof ApiError && err.status === 403) setLoadError("This meeting is no longer open to anyone with the link.");
        else setLoadError("This link isn't valid.");
      });
  }, [token]);

  const handleJoin = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    try {
      const result = await guestApi.mintToken(token, name);
      setPermissions({ canShareScreen: result.canShareScreen, canRecord: result.canRecord });
      setParticipantToken(result.token);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Couldn't join this call.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadError) {
    return (
      <div className="centered-page">
        <p>{loadError}</p>
      </div>
    );
  }

  if (participantToken && preview) {
    return (
      <div style={{ height: "100vh", background: "var(--bg-dark)", color: "var(--text-main)" }}>
        <CallRoom
          apiBaseUrl={COON_MEETING_API_BASE_URL}
          meetingId={preview.meetingId}
          participantToken={participantToken}
          participantName={name}
          onRecordingAvailable={downloadRecording}
          canShareScreen={permissions.canShareScreen}
          canRecord={permissions.canRecord}
          // An "Any" link is a reusable, anyone-can-join link, so handing out this very page is
          // exactly what "invite someone" means. A per-guest (Attendee) link is a personal 24h
          // token - sharing it would let someone else join AS this guest - so no button there.
          getInviteLink={preview.scope === "Any" ? () => window.location.href : undefined}
        />
      </div>
    );
  }

  if (!preview) {
    return (
      <div className="centered-page">
        <p className="text-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>{preview.meetingTitle}</h1>
        <p className="text-small text-muted">You're joining as a guest.</p>
        <form onSubmit={handleJoin} className="stack" style={{ marginTop: 20 }}>
          <input
            className="input-field"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          {submitError && <p className="text-error">{submitError}</p>}
          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Joining…" : "Join call"}
          </button>
        </form>
      </div>
    </div>
  );
}
