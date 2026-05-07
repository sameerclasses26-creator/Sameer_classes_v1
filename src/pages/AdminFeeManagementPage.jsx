import { useEffect, useState } from "react";
import { API_BASE } from "../api";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";

export default function AdminFeeManagementPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // State for Fee Structures
  const [feeStructures, setFeeStructures] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [showFeeStructureForm, setShowFeeStructureForm] = useState(false);
  const [editingFeeId, setEditingFeeId] = useState(null);
  const [expandedClass, setExpandedClass] = useState(null);
  const [editingPrices, setEditingPrices] = useState({});
  const [selectedClass, setSelectedClass] = useState("12th");
  const [feeStructureForm, setFeeStructureForm] = useState({
    courseId: "",
    totalAmount: "",
    description: "",
    installments: [
      { number: 1, amount: "", dueDate: "" },
      { number: 2, amount: "", dueDate: "" },
      { number: 3, amount: "", dueDate: "" },
    ],
  });

  // Load initial data
  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [coursesRes, studentsRes, feesRes] = await Promise.all([
          fetch(`${API_BASE}/content/courses`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/admin/students`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/fees/structures`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          setCourses(Array.isArray(coursesData) ? coursesData : []);
        }

        if (studentsRes.ok) {
          const studentsData = await studentsRes.json();
          // API returns array directly, not nested object
          const studentList = Array.isArray(studentsData) ? studentsData : (studentsData.students || []);
          setStudents(Array.isArray(studentList) ? studentList : []);
        }

        if (feesRes.ok) {
          const feesData = await feesRes.json();
          setFeeStructures(Array.isArray(feesData) ? feesData : []);
        }
      } catch (error) {
        setMessage(`Error loading data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]);

  const handleCreateFeeStructure = async (event) => {
    event.preventDefault();

    if (!feeStructureForm.courseId || !feeStructureForm.totalAmount) {
      setMessage("Course and total amount are required");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/fees/structures`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(feeStructureForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create fee structure");
      }

      setMessage("✓ Fee structure created successfully!");
      setFeeStructureForm({
        courseId: "",
        totalAmount: "",
        description: "",
        installments: [
          { number: 1, amount: "", dueDate: "" },
          { number: 2, amount: "", dueDate: "" },
          { number: 3, amount: "", dueDate: "" },
        ],
      });
      setShowFeeStructureForm(false);

      // Reload fee structures
      const feesRes = await fetch(`${API_BASE}/fees/structures`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (feesRes.ok) {
        const feesData = await feesRes.json();
        setFeeStructures(Array.isArray(feesData) ? feesData : []);
      }
    } catch (error) {
      setMessage(`✗ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInstallmentChange = (index, field, value) => {
    const newInstallments = [...feeStructureForm.installments];
    newInstallments[index] = { ...newInstallments[index], [field]: value };
    setFeeStructureForm((prev) => ({ ...prev, installments: newInstallments }));
  };

  const totalInstallmentAmount = feeStructureForm.installments.reduce(
    (sum, inst) => sum + (parseFloat(inst.amount) || 0),
    0
  );

  const getClassFromTitle = (title) => {
    const text = (title || "").toLowerCase();
    if (text.includes("8th") || text.includes("class 8") || text.includes("8")) return "8th";
    if (text.includes("9th") || text.includes("class 9") || text.includes("9")) return "9th";
    if (text.includes("10th") || text.includes("class 10") || text.includes("10")) return "10th";
    if (text.includes("11th") || text.includes("class 11") || text.includes("11")) return "11th";
    if (text.includes("12th") || text.includes("class 12") || text.includes("12")) return "12th";
    return "Other";
  };

  const groupFeeStructuresByClass = () => {
    const grouped = {};
    feeStructures.forEach((fs) => {
      const cls = getClassFromTitle(fs.course?.title);
      if (!grouped[cls]) grouped[cls] = [];
      grouped[cls].push(fs);
    });
    return grouped;
  };

  const handleUpdatePrice = async (feeStructureId, newPrice) => {
    if (!newPrice || newPrice <= 0) {
      setMessage("✗ Please enter a valid price");
      return;
    }

    setLoading(true);
    try {
      // Calculate 3 equal installments - 3rd EMI absorbs rounding difference
      const baseInstallmentAmount = Math.round(newPrice / 3);
      const emi1 = baseInstallmentAmount;
      const emi2 = baseInstallmentAmount;
      const emi3 = newPrice - (emi1 + emi2); // Ensures total equals newPrice exactly

      const today = new Date();
      const inst1DueDate = new Date(today);
      const inst2DueDate = new Date(today);
      inst2DueDate.setDate(inst2DueDate.getDate() + 30);
      const inst3DueDate = new Date(today);
      inst3DueDate.setDate(inst3DueDate.getDate() + 60);

      const installments = [
        { number: 1, amount: emi1, dueDate: inst1DueDate },
        { number: 2, amount: emi2, dueDate: inst2DueDate },
        { number: 3, amount: emi3, dueDate: inst3DueDate },
      ];

      const response = await fetch(`${API_BASE}/fees/structures/${feeStructureId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          totalAmount: newPrice,
          installments: installments
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update price");
      }

      setMessage("✓ Price updated successfully! EMI recalculated to 3 equal installments.");
      setEditingFeeId(null);
      setEditingPrices({});

      // Reload fee structures
      const feesRes = await fetch(`${API_BASE}/fees/structures`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (feesRes.ok) {
        const feesData = await feesRes.json();
        setFeeStructures(Array.isArray(feesData) ? feesData : []);
      }
    } catch (error) {
      setMessage(`✗ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "32px 20px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #0066cc 0%, #004d99 100%)",
          color: "white",
          padding: "40px 32px",
          borderRadius: "16px",
          marginBottom: "32px",
          boxShadow: "0 4px 20px rgba(0, 102, 204, 0.15)",
        }}
      >
        <h1 style={{ margin: "0 0 8px 0", fontSize: "32px", fontWeight: "700" }}>Fees & Installments</h1>
        <p style={{ margin: 0, fontSize: "16px", opacity: "0.9" }}>Manage course fee structures and assign fees to students</p>
      </div>

      {loading && (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <Spinner message="Loading..." />
        </div>
      )}

      {message && (
        <div
          style={{
            padding: "16px 20px",
            backgroundColor: message.includes("✓") ? "#e8f5e9" : "#ffebee",
            color: message.includes("✓") ? "#2e7d32" : "#c62828",
            borderRadius: "8px",
            marginBottom: "20px",
            border: `1px solid ${message.includes("✓") ? "#81c784" : "#ef5350"}`,
          }}
        >
          {message}
        </div>
      )}

      {/* Section 1: Create Fee Structure */}
      <article
        style={{
          padding: "24px",
          backgroundColor: "white",
          borderRadius: "16px",
          border: "1px solid #e0e0e0",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          marginBottom: "32px",
        }}
      >
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ margin: "0 0 8px 0", fontSize: "20px", fontWeight: "700", color: "#0066cc" }}>
            Step 1: Create Fee Structure
          </h2>
          <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>
            Define course fees with installment plan (e.g., 3 payments of ₹5000 each)
          </p>
        </div>

        {!showFeeStructureForm ? (
          <button
            onClick={() => setShowFeeStructureForm(true)}
            style={{
              padding: "12px 24px",
              backgroundColor: "#0066cc",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            Create New Fee Structure
          </button>
        ) : (
          <form onSubmit={handleCreateFeeStructure} style={{ display: "grid", gap: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#333" }}>
                Select Course
              </label>
              <select
                value={feeStructureForm.courseId}
                onChange={(e) =>
                  setFeeStructureForm((prev) => ({ ...prev, courseId: e.target.value }))
                }
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
              >
                <option value="">Choose a course...</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title} (₹{course.price})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#333" }}>
                Total Amount (₹)
              </label>
              <input
                type="number"
                value={feeStructureForm.totalAmount}
                onChange={(e) =>
                  setFeeStructureForm((prev) => ({ ...prev, totalAmount: e.target.value }))
                }
                min="0"
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#333" }}>
                Description
              </label>
              <textarea
                value={feeStructureForm.description}
                onChange={(e) =>
                  setFeeStructureForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="E.g., 3 monthly payments"
                rows="3"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <h4 style={{ margin: "0 0 16px 0", fontWeight: "600", color: "#333" }}>Installments</h4>
              <div style={{ display: "grid", gap: "16px" }}>
                {feeStructureForm.installments.map((inst, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "12px",
                      padding: "12px",
                      backgroundColor: "#f5f5f5",
                      borderRadius: "8px",
                    }}
                  >
                    <div>
                      <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", color: "#666" }}>
                        Installment {inst.number}
                      </label>
                      <input
                        type="number"
                        value={inst.amount}
                        onChange={(e) => handleInstallmentChange(idx, "amount", e.target.value)}
                        placeholder="Amount"
                        min="0"
                        required
                        style={{
                          width: "100%",
                          padding: "8px",
                          border: "1px solid #ddd",
                          borderRadius: "6px",
                          fontSize: "14px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", color: "#666" }}>
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={inst.dueDate}
                        onChange={(e) => handleInstallmentChange(idx, "dueDate", e.target.value)}
                        required
                        style={{
                          width: "100%",
                          padding: "8px",
                          border: "1px solid #ddd",
                          borderRadius: "6px",
                          fontSize: "14px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end" }}>
                      <div style={{ width: "100%" }}>
                        <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#666", fontWeight: "600" }}>
                          Amount
                        </p>
                        <p style={{ margin: "0", fontSize: "16px", fontWeight: "700", color: "#0066cc" }}>
                          ₹{parseFloat(inst.amount) || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "12px", padding: "12px", backgroundColor: "#f0f0f0", borderRadius: "8px" }}>
                <p style={{ margin: "0", fontSize: "14px", fontWeight: "600", color: "#333" }}>
                  Total: ₹{totalInstallmentAmount} (Target: ₹{feeStructureForm.totalAmount || 0})
                </p>
                {totalInstallmentAmount !== parseFloat(feeStructureForm.totalAmount || 0) && (
                  <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#ff9800" }}>
                    ⚠ Installment amounts should equal total amount
                  </p>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="submit"
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#0066cc",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                Create Fee Structure
              </button>
              <button
                type="button"
                onClick={() => setShowFeeStructureForm(false)}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#e0e0e0",
                  color: "#333",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Fee Structures by Class - Sidebar Navigation */}
        {feeStructures.length > 0 && (
          <div style={{ marginTop: "32px" }}>
            <h4 style={{ margin: "0 0 24px 0", fontWeight: "700", color: "#333", fontSize: "16px" }}>✅ Active Fee Structures</h4>
            
            <div style={{ display: "flex", gap: "20px", minHeight: "600px" }}>
              {/* Left Sidebar - Class Navigation */}
              <div style={{
                width: "220px",
                backgroundColor: "white",
                border: "2px solid #e8ecf1",
                borderRadius: "12px",
                padding: "16px 0",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                height: "fit-content",
                position: "sticky",
                top: "80px",
              }}>
                <p style={{ margin: "0 16px 12px 16px", fontSize: "12px", fontWeight: "600", color: "#999", textTransform: "uppercase" }}>
                  Classes
                </p>
                {Object.entries(groupFeeStructuresByClass())
                  .sort(([classA], [classB]) => {
                    const order = { "8th": 1, "9th": 2, "10th": 3, "11th": 4, "12th": 5, "Other": 6 };
                    return (order[classA] || 99) - (order[classB] || 99);
                  })
                  .map(([className, fees]) => (
                    <button
                      key={className}
                      type="button"
                      onClick={() => setSelectedClass(className)}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        margin: "0",
                        border: "none",
                        backgroundColor: selectedClass === className ? "#0066cc" : "transparent",
                        color: selectedClass === className ? "white" : "#333",
                        textAlign: "left",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: selectedClass === className ? "700" : "600",
                        transition: "all 0.3s ease",
                        borderLeft: selectedClass === className ? "4px solid #0052a3" : "4px solid transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (selectedClass !== className) {
                          e.currentTarget.style.backgroundColor = "#f0f7ff";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedClass !== className) {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>{className} Class</span>
                        <span style={{
                          fontSize: "12px",
                          backgroundColor: selectedClass === className ? "rgba(255,255,255,0.2)" : "#e8ecf1",
                          color: selectedClass === className ? "white" : "#666",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontWeight: "700",
                        }}>
                          {fees.length}
                        </span>
                      </div>
                    </button>
                  ))}
              </div>

              {/* Right Main Content - Selected Class Subjects */}
              <div style={{ flex: 1 }}>
                {selectedClass && groupFeeStructuresByClass()[selectedClass] && (
                  <div style={{
                    backgroundColor: "white",
                    border: "2px solid #e8ecf1",
                    borderRadius: "12px",
                    padding: "24px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                  }}>
                    {/* Selected Class Header */}
                    <div style={{
                      marginBottom: "24px",
                      paddingBottom: "16px",
                      borderBottom: "2px solid #e8ecf1",
                    }}>
                      <h5 style={{
                        margin: "0 0 4px 0",
                        fontSize: "24px",
                        fontWeight: "700",
                        color: "#0066cc",
                      }}>
                        {selectedClass} Class
                      </h5>
                      <p style={{
                        margin: "0",
                        fontSize: "13px",
                        color: "#999",
                      }}>
                        {groupFeeStructuresByClass()[selectedClass]?.length} subject course{groupFeeStructuresByClass()[selectedClass]?.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Subject Courses Grid */}
                    <div style={{ display: "grid", gap: "16px" }}>
                      {groupFeeStructuresByClass()[selectedClass]?.map((fs) => (
                        <div
                          key={fs._id}
                          style={{
                            backgroundColor: "#fafbfc",
                            border: "1px solid #d0d8e0",
                            borderRadius: "10px",
                            padding: "16px",
                            transition: "all 0.3s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#0066cc";
                            e.currentTarget.style.boxShadow = "0 2px 12px rgba(0, 102, 204, 0.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#d0d8e0";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          {/* Subject Title & Price */}
                          <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: "12px",
                            paddingBottom: "12px",
                            borderBottom: "1px solid #e8ecf1"
                          }}>
                            <div>
                              <h6 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "700", color: "#333" }}>
                                {fs.course?.title}
                              </h6>
                              <p style={{ margin: "0", fontSize: "26px", fontWeight: "700", color: "#0066cc" }}>
                                ₹{fs.totalAmount?.toLocaleString()}
                              </p>
                            </div>
                            {editingFeeId !== fs._id && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingFeeId(fs._id);
                                  setEditingPrices({ ...editingPrices, [fs._id]: fs.totalAmount });
                                }}
                                style={{
                                  padding: "8px 16px",
                                  backgroundColor: "#0066cc",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  fontWeight: "600",
                                  fontSize: "12px",
                                  transition: "all 0.3s ease",
                                  whiteSpace: "nowrap",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = "#0052a3";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = "#0066cc";
                                }}
                              >
                                ✏️ Edit Price
                              </button>
                            )}
                          </div>

                          {/* Edit Price Form */}
                          {editingFeeId === fs._id && (
                            <div style={{
                              marginBottom: "12px",
                              paddingBottom: "12px",
                              borderBottom: "1px solid #e8ecf1",
                              display: "grid",
                              gap: "8px",
                            }}>
                              <label style={{ fontSize: "12px", fontWeight: "600", color: "#666" }}>
                                New Price (₹)
                              </label>
                              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                <input
                                  type="number"
                                  value={editingPrices[fs._id] || ""}
                                  onChange={(e) => setEditingPrices({
                                    ...editingPrices,
                                    [fs._id]: parseFloat(e.target.value) || 0
                                  })}
                                  style={{
                                    flex: 1,
                                    minWidth: "150px",
                                    padding: "10px 12px",
                                    border: "1px solid #d0d8e0",
                                    borderRadius: "6px",
                                    fontSize: "14px",
                                    fontWeight: "600"
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdatePrice(fs._id, editingPrices[fs._id])}
                                  disabled={loading}
                                  style={{
                                    padding: "10px 16px",
                                    backgroundColor: loading ? "#ccc" : "#28a745",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: loading ? "not-allowed" : "pointer",
                                    fontWeight: "600",
                                    fontSize: "12px",
                                    transition: "all 0.3s ease",
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!loading) e.currentTarget.style.backgroundColor = "#218838";
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!loading) e.currentTarget.style.backgroundColor = "#28a745";
                                  }}
                                >
                                  {loading ? "Updating..." : "💾 Save"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingFeeId(null);
                                    setEditingPrices({ ...editingPrices, [fs._id]: undefined });
                                  }}
                                  style={{
                                    padding: "10px 16px",
                                    backgroundColor: "#dc3545",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                    fontSize: "12px",
                                    transition: "all 0.3s ease",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = "#c82333";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "#dc3545";
                                  }}
                                >
                                  ✕ Cancel
                                </button>
                              </div>
                              <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "#666", fontStyle: "italic" }}>
                                💡 Enter new price and EMI will auto-recalculate to 3 equal installments
                              </p>
                            </div>
                          )}

                          {/* Installments Display */}
                          <div style={{ display: "grid", gap: "8px" }}>
                            <p style={{ margin: "0 0 8px 0", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>
                              📅 3 EMI Installments
                            </p>
                            {fs.installments?.map((inst, idx) => (
                              <div
                                key={idx}
                                style={{
                                  padding: "10px 12px",
                                  backgroundColor: "#f0f7ff",
                                  border: "1px solid #d0e8ff",
                                  borderRadius: "8px",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center"
                                }}
                              >
                                <div style={{ fontSize: "13px", color: "#333", fontWeight: "500" }}>
                                  EMI {inst.number}
                                </div>
                                <div style={{ textAlign: "right" }}>
                                  <p style={{ margin: "0", fontSize: "13px", fontWeight: "600", color: "#0066cc" }}>
                                    ₹{inst.amount?.toLocaleString()}
                                  </p>
                                  <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#999" }}>
                                    {new Date(inst.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </article>

      
    </div>
  );
}
