import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { API_BASE } from "../api";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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

const getSessionClassLabel = (session, fallbackClass = "") => {
  return session?.studentSnapshot?.studentClass || fallbackClass || "Class not set";
};

export default function DashboardPage() {
  const { token, user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [booking, setBooking] = useState({ topic: "", preferredDate: "", description: "" });
  const [bookingMessage, setBookingMessage] = useState("");
  const [showDoubtForm, setShowDoubtForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState("currentCourse");

  const navItems = [
    { id: "currentCourse", label: "Current course" },
    { id: "studyMaterial", label: "Study material" },
    { id: "upcomingExams", label: "Upcoming exams" },
    { id: "recentExamResult", label: "Recent exam result" },
    { id: "testPerformance", label: "Test performance" },
    { id: "fees", label: "Fees" },
    { id: "recordedSession", label: "Upcoming recorded session" },
    { id: "bookSession", label: "Book session" },
  ];

  const summaryCards = useMemo(
    () => [
      {
        label: "Courses enrolled",
        value: dashboard?.enrollments?.length ?? 0,
        className: "stat-blue",
        icon: "🎓",
      },
      {
        label: "Open doubts",
        value: dashboard?.summary?.upcomingDoubts ?? 0,
        className: "stat-coral",
        icon: "❓",
      },
      {
        label: "Payment due",
        value: dashboard?.summary?.pendingPayments ?? 0,
        className: "stat-amber",
        icon: "💳",
      },
      {
        label: "Upcoming exams",
        value: upcomingExams?.length ?? 0,
        className: "stat-teal",
        icon: "📅",
      },
    ],
    [dashboard, upcomingExams]
  );

  const loadDashboard = async () => {
    try {
      const response = await fetch(`${API_BASE}/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to load dashboard");
      }
      const json = await response.json();
      setDashboard(json);
    } catch (error) {
      setDashboard(null);
    }
  };

  const loadExams = async () => {
    try {
      const [upcomingRes, resultsRes] = await Promise.all([
        fetch(`${API_BASE}/exams/student/upcoming`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/exams/student/results`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (upcomingRes.ok) {
        const upcomingData = await upcomingRes.json();
        setUpcomingExams(upcomingData || []);
      }

      if (resultsRes.ok) {
        const resultsData = await resultsRes.json();
        setRecentResults(resultsData.slice(0, 3) || []);
      }
    } catch (error) {
      console.error("Error loading exams:", error);
    }
  };

  useEffect(() => {
    if (!token) return;

    const loadAll = async () => {
      setLoading(true);
      await Promise.all([loadDashboard(), loadExams()]);
      setLoading(false);
    };

    loadAll();
  }, [token]);

  const handleBookingSubmit = async (event) => {
    event.preventDefault();
    setBookingMessage("");

    try {
      const response = await fetch(`${API_BASE}/dashboard/doubts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(booking),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.message || "Unable to book the doubt session.");
      }

      await loadDashboard();
      setBooking({ topic: "", preferredDate: "", description: "" });
      setBookingMessage("Doubt session request submitted successfully.");
    } catch (error) {
      setBookingMessage(error.message);
    }
  };

  const handleJoinDoubt = async (session) => {
    if (!session.googleMeetLink) return;

    try {
      const response = await fetch(`${API_BASE}/dashboard/doubts/${session._id}/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || "Unable to record attendance.");
      }

      window.open(payload.googleMeetLink, "_blank", "noopener,noreferrer");
      await loadDashboard();
    } catch (error) {
      setBookingMessage(error.message);
    }
  };

  const handleCancelDoubt = async (session) => {
    try {
      const response = await fetch(`${API_BASE}/dashboard/doubts/${session._id}/cancel`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || "Unable to cancel doubt session.");
      }
      await loadDashboard();
    } catch (error) {
      setBookingMessage(error.message);
    }
  };

  return (
    <div className="page section student-dashboard-page">
      <div className="dashboard-hero admin-hero">
        <div className="admin-hero-grid">
          <div className="admin-hero-copy">
            <span className="pill">Student Dashboard</span>
            <h1>Welcome back, {user?.name}</h1>
            <p>Track your enrolled courses, payments, doubts and upcoming exams from one dashboard.</p>
          </div>

          <div className="admin-hero-stats">
            {summaryCards.map((item) => (
              <div key={item.label} className={`admin-hero-stat ${item.className}`}>
                <div>
                  <span className="pill">{item.label}</span>
                  <h3>{item.value}</h3>
                </div>
                <div className="admin-hero-stat-icon">{item.icon}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-layout">
        <aside className="dashboard-sidebar card">
          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`sidebar-item ${selectedSection === item.id ? "active" : ""}`}
                onClick={() => setSelectedSection(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="dashboard-main">
          {loading ? (
            <div className="app-loading-block">
              <Spinner message="Loading dashboard..." />
            </div>
          ) : (
            <>
              <div className="section-heading">
                <span className="pill">{navItems.find((item) => item.id === selectedSection)?.label}</span>
                <h2>{{
                  currentCourse: "Current course",
                  studyMaterial: "Study material",
                  upcomingExams: "Upcoming exams",
                  recentExamResult: "Recent exam result",
                  testPerformance: "Test performance",
                  fees: "Fees",
                  recordedSession: "Upcoming recorded session",
                  bookSession: "Book session",
                }[selectedSection]}</h2>
                <p>
                  {selectedSection === "currentCourse" && "Track your enrolled courses and progress."}
                  {selectedSection === "studyMaterial" && "Access downloadable notes and resources for your classes."}
                  {selectedSection === "upcomingExams" && "Review exams scheduled for your enrolled subjects."}
                  {selectedSection === "recentExamResult" && "See the latest exam score and release status."}
                  {selectedSection === "testPerformance" && "Analyze your recent test performance over time."}
                  {selectedSection === "fees" && "Review fee status, pending payments and receipts."}
                  {selectedSection === "recordedSession" && "Open upcoming classes and recorded sessions."}
                  {selectedSection === "bookSession" && "Request a new doubt session with your mentor."}
                </p>
              </div>

              {selectedSection === "currentCourse" && (
                <div className="card-grid">
              {dashboard?.enrollments?.length ? (
                dashboard.enrollments.map((enrollment) => (
                  <article className="card" key={enrollment._id}>
                    <div className="card-topline">
                      <span>{enrollment.course?.category}</span>
                      <span>{enrollment.status}</span>
                    </div>
                    <h3>{enrollment.course?.title}</h3>
                    <p>{enrollment.course?.summary}</p>
                    <div className="card-meta">
                      <span>Progress: {enrollment.progress}%</span>
                      <span>{enrollment.completedLessons}/{enrollment.totalLessons} lessons</span>
                    </div>
                  </article>
                ))
              ) : (
                <article className="card">No enrolled courses found.</article>
              )}
            </div>
          )}

          {selectedSection === "studyMaterial" && (
            <div className="card-grid">
              {dashboard?.purchasedMaterials?.length ? (
                dashboard.purchasedMaterials.map((material) => (
                  <article className="card" key={material._id}>
                    <div className="card-topline">
                      <span>{material.category}</span>
                      <span>{material.course || "Study pack"}</span>
                    </div>
                    <h3>{material.title}</h3>
                    <p>{material.description}</p>
                    <div className="card-meta">
                      <a className="ghost-button" href={material.downloadUrl} target="_blank" rel="noreferrer">
                        Download
                      </a>
                    </div>
                  </article>
                ))
              ) : (
                <article className="card">No study materials available yet.</article>
              )}
            </div>
          )}

          {selectedSection === "upcomingExams" && (
            <div className="card-grid">
              {upcomingExams?.length ? (
                upcomingExams.map((exam) => (
                  <article className="card" key={exam._id}>
                    <div className="card-topline">
                      <span>{exam.status}</span>
                      <span>{exam.duration} mins</span>
                    </div>
                    <h3>{exam.title}</h3>
                    <p>{exam.totalQuestions} Questions | {exam.duration} Minutes</p>
                    <div className="card-meta">
                      <span>{formatDate(exam.scheduledDate)} at {exam.scheduledTime}</span>
                      <Link className="ghost-button" to={`/exams/${exam._id}`}>
                        Start Test
                      </Link>
                    </div>
                  </article>
                ))
              ) : (
                <article className="card">No upcoming exams scheduled.</article>
              )}
            </div>
          )}

          {selectedSection === "recentExamResult" && (
            <div className="card-grid">
              {recentResults?.length ? (
                recentResults.map((result) => (
                  <article className="card" key={result._id}>
                    <div className="card-topline">
                      <span>{result.resultReleased ? result.grade : "Pending"}</span>
                      <span className={`status-badge ${getStatusBadgeClass(result.resultReleased ? result.status : "Pending")}`}>
                        {result.resultReleased ? "Released" : "Pending"}
                      </span>
                    </div>
                    <h3>{result.resultReleased ? `${result.marksObtained}/${result.totalMarks}` : "Result pending"}</h3>
                    <p>{result.examTitle}</p>
                    <div className="card-meta">
                      <span>{result.resultReleased ? `${result.percentage}% | ` : ""}{formatDate(result.scheduledDate)}</span>
                      {result.resultReleased && (
                        <Link className="ghost-button" to="/results">
                          View Details
                        </Link>
                      )}
                    </div>
                  </article>
                ))
              ) : (
                <article className="card">No exam results yet.</article>
              )}
            </div>
          )}

          {selectedSection === "testPerformance" && (
            <div className="card-grid">
              {dashboard?.testResults?.length ? (
                dashboard.testResults.map((result) => (
                  <article className="card" key={result._id}>
                    <div className="card-topline">
                      <span>{result.examName}</span>
                      <span>{result.grade || `${result.percentile}%`}</span>
                    </div>
                    <h3>{result.score}/{result.maxScore}</h3>
                    <p>{result.course || "Course assessment"}</p>
                    <div className="card-meta">
                      <span>{formatDate(result.date)}</span>
                    </div>
                  </article>
                ))
              ) : (
                <article className="card">No test performance data available yet.</article>
              )}
            </div>
          )}

          {selectedSection === "fees" && (
            <div className="card-grid">
              {dashboard?.payments?.length ? (
                dashboard.payments.map((payment) => (
                  <article className="card" key={payment._id}>
                    <div className="card-topline">
                      <span>{payment.notes || payment.method}</span>
                      <span className={`status-badge ${getStatusBadgeClass(payment.status)}`}>{payment.status}</span>
                    </div>
                    <h3>₹{payment.amount}</h3>
                    <div className="card-meta">
                      <span>{formatDate(payment.paidAt || payment.dueDate)}</span>
                    </div>
                  </article>
                ))
              ) : (
                <article className="card">No payment history available yet.</article>
              )}
            </div>
          )}

          {selectedSection === "recordedSession" && (
            <div className="card-grid">
              {dashboard?.onlineClasses?.length ? (
                dashboard.onlineClasses.map((session) => (
                  <article className="card" key={session._id}>
                    <div className="card-topline">
                      <span>{session.topic}</span>
                      <span>{session.status}</span>
                    </div>
                    <h3>{session.title}</h3>
                    <p>{session.instructor}</p>
                    <div className="card-meta">
                      <span>{formatDate(session.date)}</span>
                      {session.accessUrl && (
                        <a className="ghost-button" href={session.accessUrl} target="_blank" rel="noreferrer">
                          Join
                        </a>
                      )}
                    </div>
                  </article>
                ))
              ) : (
                <article className="card">No classes scheduled yet.</article>
              )}
            </div>
          )}

          {selectedSection === "bookSession" && (
            <div className="grid" style={{ gap: "24px" }}>
              <article className="form-card" style={{ padding: "28px" }}>
                <h3>Request a new doubt session</h3>
                <form onSubmit={handleBookingSubmit}>
                  <label>
                    Topic
                    <input
                      value={booking.topic}
                      onChange={(event) => setBooking((prev) => ({ ...prev, topic: event.target.value }))}
                      placeholder="E.g. React hooks or resume review"
                      required
                    />
                  </label>
                  <label>
                    Preferred date
                    <input
                      type="datetime-local"
                      value={booking.preferredDate}
                      onChange={(event) => setBooking((prev) => ({ ...prev, preferredDate: event.target.value }))}
                      required
                    />
                  </label>
                  <label>
                    Description
                    <textarea
                      value={booking.description}
                      onChange={(event) => setBooking((prev) => ({ ...prev, description: event.target.value }))}
                      rows={4}
                      placeholder="Describe the topic you need help with"
                      required
                    />
                  </label>
                  <button className="solid-button" type="submit">
                    Book session
                  </button>
                </form>
                {bookingMessage ? <p style={{ marginTop: 16 }}>{bookingMessage}</p> : null}
              </article>

              <div className="card-grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                {dashboard?.doubts?.length ? (
                  dashboard.doubts.map((session) => (
                    <article className="card" key={session._id}>
                      <div className="card-topline">
                        <span>{getSessionClassLabel(session, user?.studentClass)}</span>
                        <span className={`status-badge ${getStatusBadgeClass(session.status)}`}>
                          {sessionStatusLabel(session.status)}
                        </span>
                      </div>
                      <h3>{formatDate(session.scheduledAt || session.preferredDate)}</h3>
                      <p>{session.topic}</p>
                      <div className="card-meta" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                        <span>Preferred: {formatDate(session.preferredDate)}</span>
                        <span>{session.description}</span>
                        {session.scheduledAt ? <span>Scheduled: {formatDate(session.scheduledAt)}</span> : null}
                        {session.adminResponse ? <span>Admin note: {session.adminResponse}</span> : null}
                        {session.googleMeetLink ? (
                          <button className="ghost-button" type="button" onClick={() => handleJoinDoubt(session)}>
                            Join Google Meet
                          </button>
                        ) : null}
                        {(session.status === "Pending" || session.status === "Confirmed") ? (
                          <button className="ghost-button" type="button" onClick={() => handleCancelDoubt(session)}>
                            Cancel session
                          </button>
                        ) : null}
                      </div>
                    </article>
                  ))
                ) : (
                  <article className="card">No doubt sessions scheduled yet.</article>
                )}
              </div>
            </div>
          )}
        </>
          )}
        </main>
      </div>
    </div>
  );
}
