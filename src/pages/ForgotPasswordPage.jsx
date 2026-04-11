import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("http://localhost:5002/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setMessage("Password reset email sent. Check your inbox.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Forgot Password</h1>
        <p>Enter your email to receive a password reset link.</p>
        <input
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          type="email"
          value={email}
          required
        />
        <button className="solid-button" disabled={submitting} type="submit">
          {submitting ? "Sending..." : "Send Reset Link"}
        </button>
        {error ? <p className="status-text error-text">{error}</p> : null}
        {message ? <p className="status-text success-text">{message}</p> : null}
        <p>
          Remember your password? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}