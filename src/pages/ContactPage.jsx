import { useState } from "react";

import SectionHeading from "../components/SectionHeading";

const initialState = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

export default function ContactPage() {
  const [formData, setFormData] = useState(initialState);
  const [status, setStatus] = useState("");
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
    setStatus("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Submission failed");
      }

      setStatus("Thanks, your inquiry has been submitted.");
      setFormData(initialState);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page section">
      <SectionHeading
        eyebrow="Contact"
        title="Capture admissions leads with a proper counseling form"
        description="Students and parents can send inquiries directly into your backend."
      />

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <input
            name="name"
            onChange={handleChange}
            placeholder="Student name"
            value={formData.name}
          />
          <input
            name="email"
            onChange={handleChange}
            placeholder="Email address"
            type="email"
            value={formData.email}
          />
          <input
            name="phone"
            onChange={handleChange}
            placeholder="Phone number"
            value={formData.phone}
          />
          <textarea
            name="message"
            onChange={handleChange}
            placeholder="Tell us which course you are interested in"
            rows="6"
            value={formData.message}
          />
        </div>
        <button className="solid-button" disabled={submitting} type="submit">
          {submitting ? "Submitting..." : "Send Inquiry"}
        </button>
        {status ? <p className="status-text">{status}</p> : null}
      </form>
    </div>
  );
}
