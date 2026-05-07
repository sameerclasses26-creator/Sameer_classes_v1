import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../api";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import "./AdminCourseContentPage.css";

export default function AdminCourseContentPage() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    if (token) {
      fetchCourses();
    }
  }, [token]);

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "All",
    ...Array.from(new Set(courses.map((c) => c.category).filter(Boolean))),
  ];

const CLASS_ORDER = ["Class 8", "Class 9", "Class 10", "Class 11", "Class 12"];

const sortedCourses = (courseList) => {
  return [...courseList].sort((a, b) => {
    const aIndex = CLASS_ORDER.indexOf(a.category);
    const bIndex = CLASS_ORDER.indexOf(b.category);
    const aRank = aIndex === -1 ? CLASS_ORDER.length : aIndex;
    const bRank = bIndex === -1 ? CLASS_ORDER.length : bIndex;
    return aRank - bRank;
  });
};

const filteredCourses =
  activeCategory === "All"
    ? sortedCourses(courses)
    : courses.filter((c) => c.category === activeCategory);

  return (
    <div className="page section admin-course-content-page">
      <div className="page-header">
        <button
          className="ghost-button"
          onClick={() => navigate("/admin")}
          style={{ marginBottom: 16 }}
        >
          ← Back to Admin
        </button>
        <h1>Manage Course Content</h1>
        <p>Select a course to add sections, lessons, topics, examples, and questions</p>
      </div>

      {/* Category Tabs */}
     <div className="category-tabs-wrapper">
  <div className="category-tabs">
    {categories.map((cat) => (
      <button
        key={cat}
        className={`category-tab ${activeCategory === cat ? "active" : ""}`}
        onClick={() => setActiveCategory(cat)}
      >
        {cat}
        {activeCategory === cat && <span className="tab-indicator" />}
      </button>
    ))}
  </div>
</div>

      <div className="courses-grid">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <div key={course._id} className="course-card">
              <div className="course-card-content">
                <h3>{course.title}</h3>
                <p className="course-category">
                  {course.parentCourse
                    ? `${course.category} • Linked to ${course.parentCourse.title}`
                    : course.category}
                </p>
                <p className="course-description">{course.summary}</p>
              </div>
              <button
                className="solid-button"
                onClick={() => navigate(`/admin/courses/${course._id}/edit`)}
              >
                Manage Content →
              </button>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px" }}>
            <p>No courses found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}