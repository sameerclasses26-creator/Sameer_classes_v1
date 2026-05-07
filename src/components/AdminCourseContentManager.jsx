import { useEffect, useState } from "react";
import { API_BASE } from "../api";
import Spinner from "../components/Spinner";
import "./AdminCourseContentManager.css";

export default function AdminCourseContentManager({
  token,
  courses,
  onContentSaved,
}) {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseContent, setCourseContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);

  const [sectionForm, setSectionForm] = useState({
    title: "",
    description: "",
    order: 1,
  });

  const [lessonForm, setLessonForm] = useState({
    title: "",
    description: "",
    videoUrl: "",
    resourceUrl: "",
    duration: "0 mins",
    order: 1,
  });

  // Fetch course content when course is selected
  useEffect(() => {
    if (selectedCourse) {
      fetchCourseContent(selectedCourse._id);
    }
  }, [selectedCourse]);

  const fetchCourseContent = async (courseId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/courses/${courseId}/content`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCourseContent(data);
      } else {
        // No content yet, initialize empty
        setCourseContent({ courseId, sections: [] });
      }
    } catch (err) {
      console.error("Error fetching course content:", err);
      setCourseContent({ courseId, sections: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = async (e) => {
    e.preventDefault();

    if (!sectionForm.title || !sectionForm.description) {
      setMessage({ type: "error", text: "All section fields are required" });
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/courses/admin/${selectedCourse._id}/sections`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sectionForm),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCourseContent(data.courseContent);
        setSectionForm({ title: "", description: "", order: 1 });
        setShowSectionForm(false);
        setMessage({ type: "success", text: "Section added successfully" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: "Failed to add section" });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this section and all its lessons?"
      )
    )
      return;

    try {
      const response = await fetch(
        `${API_BASE}/courses/admin/${selectedCourse._id}/sections/${sectionId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCourseContent(data.courseContent);
        setMessage({
          type: "success",
          text: "Section deleted successfully",
        });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();

    if (!editingSection) {
      setMessage({ type: "error", text: "Select a section first" });
      return;
    }

    if (!lessonForm.title || !lessonForm.description) {
      setMessage({ type: "error", text: "All lesson fields are required" });
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/courses/admin/${selectedCourse._id}/sections/${editingSection._id}/lessons`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(lessonForm),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCourseContent(data.courseContent);
        setLessonForm({
          title: "",
          description: "",
          videoUrl: "",
          resourceUrl: "",
          duration: "0 mins",
          order: 1,
        });
        setShowLessonForm(false);
        setMessage({
          type: "success",
          text: "Lesson added successfully",
        });
        setTimeout(() => setMessage(null), 3000);

        // Update editingSection reference
        const updatedSection = data.courseContent.sections.find(
          (s) => s._id === editingSection._id
        );
        setEditingSection(updatedSection);
      } else {
        setMessage({ type: "error", text: "Failed to add lesson" });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const handleDeleteLesson = async (sectionId, lessonId) => {
    if (!window.confirm("Delete this lesson?")) return;

    try {
      const response = await fetch(
        `${API_BASE}/courses/admin/${selectedCourse._id}/sections/${sectionId}/lessons/${lessonId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCourseContent(data.courseContent);
        setMessage({
          type: "success",
          text: "Lesson deleted successfully",
        });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  return (
    <div className="admin-course-content-manager">
      {message && (
        <div className={`message-banner ${message.type}`}>{message.text}</div>
      )}

      <div className="course-selection-grid">
        <h3>Select a Course</h3>
        <div className="course-select-list">
          {courses.map((course) => (
            <button
              key={course._id}
              className={`course-select-btn ${
                selectedCourse?._id === course._id ? "active" : ""
              }`}
              onClick={() => setSelectedCourse(course)}
            >
              <strong>{course.title}</strong>
              <span className="course-category">{course.category}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedCourse && (
        <>
          {loading ? (
            <Spinner message="Loading course content..." />
          ) : (
            <div className="course-content-editor">
              <div className="editor-header">
                <h3>Manage Course Content: {selectedCourse.title}</h3>
                <button
                  className="solid-button"
                  onClick={() => setShowSectionForm(true)}
                >
                  + Add Section
                </button>
              </div>

              {/* Add Section Form */}
              {showSectionForm && (
                <div className="form-card">
                  <h4>Add New Section</h4>
                  <form onSubmit={handleAddSection}>
                    <div className="form-group">
                      <label>Section Title</label>
                      <input
                        type="text"
                        placeholder="e.g., Introduction to Algebra"
                        value={sectionForm.title}
                        onChange={(e) =>
                          setSectionForm({
                            ...sectionForm,
                            title: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        placeholder="Describe what students will learn in this section..."
                        value={sectionForm.description}
                        onChange={(e) =>
                          setSectionForm({
                            ...sectionForm,
                            description: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Order (Position)</label>
                      <input
                        type="number"
                        value={sectionForm.order}
                        onChange={(e) =>
                          setSectionForm({
                            ...sectionForm,
                            order: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>

                    <div className="form-actions">
                      <button className="solid-button" type="submit">
                        Add Section
                      </button>
                      <button
                        className="ghost-button"
                        type="button"
                        onClick={() => {
                          setShowSectionForm(false);
                          setSectionForm({
                            title: "",
                            description: "",
                            order: 1,
                          });
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Sections List */}
              {courseContent?.sections.length > 0 ? (
                <div className="sections-list">
                  {courseContent.sections.map((section, index) => (
                    <div key={section._id} className="section-item">
                      <div className="section-header-bar">
                        <div>
                          <h4>
                            Section {index + 1}: {section.title}
                          </h4>
                          <p className="section-description-small">
                            {section.description}
                          </p>
                        </div>
                        <div className="section-actions">
                          <button
                            className="solid-button"
                            onClick={() => {
                              setEditingSection(section);
                              setShowLessonForm(true);
                            }}
                          >
                            + Add Lesson
                          </button>
                          <button
                            className="ghost-button"
                            onClick={() => handleDeleteSection(section._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Add Lesson Form */}
                      {showLessonForm && editingSection?._id === section._id && (
                        <div className="lesson-form-card">
                          <h5>Add New Lesson</h5>
                          <form onSubmit={handleAddLesson}>
                            <div className="form-group">
                              <label>Lesson Title</label>
                              <input
                                type="text"
                                placeholder="e.g., What is Algebra?"
                                value={lessonForm.title}
                                onChange={(e) =>
                                  setLessonForm({
                                    ...lessonForm,
                                    title: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>

                            <div className="form-group">
                              <label>Description</label>
                              <textarea
                                placeholder="Explain the lesson content..."
                                value={lessonForm.description}
                                onChange={(e) =>
                                  setLessonForm({
                                    ...lessonForm,
                                    description: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>

                            <div className="form-row">
                              <div className="form-group">
                                <label>Duration</label>
                                <input
                                  type="text"
                                  placeholder="e.g., 30 mins"
                                  value={lessonForm.duration}
                                  onChange={(e) =>
                                    setLessonForm({
                                      ...lessonForm,
                                      duration: e.target.value,
                                    })
                                  }
                                />
                              </div>

                              <div className="form-group">
                                <label>Order</label>
                                <input
                                  type="number"
                                  value={lessonForm.order}
                                  onChange={(e) =>
                                    setLessonForm({
                                      ...lessonForm,
                                      order: parseInt(e.target.value),
                                    })
                                  }
                                />
                              </div>
                            </div>

                            <div className="form-group">
                              <label>Video URL (YouTube/Embed)</label>
                              <input
                                type="text"
                                placeholder="https://youtube.com/embed/..."
                                value={lessonForm.videoUrl}
                                onChange={(e) =>
                                  setLessonForm({
                                    ...lessonForm,
                                    videoUrl: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <div className="form-group">
                              <label>Resource URL (PDF/Docs)</label>
                              <input
                                type="text"
                                placeholder="https://..."
                                value={lessonForm.resourceUrl}
                                onChange={(e) =>
                                  setLessonForm({
                                    ...lessonForm,
                                    resourceUrl: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <div className="form-actions">
                              <button className="solid-button" type="submit">
                                Add Lesson
                              </button>
                              <button
                                className="ghost-button"
                                type="button"
                                onClick={() => {
                                  setShowLessonForm(false);
                                  setEditingSection(null);
                                  setLessonForm({
                                    title: "",
                                    description: "",
                                    videoUrl: "",
                                    resourceUrl: "",
                                    duration: "0 mins",
                                    order: 1,
                                  });
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        </div>
                      )}

                      {/* Lessons List */}
                      {section.lessons && section.lessons.length > 0 && (
                        <div className="lessons-list">
                          <h5>Lessons in this Section</h5>
                          {section.lessons.map((lesson, lessonIdx) => (
                            <div key={lesson._id} className="lesson-item">
                              <div className="lesson-info">
                                <strong>
                                  Lesson {lessonIdx + 1}: {lesson.title}
                                </strong>
                                <p className="lesson-meta">
                                  {lesson.duration} • {lesson.description}
                                </p>
                                {lesson.videoUrl && (
                                  <small className="lesson-has-video">
                                    📹 Has video
                                  </small>
                                )}
                                {lesson.resourceUrl && (
                                  <small className="lesson-has-resource">
                                    📄 Has resource
                                  </small>
                                )}
                              </div>
                              <button
                                className="ghost-button"
                                onClick={() =>
                                  handleDeleteLesson(section._id, lesson._id)
                                }
                              >
                                Delete
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <p>No sections yet. Click "Add Section" to get started.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

              {/* Add Section Form */}
              {showSectionForm && (
                <div className="form-card">
                  <h4>Add New Section</h4>
                  <form onSubmit={handleAddSection}>
                    <div className="form-group">
                      <label>Section Title</label>
                      <input
                        type="text"
                        placeholder="e.g., Introduction to Algebra"
                        value={sectionForm.title}
                        onChange={(e) =>
                          setSectionForm({
                            ...sectionForm,
                            title: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        placeholder="Describe what students will learn in this section..."
                        value={sectionForm.description}
                        onChange={(e) =>
                          setSectionForm({
                            ...sectionForm,
                            description: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Order (Position)</label>
                      <input
                        type="number"
                        value={sectionForm.order}
                        onChange={(e) =>
                          setSectionForm({
                            ...sectionForm,
                            order: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>

                    <div className="form-actions">
                      <button className="solid-button" type="submit">
                        Add Section
                      </button>
                      <button
                        className="ghost-button"
                        type="button"
                        onClick={() => {
                          setShowSectionForm(false);
                          setSectionForm({
                            title: "",
                            description: "",
                            order: 1,
                          });
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Sections List */}
              {courseContent?.sections.length > 0 ? (
                <div className="sections-list">
                  {courseContent.sections.map((section, index) => (
                    <div key={section._id} className="section-card">
                      {/* Section Header - Toggle */}
                      <div className="section-header">
                        <div
                          className="section-header-content"
                          onClick={() =>
                            setExpandedSection(
                              expandedSection === section._id ? null : section._id
                            )
                          }
                        >
                          <div className="section-title-area">
                            <span className="section-toggle">
                              {expandedSection === section._id ? "▼" : "▶"}
                            </span>
                            <div>
                              <h3>Section {index + 1}: {section.title}</h3>
                              <p className="section-subtitle">
                                {section.description}
                              </p>
                              <div className="section-stats">
                                <span className="stat">
                                  📚 {(section.lessons || []).length} Lessons
                                </span>
                                <span className="stat">
                                  💡 {(section.topics || []).length} Topics
                                </span>
                                <span className="stat">
                                  🔍 {(section.examples || []).length} Examples
                                </span>
                                <span className="stat">
                                  ❓ {(section.questions || []).length} Questions
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="section-header-actions">
                          <button
                            className="ghost-button delete-btn"
                            onClick={() => handleDeleteSection(section._id)}
                            title="Delete section"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      {/* Expanded Content with Tabs */}
                      {expandedSection === section._id && (
                        <div className="section-expanded">
                          {/* Tab Navigation */}
                          <div className="tab-nav">
                            <button
                              className={`tab-button ${
                                activeTab === "basics" ? "active" : ""
                              }`}
                              onClick={() => setActiveTab("basics")}
                            >
                              📋 Basics
                            </button>
                            <button
                              className={`tab-button ${
                                activeTab === "topics" ? "active" : ""
                              }`}
                              onClick={() => setActiveTab("topics")}
                            >
                              💡 Topics
                            </button>
                            <button
                              className={`tab-button ${
                                activeTab === "examples" ? "active" : ""
                              }`}
                              onClick={() => setActiveTab("examples")}
                            >
                              🔍 Examples
                            </button>
                            <button
                              className={`tab-button ${
                                activeTab === "questions" ? "active" : ""
                              }`}
                              onClick={() => setActiveTab("questions")}
                            >
                              ❓ Questions
                            </button>
                            <button
                              className={`tab-button ${
                                activeTab === "lessons" ? "active" : ""
                              }`}
                              onClick={() => setActiveTab("lessons")}
                            >
                              📹 Lessons
                            </button>
                          </div>

                          {/* BASICS TAB */}
                          {activeTab === "basics" && (
                            <div className="tab-content">
                              <div className="basics-summary">
                                <h4>Section Overview</h4>
                                <div className="info-box">
                                  <div className="info-row">
                                    <strong>Title:</strong>
                                    <span>{section.title}</span>
                                  </div>
                                  <div className="info-row">
                                    <strong>Description:</strong>
                                    <span>{section.description}</span>
                                  </div>
                                  <div className="info-row">
                                    <strong>Order:</strong>
                                    <span>{section.order}</span>
                                  </div>
                                  <div className="info-row">
                                    <strong>Total Content Items:</strong>
                                    <span>
                                      {(section.topics || []).length +
                                        (section.examples || []).length +
                                        (section.questions || []).length +
                                        (section.lessons || []).length}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* TOPICS TAB */}
                          {activeTab === "topics" && (
                            <div className="tab-content">
                              {showTopicForm && editingSection?._id === section._id ? (
                                <div className="form-card">
                                  <h4>Add New Topic</h4>
                                  <form onSubmit={handleAddTopic}>
                                    <div className="form-group">
                                      <label>Topic Title</label>
                                      <input
                                        type="text"
                                        placeholder="e.g., Variables and Equations"
                                        value={topicForm.title}
                                        onChange={(e) =>
                                          setTopicForm({
                                            ...topicForm,
                                            title: e.target.value,
                                          })
                                        }
                                        required
                                      />
                                    </div>

                                    <div className="form-group">
                                      <label>Content</label>
                                      <textarea
                                        placeholder="Detailed explanation of the topic..."
                                        value={topicForm.content}
                                        onChange={(e) =>
                                          setTopicForm({
                                            ...topicForm,
                                            content: e.target.value,
                                          })
                                        }
                                        rows="5"
                                        required
                                      />
                                    </div>

                                    <div className="form-group">
                                      <label>Key Points (one per line)</label>
                                      {topicForm.keyPoints.map((kp, idx) => (
                                        <div key={idx} className="key-point-input">
                                          <input
                                            type="text"
                                            placeholder={`Key point ${idx + 1}`}
                                            value={kp}
                                            onChange={(e) => {
                                              const updated = [...topicForm.keyPoints];
                                              updated[idx] = e.target.value;
                                              setTopicForm({
                                                ...topicForm,
                                                keyPoints: updated,
                                              });
                                            }}
                                          />
                                          {topicForm.keyPoints.length > 1 && (
                                            <button
                                              type="button"
                                              className="ghost-button"
                                              onClick={() => {
                                                const updated = topicForm.keyPoints.filter(
                                                  (_, i) => i !== idx
                                                );
                                                setTopicForm({
                                                  ...topicForm,
                                                  keyPoints: updated,
                                                });
                                              }}
                                            >
                                              ✕
                                            </button>
                                          )}
                                        </div>
                                      ))}
                                      <button
                                        type="button"
                                        className="ghost-button"
                                        onClick={() =>
                                          setTopicForm({
                                            ...topicForm,
                                            keyPoints: [...topicForm.keyPoints, ""],
                                          })
                                        }
                                      >
                                        + Add Key Point
                                      </button>
                                    </div>

                                    <div className="form-actions">
                                      <button className="solid-button" type="submit">
                                        Add Topic
                                      </button>
                                      <button
                                        className="ghost-button"
                                        type="button"
                                        onClick={() => {
                                          setShowTopicForm(false);
                                          setTopicForm({
                                            title: "",
                                            content: "",
                                            keyPoints: [""],
                                          });
                                        }}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </form>
                                </div>
                              ) : (
                                <button
                                  className="solid-button"
                                  onClick={() => {
                                    setEditingSection(section);
                                    setShowTopicForm(true);
                                  }}
                                >
                                  + Add Topic
                                </button>
                              )}

                              {section.topics && section.topics.length > 0 && (
                                <div className="items-list">
                                  <h4>Topics in this Section</h4>
                                  {section.topics.map((topic, idx) => (
                                    <div key={topic._id} className="item-card topic-card">
                                      <div className="item-header">
                                        <strong>
                                          {idx + 1}. {topic.title}
                                        </strong>
                                        <button
                                          className="ghost-button delete-small"
                                          onClick={() =>
                                            handleDeleteTopic(section._id, topic._id)
                                          }
                                        >
                                          ✕
                                        </button>
                                      </div>
                                      <p className="item-content">{topic.content}</p>
                                      {topic.keyPoints && topic.keyPoints.length > 0 && (
                                        <div className="key-points-display">
                                          <strong>Key Points:</strong>
                                          <ul>
                                            {topic.keyPoints.map((kp, kpIdx) => (
                                              <li key={kpIdx}>{kp}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* EXAMPLES TAB */}
                          {activeTab === "examples" && (
                            <div className="tab-content">
                              {showExampleForm && editingSection?._id === section._id ? (
                                <div className="form-card">
                                  <h4>Add New Example</h4>
                                  <form onSubmit={handleAddExample}>
                                    <div className="form-group">
                                      <label>Example Title</label>
                                      <input
                                        type="text"
                                        placeholder="e.g., Solving Linear Equations"
                                        value={exampleForm.title}
                                        onChange={(e) =>
                                          setExampleForm({
                                            ...exampleForm,
                                            title: e.target.value,
                                          })
                                        }
                                        required
                                      />
                                    </div>

                                    <div className="form-group">
                                      <label>Description</label>
                                      <textarea
                                        placeholder="Describe the example..."
                                        value={exampleForm.description}
                                        onChange={(e) =>
                                          setExampleForm({
                                            ...exampleForm,
                                            description: e.target.value,
                                          })
                                        }
                                        rows="3"
                                        required
                                      />
                                    </div>

                                    <div className="form-group">
                                      <label>Code/Formula/Solution</label>
                                      <textarea
                                        placeholder="Paste code, formula, or solution steps..."
                                        value={exampleForm.code}
                                        onChange={(e) =>
                                          setExampleForm({
                                            ...exampleForm,
                                            code: e.target.value,
                                          })
                                        }
                                        rows="5"
                                      />
                                    </div>

                                    <div className="form-actions">
                                      <button className="solid-button" type="submit">
                                        Add Example
                                      </button>
                                      <button
                                        className="ghost-button"
                                        type="button"
                                        onClick={() => {
                                          setShowExampleForm(false);
                                          setExampleForm({
                                            title: "",
                                            description: "",
                                            code: "",
                                          });
                                        }}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </form>
                                </div>
                              ) : (
                                <button
                                  className="solid-button"
                                  onClick={() => {
                                    setEditingSection(section);
                                    setShowExampleForm(true);
                                  }}
                                >
                                  + Add Example
                                </button>
                              )}

                              {section.examples && section.examples.length > 0 && (
                                <div className="items-list">
                                  <h4>Examples in this Section</h4>
                                  {section.examples.map((example, idx) => (
                                    <div key={example._id} className="item-card example-card">
                                      <div className="item-header">
                                        <strong>
                                          Example {idx + 1}: {example.title}
                                        </strong>
                                        <button
                                          className="ghost-button delete-small"
                                          onClick={() =>
                                            handleDeleteExample(
                                              section._id,
                                              example._id
                                            )
                                          }
                                        >
                                          ✕
                                        </button>
                                      </div>
                                      <p className="item-content">
                                        {example.description}
                                      </p>
                                      {example.code && (
                                        <pre className="code-block">
                                          <code>{example.code}</code>
                                        </pre>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* QUESTIONS TAB */}
                          {activeTab === "questions" && (
                            <div className="tab-content">
                              {showQuestionForm && editingSection?._id === section._id ? (
                                <div className="form-card">
                                  <h4>Add New Question</h4>
                                  <form onSubmit={handleAddQuestion}>
                                    <div className="form-group">
                                      <label>Question</label>
                                      <textarea
                                        placeholder="Ask a question..."
                                        value={questionForm.question}
                                        onChange={(e) =>
                                          setQuestionForm({
                                            ...questionForm,
                                            question: e.target.value,
                                          })
                                        }
                                        rows="3"
                                        required
                                      />
                                    </div>

                                    <div className="form-group">
                                      <label>Answer/Explanation</label>
                                      <textarea
                                        placeholder="Provide the answer and explanation..."
                                        value={questionForm.answer}
                                        onChange={(e) =>
                                          setQuestionForm({
                                            ...questionForm,
                                            answer: e.target.value,
                                          })
                                        }
                                        rows="4"
                                        required
                                      />
                                    </div>

                                    <div className="form-group">
                                      <label>Difficulty Level</label>
                                      <select
                                        value={questionForm.difficulty}
                                        onChange={(e) =>
                                          setQuestionForm({
                                            ...questionForm,
                                            difficulty: e.target.value,
                                          })
                                        }
                                      >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                      </select>
                                    </div>

                                    <div className="form-actions">
                                      <button className="solid-button" type="submit">
                                        Add Question
                                      </button>
                                      <button
                                        className="ghost-button"
                                        type="button"
                                        onClick={() => {
                                          setShowQuestionForm(false);
                                          setQuestionForm({
                                            question: "",
                                            answer: "",
                                            difficulty: "medium",
                                          });
                                        }}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </form>
                                </div>
                              ) : (
                                <button
                                  className="solid-button"
                                  onClick={() => {
                                    setEditingSection(section);
                                    setShowQuestionForm(true);
                                  }}
                                >
                                  + Add Question
                                </button>
                              )}

                              {section.questions && section.questions.length > 0 && (
                                <div className="items-list">
                                  <h4>Questions in this Section</h4>
                                  {section.questions.map((question, idx) => (
                                    <div
                                      key={question._id}
                                      className="item-card question-card"
                                    >
                                      <div className="q-header">
                                        <strong>Q{idx + 1}: {question.question}</strong>
                                        <span
                                          className={`difficulty-badge ${getDifficultyColor(
                                            question.difficulty
                                          )}`}
                                        >
                                          {question.difficulty}
                                        </span>
                                        <button
                                          className="ghost-button delete-small"
                                          onClick={() =>
                                            handleDeleteQuestion(
                                              section._id,
                                              question._id
                                            )
                                          }
                                        >
                                          ✕
                                        </button>
                                      </div>
                                      <div className="q-answer">
                                        <strong>Answer:</strong>
                                        <p>{question.answer}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* LESSONS TAB */}
                          {activeTab === "lessons" && (
                            <div className="tab-content">
                              {showLessonForm && editingSection?._id === section._id ? (
                                <div className="form-card">
                                  <h4>Add New Lesson</h4>
                                  <form onSubmit={handleAddLesson}>
                                    <div className="form-group">
                                      <label>Lesson Title</label>
                                      <input
                                        type="text"
                                        placeholder="e.g., What is Algebra?"
                                        value={lessonForm.title}
                                        onChange={(e) =>
                                          setLessonForm({
                                            ...lessonForm,
                                            title: e.target.value,
                                          })
                                        }
                                        required
                                      />
                                    </div>

                                    <div className="form-group">
                                      <label>Description</label>
                                      <textarea
                                        placeholder="Explain the lesson content..."
                                        value={lessonForm.description}
                                        onChange={(e) =>
                                          setLessonForm({
                                            ...lessonForm,
                                            description: e.target.value,
                                          })
                                        }
                                        rows="3"
                                        required
                                      />
                                    </div>

                                    <div className="form-row">
                                      <div className="form-group">
                                        <label>Duration</label>
                                        <input
                                          type="text"
                                          placeholder="e.g., 30 mins"
                                          value={lessonForm.duration}
                                          onChange={(e) =>
                                            setLessonForm({
                                              ...lessonForm,
                                              duration: e.target.value,
                                            })
                                          }
                                        />
                                      </div>

                                      <div className="form-group">
                                        <label>Order</label>
                                        <input
                                          type="number"
                                          value={lessonForm.order}
                                          onChange={(e) =>
                                            setLessonForm({
                                              ...lessonForm,
                                              order: parseInt(e.target.value),
                                            })
                                          }
                                        />
                                      </div>
                                    </div>

                                    <div className="form-group">
                                      <label>Video URL (YouTube/Embed)</label>
                                      <input
                                        type="text"
                                        placeholder="https://youtube.com/embed/..."
                                        value={lessonForm.videoUrl}
                                        onChange={(e) =>
                                          setLessonForm({
                                            ...lessonForm,
                                            videoUrl: e.target.value,
                                          })
                                        }
                                      />
                                    </div>

                                    <div className="form-group">
                                      <label>Resource URL (PDF/Docs)</label>
                                      <input
                                        type="text"
                                        placeholder="https://..."
                                        value={lessonForm.resourceUrl}
                                        onChange={(e) =>
                                          setLessonForm({
                                            ...lessonForm,
                                            resourceUrl: e.target.value,
                                          })
                                        }
                                      />
                                    </div>

                                    <div className="form-actions">
                                      <button className="solid-button" type="submit">
                                        Add Lesson
                                      </button>
                                      <button
                                        className="ghost-button"
                                        type="button"
                                        onClick={() => {
                                          setShowLessonForm(false);
                                          setLessonForm({
                                            title: "",
                                            description: "",
                                            videoUrl: "",
                                            resourceUrl: "",
                                            duration: "0 mins",
                                            order: 1,
                                          });
                                        }}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </form>
                                </div>
                              ) : (
                                <button
                                  className="solid-button"
                                  onClick={() => {
                                    setEditingSection(section);
                                    setShowLessonForm(true);
                                  }}
                                >
                                  + Add Lesson
                                </button>
                              )}

                              {section.lessons && section.lessons.length > 0 && (
                                <div className="items-list">
                                  <h4>Lessons in this Section</h4>
                                  {section.lessons.map((lesson, idx) => (
                                    <div key={lesson._id} className="item-card lesson-card">
                                      <div className="item-header">
                                        <strong>
                                          Lesson {idx + 1}: {lesson.title}
                                        </strong>
                                        <button
                                          className="ghost-button delete-small"
                                          onClick={() =>
                                            handleDeleteLesson(
                                              section._id,
                                              lesson._id
                                            )
                                          }
                                        >
                                          ✕
                                        </button>
                                      </div>
                                      <p className="item-meta">
                                        ⏱️ {lesson.duration}
                                      </p>
                                      <p className="item-content">
                                        {lesson.description}
                                      </p>
                                      <div className="lesson-links">
                                        {lesson.videoUrl && (
                                          <span className="lesson-has-video">
                                            📹 Has video
                                          </span>
                                        )}
                                        {lesson.resourceUrl && (
                                          <span className="lesson-has-resource">
                                            📄 Has resource
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <p>No sections yet. Click "Add Section" to get started.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
