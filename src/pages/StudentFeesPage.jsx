import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../api";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";

export default function StudentFeesPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedFee, setExpandedFee] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [selectedTab, setSelectedTab] = useState("fees");
  const [payments, setPayments] = useState([]);

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

const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
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
                              }}
                            >
                              <div>
                                <strong>Installment {inst.number}</strong>
                                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#666" }}>
                                  Due: {new Date(inst.dueDate).toLocaleDateString()}
                                </p>
                              </div>
                              <div style={{ textAlign: "right" }}>
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
                            </div>
                          ))}
                      </div>

                      {/* Pay Button */}
                      {fee.status !== "Paid" && (
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
                // Determine what the payment was for
                let description = receipt.description || "Payment";
                if (receipt.studentFee?.course) {
                  description = `${receipt.studentFee.course.title} - Installment ${receipt.installmentNumber}`;
                } else if (receipt.payment?.notes) {
                  // Extract the fee name from payment notes
                  const match = receipt.payment.notes.match(/(?:Monthly|Quarterly|fee):\s*([^N]+?)(?:\s+Name:|Submitted|$)/i);
                  if (match) {
                    description = match[1].trim();
                  } else {
                    description = receipt.payment.notes.substring(0, 50);
                  }
                }

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
                        {description}
                      </h4>
                      <p style={{ margin: "0", fontSize: "13px", color: "#666" }}>
                        <strong>Receipt #{receipt.receiptNumber}</strong> • ₹{receipt.amount?.toLocaleString()} • 
                        <span style={{ color: "#666", marginLeft: "4px" }}>{receipt.paymentMethod || "N/A"}</span>
                      </p>
                      <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#999" }}>
                        {new Date(receipt.createdAt).toLocaleDateString("en-IN", { 
                          weekday: "short", 
                          year: "numeric", 
                          month: "short", 
                          day: "numeric" 
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        // TODO: Implement PDF download
                        alert("PDF download coming soon!");
                      }}
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
                      Download
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
