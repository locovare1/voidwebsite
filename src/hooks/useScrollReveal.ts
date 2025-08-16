import { useEffect } from 'react';

/**
 * Custom hook for scroll-based reveal animations
 * Provides optimized intersection observer for better performance
 */
export const useScrollReveal = () => {
  useEffect(() => {
    // Enhanced Intersection Observer with better performance
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          
          // Add staggered animation to child elements
          const children = entry.target.querySelectorAll('.stagger-child');
          children.forEach((child, index) => {
            setTimeout(() => {
              child.classList.add('animate-fade-in');
            }, index * 100);
          });
          
          // Stop observing once revealed
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all elements with scroll-reveal class
    const animateElements = document.querySelectorAll('.scroll-reveal');
    animateElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, []);
};

/**
 * Custom hook for optimized scroll effects
 * Uses requestAnimationFrame for smooth performance
 */
export const useScrollEffects = () => {
  useEffect(() => {
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
          
          // Parallax effects for enhanced visual appeal
          const parallaxElements = document.querySelectorAll('.parallax');
          parallaxElements.forEach((element) => {
            const speed = parseFloat(element.getAttribute('data-speed') || '0.5');
            const yPos = -(window.scrollY * speed);
            (element as HTMLElement).style.transform = `translateY(${yPos}px)`;
          });
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
};