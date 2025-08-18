"use client";

import { useEffect, useRef, useState } from 'react';

interface ParallaxElementProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

// Throttle function to limit scroll event frequency
function throttle(func: Function, limit: number) {
  let inThrottle: boolean;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

export default function ParallaxElement({ 
  children, 
  speed = 0.5, 
  className = "" 
}: ParallaxElementProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsEnabled(false);
      return;
    }

    const handleScroll = throttle(() => {
      try {
        const scrolled = window.pageYOffset;
        const rate = scrolled * speed;
        element.style.transform = `translateY(${rate}px)`;
      } catch (error) {
        console.warn('Parallax scroll error:', error);
        setIsEnabled(false);
      }
    }, 16); // ~60fps

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div 
      ref={elementRef}
      className={`parallax-element ${className}`}
      style={{ 
        willChange: isEnabled ? 'transform' : 'auto',
        transform: isEnabled ? undefined : 'none'
      }}
    >
      {children}
    </div>
  );
}
