import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const initialState = {
  name: "",
  email: "",
  phone: "",
  goals: "",
  password: "",
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await register(formData);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Enroll for counseling</h1>
        <p>Create a student account and capture admission intent.</p>
        <input
          name="name"
          onChange={handleChange}
          placeholder="Full name"
          value={formData.name}
        />
        <input
          name="email"
          onChange={handleChange}
          placeholder="Email"
          type="email"
          value={formData.email}
        />
        <input
          name="phone"
          onChange={handleChange}
          placeholder="Phone number (10 digits)"
          value={formData.phone}
        />
        <input
          name="goals"
          onChange={handleChange}
          placeholder="Target exam or class"
          value={formData.goals}
        />
        <input
          name="password"
          onChange={handleChange}
          placeholder="Password (min 8 chars, letters, numbers, special)"
          type="password"
          value={formData.password}
        />
        <button className="solid-button" disabled={submitting} type="submit">
          {submitting ? "Creating..." : "Create Account"}
        </button>
        {error ? <p className="status-text error-text">{error}</p> : null}
        <p>
          Already enrolled? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
