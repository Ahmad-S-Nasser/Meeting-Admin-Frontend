import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CallRoom } from "coon-meeting-sdk";
import { meetingsApi, type Meeting } from "../api/meetings";
import { ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { downloadRecording } from "../utils/downloadRecording";

const COON_MEETING_API_BASE_URL = import.meta.env.VITE_COON_MEETING_API_BASE_URL;

export function CallPage() {
  const { id = "" } = useParams();
  const { session } = useAuth();
  const navigate = useNavigate();

  const [participantToken, setParticipantToken] = useState<string | null>(null);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState({ canShareScreen: false, canRecord: false });

  useEffect(() => {
    if (!session) return;
    Promise.all([meetingsApi.callToken(id, session.token), meetingsApi.get(id, session.token)])
      .then(([tokenRes, meetingRes]) => {
        setParticipantToken(tokenRes.token);
        setMeeting(meetingRes);
        setPermissions({ canShareScreen: tokenRes.canShareScreen, canRecord: tokenRes.canRecord });
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't join this call."));
  }, [id, session]);

  // The organizer can change who may share/record while a call is running - re-check so it
  // reaches people already in it (the call screen hides the buttons and stops a running
  // share/recording the moment a permission is withdrawn).
  useEffect(() => {
    if (!session || !participantToken) return;
    const timer = setInterval(() => {
      meetingsApi
        .myPermissions(id, session.token)
        .then((p) => setPermissions({ canShareScreen: p.canShareScreen, canRecord: p.canRecord }))
        .catch(() => { /* keep the last known permissions - a blip shouldn't strip anyone's controls */ });
    }, 30_000);
    return () => clearInterval(timer);
  }, [id, session, participantToken]);

  if (error) {
    return (
      <div className="centered-page" style={{ flexDirection: "column", gap: 12 }}>
        <p className="text-error">{error}</p>
        <button className="btn-secondary" onClick={() => navigate(`/meetings/${id}`)}>
          Back
        </button>
      </div>
    );
  }

  if (!participantToken || !meeting || !session) {
    return <div className="centered-page text-muted">Joining call…</div>;
  }

  return (
    <div style={{ height: "100vh", background: "var(--bg-dark)", color: "var(--text-main)" }}>
      <CallRoom
        apiBaseUrl={COON_MEETING_API_BASE_URL}
        meetingId={id}
        participantToken={participantToken}
        participantName={session.user.name}
        onLeave={() => navigate(`/meetings/${id}`)}
        isHost={meeting.isOrganizer}
        onKickParticipant={(participantId) => {
          meetingsApi.kickParticipant(id, participantId, session.token).catch(() => {
            // Best-effort from the UI's perspective - the participant's own tile clears
            // itself once the hub broadcasts ParticipantLeft regardless.
          });
        }}
        onBlockParticipant={(participantId) => {
          meetingsApi.blockParticipant(id, participantId, session.token).catch(() => {});
        }}
        onRecordingAvailable={downloadRecording}
        canShareScreen={permissions.canShareScreen}
        canRecord={permissions.canRecord}
        getInviteLink={() => meetingsApi.inviteLink(id, session.token).then((r) => r.url)}
      />
    </div>
  );
}
