import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./AdminExamPage.css";

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

const getStatusBadgeClass = (status) => {
  const mapping = {
    Draft: "status-draft",
    Scheduled: "status-scheduled",
    Active: "status-active",
    Completed: "status-completed",
    Cancelled: "status-cancelled",
  };
  return mapping[status] || "status-pending";
};

export default function AdminExamPage() {
  const { token } = useAuth();
  const [activeSection, setActiveSection] = useState("exams");
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [showExamForm, setShowExamForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Form states
  const [examForm, setExamForm] = useState({
    title: "",
    description: "",
    totalQuestions: "",
    duration: 30,
    totalMarks: "",
    passingMarks: "",
    scheduledDate: "",
    scheduledTime: "",
    instructions: "",
    status: "Draft",
  });

  const [questionForm, setQuestionForm] = useState({
    questionNumber: "",
    questionText: "",
    questionType: "mcq",
    options: [
      { optionNumber: 1, optionText: "" },
      { optionNumber: 2, optionText: "" },
      { optionNumber: 3, optionText: "" },
      { optionNumber: 4, optionText: "" },
    ],
    correctAnswer: "",
    explanation: "",
    marks: 1,
    difficulty: "Medium",
  });

  const [enrollmentForm, setEnrollmentForm] = useState({
    studentSearch: "",
    selectedStudents: [],
  });

  const [examSubmissions, setExamSubmissions] = useState([]);
  const [examEnrollments, setExamEnrollments] = useState([]);
  const [examQuestions, setExamQuestions] = useState([]);
  const [students, setStudents] = useState([]);

  const apiRequest = async (path, options = {}) => {
    const response = await fetch(`/api${path}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      ...options,
    });

    const text = await response.text();
    const json = text ? JSON.parse(text) : {};

    if (!response.ok) {
      throw new Error(json.message || "Request failed");
    }

    return json;
  };

  useEffect(() => {
    if (token) {
      loadExams();
    }
  }, [token]);

  const loadExams = async () => {
    setLoading(true);
    try {
      const data = await apiRequest("/exams");
      setExams(data || []);
      setStatusMessage("");
    } catch (error) {
      setStatusMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExamSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...examForm };
      if (!payload.status || payload.status === "Draft") {
        if (payload.scheduledDate && payload.scheduledTime) {
          payload.status = "Scheduled";
        }
      }

      if (selectedExam?._id) {
        await apiRequest(`/exams/${selectedExam._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setStatusMessage("Exam updated successfully");
      } else {
        await apiRequest("/exams", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setStatusMessage("Exam created successfully");
      }
      resetExamForm();
      loadExams();
    } catch (error) {
      setStatusMessage(`Error: ${error.message}`);
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiRequest(`/exams/${selectedExam._id}/questions`, {
        method: "POST",
        body: JSON.stringify(questionForm),
      });
      setStatusMessage("Question added successfully");
      loadExamQuestions();
      resetQuestionForm();
    } catch (error) {
      setStatusMessage(`Error: ${error.message}`);
    }
  };

  const loadExamDetails = async (exam) => {
    setSelectedExam(exam);
    try {
      const [questions, enrollments] = await Promise.all([
        apiRequest(`/exams/${exam._id}/questions`),
        apiRequest(`/exams/${exam._id}/enrollments`),
      ]);
      setExamQuestions(questions || []);
      setExamEnrollments(enrollments || []);
    } catch (error) {
      setStatusMessage(`Error: ${error.message}`);
    }
  };

  useEffect(() => {
    if (showEnrollmentForm) {
      loadStudents();
    }
  }, [showEnrollmentForm]);

  const loadStudents = async (search = "") => {
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : "";
      const data = await apiRequest(`/admin/students${query}`);
      setStudents(data || []);
    } catch (error) {
      setStatusMessage(`Error loading students: ${error.message}`);
    }
  };

  const handleEnrollmentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedExam?._id || enrollmentForm.selectedStudents.length === 0) {
      setStatusMessage("Please select at least one student");
      return;
    }

    try {
      await apiRequest(`/exams/${selectedExam._id}/enroll-students`, {
        method: "POST",
        body: JSON.stringify({
          studentIds: enrollmentForm.selectedStudents,
        }),
      });
      setStatusMessage(`${enrollmentForm.selectedStudents.length} student(s) enrolled successfully`);
      setEnrollmentForm({ studentSearch: "", selectedStudents: [] });
      setShowEnrollmentForm(false);
      loadExamDetails(selectedExam);
      loadStudents();
    } catch (error) {
      setStatusMessage(`Error: ${error.message}`);
    }
  };

  const loadExamQuestions = async () => {
    try {
      const data = await apiRequest(`/exams/${selectedExam._id}/questions`);
      setExamQuestions(data || []);
    } catch (error) {
      setStatusMessage(`Error: ${error.message}`);
    }
  };

  const loadExamSubmissions = async () => {
    try {
      const data = await apiRequest(`/exams/${selectedExam._id}/submissions`);
      setExamSubmissions(data.submissions || []);
    } catch (error) {
      setStatusMessage(`Error: ${error.message}`);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;

    try {
      await apiRequest(`/exams/questions/${questionId}`, { method: "DELETE" });
      setStatusMessage("Question deleted successfully");
      loadExamQuestions();
    } catch (error) {
      setStatusMessage(`Error: ${error.message}`);
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;

    try {
      await apiRequest(`/exams/${examId}`, { method: "DELETE" });
      setStatusMessage("Exam deleted successfully");
      loadExams();
      setSelectedExam(null);
    } catch (error) {
      setStatusMessage(`Error: ${error.message}`);
    }
  };

  const handleReleaseResults = async () => {
    if (!window.confirm("Are you sure you want to release results? This cannot be undone.")) return;

    try {
      await apiRequest(`/exams/${selectedExam._id}/release-results`, {
        method: "POST",
      });
      setStatusMessage("Results released successfully");
      loadExams();
    } catch (error) {
      setStatusMessage(`Error: ${error.message}`);
    }
  };

  const handleEditExam = (exam) => {
    setExamForm({
      title: exam.title,
      description: exam.description,
      totalQuestions: exam.totalQuestions,
      duration: exam.duration,
      totalMarks: exam.totalMarks,
      passingMarks: exam.passingMarks,
      scheduledDate: exam.scheduledDate.split("T")[0],
      scheduledTime: exam.scheduledTime,
      instructions: exam.instructions,
      status: exam.status || "Draft",
    });
    setSelectedExam(exam);
    setActiveSection("exams");
    setShowExamForm(true);
  };

  const resetExamForm = () => {
    setExamForm({
      title: "",
      description: "",
      totalQuestions: "",
      duration: 30,
      totalMarks: "",
      passingMarks: "",
      scheduledDate: "",
      scheduledTime: "",
      instructions: "",
      status: "Draft",
    });
    setSelectedExam(null);
    setShowExamForm(false);
  };

  const resetQuestionForm = () => {
    setQuestionForm({
      questionNumber: "",
      questionText: "",
      questionType: "mcq",
      options: [
        { optionNumber: 1, optionText: "" },
        { optionNumber: 2, optionText: "" },
        { optionNumber: 3, optionText: "" },
        { optionNumber: 4, optionText: "" },
      ],
      correctAnswer: "",
      explanation: "",
      marks: 1,
      difficulty: "Medium",
    });
    setShowQuestionForm(false);
  };

  const navItems = [
    { key: "exams", label: "Exams" },
    { key: "questions", label: "Questions" },
    { key: "enrollments", label: "Enrollments" },
    { key: "submissions", label: "Submissions" },
  ];

  return (
    <div className="admin-exam-page">
      <div className="exam-container">
        {/* Header */}
        <div className="page-header">
          <h1>📝 Exam Management</h1>
          {statusMessage && (
            <div className={`status-message ${statusMessage.toLowerCase().includes("error") ? "error" : "success"}`}>
              {statusMessage}
            </div>
          )}
        </div>

        {/* Navigation */}
        {selectedExam && (
          <div className="sub-nav">
            {navItems.map((item) => (
              <button
                key={item.key}
                className={`nav-btn ${activeSection === item.key ? "active" : ""}`}
                onClick={() => setActiveSection(item.key)}
              >
                {item.label}
              </button>
            ))}
            <button className="nav-btn close-btn" onClick={() => setSelectedExam(null)}>
              ✕ Back to Exams
            </button>
          </div>
        )}

        {/* Main Content */}
        {!selectedExam ? (
          <div className="exams-section">
            <div className="section-header">
              <h2>All Exams</h2>
              <button className="btn btn-primary" onClick={() => setShowExamForm(true)}>
                + New Exam
              </button>
            </div>

            {showExamForm ? (
              <form onSubmit={handleExamSubmit} className="form-container">
                <div className="form-group">
                  <label>Exam Title</label>
                  <input
                    type="text"
                    value={examForm.title}
                    onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={examForm.description}
                    onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
                    rows={3}
                  ></textarea>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Total Questions</label>
                    <input
                      type="number"
                      value={examForm.totalQuestions}
                      onChange={(e) => setExamForm({ ...examForm, totalQuestions: parseInt(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Duration (minutes)</label>
                    <input
                      type="number"
                      value={examForm.duration}
                      onChange={(e) => setExamForm({ ...examForm, duration: parseInt(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Total Marks</label>
                    <input
                      type="number"
                      value={examForm.totalMarks}
                      onChange={(e) => setExamForm({ ...examForm, totalMarks: parseInt(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Passing Marks</label>
                    <input
                      type="number"
                      value={examForm.passingMarks}
                      onChange={(e) => setExamForm({ ...examForm, passingMarks: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Scheduled Date</label>
                    <input
                      type="date"
                      value={examForm.scheduledDate}
                      onChange={(e) => setExamForm({ ...examForm, scheduledDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Scheduled Time</label>
                    <input
                      type="time"
                      value={examForm.scheduledTime}
                      onChange={(e) => setExamForm({ ...examForm, scheduledTime: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={examForm.status}
                    onChange={(e) => setExamForm({ ...examForm, status: e.target.value })}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Instructions</label>
                  <textarea
                    value={examForm.instructions}
                    onChange={(e) => setExamForm({ ...examForm, instructions: e.target.value })}
                    rows={4}
                  ></textarea>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Create Exam
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={resetExamForm}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : loading ? (
              <p>Loading exams...</p>
            ) : exams.length === 0 ? (
              <p className="no-data">No exams created yet</p>
            ) : (
              <div className="exams-grid">
                {exams.map((exam) => (
                  <div key={exam._id} className="exam-card">
                    <div className="exam-card-header">
                      <h3>{exam.title}</h3>
                      <span className={`status-badge ${getStatusBadgeClass(exam.status)}`}>{exam.status}</span>
                    </div>
                    <div className="exam-card-body">
                      <p>
                        <strong>Date:</strong> {formatDate(exam.scheduledDate)} at {exam.scheduledTime}
                      </p>
                      <p>
                        <strong>Questions:</strong> {exam.totalQuestions} | <strong>Marks:</strong> {exam.totalMarks}
                      </p>
                      <p>
                        <strong>Duration:</strong> {exam.duration} mins | <strong>Enrolled:</strong> {exam.enrolledCount || 0}
                      </p>
                      <p>
                        <strong>Passing Marks:</strong> {exam.passingMarks}
                      </p>
                    </div>
                    <div className="exam-card-actions">
                      <button className="btn btn-secondary" onClick={() => loadExamDetails(exam)}>
                        Manage
                      </button>
                      <button className="btn btn-info" onClick={() => handleEditExam(exam)}>
                        Edit
                      </button>
                      <button className="btn btn-danger" onClick={() => handleDeleteExam(exam._id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Exam Details View */}
            {activeSection === "exams" && (
              <div className="exam-details-section">
                <h2>{selectedExam.title}</h2>

                {showExamForm ? (
                  <form onSubmit={handleExamSubmit} className="form-container">
                    <div className="form-group">
                      <label>Exam Title</label>
                      <input
                        type="text"
                        value={examForm.title}
                        onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Total Questions</label>
                        <input
                          type="number"
                          value={examForm.totalQuestions}
                          onChange={(e) => setExamForm({ ...examForm, totalQuestions: parseInt(e.target.value) })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Duration (minutes)</label>
                        <input
                          type="number"
                          value={examForm.duration}
                          onChange={(e) => setExamForm({ ...examForm, duration: parseInt(e.target.value) })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Total Marks</label>
                        <input
                          type="number"
                          value={examForm.totalMarks}
                          onChange={(e) => setExamForm({ ...examForm, totalMarks: parseInt(e.target.value) })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Passing Marks</label>
                        <input
                          type="number"
                          value={examForm.passingMarks}
                          onChange={(e) => setExamForm({ ...examForm, passingMarks: parseInt(e.target.value) })}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Scheduled Date</label>
                        <input
                          type="date"
                          value={examForm.scheduledDate}
                          onChange={(e) => {
                            const scheduledDate = e.target.value;
                            setExamForm((prev) => ({
                              ...prev,
                              scheduledDate,
                              status:
                                prev.status === "Draft" && scheduledDate && prev.scheduledTime
                                  ? "Scheduled"
                                  : prev.status,
                            }));
                          }}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Scheduled Time</label>
                        <input
                          type="time"
                          value={examForm.scheduledTime}
                          onChange={(e) => {
                            const scheduledTime = e.target.value;
                            setExamForm((prev) => ({
                              ...prev,
                              scheduledTime,
                              status:
                                prev.status === "Draft" && prev.scheduledDate && scheduledTime
                                  ? "Scheduled"
                                  : prev.status,
                            }));
                          }}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Status</label>
                      <select
                        value={examForm.status}
                        onChange={(e) => setExamForm({ ...examForm, status: e.target.value })}
                      >
                        <option value="Draft">Draft</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Instructions</label>
                      <textarea
                        value={examForm.instructions}
                        onChange={(e) => setExamForm({ ...examForm, instructions: e.target.value })}
                        rows={4}
                      ></textarea>
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary">
                        {selectedExam._id ? "Update Exam" : "Create Exam"}
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={resetExamForm}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="exam-info">
                    <div className="info-grid">
                      <div className="info-item">
                        <strong>Title:</strong>
                        <p>{selectedExam.title}</p>
                      </div>
                      <div className="info-item">
                        <strong>Date & Time:</strong>
                        <p>
                          {formatDate(selectedExam.scheduledDate)} at {selectedExam.scheduledTime}
                        </p>
                      </div>
                      <div className="info-item">
                        <strong>Duration:</strong>
                        <p>{selectedExam.duration} minutes</p>
                      </div>
                      <div className="info-item">
                        <strong>Total Questions:</strong>
                        <p>{selectedExam.totalQuestions}</p>
                      </div>
                      <div className="info-item">
                        <strong>Total Marks:</strong>
                        <p>{selectedExam.totalMarks}</p>
                      </div>
                      <div className="info-item">
                        <strong>Passing Marks:</strong>
                        <p>{selectedExam.passingMarks}</p>
                      </div>
                      <div className="info-item">
                        <strong>Status:</strong>
                        <p>
                          <span className={`status-badge ${getStatusBadgeClass(selectedExam.status)}`}>
                            {selectedExam.status}
                          </span>
                        </p>
                      </div>
                      <div className="info-item">
                        <strong>Enrolled Students:</strong>
                        <p>{examEnrollments.length}</p>
                      </div>
                    </div>

                    <button className="btn btn-primary" onClick={() => setShowExamForm(true)}>
                      Edit Exam
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Questions Section */}
            {activeSection === "questions" && (
              <div className="questions-section">
                <div className="section-header">
                  <h2>Questions ({examQuestions.length})</h2>
                  <button className="btn btn-primary" onClick={() => setShowQuestionForm(true)}>
                    + Add Question
                  </button>
                </div>

                {showQuestionForm ? (
                  <form onSubmit={handleQuestionSubmit} className="form-container">
                    <div className="form-group">
                      <label>Question Number</label>
                      <input
                        type="number"
                        value={questionForm.questionNumber}
                        onChange={(e) => setQuestionForm({ ...questionForm, questionNumber: parseInt(e.target.value) })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Question Text</label>
                      <textarea
                        value={questionForm.questionText}
                        onChange={(e) => setQuestionForm({ ...questionForm, questionText: e.target.value })}
                        required
                        rows={3}
                      ></textarea>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Question Type</label>
                        <select
                          value={questionForm.questionType}
                          onChange={(e) => setQuestionForm({ ...questionForm, questionType: e.target.value })}
                        >
                          <option value="mcq">MCQ</option>
                          <option value="short-answer">Short Answer</option>
                          <option value="long-answer">Long Answer</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Difficulty</label>
                        <select
                          value={questionForm.difficulty}
                          onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })}
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Marks</label>
                        <input
                          type="number"
                          step="0.5"
                          value={questionForm.marks}
                          onChange={(e) => setQuestionForm({ ...questionForm, marks: parseFloat(e.target.value) })}
                          required
                        />
                      </div>
                    </div>

                    {questionForm.questionType === "mcq" && (
                      <div className="options-container">
                        <label>Options</label>
                        {questionForm.options.map((option, idx) => (
                          <div key={idx} className="option-input">
                            <input
                              type="text"
                              placeholder={`Option ${option.optionNumber}`}
                              value={option.optionText}
                              onChange={(e) => {
                                const newOptions = [...questionForm.options];
                                newOptions[idx].optionText = e.target.value;
                                setQuestionForm({ ...questionForm, options: newOptions });
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="form-group">
                      <label>Correct Answer</label>
                      <input
                        type="text"
                        placeholder="Enter correct answer (A, B, C, D for MCQ)"
                        value={questionForm.correctAnswer}
                        onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Explanation</label>
                      <textarea
                        value={questionForm.explanation}
                        onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                        rows={2}
                      ></textarea>
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary">
                        Add Question
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={resetQuestionForm}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : examQuestions.length === 0 ? (
                  <p className="no-data">No questions added yet</p>
                ) : (
                  <div className="questions-list">
                    {examQuestions.map((question) => (
                      <div key={question._id} className="question-item">
                        <div className="question-header">
                          <h4>
                            Q{question.questionNumber}: {question.questionText}
                          </h4>
                          <span className="difficulty-badge">{question.difficulty}</span>
                          <span className="marks-badge">{question.marks} marks</span>
                        </div>
                        {question.questionType === "mcq" && (
                          <div className="options-list">
                            {question.options.map((opt, idx) => (
                              <div key={idx} className="option-item">
                                {String.fromCharCode(65 + idx)}) {opt.optionText}
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="question-meta">
                          <strong>Correct Answer:</strong> {question.correctAnswer}
                        </div>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDeleteQuestion(question._id)}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Enrollments Section */}
            {activeSection === "enrollments" && (
              <div className="enrollments-section">
                <div className="section-header">
                  <h2>Student Enrollments</h2>
                  <button className="btn btn-primary" onClick={() => setShowEnrollmentForm(true)}>
                    + Add Students
                  </button>
                </div>

                {showEnrollmentForm ? (
                  <form onSubmit={handleEnrollmentSubmit} className="form-container">
                    {students.length === 0 && (
                      <p className="no-data">Loading students... If the list is empty, try typing the student email or name.</p>
                    )}
                    <div className="form-group">
                      <label>Search Students</label>
                      <input
                        type="text"
                        placeholder="Search by name or email"
                        value={enrollmentForm.studentSearch}
                        onChange={(e) => {
                          const value = e.target.value;
                          setEnrollmentForm({ ...enrollmentForm, studentSearch: value });
                          loadStudents(value.trim());
                        }}
                      />
                    </div>

                    <div className="form-group">
                      <label>Select Students</label>
                      <div className="students-list">
                        {students.filter((student) =>
                          student.name.toLowerCase().includes(enrollmentForm.studentSearch.toLowerCase()) ||
                          student.email.toLowerCase().includes(enrollmentForm.studentSearch.toLowerCase())
                        ).length > 0 ? (
                          students
                            .filter((student) =>
                              student.name.toLowerCase().includes(enrollmentForm.studentSearch.toLowerCase()) ||
                              student.email.toLowerCase().includes(enrollmentForm.studentSearch.toLowerCase())
                            )
                            .map((student) => (
                              <div key={student._id} className="student-checkbox">
                                <input
                                  type="checkbox"
                                  id={`student-${student._id}`}
                                  checked={enrollmentForm.selectedStudents.includes(student._id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setEnrollmentForm({
                                        ...enrollmentForm,
                                        selectedStudents: [...enrollmentForm.selectedStudents, student._id],
                                      });
                                    } else {
                                      setEnrollmentForm({
                                        ...enrollmentForm,
                                        selectedStudents: enrollmentForm.selectedStudents.filter((id) => id !== student._id),
                                      });
                                    }
                                  }}
                                />
                                <label htmlFor={`student-${student._id}`}>
                                  {student.name} ({student.email})
                                </label>
                              </div>
                            ))
                        ) : (
                          <p style={{ padding: "10px", color: "#999" }}>Start typing to search students...</p>
                        )}
                      </div>
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary">
                        Enroll {enrollmentForm.selectedStudents.length} Student(s)
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowEnrollmentForm(false);
                          setEnrollmentForm({ studentSearch: "", selectedStudents: [] });
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : examEnrollments.length === 0 ? (
                  <p className="no-data">No students enrolled yet</p>
                ) : (
                  <div className="enrollments-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Student Name</th>
                          <th>Email</th>
                          <th>Class</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {examEnrollments.map((enrollment) => (
                          <tr key={enrollment._id}>
                            <td>{enrollment.student.name}</td>
                            <td>{enrollment.student.email}</td>
                            <td>{enrollment.student.studentClass || "-"}</td>
                            <td>
                              <span className={`status-badge status-${enrollment.enrollmentStatus.toLowerCase()}`}>
                                {enrollment.enrollmentStatus}
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={async () => {
                                  if (window.confirm("Remove this student from the exam?")) {
                                    try {
                                      await apiRequest(`/exams/enrollment/${enrollment._id}`, {
                                        method: "DELETE",
                                      });
                                      setStatusMessage("Student removed successfully");
                                      loadExamDetails(selectedExam);
                                    } catch (error) {
                                      setStatusMessage(`Error: ${error.message}`);
                                    }
                                  }
                                }}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Submissions Section */}
            {activeSection === "submissions" && (
              <div className="submissions-section">
                <div className="section-header">
                  <h2>Exam Submissions</h2>
                  <button className="btn btn-primary" onClick={loadExamSubmissions}>
                    Load Submissions
                  </button>
                  {!selectedExam.resultReleased && (
                    <button className="btn btn-success" onClick={handleReleaseResults}>
                      Release Results
                    </button>
                  )}
                </div>

                {examSubmissions.length === 0 ? (
                  <p className="no-data">No submissions yet</p>
                ) : (
                  <div className="submissions-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Student Name</th>
                          <th>Marks Obtained</th>
                          <th>Max Marks</th>
                          <th>Percentage</th>
                          <th>Grade</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {examSubmissions.map((submission) => (
                          <tr key={submission._id}>
                            <td>{submission.student.name}</td>
                            <td>{submission.totalMarksObtained}</td>
                            <td>{submission.maxMarks}</td>
                            <td>{submission.percentage}%</td>
                            <td>{submission.grade}</td>
                            <td>
                              <span className={`status-badge status-${submission.status.toLowerCase()}`}>
                                {submission.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
