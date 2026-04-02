"use client";

import { useEffect } from "react";

// Security utilities for protecting against credential harvesting
export const useSecurityHardening = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Console Protection - ONLY filter console.log, leave other functions alone
    const protectConsole = () => {
      const originalConsoleLog = console.log;

      // Obfuscation patterns for sensitive data
      const sensitivePatterns = [
        /api[_-]?key/i,
        /token/i,
        /secret/i,
        /auth/i,
        /stripe/i,
        /pk_/i,
        /sk_/i,
        /password/i,
        /credential/i,
      ];

      const filterSensitiveData = (args: any[]): any[] => {
        return args.map((arg) => {
          if (typeof arg === "string") {
            // Check if string contains sensitive patterns
            if (sensitivePatterns.some((pattern) => pattern.test(arg))) {
              return "[REDACTED]";
            }
            // Obfuscate potential API keys/tokens (30+ chars)
            if (/^[a-zA-Z0-9_-]{30,}$/.test(arg)) {
              return arg.substring(0, 8) + "..." + arg.substring(arg.length - 4);
            }
            return arg;
          }
          return arg;
        });
      };

      console.log = (...args: any[]) => {
        const filtered = filterSensitiveData(args);
        originalConsoleLog.apply(console, filtered);
      };
    };

    // Initialize console protection only
    protectConsole();

    console.log("🔒 Console protection active");
  }, []);
};

export default useSecurityHardening;
