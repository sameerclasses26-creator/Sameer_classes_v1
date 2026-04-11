import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import { API_BASE } from "../api";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  name: "",
  email: "",
  mobile: "",
  method: "PhonePe",
};

export default function CoursePaymentPage() {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [course, setCourse] = useState(location.state?.course || null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(!location.state?.course);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      name: user?.name || "",
      email: user?.email || "",
      mobile: user?.phone || "",
    }));
  }, [user]);

  useEffect(() => {
    if (course) return;

    const loadCourse = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/content/courses/${courseId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load course details.");
        }

        setCourse(data);
      } catch (error) {
        setMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [course, courseId]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!course) return;

    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE}/dashboard/purchase/course/${course._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to create payment request.");
      }

      navigate("/courses", {
        replace: true,
        state: {
          paymentMessage: data.message || "Payment request created successfully.",
        },
      });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page section">
        <article className="card payment-page-card">Loading course details...</article>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="page section">
        <article className="card payment-page-card">
          <h2>Course not found</h2>
          <p>{message || "We could not load the selected course."}</p>
          <Link className="ghost-button" to="/courses">
            Back to courses
          </Link>
        </article>
      </div>
    );
  }

  return (
    <div className="page section payment-page">
      <div className="payment-page-grid">
        <article className="card payment-page-card">
          <span className="pill">Course payment</span>
          <h1>{course.title}</h1>
          <p>{course.summary}</p>
          <div className="payment-course-meta">
            <div>
              <span>Category</span>
              <strong>{course.category}</strong>
            </div>
            <div>
              <span>Duration</span>
              <strong>{course.duration}</strong>
            </div>
            <div>
              <span>Mode</span>
              <strong>{course.mode}</strong>
            </div>
            <div>
              <span>Amount</span>
              <strong>{course.price ? `₹${course.price}` : "Contact us"}</strong>
            </div>
          </div>
        </article>

        <article className="card payment-page-card">
          <span className="pill">Payment details</span>
          <h2>Complete your request</h2>
          <p>Fill your details and choose a payment mode. Admin will review the request and unlock the course after marking it paid.</p>

          <form className="payment-request-form" onSubmit={handleSubmit}>
            <label>
              Name
              <input
                value={form.name}
                onChange={(event) => handleChange("name", event.target.value)}
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(event) => handleChange("email", event.target.value)}
                required
              />
            </label>

            <label>
              Mobile
              <input
                type="tel"
                value={form.mobile}
                onChange={(event) => handleChange("mobile", event.target.value)}
                required
              />
            </label>

            <label>
              Payment via
              <select value={form.method} onChange={(event) => handleChange("method", event.target.value)} required>
                <option value="PhonePe">PhonePe</option>
                <option value="Cash">Cash</option>
                <option value="Debit Card">Debit Card</option>
              </select>
            </label>

            {message ? <p className="error-text">{message}</p> : null}

            <div className="payment-request-actions">
              <button className="solid-button" type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Pay"}
              </button>
              <Link className="ghost-button" to="/courses">
                Cancel
              </Link>
            </div>
          </form>
        </article>
      </div>
    </div>
  );
}
