import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  { key: "materials", label: "Study materials" },
  { key: "payments", label: "Payments" },
  { key: "doubts", label: "Doubt Sessions" },
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
  const { token, user } = useAuth();
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "A";

  const [activeSection, setActiveSection] = useState("students");
  const [summary, setSummary] = useState(null);
  const [students, setStudents] = useState([]);
  const [allDoubts, setAllDoubts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [showAllPayments, setShowAllPayments] = useState(false);
  const [coursesList, setCoursesList] = useState([]);
  const [materialsList, setMaterialsList] = useState([]);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editingMaterialId, setEditingMaterialId] = useState(null);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentSearch, setStudentSearch] = useState("");
  const [paymentReminder, setPaymentReminder] = useState({ amount: "", dueDate: "", notes: "" });
  const [courseForm, setCourseForm] = useState(initialCourseForm);
  const [materialForm, setMaterialForm] = useState(initialMaterialForm);
  const [doubtAction, setDoubtAction] = useState(initialDoubtAction);
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [sectionLoaded, setSectionLoaded] = useState({
    payments: false,
    doubts: false,
    courses: false,
    materials: false,
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

    if (section === "students") {
      await loadStudents(studentSearch);
    }
  };

  useEffect(() => {
    if (!token) return;

    const initialLoad = async () => {
      setLoading(true);
      try {
        await Promise.all([loadSummary(), loadStudents()]);
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
      // Navigate to exam management page
      window.location.href = "/admin/exams";
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

    try {
      await apiRequest(`/admin/doubts/${doubtAction.doubtId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setStatusMessage(
        doubtAction.mode === "accept"
          ? "Doubt session scheduled and notification sent to student."
          : "Doubt session rejected with remarks."
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
              <td>{student.name}</td>
              <td>{student.email}</td>
              <td>{student.studentClass || "-"}</td>
              <td>
                <div className="table-actions">
                  <button className="ghost-button" type="button" onClick={() => handleSelectStudent(student._id)}>
                    View
                  </button>
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
              <p className="admin-sidebar-role">Administrator</p>
            </div>
          </div>
          <div className="section-heading admin-sidebar-heading">
            <span className="pill">Navigation</span>
            <h3>Admin sections</h3>
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
              </button>
            ))}
          </div>
        </aside>

        <section className="admin-content">
          {loading ? <article className="card admin-section-card">Loading admin data...</article> : null}
          {sectionLoading && !loading ? <article className="card admin-section-card">Loading section data...</article> : null}

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
                            {payment.status === "Pending" ? (
                              <button className="ghost-button" type="button" onClick={() => handlePaymentStatus(payment)}>
                                Mark Paid
                              </button>
                            ) : (
                              "-"
                            )}
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

          {statusMessage ? <p style={{ marginTop: 16, color: "var(--text)" }}>{statusMessage}</p> : null}
        </section>
      </div>

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
