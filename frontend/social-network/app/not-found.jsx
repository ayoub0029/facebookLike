import Link from 'next/link';
import "../styles/error.css"

export default function NotFound() {
  return (
    <div className="error-container">
      <div className="error-content">
        <h1 className="error-code">404</h1>
        <div className="divider"></div>
        
        <h2 className="error-title">
          Page Not Found
        </h2>
        
        <p className="error-message">
          The page you are looking for might have been removed, had its name changed, 
          or is temporarily unavailable.
        </p>
        
        <Link href="/">
          <button className="home-button">
            Return to Homepage
          </button>
        </Link>
      </div>
    </div>
  );
}