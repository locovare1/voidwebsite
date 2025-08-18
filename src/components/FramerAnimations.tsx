"use client";

import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

// Error boundary for motion components
function MotionErrorBoundary({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.warn('Motion animation error:', error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return <>{fallback || children}</>;
  }

  return <>{children}</>;
}

// Check if Framer Motion is available
const isMotionAvailable = typeof motion !== 'undefined';

// Advanced motion variants for different animation types
export const motionVariants = {
  // Hero section animations
  heroTitle: {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 1.2,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: 0.3
      }
    }
  },
  heroSubtitle: {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 1,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: 0.6
      }
    }
  },
  heroButtons: {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: 0.9
      }
    }
  },

  // Card animations
  card: {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  },

  // Player card specific animations
  playerCard: {
    hidden: { opacity: 0, rotateX: 15, y: 50 },
    visible: { 
      opacity: 1, 
      rotateX: 0, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    hover: {
      rotateX: 5,
      y: -10,
      scale: 1.05,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  },

  // Stagger animations for lists
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  },
  staggerItem: {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  },

  // Text animations
  textReveal: {
    hidden: { opacity: 0, x: -100 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  },

  // Button animations
  button: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.1
      }
    }
  }
};

// Animated Hero Section Component
export function AnimatedHeroSection({ children }: { children: React.ReactNode }) {
  if (!isMotionAvailable) {
    return <div className="text-center">{children}</div>;
  }

  return (
    <MotionErrorBoundary>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={motionVariants.heroTitle}
        className="text-center"
      >
        {children}
      </motion.div>
    </MotionErrorBoundary>
  );
}

// Animated Card Component with Spring Physics
export function AnimatedCard({ 
  children, 
  className = "",
  delay = 0 
}: { 
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  if (!isMotionAvailable) {
    return <div className={className}>{children}</div>;
  }

  return (
    <MotionErrorBoundary>
      <motion.div
        variants={motionVariants.card}
        initial="hidden"
        whileInView="visible"
        whileHover="hover"
        viewport={{ once: true, amount: 0.3 }}
        transition={{ delay }}
        className={className}
      >
        {children}
      </motion.div>
    </MotionErrorBoundary>
  );
}

// Advanced Player Card with 3D Effects
export function AnimatedPlayerCard({ 
  children, 
  className = "",
  delay = 0 
}: { 
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  if (!isMotionAvailable) {
    return <div className={`perspective-1000 ${className}`}>{children}</div>;
  }

  return (
    <MotionErrorBoundary>
      <motion.div
        variants={motionVariants.playerCard}
        initial="hidden"
        whileInView="visible"
        whileHover="hover"
        viewport={{ once: true, amount: 0.3 }}
        transition={{ delay }}
        className={`perspective-1000 ${className}`}
      >
        {children}
      </motion.div>
    </MotionErrorBoundary>
  );
}

// Staggered List Component
export function StaggeredList({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  if (!isMotionAvailable) {
    return <div className={className}>{children}</div>;
  }

  return (
    <MotionErrorBoundary>
      <motion.div
        variants={motionVariants.staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className={className}
      >
        {children}
      </motion.div>
    </MotionErrorBoundary>
  );
}

// Staggered List Item
export function StaggeredItem({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  if (!isMotionAvailable) {
    return <div className={className}>{children}</div>;
  }

  return (
    <MotionErrorBoundary>
      <motion.div
        variants={motionVariants.staggerItem}
        className={className}
      >
        {children}
      </motion.div>
    </MotionErrorBoundary>
  );
}

// Animated Button with Spring Physics
export function AnimatedButton({ 
  children, 
  className = "",
  onClick,
  disabled = false
}: { 
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  if (!isMotionAvailable) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={className}
      >
        {children}
      </button>
    );
  }

  return (
    <MotionErrorBoundary>
      <motion.button
        variants={motionVariants.button}
        initial="hidden"
        whileInView="visible"
        whileHover="hover"
        whileTap="tap"
        viewport={{ once: true }}
        onClick={onClick}
        disabled={disabled}
        className={className}
      >
        {children}
      </motion.button>
    </MotionErrorBoundary>
  );
}

// Parallax Text Component
export function ParallaxText({ 
  children, 
  className = "",
  speed = 0.5 
}: { 
  children: React.ReactNode;
  className?: string;
  speed?: number;
}) {
  if (!isMotionAvailable) {
    return <div className={className}>{children}</div>;
  }

  return (
    <MotionErrorBoundary>
      <ParallaxTextInner speed={speed} className={className}>
        {children}
      </ParallaxTextInner>
    </MotionErrorBoundary>
  );
}

function ParallaxTextInner({ 
  children, 
  className = "",
  speed = 0.5 
}: { 
  children: React.ReactNode;
  className?: string;
  speed?: number;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -100 * speed]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);

  return (
    <motion.div
      ref={ref}
      style={{ y, opacity }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Floating Animation Component
export function FloatingElement({ 
  children, 
  className = "",
  duration = 3 
}: { 
  children?: React.ReactNode;
  className?: string;
  duration?: number;
}) {
  if (!isMotionAvailable) {
    return <div className={className}>{children}</div>;
  }

  return (
    <MotionErrorBoundary>
      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={className}
      >
        {children}
      </motion.div>
    </MotionErrorBoundary>
  );
}

// Scroll Progress Indicator
export function ScrollProgress() {
  if (!isMotionAvailable) {
    return null;
  }

  return (
    <MotionErrorBoundary>
      <ScrollProgressInner />
    </MotionErrorBoundary>
  );
}

function ScrollProgressInner() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-white origin-left z-50"
      style={{ scaleX }}
    />
  );
}

// Animated Counter Component
export function AnimatedCounter({ 
  value, 
  className = "",
  duration = 2 
}: { 
  value: number;
  className?: string;
  duration?: number;
}) {
  if (!isMotionAvailable) {
    return <span className={className}>{value}</span>;
  }

  return (
    <MotionErrorBoundary>
      <motion.span
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className={className}
      >
        <motion.span
          initial={{ number: 0 }}
          whileInView={{ number: value }}
          viewport={{ once: true }}
          transition={{ duration, ease: "easeOut" }}
        >
          {Math.round(value)}
        </motion.span>
      </motion.span>
    </MotionErrorBoundary>
  );
}

// Gesture-based Image Component
export function GestureImage({ 
  src, 
  alt, 
  className = "" 
}: { 
  src: string;
  alt: string;
  className?: string;
}) {
  if (!isMotionAvailable) {
    return <img src={src} alt={alt} className={className} />;
  }

  return (
    <MotionErrorBoundary>
      <motion.img
        src={src}
        alt={alt}
        className={className}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20
        }}
      />
    </MotionErrorBoundary>
  );
}
