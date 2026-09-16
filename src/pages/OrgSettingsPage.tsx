import { useEffect, useState, type FormEvent } from "react";
import { orgApi, type OrgMember } from "../api/org";
import { ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export function OrgSettingsPage() {
  const { session } = useAuth();
  const [members, setMembers] = useState<OrgMember[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [inviteStatus, setInviteStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isOwner = session?.user.role === "Owner";

  useEffect(() => {
    if (!session) return;
    orgApi
      .members(session.token)
      .then(setMembers)
      .catch(() => setError("Couldn't load organization members."));
  }, [session]);

  const handleInvite = async (e: FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setInviteStatus(null);
    setSubmitting(true);
    try {
      await orgApi.invite(email, session.token);
      setInviteStatus(`Invite sent to ${email}.`);
      setEmail("");
    } catch (err) {
      setInviteStatus(err instanceof ApiError ? err.message : "Couldn't send the invite.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 480 }}>
      <h1>{session?.user.organizationName}</h1>

      <h3>Members</h3>
      {error && <p style={{ color: "#b91c1c" }}>{error}</p>}
      <ul>
        {members?.map((m) => (
          <li key={m.userId}>
            {m.name} ({m.email}) — {m.role}
          </li>
        ))}
      </ul>

      {isOwner && (
        <>
          <h3>Invite someone</h3>
          <form onSubmit={handleInvite} style={{ display: "flex", gap: 8 }}>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button type="submit" disabled={submitting}>
              {submitting ? "Sending…" : "Invite"}
            </button>
          </form>
          {inviteStatus && <p style={{ fontSize: 14 }}>{inviteStatus}</p>}
        </>
      )}
    </div>
  );
}
