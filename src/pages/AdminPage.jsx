import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import AdminNotificationManager from "../components/AdminNotificationManager";
import { API_BASE } from "../api";
import { useAuth } from "../context/AuthContext";

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateTimeLocal = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const timezoneOffsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 16);
};

const sessionStatusLabel = (status) => {
  if (status === "Confirmed") return "Scheduled";
  if (status === "Cancelled") return "Rejected";
  return status;
};

const getStatusBadgeClass = (status) => {
  if (status === "Confirmed") return "status-scheduled";
  if (status === "Pending") return "status-pending";
  if (status === "Completed") return "status-completed";
  if (status === "Cancelled") return "status-rejected";
  if (status === "Paid") return "status-paid";
  return "status-pending";
};

const getDoubtStudentClass = (doubt) => {
  return doubt?.studentSnapshot?.studentClass || doubt?.user?.studentClass || "Class not set";
};

const navItems = [
 
  { key: "students", label: "Students" },
  { key: "courses", label: "Courses" },
  { key: "course-content", label: "Course Content" },
  { key: "materials", label: "Study materials" },
  { key: "enrollments", label: "Enrollments" },
  { key: "fees", label: "Fees & Installments" },
  { key: "notifications", label: "Notifications" },
  { key: "payments", label: "Payments" },
  { key: "doubts", label: "Doubt Sessions" },
  { key: "completed-doubts", label: "Completed Doubts" },
  { key: "exams", label: "Exams Management" },
];

const initialDoubtAction = {
  doubtId: "",
  mode: "",
  scheduledAt: "",
  googleMeetLink: "",
  remarks: "",
};

const initialCourseForm = {
  title: "",
  slug: "",
  category: "",
  summary: "",
  duration: "",
  mode: "Offline + Online",
  price: "",
  featured: false,
};

const initialMaterialForm = {
  title: "",
  slug: "",
  description: "",
  category: "",
  course: "",
  price: "",
  downloadUrl: "",
  featured: false,
};

export default function AdminPage() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "A";

  const [activeSection, setActiveSection] = useState("students");
  const [summary, setSummary] = useState(null);
  const [students, setStudents] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [pendingEnrollmentCount, setPendingEnrollmentCount] = useState(0);
  const [allDoubts, setAllDoubts] = useState([]);
  const [completedDoubts, setCompletedDoubts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [showAllPayments, setShowAllPayments] = useState(false);
  const [coursesList, setCoursesList] = useState([]);
  const [materialsList, setMaterialsList] = useState([]);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editingMaterialId, setEditingMaterialId] = useState(null);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [enrollmentView, setEnrollmentView] = useState("pending");
  const [enrollmentHistory, setEnrollmentHistory] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentSearch, setStudentSearch] = useState("");
  const [paymentReminder, setPaymentReminder] = useState({ amount: "", dueDate: "", notes: "" });

  const navCounts = {
    payments: summary?.pendingPayments ?? 0,
    doubts: summary?.pendingDoubts ?? 0,
    enrollments: pendingEnrollmentCount,
  };
  const [courseForm, setCourseForm] = useState(initialCourseForm);
  const [materialForm, setMaterialForm] = useState(initialMaterialForm);
  const [doubtAction, setDoubtAction] = useState(initialDoubtAction);
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [sectionLoaded, setSectionLoaded] = useState({
    payments: false,
    doubts: false,
    "completed-doubts": false,
    courses: false,
    materials: false,
    enrollments: false,
  });

  const totalVisiblePayments = payments
    .filter((payment) => showAllPayments || payment.status === "Pending")
    .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);

  const apiRequest = async (path, options = {}) => {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      ...options,
    });

    const text = await response.text();
    let json = {};

    try {
      json = text ? JSON.parse(text) : {};
    } catch (e) {
      console.error("Failed to parse response:", text);
    }

    if (!response.ok) {
      const errorMsg = json.message || `Error ${response.status}`;
      console.error(`API Error at ${path}:`, errorMsg);
      throw new Error(errorMsg);
    }

    return json;
  };

  const loadSummary = async () => {
    const data = await apiRequest("/admin/summary");
    setSummary(data);
  };

  const loadStudents = async (query = "") => {
    const searchParam = query ? `?search=${encodeURIComponent(query)}` : "";
    const data = await apiRequest(`/admin/students${searchParam}`);
    setStudents(data);
  };

  const loadStudentDetails = async (studentId) => {
    const data = await apiRequest(`/admin/students/${studentId}`);
    setSelectedStudent(data);
  };

  const loadDoubts = async (status = "") => {
    const searchParam = status ? `?status=${encodeURIComponent(status)}` : "";
    const data = await apiRequest(`/admin/doubts${searchParam}`);
    setAllDoubts(data);
  };

  const loadCompletedDoubts = async () => {
    const data = await apiRequest("/admin/doubts/completed");
    setCompletedDoubts(data);
    setSectionLoaded((prev) => ({ ...prev, "completed-doubts": true }));
  };

  const loadPayments = async () => {
    const data = await apiRequest("/admin/payments");
    setPayments(data);
    setSectionLoaded((prev) => ({ ...prev, payments: true }));
  };

  const loadCourses = async () => {
    const data = await apiRequest("/admin/courses");
    setCoursesList(data);
    setSectionLoaded((prev) => ({ ...prev, courses: true }));
  };

  const loadMaterials = async () => {
    const data = await apiRequest("/admin/materials");
    setMaterialsList(data);
    setSectionLoaded((prev) => ({ ...prev, materials: true }));
  };

  const loadPendingEnrollmentCount = async () => {
    try {
      const response = await fetch("/api/enrollments/pending/count", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setPendingEnrollmentCount(data.pendingCount);
      }
    } catch (error) {
      console.error("Error loading pending enrollments count:", error);
    }
  };

  const loadEnrollments = async () => {
    try {
      const response = await fetch("/api/enrollments?status=Pending&limit=100", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setEnrollments(data.enrollmentRequests);
        setSectionLoaded((prev) => ({ ...prev, enrollments: true }));
      }
    } catch (error) {
      console.error("Error loading enrollments:", error);
    }
  };

  const loadEnrollmentHistory = async () => {
    try {
      const response = await fetch("/api/enrollments?status=All&limit=100", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        const historyEnrollments = data.enrollmentRequests.filter(
          (e) => e.status === "Accepted" || e.status === "Rejected"
        );
        setEnrollmentHistory(historyEnrollments);
      }
    } catch (error) {
      console.error("Error loading enrollment history:", error);
    }
  };

  const handleApproveEnrollment = async (enrollment) => {
    if (!window.confirm(`Approve enrollment for ${enrollment.studentName}?`)) {
      return;
    }
    
    setActionLoading(true);
    try {
      const response = await fetch(
        `/api/enrollments/${enrollment._id}/approve`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ adminNotes: "" }),
        }
      );

      const data = await response.json();
      if (data.success) {
        loadEnrollments();
        setStatusMessage("Enrollment approved successfully");
        setTimeout(() => setStatusMessage(""), 3000);
      } else {
        alert(data.message || "Failed to approve enrollment");
      }
    } catch (error) {
      console.error("Error approving enrollment:", error);
      alert("Error approving enrollment");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectEnrollment = async (enrollment) => {
    if (!window.confirm(`Reject enrollment for ${enrollment.studentName}?`)) {
      return;
    }
    
    setActionLoading(true);
    try {
      const response = await fetch(
        `/api/enrollments/${enrollment._id}/reject`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ adminNotes: "" }),
        }
      );

      const data = await response.json();
      if (data.success) {
        loadEnrollments();
        setStatusMessage("Enrollment rejected successfully");
        setTimeout(() => setStatusMessage(""), 3000);
      } else {
        alert(data.message || "Failed to reject enrollment");
      }
    } catch (error) {
      console.error("Error rejecting enrollment:", error);
      alert("Error rejecting enrollment");
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewEnrollment = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setIsEnrollmentModalOpen(true);
  };

  const handleCloseEnrollmentModal = () => {
    setIsEnrollmentModalOpen(false);
    setSelectedEnrollment(null);
  };

  const loadSectionData = async (section) => {
    if (section === "payments") {
      if (sectionLoaded.payments) return;
      await loadPayments();
      return;
    }

    if (section === "doubts") {
      if (sectionLoaded.doubts) return;
      await loadDoubts();
      setSectionLoaded((prev) => ({ ...prev, doubts: true }));
      return;
    }

    if (section === "completed-doubts") {
      if (sectionLoaded["completed-doubts"]) return;
      await loadCompletedDoubts();
      return;
    }

    if (section === "courses") {
      if (!sectionLoaded.courses) {
        await loadCourses();
      }
      return;
    }

    if (section === "materials") {
      if (!sectionLoaded.materials) {
        await loadMaterials();
      }
      return;
    }

    if (section === "enrollments") {
      if (!sectionLoaded.enrollments) {
        await loadEnrollments();
      }
      return;
    }

    if (section === "students") {
      await loadStudents(studentSearch);
    }
  };

  useEffect(() => {
    if (!token) return;

    const initialLoad = async () => {
      setLoading(true);
      try {
        await Promise.all([loadSummary(), loadStudents(), loadPendingEnrollmentCount()]);
      } catch (error) {
        setStatusMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    initialLoad();
  }, [token]);

  const handleSectionChange = async (sectionKey) => {
    if (sectionKey === "exams") {
      // Navigate within React Router instead of hard refresh
      navigate("/admin/exams");
      return;
    }

    if (sectionKey === "fees") {
      // Navigate to fee management page
      navigate("/admin/fees");
      return;
    }

    setActiveSection(sectionKey);
    setStatusMessage("");
    setDoubtAction(initialDoubtAction);
    try {
      setSectionLoading(true);
      await loadSectionData(sectionKey);
    } catch (error) {
      setStatusMessage(error.message);
    } finally {
      setSectionLoading(false);
    }
  };

  const handleStudentSearch = async (event) => {
    const query = event.target.value;
    setStudentSearch(query);
    try {
      await loadStudents(query);
    } catch (error) {
      setStatusMessage(error.message);
    }
  };

  const handleSelectStudent = async (studentId) => {
    try {
      await loadStudentDetails(studentId);
      setActiveSection("students");
    } catch (error) {
      setStatusMessage(error.message);
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourseId(course._id);
    setCourseForm({
      title: course.title || "",
      slug: course.slug || "",
      category: course.category || "",
      summary: course.summary || "",
      duration: course.duration || "",
      mode: course.mode || "Offline + Online",
      price: course.price || 0,
      featured: course.featured || false,
    });
    setIsCourseModalOpen(true);
  };

  const handleNewCourse = () => {
    setEditingCourseId(null);
    setCourseForm(initialCourseForm);
    setIsCourseModalOpen(true);
  };

  const handleCloseCourseModal = () => {
    setEditingCourseId(null);
    setCourseForm(initialCourseForm);
    setIsCourseModalOpen(false);
  };

  const handleEditMaterial = (material) => {
    setEditingMaterialId(material._id);
    setMaterialForm({
      title: material.title || "",
      slug: material.slug || "",
      description: material.description || "",
      category: material.category || "",
      course: material.course || "",
      price: material.price || 0,
      downloadUrl: material.downloadUrl || "",
      featured: material.featured || false,
    });
    setIsMaterialModalOpen(true);
  };

  const handleNewMaterial = () => {
    setEditingMaterialId(null);
    setMaterialForm(initialMaterialForm);
    setIsMaterialModalOpen(true);
  };

  const handleCloseMaterialModal = () => {
    setEditingMaterialId(null);
    setMaterialForm(initialMaterialForm);
    setIsMaterialModalOpen(false);
  };

  const handleCreatePaymentReminder = async (event) => {
    event.preventDefault();
    if (!selectedStudent) return;

    try {
      await apiRequest(`/admin/students/${selectedStudent.student._id}/payments`, {
        method: "POST",
        body: JSON.stringify(paymentReminder),
      });
      await loadSummary();
      await loadStudentDetails(selectedStudent.student._id);
      await loadPayments();
      setPaymentReminder({ amount: "", dueDate: "", notes: "" });
      setStatusMessage("Payment request created for student.");
    } catch (error) {
      setStatusMessage(error.message);
    }
  };

  const handleCreateCourse = async (event) => {
    event.preventDefault();
    try {
      const path = editingCourseId ? `/admin/courses/${editingCourseId}` : "/admin/courses";
      const method = editingCourseId ? "PUT" : "POST";
      const data = await apiRequest(path, {
        method,
        body: JSON.stringify(courseForm),
      });
      setCourseForm(initialCourseForm);
      setEditingCourseId(null);
      setIsCourseModalOpen(false);
      await loadSummary();
      await loadCourses();
      setStatusMessage(editingCourseId ? "Course updated successfully." : "Course created successfully.");
    } catch (error) {
      setStatusMessage(error.message);
    }
  };

  const handleCreateStudyMaterial = async (event) => {
    event.preventDefault();
    try {
      const path = editingMaterialId ? `/admin/materials/${editingMaterialId}` : "/admin/materials";
      const method = editingMaterialId ? "PUT" : "POST";
      await apiRequest(path, {
        method,
        body: JSON.stringify(materialForm),
      });
      setMaterialForm(initialMaterialForm);
      setEditingMaterialId(null);
      setIsMaterialModalOpen(false);
      await loadSummary();
      await loadMaterials();
      setStatusMessage(editingMaterialId ? "Study material updated successfully." : "Study material created successfully.");
    } catch (error) {
      setStatusMessage(error.message);
    }
  };

  const handlePaymentStatus = async (payment) => {
    const studentId = payment.user?._id || payment.user;
    if (!studentId) return;

    try {
      await apiRequest(`/admin/students/${studentId}/payments/${payment._id}`, {
        method: "PUT",
        body: JSON.stringify({ status: "Paid" }),
      });
      await loadSummary();
      await loadPayments();
      if (selectedStudent?.student?._id === studentId) {
        await loadStudentDetails(studentId);
      }
      setStatusMessage("Payment marked as paid.");
    } catch (error) {
      setStatusMessage(error.message);
    }
  };

  const startDoubtAction = (doubt, mode) => {
    setDoubtAction({
      doubtId: doubt._id,
      mode,
      scheduledAt: formatDateTimeLocal(doubt.scheduledAt || doubt.preferredDate),
      googleMeetLink: doubt.googleMeetLink || "",
      remarks: mode === "reject" ? "" : doubt.adminResponse || "",
    });
  };

  const handleDoubtActionSubmit = async (event) => {
    event.preventDefault();

    const payload = {};
    if (doubtAction.mode === "accept") {
      payload.status = "Confirmed";
      payload.scheduledAt = doubtAction.scheduledAt;
      payload.googleMeetLink = doubtAction.googleMeetLink;
      if (doubtAction.remarks.trim()) {
        payload.adminResponse = doubtAction.remarks.trim();
      }
    }

    if (doubtAction.mode === "reject") {
      payload.status = "Cancelled";
      payload.adminResponse = doubtAction.remarks.trim();
    }

    if (doubtAction.mode === "reschedule") {
      payload.scheduledAt = doubtAction.scheduledAt;
      if (doubtAction.googleMeetLink.trim()) {
        payload.googleMeetLink = doubtAction.googleMeetLink;
      }
    }

    try {
      await apiRequest(`/admin/doubts/${doubtAction.doubtId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setStatusMessage(
        doubtAction.mode === "accept"
          ? "Doubt session scheduled and notification sent to student."
          : doubtAction.mode === "reject"
          ? "Doubt session rejected with remarks."
          : "Doubt session rescheduled successfully."
      );
      setDoubtAction(initialDoubtAction);
      await loadDoubts();
      setSectionLoaded((prev) => ({ ...prev, doubts: true }));
      if (selectedStudent?.student?._id) {
        await loadStudentDetails(selectedStudent.student._id);
      }
      await loadSummary();
    } catch (error) {
      setStatusMessage(error.message);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course? This will also remove all enrollments.")) return;
    try {
      await apiRequest(`/admin/courses/${courseId}`, { method: "DELETE" });
      await loadSummary();
      await loadCourses();
      setStatusMessage("Course deleted successfully.");
    } catch (error) {
      setStatusMessage(error.message);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm("Are you sure you want to delete this study material?")) return;
    try {
      await apiRequest(`/admin/materials/${materialId}`, { method: "DELETE" });
      await loadSummary();
      await loadMaterials();
      setStatusMessage("Study material deleted successfully.");
    } catch (error) {
      setStatusMessage(error.message);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm("Are you sure you want to delete this payment record?")) return;
    try {
      await apiRequest(`/admin/payments/${paymentId}`, { method: "DELETE" });
      await loadSummary();
      await loadPayments();
      setStatusMessage("Payment record deleted successfully.");
    } catch (error) {
      setStatusMessage(error.message);
    }
  };

  const handleDeleteDoubt = async (doubtId) => {
    if (!window.confirm("Are you sure you want to delete this doubt session?")) return;
    try {
      await apiRequest(`/admin/doubts/${doubtId}`, { method: "DELETE" });
      await loadDoubts();
      setSectionLoaded((prev) => ({ ...prev, doubts: true }));
      if (selectedStudent?.student?._id) {
        await loadStudentDetails(selectedStudent.student._id);
      }
      await loadSummary();
      setStatusMessage("Doubt session deleted successfully.");
    } catch (error) {
      setStatusMessage(error.message);
    }
  };

  const handleRescheduleDoubt = (doubt) => {
    setDoubtAction({
      doubtId: doubt._id,
      mode: "reschedule",
      scheduledAt: formatDateTimeLocal(doubt.scheduledAt || doubt.preferredDate),
      googleMeetLink: doubt.googleMeetLink || "",
      remarks: "",
    });
  };

  const renderStudentTable = (rows) => (
    <div className="table-wrapper" style={{ marginTop: 16 }}>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Class</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((student) => (
            <tr key={student._id}>
              <td>
                <Link to={`/admin/students/${student._id}`} className="student-name-link">
                  {student.name}
                </Link>
              </td>
              <td>{student.email}</td>
              <td>{student.studentClass || "-"}</td>
              <td>
                <div className="table-actions">
                  <Link to={`/admin/students/${student._id}`} className="ghost-button">
                    View
                  </Link>
                </div>
              </td>
            </tr>
          ))}
          {!rows.length && (
            <tr>
              <td colSpan="4">No students found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderDoubtCards = (rows) => (
    <div className="admin-doubt-list">
      {rows.length ? (
        rows.map((doubt) => {
          const isActionOpen = doubtAction.doubtId === doubt._id;
          const displayDate = doubt.scheduledAt || doubt.preferredDate;
          return (
            <article className="card admin-doubt-card" key={doubt._id}>
              <div className="admin-doubt-header">
                <div className="admin-doubt-heading">
                  <div className="admin-doubt-badges">
                    <span>{getDoubtStudentClass(doubt)}</span>
                    <span className={`status-badge ${getStatusBadgeClass(doubt.status)}`}>
                      {sessionStatusLabel(doubt.status)}
                    </span>
                  </div>
                  <h3>{doubt.topic}</h3>
                  <p>{formatDateTime(displayDate)}</p>
                </div>

                {doubt.status === "Completed" ? <span className="pill">Completed automatically</span> : null}
              </div>

              <div className="admin-doubt-body">
                <div className="admin-doubt-description">
                  <strong>Description</strong>
                  <p>{doubt.description}</p>
                </div>

                <div className="admin-doubt-meta">
                  <div className="admin-doubt-meta-item">
                    <span>Student</span>
                    <strong>{doubt.studentSnapshot?.name || doubt.user?.name}</strong>
                    <p>{doubt.studentSnapshot?.email || doubt.user?.email}</p>
                  </div>

                  <div className="admin-doubt-meta-item">
                    <span>Requested On</span>
                    <strong>{formatDateTime(doubt.bookedAt || doubt.createdAt)}</strong>
                  </div>

                  <div className="admin-doubt-meta-item">
                    <span>Preferred Time</span>
                    <strong>{formatDateTime(doubt.preferredDate)}</strong>
                  </div>

                  <div className="admin-doubt-meta-item">
                    <span>Scheduled Time</span>
                    <strong>{formatDateTime(doubt.scheduledAt)}</strong>
                  </div>

                  {doubt.googleMeetLink ? (
                    <div className="admin-doubt-meta-item admin-doubt-meta-item-wide">
                      <span>Meet Link</span>
                      <a href={doubt.googleMeetLink} target="_blank" rel="noreferrer">
                        {doubt.googleMeetLink}
                      </a>
                    </div>
                  ) : null}

                  {doubt.adminResponse ? (
                    <div className="admin-doubt-meta-item admin-doubt-meta-item-wide">
                      <span>Admin Remarks</span>
                      <p>{doubt.adminResponse}</p>
                    </div>
                  ) : null}
                </div>
              </div>

              {doubt.status === "Pending" ? (
                <div className="card-meta admin-doubt-actions" style={{ gap: 8 }}>
                  <button className="ghost-button" type="button" onClick={() => startDoubtAction(doubt, "accept")}>
                    Accept
                  </button>
                  <button className="ghost-button" type="button" onClick={() => startDoubtAction(doubt, "reject")}>
                    Reject
                  </button>
                </div>
              ) : null}

              {(doubt.status === "Confirmed" || doubt.status === "Completed") && doubt.status !== "Pending" ? (
                <div className="card-meta admin-doubt-actions" style={{ gap: 8, marginTop: 12 }}>
                  {doubt.status === "Confirmed" ? (
                    <button className="ghost-button" type="button" onClick={() => handleRescheduleDoubt(doubt)}>
                      Reschedule
                    </button>
                  ) : null}
                  <button className="ghost-button" type="button" onClick={() => handleDeleteDoubt(doubt._id)} style={{ color: "var(--danger-red)" }}>
                    Delete
                  </button>
                </div>
              ) : null}

              {isActionOpen ? (
                <form className="admin-doubt-form" onSubmit={handleDoubtActionSubmit} style={{ marginTop: 12, display: "grid", gap: 10 }}>
                  {doubtAction.mode === "accept" ? (
                    <>
                      <label>
                        Time slot
                        <input
                          type="datetime-local"
                          value={doubtAction.scheduledAt}
                          onChange={(event) =>
                            setDoubtAction((prev) => ({ ...prev, scheduledAt: event.target.value }))
                          }
                          required
                        />
                      </label>
                      <label>
                        Google Meet link
                        <input
                          type="url"
                          value={doubtAction.googleMeetLink}
                          onChange={(event) =>
                            setDoubtAction((prev) => ({ ...prev, googleMeetLink: event.target.value }))
                          }
                          placeholder="https://meet.google.com/..."
                          required
                        />
                      </label>
                      <label>
                        Optional remarks
                        <textarea
                          rows={3}
                          value={doubtAction.remarks}
                          onChange={(event) =>
                            setDoubtAction((prev) => ({ ...prev, remarks: event.target.value }))
                          }
                        />
                      </label>
                    </>
                  ) : null}

                  {doubtAction.mode === "reject" ? (
                    <label>
                      Rejection remarks
                      <textarea
                        rows={3}
                        value={doubtAction.remarks}
                        onChange={(event) =>
                          setDoubtAction((prev) => ({ ...prev, remarks: event.target.value }))
                        }
                        required
                      />
                    </label>
                  ) : null}

                  {doubtAction.mode === "reschedule" ? (
                    <>
                      <label>
                        New scheduled time
                        <input
                          type="datetime-local"
                          value={doubtAction.scheduledAt}
                          onChange={(event) =>
                            setDoubtAction((prev) => ({ ...prev, scheduledAt: event.target.value }))
                          }
                          required
                        />
                      </label>
                      <label>
                        Google Meet link (optional)
                        <input
                          type="url"
                          value={doubtAction.googleMeetLink}
                          onChange={(event) =>
                            setDoubtAction((prev) => ({ ...prev, googleMeetLink: event.target.value }))
                          }
                          placeholder="https://meet.google.com/..."
                        />
                      </label>
                    </>
                  ) : null}

                  <div className="card-meta" style={{ gap: 8 }}>
                    <button className="solid-button" type="submit">
                      Save
                    </button>
                    <button className="ghost-button" type="button" onClick={() => setDoubtAction(initialDoubtAction)}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : null}
            </article>
          );
        })
      ) : (
        <article className="card">No doubt requests available.</article>
      )}
    </div>
  );

  return (
    <div className="page section admin-page">
      <div className="dashboard-hero admin-hero">
        <div className="admin-hero-grid">
          <div className="admin-hero-copy">
            <span className="pill">Admin Panel</span>
            <h1>Welcome back, admin.</h1>
            <p>Monitor students, course activity, payments and doubt sessions from one unified dashboard.</p>
          </div>

          <div className="admin-hero-stats">
            <article className="admin-hero-stat stat-blue">
              <div>
                <span className="pill pill-soft">Students</span>
                <h3>{summary?.totalStudents ?? 0}</h3>
              </div>
              <span className="admin-hero-stat-icon">🎓</span>
            </article>
            <article className="admin-hero-stat stat-coral">
              <div>
                <span className="pill pill-soft">Courses</span>
                <h3>{summary?.totalCourses ?? 0}</h3>
              </div>
              <span className="admin-hero-stat-icon">📚</span>
            </article>
            <article className="admin-hero-stat stat-amber">
              <div>
                <span className="pill pill-soft">Materials</span>
                <h3>{summary?.totalMaterials ?? 0}</h3>
              </div>
              <span className="admin-hero-stat-icon">📝</span>
            </article>
            <article className="admin-hero-stat stat-emerald">
              <div>
                <span className="pill pill-soft">Wallet</span>
                <h3>₹{summary?.totalRevenue ?? 0}</h3>
              </div>
              <span className="admin-hero-stat-icon">💰</span>
            </article>
            <article className="admin-hero-stat stat-coral">
              <div>
                <span className="pill pill-soft">Payment requests</span>
                <h3>{summary?.pendingPayments ?? 0}</h3>
              </div>
              <span className="admin-hero-stat-icon">💳</span>
            </article>
            <article className="admin-hero-stat stat-teal">
              <div>
                <span className="pill pill-soft">Open doubts</span>
                <h3>{summary?.pendingDoubts ?? 0}</h3>
              </div>
              <span className="admin-hero-stat-icon">❓</span>
            </article>
          </div>
        </div>
      </div>

      <div className="admin-main-grid">
        <aside className="card admin-sidebar">
          <div className="admin-sidebar-profile">
            <div className="admin-sidebar-avatar">{userInitial}</div>
            <div>
              <p className="admin-sidebar-user">{user?.name || "Admin"}</p>
            </div>
          </div>

          <div className="admin-nav-list">
            {navItems.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`${activeSection === item.key ? "solid-button" : "ghost-button"} admin-nav-button`}
                onClick={() => handleSectionChange(item.key)}
              >
                {item.label}
                {navCounts[item.key] > 0 ? <span className="admin-nav-count">{navCounts[item.key]}</span> : null}
              </button>
            ))}
          </div>
        </aside>

        <section className="admin-content">
          {loading ? (
            <div className="app-loading-block">
              <Spinner message="Loading admin dashboard..." />
            </div>
          ) : null}
          {sectionLoading && !loading ? (
            <div className="app-loading-block">
              <Spinner message="Loading section data..." />
            </div>
          ) : null}

          {!loading && activeSection === "notifications" ? (
            <article className="card admin-section-card">
              <div className="section-heading">
                <span className="pill">System Announcements</span>
                <h2>Manage Notifications</h2>
                <p>Create and manage system-wide notifications visible to all students on their dashboard and homepage.</p>
              </div>
              <AdminNotificationManager token={token} />
            </article>
          ) : null}

          {!loading && activeSection === "students" ? (
            <>
              <article className="card admin-section-card">
                <label>
                  Search students
                  <input value={studentSearch} onChange={handleStudentSearch} placeholder="Search by name or email" />
                </label>
                {renderStudentTable(students)}
              </article>

              {selectedStudent ? (
                <div className="admin-student-grid">
                  <article className="card admin-section-card admin-student-summary">
                    <div className="section-heading">
                      <span className="pill">Selected student</span>
                      <h3>{selectedStudent.student.name}</h3>
                    </div>
                    <p>Email: {selectedStudent.student.email}</p>
                    <p>Class: {selectedStudent.student.studentClass || "-"}</p>
                    <p>Total received: ₹{selectedStudent.totalPaid ?? 0}</p>
                    <p>Pending due: ₹{selectedStudent.feesDue ?? 0}</p>
                  </article>

                  <article className="card admin-section-card">
                    <div className="section-heading">
                      <span className="pill">Payments</span>
                      <h3>Create payment request</h3>
                    </div>
                    <form className="admin-payment-form" onSubmit={handleCreatePaymentReminder}>
                      <label>
                        Amount
                        <input
                          type="number"
                          value={paymentReminder.amount}
                          onChange={(event) =>
                            setPaymentReminder((prev) => ({ ...prev, amount: Number(event.target.value) }))
                          }
                          required
                        />
                      </label>
                      <label>
                        Due date
                        <input
                          type="date"
                          value={paymentReminder.dueDate}
                          onChange={(event) =>
                            setPaymentReminder((prev) => ({ ...prev, dueDate: event.target.value }))
                          }
                          required
                        />
                      </label>
                      <label>
                        Notes
                        <textarea
                          value={paymentReminder.notes}
                          onChange={(event) =>
                            setPaymentReminder((prev) => ({ ...prev, notes: event.target.value }))
                          }
                        />
                      </label>
                      <button className="solid-button" type="submit">
                        Send payment request
                      </button>
                    </form>
                  </article>
                </div>
              ) : null}
            </>
          ) : null}

          {!loading && activeSection === "courses" ? (
            <>
              <article className="card admin-section-card">
                <div className="section-heading">
                  <span className="pill">Courses</span>
                  <h2>Manage existing courses</h2>
                  <p>Review all courses, then use the button to open the course form in a modal.</p>
                </div>
                <button className="solid-button" type="button" onClick={handleNewCourse} style={{ marginBottom: 16 }}>
                  Create new course
                </button>
                {coursesList.length ? (
                  <div className="table-wrapper" style={{ marginTop: 16 }}>
                    <table>
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Category</th>
                          <th>Duration</th>
                          <th>Price</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {coursesList.map((course) => (
                          <tr key={course._id}>
                            <td>{course.title}</td>
                            <td>{course.category}</td>
                            <td>{course.duration}</td>
                            <td>₹{course.price || 0}</td>
                            <td>
                              <div className="table-actions">
                                <button className="ghost-button" type="button" onClick={() => handleEditCourse(course)}>
                                  Edit
                                </button>
                                <button className="ghost-button" type="button" onClick={() => handleDeleteCourse(course._id)} style={{ color: "var(--danger-red)" }}>
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <article className="card">No courses available yet.</article>
                )}
              </article>
            </>
          ) : null}

          {!loading && activeSection === "course-content" ? (
            <article className="card admin-section-card">
              <div className="section-heading">
                <span className="pill">Course Content</span>
                <h2>Manage course content</h2>
                <p>Create sections and lessons for your courses</p>
              </div>
              <button 
                className="solid-button" 
                type="button" 
                onClick={() => navigate("/admin/course-content")}
              >
                Open Course Content Manager →
              </button>
            </article>
          ) : null}

          {!loading && activeSection === "materials" ? (
            <>
              <article className="card admin-section-card">
                <div className="section-heading">
                  <span className="pill">Study materials</span>
                  <h2>Manage study materials</h2>
                  <p>Review all study packs, then use the button to open the material form in a modal.</p>
                </div>
                <button className="solid-button" type="button" onClick={handleNewMaterial} style={{ marginBottom: 16 }}>
                  Create new material
                </button>
                {materialsList.length ? (
                  <div className="table-wrapper" style={{ marginTop: 16 }}>
                    <table>
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Course</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {materialsList.map((material) => (
                          <tr key={material._id}>
                            <td>{material.title}</td>
                            <td>{material.course}</td>
                            <td>{material.category}</td>
                            <td>₹{material.price || 0}</td>
                            <td>
                              <div className="table-actions">
                                <button className="ghost-button" type="button" onClick={() => handleEditMaterial(material)}>
                                  Edit
                                </button>
                                <button className="ghost-button" type="button" onClick={() => handleDeleteMaterial(material._id)} style={{ color: "var(--danger-red)" }}>
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <article className="card">No study materials available yet.</article>
                )}
              </article>
            </>
          ) : null}

          {!loading && activeSection === "payments" ? (
            <article className="card admin-section-card">
              <div className="section-heading">
                <span className="pill">Payments</span>
                <h2>Payment requests and history</h2>
                <p>View pending and paid records together, with action only where needed.</p>
                <button 
                  className="ghost-button" 
                  style={{ marginTop: "12px" }}
                  onClick={() => setShowAllPayments(!showAllPayments)}
                >
                  {showAllPayments ? "View Pending Only" : "View Payment History"}
                </button>
                <p style={{ marginTop: "12px" }}>
                  {showAllPayments ? `Total received and pending listed here: ₹${totalVisiblePayments}` : `Total pending amount: ₹${totalVisiblePayments}`}
                </p>
              </div>
              <div className="table-wrapper admin-payment-table">
                <table>
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Amount</th>
                      <th>Due / Paid Date</th>
                      <th>Status</th>
                      <th>Notes</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments
                      .filter((payment) => showAllPayments || payment.status === "Pending")
                      .map((payment) => (
                        <tr key={payment._id}>
                          <td>{payment.user?.name || "Student"}</td>
                          <td>₹{payment.amount}</td>
                          <td>{formatDateTime(payment.paidAt || payment.dueDate || payment.updatedAt || payment.createdAt)}</td>
                          <td>
                            <span className={`status-badge ${getStatusBadgeClass(payment.status)}`}>{payment.status}</span>
                          </td>
                          <td>{payment.notes || "-"}</td>
                          <td>
                            <div className="table-actions">
                              {payment.status === "Pending" ? (
                                <button className="ghost-button" type="button" onClick={() => handlePaymentStatus(payment)}>
                                  Mark Paid
                                </button>
                              ) : null}
                              <button className="ghost-button" type="button" onClick={() => handleDeletePayment(payment._id)} style={{ color: "var(--danger-red)" }}>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {!payments.filter((payment) => showAllPayments || payment.status === "Pending").length && (
                      <tr>
                        <td colSpan="6">{showAllPayments ? "No payment records found." : "No pending payments."}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </article>
          ) : null}

          {!loading && activeSection === "doubts" ? (
            <article className="card admin-section-card">
              <div className="section-heading">
                <span className="pill">Doubt sessions</span>
                <h2>All doubt session history</h2>
                <p>Review pending, scheduled, completed, and rejected sessions in one place.</p>
              </div>
              {renderDoubtCards(allDoubts)}
            </article>
          ) : null}

          {!loading && activeSection === "completed-doubts" ? (
            <article className="card admin-section-card">
              <div className="section-heading">
                <span className="pill">Completed doubts</span>
                <h2>Completed doubt session history</h2>
                <p>View all doubt sessions that have been completed.</p>
              </div>
              {renderDoubtCards(completedDoubts)}
            </article>
          ) : null}

          {!loading && activeSection === "enrollments" ? (
            <article className="card admin-section-card">
              <div className="section-heading">
                <span className="pill">Enrollment Requests</span>
                <h2>Manage enrollment requests</h2>
                <p>Review and approve pending enrollment requests from new students.</p>
              </div>
              <div style={{ marginTop: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
                <button 
                  className="ghost-button" 
                  onClick={() => handleSectionChange("enrollments")}
                  style={{ marginBottom: "0px" }}
                >
                  ↻ Refresh Enrollments
                </button>
                <div style={{ display: "flex", gap: "10px", marginLeft: "20px" }}>
                  <button 
                    style={{
                      padding: "8px 16px",
                      backgroundColor: enrollmentView === "pending" ? "#007bff" : "#e0e0e0",
                      color: enrollmentView === "pending" ? "white" : "#333",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "14px"
                    }}
                    onClick={() => setEnrollmentView("pending")}
                  >
                    Pending
                  </button>
                  <button 
                    style={{
                      padding: "8px 16px",
                      backgroundColor: enrollmentView === "history" ? "#007bff" : "#e0e0e0",
                      color: enrollmentView === "history" ? "white" : "#333",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "14px"
                    }}
                    onClick={() => {
                      setEnrollmentView("history");
                      loadEnrollmentHistory();
                    }}
                  >
                    History
                  </button>
                </div>
              </div>
              {sectionLoading ? (
                <Spinner message={enrollmentView === "pending" ? "Loading pending enrollments..." : "Loading enrollment history..."} />
              ) : (enrollmentView === "pending" ? enrollments : enrollmentHistory).length > 0 ? (
                <div className="table-wrapper" style={{ marginTop: 16 }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Class</th>
                        <th>School</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(enrollmentView === "pending" ? enrollments : enrollmentHistory).map((enrollment) => (
                        <tr key={enrollment._id}>
                          <td>{enrollment.studentName}</td>
                          <td>{enrollment.email}</td>
                          <td>{enrollment.phone}</td>
                          <td>{enrollment.studentClass}</td>
                          <td>{enrollment.schoolName || "-"}</td>
                          <td>
                            <span className={`status-badge ${getStatusBadgeClass(enrollment.status)}`}>
                              {enrollment.status}
                            </span>
                          </td>
                          <td>{formatDate(enrollment.createdAt)}</td>
                          <td>
                            <div className="table-actions">
                              <button 
                                className="ghost-button" 
                                onClick={() => handleViewEnrollment(enrollment)}
                                style={{ fontSize: "12px", color: "blue" }}
                                title="View enrollment details"
                              >
                                👁 View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <article className="card">
                  {enrollmentView === "pending" ? "No pending enrollment requests found." : "No enrollment history found."}
                </article>
              )}
            </article>
          ) : null}

          {statusMessage ? <p style={{ marginTop: 16, color: "var(--text)" }}>{statusMessage}</p> : null}
        </section>
      </div>

      {isEnrollmentModalOpen && selectedEnrollment ? (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true" onClick={handleCloseEnrollmentModal}>
          <article className="card admin-section-card admin-modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="section-heading">
                <span className="pill">Enrollment Details</span>
                <h2>{selectedEnrollment.studentName}</h2>
              </div>
              <button className="ghost-button" type="button" onClick={handleCloseEnrollmentModal}>
                Close
              </button>
            </div>
            <div className="admin-payment-form" style={{ padding: "20px" }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}>
                <div>
                  <label style={{ fontWeight: "600", color: "#666" }}>Student Name:</label>
                  <p style={{ margin: "5px 0 15px 0", fontSize: "15px" }}>{selectedEnrollment.studentName}</p>
                </div>
                <div>
                  <label style={{ fontWeight: "600", color: "#666" }}>Email:</label>
                  <p style={{ margin: "5px 0 15px 0", fontSize: "15px" }}>{selectedEnrollment.email}</p>
                </div>
                <div>
                  <label style={{ fontWeight: "600", color: "#666" }}>Phone:</label>
                  <p style={{ margin: "5px 0 15px 0", fontSize: "15px" }}>{selectedEnrollment.phone}</p>
                </div>
                <div>
                  <label style={{ fontWeight: "600", color: "#666" }}>Class:</label>
                  <p style={{ margin: "5px 0 15px 0", fontSize: "15px" }}>{selectedEnrollment.studentClass}</p>
                </div>
                <div>
                  <label style={{ fontWeight: "600", color: "#666" }}>Parent/Guardian Name:</label>
                  <p style={{ margin: "5px 0 15px 0", fontSize: "15px" }}>{selectedEnrollment.parentsName}</p>
                </div>
                <div>
                  <label style={{ fontWeight: "600", color: "#666" }}>Parent's Phone:</label>
                  <p style={{ margin: "5px 0 15px 0", fontSize: "15px" }}>{selectedEnrollment.parentsPhone}</p>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ fontWeight: "600", color: "#666" }}>Address:</label>
                  <p style={{ margin: "5px 0 15px 0", fontSize: "15px" }}>{selectedEnrollment.address}</p>
                </div>
                <div>
                  <label style={{ fontWeight: "600", color: "#666" }}>Status:</label>
                  <p style={{ margin: "5px 0 15px 0", fontSize: "15px" }}>
                    <span className={`status-badge ${getStatusBadgeClass(selectedEnrollment.status)}`}>
                      {selectedEnrollment.status}
                    </span>
                  </p>
                </div>
                <div>
                  <label style={{ fontWeight: "600", color: "#666" }}>Submitted On:</label>
                  <p style={{ margin: "5px 0 15px 0", fontSize: "15px" }}>{formatDateTime(selectedEnrollment.createdAt)}</p>
                </div>
                {selectedEnrollment.adminNotes && (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ fontWeight: "600", color: "#666" }}>Admin Notes:</label>
                    <p style={{ margin: "5px 0 15px 0", fontSize: "15px" }}>{selectedEnrollment.adminNotes}</p>
                  </div>
                )}
              </div>
              <div style={{
                marginTop: "30px",
                display: "flex",
                gap: "15px",
                justifyContent: "flex-end",
                borderTop: "1px solid #e0e0e0",
                paddingTop: "20px"
              }}>
                <button 
                  className="ghost-button" 
                  onClick={handleCloseEnrollmentModal}
                  style={{ 
                    padding: "10px 20px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    borderRadius: "6px"
                  }}
                >
                  Close
                </button>
                {selectedEnrollment.status === "Pending" && enrollmentView === "pending" && (
                  <>
                    <button 
                      className="ghost-button" 
                      onClick={() => {
                        handleRejectEnrollment(selectedEnrollment);
                        handleCloseEnrollmentModal();
                      }}
                      disabled={actionLoading}
                      style={{ 
                        padding: "10px 20px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        borderRadius: "6px",
                        cursor: actionLoading ? "not-allowed" : "pointer"
                      }}
                      title="Reject enrollment"
                    >
                      ✕ Reject
                    </button>
                    <button 
                      className="ghost-button" 
                      onClick={() => {
                        handleApproveEnrollment(selectedEnrollment);
                        handleCloseEnrollmentModal();
                      }}
                      disabled={actionLoading}
                      style={{ 
                        padding: "10px 20px",
                        backgroundColor: "#28a745",
                        color: "white",
                        borderRadius: "6px",
                        cursor: actionLoading ? "not-allowed" : "pointer"
                      }}
                      title="Approve enrollment"
                    >
                      ✓ Approve
                    </button>
                  </>
                )}
              </div>
            </div>
          </article>
        </div>
      ) : null}

      {isCourseModalOpen ? (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true" onClick={handleCloseCourseModal}>
          <article className="card admin-section-card admin-modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="section-heading">
                <span className="pill">{editingCourseId ? "Edit course" : "Create a new course"}</span>
                <h2>{editingCourseId ? "Update course details" : "Create a new course"}</h2>
              </div>
              <button className="ghost-button" type="button" onClick={handleCloseCourseModal}>
                Close
              </button>
            </div>
            <form className="admin-payment-form" onSubmit={handleCreateCourse}>
              <label>
                Title
                <input
                  value={courseForm.title}
                  onChange={(event) => setCourseForm((prev) => ({ ...prev, title: event.target.value }))}
                  required
                />
              </label>
              <label>
                Slug
                <input
                  value={courseForm.slug}
                  onChange={(event) => setCourseForm((prev) => ({ ...prev, slug: event.target.value }))}
                  placeholder="auto-generated from title"
                />
              </label>
              <label>
                Category
                <input
                  value={courseForm.category}
                  onChange={(event) => setCourseForm((prev) => ({ ...prev, category: event.target.value }))}
                  required
                />
              </label>
              <label>
                Summary
                <textarea
                  value={courseForm.summary}
                  onChange={(event) => setCourseForm((prev) => ({ ...prev, summary: event.target.value }))}
                  rows={3}
                  required
                />
              </label>
              <label>
                Duration
                <input
                  value={courseForm.duration}
                  onChange={(event) => setCourseForm((prev) => ({ ...prev, duration: event.target.value }))}
                  placeholder="e.g. 6 months"
                  required
                />
              </label>
              <label>
                Mode
                <input
                  value={courseForm.mode}
                  onChange={(event) => setCourseForm((prev) => ({ ...prev, mode: event.target.value }))}
                />
              </label>
              <label>
                Price
                <input
                  type="number"
                  value={courseForm.price}
                  onChange={(event) => setCourseForm((prev) => ({ ...prev, price: event.target.value }))}
                  min="0"
                />
              </label>
              <label>
                Featured
                <input
                  type="checkbox"
                  checked={courseForm.featured}
                  onChange={(event) => setCourseForm((prev) => ({ ...prev, featured: event.target.checked }))}
                />
              </label>
              <div className="admin-modal-actions">
                <button className="solid-button" type="submit">
                  {editingCourseId ? "Update course" : "Create course"}
                </button>
                <button className="ghost-button" type="button" onClick={handleCloseCourseModal}>
                  Cancel
                </button>
              </div>
            </form>
          </article>
        </div>
      ) : null}

      {isMaterialModalOpen ? (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true" onClick={handleCloseMaterialModal}>
          <article className="card admin-section-card admin-modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="section-heading">
                <span className="pill">{editingMaterialId ? "Edit study material" : "Add a new study material"}</span>
                <h2>{editingMaterialId ? "Update study material" : "Add a new study material"}</h2>
              </div>
              <button className="ghost-button" type="button" onClick={handleCloseMaterialModal}>
                Close
              </button>
            </div>
            <form className="admin-payment-form" onSubmit={handleCreateStudyMaterial}>
              <label>
                Title
                <input
                  value={materialForm.title}
                  onChange={(event) => setMaterialForm((prev) => ({ ...prev, title: event.target.value }))}
                  required
                />
              </label>
              <label>
                Slug
                <input
                  value={materialForm.slug}
                  onChange={(event) => setMaterialForm((prev) => ({ ...prev, slug: event.target.value }))}
                  placeholder="auto-generated from title"
                />
              </label>
              <label>
                Description
                <textarea
                  value={materialForm.description}
                  onChange={(event) => setMaterialForm((prev) => ({ ...prev, description: event.target.value }))}
                  rows={3}
                  required
                />
              </label>
              <label>
                Course
                <input
                  value={materialForm.course}
                  onChange={(event) => setMaterialForm((prev) => ({ ...prev, course: event.target.value }))}
                />
              </label>
              <label>
                Category
                <input
                  value={materialForm.category}
                  onChange={(event) => setMaterialForm((prev) => ({ ...prev, category: event.target.value }))}
                />
              </label>
              <label>
                Download URL
                <input
                  value={materialForm.downloadUrl}
                  onChange={(event) => setMaterialForm((prev) => ({ ...prev, downloadUrl: event.target.value }))}
                  required
                />
              </label>
              <label>
                Price
                <input
                  type="number"
                  value={materialForm.price}
                  onChange={(event) => setMaterialForm((prev) => ({ ...prev, price: event.target.value }))}
                  min="0"
                />
              </label>
              <label>
                Featured
                <input
                  type="checkbox"
                  checked={materialForm.featured}
                  onChange={(event) => setMaterialForm((prev) => ({ ...prev, featured: event.target.checked }))}
                />
              </label>
              <div className="admin-modal-actions">
                <button className="solid-button" type="submit">
                  {editingMaterialId ? "Update material" : "Create material"}
                </button>
                <button className="ghost-button" type="button" onClick={handleCloseMaterialModal}>
                  Cancel
                </button>
              </div>
            </form>
          </article>
        </div>
      ) : null}
    </div>
  );
}
