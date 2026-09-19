import { useEffect, useState, type FormEvent } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { invitesApi, type InvitePreview } from "../api/invites";
import { ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export function AcceptInvitePage() {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const { session, setSession } = useAuth();

  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    invitesApi
      .preview(token)
      .then(setPreview)
      .catch((err) =>
        setLoadError(
          err instanceof ApiError && err.status === 410 ? "This invite has expired." : "This invite link isn't valid.",
        ),
      );
  }, [token]);

  const acceptAsNewUser = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    try {
      const auth = await invitesApi.acceptNew(token, name, password);
      setSession(auth.token, auth);
      navigate("/meetings");
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Couldn't accept this invite.");
    } finally {
      setSubmitting(false);
    }
  };

  const acceptAsLoggedInUser = async () => {
    if (!session) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const auth = await invitesApi.accept(token, session.token);
      setSession(auth.token, auth);
      navigate("/meetings");
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Couldn't accept this invite.");
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

  if (!preview) {
    return (
      <div className="centered-page">
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Join {preview.organizationName}</h1>
        <p className="text-small text-muted">Invited as {preview.email}</p>

        {session ? (
          session.user.email.toLowerCase() === preview.email.toLowerCase() ? (
            <div style={{ marginTop: 20 }}>
              {submitError && <p className="text-error">{submitError}</p>}
              <button className="btn-primary" onClick={acceptAsLoggedInUser} disabled={submitting}>
                {submitting ? "Joining…" : `Accept as ${session.user.name}`}
              </button>
            </div>
          ) : (
            <p style={{ marginTop: 20 }}>
              You're logged in as {session.user.email}, but this invite is for {preview.email}. Log out and accept
              again as that email.
            </p>
          )
        ) : (
          <form onSubmit={acceptAsNewUser} className="stack" style={{ marginTop: 20 }}>
            <input
              className="input-field"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              className="input-field"
              type="password"
              placeholder="Choose a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            {submitError && <p className="text-error">{submitError}</p>}
            <button className="btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Joining…" : "Create account & join"}
            </button>
            <p className="text-small text-muted">
              Already have an account?{" "}
              <Link to="/login" state={{ from: { pathname: `/invites/${token}`, search: "" } }}>
                Log in first
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
