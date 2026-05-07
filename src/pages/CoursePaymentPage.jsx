import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import { API_BASE } from "../api";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  name: "",
  email: "",
  mobile: "",
  method: "PhonePe",
};

const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;

export default function CoursePaymentPage() {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [course, setCourse] = useState(location.state?.course || null);
  const [feeStructure, setFeeStructure] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [paymentPlan, setPaymentPlan] = useState(location.state?.paymentType === "emi" ? "emi" : "full");
  const [loading, setLoading] = useState(!location.state?.course);
  const [loadingFeeStructure, setLoadingFeeStructure] = useState(Boolean(location.state?.course));
  const [feeStructureResolved, setFeeStructureResolved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [courseId]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      name: user?.name || "",
      email: user?.email || "",
      mobile: user?.phone || "",
    }));
  }, [user]);

  useEffect(() => {
    if (course) {
      // Load fee structure for this course
      setFeeStructureResolved(false);
      setLoadingFeeStructure(true);
      fetch(`${API_BASE}/fees/course/${course._id}`)
        .then((res) => res.json())
        .then((data) => {
          setFeeStructure(data);
        })
        .catch((err) => {
          console.error("Error loading fee structure:", err);
          setFeeStructure(null);
        })
        .finally(() => {
          setLoadingFeeStructure(false);
          setFeeStructureResolved(true);
        });
      return;
    }

    if (!courseId) return;

    const loadCourse = async () => {
      setLoading((prev) => prev || !course);
      try {
        const response = await fetch(`${API_BASE}/content/courses/${courseId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load course details.");
        }

        setCourse(data);
      } catch (error) {
        setMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [course, courseId]);

  const emiAvailable = Boolean(feeStructure?.installments?.length);
  const payableAmount = feeStructure?.totalAmount || course?.price || 0;
  const installments = [...(feeStructure?.installments || [])].sort(
    (left, right) => (left.number || 0) - (right.number || 0)
  );
  const checkingRequestedEmi = loadingFeeStructure && paymentPlan === "emi" && !feeStructure;

  useEffect(() => {
    if (feeStructureResolved && !loadingFeeStructure && !emiAvailable && paymentPlan === "emi") {
      setPaymentPlan("full");
    }
  }, [emiAvailable, feeStructureResolved, loadingFeeStructure, paymentPlan]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!course) return;

    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE}/dashboard/purchase/course/${course._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          paymentPlan,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to complete this request.");
      }

      if ((data.flow || paymentPlan) === "emi") {
        navigate("/fees", {
          replace: true,
          state: {
            message: data.message || "EMI plan activated successfully.",
          },
        });
        return;
      }

      navigate("/courses", {
        replace: true,
        state: {
          paymentMessage: data.message || "Payment request created successfully.",
        },
      });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if ((loading || loadingFeeStructure) && !course) {
    return (
      <div className="page section">
        <div className="app-loading-block">
          <Spinner message="Loading course details..." />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="page section">
        <article className="card payment-page-card">
          <h2>Course not found</h2>
          <p>{message || "We could not load the selected course."}</p>
          <Link className="ghost-button" to="/courses">
            Back to courses
          </Link>
        </article>
      </div>
    );
  }

  return (
    <div className="page section payment-page">
      <div className="payment-page-grid">
        <article className="card payment-page-card" style={{
          display: "grid",
          gap: "16px",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e8ecf1",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
          padding: "24px",
        }}>
          <div>
            <span style={{
              display: "inline-block",
              padding: "6px 12px",
              backgroundColor: "#f0f4f8",
              color: "#0066cc",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              📚 Course Details
            </span>
          </div>

          {/* Course Image Placeholder */}
          <div style={{
            width: "100%",
            height: "240px",
            borderRadius: "12px",
            backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            border: "2px solid #e8ecf1",
            position: "relative",
          }}>
            <div style={{
              textAlign: "center",
              color: "white",
              zIndex: 1,
            }}>
              <div style={{ fontSize: "64px", marginBottom: "12px" }}>📚</div>
              <p style={{ 
                margin: 0, 
                fontSize: "30px", 
                fontWeight: "600",
                opacity: 0.9,
                color:"white"
              }}>
                {course.title}
              </p>
             
            </div>
          </div>

          <div>
            
            <p style={{
              margin: "0",
              fontSize: "15px",
              color: "#64748b",
              lineHeight: "1.6",
            }}>
              {course.summary}
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}>
            <div style={{
              padding: "16px",
              backgroundColor: "#f8fbff",
              border: "1.5px solid #d0e8ff",
              borderRadius: "12px",
            }}>
              <p style={{
                margin: "0 0 8px 0",
                fontSize: "12px",
                fontWeight: "600",
                color: "#666",
                textTransform: "uppercase",
                letterSpacing: "0.3px",
              }}>
                📂 Category
              </p>
              <strong style={{
                display: "block",
                fontSize: "16px",
                color: "#0f172a",
              }}>
                {course.category}
              </strong>
            </div>

            <div style={{
              padding: "16px",
              backgroundColor: "#f8fbff",
              border: "1.5px solid #d0e8ff",
              borderRadius: "12px",
            }}>
              <p style={{
                margin: "0 0 8px 0",
                fontSize: "12px",
                fontWeight: "600",
                color: "#666",
                textTransform: "uppercase",
                letterSpacing: "0.3px",
              }}>
                ⏱️ Duration
              </p>
              <strong style={{
                display: "block",
                fontSize: "16px",
                color: "#0f172a",
              }}>
                {course.duration}
              </strong>
            </div>

            <div style={{
              padding: "16px",
              backgroundColor: "#f8fbff",
              border: "1.5px solid #d0e8ff",
              borderRadius: "12px",
            }}>
              <p style={{
                margin: "0 0 8px 0",
                fontSize: "12px",
                fontWeight: "600",
                color: "#666",
                textTransform: "uppercase",
                letterSpacing: "0.3px",
              }}>
                🌐 Mode
              </p>
              <strong style={{
                display: "block",
                fontSize: "16px",
                color: "#0f172a",
              }}>
                {course.mode}
              </strong>
            </div>

            <div style={{
              padding: "16px",
              backgroundColor: "#eff6ff",
              border: "1.5px solid #0066cc",
              borderRadius: "12px",
            }}>
              <p style={{
                margin: "0 0 8px 0",
                fontSize: "12px",
                fontWeight: "600",
                color: "#0066cc",
                textTransform: "uppercase",
                letterSpacing: "0.3px",
              }}>
                💰 Course Fees
              </p>
              <strong style={{
                display: "block",
                fontSize: "24px",
                color: "#0066cc",
                fontWeight: "800",
              }}>
                {formatCurrency(payableAmount)}
              </strong>
            </div>
          </div>
                    {emiAvailable && paymentPlan === "emi" && feeStructure ? (
            <div
              style={{
                display: "grid",
                gap: "16px",
                padding: "20px",
                borderRadius: "12px",
                border: "2px solid #4caf50",
                backgroundColor: "#f1f8f4",
                marginTop: "16px",
              }}
            >
              <div>
                <strong style={{ 
                  display: "block", 
                  marginBottom: "6px",
                  fontSize: "16px",
                  color: "#2e7d32",
                }}>
                  ✓ EMI Plan Available
                </strong>
                <p style={{ 
                  margin: 0, 
                  color: "#558b2f", 
                  fontSize: "13px",
                  fontWeight: "500",
                }}>
                  Get instant course access after paying the first installment
                </p>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "12px",
                }}
              >
                {installments.slice(0, 3).map((inst) => (
                  <div
                    key={inst.number}
                    style={{
                      padding: "14px",
                      borderRadius: "10px",
                      border: "1.5px solid #a5d6a7",
                      backgroundColor: "#ffffff",
                      textAlign: "center",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#4caf50";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(76, 175, 80, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#a5d6a7";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <span style={{ 
                      color: "#558b2f", 
                      fontSize: "12px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.3px",
                    }}>
                      EMI {inst.number}
                    </span>
                    <strong style={{ 
                      display: "block", 
                      marginTop: "6px", 
                      color: "#2e7d32",
                      fontSize: "18px",
                      fontWeight: "700",
                    }}>
                      {formatCurrency(inst.amount)}
                    </strong>
                    <span style={{
                      display: "block",
                      marginTop: "4px",
                      fontSize: "11px",
                      color: "#999",
                    }}>
                      {new Date(inst.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                ))}
                {installments.length > 3 && (
                  <div
                    style={{
                      padding: "12px",
                      borderRadius: "12px",
                      border: "1px solid #d9e3f0",
                      backgroundColor: "#f8fbff",
                      textAlign: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                      +{installments.length - 3} more
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Key Highlights */}
          <div style={{
            display: "grid",
            gap: "8px",
            padding: "16px",
            borderRadius: "12px",
            backgroundColor: "#eff6ff",
            border: "1.5px solid #d0e8ff",
          }}>
            <h4 style={{
              margin: "0 0 8px 0",
              fontSize: "14px",
              fontWeight: "700",
              color: "#0066cc",
              textTransform: "uppercase",
              letterSpacing: "0.3px",
            }}>
              ⭐ Key Highlights
            </h4>
            <div style={{ display: "grid", gap: "8px" }}>
              {[
                "✓ Comprehensive study material for Class 9",
                "✓ Coverage of Biology, Chemistry & Physics",
                "✓ Board exam preparation focused",
                "✓ Interactive learning videos",
                "✓ Practice questions & solutions",
              ].map((item, idx) => (
                <div key={idx} style={{
                  fontSize: "13px",
                  color: "#064e3b",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* What You'll Learn */}
          <div style={{
            display: "grid",
            gap: "8px",
            padding: "16px",
            borderRadius: "12px",
            backgroundColor: "#f0fdf4",
            border: "1.5px solid #86efac",
          }}>
            <h4 style={{
              margin: "0 0 8px 0",
              fontSize: "14px",
              fontWeight: "700",
              color: "#16a34a",
              textTransform: "uppercase",
              letterSpacing: "0.3px",
            }}>
              📖 What You'll Learn
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {[
                { icon: "🔬", title: "Biology", desc: "Cell biology & genetics" },
                { icon: "⚗️", title: "Chemistry", desc: "Atomic structure basics" },
                { icon: "🌀", title: "Physics", desc: "Motion & forces" },
                { icon: "💡", title: "Problem Solving", desc: "Step-by-step solutions" },
              ].map((item, idx) => (
                <div key={idx} style={{
                  padding: "12px",
                  borderRadius: "10px",
                  backgroundColor: "white",
                  border: "1px solid #dcfce7",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: "24px", marginBottom: "4px" }}>
                    {item.icon}
                  </div>
                  <strong style={{
                    display: "block",
                    fontSize: "12px",
                    color: "#166534",
                  }}>
                    {item.title}
                  </strong>
                  <span style={{
                    fontSize: "11px",
                    color: "#7c2d12",
                    display: "block",
                    marginTop: "2px",
                  }}>
                    {item.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Course Benefits */}
          <div style={{
            display: "grid",
            gap: "12px",
            padding: "20px",
            borderRadius: "12px",
            backgroundColor: "#fef3c7",
            border: "1.5px solid #fcd34d",
          }}>
            <h4 style={{
              margin: "0 0 8px 0",
              fontSize: "14px",
              fontWeight: "700",
              color: "#b45309",
              textTransform: "uppercase",
              letterSpacing: "0.3px",
            }}>
              🎯 Course Benefits
            </h4>
            <div style={{ display: "grid", gap: "8px" }}>
              {[
                "📱 Access from any device - Study anywhere, anytime",
                "👨‍🏫 Lifetime access - No time restrictions",
                "∞ Unlimited revisions - Revisit topics as needed",
                "🏆 Certification - Get a course certificate on completion",
              ].map((item, idx) => (
                <div key={idx} style={{
                  fontSize: "13px",
                  color: "#78350f",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}>
                  {item}
                </div>
              ))}
            </div>
          </div>


        </article>

        <article className="card payment-page-card" style={{
          display: "grid",
          gap: "16px",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e8ecf1",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
          padding: "24px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}>
          <div>
            <span style={{
              display: "inline-block",
              padding: "6px 12px",
              backgroundColor: "#f0f4f8",
              color: "#0066cc",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              💳 Payment Options
            </span>
          </div>

          <div>
            <h2 style={{
              margin: "0 0 12px 0",
              fontSize: "28px",
              fontWeight: "800",
              color: "#0f172a",
              lineHeight: "1.2",
            }}>
              {checkingRequestedEmi
                ? "Loading EMI Options"
                : emiAvailable
                  ? "Choose How You Want to Pay"
                  : "Complete Your Request"}
            </h2>
            <p style={{
              margin: "0",
              fontSize: "15px",
              color: "#64748b",
              lineHeight: "1.6",
            }}>
              {checkingRequestedEmi
                ? "We are loading the installment plan for this course so your EMI request opens with the correct options."
                : emiAvailable
                ? "Select between full payment or flexible EMI installments. Get instant course access on first EMI payment."
                : "Fill your details and submit the full payment request. Admin will verify and unlock the course after marking it paid."}
            </p>
          </div>

          {emiAvailable ? (
            <div
              style={{
                display: "grid",
                gap: "14px",
                marginBottom: "8px",
                marginTop: "8px",
              }}
            >
              {[
                {
                  key: "full",
                  title: "💳 Full Payment",
                  description: `Pay full ${formatCurrency(payableAmount)} now. Access enabled after admin approval.`,
                  icon: "💳",
                },
                {
                  key: "emi",
                  title: "📅 Pay in EMI",
                  description: `Activate ${installments.length}-installment plan. Pay first EMI to unlock course.`,
                  icon: "📅",
                },
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setPaymentPlan(option.key)}
                  style={{
                    textAlign: "left",
                    padding: "18px",
                    borderRadius: "12px",
                    border: paymentPlan === option.key ? "2.5px solid #0066cc" : "1.5px solid #d9e3f0",
                    background: paymentPlan === option.key ? "#eff6ff" : "#ffffff",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    backgroundColor: paymentPlan === option.key ? "#eff6ff" : "#fafbfc",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#0066cc";
                    e.currentTarget.style.backgroundColor = "#eff6ff";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 102, 204, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = paymentPlan === option.key ? "#0066cc" : "#d9e3f0";
                    e.currentTarget.style.backgroundColor = paymentPlan === option.key ? "#eff6ff" : "#fafbfc";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <strong style={{ 
                    display: "block", 
                    marginBottom: "6px", 
                    color: "#0f172a",
                    fontSize: "15px",
                    fontWeight: "700",
                  }}>
                    {option.title}
                  </strong>
                  <span style={{ 
                    color: "#64748b", 
                    fontSize: "13px",
                    fontWeight: "500",
                    lineHeight: "1.5",
                  }}>
                    {option.description}
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          <form className="payment-request-form" onSubmit={handleSubmit} style={{
            display: "grid",
            gap: "16px",
            marginTop: "16px",
          }}>
            <label style={{
              display: "grid",
              gap: "6px",
            }}>
              <span style={{
                fontSize: "0.95rem",
                fontWeight: "600",
                color: "#0f172a",
              }}>👤 Full Name</span>
              <input
                style={{
                  padding: "12px 14px",
                  border: "1.5px solid #d9e3f0",
                  borderRadius: "10px",
                  fontSize: "14px",
                  transition: "all 0.3s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#1d70b8";
                  e.target.style.boxShadow = "0 0 0 3px rgba(29, 112, 184, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#d9e3f0";
                  e.target.style.boxShadow = "none";
                }}
                value={form.name}
                onChange={(event) => handleChange("name", event.target.value)}
                required
              />
            </label>

            <label style={{
              display: "grid",
              gap: "6px",
            }}>
              <span style={{
                fontSize: "0.95rem",
                fontWeight: "600",
                color: "#0f172a",
              }}>📧 Email Address</span>
              <input
                style={{
                  padding: "12px 14px",
                  border: "1.5px solid #d9e3f0",
                  borderRadius: "10px",
                  fontSize: "14px",
                  transition: "all 0.3s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#1d70b8";
                  e.target.style.boxShadow = "0 0 0 3px rgba(29, 112, 184, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#d9e3f0";
                  e.target.style.boxShadow = "none";
                }}
                type="email"
                value={form.email}
                onChange={(event) => handleChange("email", event.target.value)}
                required
              />
            </label>

            <label style={{
              display: "grid",
              gap: "6px",
            }}>
              <span style={{
                fontSize: "0.95rem",
                fontWeight: "600",
                color: "#0f172a",
              }}>📱 Mobile Number</span>
              <input
                style={{
                  padding: "12px 14px",
                  border: "1.5px solid #d9e3f0",
                  borderRadius: "10px",
                  fontSize: "14px",
                  transition: "all 0.3s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#1d70b8";
                  e.target.style.boxShadow = "0 0 0 3px rgba(29, 112, 184, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#d9e3f0";
                  e.target.style.boxShadow = "none";
                }}
                type="tel"
                value={form.mobile}
                onChange={(event) => handleChange("mobile", event.target.value)}
                required
              />
            </label>

            {paymentPlan === "full" && (
              <label style={{
                display: "grid",
                gap: "6px",
              }}>
                <span style={{
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  color: "#0f172a",
                }}>💳 Payment Method</span>
                <select
                  style={{
                    padding: "12px 14px",
                    border: "1.5px solid #d9e3f0",
                    borderRadius: "10px",
                    fontSize: "14px",
                    backgroundColor: "#ffffff",
                    color: "#0f172a",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='black' height='24' viewBox='0 0 20 20' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z'/></svg>")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 10px center",
                    backgroundSize: "20px",
                    paddingRight: "36px",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#1d70b8";
                    e.target.style.boxShadow = "0 0 0 3px rgba(29, 112, 184, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#d9e3f0";
                    e.target.style.boxShadow = "none";
                  }}
                  value={form.method}
                  onChange={(event) => handleChange("method", event.target.value)}
                  required
                >
                  <option value="PhonePe">PhonePe</option>
                  <option value="Cash">Cash</option>
                  <option value="Debit Card">Debit Card</option>
                </select>
              </label>
            )}

            {paymentPlan === "emi" && emiAvailable && feeStructure ? (
              <div
                style={{
                  display: "grid",
                  gap: "10px",
                  padding: "14px",
                  borderRadius: "12px",
                  backgroundColor: "#e8f5e9",
                  border: "1px solid #4caf50",
                  marginBottom: "12px",
                }}
              >
                <strong style={{ color: "#2e7d32", fontSize: "0.95rem" }}>
                  ✓ How EMI Works
                </strong>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: "20px",
                    color: "#558b2f",
                    fontSize: "0.9rem",
                  }}
                >
                  <li style={{ marginBottom: "6px" }}>
                    Fee structure will be auto-assigned when you submit
                  </li>
                  <li style={{ marginBottom: "6px" }}>
                    Pay first installment ({formatCurrency(installments[0]?.amount || 0)}) to unlock course
                  </li>
                  <li>Complete remaining installments as per schedule</li>
                </ul>
              </div>
            ) : null}

            {message ? (
              <div style={{
                padding: "12px 14px",
                borderRadius: "10px",
                backgroundColor: message.includes("✓") || message.includes("successfully") ? "#d4edda" : "#f8d7da",
                border: `1.5px solid ${message.includes("✓") || message.includes("successfully") ? "#28a745" : "#dc3545"}`,
                color: message.includes("✓") || message.includes("successfully") ? "#155724" : "#721c24",
                fontSize: "0.9rem",
                fontWeight: "500",
              }}>
                {message}
              </div>
            ) : null}

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginTop: "20px",
              paddingTop: "20px",
              borderTop: "1px solid #d9e3f0",
            }}>
              <button
                style={{
                  padding: "14px 24px",
                  backgroundColor: "#1d70b8",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "15px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  opacity: submitting || loadingFeeStructure ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!submitting && !loadingFeeStructure) {
                    e.target.style.backgroundColor = "#0d47a1";
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 4px 12px rgba(29, 112, 184, 0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#1d70b8";
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }}
                type="submit"
                disabled={submitting || loadingFeeStructure}
              >
                {submitting ? (
                  <>⏳ Processing...</>
                ) : paymentPlan === "full" ? (
                  <>💳 Pay Now {formatCurrency(payableAmount)}</>
                ) : (
                  <>✓ Activate EMI</>
                )}
              </button>
              <Link to="/courses" style={{
                padding: "14px 24px",
                backgroundColor: "#f0f4f8",
                color: "#1d70b8",
                border: "1.5px solid #d9e3f0",
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.3s ease",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#e8eef7";
                  e.currentTarget.style.borderColor = "#1d70b8";
                  e.currentTarget.style.color = "#0d47a1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#f0f4f8";
                  e.currentTarget.style.borderColor = "#d9e3f0";
                  e.currentTarget.style.color = "#1d70b8";
                }}
              >
                ✕ Cancel
              </Link>
            </div>
          </form>

          {/* Knowledge Base Section */}
          <div style={{
            display: "grid",
            gap: "14px",
            marginTop: "24px",
            paddingTop: "24px",
            borderTop: "2px solid #e8ecf1",
          }}>
            <h3 style={{
              margin: "0 0 12px 0",
              fontSize: "16px",
              fontWeight: "700",
              color: "#0f172a",
              textTransform: "uppercase",
              letterSpacing: "0.3px",
            }}>
              📚 Knowledge Base
            </h3>

            {/* Payment FAQ */}
            <div style={{
              padding: "14px",
              borderRadius: "10px",
              backgroundColor: "#eff6ff",
              border: "1.5px solid #d0e8ff",
            }}>
              <details style={{ cursor: "pointer" }}>
                <summary style={{
                  fontWeight: "600",
                  color: "#0066cc",
                  fontSize: "13px",
                  userSelect: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}>
                  ❓ Payment FAQ
                </summary>
                <div style={{ marginTop: "10px", fontSize: "12px", color: "#555", lineHeight: "1.6" }}>
                  <p style={{ marginBottom: "8px", marginTop: "8px" }}>
                    <strong>Q: What happens after I pay?</strong><br/>
                    A: For full payment, admin verifies and unlocks your course. For EMI, you get instant access after first payment.
                  </p>
                  <p style={{ marginBottom: "8px" }}>
                    <strong>Q: Can I change payment method?</strong><br/>
                    A: Yes, contact support within 24 hours of payment attempt.
                  </p>
                  <p style={{ marginBottom: "0" }}>
                    <strong>Q: Is EMI interest-free?</strong><br/>
                    A: Yes, all EMI plans are interest-free.
                  </p>
                </div>
              </details>
            </div>

            {/* Course Requirements */}
            <div style={{
              padding: "14px",
              borderRadius: "10px",
              backgroundColor: "#f0fdf4",
              border: "1.5px solid #86efac",
            }}>
              <details style={{ cursor: "pointer" }}>
                <summary style={{
                  fontWeight: "600",
                  color: "#16a34a",
                  fontSize: "13px",
                  userSelect: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}>
                  ✅ Course Requirements
                </summary>
                <div style={{ marginTop: "10px", fontSize: "12px", color: "#555", lineHeight: "1.6" }}>
                  <ul style={{ margin: "0", paddingLeft: "18px" }}>
                    <li style={{ marginBottom: "6px" }}>Basic internet connection (2 Mbps minimum)</li>
                    <li style={{ marginBottom: "6px" }}>Device: Laptop, tablet, or smartphone</li>
                    <li style={{ marginBottom: "6px" }}>Updated browser (Chrome, Firefox, Safari)</li>
                    <li>Email account for course access</li>
                  </ul>
                </div>
              </details>
            </div>

            {/* Learning Tips */}
            <div style={{
              padding: "14px",
              borderRadius: "10px",
              backgroundColor: "#fef3c7",
              border: "1.5px solid #fcd34d",
            }}>
              <details style={{ cursor: "pointer" }}>
                <summary style={{
                  fontWeight: "600",
                  color: "#b45309",
                  fontSize: "13px",
                  userSelect: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}>
                  💡 Learning Tips
                </summary>
                <div style={{ marginTop: "10px", fontSize: "12px", color: "#555", lineHeight: "1.6" }}>
                  <ul style={{ margin: "0", paddingLeft: "18px" }}>
                    <li style={{ marginBottom: "6px" }}>🎯 Study for 1-2 hours daily for best results</li>
                    <li style={{ marginBottom: "6px" }}>📝 Take notes while watching videos</li>
                    <li style={{ marginBottom: "6px" }}>❓ Use doubt sessions for clarifications</li>
                    <li>🔄 Revise topics after completion</li>
                  </ul>
                </div>
              </details>
            </div>

            {/* Payment Process Steps */}
            <div style={{
              padding: "14px",
              borderRadius: "10px",
              backgroundColor: "#f3e8ff",
              border: "1.5px solid #d8b4fe",
            }}>
              <details style={{ cursor: "pointer" }}>
                <summary style={{
                  fontWeight: "600",
                  color: "#7c3aed",
                  fontSize: "13px",
                  userSelect: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}>
                  🔄 Payment Process Steps
                </summary>
                <div style={{ marginTop: "10px", fontSize: "12px", color: "#555", lineHeight: "1.6" }}>
                  <ol style={{ margin: "0", paddingLeft: "18px" }}>
                    <li style={{ marginBottom: "6px" }}>Select payment plan (Full or EMI)</li>
                    <li style={{ marginBottom: "6px" }}>Fill your details and choose payment method</li>
                    <li style={{ marginBottom: "6px" }}>Review and submit payment request</li>
                    <li style={{ marginBottom: "6px" }}>Complete payment via selected method</li>
                    <li>Get instant/verified access to course content</li>
                  </ol>
                </div>
              </details>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
