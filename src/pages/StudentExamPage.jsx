import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE } from "../api";
import { useAuth } from "../context/AuthContext";
import "./StudentExamPage.css";

export default function StudentExamPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showTimer, setShowTimer] = useState(false);

  // Timer logic
  useEffect(() => {
    if (!examStarted || examSubmitted || !exam) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Auto submit when time is up
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, examSubmitted, exam]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getTimeColor = () => {
    const percentage = (timeRemaining / (exam?.duration * 60)) * 100;
    if (percentage > 50) return "#28a745";
    if (percentage > 25) return "#ffc107";
    return "#dc3545";
  };

  useEffect(() => {
    if (token && examId) {
      loadExam();
    }
  }, [token, examId]);

  const loadExam = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/exams/student/${examId}/start`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const json = await response.json();
        setError(json.message || "Failed to load exam");
        return;
      }

      const data = await response.json();
      setExam(data.exam);
      setQuestions(data.questions);
      setTimeRemaining(data.exam.duration * 60);

      // Initialize answers object
      const initialAnswers = {};
      data.questions.forEach((q) => {
        initialAnswers[q._id] = "";
      });
      setAnswers(initialAnswers);

      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = () => {
    setShowInstructions(false);
    setExamStarted(true);
    setShowTimer(true);
  };

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer,
    });
  };

  const handleSubmitExam = async () => {
    if (!examStarted || examSubmitted) return;

    if (!window.confirm("Are you sure you want to submit the exam? This cannot be undone.")) {
      return;
    }

    setSubmitting(true);
    const submissionAnswers = questions.map((q) => ({
      questionId: q._id,
      studentAnswer: answers[q._id] || "",
      timeSpentOnQuestion: 0,
    }));

    try {
      const response = await fetch(`${API_BASE}/exams/${examId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers: submissionAnswers }),
      });

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.message || "Failed to submit exam");
      }

      const data = await response.json();
      setExamSubmitted(true);
      setError("");
    } catch (err) {
      setError(`Submission failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishExam = () => {
    navigate("/results");
  };

  const goToQuestion = (index) => {
    setCurrentQuestion(index);
  };

  if (loading) {
    return (
      <div className="exam-page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading exam...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="exam-page">
        <div className="error-container">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate("/")}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!exam || !questions.length) {
    return (
      <div className="exam-page">
        <div className="error-container">
          <h2>⚠️ No exam data</h2>
          <button className="btn btn-primary" onClick={() => navigate("/")}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="exam-page">
      {showInstructions && !examStarted ? (
        <div className="instructions-container">
          <div className="instructions-card">
            <h1>📖 {exam.title}</h1>

            <div className="exam-metadata">
              <div className="metadata-item">
                <span className="label">Total Questions:</span>
                <span className="value">{exam.totalQuestions}</span>
              </div>
              <div className="metadata-item">
                <span className="label">Duration:</span>
                <span className="value">{exam.duration} minutes</span>
              </div>
              <div className="metadata-item">
                <span className="label">Total Marks:</span>
                <span className="value">{exam.totalMarks}</span>
              </div>
              <div className="metadata-item">
                <span className="label">Passing Marks:</span>
                <span className="value">{exam.totalMarks * 0.4}</span>
              </div>
            </div>

            {exam.instructions && (
              <div className="instructions-box">
                <h3>📋 Instructions:</h3>
                <p>{exam.instructions}</p>
                <ul>
                  <li>Answer all questions carefully</li>
                  <li>You can review your answers before submitting</li>
                  <li>Once submitted, you cannot modify your answers</li>
                  <li>The exam will automatically submit when time expires</li>
                </ul>
              </div>
            )}

            <div className="instructions-actions">
              <button className="btn btn-primary" onClick={handleStartExam}>
                ▶ Start Exam
              </button>
              <button className="btn btn-secondary" onClick={() => navigate("/")}>
                ✕ Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="exam-container">
          {/* Timer Bar */}
          {showTimer && (
            <div className="timer-header" style={{ borderBottomColor: getTimeColor() }}>
              <div className="timer-info">
                <span className="timer-label">Time Remaining:</span>
                <span className="timer-value" style={{ color: getTimeColor() }}>
                  ⏱ {formatTime(timeRemaining)}
                </span>
              </div>
              <div className="exam-title">{exam.title}</div>
              <div className="question-counter">
                Question {currentQuestion + 1} of {questions.length}
              </div>
            </div>
          )}

          <div className="exam-content">
            {/* Questions Panel */}
            <div className="questions-panel">
              <div className="questions-header">
                <h3>Questions</h3>
                <span className="question-counter-small">
                  {Object.values(answers).filter((a) => a).length}/{questions.length} answered
                </span>
              </div>

              <div className="questions-list">
                {questions.map((q, idx) => (
                  <button
                    key={q._id}
                    className={`question-btn ${currentQuestion === idx ? "active" : ""} ${
                      answers[q._id] ? "answered" : ""
                    }`}
                    onClick={() => goToQuestion(idx)}
                    title={q.questionText}
                  >
                    <span className="q-number">{idx + 1}</span>
                    {answers[q._id] && <span className="q-answered">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Question Area */}
            <div className="question-area">
              {examSubmitted ? (
                <div className="submission-success">
                  <div className="success-icon">✓</div>
                  <h2>Exam Submitted Successfully!</h2>
                  <p>Your answers have been recorded and submitted.</p>
                  <p className="submission-time">Submitted at: {new Date().toLocaleTimeString()}</p>
                  <button className="btn btn-primary" onClick={handleFinishExam}>
                    View Results
                  </button>
                </div>
              ) : (
                <>
                  <div className="question-content">
                    <h2 className="question-text">
                      Q{currentQuestion + 1}: {currentQ.questionText}
                    </h2>

                    {currentQ.imageUrl && (
                      <div className="question-image">
                        <img src={currentQ.imageUrl} alt="Question" />
                      </div>
                    )}

                    {currentQ.questionType === "mcq" ? (
                      <div className="options-container">
                        {currentQ.options.map((option, idx) => (
                          <label key={idx} className="option-label">
                            <input
                              type="radio"
                              name={`question-${currentQ._id}`}
                              value={String.fromCharCode(65 + option.optionNumber - 1)}
                              checked={
                                answers[currentQ._id] ===
                                String.fromCharCode(65 + option.optionNumber - 1)
                              }
                              onChange={(e) =>
                                handleAnswerSelect(currentQ._id, e.target.value)
                              }
                            />
                            <span className="option-text">
                              {String.fromCharCode(65 + option.optionNumber - 1)}) {option.optionText}
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        className="answer-textarea"
                        placeholder="Type your answer here..."
                        value={answers[currentQ._id] || ""}
                        onChange={(e) => handleAnswerSelect(currentQ._id, e.target.value)}
                        rows={6}
                      />
                    )}

                    <div className="question-marks">
                      <span>Marks: {currentQ.marks}</span>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="navigation-buttons">
                    <button
                      className="btn btn-secondary"
                      onClick={() => goToQuestion(currentQuestion - 1)}
                      disabled={currentQuestion === 0}
                    >
                      ← Previous
                    </button>

                    <div className="progress-indicator">
                      {currentQuestion + 1} / {questions.length}
                    </div>

                    <button
                      className="btn btn-secondary"
                      onClick={() => goToQuestion(currentQuestion + 1)}
                      disabled={currentQuestion === questions.length - 1}
                    >
                      Next →
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    className="btn btn-success btn-submit"
                    onClick={handleSubmitExam}
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "✓ Submit Exam"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
