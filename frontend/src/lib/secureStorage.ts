/**
 * Storage Encryption Utility
 * Provides obfuscation and encryption for sensitive data in localStorage/sessionStorage
 */

// Simple encryption key (in production, this should be more sophisticated)
const ENCRYPTION_KEY = 'v01d_3sp0rts_s3cur1ty_k3y_2024';

// Simple XOR cipher for obfuscation (not military-grade, but deters casual inspection)
const simpleEncrypt = (data: string): string => {
  let result = '';
  for (let i = 0; i < data.length; i++) {
    const charCode = data.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
    result += String.fromCharCode(charCode);
  }
  return btoa(result); // Base64 encode
};

const simpleDecrypt = (encrypted: string): string => {
  try {
    const decoded = atob(encrypted);
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch (e) {
    return encrypted; // Return as-is if decryption fails
  }
};

// Check if a key contains sensitive patterns
const isSensitiveKey = (key: string): boolean => {
  const sensitivePatterns = [
    /token/i,
    /auth/i,
    /key/i,
    /secret/i,
    /password/i,
    /credential/i,
    /jwt/i,
    /stripe/i,
    /api/i,
    /private/i,
    /access/i,
    /refresh/i,
  ];
  return sensitivePatterns.some((pattern) => pattern.test(key));
};

// Check if a value looks like sensitive data
const isSensitiveValue = (value: string): boolean => {
  // Check for common API key patterns
  const apiKeyPatterns = [
    /^[a-zA-Z0-9_-]{20,}$/, // Long alphanumeric strings
    /^pk_[a-zA-Z0-9]+/, // Stripe publishable key
    /^sk_[a-zA-Z0-9]+/, // Stripe secret key
    /^AIza[a-zA-Z0-9_-]+$/, // Google API key
    /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/, // JWT tokens
  ];
  return apiKeyPatterns.some((pattern) => pattern.test(value));
};

export const secureStorage = {
  /**
   * Set item in localStorage with automatic encryption for sensitive data
   */
  setItem: (key: string, value: string): void => {
    try {
      if (isSensitiveKey(key) || isSensitiveValue(value)) {
        // Encrypt sensitive data
        const encrypted = simpleEncrypt(value);
        localStorage.setItem(key, encrypted);
        // Also mark as encrypted for tracking
        localStorage.setItem(`${key}__encrypted`, 'true');
      } else {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Error setting item in secure storage:', error);
      // Fallback to regular storage
      localStorage.setItem(key, value);
    }
  },

  /**
   * Get item from localStorage with automatic decryption
   */
  getItem: (key: string): string | null => {
    try {
      const value = localStorage.getItem(key);
      if (value === null) return null;

      // Check if this key was marked as encrypted
      const isEncrypted = localStorage.getItem(`${key}__encrypted`) === 'true';
      
      if (isEncrypted || isSensitiveKey(key)) {
        // Try to decrypt
        return simpleDecrypt(value);
      }
      
      return value;
    } catch (error) {
      console.error('Error getting item from secure storage:', error);
      return localStorage.getItem(key);
    }
  },

  /**
   * Remove item from localStorage
   */
  removeItem: (key: string): void => {
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}__encrypted`);
  },

  /**
   * Clear all items from localStorage
   */
  clear: (): void => {
    localStorage.clear();
  },

  /**
   * Get all keys from localStorage
   */
  key: (index: number): string | null => {
    return localStorage.key(index);
  },

  /**
   * Get the number of items in localStorage
   */
  get length(): number {
    return localStorage.length;
  },

  /**
   * Set item in sessionStorage with automatic encryption for sensitive data
   */
  setSessionItem: (key: string, value: string): void => {
    try {
      if (isSensitiveKey(key) || isSensitiveValue(value)) {
        const encrypted = simpleEncrypt(value);
        sessionStorage.setItem(key, encrypted);
        sessionStorage.setItem(`${key}__encrypted`, 'true');
      } else {
        sessionStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Error setting item in secure session storage:', error);
      sessionStorage.setItem(key, value);
    }
  },

  /**
   * Get item from sessionStorage with automatic decryption
   */
  getSessionItem: (key: string): string | null => {
    try {
      const value = sessionStorage.getItem(key);
      if (value === null) return null;

      const isEncrypted = sessionStorage.getItem(`${key}__encrypted`) === 'true';
      
      if (isEncrypted || isSensitiveKey(key)) {
        return simpleDecrypt(value);
      }
      
      return value;
    } catch (error) {
      console.error('Error getting item from secure session storage:', error);
      return sessionStorage.getItem(key);
    }
  },

  /**
   * Remove item from sessionStorage
   */
  removeSessionItem: (key: string): void => {
    sessionStorage.removeItem(key);
    sessionStorage.removeItem(`${key}__encrypted`);
  },

  /**
   * Clear all items from sessionStorage
   */
  clearSession: (): void => {
    sessionStorage.clear();
  },
};

/**
 * Initialize storage protection
 * This monkey-patches localStorage and sessionStorage to automatically encrypt sensitive data
 */
export const initializeStorageProtection = (): void => {
  if (typeof window === 'undefined') return;

  // Protect localStorage
  const originalLocalStorageSetItem = Storage.prototype.setItem;
  const originalLocalStorageGetItem = Storage.prototype.getItem;

  Storage.prototype.setItem = function(this: Storage, key: string, value: string) {
    if (this === localStorage) {
      secureStorage.setItem(key, value);
    } else if (this === sessionStorage) {
      secureStorage.setSessionItem(key, value);
    } else {
      originalLocalStorageSetItem.call(this, key, value);
    }
  };

  Storage.prototype.getItem = function(this: Storage, key: string) {
    if (this === localStorage) {
      return secureStorage.getItem(key);
    } else if (this === sessionStorage) {
      return secureStorage.getSessionItem(key);
    }
    return originalLocalStorageGetItem.call(this, key);
  };
};

export default secureStorage;
