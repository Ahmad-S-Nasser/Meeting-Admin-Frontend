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
    <div>
      <h1>{session?.user.organizationName}</h1>

      <h3 style={{ marginTop: 24 }}>Members</h3>
      {error && <p className="text-error">{error}</p>}
      <ul className="list-plain stack">
        {members?.map((m) => (
          <li key={m.userId} className="card">
            {m.name} <span className="text-muted">({m.email})</span> — {m.role}
          </li>
        ))}
      </ul>

      {isOwner && (
        <>
          <h3 style={{ marginTop: 24 }}>Invite someone</h3>
          <form onSubmit={handleInvite} className="row">
            <input
              className="input-field"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ marginBottom: 0 }}
            />
            <button className="btn-secondary" type="submit" disabled={submitting}>
              {submitting ? "Sending…" : "Invite"}
            </button>
          </form>
          {inviteStatus && <p className="text-small text-muted" style={{ marginTop: 8 }}>{inviteStatus}</p>}
        </>
      )}
    </div>
  );
}
