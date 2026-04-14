export default function CourseCard({ course, actionLabel, onAction, actionDisabled }) {
  return (
    <article className="card course-card">
      <div className="card-topline">
        {course.category ? <span className="course-subject">{course.category}</span> : <span />}
        <strong>{course.duration}</strong>
      </div>
     
      <div className="card-body">
        <p>{course.summary}</p>
      </div>
      <div className="card-footer">
        <div className="card-footer-meta">
          <span>{course.mode}</span>
          <span>{course.price ? `₹${course.price}` : "Contact us"}</span>
        </div>
        {actionLabel ? (
          <button className="solid-button" type="button" onClick={() => onAction && onAction(course)} disabled={actionDisabled}>
            {actionLabel}
          </button>
        ) : null}
      </div>
    </article>
  );
}
