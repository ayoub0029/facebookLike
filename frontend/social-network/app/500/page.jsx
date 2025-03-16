'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import "../../styles/error.css";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={"error-container"}>
      <div className={"error-content"}>
        <h1 className={"error-code"}>500</h1>
        <div className={"divider"}></div>
        
        <h2 className={"error-title"}>
          Server Error
        </h2>
        
        <p className={"error-message"}>
          Something went wrong on our servers. We're working to fix the issue.
        </p>
        
        <div className={"button-group"}>
          <button onClick={reset} className={"home-button"}>
            Try Again
          </button>
          <Link href="/">
            <button className={"home-button"}>
              Return to Homepage
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}