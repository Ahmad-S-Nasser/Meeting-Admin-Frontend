import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../api/auth";
import { ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { setSession } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const auth = await authApi.signup(email, password, name, organizationName);
      setSession(auth.token, auth);
      navigate("/meetings");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Signup failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 360, margin: "80px auto", fontFamily: "system-ui, sans-serif" }}>
      <h1>Create your organization</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input
          placeholder="Organization name"
          value={organizationName}
          onChange={(e) => setOrganizationName(e.target.value)}
          required
        />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        {error && <p style={{ color: "#b91c1c", fontSize: 14 }}>{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? "Creating…" : "Create account"}
        </button>
      </form>
      <p style={{ marginTop: 16, fontSize: 14 }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
