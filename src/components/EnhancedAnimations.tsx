"use client";

import { useEffect, useRef } from 'react';

interface AnimatedElementProps {
  children: React.ReactNode;
  animation?: 'fadeIn' | 'slideInUp' | 'slideInLeft' | 'slideInRight' | 'scaleIn' | 'bounceIn';
  delay?: number;
  duration?: number;
  className?: string;
}

export function AnimatedElement({ 
  children, 
  animation = 'fadeIn', 
  delay = 0, 
  duration = 600,
  className = '' 
}: AnimatedElementProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            element.classList.add('animate-in');
          }, delay);
          observer.unobserve(element);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={elementRef}
      className={`animate-element ${animation} ${className}`}
      style={{ 
        '--animation-duration': `${duration}ms`,
        '--animation-delay': `${delay}ms`
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

interface ParallaxElementProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export function ParallaxElement({ children, speed = 0.5, className = '' }: ParallaxElementProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let ticking = false;

    const updateParallax = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = element.getBoundingClientRect();
          const scrolled = window.pageYOffset;
          const rate = scrolled * -speed;
          
          if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
            element.style.transform = `translateY(${rate}px)`;
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', updateParallax, { passive: true });
    updateParallax();

    return () => window.removeEventListener('scroll', updateParallax);
  }, [speed]);

  return (
    <div ref={elementRef} className={`parallax-element ${className}`}>
      {children}
    </div>
  );
}

interface CounterAnimationProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function CounterAnimation({ 
  end, 
  duration = 2000, 
  prefix = '', 
  suffix = '',
  className = ''
}: CounterAnimationProps) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          
          let startTime: number;
          const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(easeOutQuart * end));

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return (
    <span ref={counterRef} className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

// Hook for managing complex animations
export function useEnhancedAnimations() {
  useEffect(() => {
    // Enhanced scroll reveal with better performance
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          
          // Staggered children animation
          const children = entry.target.querySelectorAll('.stagger-child');
          children.forEach((child, index) => {
            setTimeout(() => {
              child.classList.add('animate-fade-in');
            }, index * 100);
          });
          
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe elements
    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach(el => observer.observe(el));

    // Enhanced scroll effects
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Logo fade effect
          const logo = document.querySelector('.fade-on-scroll');
          if (logo) {
            const fadeStart = 0;
            const fadeEnd = 350;
            const scrollY = window.scrollY;
            let opacity = 1;
            if (scrollY > fadeStart) {
              opacity = Math.max(0, 1 - (scrollY - fadeStart) / (fadeEnd - fadeStart));
            }
            (logo as HTMLElement).style.opacity = String(opacity * 0.2);
          }

          // Parallax effects
          const parallaxElements = document.querySelectorAll('.parallax-element');
          parallaxElements.forEach((element) => {
            const rect = element.getBoundingClientRect();
            if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
              const speed = parseFloat(element.getAttribute('data-speed') || '0.5');
              const yPos = -(window.scrollY * speed);
              (element as HTMLElement).style.transform = `translateY(${yPos}px)`;
            }
          });
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
}

// useState for managing animation states
import { useState } from 'react';

export function useAnimationState() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationQueue, setAnimationQueue] = useState<string[]>([]);

  const triggerAnimation = (animationName: string, duration = 1000) => {
    setIsAnimating(true);
    setAnimationQueue(prev => [...prev, animationName]);

    setTimeout(() => {
      setAnimationQueue(prev => prev.filter(name => name !== animationName));
      if (animationQueue.length <= 1) {
        setIsAnimating(false);
      }
    }, duration);
  };

  return {
    isAnimating,
    animationQueue,
    triggerAnimation
  };
}