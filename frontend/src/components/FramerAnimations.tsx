"use client";

import { motion, useScroll, useTransform, useSpring, easeOut } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';

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

// Mouse tilt wrapper for subtle 3D parallax on hover
export function MouseTilt({
  children,
  className = "",
  maxTilt = 10,
  scaleOnHover = 1.015,
}: {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  scaleOnHover?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  if (!isMotionAvailable) {
    return <div className={className}>{children}</div>;
  }

  return (
    <MotionErrorBoundary>
      <motion.div
        ref={ref}
        className={className}
        onMouseMove={(e) => {
          if (!ref.current) return;
          const rect = ref.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const midX = rect.width / 2;
          const midY = rect.height / 2;
          const rotY = ((x - midX) / midX) * maxTilt;
          const rotX = -((y - midY) / midY) * maxTilt;
          ref.current.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scaleOnHover})`;
        }}
        onMouseLeave={() => {
          if (ref.current) ref.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
        }}
        style={{ transition: 'transform 200ms ease-out', willChange: 'transform' }}
      >
        {children}
      </motion.div>
    </MotionErrorBoundary>
  );
}

// Advanced motion variants for different animation types
export const motionVariants = {
  // Hero section animations
  heroTitle: {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.7,
        ease: easeOut,
        delay: 0.15
      }
    }
  },
  // Subtle blur-in for content
  blurIn: {
    hidden: { opacity: 0, filter: 'blur(8px)', y: 12 },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: { duration: 0.5, ease: easeOut }
    }
  },
  // Scale and fade for hero cards/sections
  scaleIn: {
    hidden: { opacity: 0, scale: 0.96 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: easeOut }
    }
  },
  // Mask-like text/content reveal
  maskReveal: {
    hidden: { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
    visible: {
      opacity: 1,
      clipPath: 'inset(0 0% 0 0)',
      transition: { duration: 0.7, ease: easeOut }
    }
  },
  heroSubtitle: {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: easeOut,
        delay: 0.25
      }
    }
  },
  heroButtons: {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: easeOut,
        delay: 0.35
      }
    }
  },

  // Card animations
  card: {
    hidden: { opacity: 0, y: 20, scale: 0.97 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.45,
        ease: easeOut
      }
    },
    hover: {
      y: -8,
      scale: 1.015,
      transition: {
        duration: 0.25,
        ease: easeOut
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
        ease: easeOut
      }
    },
    hover: {
      rotateX: 5,
      y: -10,
      scale: 1.05,
      transition: {
        duration: 0.4,
        ease: easeOut
      }
    }
  },

  // Stagger animations for lists
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05,
        ease: easeOut
      }
    }
  },
  staggerItem: {
    hidden: { opacity: 0, y: 16 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.35,
        ease: easeOut
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
        ease: easeOut
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
        duration: 0.35,
        ease: easeOut
      }
    },
    hover: {
      scale: 1.03,
      transition: {
        duration: 0.15,
        ease: easeOut
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.08
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
  delay = 0,
  enableTilt = false,
}: { 
  children: React.ReactNode;
  className?: string;
  delay?: number;
  enableTilt?: boolean;
}) {
  if (!isMotionAvailable) {
    return <div className={className}>{children}</div>;
  }

  return (
    <MotionErrorBoundary>
      {enableTilt ? (
        <MouseTilt className={className}>
          <motion.div
            variants={motionVariants.card}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            transition={{ delay }}
          >
            {children}
          </motion.div>
        </MouseTilt>
      ) : (
        <motion.div
          variants={motionVariants.card}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          transition={{ delay }}
          className={className}
        >
          {children}
        </motion.div>
      )}
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
        animate="visible"
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

// Fade In Section Component
export function FadeInSection({ 
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
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: easeOut, delay }}
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
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          animate={{ opacity: 1 }}
          transition={{ duration }}
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
    // Use next/image for static images with proper optimization
    return <Image 
      src={src} 
      alt={alt} 
      className={className || ''} 
      width={0}
      height={0}
      sizes="100vw"
      style={{ width: '100%', height: 'auto' }}
    />;
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
