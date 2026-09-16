import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "react-router-dom";
import { CallRoom } from "coon-meeting-sdk";
import { guestApi, type GuestJoinPreview } from "../api/guest";
import { ApiError } from "../api/client";

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
      setParticipantToken(result.token);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Couldn't join this call.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadError) {
    return (
      <div style={{ maxWidth: 360, margin: "80px auto", fontFamily: "system-ui, sans-serif" }}>
        <p>{loadError}</p>
      </div>
    );
  }

  if (participantToken && preview) {
    return (
      <div style={{ height: "100vh", background: "#0f172a", color: "white" }}>
        <CallRoom
          apiBaseUrl={COON_MEETING_API_BASE_URL}
          meetingId={preview.meetingId}
          participantToken={participantToken}
          participantName={name}
        />
      </div>
    );
  }

  if (!preview) {
    return (
      <div style={{ maxWidth: 360, margin: "80px auto", fontFamily: "system-ui, sans-serif" }}>
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 360, margin: "80px auto", fontFamily: "system-ui, sans-serif" }}>
      <h1>{preview.meetingTitle}</h1>
      <form onSubmit={handleJoin} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
        {submitError && <p style={{ color: "#b91c1c", fontSize: 14 }}>{submitError}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? "Joining…" : "Join call"}
        </button>
      </form>
    </div>
  );
}
