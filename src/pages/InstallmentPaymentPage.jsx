import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE } from "../api";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";

export default function InstallmentPaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const installmentData = location.state;

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    method: "PhonePe",
    referenceId: "",
  });

  // Update form with user data when user loads
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user?.name || "",
        email: user?.email || "",
        mobile: user?.phone || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!installmentData) {
      setMessage("❌ No installment data provided. Redirecting...");
      setTimeout(() => navigate("/fees"), 2000);
      return;
    }
  }, [installmentData, navigate]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!installmentData || submitting) return;

    // Validate form fields
    if (!form.name || !form.email || !form.mobile || !form.method) {
      setMessage("❌ All fields are required. Please fill in all details.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE}/fees/${installmentData.feeId}/installment-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            installmentNumber: installmentData.installmentNumber,
            amount: installmentData.amount,
            paymentMethod: form.method,
            referenceId: form.referenceId,
            name: form.name,
            email: form.email,
            mobile: form.mobile,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to submit installment payment.");
      }

      navigate("/fees", {
        replace: true,
        state: {
          message: `✓ Payment request for Installment ${installmentData.installmentNumber} submitted successfully! Admin will review and process your payment.`,
        },
      });
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!installmentData) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center" }}>
        <Spinner />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "0 20px" }}>
      <div
        style={{
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          padding: "40px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ marginTop: 0, color: "#1f2937", marginBottom: "8px" }}>
          📱 Pay Installment
        </h1>
        <p style={{ color: "#666", marginBottom: "30px" }}>
          Complete your payment for{" "}
          <strong>
            {installmentData.courseName} - Installment {installmentData.installmentNumber}
          </strong>
        </p>

        {/* Payment Summary */}
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "30px",
            border: "1px solid #e5e7eb",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ color: "#666" }}>Course:</span>
            <strong>{installmentData.courseName}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ color: "#666" }}>Installment #:</span>
            <strong>{installmentData.installmentNumber}</strong>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingTop: "12px",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <span style={{ color: "#666", fontWeight: "600" }}>Amount Due:</span>
            <strong style={{ fontSize: "18px", color: "#059669" }}>
              ₹{installmentData.amount?.toLocaleString()}
            </strong>
          </div>
        </div>

        {message && (
          <div
            style={{
              backgroundColor: message.includes("❌") ? "#fee" : "#efe",
              padding: "12px",
              borderRadius: "6px",
              marginBottom: "20px",
              color: message.includes("❌") ? "#c33" : "#080",
              borderLeft: `4px solid ${message.includes("❌") ? "#f66" : "#6f6"}`,
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#333",
              }}
            >
              Full Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#333",
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#333",
              }}
            >
              Mobile Number
            </label>
            <input
              type="tel"
              value={form.mobile}
              onChange={(e) => handleChange("mobile", e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#333",
              }}
            >
              Payment Method
            </label>
            <select
              value={form.method}
              onChange={(e) => handleChange("method", e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            >
              <option value="PhonePe">PhonePe</option>
              <option value="Google Pay">Google Pay</option>
              <option value="Paytm">Paytm</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
            </select>
          </div>

          <div style={{ marginBottom: "30px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#333",
              }}
            >
              Reference ID / UTR (Optional)
            </label>
            <input
              type="text"
              value={form.referenceId}
              onChange={(e) => handleChange("referenceId", e.target.value)}
              placeholder="e.g., UPI Reference or Transaction ID"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                flex: 1,
                padding: "12px",
                backgroundColor: submitting ? "#999" : "#059669",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Submitting..." : "Submit Payment Request"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/fees")}
              disabled={submitting}
              style={{
                flex: 1,
                padding: "12px",
                backgroundColor: "#e5e7eb",
                color: "#333",
                border: "none",
                borderRadius: "6px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
