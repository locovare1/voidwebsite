"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const handlePageTransition = async () => {
      setIsVisible(false);
      setIsLoading(true);
      
      // Smooth transition delay
      await new Promise(resolve => setTimeout(resolve, 150));
      
      setIsLoading(false);
      setIsVisible(true);
    };

    handlePageTransition();
  }, [pathname]);

  return (
    <>
      {/* Enhanced loading overlay */}
      <div 
        className={`fixed inset-0 bg-gradient-to-br from-[#0F0F0F] via-[#1A1A1A] to-[#0F0F0F] z-[9999] transition-all duration-500 ease-in-out flex items-center justify-center ${
          isLoading ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        <div className="text-center space-y-6">
          {/* Animated logo */}
          <div className="relative">
            <div className="w-20 h-20 border-4 border-[#FFFFFF]/20 border-t-[#FFFFFF] rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-b-[#a2a2a2] rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <div className="space-y-2">
            <p className="text-white text-lg font-semibold animate-pulse">VOID</p>
            <div className="flex space-x-1 justify-center">
              <div className="w-2 h-2 bg-[#FFFFFF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-[#FFFFFF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-[#FFFFFF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Page content with enhanced transitions */}
      <div 
        className={`transition-all duration-700 ease-out ${
          isVisible 
            ? 'opacity-100 transform translate-y-0 scale-100' 
            : 'opacity-0 transform translate-y-8 scale-95'
        }`}
      >
        {children}
      </div>
    </>
  );
}