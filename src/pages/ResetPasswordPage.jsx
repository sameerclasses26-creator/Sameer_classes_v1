import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5002/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setMessage("Password reset successful. You can now login.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Reset Password</h1>
        <p>Enter your new password.</p>
        <input
          name="password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="New Password"
          type="password"
          value={password}
          required
        />
        <input
          name="confirmPassword"
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Confirm New Password"
          type="password"
          value={confirmPassword}
          required
        />
        <button className="solid-button" disabled={submitting} type="submit">
          {submitting ? "Resetting..." : "Reset Password"}
        </button>
        {error ? <p className="status-text error-text">{error}</p> : null}
        {message ? <p className="status-text success-text">{message}</p> : null}
      </form>
    </div>
  );
}