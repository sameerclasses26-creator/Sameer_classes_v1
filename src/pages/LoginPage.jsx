import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const loggedInUser = await login(formData);
      navigate(loggedInUser.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Welcome back</h1>
        <p>Login to access the student dashboard.</p>
        <input
          name="email"
          onChange={(event) =>
            setFormData((current) => ({ ...current, email: event.target.value }))
          }
          placeholder="Email"
          type="email"
          value={formData.email}
        />
        <input
          name="password"
          onChange={(event) =>
            setFormData((current) => ({
              ...current,
              password: event.target.value,
            }))
          }
          placeholder="Password"
          type="password"
          value={formData.password}
        />
        <button className="solid-button" disabled={submitting} type="submit">
          {submitting ? "Logging in..." : "Login"}
        </button>
        {error ? <p className="status-text error-text">{error}</p> : null}
        <p>
          New student? <Link to="/register">Create an account</Link>
        </p>
        <p>
          <Link to="/forgot-password">Forgot Password?</Link>
        </p>
      </form>
    </div>
  );
}
