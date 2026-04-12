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

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [feesRes, receiptsRes] = await Promise.all([
          fetch(`${API_BASE}/fees`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/fees/receipts/my`, {
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
      } catch (error) {
        console.error("Error fetching fees:", error);
        setFees([]);
        setReceipts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  const totalFeeAmount = fees.reduce((sum, fee) => sum + (fee.totalAmount || 0), 0);
  const totalPaidAmount = fees.reduce((sum, fee) => sum + (fee.paidAmount || 0), 0);
  const totalPendingAmount = totalFeeAmount - totalPaidAmount;

  if (loading) return <Spinner />;

  return (
    <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "24px" }}>My Fees</h1>

      {/* Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        <div style={{ padding: "20px", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
          <p style={{ margin: "0 0 8px 0", color: "#666", fontSize: "14px" }}>Total Amount</p>
          <h3 style={{ margin: 0, fontSize: "24px", fontWeight: "600" }}>
            ₹{totalFeeAmount.toLocaleString()}
          </h3>
        </div>
        <div style={{ padding: "20px", backgroundColor: "#e8f5e9", borderRadius: "8px" }}>
          <p style={{ margin: "0 0 8px 0", color: "#666", fontSize: "14px" }}>Paid Amount</p>
          <h3 style={{ margin: 0, fontSize: "24px", fontWeight: "600", color: "#51cf66" }}>
            ₹{totalPaidAmount.toLocaleString()}
          </h3>
        </div>
        <div style={{ padding: "20px", backgroundColor: "#ffebee", borderRadius: "8px" }}>
          <p style={{ margin: "0 0 8px 0", color: "#666", fontSize: "14px" }}>Pending Amount</p>
          <h3 style={{ margin: 0, fontSize: "24px", fontWeight: "600", color: "#ff6b6b" }}>
            ₹{totalPendingAmount.toLocaleString()}
          </h3>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", borderBottom: "2px solid #e0e0e0" }}>
        <button
          onClick={() => setSelectedTab("fees")}
          style={{
            padding: "12px 0",
            fontSize: "16px",
            fontWeight: selectedTab === "fees" ? "600" : "400",
            color: selectedTab === "fees" ? "#0066cc" : "#666",
            border: "none",
            borderBottom: selectedTab === "fees" ? "2px solid #0066cc" : "none",
            cursor: "pointer",
            background: "none",
            marginBottom: "-2px",
          }}
        >
          Fees & Installments
        </button>
        <button
          onClick={() => setSelectedTab("receipts")}
          style={{
            padding: "12px 0",
            fontSize: "16px",
            fontWeight: selectedTab === "receipts" ? "600" : "400",
            color: selectedTab === "receipts" ? "#0066cc" : "#666",
            border: "none",
            borderBottom: selectedTab === "receipts" ? "2px solid #0066cc" : "none",
            cursor: "pointer",
            background: "none",
            marginBottom: "-2px",
          }}
        >
          Receipts ({receipts.length})
        </button>
      </div>

      {/* Fees Tab */}
      {selectedTab === "fees" && (
        <div>
          {fees.length === 0 ? (
            <p style={{ textAlign: "center", color: "#999", padding: "32px" }}>
              You don't have any fees yet.
            </p>
          ) : (
            <div style={{ display: "grid", gap: "16px" }}>
              {fees.map((fee) => (
                <div
                  key={fee._id}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    overflow: "hidden",
                    backgroundColor: "#fff",
                  }}
                >
                  <div
                    onClick={() =>
                      setExpandedFee(expandedFee === fee._id ? null : fee._id)
                    }
                    style={{
                      padding: "16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      backgroundColor: "#f9f9f9",
                      cursor: "pointer",
                    }}
                  >
                    <div>
                      <h4 style={{ margin: "0 0 4px 0" }}>
                        {fee.course?.title || "Course"}
                      </h4>
                      <p style={{ margin: "0", fontSize: "14px", color: "#666" }}>
                        ₹{fee.totalAmount?.toLocaleString()} •{" "}
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 8px",
                            backgroundColor: getStatusColor(fee.status),
                            color: "white",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "500",
                          }}
                        >
                          {fee.status}
                        </span>
                      </p>
                    </div>
                    <span style={{ fontSize: "20px" }}>
                      {expandedFee === fee._id ? "▼" : "▶"}
                    </span>
                  </div>

                  {/* Expanded View */}
                  {expandedFee === fee._id && (
                    <div style={{ padding: "16px", borderTop: "1px solid #ddd" }}>
                      <div
                        style={{
                          marginBottom: "16px",
                          padding: "12px",
                          backgroundColor: "#f5f5f5",
                          borderRadius: "4px",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Paid:</span>
                          <strong>₹{fee.paidAmount?.toLocaleString() || 0}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Total:</span>
                          <strong>₹{fee.totalAmount?.toLocaleString()}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Remaining:</span>
                          <strong style={{ color: "#ff6b6b" }}>
                            ₹{(fee.totalAmount - fee.paidAmount)?.toLocaleString()}
                          </strong>
                        </div>
                      </div>

                      <h5 style={{ marginBottom: "12px" }}>Installments:</h5>
                      <div style={{ display: "grid", gap: "8px" }}>
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
              {receipts.map((receipt) => (
                <div
                  key={receipt._id}
                  style={{
                    padding: "16px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <h4 style={{ margin: "0 0 4px 0" }}>Receipt #{receipt.receiptNumber}</h4>
                    <p style={{ margin: "0", fontSize: "14px", color: "#666" }}>
                      ₹{receipt.amount?.toLocaleString()} • {receipt.paymentMethod || "N/A"} •{" "}
                      {new Date(receipt.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      // TODO: Implement PDF download
                      alert("PDF download coming soon!");
                    }}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#f5f5f5",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: "500",
                    }}
                  >
                    Download PDF
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
