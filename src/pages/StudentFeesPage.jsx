import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE } from "../api";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";

export default function StudentFeesPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedFee, setExpandedFee] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [selectedTab, setSelectedTab] = useState("fees");
  const [payments, setPayments] = useState([]);
  const [pageMessage, setPageMessage] = useState(location.state?.message || "");
  const [selectedReceipt, setSelectedReceipt] = useState(null);

useEffect(() => {
  if (!location.state?.message) return;

  setPageMessage(location.state.message);
  navigate(location.pathname, { replace: true, state: {} });
}, [location.pathname, location.state, navigate]);

useEffect(() => {
  if (!token) {
    navigate("/login");
    return;
  }

  const fetchData = async () => {
    try {
      const [feesRes, receiptsRes, paymentsRes] = await Promise.all([
        fetch(`${API_BASE}/fees`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/fees/receipts/my`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/payments/my`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!feesRes.ok) throw new Error("Failed to fetch fees");

      const feesData = await feesRes.json();
      setFees(Array.isArray(feesData) ? feesData : []);

      if (receiptsRes.ok) {
        const receiptData = await receiptsRes.json();
        setReceipts(Array.isArray(receiptData) ? receiptData : []);
      }

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      setFees([]);
      setReceipts([]);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  fetchData();

  // Auto-refresh payments every 10 seconds to show pending payments
  const interval = setInterval(fetchData, 10000);

  // Also refresh when page becomes visible (tab is focused)
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      fetchData();
    }
  };
  document.addEventListener("visibilitychange", handleVisibilityChange);

  return () => {
    clearInterval(interval);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}, [token, navigate]);

  const getStatusColor = (status) => {
    const colors = {
      Pending: "#ffa500",
      Partial: "#0066cc",
      Paid: "#51cf66",
      Overdue: "#ff6b6b",
    };
    return colors[status] || "#999";
  };

  // Open the printable receipt and trigger the browser's Save as PDF flow.
  const generateReceiptPDF = (receipt) => {
    openReceiptWindow(receipt, true);
  };

  // Check if there's a pending payment request for this installment
  const hasPendingPaymentRequest = (feeId, installmentNumber) => {
    return payments.some(
      (payment) =>
        payment.referenceModel === "StudentFee" &&
        String(payment.reference) === String(feeId) &&
        payment.installmentNumber === installmentNumber &&
        payment.status === "Pending"
    );
  };

  const getStatusBadgeClass = (status) => {
  switch (status) {
    case "Paid":
      return "status-success";
    case "Pending":
      return "status-warning";
    case "Overdue":
      return "status-danger";
    default:
      return "";
  }
};

const handleCancelEMI = async (feeId, courseTitle) => {
  const confirmCancel = window.confirm(
    `Are you sure you want to cancel the EMI for "${courseTitle}"?\n\nThis will remove the course from your account and you can enroll again later to purchase it.`
  );

  if (!confirmCancel) return;

  try {
    const response = await fetch(`${API_BASE}/fees/${feeId}/cancel`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to cancel EMI");
    }

    const data = await response.json();

    // Show success message
    setPageMessage(data.message || "EMI cancelled successfully!");

    // Refresh the fees list
    setTimeout(() => {
      window.location.reload();
    }, 1500);

  } catch (error) {
    alert(`Error: ${error.message}`);
    console.error("Cancel EMI error:", error);
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

  const getReceiptDescription = (receipt) => {
    if (receipt.studentFee?.course?.title && receipt.installmentNumber) {
      return `${receipt.studentFee.course.title} - Installment ${receipt.installmentNumber}`;
    }

    if (receipt.description && !receipt.description.includes("undefined")) {
      return receipt.description;
    }

    if (receipt.payment?.notes) {
      const match = receipt.payment.notes.match(/(?:Monthly|Quarterly|fee):\s*([^N]+?)(?:\s+Name:|Submitted|$)/i);
      if (match) {
        return match[1].trim();
      }

      return receipt.payment.notes.substring(0, 50);
    }

    return receipt.installmentNumber ? `Installment ${receipt.installmentNumber} Payment` : "Payment";
  };

  const getReceiptDetails = (receipt) => {
    const description = getReceiptDescription(receipt);

    return {
      description,
      receiptNumber: receipt.receiptNumber || "Pending",
      amount: `₹${(receipt.amount || 0).toLocaleString("en-IN")}`,
      paymentMethod: receipt.paymentMethod || receipt.payment?.method || "N/A",
      issuedOn: new Date(receipt.createdAt).toLocaleDateString("en-IN", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      issuedOnFull: new Date(receipt.createdAt).toLocaleString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      studentName: user?.name || "Student",
      studentEmail: user?.email || "N/A",
      installmentLabel: receipt.installmentNumber ? `Installment ${receipt.installmentNumber}` : "Full Payment",
      status: receipt.status || "Completed",
      referenceId: receipt.referenceId || receipt.payment?._id || "N/A",
    };
  };

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const openReceiptWindow = (receipt, autoPrint = false) => {
    const details = getReceiptDetails(receipt);
    const receiptWindow = window.open("", "_blank", "width=900,height=700");

    if (!receiptWindow) {
      window.alert("Please allow pop-ups to view or download the receipt.");
      return;
    }

    receiptWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${escapeHtml(details.receiptNumber)}</title>
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 32px;
              font-family: Arial, sans-serif;
              background: #f4f7fb;
              color: #1f2937;
            }
            .receipt-shell {
              max-width: 820px;
              margin: 0 auto;
              background: #ffffff;
              border: 1px solid #dbe4f0;
              border-radius: 18px;
              overflow: hidden;
              box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
            }
            .receipt-header {
              padding: 28px 32px;
              background: linear-gradient(135deg, #0f4c81 0%, #1d70b8 100%);
              color: #ffffff;
            }
            .receipt-header h1 {
              margin: 0 0 8px;
              font-size: 30px;
            }
            .receipt-header p {
              margin: 0;
              opacity: 0.9;
              font-size: 15px;
            }
            .receipt-body {
              padding: 28px 32px 32px;
            }
            .highlight {
              display: grid;
              grid-template-columns: repeat(3, minmax(0, 1fr));
              gap: 14px;
              margin-bottom: 28px;
            }
            .highlight-card {
              padding: 16px;
              border-radius: 14px;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
            }
            .highlight-card span {
              display: block;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              color: #64748b;
              margin-bottom: 8px;
            }
            .highlight-card strong {
              font-size: 18px;
              color: #0f172a;
            }
            .detail-grid {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 14px;
            }
            .detail-item {
              padding: 16px;
              border: 1px solid #e2e8f0;
              border-radius: 14px;
              background: #ffffff;
            }
            .detail-item span {
              display: block;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              color: #64748b;
              margin-bottom: 8px;
            }
            .detail-item strong {
              font-size: 16px;
              color: #0f172a;
              word-break: break-word;
            }
            .receipt-footer {
              margin-top: 28px;
              padding-top: 18px;
              border-top: 1px dashed #cbd5e1;
              color: #475569;
              font-size: 14px;
            }
            @media print {
              body {
                background: #ffffff;
                padding: 0;
              }
              .receipt-shell {
                box-shadow: none;
                border-radius: 0;
                border: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt-shell">
            <div class="receipt-header">
              <h1>Fee Payment Receipt</h1>
              <p>${escapeHtml(details.description)}</p>
            </div>
            <div class="receipt-body">
              <div class="highlight">
                <div class="highlight-card">
                  <span>Receipt Number</span>
                  <strong>${escapeHtml(details.receiptNumber)}</strong>
                </div>
                <div class="highlight-card">
                  <span>Amount Paid</span>
                  <strong>${escapeHtml(details.amount)}</strong>
                </div>
                <div class="highlight-card">
                  <span>Payment Method</span>
                  <strong>${escapeHtml(details.paymentMethod)}</strong>
                </div>
              </div>
              <div class="detail-grid">
                <div class="detail-item">
                  <span>Student Name</span>
                  <strong>${escapeHtml(details.studentName)}</strong>
                </div>
                <div class="detail-item">
                  <span>Student Email</span>
                  <strong>${escapeHtml(details.studentEmail)}</strong>
                </div>
                <div class="detail-item">
                  <span>Payment For</span>
                  <strong>${escapeHtml(details.description)}</strong>
                </div>
                <div class="detail-item">
                  <span>Installment</span>
                  <strong>${escapeHtml(details.installmentLabel)}</strong>
                </div>
                <div class="detail-item">
                  <span>Status</span>
                  <strong>${escapeHtml(details.status)}</strong>
                </div>
                <div class="detail-item">
                  <span>Reference ID</span>
                  <strong>${escapeHtml(details.referenceId)}</strong>
                </div>
                <div class="detail-item">
                  <span>Issued On</span>
                  <strong>${escapeHtml(details.issuedOnFull)}</strong>
                </div>
              </div>
              <div class="receipt-footer">
                This is a system-generated receipt for your coaching fee payment.
              </div>
            </div>
          </div>
          ${autoPrint ? "<script>window.onload = function () { window.print(); };</script>" : ""}
        </body>
      </html>
    `);
    receiptWindow.document.close();
  };

  // Calculate totals including both fees and payments
  const feeTotal = fees.reduce((sum, fee) => sum + (fee.totalAmount || 0), 0);
  const feePaid = fees.reduce((sum, fee) => sum + (fee.paidAmount || 0), 0);
  
  const paymentTotal = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const paymentPaid = payments
    .filter((p) => p.status === "Paid")
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  
  const totalFeeAmount = feeTotal + paymentTotal;
  const totalPaidAmount = feePaid + paymentPaid;
  
  // Pending includes both unpaid course fees and pending payment requests
  const pendingFromFees = feeTotal - feePaid;
  const pendingFromPayments = payments
    .filter((p) => p.status === "Pending")
    .reduce((sum, p) => sum + p.amount, 0);
  
  const totalPendingAmount = pendingFromFees + pendingFromPayments;
  const totalDue = totalPendingAmount;

  if (loading) return <Spinner />;

  return (
    <div style={{ padding: "32px 20px", maxWidth: "1200px", margin: "0 auto" }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      {/* Header Section */}
      <div style={{
        background: "linear-gradient(135deg, #0066cc 0%, #004d99 100%)",
        color: "white",
        padding: "40px 32px",
        borderRadius: "16px",
        marginBottom: "32px",
        boxShadow: "0 4px 20px rgba(0, 102, 204, 0.15)"
      }}>
        <h1 style={{ margin: "0 0 8px 0", fontSize: "32px", fontWeight: "700" }}>My Fees</h1>
        <p style={{ margin: 0, fontSize: "16px", opacity: "0.9" }}>Track your course fees and payment history</p>
      </div>

      {pageMessage ? (
        <div
          style={{
            marginBottom: "24px",
            padding: "14px 18px",
            borderRadius: "10px",
            backgroundColor: "#ecfdf5",
            border: "1px solid #a7f3d0",
            color: "#065f46",
            fontWeight: "600",
          }}
        >
          {pageMessage}
        </div>
      ) : null}

      {/* Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        <div style={{
          padding: "24px",
          backgroundColor: "#f8f9ff",
          borderRadius: "12px",
          border: "1px solid #e8ecf1",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          transition: "all 0.3s ease"
        }}>
          <p style={{ margin: "0 0 12px 0", color: "#666", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Amount</p>
          <h3 style={{ margin: 0, fontSize: "28px", fontWeight: "700", color: "#0066cc" }}>
            ₹{totalFeeAmount.toLocaleString()}
          </h3>
        </div>
        <div style={{
          padding: "24px",
          backgroundColor: "#f0fdf4",
          borderRadius: "12px",
          border: "1px solid #dcfce7",
          boxShadow: "0 2px 8px rgba(34, 197, 94, 0.1)",
          transition: "all 0.3s ease"
        }}>
          <p style={{ margin: "0 0 12px 0", color: "#666", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Paid Amount</p>
          <h3 style={{ margin: 0, fontSize: "28px", fontWeight: "700", color: "#22c55e" }}>
            ₹{totalPaidAmount.toLocaleString()}
          </h3>
        </div>
        <div style={{
          padding: "24px",
          backgroundColor: "#fef2f2",
          borderRadius: "12px",
          border: "1px solid #fee2e2",
          boxShadow: "0 2px 8px rgba(239, 68, 68, 0.1)",
          transition: "all 0.3s ease"
        }}>
          <p style={{ margin: "0 0 12px 0", color: "#666", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Pending Amount</p>
          <h3 style={{ margin: 0, fontSize: "28px", fontWeight: "700", color: "#ef4444" }}>
            ₹{totalPendingAmount.toLocaleString()}
          </h3>
        </div>
      </div>

      {totalDue > 0 && (
        <div
          style={{
            padding: "20px 24px",
            background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
            borderRadius: "12px",
            marginBottom: "32px",
            border: "2px solid #fecaca",
            display: "flex",
            alignItems: "center",
            gap: "16px"
          }}
        >
          <span style={{ fontSize: "24px" }}>⚠️</span>
          <div>
            <strong style={{ color: "#991f1f", fontSize: "16px" }}>
              Amount Due: ₹{totalDue.toLocaleString()}
            </strong>
            <p style={{ margin: "4px 0 0 0", color: "#7f1d1d", fontSize: "14px" }}>Please complete your payment to avoid late fees</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: "flex",
        gap: "8px",
        marginBottom: "32px",
        borderBottom: "2px solid #e0e0e0",
        overflowX: "auto",
        paddingBottom: "0"
      }}>
        {[
          { id: "fees", label: "Fees & Installments", icon: "📋" },
          { id: "history", label: "Payment History", icon: "✓" },
          { id: "due", label: "Pending Payments", icon: "⏳" },
          { id: "receipts", label: `Receipts (${receipts.length})`, icon: "🧾" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            style={{
              padding: "14px 20px",
              fontSize: "14px",
              fontWeight: selectedTab === tab.id ? "600" : "500",
              color: selectedTab === tab.id ? "#0066cc" : "#666",
              border: "none",
              borderBottom: selectedTab === tab.id ? "3px solid #0066cc" : "none",
              cursor: "pointer",
              background: "none",
              marginBottom: "-2px",
              transition: "all 0.3s ease",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <span style={{ fontSize: "16px" }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>


      {selectedTab === "history" && (
  <div className="card-grid">
    {payments.filter(p => p.status === "Paid").length ? (
      payments
        .filter((p) => p.status === "Paid")
        .map((payment) => {
          // Extract course/material name from notes
          let title = "Payment";
          if (payment.notes) {
            const match = payment.notes.match(/(?:course|material):\s*([^N]+?)(?:\s+Name:|$)/i);
            if (match) {
              title = match[1].trim();
            }
          }

          return (
            <article className="card" key={payment._id} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              {/* Header with amount and status */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div>
                  <p style={{ margin: "0 0 4px 0", fontSize: "11px", color: "#999", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Payment Confirmed
                  </p>
                  <h3 style={{ margin: 0, fontSize: "26px", fontWeight: "700", color: "#22c55e" }}>
                    ₹{payment.amount?.toLocaleString()}
                  </h3>
                </div>
                <span style={{
                  padding: "6px 14px",
                  backgroundColor: "#dcfce7",
                  color: "#166534",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "600",
                  whiteSpace: "nowrap"
                }}>
                  ✓ {payment.status}
                </span>
              </div>

              {/* Divider */}
              <div style={{ height: "1px", backgroundColor: "#e5e7eb", margin: "12px 0" }} />

              {/* Details */}
              <div style={{ display: "grid", gap: "10px" }}>
                <div>
                  <p style={{ margin: 0, fontSize: "12px", color: "#999", fontWeight: "600" }}>ITEM</p>
                  <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#333", fontWeight: "500" }}>
                    {title}
                  </p>
                </div>
                
                <div>
                  <p style={{ margin: 0, fontSize: "12px", color: "#999", fontWeight: "600" }}>PAID ON</p>
                  <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#333" }}>
                    {formatDate(payment.paidAt)}
                  </p>
                </div>

                {payment.method && (
                  <div>
                    <p style={{ margin: 0, fontSize: "12px", color: "#999", fontWeight: "600" }}>METHOD</p>
                    <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#333" }}>
                      {payment.method}
                    </p>
                  </div>
                )}
              </div>
            </article>
          );
        })
    ) : (
      <article className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
        <p style={{ margin: 0, color: "#999", fontSize: "16px" }}>📭 No payment history yet</p>
      </article>
    )}
  </div>
)}

{selectedTab === "due" && (
  <div className="card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
    {payments.filter(p => p.status !== "Paid").length ? (
      payments
        .filter((p) => p.status !== "Paid")
        .map((payment) => {
          // Extract item name from notes
          let itemName = "Payment Request";
          if (payment.notes) {
            const match = payment.notes.match(/(?:course|material|fee):\s*([^N]+?)(?:\s+Name:|$)/i);
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

          return (
            <article className="card" key={payment._id} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              {/* Header with amount and status */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                  <div>
                    <p style={{ margin: "0 0 4px 0", fontSize: "11px", color: "#999", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Payment Pending
                    </p>
                    <h3 style={{ margin: 0, fontSize: "26px", fontWeight: "700", color: "#ff9800" }}>
                      ₹{payment.amount?.toLocaleString()}
                    </h3>
                  </div>
                  <span style={{
                    padding: "6px 14px",
                    backgroundColor: "#fff3cd",
                    color: "#856404",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "600",
                    whiteSpace: "nowrap"
                  }}>
                    ⏳ {payment.status}
                  </span>
                </div>

                {/* Divider */}
                <div style={{ height: "1px", backgroundColor: "#e5e7eb", margin: "12px 0" }} />

                {/* Details */}
                <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: "12px", color: "#999", fontWeight: "600" }}>ITEM</p>
                    <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#333", fontWeight: "500" }}>
                      {itemName}
                    </p>
                  </div>
                  
                  <div>
                    <p style={{ margin: 0, fontSize: "12px", color: "#999", fontWeight: "600" }}>DUE DATE</p>
                    <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#333" }}>
                      {formatDate(payment.dueDate)}
                    </p>
                  </div>

                  {payment.method && (
                    <div>
                      <p style={{ margin: 0, fontSize: "12px", color: "#999", fontWeight: "600" }}>METHOD</p>
                      <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#333" }}>
                        {payment.method}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pay Now Button */}
              <button
                onClick={() =>
                  navigate(`/fees/${payment._id}/payment`, {
                    state: {
                      payment: payment,
                    },
                  })
                }
                style={{
                  marginTop: "16px",
                  padding: "10px 16px",
                  backgroundColor: "#0066cc",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  transition: "background-color 0.2s"
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = "#0052a3"}
                onMouseOut={(e) => e.target.style.backgroundColor = "#0066cc"}
              >
                Pay Now
              </button>
            </article>
          );
        })
    ) : (
      <article className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
        <p style={{ margin: 0, color: "#999", fontSize: "16px" }}>🎉 No pending payments</p>
      </article>
    )}
  </div>
)}

      {/* Fees Tab */}
      {selectedTab === "fees" && (
        <div>
          {fees.length === 0 ? (
            <div style={{
              textAlign: "center",
              color: "#999",
              padding: "60px 32px",
              backgroundColor: "#f9f9f9",
              borderRadius: "12px",
              border: "2px dashed #e0e0e0"
            }}>
              <p style={{ fontSize: "18px", margin: 0 }}>📚 You don't have any fees yet.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "16px" }}>
              {fees.map((fee) => (
                <div
                  key={fee._id}
                  style={{
                    border: "1px solid #e0e0e0",
                    borderRadius: "12px",
                    overflow: "hidden",
                    backgroundColor: "#fff",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                    transition: "all 0.3s ease",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.1)"}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.05)"}
                >
                  <div
                    onClick={() =>
                      setExpandedFee(expandedFee === fee._id ? null : fee._id)
                    }
                    style={{
                      padding: "20px 24px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      backgroundColor: "#f8f9ff",
                      cursor: "pointer",
                    }}
                  >
                    <div>
                      <h4 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "600", color: "#1f2937" }}>
                        {fee.course?.title || "Course"}
                      </h4>
                      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <span style={{ fontSize: "15px", fontWeight: "600", color: "#0066cc" }}>
                          ₹{fee.totalAmount?.toLocaleString()}
                        </span>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 12px",
                            backgroundColor: getStatusColor(fee.status),
                            color: "white",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          {fee.status}
                        </span>
                      </div>
                    </div>
                    <span style={{ fontSize: "20px", color: "#666" }}>
                      {expandedFee === fee._id ? "▼" : "▶"}
                    </span>
                  </div>

                  {/* Expanded View */}
                  {expandedFee === fee._id && (
                    <div style={{ padding: "24px", borderTop: "1px solid #e0e0e0" }}>
                      <div
                        style={{
                          marginBottom: "20px",
                          padding: "16px",
                          backgroundColor: "#f0fdf4",
                          borderRadius: "8px",
                          border: "1px solid #dcfce7"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                          <span style={{ color: "#666", fontSize: "14px" }}>Paid:</span>
                          <strong style={{ color: "#22c55e", fontSize: "15px" }}>₹{fee.paidAmount?.toLocaleString() || 0}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                          <span style={{ color: "#666", fontSize: "14px" }}>Total:</span>
                          <strong style={{ color: "#1f2937", fontSize: "15px" }}>₹{fee.totalAmount?.toLocaleString()}</strong>
                        </div>
                        <div style={{
                          display: "flex",
                          justifyContent: "space-between",
                          paddingTop: "12px",
                          borderTop: "1px solid rgba(220, 252, 231, 0.5)"
                        }}>
                          <span style={{ color: "#666", fontSize: "14px", fontWeight: "600" }}>Remaining:</span>
                          <strong style={{ color: "#ef4444", fontSize: "15px" }}>
                            ₹{(fee.totalAmount - fee.paidAmount)?.toLocaleString()}
                          </strong>
                        </div>
                      </div>

                      <h5 style={{ marginBottom: "16px", fontSize: "14px", fontWeight: "600", color: "#1f2937" }}>📅 Installments:</h5>
                      <div style={{ display: "grid", gap: "12px" }}>
                        {fee.installments &&
                          fee.installments.map((inst, idx) => (
                            <div
                              key={idx}
                              style={{
                                padding: "12px",
                                border: `1px solid ${
                                  inst.status === "Paid"
                                    ? "#51cf66"
                                    : inst.status === "Pending"
                                    ? "#ffa500"
                                    : "#ff6b6b"
                                }`,
                                borderRadius: "4px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <div style={{ flex: 1 }}>
                                <strong>Installment {inst.number}</strong>
                                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#666" }}>
                                  Due: {new Date(inst.dueDate).toLocaleDateString()}
                                </p>
                              </div>
                              <div style={{ textAlign: "right", marginRight: "12px" }}>
                                <p style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>
                                  ₹{inst.amount?.toLocaleString()}
                                </p>
                                <span
                                  style={{
                                    display: "inline-block",
                                    marginTop: "4px",
                                    padding: "2px 8px",
                                    backgroundColor: getStatusColor(inst.status),
                                    color: "white",
                                    borderRadius: "12px",
                                    fontSize: "11px",
                                    fontWeight: "500",
                                  }}
                                >
                                  {inst.status}
                                </span>
                              </div>
                              {inst.status === "Pending" || inst.status === "Overdue" ? (
                                hasPendingPaymentRequest(fee._id, inst.number) ? (
                                  <div
                                    style={{
                                      padding: "6px 12px",
                                      backgroundColor: "#3b82f6",
                                      color: "white",
                                      borderRadius: "4px",
                                      fontSize: "12px",
                                      fontWeight: "600",
                                      whiteSpace: "nowrap",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "6px",
                                    }}
                                  >
                                    <span
                                      style={{
                                        display: "inline-block",
                                        width: "4px",
                                        height: "4px",
                                        backgroundColor: "white",
                                        borderRadius: "50%",
                                        animation: "pulse 1.5s ease-in-out infinite",
                                      }}
                                    ></span>
                                    Payment Processing
                                  </div>
                                ) : (
                                  <button
                                    onClick={() =>
                                      navigate("/installments/payment", {
                                        state: {
                                          feeId: fee._id,
                                          installmentNumber: inst.number,
                                          amount: inst.amount,
                                          courseName: fee.course?.title,
                                        },
                                      })
                                    }
                                    style={{
                                      padding: "6px 12px",
                                      backgroundColor: "#059669",
                                      color: "white",
                                      border: "none",
                                      borderRadius: "4px",
                                      fontSize: "12px",
                                      fontWeight: "600",
                                      cursor: "pointer",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    Pay Now
                                  </button>
                                )
                              ) : null}
                            </div>
                          ))}
                      </div>

                      {/* Pay Button */}
                      {fee.status !== "Paid" && (!fee.installments || fee.installments.length === 0) && (
                        <button
                          onClick={() =>
                            navigate("/course-payment", {
                              state: {
                                feeId: fee._id,
                                amount: fee.totalAmount - fee.paidAmount,
                                courseName: fee.course?.title,
                              },
                            })
                          }
                          style={{
                            marginTop: "16px",
                            width: "100%",
                            padding: "12px",
                            backgroundColor: "#0066cc",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontWeight: "600",
                          }}
                        >
                          Pay Now
                        </button>
                      )}

                      {/* Cancel EMI Button - Show only if no payment has been made yet */}
                      {fee.status === "Pending" && fee.paidAmount === 0 && (
                        <button
                          onClick={() => handleCancelEMI(fee._id, fee.course?.title)}
                          style={{
                            marginTop: "12px",
                            width: "100%",
                            padding: "12px",
                            backgroundColor: "#ef4444",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontWeight: "600",
                            fontSize: "14px",
                            transition: "background-color 0.2s"
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = "#dc2626"}
                          onMouseOut={(e) => e.target.style.backgroundColor = "#ef4444"}
                        >
                          ✕ Cancel EMI
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Receipts Tab */}
      {selectedTab === "receipts" && (
        <div>
          {receipts.length === 0 ? (
            <p style={{ textAlign: "center", color: "#999", padding: "32px" }}>
              No receipts yet.
            </p>
          ) : (
            <div style={{ display: "grid", gap: "16px" }}>
              {receipts.map((receipt) => {
                const receiptDetails = getReceiptDetails(receipt);

                return (
                  <div
                    key={receipt._id}
                    style={{
                      padding: "20px",
                      border: "1px solid #e0e0e0",
                      borderRadius: "12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      backgroundColor: "#f9f9f9",
                      transition: "all 0.3s ease"
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "600", color: "#222" }}>
                        {receiptDetails.description}
                      </h4>
                      <p style={{ margin: "0", fontSize: "13px", color: "#666" }}>
                        <strong>Receipt #{receiptDetails.receiptNumber}</strong> • {receiptDetails.amount} •
                        <span style={{ color: "#666", marginLeft: "4px" }}>{receiptDetails.paymentMethod}</span>
                      </p>
                      <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#999" }}>
                        {receiptDetails.issuedOn}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => setSelectedReceipt(receipt)}
                        style={{
                          padding: "10px 20px",
                          backgroundColor: "#10b981",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "600",
                          fontSize: "14px",
                          transition: "background-color 0.2s",
                          whiteSpace: "nowrap"
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = "#059669"}
                        onMouseOut={(e) => e.target.style.backgroundColor = "#10b981"}
                      >
                        👁️ View
                      </button>
                      <button
                        onClick={() => generateReceiptPDF(receipt)}
                        style={{
                          padding: "10px 20px",
                          backgroundColor: "#0066cc",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "600",
                          fontSize: "14px",
                          transition: "background-color 0.2s",
                          whiteSpace: "nowrap"
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = "#0052a3"}
                        onMouseOut={(e) => e.target.style.backgroundColor = "#0066cc"}
                      >
                        ⬇️ Download PDF
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Receipt View Modal */}
      {selectedReceipt && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            maxWidth: "600px",
            width: "100%",
            maxHeight: "90vh",
            overflow: "auto",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)"
          }}>
            {/* Modal Header */}
            <div style={{
              padding: "20px 24px",
              borderBottom: "1px solid #e0e0e0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#f9f9f9"
            }}>
              <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600" }}>Receipt Details</h2>
              <button
                onClick={() => setSelectedReceipt(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#999"
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "32px 24px" }}>
              {/* Header with Receipt Number */}
              <div style={{
                padding: "16px",
                backgroundColor: "#f0fdf4",
                borderRadius: "8px",
                border: "1px solid #dcfce7",
                marginBottom: "24px"
              }}>
                <p style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#666", fontWeight: "600", textTransform: "uppercase" }}>
                  Receipt Number
                </p>
                <h3 style={{ margin: "0", fontSize: "18px", fontWeight: "700", color: "#059669" }}>
                  {selectedReceipt.receiptNumber}
                </h3>
              </div>

              {/* Receipt Details in Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
                {/* Amount */}
                <div>
                  <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#999", fontWeight: "600", textTransform: "uppercase" }}>
                    Amount Paid
                  </p>
                  <p style={{ margin: 0, fontSize: "24px", fontWeight: "700", color: "#0066cc" }}>
                    ₹{selectedReceipt.amount?.toLocaleString("en-IN")}
                  </p>
                </div>

                {/* Payment Method */}
                <div>
                  <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#999", fontWeight: "600", textTransform: "uppercase" }}>
                    Payment Method
                  </p>
                  <p style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#1f2937" }}>
                    {selectedReceipt.paymentMethod || "N/A"}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: "24px" }}>
                <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#999", fontWeight: "600", textTransform: "uppercase" }}>
                  Description
                </p>
                <div style={{
                  padding: "12px",
                  backgroundColor: "#f3f4f6",
                  borderRadius: "6px",
                  fontSize: "14px",
                  color: "#1f2937"
                }}>
                  {(() => {
                    let desc = selectedReceipt.description || "Payment";
                    if (selectedReceipt.studentFee?.course) {
                      desc = `${selectedReceipt.studentFee.course.title} - Installment ${selectedReceipt.installmentNumber}`;
                    } else if (selectedReceipt.payment?.notes) {
                      const match = selectedReceipt.payment.notes.match(/(?:Monthly|Quarterly|fee):\s*([^N]+?)(?:\s+Name:|Submitted|$)/i);
                      if (match) {
                        desc = match[1].trim();
                      }
                    }
                    return desc;
                  })()}
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: "1px", backgroundColor: "#e5e7eb", margin: "24px 0" }} />

              {/* Additional Details */}
              <div style={{ display: "grid", gap: "16px", marginBottom: "24px" }}>
                {/* Date */}
                <div>
                  <p style={{ margin: "0 0 6px 0", fontSize: "12px", color: "#999", fontWeight: "600", textTransform: "uppercase" }}>
                    Receipt Date
                  </p>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: "500", color: "#1f2937" }}>
                    {new Date(selectedReceipt.createdAt).toLocaleDateString("en-IN", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                </div>

                {/* Time */}
                <div>
                  <p style={{ margin: "0 0 6px 0", fontSize: "12px", color: "#999", fontWeight: "600", textTransform: "uppercase" }}>
                    Receipt Time
                  </p>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: "500", color: "#1f2937" }}>
                    {new Date(selectedReceipt.createdAt).toLocaleTimeString("en-IN")}
                  </p>
                </div>

                {/* Reference ID */}
                {selectedReceipt.referenceId && (
                  <div>
                    <p style={{ margin: "0 0 6px 0", fontSize: "12px", color: "#999", fontWeight: "600", textTransform: "uppercase" }}>
                      Reference ID
                    </p>
                    <p style={{ margin: 0, fontSize: "14px", fontWeight: "500", color: "#1f2937", wordBreak: "break-all" }}>
                      {selectedReceipt.referenceId}
                    </p>
                  </div>
                )}

                {/* Status */}
                <div>
                  <p style={{ margin: "0 0 6px 0", fontSize: "12px", color: "#999", fontWeight: "600", textTransform: "uppercase" }}>
                    Status
                  </p>
                  <span style={{
                    display: "inline-block",
                    padding: "6px 12px",
                    backgroundColor: "#dcfce7",
                    color: "#166534",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "600"
                  }}>
                    ✓ {selectedReceipt.status || "Completed"}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: "1px", backgroundColor: "#e5e7eb", margin: "24px 0" }} />

              {/* Student Info */}
              <div style={{ marginBottom: "24px" }}>
                <p style={{ margin: "0 0 12px 0", fontSize: "12px", color: "#999", fontWeight: "600", textTransform: "uppercase" }}>
                  Billed To
                </p>
                <div style={{
                  padding: "12px",
                  backgroundColor: "#f3f4f6",
                  borderRadius: "6px",
                  fontSize: "14px",
                  color: "#1f2937"
                }}>
                  <p style={{ margin: "0 0 6px 0", fontWeight: "600" }}>{user?.name || "N/A"}</p>
                  <p style={{ margin: "0 0 4px 0", fontSize: "13px" }}>Email: {user?.email || "N/A"}</p>
                  <p style={{ margin: "0", fontSize: "13px" }}>Phone: {user?.phone || "N/A"}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => generateReceiptPDF(selectedReceipt)}
                  style={{
                    flex: 1,
                    padding: "12px 20px",
                    backgroundColor: "#0066cc",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "14px",
                    transition: "background-color 0.2s"
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = "#0052a3"}
                  onMouseOut={(e) => e.target.style.backgroundColor = "#0066cc"}
                >
                  ⬇️ Download PDF
                </button>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  style={{
                    flex: 1,
                    padding: "12px 20px",
                    backgroundColor: "#e5e7eb",
                    color: "#1f2937",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "14px",
                    transition: "background-color 0.2s"
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = "#d1d5db"}
                  onMouseOut={(e) => e.target.style.backgroundColor = "#e5e7eb"}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
