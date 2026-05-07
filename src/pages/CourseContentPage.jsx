import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE } from "../api";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import "./CourseContentPage.css";

const COURSE_PROGRESS_SNAPSHOT_KEY = "sameer-course-progress-snapshots";
const COMPLETE_CLASS_SUBJECTS = {
  8: [
    {
      key: "mathematics",
      name: "Mathematics",
      icon: "📐",
      description: "Algebra, geometry, numbers, and problem solving.",
      aliases: ["math", "maths"],
      keywords: ["mathematics", "math", "maths", "algebra", "geometry", "mensuration", "statistics", "arithmetic"],
    },
    {
      key: "physics",
      name: "Physics",
      icon: "⚡",
      description: "Motion, force, energy, sound, and heat.",
      aliases: [],
      keywords: ["physics", "motion", "force", "energy", "sound", "heat", "light", "electricity"],
    },
    {
      key: "chemistry",
      name: "Chemistry",
      icon: "🧪",
      description: "Elements, compounds, reactions, and materials.",
      aliases: [],
      keywords: ["chemistry", "atom", "molecule", "element", "compound", "reaction", "acid", "base", "salt"],
    },
    {
      key: "biology",
      name: "Biology",
      icon: "🔬",
      description: "Life processes, plants, animals, and ecology.",
      aliases: [],
      keywords: ["biology", "life", "cell", "plant", "animal", "ecology", "reproduction", "nutrition"],
    },
    {
      key: "english",
      name: "English",
      icon: "📚",
      description: "Grammar, reading, literature, and writing skills.",
      aliases: [],
      keywords: ["english", "grammar", "reading", "writing", "literature", "poem", "prose", "comprehension"],
    },
    {
      key: "social-science",
      name: "Social Science",
      icon: "🌍",
      description: "History, geography, civics, and society.",
      aliases: ["social science", "sst"],
      keywords: ["social science", "history", "geography", "civics", "economics", "political"],
    },
  ],
  9: [
    {
      key: "mathematics",
      name: "Mathematics",
      icon: "📐",
      description: "Algebra, geometry, coordinate geometry, and statistics.",
      aliases: ["math", "maths"],
      keywords: ["mathematics", "math", "maths", "algebra", "geometry", "coordinate", "statistics", "probability"],
    },
    {
      key: "physics",
      name: "Physics",
      icon: "⚡",
      description: "Motion, force, work, energy, sound, and light.",
      aliases: [],
      keywords: ["physics", "motion", "force", "work", "energy", "sound", "light", "gravitation"],
    },
    {
      key: "chemistry",
      name: "Chemistry",
      icon: "🧪",
      description: "Atoms, molecules, reactions, and materials.",
      aliases: [],
      keywords: ["chemistry", "atom", "molecule", "reaction", "matter", "structure", "carbon"],
    },
    {
      key: "biology",
      name: "Biology",
      icon: "🔬",
      description: "Cell biology, tissues, diversity, and health.",
      aliases: [],
      keywords: ["biology", "cell", "tissue", "diversity", "health", "disease", "life", "organism"],
    },
    {
      key: "english",
      name: "English",
      icon: "📚",
      description: "Literature, grammar, comprehension, and writing.",
      aliases: [],
      keywords: ["english", "grammar", "literature", "writing", "reading", "comprehension", "poem", "story"],
    },
    {
      key: "social-science",
      name: "Social Science",
      icon: "🌍",
      description: "History, geography, civics, and economics.",
      aliases: ["social science", "sst"],
      keywords: ["social science", "history", "geography", "civics", "economics", "political"],
    },
  ],
  10: [
    {
      key: "mathematics",
      name: "Mathematics",
      icon: "📐",
      description: "Algebra, trigonometry, geometry, and statistics.",
      aliases: ["math", "maths"],
      keywords: ["mathematics", "math", "maths", "algebra", "trigonometry", "geometry", "statistics", "probability"],
    },
    {
      key: "physics",
      name: "Physics",
      icon: "⚡",
      description: "Light, electricity, magnetism, and sources of energy.",
      aliases: [],
      keywords: ["physics", "light", "electricity", "magnetic", "energy", "reflection", "refraction", "lens"],
    },
    {
      key: "chemistry",
      name: "Chemistry",
      icon: "🧪",
      description: "Chemical reactions, acids, metals, and carbon compounds.",
      aliases: [],
      keywords: ["chemistry", "reaction", "acid", "base", "metal", "non-metal", "carbon", "periodic"],
    },
    {
      key: "biology",
      name: "Biology",
      icon: "🔬",
      description: "Life processes, heredity, control, and environment.",
      aliases: [],
      keywords: ["biology", "life", "heredity", "evolution", "control", "coordination", "reproduction", "environment"],
    },
    {
      key: "english",
      name: "English",
      icon: "📚",
      description: "Board-focused literature, grammar, and writing practice.",
      aliases: [],
      keywords: ["english", "grammar", "writing", "literature", "reading", "comprehension", "poem", "letter"],
    },
    {
      key: "social-science",
      name: "Social Science",
      icon: "🌍",
      description: "History, geography, civics, and economics for board prep.",
      aliases: ["social science", "sst"],
      keywords: ["social science", "history", "geography", "civics", "economics", "political"],
    },
  ],
};

const readCourseProgressSnapshots = () => {
  try {
    return JSON.parse(localStorage.getItem(COURSE_PROGRESS_SNAPSHOT_KEY) || "{}");
  } catch {
    return {};
  }
};

const writeCourseProgressSnapshot = (courseId, snapshot) => {
  const snapshots = readCourseProgressSnapshots();
  snapshots[courseId] = snapshot;
  localStorage.setItem(COURSE_PROGRESS_SNAPSHOT_KEY, JSON.stringify(snapshots));
};

const normalizeSubjectValue = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const isCompleteClassCourseTitle = (courseTitle = "") =>
  /\bcomplete\b/i.test(String(courseTitle)) &&
  /\b(?:class\s*)?(8|9|10)\b/i.test(String(courseTitle));

const getCompleteClassSubjects = (courseTitle = "") => {
  if (!isCompleteClassCourseTitle(courseTitle)) {
    return [];
  }

  const classNumber = String(courseTitle).match(/\b(?:class\s*)?(8|9|10)\b/i)?.[1];
  return COMPLETE_CLASS_SUBJECTS[classNumber] || [];
};

const findSubjectKey = (value, subjects = []) => {
  const normalizedValue = normalizeSubjectValue(value);

  if (!normalizedValue) {
    return null;
  }

  const matchedSubject = subjects.find((subject) =>
    [subject.key, subject.name, ...(subject.aliases || [])]
      .map((candidate) => normalizeSubjectValue(candidate))
      .some(
        (candidate) =>
          candidate &&
          (candidate === normalizedValue ||
            normalizedValue.includes(candidate) ||
            candidate.includes(normalizedValue))
      )
  );

  return matchedSubject?.key || null;
};

const inferSectionSubjectKey = (section, subjects = [], previousSubjectKey = null) => {
  const explicitSubjectKey = findSubjectKey(section?.subject, subjects);

  if (explicitSubjectKey) {
    return explicitSubjectKey;
  }

  const haystack = normalizeSubjectValue(
    [
      section?.title,
      section?.description,
      ...(section?.lessons || []).flatMap((lesson) => [lesson?.title, lesson?.description]),
      ...(section?.topics || []).flatMap((topic) => [topic?.title, topic?.description]),
    ]
      .filter(Boolean)
      .join(" ")
  );

  const matchedSubject = subjects.find((subject) =>
    (subject.keywords || []).some((keyword) =>
      haystack.includes(normalizeSubjectValue(keyword))
    )
  );

  return matchedSubject?.key || previousSubjectKey || null;
};

const buildSectionsBySubject = (sections = [], subjects = []) => {
  const groupedSections = subjects.reduce((acc, subject) => {
    acc[subject.key] = [];
    return acc;
  }, {});

  groupedSections.unassigned = [];

  let previousSubjectKey = null;

  sections.forEach((section) => {
    const subjectKey = inferSectionSubjectKey(section, subjects, previousSubjectKey);

    if (subjectKey && groupedSections[subjectKey]) {
      groupedSections[subjectKey].push(section);
      previousSubjectKey = subjectKey;
      return;
    }

    groupedSections.unassigned.push(section);
  });

  return groupedSections;
};

const getLinkedSubjectCourseCards = (linkedCourses = [], subjects = []) =>
  linkedCourses.map((linkedCourse) => {
    const subjectKey = findSubjectKey(linkedCourse.title, subjects);
    const subjectMeta = subjects.find((subject) => subject.key === subjectKey);

    return {
      ...linkedCourse,
      subjectLabel:
        subjectMeta?.name ||
        String(linkedCourse.title || "")
          .replace(/class\s*\d+\s*/i, "")
          .trim() ||
        linkedCourse.title,
      subjectIcon: subjectMeta?.icon || "📘",
      subjectDescription: linkedCourse.summary || subjectMeta?.description || "",
    };
  });

export default function CourseContentPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [course, setCourse] = useState(null);
  const [courseContent, setCourseContent] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // Track selected answers
  const [answerFeedback, setAnswerFeedback] = useState({}); // Track feedback

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchCourseDetails();
    fetchCourseContent();
    fetchProgress();
  }, [courseId, token, navigate]);

  const handleSectionSelect = (section) => {
    setSelectedSection(section);
    setSelectedLesson(section?.lessons?.[0] || null);
  };

  const courseTitle = courseContent?.courseId?.title || course?.title || "";
  const completeClassSubjects = getCompleteClassSubjects(courseTitle);
  const linkedSubjectCards = getLinkedSubjectCourseCards(course?.linkedCourses || [], completeClassSubjects);
  const hasLinkedSubjectCourses = linkedSubjectCards.length > 0;
  const hasFallbackSubjectSelection =
    !hasLinkedSubjectCourses && completeClassSubjects.length > 0;
  const hasSubjectSelection = hasLinkedSubjectCourses || hasFallbackSubjectSelection;
  const sectionsBySubject = hasFallbackSubjectSelection
    ? buildSectionsBySubject(courseContent?.sections || [], completeClassSubjects)
    : {};
  const hasMappedSubjectSections = hasFallbackSubjectSelection && completeClassSubjects.some(
    (subject) => (sectionsBySubject[subject.key] || []).length > 0
  );
  const selectedSubjectData = hasFallbackSubjectSelection
    ? completeClassSubjects.find((subject) => subject.key === selectedSubject) || null
    : null;
  const visibleSections = hasLinkedSubjectCourses
    ? []
    : hasFallbackSubjectSelection && hasMappedSubjectSections
      ? sectionsBySubject[selectedSubject] || []
      : courseContent?.sections || [];
  const visibleSectionIdsSignature = visibleSections.map((section) => section._id).join("|");
  const subjectAvailabilitySignature = completeClassSubjects
    .map((subject) => `${subject.key}:${(sectionsBySubject[subject.key] || []).length}`)
    .join("|");
  const backTarget = course?.parentCourse?._id
    ? `/courses/${course.parentCourse._id}/content`
    : "/dashboard";

  useEffect(() => {
    if (!hasFallbackSubjectSelection) {
      setSelectedSubject(null);
      return;
    }

    const firstAvailableSubject =
      completeClassSubjects.find((subject) => (sectionsBySubject[subject.key] || []).length > 0)?.key ||
      completeClassSubjects[0]?.key ||
      null;

    setSelectedSubject((current) =>
      current && completeClassSubjects.some((subject) => subject.key === current)
        ? current
        : firstAvailableSubject
    );
  }, [hasFallbackSubjectSelection, subjectAvailabilitySignature, completeClassSubjects]);

  useEffect(() => {
    if (!courseContent) {
      return;
    }

    if (!visibleSections.length) {
      setSelectedSection(null);
      setSelectedLesson(null);
      return;
    }

    const currentVisibleSection = visibleSections.find(
      (section) => section._id === selectedSection?._id
    );

    if (!currentVisibleSection) {
      handleSectionSelect(visibleSections[0]);
      return;
    }

    const currentVisibleLesson = currentVisibleSection.lessons?.find(
      (lesson) => lesson._id === selectedLesson?._id
    );

    if (!currentVisibleLesson) {
      setSelectedLesson(currentVisibleSection.lessons?.[0] || null);
    }
  }, [courseContent, selectedSection?._id, selectedLesson?._id, visibleSectionIdsSignature]);

  useEffect(() => {
    if (!courseId || !courseContent) {
      return;
    }

    const totalSections = courseContent.sections?.length || 0;
    const totalLessons = (courseContent.sections || []).reduce(
      (count, section) => count + (section.lessons?.length || 0),
      0
    );
    const completedSections = progress?.completedSections?.length || 0;
    const completedLessons = progress?.completedLessons?.length || 0;
    const derivedProgress =
      progress?.progressPercentage ??
      (totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : totalSections > 0
          ? Math.round((completedSections / totalSections) * 100)
          : 0);

    writeCourseProgressSnapshot(courseId, {
      progress: derivedProgress,
      status:
        derivedProgress >= 100 && (totalLessons > 0 || totalSections > 0)
          ? "Completed"
          : "In Progress",
      totalLessons,
      completedLessons,
      totalSections,
      completedSections,
      updatedAt: new Date().toISOString(),
    });
  }, [courseId, courseContent, progress]);

  const fetchCourseContent = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/courses/${courseId}/content`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 404) {
        setCourseContent({ courseId, sections: [] });
        return;
      }

      if (!response.ok) throw new Error("Failed to load course content");
      const data = await response.json();
      setCourseContent(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseDetails = async () => {
    try {
      const response = await fetch(`${API_BASE}/content/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      setCourse(data);
    } catch (err) {
      console.error("Failed to fetch course details:", err);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/courses/${courseId}/progress`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setProgress(data);
      }
    } catch (err) {
      console.error("Failed to fetch progress:", err);
    }
  };

  const completeSection = async (sectionId) => {
    try {
      const response = await fetch(
        `${API_BASE}/courses/${courseId}/progress/section/${sectionId}/complete`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const updated = await response.json();
        setProgress(updated.progress);
      }
    } catch (err) {
      console.error("Error marking section complete:", err);
    }
  };

  const completeLesson = async (sectionId, lessonId) => {
    try {
      const response = await fetch(
        `${API_BASE}/courses/${courseId}/progress/lesson/${lessonId}/complete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sectionId }),
        }
      );

      if (response.ok) {
        const updated = await response.json();
        setProgress(updated.progress);
      }
    } catch (err) {
      console.error("Error marking lesson complete:", err);
    }
  };

  const isSectionCompleted = (sectionId) => {
    return progress?.completedSections?.some(
      (s) => s.sectionId === sectionId || s.sectionId._id === sectionId
    );
  };

  const isSectionLocked = (sections, index) => {
    if (index === 0) return false;
    return !isSectionCompleted(sections[index - 1]._id);
  };

  const isLessonCompleted = (lessonId) => {
    return progress?.completedLessons?.some(
      (l) =>
        l.lessonId === lessonId ||
        l.lessonId._id === lessonId ||
        l.lessonId === lessonId
    );
  };

  const handleSelectAnswer = (questionId, optionIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmitAnswer = (questionId, question) => {
    const selectedIndex = selectedAnswers[questionId];
    if (selectedIndex === undefined) {
      setAnswerFeedback(prev => ({
        ...prev,
        [questionId]: { result: 'error', message: 'Please select an option first' }
      }));
      return;
    }

    const isCorrect = selectedIndex === question.correctAnswer;
    setAnswerFeedback(prev => ({
      ...prev,
      [questionId]: {
        result: isCorrect ? 'correct' : 'incorrect',
        message: isCorrect 
          ? '✓ Correct!' 
          : `✗ ${question.options[question.correctAnswer]}`
      }
    }));
  };

  if (loading) return <Spinner message="Loading course content..." />;

  if (error) {
    return (
      <div className="page section">
        <div className="error-message">{error}</div>
        <button
          className="solid-button"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!courseContent) {
    return (
      <div className="page section">
        <div style={{ textAlign: "center", padding: "40px" }}>
          <h2>Course not found.</h2>
          <p>We could not load this course right now.</p>
          <button
            className="solid-button"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!courseContent.sections.length && !hasSubjectSelection) {
    return (
      <div className="page section">
        <div style={{ textAlign: "center", padding: "40px" }}>
          <h2>No course content available yet.</h2>
          <p>This course is still being prepared. Please check back later.</p>
          <button
            className="solid-button"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page section course-content-page">
      <div className="course-content-header">
        <button
          className="ghost-button"
          onClick={() => navigate(backTarget)}
        >
          ← Back
        </button>
        <h1>{courseTitle || "Course Content"}</h1>
        <div className="progress-info">
          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{
                width: `${progress?.progressPercentage || 0}%`,
              }}
            ></div>
          </div>
          <span>{progress?.progressPercentage || 0}% Complete</span>
        </div>
      </div>

      {hasSubjectSelection && (
        <section className="subject-selector-panel">
         
        

          <div className="subject-selector-grid">
            {hasLinkedSubjectCourses
              ? linkedSubjectCards.map((linkedCourse) => (
                  <button
                    key={linkedCourse._id}
                    type="button"
                    className="subject-selector-card"
                    onClick={() => navigate(`/courses/${linkedCourse._id}/content`)}
                  >
                    <div className="subject-selector-top">
                      <span className="subject-selector-icon">{linkedCourse.subjectIcon}</span>
                      <span className="subject-selector-status">
                        {linkedCourse.duration || "Subject Course"}
                      </span>
                    </div>
                    <h3>{linkedCourse.subjectLabel}</h3>
                    <p>{linkedCourse.subjectDescription || "Open this subject course and add chapters, lessons, and practice questions."}</p>
                    <span className="subject-selector-meta">Open subject course</span>
                  </button>
                ))
              : completeClassSubjects.map((subject) => {
                  const subjectSections = sectionsBySubject[subject.key] || [];
                  const lessonCount = subjectSections.reduce(
                    (count, section) => count + (section.lessons?.length || 0),
                    0
                  );

                  return (
                    <button
                      key={subject.key}
                      type="button"
                      className={`subject-selector-card ${
                        selectedSubject === subject.key ? "active" : ""
                      } ${!subjectSections.length && hasMappedSubjectSections ? "coming-soon" : ""}`}
                      onClick={() => setSelectedSubject(subject.key)}
                    >
                      <div className="subject-selector-top">
                        <span className="subject-selector-icon">{subject.icon}</span>
                        <span className="subject-selector-status">
                          {subjectSections.length
                            ? `${subjectSections.length} section${subjectSections.length === 1 ? "" : "s"}`
                            : hasMappedSubjectSections
                              ? "Coming soon"
                              : "Open complete course"}
                        </span>
                      </div>
                      <h3>{subject.name}</h3>
                      <p>{subject.description}</p>
                      <span className="subject-selector-meta">
                        {subjectSections.length
                          ? `${lessonCount} lesson${lessonCount === 1 ? "" : "s"} ready`
                          : hasMappedSubjectSections
                            ? "Content will appear here once added"
                            : "Use these subject cards to guide students into the same class course"}
                      </span>
                    </button>
                  );
                })}
          </div>

          {hasLinkedSubjectCourses && (
            <p className="subject-selector-note">
              Each subject opens its own linked course, so you can import JSON and manage chapters separately.
            </p>
          )}

          {!hasLinkedSubjectCourses && !hasMappedSubjectSections && (courseContent.sections?.length || 0) > 0 && (
            <p className="subject-selector-note">
              Subject-wise mapping has not been added yet, so the full class content is shown for now.
            </p>
          )}
        </section>
      )}

      <div className="course-content-layout">
        {/* Sidebar with sections */}
        <aside className="course-sidebar">

          <nav className="sections-nav">
            {visibleSections.length ? (
              visibleSections.map((section, index) => {
                const isLocked = isSectionLocked(visibleSections, index);
                const isCompleted = isSectionCompleted(section._id);

                return (
                  <div key={section._id}>
                    <button
                      className={`section-button ${
                        selectedSection?._id === section._id ? "active" : ""
                      } ${isLocked ? "locked" : ""} ${
                        isCompleted ? "completed" : ""
                      }`}
                      onClick={() => {
                        if (!isLocked) {
                          handleSectionSelect(section);
                        }
                      }}
                      disabled={isLocked}
                    >
                      <span className="section-icon">
                        {isLocked ? "🔒" : isCompleted ? "✓" : "▶"}
                      </span>
                      <span className="course-section-title">{section.title}</span>
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="empty-lessons-state">
                
              </div>
            )}
          </nav>
        </aside>

        {/* Main content area */}
        <main className="course-main">
          {selectedSection ? (
            <>
              <div className="section-header">
                <h2>{selectedSection.title}</h2>
                <p className="section-description">
                  {selectedSection.description}
                </p>
              </div>

              {/* Lessons in section */}
              <div className="lessons-container">
                <h3>Lessons</h3>
                <div className="lessons-list">
                  {selectedSection.lessons.length ? (
                    selectedSection.lessons.map((lesson, index) => {
                      const isCompleted = isLessonCompleted(lesson._id);

                      return (
                        <div
                          key={lesson._id}
                          className={`lesson-card ${
                            selectedLesson?._id === lesson._id ? "active" : ""
                          } ${isCompleted ? "completed" : ""}`}
                          onClick={() => setSelectedLesson(lesson)}
                        >
                          <div className="lesson-header">
                            <span className="lesson-icon">
                              {isCompleted ? "✓" : index + 1}
                            </span>
                            <div className="lesson-info">
                              <h4>{lesson.title}</h4>
                              <span className="lesson-duration">
                                {lesson.duration}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="empty-lessons-state">
                      No lessons created yet for this section.
                    </div>
                  )}
                </div>
              </div>

              {/* Lesson content viewer */}
              {selectedLesson && (
                <div className="lesson-viewer">
                  <div className="lesson-viewer-header">
                    <h3>{selectedLesson.title}</h3>
                    <button
                      className="solid-button"
                      onClick={() => completeLesson(selectedSection._id, selectedLesson._id)}
                    >
                      {isLessonCompleted(selectedLesson._id)
                        ? "✓ Completed"
                        : "Mark as Complete"}
                    </button>
                  </div>

                  <p className="lesson-description">
                    {selectedLesson.description}
                  </p>

                  {selectedLesson.videoUrl && (
                    <div className="lesson-video">
                      <h4>Video Lesson</h4>
                      <iframe
                        width="100%"
                        height="400"
                        src={selectedLesson.videoUrl}
                        title="Lesson Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}

                  {selectedLesson.resourceUrl && (
                    <div className="lesson-resource">
                      <h4>Resource Materials</h4>
                      <a
                        href={selectedLesson.resourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="resource-link"
                      >
                        📄 Download Resources
                      </a>
                    </div>
                  )}

                  <div className="lesson-navigation">
                    {selectedLesson && (
                      <>
                        {selectedSection.lessons.indexOf(selectedLesson) > 0 && (
                          <button
                            className="ghost-button"
                            onClick={() => {
                              const prevLesson =
                                selectedSection.lessons[
                                  selectedSection.lessons.indexOf(
                                    selectedLesson
                                  ) - 1
                                ];
                              setSelectedLesson(prevLesson);
                            }}
                          >
                            ← Previous
                          </button>
                        )}

                        {selectedSection.lessons.indexOf(selectedLesson) <
                          selectedSection.lessons.length - 1 && (
                          <button
                            className="ghost-button"
                            onClick={() => {
                              const nextLesson =
                                selectedSection.lessons[
                                  selectedSection.lessons.indexOf(
                                    selectedLesson
                                  ) + 1
                                ];
                              setSelectedLesson(nextLesson);
                            }}
                          >
                            Next →
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Topics Section */}
              {selectedSection.topics && selectedSection.topics.length > 0 && (
                <div className="topics-container">
                  <h3>Topics</h3>
                  <div className="topics-list">
                    {selectedSection.topics.map((topic) => (
                      <div key={topic._id} className="content-card">
                        <h4>{topic.title}</h4>
                        <p>{topic.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Examples Section */}
              {selectedSection.examples && selectedSection.examples.length > 0 && (
                <div className="examples-container">
                  <h3>Examples</h3>
                  <div className="examples-list">
                    {selectedSection.examples.map((example) => (
                      <div key={example._id} className="content-card">
                        <h4>{example.title}</h4>
                        <p>{example.description}</p>
                        {example.code && (
                          <pre className="code-block">
                            <code>{example.code}</code>
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Questions Section */}
              {selectedSection.questions && selectedSection.questions.length > 0 && (
                <div className="questions-container">
                  <h3>Practice Questions</h3>
                  <div className="questions-list">
                    {selectedSection.questions.map((question, idx) => (
                      <div key={question._id} className="content-card question-card">
                        <div className="question-header">
                          <h4>Question {idx + 1}</h4>
                          <span className={`diff-badge diff-${question.difficulty?.toLowerCase() || 'medium'}`}>
                            {question.difficulty || 'Medium'}
                          </span>
                        </div>
                        <p className="question-text">{question.question}</p>
                        {question.options && question.options.length > 0 && (
                          <div className="options">
                            {question.options.map((option, optIdx) => (
                              <label
                                key={optIdx}
                                className={`option-label ${
                                  selectedAnswers[question._id] === optIdx ? 'selected' : ''
                                } ${
                                  answerFeedback[question._id] && selectedAnswers[question._id] === optIdx
                                    ? answerFeedback[question._id].result === 'correct'
                                      ? 'correct'
                                      : 'incorrect'
                                    : ''
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`question-${question._id}`}
                                  checked={selectedAnswers[question._id] === optIdx}
                                  onChange={() => handleSelectAnswer(question._id, optIdx)}
                                />
                                <span className="option-text">{option}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        <div className="question-actions">
                          <button
                            className="ghost-button"
                            onClick={() => handleSubmitAnswer(question._id, question)}
                          >
                            Check Answer
                          </button>
                        </div>
                        {answerFeedback[question._id] && (
                          <div className={`answer-feedback ${answerFeedback[question._id].result}`}>
                            {answerFeedback[question._id].message}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

             

            </>
          ) : (
            <div className="empty-main-state">
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
