"use client";

import { ReactNode } from 'react';
import { useIntersectionObserver } from './useIntersectionObserver';

interface AnimatedSectionProps {
  children: ReactNode;
  animationType?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scale' | 'rotate';
  delay?: number;
  duration?: number;
  className?: string;
  threshold?: number;
  ref?: React.RefObject<HTMLDivElement>;
}

export default function AnimatedSection({
  children,
  animationType = 'fadeIn',
  delay = 0,
  duration = 0.8,
  className = '',
  threshold = 0.1
}: AnimatedSectionProps) {
  const { elementRef, isVisible } = useIntersectionObserver<HTMLDivElement>({ threshold });

  const getAnimationClasses = () => {
    const delayClass =
      delay >= 700 ? 'delay-700' : delay >= 600 ? 'delay-600' : delay >= 500 ? 'delay-500' : delay >= 400 ? 'delay-400' : delay >= 300 ? 'delay-300' : delay >= 200 ? 'delay-200' : delay >= 100 ? 'delay-100' : 'delay-0';
    const durationClass =
      duration >= 1.0 ? 'duration-1000' : duration >= 0.9 ? 'duration-900' : duration >= 0.8 ? 'duration-800' : duration >= 0.7 ? 'duration-700' : duration >= 0.6 ? 'duration-600' : 'duration-500';
    const baseClasses = `transition-all ${durationClass} ${delayClass}`;
    
    switch (animationType) {
      case 'fadeIn':
        return `${baseClasses} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`;
      case 'slideUp':
        return `${baseClasses} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`;
      case 'slideLeft':
        return `${baseClasses} ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-16'}`;
      case 'slideRight':
        return `${baseClasses} ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16'}`;
      case 'scale':
        return `${baseClasses} ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`;
      case 'rotate':
        return `${baseClasses} ${isVisible ? 'opacity-100 rotate-0' : 'opacity-0 rotate-12'}`;
      default:
        return `${baseClasses} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`;
    }
  };

  return (
    <div
      ref={elementRef}
      className={`${getAnimationClasses()} ${className}`}
    >
      {children}
    </div>
  );
}
