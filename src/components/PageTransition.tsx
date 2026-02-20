"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import LoadingSpinner from './LoadingSpinner';

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Initial page load animation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Page transition animation
    setIsTransitioning(true);
    
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {/* Loading Screen */}
      {isLoading && (
        <div className="fixed inset-0 bg-[#0F0F0F] z-[9999] flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" text="Loading..." />
            <div className="text-white text-lg font-semibold mt-4">VOID ESPORTS</div>
          </div>
        </div>
      )}

      {/* Page Transition Overlay */}
      <div className={`page-transition ${isTransitioning ? 'active' : ''}`}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <div className="text-white text-lg font-semibold mt-4">VOID ESPORTS</div>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className={`page-content ${isLoading ? 'hidden' : ''}`}>
        {children}
      </div>
    </>
  );
}
