import { useMemo } from "react";
import { API_BASE } from "../api";

export default function CourseCard({ course, actionLabel, onAction, actionDisabled }) {
  const feeInfo = useMemo(() => {
    // This will be fetched on demand if needed
    return null;
  }, []);

  const displayPrice = course.price ? `₹${course.price}` : "Contact us";

  return (
    <article className="card course-card">
      <div className="card-header">
        {course.category ? <span className="course-badge">{course.category}</span> : <span />}
        {course.duration ? <span className="status-badge">{course.duration}</span> : <span />}
      </div>
      
      <h3 className="card-title">{course.title}</h3>
      
      <div className="card-body">
        <p>{course.summary}</p>
      </div>
      
      <div className="card-footer">
        <div className="card-footer-meta">
          {course.mode && <span className="mode-badge">{course.mode}</span>}
          {displayPrice && <span className="price-badge">{displayPrice}</span>}
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
