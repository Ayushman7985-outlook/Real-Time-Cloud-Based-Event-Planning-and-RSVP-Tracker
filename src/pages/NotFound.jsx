import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="page-container">
      <div className="empty-state">
        <h1>404</h1>
        <h2>Page not found</h2>
        <p>The page you're looking for doesn't exist.</p>
        <Link to="/dashboard" className="primary-button">
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}