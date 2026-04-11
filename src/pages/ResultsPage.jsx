import { useEffect, useState } from "react";
import { API_BASE } from "../api";
import { useAuth } from "../context/AuthContext";
import "./ResultsPage.css";

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

const getGradeColor = (grade) => {
  const colors = {
    "A+": "#2ecc71",
    A: "#27ae60",
    "B+": "#3498db",
    B: "#2980b9",
    "C+": "#f39c12",
    C: "#e67e22",
    D: "#e74c3c",
    F: "#c0392b",
  };
  return colors[grade] || "#888";
};

export default function ResultsPage() {
  const { token, user } = useAuth();
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [detailedResult, setDetailedResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (token) {
      loadResults();
    }
  }, [token]);

  const loadResults = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/exams/student/results`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load results");
      }

      const data = await response.json();
      setResults(data || []);
      setStatusMessage("");
    } catch (error) {
      setStatusMessage(`Error: ${error.message}`);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDetailedResult = async (submissionId) => {
    setLoadingDetail(true);
    try {
      const response = await fetch(`${API_BASE}/exams/student/results/${submissionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.message || "Failed to load result details");
      }

      const data = await response.json();
      setDetailedResult(data);
    } catch (error) {
      setStatusMessage(`Error: ${error.message}`);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleViewDetails = (result) => {
    setSelectedResult(result);
    loadDetailedResult(result._id);
  };

  const handleCloseDetails = () => {
    setSelectedResult(null);
    setDetailedResult(null);
  };

  const filteredResults = results.filter((result) => {
    const matchesSearch =
      result.examTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.grade.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "released" && result.resultReleased) ||
      (filterStatus === "pending" && !result.resultReleased);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="results-page">
      <div className="results-container">
        {/* Header */}
        <div className="page-header">
          <h1>📊 Exam Results</h1>
          {statusMessage && (
            <div className={`status-message ${statusMessage.toLowerCase().includes("error") ? "error" : "success"}`}>
              {statusMessage}
            </div>
          )}
        </div>

        {!selectedResult ? (
          <>
            {/* Filters & Search */}
            <div className="filters-section">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search exams or grades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="filter-buttons">
                <button
                  className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
                  onClick={() => setFilterStatus("all")}
                >
                  All Results
                </button>
                <button
                  className={`filter-btn ${filterStatus === "released" ? "active" : ""}`}
                  onClick={() => setFilterStatus("released")}
                >
                  Released
                </button>
                <button
                  className={`filter-btn ${filterStatus === "pending" ? "active" : ""}`}
                  onClick={() => setFilterStatus("pending")}
                >
                  Pending
                </button>
              </div>
            </div>

            {/* Results Grid */}
            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                <p>Loading results...</p>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="no-results">
                <p>📭 No results found</p>
                <p className="subtitle">
                  {results.length === 0
                    ? "You haven't taken any exams yet"
                    : "Try adjusting your filters or search"}
                </p>
              </div>
            ) : (
              <div className="results-grid">
                {filteredResults.map((result) => (
                  <div key={result._id} className="result-card">
                    <div className="result-card-header">
                      <div className="result-title">
                        <h3>{result.examTitle}</h3>
                        {!result.resultReleased && (
                          <span className="result-badge pending">Pending</span>
                        )}
                      </div>
                      <div
                        className="grade-circle"
                        style={{ borderColor: getGradeColor(result.resultReleased ? result.grade : "C") }}
                      >
                        <span
                          className="grade"
                          style={{ color: getGradeColor(result.resultReleased ? result.grade : "C") }}
                        >
                          {result.resultReleased ? result.grade : "--"}
                        </span>
                      </div>
                    </div>

                    <div className="result-body">
                      <div className="score-info">
                        <div className="score-item">
                          <span className="label">Marks</span>
                          <span className="value">
                            {result.resultReleased ? `${result.marksObtained}/${result.totalMarks}` : "Pending"}
                          </span>
                        </div>
                        <div className="score-item">
                          <span className="label">Percentage</span>
                          <span className="value">
                            {result.resultReleased ? `${result.percentage}%` : "Pending"}
                          </span>
                        </div>
                      </div>

                      <div className="exam-metadata">
                        <p>
                          <strong>Date:</strong> {formatDate(result.scheduledDate)}
                        </p>
                        <p>
                          <strong>Time:</strong> {result.scheduledTime}
                        </p>
                        <p>
                          <strong>Duration:</strong> {result.duration} mins
                        </p>
                      </div>

                      {result.resultReleased && (
                        <div className="status-badge-container">
                          <span className="status-badge released">✓ Result Released</span>
                        </div>
                      )}
                    </div>

                    <button
                      className="btn btn-primary"
                      onClick={() => handleViewDetails(result)}
                      disabled={!result.resultReleased}
                    >
                      {result.resultReleased ? "View Details" : "Result Pending"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          // Detailed Result View
          <div className="detailed-result-container">
            <button className="btn-back" onClick={handleCloseDetails}>
              ← Back to Results
            </button>

            {loadingDetail ? (
              <div className="loading">
                <div className="spinner"></div>
                <p>Loading result details...</p>
              </div>
            ) : detailedResult ? (
              <>
                {/* Result Header */}
                <div className="result-header">
                  <div className="result-title-section">
                    <h1>{detailedResult.exam.title}</h1>
                    <p className="result-date">
                      Exam Date: {formatDate(detailedResult.exam.scheduledDate)} at{" "}
                      {detailedResult.exam.scheduledTime}
                    </p>
                  </div>

                  <div className="grade-display">
                    <div
                      className="grade-card"
                      style={{ borderColor: getGradeColor(detailedResult.grade) }}
                    >
                      <span
                        className="grade-letter"
                        style={{ color: getGradeColor(detailedResult.grade) }}
                      >
                        {detailedResult.grade}
                      </span>
                      <span className="grade-label">Grade</span>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="metrics-section">
                  <div className="metric-card">
                    <span className="metric-label">Marks Obtained</span>
                    <span className="metric-value">{detailedResult.totalMarksObtained}</span>
                    <span className="metric-detail">out of {detailedResult.maxMarks}</span>
                  </div>

                  <div className="metric-card">
                    <span className="metric-label">Percentage</span>
                    <span className="metric-value">{detailedResult.percentage}%</span>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${detailedResult.percentage}%`,
                          backgroundColor: getGradeColor(detailedResult.grade),
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="metric-card">
                    <span className="metric-label">Questions Attempted</span>
                    <span className="metric-value">{detailedResult.questionsAttempted}</span>
                    <span className="metric-detail">
                      of {detailedResult.exam.totalQuestions}
                    </span>
                  </div>

                  <div className="metric-card">
                    <span className="metric-label">Time Taken</span>
                    <span className="metric-value">
                      {Math.floor(detailedResult.totalTimeSpent / 60)}
                    </span>
                    <span className="metric-detail">
                      mins (Duration: {detailedResult.exam.duration} mins)
                    </span>
                  </div>
                </div>

                {/* Answer Review */}
                <div className="answers-section">
                  <h2>📋 Answer Review</h2>

                  <div className="answers-list">
                    {detailedResult.answers.map((answer, idx) => (
                      <div
                        key={idx}
                        className={`answer-item ${answer.isCorrect ? "correct" : "incorrect"}`}
                      >
                        <div className="answer-header">
                          <span className="question-num">Q{answer.questionNumber}</span>
                          <span className="answer-status">
                            {answer.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                          </span>
                          <span className="answer-marks">{answer.marksObtained} marks</span>
                        </div>

                        <div className="answer-content">
                          <p className="question-text">
                            <strong>Question:</strong> {answer.questionId.questionText}
                          </p>

                          <div className="answer-details">
                            <div className="student-answer">
                              <strong>Your Answer:</strong>
                              <p className="answer-box">{answer.studentAnswer || "Not attempted"}</p>
                            </div>

                            <div className="correct-answer">
                              <strong>Correct Answer:</strong>
                              <p className="answer-box">{answer.questionId.correctAnswer}</p>
                            </div>
                          </div>

                          {answer.questionId.explanation && (
                            <div className="explanation">
                              <strong>Explanation:</strong>
                              <p>{answer.questionId.explanation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="no-results">
                <p>Failed to load result details</p>
                <button className="btn btn-primary" onClick={() => handleCloseDetails()}>
                  Go Back
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
