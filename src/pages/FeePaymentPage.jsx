import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import { API_BASE } from "../api";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  name: "",
  email: "",
  mobile: "",
  method: "PhonePe",
};

export default function FeePaymentPage() {
  const { paymentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [payment, setPayment] = useState(location.state?.payment || null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(!location.state?.payment);
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
    if (payment) return;

    const loadPayment = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/payments/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error("Unable to load payment details.");
        }

        const foundPayment = Array.isArray(data)
          ? data.find((p) => p._id === paymentId)
          : null;

        if (!foundPayment) {
          throw new Error("Payment request not found");
        }

        setPayment(foundPayment);
      } catch (error) {
        setMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadPayment();
  }, [payment, paymentId, token]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!payment) return;

    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE}/fees/submit/${payment._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to submit payment request.");
      }

      navigate("/fees", {
        replace: true,
        state: {
          paymentMessage: data.message || "Payment request submitted successfully.",
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
        <div className="app-loading-block">
          <Spinner message="Loading payment details..." />
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="page section">
        <article className="card payment-page-card">
          <h2>Payment request not found</h2>
          <p>{message || "We could not load the payment details."}</p>
          <Link className="ghost-button" to="/fees">
            Back to fees
          </Link>
        </article>
      </div>
    );
  }

  // Extract item name from notes
  let itemName = "Payment Request";
  if (payment.notes) {
    const match = payment.notes.match(/(?:course|material|fee):\s*([^N]+?)(?:\s+Name:|Submitted|$)/i);
    if (match) {
      itemName = match[1].trim();
    } else if (payment.notes.includes("Monthly")) {
      itemName = "Monthly coaching fee";
    } else if (payment.notes.includes("Quarterly")) {
      itemName = "Quarterly fee";
    } else {
      itemName = payment.notes.substring(0, 50);
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="page section payment-page">
      <div className="payment-page-grid">
        <article className="card payment-page-card">
          <span className="pill">Payment request</span>
          <h1>₹{payment.amount?.toLocaleString()}</h1>
          <p style={{ fontSize: "16px", marginTop: "16px" }}>{itemName}</p>
          <div className="payment-course-meta">
            <div>
              <span>Description</span>
              <strong>{itemName}</strong>
            </div>
            <div>
              <span>Due Date</span>
              <strong>{formatDate(payment.dueDate)}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong style={{ color: "#ffa500" }}>Pending</strong>
            </div>
          </div>
        </article>

        <article className="card payment-page-card">
          <span className="pill">Payment details</span>
          <h2>Complete your payment</h2>
          <p>Fill your details and choose a payment mode. Admin will review the request and mark it as paid after receiving payment.</p>

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
                <option value="Credit Card">Credit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </label>

            {message ? <p className="error-text">{message}</p> : null}

            <div className="payment-request-actions">
              <button className="solid-button" type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Payment Request"}
              </button>
              <Link className="ghost-button" to="/fees">
                Cancel
              </Link>
            </div>
          </form>
        </article>
      </div>
    </div>
  );
}
