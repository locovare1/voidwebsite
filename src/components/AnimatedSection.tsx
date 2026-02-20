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
  duration = 0.5,
  className = '',
  threshold = 0.1
}: AnimatedSectionProps) {
  const { elementRef, isVisible } = useIntersectionObserver<HTMLDivElement>({ threshold });

  const getAnimationClasses = () => {
    // Compress long delays into shorter Tailwind delay classes
    const delayClass =
      delay >= 300 ? 'delay-200' : delay >= 150 ? 'delay-100' : delay > 0 ? 'delay-75' : 'delay-0';
    // Use shorter durations overall
    const durationClass =
      duration >= 0.8 ? 'duration-500' : duration >= 0.6 ? 'duration-400' : 'duration-300';
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
