export default function CompleteClassCard({ course, actionLabel, onAction, actionDisabled }) {
  const getSubjectsForClass = (className) => {
    const classNum = className.match(/\d+/)?.[0];
    
    const subjects = {
      8: [
        { name: "Mathematics", description: "Algebra, geometry, fractions, equations", icon: "📐" },
        { name: "Physics", description: "Motion, force, energy, and heat", icon: "⚡" },
        { name: "Chemistry", description: "Elements, compounds, reactions", icon: "🧪" },
        { name: "Biology", description: "Life processes, reproduction, ecology", icon: "🔬" },
        { name: "English", description: "Grammar, reading, writing skills", icon: "📚" },
        { name: "Social Science", description: "History, geography, civics", icon: "🌍" },
      ],
      9: [
        { name: "Mathematics", description: "Algebra, geometry, coordinate geometry", icon: "📐" },
        { name: "Physics", description: "Motion, force, work, energy", icon: "⚡" },
        { name: "Chemistry", description: "Atoms, molecules, reactions", icon: "🧪" },
        { name: "Biology", description: "Cell biology, nutrition, reproduction", icon: "🔬" },
        { name: "English", description: "Literature, grammar, composition", icon: "📚" },
      ],
      10: [
        { name: "Mathematics", description: "Algebra, geometry, trigonometry, statistics", icon: "📐" },
        { name: "Physics", description: "Motion, force, energy, light, heat", icon: "⚡" },
        { name: "Chemistry", description: "Periodic table, acids, bases, reactions", icon: "🧪" },
        { name: "Biology", description: "Life processes, genetics, ecology", icon: "🔬" },
        { name: "English", description: "Literature, comprehension, writing", icon: "📚" },
      ],
    };

    return subjects[parseInt(classNum)] || [];
  };

  const displayPrice = course.price ? `₹${course.price}` : "Contact us";
  const subjects = getSubjectsForClass(course.title || "");

  return (
    <article className="complete-class-card">
      <div className="complete-card-header">
        <div className="complete-card-info">
          <div className="complete-card-badge">{course.category || "COMPLETE"}</div>
          <h3 className="complete-card-title">{course.title}</h3>
          <p className="complete-card-summary">{course.summary}</p>
          <div className="complete-card-footer">
            <span className="complete-card-mode">{course.mode}</span>
            <span className="complete-card-duration">{course.duration}</span>
            <span className="complete-card-price">{displayPrice}</span>
          </div>
        </div>
      </div>

      <div className="subjects-container">
        <h4 className="subjects-title">Covered Subjects</h4>
        <div className="subjects-grid">
          {subjects.map((subject, idx) => (
            <div key={idx} className="subject-box">
              <div className="subject-icon">{subject.icon}</div>
              <h5 className="subject-name">{subject.name}</h5>
              <p className="subject-description">{subject.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="complete-card-action">
        <button 
          className="solid-button" 
          type="button" 
          onClick={() => onAction && onAction(course)} 
          disabled={actionDisabled}
        >
          {actionLabel}
        </button>
      </div>
    </article>
  );
}
