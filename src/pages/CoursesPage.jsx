import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { API_BASE } from "../api";
import CourseCard from "../components/CourseCard";
import SectionHeading from "../components/SectionHeading";
import { useAuth } from "../context/AuthContext";

export default function CoursesPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("courses");
  const [courses, setCourses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [payments, setPayments] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (location.state?.paymentMessage) {
      setMessage(location.state.paymentMessage);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const [coursesResponse, materialsResponse] = await Promise.all([
          fetch(`${API_BASE}/content/courses`),
          fetch(`${API_BASE}/content/materials`),
        ]);
        setCourses(await coursesResponse.json());
        setMaterials(await materialsResponse.json());
      } catch (error) {
        setCourses([]);
        setMaterials([]);
      }

      if (token) {
        try {
          const [paymentsResponse, enrollmentsResponse] = await Promise.all([
            fetch(`${API_BASE}/dashboard/payments`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${API_BASE}/dashboard/enrollments`, { headers: { Authorization: `Bearer ${token}` } }),
          ]);
          setPayments(await paymentsResponse.json());
          setEnrollments(await enrollmentsResponse.json());
        } catch {
          setPayments([]);
          setEnrollments([]);
        }
      }
    };

    loadContent();
  }, [token]);

  const handlePurchase = async (type, id, title) => {
    if (!token) {
      navigate("/login");
      return;
    }

    setMessage("");
    try {
      const path = type === "course" ? `/api/dashboard/purchase/course/${id}` : `/api/dashboard/purchase/material/${id}`;
      const response = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to complete purchase.");
      }
      setMessage(data.message || `Your payment request for ${title} has been sent to admin.`);
      if (token) {
        const paymentsResponse = await fetch(`${API_BASE}/dashboard/payments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPayments(await paymentsResponse.json());
      }
    } catch (error) {
      setMessage(error.message);
    }
  };

  const getReferenceStatus = (item, referenceModel) => {
    const payment = payments.find(
      (paymentItem) =>
        paymentItem.referenceModel === referenceModel && String(paymentItem.reference) === String(item._id)
    );
    return payment;
  };

  const getCourseStatus = (course) => {
    const enrolled = enrollments.some((enrollment) => String(enrollment.course?._id || enrollment.course) === String(course._id));
    if (enrolled) {
      return { label: "Visit course", disabled: false, type: "view" };
    }

    const payment = getReferenceStatus(course, "Course");
    if (payment) {
      return { label: payment.status === "Paid" ? "Payment completed" : "Payment in progress", disabled: payment.status !== "Paid", status: payment.status };
    }

    return { label: "Buy", disabled: false, type: "buy" };
  };

  const getMaterialStatus = (material) => {
    const payment = getReferenceStatus(material, "StudyMaterial");
    if (payment) {
      if (payment.status === "Paid") {
        return { label: "Visit study material", disabled: false, type: "view", status: payment.status };
      }
      return { label: "Payment in progress", disabled: true, status: payment.status };
    }
    return { label: "Buy", disabled: false, type: "buy" };
  };

  const groupItemsByClass = (items) => {
    const groups = items.reduce((acc, item) => {
      const text = `${item.title || ""} ${item.category || ""} ${item.course || ""}`;
      let group = "Other";
      if (/\b(10th|class\s*10|standard\s*10|grade\s*10|xth)\b/i.test(text)) group = "10th Class";
      else if (/\b(11th|class\s*11|standard\s*11|grade\s*11)\b/i.test(text)) group = "11th Class";
      else if (/\b(12th|class\s*12|standard\s*12|grade\s*12)\b/i.test(text)) group = "12th Class";
      else if (/\b(9th|class\s*9|standard\s*9|grade\s*9)\b/i.test(text)) group = "9th Class";
      else if (/\b(8th|class\s*8|standard\s*8|grade\s*8)\b/i.test(text)) group = "8th Class";
      else if (/foundation/i.test(text)) group = "Foundation";
      if (!acc[group]) acc[group] = [];
      acc[group].push(item);
      return acc;
    }, {});

    const ordered = ["8th Class", "9th Class", "10th Class", "11th Class", "12th Class", "Foundation", "Other"];
    return ordered.reduce((acc, key) => {
      if (groups[key]?.length) acc[key] = groups[key];
      return acc;
    }, {});
  };

  const getSubjectLabel = (item, groupName) => {
    const classPattern = /\b(?:class|grade|standard)?\s*(8th|9th|10th|11th|12th|8|9|10|11|12)\b/gi;
    const normalizeValue = (value = "") =>
      value
        .toLowerCase()
        .replace(classPattern, "")
        .replace(/\bclass\b|\bgrade\b|\bstandard\b/gi, "")
        .replace(/\s+/g, " ")
        .trim();

    const cleanedTitle = (item.title || "")
      .replace(classPattern, "")
      .replace(/\bclass\b|\bgrade\b|\bstandard\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    const cleanedCategory = (item.category || "")
      .replace(classPattern, "")
      .replace(/\bclass\b|\bgrade\b|\bstandard\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    if (cleanedTitle) {
      return cleanedTitle;
    }

    if (cleanedCategory && normalizeValue(cleanedCategory) !== normalizeValue(groupName)) {
      return cleanedCategory;
    }

    return cleanedCategory || item.title;
  };

  const getCourseCardData = (course, groupName) => {
    const subjectName = getSubjectLabel(course, groupName);

    return {
      ...course,
      category: subjectName,
      title: "",
    };
  };

  const groupedCourses = groupItemsByClass(courses);
  const groupedMaterials = groupItemsByClass(materials);

  const sectionTitle = activeTab === "courses" ? "Programs designed around admissions, depth, and discipline" : "Wide library of class 8-12 study materials";
  const sectionDescription =
    activeTab === "courses"
      ? ""
      : "Browse affordable notes and PDFs for all major subjects in class 8 through 12.";

  return (
    <div className="page section">
      <div className="course-page-header">
        <SectionHeading eyebrow={activeTab === "courses" ? "Courses" : "Study materials"} title={sectionTitle} description={sectionDescription} />
        <div className="tab-nav">
          <button className={`tab-button ${activeTab === "courses" ? "active" : ""}`} type="button" onClick={() => setActiveTab("courses")}>Courses</button>
          <button className={`tab-button ${activeTab === "materials" ? "active" : ""}`} type="button" onClick={() => setActiveTab("materials")}>Study materials</button>
        </div>
      </div>
      {message ? <p style={{ marginBottom: 16 }}>{message}</p> : null}

      {activeTab === "courses" ? (
        Object.entries(groupedCourses).length ? (
          Object.entries(groupedCourses).map(([groupName, groupItems]) => (
            <div key={groupName} style={{ marginBottom: 28 }}>
              <h2 style={{ marginBottom: 14 }}>{groupName}</h2>
              <div className="card-grid">
                {groupItems.map((course) => {
                  const status = getCourseStatus(course);
                  return (
                    <CourseCard
                      key={course._id}
                      course={getCourseCardData(course, groupName)}
                      actionLabel={status.label}
                      actionDisabled={status.disabled}
                      onAction={() => {
                        if (status.type === "view") {
                          navigate("/dashboard");
                        } else if (status.type === "buy") {
                          if (!token) {
                            navigate("/login");
                            return;
                          }
                          navigate(`/courses/${course._id}/payment`, {
                            state: { course },
                          });
                        }
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <article className="card">No courses available.</article>
        )
      ) : (
        Object.entries(groupedMaterials).length ? (
          Object.entries(groupedMaterials).map(([groupName, groupItems]) => (
            <div key={groupName} style={{ marginBottom: 28 }}>
              <h2 style={{ marginBottom: 14 }}>{groupName}</h2>
              <div className="card-grid">
                {groupItems.map((material) => {
                  const status = getMaterialStatus(material);
                  return (
                    <CourseCard
                      key={material._id}
                      course={{
                        category: material.category,
                        duration: material.course || "Study pack",
                        title: material.title,
                        summary: material.description,
                        mode: "Study material",
                        price: material.price,
                      }}
                      actionLabel={status.label}
                      actionDisabled={status.disabled}
                      onAction={() => {
                        if (status.type === "buy") {
                          handlePurchase("material", material._id, material.title);
                        }
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <article className="card">No study materials available.</article>
        )
      )}
    </div>
  );
}
