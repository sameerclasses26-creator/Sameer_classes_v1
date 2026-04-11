import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Page not found</h1>
        <p>The route you requested does not exist yet.</p>
        <Link className="solid-button" to="/">
          Back to home
        </Link>
      </div>
    </div>
  );
}
