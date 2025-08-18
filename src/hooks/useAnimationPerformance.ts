import { useEffect, useState, useCallback } from 'react';

interface AnimationPerformanceOptions {
  throttleMs?: number;
  enableReducedMotion?: boolean;
  performanceThreshold?: number;
}

export function useAnimationPerformance(options: AnimationPerformanceOptions = {}) {
  const {
    throttleMs = 16, // ~60fps
    enableReducedMotion = true,
    performanceThreshold = 30 // fps threshold
  } = options;

  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);
  const [performanceMode, setPerformanceMode] = useState<'high' | 'medium' | 'low'>('high');
  const [lastFrameTime, setLastFrameTime] = useState(0);

  // Check for reduced motion preference
  useEffect(() => {
    if (enableReducedMotion) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setShouldReduceMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setShouldReduceMotion(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [enableReducedMotion]);

  // Performance monitoring
  useEffect(() => {
    let frameId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let fps = 60;

    const measurePerformance = (currentTime: number) => {
      frameCount++;
      
      if (currentTime - lastTime >= 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        frameCount = 0;
        lastTime = currentTime;

        // Adjust performance mode based on FPS
        if (fps < performanceThreshold) {
          setPerformanceMode('low');
        } else if (fps < 50) {
          setPerformanceMode('medium');
        } else {
          setPerformanceMode('high');
        }
      }

      frameId = requestAnimationFrame(measurePerformance);
    };

    frameId = requestAnimationFrame(measurePerformance);

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [performanceThreshold]);

  // Throttled function wrapper
  const throttle = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    let lastExecTime = 0;

    return (...args: any[]) => {
      const currentTime = Date.now();

      if (currentTime - lastExecTime > delay) {
        func(...args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func(...args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }, []);

  // Get animation settings based on performance and preferences
  const getAnimationSettings = useCallback(() => {
    if (shouldReduceMotion) {
      return {
        duration: 0.1,
        ease: 'linear',
        disableAnimations: true
      };
    }

    switch (performanceMode) {
      case 'low':
        return {
          duration: 0.3,
          ease: [0.25, 0.46, 0.45, 0.94],
          disableComplexAnimations: true
        };
      case 'medium':
        return {
          duration: 0.5,
          ease: [0.25, 0.46, 0.45, 0.94],
          disableComplexAnimations: false
        };
      case 'high':
      default:
        return {
          duration: 0.8,
          ease: [0.25, 0.46, 0.45, 0.94],
          disableComplexAnimations: false
        };
    }
  }, [shouldReduceMotion, performanceMode]);

  // Optimized scroll handler
  const createOptimizedScrollHandler = useCallback((handler: Function) => {
    return throttle(handler, throttleMs);
  }, [throttle, throttleMs]);

  // Check if animations should be disabled
  const shouldDisableAnimations = shouldReduceMotion || performanceMode === 'low';

  return {
    shouldReduceMotion,
    performanceMode,
    shouldDisableAnimations,
    getAnimationSettings,
    createOptimizedScrollHandler,
    throttle
  };
}

// Hook for intersection observer with performance optimization
export function useOptimizedIntersectionObserver(
  options: IntersectionObserverInit = {},
  performanceOptions: AnimationPerformanceOptions = {}
) {
  const { shouldDisableAnimations } = useAnimationPerformance(performanceOptions);
  const [isVisible, setIsVisible] = useState(shouldDisableAnimations);
  const [ref, setRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (shouldDisableAnimations || !ref) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '0px',
        ...options
      }
    );

    observer.observe(ref);

    return () => {
      observer.unobserve(ref);
    };
  }, [ref, shouldDisableAnimations, options]);

  return { ref: setRef, isVisible };
}

// Hook for smooth scrolling with performance optimization
export function useSmoothScroll(performanceOptions: AnimationPerformanceOptions = {}) {
  const { shouldDisableAnimations, createOptimizedScrollHandler } = useAnimationPerformance(performanceOptions);

  const scrollTo = useCallback((target: string | HTMLElement, options: ScrollToOptions = {}) => {
    if (shouldDisableAnimations) {
      // Instant scroll for reduced motion
      if (typeof target === 'string') {
        const element = document.querySelector(target);
        if (element) {
          element.scrollIntoView({ behavior: 'instant', ...options });
        }
      } else {
        target.scrollIntoView({ behavior: 'instant', ...options });
      }
      return;
    }

    // Smooth scroll with performance optimization
    const scrollHandler = createOptimizedScrollHandler(() => {
      if (typeof target === 'string') {
        const element = document.querySelector(target);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', ...options });
        }
      } else {
        target.scrollIntoView({ behavior: 'smooth', ...options });
      }
    });

    scrollHandler();
  }, [shouldDisableAnimations, createOptimizedScrollHandler]);

  return { scrollTo };
}
