import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE } from "../api";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import class11BiologyTemplate from "../data/courseContentTemplates/class11BiologyTemplate.json";
import "./CourseContentEditorPage.css";

const normalizeText = (value, fallback = "") => String(value ?? fallback).trim();

const normalizeOrder = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeQuestionOptions = (options = []) => {
  if (!Array.isArray(options)) {
    return [];
  }

  return options
    .map((option) => normalizeText(option))
    .filter(Boolean);
};

const normalizeDifficulty = (value) => {
  const normalized = normalizeText(value, "medium").toLowerCase();
  return ["easy", "medium", "hard"].includes(normalized) ? normalized : "medium";
};

const sanitizeImportedJson = (rawValue) => {
  const trimmed = String(rawValue ?? "").trim().replace(/^\uFEFF/, "");
  const fencedMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fencedMatch ? fencedMatch[1].trim() : trimmed;
};

const normalizeImportedSections = (sections = []) => {
  if (!Array.isArray(sections)) {
    throw new Error("JSON must contain a sections array.");
  }

  return sections.map((section, sectionIndex) => {
    const title = normalizeText(section?.title);
    const description = normalizeText(section?.description);

    if (!title || !description) {
      throw new Error(`Section ${sectionIndex + 1} must include title and description.`);
    }

    const lessons = Array.isArray(section?.lessons)
      ? section.lessons.map((lesson, lessonIndex) => {
          const lessonTitle = normalizeText(lesson?.title);
          const lessonDescription = normalizeText(lesson?.description);

          if (!lessonTitle || !lessonDescription) {
            throw new Error(`Lesson ${lessonIndex + 1} in "${title}" must include title and description.`);
          }

          return {
            title: lessonTitle,
            description: lessonDescription,
            videoUrl: normalizeText(lesson?.videoUrl),
            resourceUrl: normalizeText(lesson?.resourceUrl),
            duration: normalizeText(lesson?.duration, "0 mins"),
            order: normalizeOrder(lesson?.order, lessonIndex + 1),
          };
        })
      : [];

    const topics = Array.isArray(section?.topics)
      ? section.topics.map((topic, topicIndex) => {
          const topicTitle = normalizeText(topic?.title);
          const topicDescription = normalizeText(topic?.description);

          if (!topicTitle || !topicDescription) {
            throw new Error(`Topic ${topicIndex + 1} in "${title}" must include title and description.`);
          }

          return {
            title: topicTitle,
            description: topicDescription,
            order: normalizeOrder(topic?.order, topicIndex + 1),
          };
        })
      : [];

    const examples = Array.isArray(section?.examples)
      ? section.examples.map((example, exampleIndex) => {
          const exampleTitle = normalizeText(example?.title);
          const exampleDescription = normalizeText(example?.description);

          if (!exampleTitle || !exampleDescription) {
            throw new Error(`Example ${exampleIndex + 1} in "${title}" must include title and description.`);
          }

          return {
            title: exampleTitle,
            description: exampleDescription,
            code: String(example?.code ?? ""),
          };
        })
      : [];

    const questions = Array.isArray(section?.questions)
      ? section.questions.map((question, questionIndex) => {
          const questionText = normalizeText(question?.question);
          const options = normalizeQuestionOptions(question?.options);

          if (!questionText || options.length < 2) {
            throw new Error(`Question ${questionIndex + 1} in "${title}" must include question text and at least two options.`);
          }

          const safeCorrectAnswer =
            Number.isInteger(Number(question?.correctAnswer)) && Number(question?.correctAnswer) >= 0
              ? Number(question.correctAnswer)
              : 0;

          return {
            question: questionText,
            options,
            correctAnswer:
              safeCorrectAnswer >= 0 && safeCorrectAnswer < options.length ? safeCorrectAnswer : 0,
            difficulty: normalizeDifficulty(question?.difficulty),
          };
        })
      : [];

    return {
      title,
      description,
      order: normalizeOrder(section?.order, sectionIndex + 1),
      lessons,
      topics,
      examples,
      questions,
    };
  });
};

const extractSectionsFromImport = (rawValue) => {
  const parsed = JSON.parse(sanitizeImportedJson(rawValue));

  if (Array.isArray(parsed)) {
    return normalizeImportedSections(parsed);
  }

  if (Array.isArray(parsed?.sections)) {
    return normalizeImportedSections(parsed.sections);
  }

  if (Array.isArray(parsed?.courseContent?.sections)) {
    return normalizeImportedSections(parsed.courseContent.sections);
  }

  throw new Error('Paste an array of sections or an object like { "sections": [...] }.');
};

export default function CourseContentEditorPage() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { token } = useAuth();

  // State
  const [course, setCourse] = useState(null);
  const [courseContent, setCourseContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [jsonImportValue, setJsonImportValue] = useState("");
  const [showJsonImport, setShowJsonImport] = useState(false);
  const [importingJson, setImportingJson] = useState(false);

  // Form states
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

  const [topicForm, setTopicForm] = useState({
    title: "",
    description: "",
    order: 1,
  });

  const [exampleForm, setExampleForm] = useState({
    title: "",
    description: "",
    code: "",
  });

  const [questionForm, setQuestionForm] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    difficulty: "medium",
  });

  // UI toggles
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [showExampleForm, setShowExampleForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);

  // Fetch course and content on mount
  useEffect(() => {
    if (courseId && token) {
      fetchCourseData();
    }
  }, [courseId, token]);

  const fetchCourseData = async () => {
    setLoading(true);
    try {
      // Fetch course details
      const courseRes = await fetch(`${API_BASE}/content/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (courseRes.ok) {
        const courseData = await courseRes.json();
        setCourse(courseData);
      }

      // Fetch course content
      const contentRes = await fetch(
        `${API_BASE}/courses/${courseId}/content`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (contentRes.ok) {
        const contentData = await contentRes.json();
        setCourseContent(contentData);
      } else {
        setCourseContent({ courseId, sections: [] });
      }
    } catch (err) {
      console.error("Error fetching course data:", err);
      setMessage({ type: "error", text: "Failed to load course" });
    } finally {
      setLoading(false);
    }
  };

  // Section handlers
  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!sectionForm.title || !sectionForm.description) {
      setMessage({ type: "error", text: "All section fields are required" });
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/courses/admin/${courseId}/sections`,
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
        "Delete this section and all its content?"
      )
    )
      return;

    try {
      const response = await fetch(
        `${API_BASE}/courses/admin/${courseId}/sections/${sectionId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCourseContent(data.courseContent);
        setMessage({ type: "success", text: "Section deleted successfully" });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  // Lesson handlers
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
        `${API_BASE}/courses/admin/${courseId}/sections/${editingSection._id}/lessons`,
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
        setMessage({ type: "success", text: "Lesson added successfully" });
        setTimeout(() => setMessage(null), 3000);

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
        `${API_BASE}/courses/admin/${courseId}/sections/${sectionId}/lessons/${lessonId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCourseContent(data.courseContent);
        setMessage({ type: "success", text: "Lesson deleted successfully" });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  // Topic handlers
  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!editingSection) {
      setMessage({ type: "error", text: "Select a section first" });
      return;
    }
    if (!topicForm.title || !topicForm.description) {
      setMessage({ type: "error", text: "All topic fields are required" });
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/courses/admin/${courseId}/sections/${editingSection._id}/topics`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(topicForm),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCourseContent(data.courseContent);
        setTopicForm({ title: "", description: "", order: 1 });
        setShowTopicForm(false);
        setMessage({ type: "success", text: "Topic added successfully" });
        setTimeout(() => setMessage(null), 3000);

        const updatedSection = data.courseContent.sections.find(
          (s) => s._id === editingSection._id
        );
        setEditingSection(updatedSection);
      } else {
        setMessage({ type: "error", text: "Failed to add topic" });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const handleDeleteTopic = async (sectionId, topicId) => {
    if (!window.confirm("Delete this topic?")) return;

    try {
      const response = await fetch(
        `${API_BASE}/courses/admin/${courseId}/sections/${sectionId}/topics/${topicId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCourseContent(data.courseContent);
        setMessage({ type: "success", text: "Topic deleted successfully" });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  // Example handlers
  const handleAddExample = async (e) => {
    e.preventDefault();
    if (!editingSection) {
      setMessage({ type: "error", text: "Select a section first" });
      return;
    }
    if (!exampleForm.title || !exampleForm.description) {
      setMessage({ type: "error", text: "Example title and description are required" });
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/courses/admin/${courseId}/sections/${editingSection._id}/examples`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(exampleForm),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCourseContent(data.courseContent);
        setExampleForm({ title: "", description: "", code: "" });
        setShowExampleForm(false);
        setMessage({ type: "success", text: "Example added successfully" });
        setTimeout(() => setMessage(null), 3000);

        const updatedSection = data.courseContent.sections.find(
          (s) => s._id === editingSection._id
        );
        setEditingSection(updatedSection);
      } else {
        setMessage({ type: "error", text: "Failed to add example" });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const handleDeleteExample = async (sectionId, exampleId) => {
    if (!window.confirm("Delete this example?")) return;

    try {
      const response = await fetch(
        `${API_BASE}/courses/admin/${courseId}/sections/${sectionId}/examples/${exampleId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCourseContent(data.courseContent);
        setMessage({ type: "success", text: "Example deleted successfully" });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  // Question handlers
  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!editingSection) {
      setMessage({ type: "error", text: "Select a section first" });
      return;
    }
    if (!questionForm.question || questionForm.options.some(opt => !opt)) {
      setMessage({ type: "error", text: "Question and all options are required" });
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/courses/admin/${courseId}/sections/${editingSection._id}/questions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(questionForm),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCourseContent(data.courseContent);
        setQuestionForm({
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
          difficulty: "medium",
        });
        setShowQuestionForm(false);
        setMessage({ type: "success", text: "Question added successfully" });
        setTimeout(() => setMessage(null), 3000);

        const updatedSection = data.courseContent.sections.find(
          (s) => s._id === editingSection._id
        );
        setEditingSection(updatedSection);
      } else {
        setMessage({ type: "error", text: "Failed to add question" });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const handleDeleteQuestion = async (sectionId, questionId) => {
    if (!window.confirm("Delete this question?")) return;

    try {
      const response = await fetch(
        `${API_BASE}/courses/admin/${courseId}/sections/${sectionId}/questions/${questionId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCourseContent(data.courseContent);
        setMessage({ type: "success", text: "Question deleted successfully" });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const handleLoadExistingContentJson = () => {
    setJsonImportValue(
      JSON.stringify(
        {
          sections: courseContent?.sections || [],
        },
        null,
        2
      )
    );
    setShowJsonImport(true);
  };

  const handleLoadBiologyTemplate = () => {
    setJsonImportValue(JSON.stringify(class11BiologyTemplate, null, 2));
    setShowJsonImport(true);
  };

  const handleImportJson = async (event) => {
    event.preventDefault();

    if (!jsonImportValue.trim()) {
      setMessage({ type: "error", text: "Paste your JSON content first." });
      return;
    }

    let sections;

    try {
      sections = extractSectionsFromImport(jsonImportValue);
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Invalid JSON format." });
      return;
    }

    if (
      courseContent?.sections?.length &&
      !window.confirm("This will replace the current course content. Do you want to continue?")
    ) {
      return;
    }

    setImportingJson(true);

    try {
      const response = await fetch(`${API_BASE}/courses/admin/${courseId}/content`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sections }),
      });

      const rawResponse = await response.text();
      let data = {};

      try {
        data = rawResponse ? JSON.parse(rawResponse) : {};
      } catch {
        data = { message: rawResponse || "Failed to import JSON content." };
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to import JSON content.");
      }

      setCourseContent(data.courseContent);
      setEditingSection(null);
      setShowJsonImport(false);
      setMessage({
        type: "success",
        text: `Imported ${sections.length} section${sections.length === 1 ? "" : "s"} successfully.`,
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to import JSON content." });
    } finally {
      setImportingJson(false);
    }
  };

  if (loading) {
    return <Spinner message="Loading course..." />;
  }

  if (!course) {
    return (
      <div className="page section">
        <button
          className="ghost-button"
          onClick={() => navigate(-1)}
          style={{ marginBottom: 16 }}
        >
          ← Back to Courses
        </button>
        <h2>Course not found</h2>
      </div>
    );
  }

  return (
    <div className="page section course-content-editor-page">
      <div className="page-header">
        <button
          className="ghost-button"
          onClick={() => navigate(-1)}
          style={{ marginBottom: 16 }}
        >
          ← Back to Courses
        </button>
        <h1>{course.title}</h1>
        <p>{course.description}</p>
      </div>

      {message && (
        <div className={`message-banner ${message.type}`}>{message.text}</div>
      )}

      <div className="content-editor">
        <div className="editor-header">
          <h2>Course Content</h2>
          <div className="editor-actions">
            <button
              className="ghost-button"
              type="button"
              onClick={handleLoadExistingContentJson}
            >
              Export JSON
            </button>
            <button
              className="ghost-button"
              type="button"
              onClick={handleLoadBiologyTemplate}
            >
              Load Biology Sample
            </button>
            <button
              className="ghost-button"
              type="button"
              onClick={() => setShowJsonImport((prev) => !prev)}
            >
              {showJsonImport ? "Close JSON Import" : "Bulk JSON Import"}
            </button>
            <button
              className="solid-button"
              onClick={() => setShowSectionForm(true)}
            >
              + Add Section
            </button>
          </div>
        </div>

        {showJsonImport && (
          <div className="form-card bulk-import-card">
            <div className="bulk-import-header">
              <div>
                <h3>Bulk Import Course Content</h3>
                <p>
                  Paste one JSON block for all sections, lessons, topics, examples, and questions.
                  Import replaces the current course content in one click.
                </p>
              </div>
            </div>

            <form onSubmit={handleImportJson}>
              <div className="form-group">
                <label>JSON Content</label>
                <textarea
                  className="json-import-textarea"
                  placeholder={`{\n  "sections": [\n    {\n      "title": "Section title",\n      "description": "Section description",\n      "order": 1,\n      "lessons": [],\n      "topics": [],\n      "examples": [],\n      "questions": []\n    }\n  ]\n}`}
                  value={jsonImportValue}
                  onChange={(event) => setJsonImportValue(event.target.value)}
                  rows="18"
                />
              </div>

              <div className="json-import-note">
                Accepted formats: an array of sections, an object with `sections`, or an object with `courseContent.sections`.
              </div>

              <div className="form-actions">
                <button className="solid-button" type="submit" disabled={importingJson}>
                  {importingJson ? "Importing..." : "Import JSON"}
                </button>
                <button
                  className="ghost-button"
                  type="button"
                  onClick={handleLoadBiologyTemplate}
                >
                  Use Class 11 Biology Template
                </button>
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => setShowJsonImport(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {showSectionForm && (
          <div className="form-card">
            <h3>Add New Section</h3>
            <form onSubmit={handleAddSection}>
              <div className="form-group">
                <label>Section Title</label>
                <input
                  type="text"
                  placeholder="e.g., Algebra Fundamentals"
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
                  placeholder="Describe what students will learn..."
                  value={sectionForm.description}
                  onChange={(e) =>
                    setSectionForm({
                      ...sectionForm,
                      description: e.target.value,
                    })
                  }
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label>Order</label>
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
                  Create Section
                </button>
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => setShowSectionForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {courseContent && courseContent.sections && courseContent.sections.length > 0 ? (
          <div className="sections-list">
            {courseContent.sections.map((section, sIdx) => (
              <div key={section._id} className="section-card">
                <div className="section-header">
                  <div>
                    <h3>{section.title}</h3>
                    <p>{section.description}</p>
                  </div>
                  <div className="section-actions">
                    <button
                      className="ghost-button edit-btn"
                      onClick={() => setEditingSection(section)}
                    >
                      Edit
                    </button>
                    <button
                      className="ghost-button delete-btn"
                      onClick={() => handleDeleteSection(section._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {editingSection?._id === section._id && (
                  <div className="section-content-forms">
                    {/* Lessons Form */}
                    <div className="content-type-form">
                      <h4>Add Lesson</h4>
                      {!showLessonForm ? (
                        <button
                          className="solid-button"
                          onClick={() => setShowLessonForm(true)}
                        >
                          + Add Lesson
                        </button>
                      ) : (
                        <form onSubmit={handleAddLesson}>
                          <div className="form-group">
                            <label>Lesson Title</label>
                            <input
                              type="text"
                              placeholder="e.g., Understanding Equations"
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
                              placeholder="Lesson details..."
                              value={lessonForm.description}
                              onChange={(e) =>
                                setLessonForm({
                                  ...lessonForm,
                                  description: e.target.value,
                                })
                              }
                              rows="2"
                              required
                            />
                          </div>

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
                            <label>Video URL</label>
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
                            <label>Resource URL</label>
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
                              onClick={() => setShowLessonForm(false)}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}

                      {section.lessons && section.lessons.length > 0 && (
                        <div className="items-list">
                          {section.lessons.map((lesson, idx) => (
                            <div key={lesson._id} className="item-card">
                              <div className="item-header">
                                <strong>Lesson {idx + 1}: {lesson.title}</strong>
                                <button
                                  className="ghost-button delete-small"
                                  onClick={() =>
                                    handleDeleteLesson(section._id, lesson._id)
                                  }
                                >
                                  ✕
                                </button>
                              </div>
                              <p>{lesson.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Topics Form */}
                    <div className="content-type-form">
                      <h4>Add Topic</h4>
                      {!showTopicForm ? (
                        <button
                          className="solid-button"
                          onClick={() => setShowTopicForm(true)}
                        >
                          + Add Topic
                        </button>
                      ) : (
                        <form onSubmit={handleAddTopic}>
                          <div className="form-group">
                            <label>Topic Title</label>
                            <input
                              type="text"
                              placeholder="e.g., Linear Equations"
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
                            <label>Description</label>
                            <textarea
                              placeholder="Topic details..."
                              value={topicForm.description}
                              onChange={(e) =>
                                setTopicForm({
                                  ...topicForm,
                                  description: e.target.value,
                                })
                              }
                              rows="2"
                              required
                            />
                          </div>

                          <div className="form-actions">
                            <button className="solid-button" type="submit">
                              Add Topic
                            </button>
                            <button
                              className="ghost-button"
                              type="button"
                              onClick={() => setShowTopicForm(false)}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}

                      {section.topics && section.topics.length > 0 && (
                        <div className="items-list">
                          {section.topics.map((topic, idx) => (
                            <div key={topic._id} className="item-card">
                              <div className="item-header">
                                <strong>Topic {idx + 1}: {topic.title}</strong>
                                <button
                                  className="ghost-button delete-small"
                                  onClick={() =>
                                    handleDeleteTopic(section._id, topic._id)
                                  }
                                >
                                  ✕
                                </button>
                              </div>
                              <p>{topic.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Examples Form */}
                    <div className="content-type-form">
                      <h4>Add Example</h4>
                      {!showExampleForm ? (
                        <button
                          className="solid-button"
                          onClick={() => setShowExampleForm(true)}
                        >
                          + Add Example
                        </button>
                      ) : (
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
                              rows="2"
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
                              rows="4"
                            />
                          </div>

                          <div className="form-actions">
                            <button className="solid-button" type="submit">
                              Add Example
                            </button>
                            <button
                              className="ghost-button"
                              type="button"
                              onClick={() => setShowExampleForm(false)}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}

                      {section.examples && section.examples.length > 0 && (
                        <div className="items-list">
                          {section.examples.map((example, idx) => (
                            <div key={example._id} className="item-card">
                              <div className="item-header">
                                <strong>Example {idx + 1}: {example.title}</strong>
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
                              <p>{example.description}</p>
                              {example.code && (
                                <pre className="code-block">{example.code}</pre>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Questions Form */}
                    <div className="content-type-form">
                      <h4>Add Question</h4>
                      {!showQuestionForm ? (
                        <button
                          className="solid-button"
                          onClick={() => setShowQuestionForm(true)}
                        >
                          + Add Question
                        </button>
                      ) : (
                        <form onSubmit={handleAddQuestion}>
                          <div className="form-group">
                            <label>Question</label>
                            <textarea
                              placeholder="Enter the question..."
                              value={questionForm.question}
                              onChange={(e) =>
                                setQuestionForm({
                                  ...questionForm,
                                  question: e.target.value,
                                })
                              }
                              rows="2"
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

                          {questionForm.options.map((option, idx) => (
                            <div key={idx} className="form-group">
                              <label>
                                Option {idx + 1}
                                {questionForm.correctAnswer === idx &&
                                  " ✓ (Correct)"}
                              </label>
                              <input
                                type="text"
                                placeholder={`Option ${idx + 1}`}
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...questionForm.options];
                                  newOptions[idx] = e.target.value;
                                  setQuestionForm({
                                    ...questionForm,
                                    options: newOptions,
                                  });
                                }}
                                required
                              />
                              <button
                                type="button"
                                className={`option-select-btn ${
                                  questionForm.correctAnswer === idx
                                    ? "correct"
                                    : ""
                                }`}
                                onClick={() =>
                                  setQuestionForm({
                                    ...questionForm,
                                    correctAnswer: idx,
                                  })
                                }
                              >
                                {questionForm.correctAnswer === idx
                                  ? "✓ Correct"
                                  : "Mark Correct"}
                              </button>
                            </div>
                          ))}

                          <div className="form-actions">
                            <button className="solid-button" type="submit">
                              Add Question
                            </button>
                            <button
                              className="ghost-button"
                              type="button"
                              onClick={() => setShowQuestionForm(false)}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}

                      {section.questions && section.questions.length > 0 && (
                        <div className="items-list">
                          {section.questions.map((q, idx) => (
                            <div key={q._id} className="item-card question-card">
                              <div className="item-header">
                                <strong>Q{idx + 1}: {q.question}</strong>
                                <button
                                  className="ghost-button delete-small"
                                  onClick={() =>
                                    handleDeleteQuestion(section._id, q._id)
                                  }
                                >
                                  ✕
                                </button>
                              </div>
                              <div className="question-meta">
                                <span className="difficulty">
                                  {q.difficulty}
                                </span>
                                <span className="options-count">
                                  {q.options?.length || 0} options
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>No sections yet. Create your first section to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
