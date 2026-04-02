"use client";

import { useEffect } from "react";

// Security utilities for protecting against credential harvesting
export const useSecurityHardening = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Console Protection - Disable or obfuscate console output
    const protectConsole = () => {
      const originalConsoleLog = console.log;
      const originalConsoleWarn = console.warn;
      const originalConsoleError = console.error;
      const originalConsoleInfo = console.info;
      const originalConsoleDebug = console.debug;

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
        /jwt/i,
        /bearer/i,
        /access[_-]?token/i,
        /refresh[_-]?token/i,
      ];

      const filterSensitiveData = (args: any[]): any[] => {
        return args.map((arg) => {
          if (typeof arg === "string") {
            // Check if string contains sensitive patterns
            if (sensitivePatterns.some((pattern) => pattern.test(arg))) {
              return "[REDACTED]";
            }
            // Obfuscate potential API keys/tokens
            if (/^[a-zA-Z0-9_-]{20,}$/.test(arg)) {
              return arg.substring(0, 8) + "..." + arg.substring(arg.length - 4);
            }
            return arg;
          }
          if (typeof arg === "object" && arg !== null) {
            try {
              const str = JSON.stringify(arg);
              if (sensitivePatterns.some((pattern) => pattern.test(str))) {
                return "[OBJECT REDACTED]";
              }
            } catch {
              return "[OBJECT]";
            }
          }
          return arg;
        });
      };

      console.log = (...args: any[]) => {
        const filtered = filterSensitiveData(args);
        originalConsoleLog.apply(console, filtered);
      };

      console.warn = (...args: any[]) => {
        const filtered = filterSensitiveData(args);
        originalConsoleWarn.apply(console, filtered);
      };

      console.error = (...args: any[]) => {
        const filtered = filterSensitiveData(args);
        originalConsoleError.apply(console, filtered);
      };

      console.info = (...args: any[]) => {
        const filtered = filterSensitiveData(args);
        originalConsoleInfo.apply(console, filtered);
      };

      console.debug = (...args: any[]) => {
        const filtered = filterSensitiveData(args);
        originalConsoleDebug.apply(console, filtered);
      };
    };

    // 2. Debugger Detection - Detect and respond to DevTools
    const detectDebugger = () => {
      let checkInterval: NodeJS.Timeout;
      let devtoolsOpen = false;

      const checkDevTools = () => {
        // Method 1: Check window dimensions
        const widthThreshold = window.outerWidth - window.innerWidth > 200;
        const heightThreshold = window.outerHeight - window.innerHeight > 200;

        // Method 2: Check for debugger statement
        const before = new Date();
        debugger; // eslint-disable-line no-debugger
        const after = new Date();
        const debugDetected = after.getTime() - before.getTime() > 100;

        // Method 3: Check console object manipulation
        const isConsoleManuallyModified =
          console.log.toString().includes("function") === false;

        if (widthThreshold || heightThreshold || debugDetected || isConsoleManuallyModified) {
          devtoolsOpen = true;
          
          // Clear interval if detected
          if (checkInterval) {
            clearInterval(checkInterval);
          }

          // Respond to DevTools being open
          handleDevToolsDetected();
        }
      };

      // Initial check
      checkDevTools();

      // Continuous monitoring
      checkInterval = setInterval(checkDevTools, 1000);

      return () => {
        if (checkInterval) {
          clearInterval(checkInterval);
        }
      };
    };

    // 3. Handle DevTools detection
    const handleDevToolsDetected = () => {
      // Log the attempt
      console.warn("⚠️ Security Alert: Developer Tools detected");

      // Optionally redirect or show warning
      // For now, we'll just log it. You can add more aggressive measures if needed.
      
      // Add visual watermark
      const watermark = document.createElement("div");
      watermark.id = "security-watermark";
      watermark.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 0, 0, 0.9);
        color: white;
        padding: 40px;
        font-size: 24px;
        font-weight: bold;
        z-index: 999999;
        border-radius: 10px;
        text-align: center;
        box-shadow: 0 0 50px rgba(255, 0, 0, 0.5);
      `;
      watermark.innerHTML = `
        ⚠️ SECURITY ALERT ⚠️<br/>
        Unauthorized debugging detected<br/>
        <small>This incident has been logged</small>
      `;
      
      // Only show if not already shown
      if (!document.getElementById("security-watermark")) {
        document.body.appendChild(watermark);
        
        // Remove after 5 seconds
        setTimeout(() => {
          watermark.remove();
        }, 5000);
      }
    };

    // 4. Protect sensitive data in localStorage/sessionStorage
    const protectStorage = () => {
      // Override localStorage to encrypt sensitive data
      const originalSetItem = Storage.prototype.setItem;
      const originalGetItem = Storage.prototype.getItem;

      Storage.prototype.setItem = function(key: string, value: string) {
        // Encrypt sensitive keys
        if (key.includes('token') || key.includes('auth') || key.includes('key') || key.includes('secret')) {
          try {
            // Simple base64 encoding (not true encryption, but obfuscation)
            const obfuscated = btoa(value);
            originalSetItem.call(this, key, obfuscated);
            return;
          } catch (e) {
            // Fallback to normal storage
          }
        }
        originalSetItem.call(this, key, value);
      };

      Storage.prototype.getItem = function(key: string) {
        const value = originalGetItem.call(this, key);
        if (value && (key.includes('token') || key.includes('auth') || key.includes('key') || key.includes('secret'))) {
          try {
            // Try to decode obfuscated value
            return atob(value);
          } catch (e) {
            // Return as-is if not obfuscated
          }
        }
        return value;
      };
    };

    // 5. Block common credential harvesting techniques
    const blockHarvesting = () => {
      // Prevent access to sensitive window properties
      const blockedProperties = [
        '__eniCredentialDump',
        'webpackChunk_N_E',
        'next',
        '__NEXT_DATA__',
      ];

      blockedProperties.forEach((prop) => {
        try {
          Object.defineProperty(window, prop, {
            get: () => {
              console.warn(`⚠️ Blocked access to sensitive property: ${prop}`);
              return undefined;
            },
            configurable: false,
          });
        } catch (e) {
          // Property might already be defined
        }
      });

      // Intercept and protect fetch/XHR requests
      const originalFetch = window.fetch;
      window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
        // Log API calls for security monitoring
        if (typeof input === 'string' && (input.includes('api') || input.includes('auth'))) {
          // Could add logging here for security monitoring
        }
        
        return originalFetch.apply(this, [input, init]);
      };
    };

    // Initialize all protections
    protectConsole();
    protectStorage();
    blockHarvesting();
    
    // Start debugger detection (optional - can be enabled in production if needed)
    // Uncomment the line below to enable continuous monitoring
    // detectDebugger();

    // Cleanup on unmount
    return () => {
      // Restore original functions if needed
    };
  }, []);
};

export default useSecurityHardening;
