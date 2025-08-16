"use client";

import { useState, useEffect } from 'react';
import { ChevronUpIcon } from '@heroicons/react/24/outline';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const toggleVisibility = () => {
      const scrolled = window.pageYOffset;
      const maxHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrolled / maxHeight) * 100;
      
      setScrollProgress(progress);
      setIsVisible(scrolled > 300);
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button
      className={`fixed bottom-8 right-8 z-50 p-4 bg-[#FFFFFF] text-black rounded-full shadow-2xl transition-all duration-500 hover:scale-110 hover:shadow-xl hover:bg-[#f0f0f0] active:scale-95 group ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
      }`}
      onClick={scrollToTop}
      aria-label="Scroll to top"
      style={{
        background: `conic-gradient(#FFFFFF ${scrollProgress * 3.6}deg, rgba(255,255,255,0.2) ${scrollProgress * 3.6}deg)`
      }}
    >
      <div className="w-10 h-10 bg-[#FFFFFF] rounded-full flex items-center justify-center">
        <ChevronUpIcon className="w-6 h-6 text-black group-hover:animate-bounce transition-transform duration-300" />
      </div>
    </button>
  );
}