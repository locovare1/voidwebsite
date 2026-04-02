"use client";

/**
 * Global Window Protection Layer
 * Protects against credential harvesting and unauthorized data access
 * SIMPLIFIED VERSION - Removed aggressive monkey-patching that breaks React
 */

export const initializeWindowProtection = (): void => {
  if (typeof window === "undefined") return;

  // 1. Log security initialization (non-intrusive)
  console.log("🔒 Window protection active");

  // 2. Monitor for suspicious eval usage (minimal intervention)
  const originalEval = window.eval;
  window.eval = function(code: string) {
    // Check for suspicious patterns in evaluated code
    if (
      typeof code === 'string' &&
      (code.includes("localStorage") ||
        code.includes("sessionStorage") ||
        code.includes("credential") ||
        code.includes("token") ||
        code.includes("secret"))
    ) {
      console.warn("⚠️ SECURITY: Suspicious eval() detected");
    }
    
    return originalEval.call(this, code);
  };

  // That's it! Minimal protection that doesn't break React/Next.js
  // The main protection comes from:
  // - CSP headers in middleware
  // - Console filtering (if enabled carefully)
  // - Firebase obfuscation
};

export default initializeWindowProtection;
