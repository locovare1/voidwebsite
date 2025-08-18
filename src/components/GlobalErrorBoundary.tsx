"use client";

import { useState, useEffect } from "react";

// Global error boundary component
export default function GlobalErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isContentReady, setIsContentReady] = useState(false);

  useEffect(() => {
    // Mark as hydrated first
    setIsHydrated(true);
    
    // Wait for DOM content to be loaded
    const handleDOMContentLoaded = () => {
      // Additional delay to ensure everything is ready
      setTimeout(() => {
        setIsContentReady(true);
      }, 300);
    };

    // Wait for window load event
    const handleWindowLoad = () => {
      setTimeout(() => {
        setIsLoading(false);
      }, 1000); // Show loading for at least 1 second
    };

    // Check if DOM is already loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
    } else {
      handleDOMContentLoaded();
    }

    // Check if window is already loaded
    if (document.readyState === 'complete') {
      handleWindowLoad();
    } else {
      window.addEventListener('load', handleWindowLoad);
    }
    
    const handleError = (event: ErrorEvent) => {
      console.warn('Global error caught:', event.error);
      setHasError(true);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.warn('Unhandled promise rejection:', event.reason);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      document.removeEventListener('DOMContentLoaded', handleDOMContentLoaded);
      window.removeEventListener('load', handleWindowLoad);
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Show loading until everything is ready
  if (!isHydrated || !isContentReady || isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-2xl mb-4 font-bold">VOID ESPORTS</div>
          <div className="loading-spinner mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl mb-4">Something went wrong</h1>
          <button 
            onClick={() => window.location.reload()} 
            className="void-button"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
