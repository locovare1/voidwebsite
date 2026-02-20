"use client";

import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import LoadingScreen from './LoadingScreen';

interface AdvancedPageTransitionProps {
  children: React.ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,

    }
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: {
      duration: 0.4,

    }
  }
} as const satisfies Variants;

const overlayVariants = {
  initial: {
    y: '100%'
  },
  animate: {
    y: 0,
    transition: {
      duration: 0.6,

    }
  },
  exit: {
    y: '-100%',
    transition: {
      duration: 0.6,

    }
  }
} as const satisfies Variants;

const loadingVariants = {
  initial: {
    opacity: 0,
    scale: 0.8
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,

    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.3,

    }
  }
} as const satisfies Variants;

export default function AdvancedPageTransition({ children }: AdvancedPageTransitionProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Initial page load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1450);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Route change transition
    setIsTransitioning(true);

    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 1450);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {/* Universal Loading Screen for Initial Load and Transitions */}
      <AnimatePresence>
        {(isLoading || isTransitioning) && (
          <motion.div
            key="loading-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999]"
          >
            <LoadingScreen message={isLoading ? "SYSTEM BOOT" : "SYNCING DATA"} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          variants={pageVariants}
          initial="initial"
          animate="in"
          exit="out"
          className={`${isLoading ? 'hidden' : ''} ${isTransitioning ? 'invisible h-0 overflow-hidden' : ''}`}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
