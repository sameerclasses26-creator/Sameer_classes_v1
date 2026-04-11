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
      <div className="card-topline">
        <button className="ghost-button" onClick={() => navigate("/admin")} type="button">
          ← Back
        </button>
        <h1>{student.name}</h1>
        {editing ? (
          <div style={{ display: "flex", gap: 8 }}>
            <button className="solid-button" onClick={handleSaveChanges} type="button">
              Save Changes
            </button>
            <button className="ghost-button" onClick={() => setEditing(false)} type="button">
              Cancel
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button className="ghost-button" onClick={() => setEditing(true)} type="button">
              Edit Profile
            </button>
            <button className="solid-button" style={{ background: "#c84949" }} onClick={handleDeleteStudent} type="button">
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
          <h2>Payment History</h2>
          {payments.length ? (
            <div className="payment-list">
              {payments.map((payment) => (
                <article className="card" key={payment._id}>
                  <div className="card-header">
                    <h3>₹{payment.amount}</h3>
                    <span className={`pill pill-${payment.status.toLowerCase()}`}>{payment.status}</span>
                  </div>
                  <p>{payment.notes}</p>
                  <div className="card-details">
                    <span>Due: {formatDate(payment.dueDate)}</span>
                    {payment.paidAt && <span>Paid: {formatDate(payment.paidAt)}</span>}
                  </div>
                </article>
              ))}
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
