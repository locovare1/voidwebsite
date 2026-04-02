"use client";

/**
 * Global Window Protection Layer
 * Protects against credential harvesting and unauthorized data access
 */

export const initializeWindowProtection = (): void => {
  if (typeof window === "undefined") return;

  // 1. Block access to sensitive global variables
  const blockedGlobals = [
    "__eniCredentialDump",
    "webpackChunk_N_E",
    "__NEXT_DATA__",
    "__NEXT_P",
    "__NEXT_LOADED_CHUNKS__",
    "next",
    "firebaseConfig",
    "stripeKey",
    "apiKey",
  ];

  blockedGlobals.forEach((prop) => {
    try {
      // Try to make these properties inaccessible
      if ((window as any)[prop]) {
        Object.defineProperty(window, prop, {
          get: () => {
            console.warn(`⚠️ Blocked access to protected property: ${prop}`);
            return undefined;
          },
          set: () => {
            console.warn(`⚠️ Blocked assignment to protected property: ${prop}`);
          },
          configurable: false,
          enumerable: false,
        });
      }
    } catch (e) {
      // Property might already be non-configurable
    }
  });

  // 2. Protect against Object.keys/values/entries enumeration
  const originalGetOwnPropertyNames = Object.getOwnPropertyNames;
  const originalKeys = Object.keys;
  const originalEntries = Object.entries;
  const originalValues = Object.values;

  Object.getOwnPropertyNames = function(obj: any) {
    const names = originalGetOwnPropertyNames.call(this, obj);
    if (obj === window) {
      return names.filter(
        (name) => !blockedGlobals.includes(name)
      );
    }
    return names;
  };

  Object.keys = function(obj: any) {
    const keys = originalKeys.call(this, obj);
    if (obj === window) {
      return keys.filter(
        (key) => !blockedGlobals.includes(key)
      );
    }
    return keys;
  };

  Object.entries = function(obj: any) {
    const entries = originalEntries.call(this, obj);
    if (obj === window) {
      return entries.filter(
        ([key]) => !blockedGlobals.includes(key)
      );
    }
    return entries;
  };

  Object.values = function(obj: any) {
    const values = originalValues.call(this, obj);
    if (obj === window) {
      // This is a bit tricky since we lost the keys
      // We'll use a different approach
      const keys = originalKeys.call(this, obj);
      const filteredKeys = keys.filter(
        (key) => !blockedGlobals.includes(key)
      );
      return filteredKeys.map((key) => (obj as any)[key]);
    }
    return values;
  };

  // 3. Intercept and monitor suspicious code patterns
  const originalFunctionToString = Function.prototype.toString;
  Function.prototype.toString = function() {
    const result = originalFunctionToString.call(this);
    
    // Detect attempts to stringify functions for analysis
    if (result.includes("credential") || result.includes("harvest")) {
      console.warn("⚠️ Suspicious function stringification detected");
    }
    
    return result;
  };

  // 4. Create wrapper for Proxy to monitor usage (not extend, since Proxy is not constructible)
  const originalProxy = Proxy;
  (window as any).createMonitoredProxy = (target: any, handler: ProxyHandler<any>) => {
    // Check if this looks like an attempt to intercept sensitive data
    try {
      const handlerStr = JSON.stringify(handler);
      if (
        handlerStr.includes("get") &&
        (handlerStr.includes("token") ||
          handlerStr.includes("key") ||
          handlerStr.includes("secret"))
      ) {
        console.warn("⚠️ Suspicious Proxy creation detected");
      }
    } catch (e) {
      // Ignore stringify errors
    }
    return new originalProxy(target, handler);
  };

  // 5. Monitor for eval and Function constructor usage
  const originalEval = window.eval;
  window.eval = function(code: string) {
    console.warn("⚠️ eval() usage detected - this is a security risk");
    
    // Check for suspicious patterns in evaluated code
    if (
      code.includes("localStorage") ||
      code.includes("sessionStorage") ||
      code.includes("cookie") ||
      code.includes("credential") ||
      code.includes("token") ||
      code.includes("key") ||
      code.includes("secret")
    ) {
      console.error("🚨 CRITICAL: Attempted credential harvesting via eval() blocked");
      throw new Error("Security violation: Credential harvesting attempt detected");
    }
    
    return originalEval.call(this, code);
  };

  const originalFunctionConstructor = Function;
  Function = function(...args: string[]) {
    const code = args.join(", ");
    
    if (
      code.includes("localStorage") ||
      code.includes("sessionStorage") ||
      code.includes("cookie") ||
      code.includes("credential")
    ) {
      console.error("🚨 CRITICAL: Attempted credential harvesting via Function constructor blocked");
      throw new Error("Security violation: Credential harvesting attempt detected");
    }
    
    return originalFunctionConstructor(...args);
  } as any;

  // 6. Protect document.cookie access
  const originalCookieDescriptor = Object.getOwnPropertyDescriptor(
    Document.prototype,
    "cookie"
  );

  if (originalCookieDescriptor) {
    Object.defineProperty(document, "cookie", {
      get: function() {
        const cookies = originalCookieDescriptor.get!.call(this);
        
        // Filter out sensitive cookies from casual inspection
        const sensitivePatterns = [
          /session/i,
          /auth/i,
          /token/i,
          /jwt/i,
          /key/i,
          /secret/i,
        ];

        return cookies
          .split(";")
          .filter((cookie: string) => {
            const name = cookie.split("=")[0].trim();
            return !sensitivePatterns.some((pattern) => pattern.test(name));
          })
          .join(";");
      },
      set: originalCookieDescriptor.set,
      configurable: false,
    });
  }

  // 7. Add integrity check for critical objects
  const integrityChecks = new Map<string, WeakSet<object>>();
  
  (window as any).registerIntegrityCheck = (name: string, obj: object) => {
    if (!integrityChecks.has(name)) {
      integrityChecks.set(name, new WeakSet());
    }
    integrityChecks.get(name)!.add(obj);
  };

  (window as any).verifyIntegrity = (name: string, obj: object): boolean => {
    return integrityChecks.get(name)?.has(obj) ?? false;
  };

  // 8. Monitor for mass enumeration attacks
  let enumerationCount = 0;
  let lastEnumerationTime = Date.now();
  const ENUMERATION_THRESHOLD = 100; // Max enumerations per second
  const TIME_WINDOW = 1000; // 1 second

  const originalReflectOwnKeys = Reflect.ownKeys;
  Reflect.ownKeys = function(target: any) {
    const now = Date.now();
    
    if (now - lastEnumerationTime > TIME_WINDOW) {
      enumerationCount = 0;
      lastEnumerationTime = now;
    }
    
    enumerationCount++;
    
    if (enumerationCount > ENUMERATION_THRESHOLD && target === window) {
      console.error(
        "🚨 CRITICAL: Mass enumeration attack detected"
      );
      // Could implement rate limiting or blocking here
    }
    
    return originalReflectOwnKeys.call(this, target);
  };

  // 9. Protect against Symbol-based property access
  const originalObjectGetOwnPropertySymbols = Object.getOwnPropertySymbols;
  Object.getOwnPropertySymbols = function(obj: any) {
    const symbols = originalObjectGetOwnPropertySymbols.call(this, obj);
    
    if (obj === window) {
      // Filter out symbols that might contain sensitive data
      return symbols.filter((symbol) => {
        const symbolDesc = symbol.description || "";
        return !symbolDesc.includes("secret") && !symbolDesc.includes("private");
      });
    }
    
    return symbols;
  };

  // 10. Log and monitor suspicious activity
  (window as any).reportSuspiciousActivity = (activity: string) => {
    console.error(`🚨 SECURITY ALERT: ${activity}`);
    // In production, you might want to send this to a monitoring service
  };
};

export default initializeWindowProtection;
