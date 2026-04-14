import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../api";
import Spinner from "../components/Spinner";

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-IN");
};

export default function AdminStudentDetailPage() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState("overview");
  const [message, setMessage] = useState("");
  const [feeForm, setFeeForm] = useState({ amount: "", dueDate: "", feeType: "Monthly coaching fee", notes: "" });
  const [creatingFee, setCreatingFee] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE}/admin/students/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch student details");
        const result = await response.json();
        setData(result);
        setFormData(result.student);
      } catch (error) {
        console.error(error);
        setMessage("Error loading student details");
      } finally {
        setLoading(false);
      }
    };

    if (studentId && token) fetchData();
  }, [studentId, token]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/students/${studentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          goals: formData.goals,
          studentClass: formData.studentClass,
          schoolName: formData.schoolName,
        }),
      });

      if (!response.ok) throw new Error("Failed to update student");
      setMessage("Student updated successfully");
      setEditing(false);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Error updating student");
    }
  };

  const handleDeleteStudent = async () => {
    if (!confirm("Are you sure you want to delete this student? This action cannot be undone.")) return;

    try {
      const response = await fetch(`${API_BASE}/admin/students/${studentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete student");
      navigate("/admin");
    } catch (error) {
      setMessage("Error deleting student");
    }
  };

  const handleCreateFee = async (e) => {
    e.preventDefault();
    if (!feeForm.amount || !feeForm.dueDate) {
      setMessage("Amount and due date are required");
      return;
    }

    setCreatingFee(true);
    try {
      const response = await fetch(`${API_BASE}/admin/students/${studentId}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(feeForm.amount),
          dueDate: new Date(feeForm.dueDate).toISOString(),
          feeType: feeForm.feeType,
          notes: feeForm.notes,
        }),
      });

      if (!response.ok) throw new Error("Failed to create fee");

      setMessage("Fee created successfully! Notification sent to student.");
      setFeeForm({ amount: "", dueDate: "", feeType: "Monthly coaching fee", notes: "" });
      
      // Refresh student data
      const dataRes = await fetch(`${API_BASE}/admin/students/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedData = await dataRes.json();
      setData(updatedData);
      
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(error.message || "Error creating fee");
    } finally {
      setCreatingFee(false);
    }
  };

  if (loading) {
    return (
      <div className="page section">
        <Spinner message="Loading student details..." />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page section">
        <p>Student not found</p>
      </div>
    );
  }

  const { student, enrollments, payments, doubts, testResults, feesDue, totalPaid, completedCourses, activeCourses } =
    data;

  return (
    <div className="page section admin-student-detail">
      <div className="card-topline" style={{ justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button 
            className="ghost-button" 
            onClick={() => navigate("/admin")} 
            type="button"
            style={{ padding: "6px 12px", fontSize: "14px" }}
          >
            ← Back
          </button>
          <h1 style={{ margin: 0 }}>{student.name}</h1>
        </div>
        {editing ? (
          <div style={{ display: "flex", gap: "8px" }}>
            <button 
              className="solid-button" 
              onClick={handleSaveChanges} 
              type="button"
              style={{ padding: "8px 16px", fontSize: "14px", whiteSpace: "nowrap" }}
            >
              Save Changes
            </button>
            <button 
              className="ghost-button" 
              onClick={() => setEditing(false)} 
              type="button"
              style={{ padding: "8px 16px", fontSize: "14px", whiteSpace: "nowrap" }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "8px" }}>
            <button 
              className="ghost-button" 
              onClick={() => setEditing(true)} 
              type="button"
              style={{ padding: "8px 16px", fontSize: "14px", whiteSpace: "nowrap" }}
            >
              Edit Profile
            </button>
            <button 
              style={{ 
                padding: "8px 16px", 
                fontSize: "14px", 
                background: "#c84949",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600",
                whiteSpace: "nowrap"
              }} 
              onClick={handleDeleteStudent} 
              type="button"
            >
              Delete Student
            </button>
          </div>
        )}
      </div>

      {message && <p className="info-message">{message}</p>}

      <div className="admin-detail-tabs">
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
          type="button"
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === "courses" ? "active" : ""}`}
          onClick={() => setActiveTab("courses")}
          type="button"
        >
          Courses
        </button>
        <button
          className={`tab-btn ${activeTab === "payments" ? "active" : ""}`}
          onClick={() => setActiveTab("payments")}
          type="button"
        >
          Payments
        </button>
        <button
          className={`tab-btn ${activeTab === "doubts" ? "active" : ""}`}
          onClick={() => setActiveTab("doubts")}
          type="button"
        >
          Doubt Sessions
        </button>
        <button
          className={`tab-btn ${activeTab === "exams" ? "active" : ""}`}
          onClick={() => setActiveTab("exams")}
          type="button"
        >
          Exam Results
        </button>
      </div>

      {activeTab === "overview" && (
        <div className="detail-section">
          <h2>Student Profile</h2>
          {editing ? (
            <form className="detail-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleEditChange}
                  placeholder="Full name"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={formData.email || ""} disabled />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleEditChange}
                  placeholder="Phone number"
                />
              </div>
              <div className="form-group">
                <label>Class</label>
                <input
                  type="text"
                  name="studentClass"
                  value={formData.studentClass || ""}
                  onChange={handleEditChange}
                  placeholder="Student class"
                />
              </div>
              <div className="form-group">
                <label>School Name</label>
                <input
                  type="text"
                  name="schoolName"
                  value={formData.schoolName || ""}
                  onChange={handleEditChange}
                  placeholder="School name"
                />
              </div>
              <div className="form-group">
                <label>Goals</label>
                <textarea
                  name="goals"
                  value={formData.goals || ""}
                  onChange={handleEditChange}
                  placeholder="Student goals"
                  rows="3"
                />
              </div>
            </form>
          ) : (
            <div className="detail-grid">
              <div className="detail-item">
                <span>Name</span>
                <strong>{student.name}</strong>
              </div>
              <div className="detail-item">
                <span>Email</span>
                <strong>{student.email}</strong>
              </div>
              <div className="detail-item">
                <span>Phone</span>
                <strong>{student.phone || "—"}</strong>
              </div>
              <div className="detail-item">
                <span>Class</span>
                <strong>{student.studentClass || "—"}</strong>
              </div>
              <div className="detail-item">
                <span>School</span>
                <strong>{student.schoolName || "—"}</strong>
              </div>
              <div className="detail-item">
                <span>Joined</span>
                <strong>{formatDate(student.createdAt)}</strong>
              </div>
            </div>
          )}

          <h3 style={{ marginTop: 24 }}>Summary</h3>
          <div className="admin-summary-cards">
            <article className="card">
              <span className="pill">Active Courses</span>
              <h3>{activeCourses}</h3>
            </article>
            <article className="card">
              <span className="pill">Completed Courses</span>
              <h3>{completedCourses}</h3>
            </article>
            <article className="card">
              <span className="pill">Total Paid</span>
              <h3>₹{totalPaid}</h3>
            </article>
            <article className="card">
              <span className="pill">Pending Fees</span>
              <h3>₹{feesDue}</h3>
            </article>
          </div>
        </div>
      )}

      {activeTab === "courses" && (
        <div className="detail-section">
          <h2>Enrolled Courses</h2>
          {enrollments.length ? (
            <div className="card-list">
              {enrollments.map((enrollment) => (
                <article className="card" key={enrollment._id}>
                  <div className="card-header">
                    <h3>{enrollment.course?.title}</h3>
                    <span className="pill">{enrollment.status}</span>
                  </div>
                  <p>{enrollment.course?.summary}</p>
                  <div className="card-details">
                    <span>Category: {enrollment.course?.category}</span>
                    <span>Progress: {enrollment.progress}%</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p>No course enrollments</p>
          )}
        </div>
      )}

      {activeTab === "payments" && (
        <div className="detail-section">
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ marginBottom: "16px" }}>Create Fee Request</h2>
            <form onSubmit={handleCreateFee} className="detail-form" style={{ maxWidth: "600px" }}>
              <div className="form-group">
                <label>Fee Type</label>
                <select
                  value={feeForm.feeType}
                  onChange={(e) => setFeeForm({ ...feeForm, feeType: e.target.value })}
                  style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                >
                  <option value="Monthly coaching fee">Monthly coaching fee</option>
                  <option value="Quarterly fee">Quarterly fee</option>
                  <option value="Admission fee">Admission fee</option>
                  <option value="Exam fee">Exam fee</option>
                  <option value="Materials fee">Materials fee</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={feeForm.amount}
                  onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
                  placeholder="Enter amount"
                  required
                />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={feeForm.dueDate}
                  onChange={(e) => setFeeForm({ ...feeForm, dueDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Additional Notes</label>
                <textarea
                  value={feeForm.notes}
                  onChange={(e) => setFeeForm({ ...feeForm, notes: e.target.value })}
                  placeholder="Optional notes for the student"
                  rows="2"
                />
              </div>
              <button
                type="submit"
                disabled={creatingFee}
                className="solid-button"
                style={{ background: creatingFee ? "#ccc" : "#0066cc" }}
              >
                {creatingFee ? "Creating..." : "Create Fee Request"}
              </button>
            </form>
          </div>

          <h2>Payment History</h2>
          {payments.length ? (
            <div className="payment-list" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
              {payments.map((payment) => {
                // Extract item name from notes
                let itemName = "Payment";
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
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                      <div>
                        <p style={{ margin: "0 0 4px 0", fontSize: "11px", color: "#999", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          Payment {payment.status.toLowerCase()}
                        </p>
                        <h3 style={{ margin: 0, fontSize: "26px", fontWeight: "700", color: payment.status === "Paid" ? "#22c55e" : "#ff9800" }}>
                          ₹{payment.amount?.toLocaleString()}
                        </h3>
                      </div>
                      <span style={{
                        padding: "6px 14px",
                        backgroundColor: payment.status === "Paid" ? "#dcfce7" : "#fff3cd",
                        color: payment.status === "Paid" ? "#166534" : "#856404",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                        whiteSpace: "nowrap"
                      }}>
                        {payment.status === "Paid" ? "✓ Paid" : "⏳ " + payment.status}
                      </span>
                    </div>

                    {/* Divider */}
                    <div style={{ height: "1px", backgroundColor: "#e5e7eb", margin: "12px 0" }} />

                    {/* Details */}
                    <div style={{ display: "grid", gap: "10px" }}>
                      <div>
                        <p style={{ margin: 0, fontSize: "12px", color: "#999", fontWeight: "600" }}>ITEM</p>
                        <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#333", fontWeight: "500" }}>
                          {itemName}
                        </p>
                      </div>
                      
                      <div>
                        <p style={{ margin: 0, fontSize: "12px", color: "#999", fontWeight: "600" }}>
                          {payment.status === "Paid" ? "PAID ON" : "DUE DATE"}
                        </p>
                        <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#333" }}>
                          {payment.status === "Paid" ? formatDate(payment.paidAt) : formatDate(payment.dueDate)}
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
              })}
            </div>
          ) : (
            <p>No payments</p>
          )}
        </div>
      )}

      {activeTab === "doubts" && (
        <div className="detail-section">
          <h2>Doubt Sessions</h2>
          {doubts.length ? (
            <div className="card-list">
              {doubts.map((doubt) => (
                <article className="card" key={doubt._id}>
                  <div className="card-header">
                    <h3>{doubt.topic}</h3>
                    <span className={`pill pill-${doubt.status.toLowerCase()}`}>{doubt.status}</span>
                  </div>
                  <p>{doubt.description}</p>
                  <div className="card-details">
                    <span>Preferred: {formatDate(doubt.preferredDate)}</span>
                    {doubt.scheduledAt && <span>Scheduled: {formatDate(doubt.scheduledAt)}</span>}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p>No doubt sessions</p>
          )}
        </div>
      )}

      {activeTab === "exams" && (
        <div className="detail-section">
          <h2>Exam Results</h2>
          {testResults.length ? (
            <div className="card-list">
              {testResults.map((result) => (
                <article className="card" key={result._id}>
                  <div className="card-header">
                    <h3>{result.examTitle}</h3>
                    <span className="pill">{result.percentage}%</span>
                  </div>
                  <div className="card-details">
                    <span>Score: {result.totalMarksObtained}/{result.maxMarks}</span>
                    <span>Date: {formatDate(result.date)}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p>No exam results</p>
          )}
        </div>
      )}
    </div>
  );
}
