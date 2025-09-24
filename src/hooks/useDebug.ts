import { useState, useEffect } from 'react';

// Define types
interface DebugProps {
  [key: string]: any;
}

interface PerformanceResult<T> {
  duration: string;
  result: T;
}

// Debug hook for monitoring component lifecycle and performance
export const useDebug = (componentName: string, props?: DebugProps) => {
  const [mountTime] = useState(Date.now());
  
  // Log component mount
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Debug] ${componentName} mounted`, {
        timestamp: new Date().toISOString(),
        props: props || 'No props'
      });
    }
    
    return () => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Debug] ${componentName} unmounted`, {
          timestamp: new Date().toISOString(),
          lifetime: `${Date.now() - mountTime}ms`
        });
      }
    };
  }, [componentName, props, mountTime]);
  
  // Log props changes
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && props) {
      console.log(`[Debug] ${componentName} props updated`, {
        timestamp: new Date().toISOString(),
        props
      });
    }
  }, [props, componentName]);
  
  // Performance monitoring
  const measurePerformance = <T>(operation: string, fn: () => T): PerformanceResult<T> => {
    if (process.env.NODE_ENV !== 'development') {
      const result = fn();
      return { duration: '0ms', result };
    }
    
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    console.log(`[Debug] ${componentName} - ${operation}`, {
      duration: `${(end - start).toFixed(2)}ms`
    });
    
    return { duration: `${(end - start).toFixed(2)}ms`, result };
  };
  
  return { measurePerformance };
};

// Hook for monitoring state changes
export const useDebugState = <T>(initialState: T, stateName: string, componentName: string) => {
  const [state, setState] = useState<T>(initialState);
  
  const debugSetState = (newState: T | ((prevState: T) => T)) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Debug] ${componentName} - ${stateName} updated`, {
        timestamp: new Date().toISOString(),
        oldValue: state,
        newValue: typeof newState === 'function' ? '[function]' : newState
      });
    }
    setState(newState);
  };
  
  return [state, debugSetState] as const;
};

// Hook for monitoring Firebase operations
export const useFirebaseDebug = () => {
  const logOperation = (operation: string, collection: string, details?: DebugProps) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Firebase Debug] ${operation} on ${collection}`, {
        timestamp: new Date().toISOString(),
        ...details
      });
    }
  };
  
  return { logOperation };
};