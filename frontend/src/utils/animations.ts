// Animation utility functions and constants for Void Esports website

export const ANIMATION_DELAYS = {
  FAST: 100,
  MEDIUM: 200,
  SLOW: 300,
  STAGGER: 150,
} as const;

export const ANIMATION_DURATIONS = {
  FAST: 0.3,
  MEDIUM: 0.5,
  SLOW: 0.8,
  VERY_SLOW: 1.2,
} as const;

export const ANIMATION_EASINGS = {
  SMOOTH: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  EASE_OUT: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  EASE_IN: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
} as const;

// Animation class names for consistent usage
export const ANIMATION_CLASSES = {
  // Page transitions
  PAGE_TRANSITION: 'page-transition',
  PAGE_CONTENT: 'page-content',
  
  // Hero animations
  HERO_TITLE: 'hero-title',
  HERO_SUBTITLE: 'hero-subtitle',
  HERO_BUTTONS: 'hero-buttons',
  
  // Card animations
  STAGGER_ANIMATION: 'stagger-animation',
  VOID_CARD: 'void-card',
  PLAYER_CARD: 'player-card',
  PLAYER_CARD_IMAGE: 'player-card-image',
  
  // Scroll animations
  FADE_IN_ON_SCROLL: 'fade-in-on-scroll',
  PARALLAX_CONTAINER: 'parallax-container',
  PARALLAX_ELEMENT: 'parallax-element',
  
  // Loading animations
  LOADING_SPINNER: 'loading-spinner',
  
  // Special effects
  FLOATING: 'floating',
  GLOW_ON_HOVER: 'glow-on-hover',

  PULSE_GLOW: 'pulse-glow',
  NAVBAR_ANIMATE: 'navbar-animate',
  

} as const;

// Helper function to calculate staggered delays
export const getStaggerDelay = (index: number, baseDelay: number = ANIMATION_DELAYS.STAGGER): number => {
  return index * baseDelay;
};

// Helper function to get animation classes with delays
export const getAnimationClasses = (
  baseClass: string,
  duration: number = ANIMATION_DURATIONS.MEDIUM
): string => {
  return `${baseClass} transition-all duration-${Math.round(duration * 1000)}`;
};

// Animation presets for common use cases
export const ANIMATION_PRESETS = {
  HERO_SECTION: {
    title: { delay: 300, duration: ANIMATION_DURATIONS.SLOW },
    subtitle: { delay: 600, duration: ANIMATION_DURATIONS.MEDIUM },
    buttons: { delay: 900, duration: ANIMATION_DURATIONS.FAST },
  },
  CARD_GRID: {
    stagger: ANIMATION_DELAYS.STAGGER,
    duration: ANIMATION_DURATIONS.MEDIUM,
  },
  PAGE_LOAD: {
    initial: { delay: 0, duration: ANIMATION_DURATIONS.SLOW },
    content: { delay: 200, duration: ANIMATION_DURATIONS.MEDIUM },
  },
} as const;

// Intersection Observer options
export const INTERSECTION_OPTIONS = {
  DEFAULT: {
    threshold: 0.1,
    rootMargin: '0px',
    triggerOnce: true,
  },
  EARLY: {
    threshold: 0.05,
    rootMargin: '50px',
    triggerOnce: true,
  },
  LATE: {
    threshold: 0.3,
    rootMargin: '-50px',
    triggerOnce: true,
  },
} as const;

// Parallax speed presets
export const PARALLAX_SPEEDS = {
  SLOW: 0.1,
  MEDIUM: 0.3,
  FAST: 0.5,
  VERY_FAST: 0.8,
} as const;

// Export types for TypeScript
export type AnimationDelay = typeof ANIMATION_DELAYS[keyof typeof ANIMATION_DELAYS];
export type AnimationDuration = typeof ANIMATION_DURATIONS[keyof typeof ANIMATION_DURATIONS];
export type AnimationEasing = typeof ANIMATION_EASINGS[keyof typeof ANIMATION_EASINGS];
export type AnimationClass = typeof ANIMATION_CLASSES[keyof typeof ANIMATION_CLASSES];
