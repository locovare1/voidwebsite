import { useState, useEffect, useRef, useCallback } from 'react';
import { useDebug as useDebugContext } from '@/contexts/DebugContext';

// Define types
interface DebugProps {
  [key: string]: any;
}

interface PerformanceResult<T> {
  duration: string;
  result: T;
}

interface DebugHookOptions {
  enableLogging?: boolean;
  enablePerformance?: boolean;
  enableLifecycle?: boolean;
  enablePropsTracking?: boolean;
}

const defaultOptions: DebugHookOptions = {
  enableLogging: true,
  enablePerformance: true,
  enableLifecycle: true,
  enablePropsTracking: true,
};

// Enhanced debug hook for monitoring component lifecycle and performance
export const useDebug = (componentName: string, props?: DebugProps, options: DebugHookOptions = defaultOptions) => {
  const [mountTime] = useState(Date.now());
  const debugContext = useDebugContext();
  
  // Log component mount
  useEffect(() => {
    if (options.enableLifecycle && process.env.NODE_ENV === 'development') {
      const mountInfo = {
        timestamp: new Date().toISOString(),
        props: props || 'No props',
        component: componentName
      };
      
      console.log(`[Debug] ${componentName} mounted`, mountInfo);
      debugContext.addLog({
        timestamp: new Date(),
        level: 'info',
        category: 'lifecycle',
        message: `${componentName} mounted`,
        details: mountInfo,
        component: componentName
      });
    }
    
    return () => {
      if (options.enableLifecycle && process.env.NODE_ENV === 'development') {
        const unmountInfo = {
          timestamp: new Date().toISOString(),
          lifetime: `${Date.now() - mountTime}ms`,
          component: componentName
        };
        
        console.log(`[Debug] ${componentName} unmounted`, unmountInfo);
        debugContext.addLog({
          timestamp: new Date(),
          level: 'info',
          category: 'lifecycle',
          message: `${componentName} unmounted`,
          details: unmountInfo,
          component: componentName
        });
      }
    };
  }, [componentName, props, mountTime, options.enableLifecycle, debugContext]);
  
  // Log props changes
  useEffect(() => {
    if (options.enablePropsTracking && process.env.NODE_ENV === 'development' && props) {
      const propsInfo = {
        timestamp: new Date().toISOString(),
        props,
        component: componentName
      };
      
      console.log(`[Debug] ${componentName} props updated`, propsInfo);
      debugContext.addLog({
        timestamp: new Date(),
        level: 'debug',
        category: 'props',
        message: `${componentName} props updated`,
        details: propsInfo,
        component: componentName
      });
    }
  }, [props, componentName, options.enablePropsTracking, debugContext]);
  
  // Performance monitoring
  const measurePerformance = <T>(operation: string, fn: () => T): PerformanceResult<T> => {
    if (!options.enablePerformance || process.env.NODE_ENV !== 'development') {
      const result = fn();
      return { duration: '0ms', result };
    }
    
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    const duration = `${(end - start).toFixed(2)}ms`;
    const perfInfo = {
      duration,
      component: componentName,
      operation
    };
    
    console.log(`[Debug] ${componentName} - ${operation}`, perfInfo);
    debugContext.addLog({
      timestamp: new Date(),
      level: 'debug',
      category: 'performance',
      message: `${componentName} - ${operation}`,
      details: perfInfo,
      component: componentName
    });
    
    return { duration, result };
  };
  
  // Custom logging
  const log = useCallback((level: 'info' | 'warn' | 'error' | 'debug' | 'trace', message: string, details?: any) => {
    if (!options.enableLogging || process.env.NODE_ENV !== 'development') return;
    
    const logInfo = {
      timestamp: new Date().toISOString(),
      message,
      details,
      component: componentName
    };
    
    console.log(`[${level.toUpperCase()}] ${componentName} - ${message}`, logInfo);
    debugContext.addLog({
      timestamp: new Date(),
      level,
      category: 'custom',
      message,
      details: logInfo,
      component: componentName
    });
  }, [componentName, options.enableLogging, debugContext]);
  
  return { measurePerformance, log };
};

// Hook for monitoring state changes with enhanced debugging
export const useDebugState = <T>(initialState: T, stateName: string, componentName: string, options: DebugHookOptions = defaultOptions) => {
  const [state, setState] = useState<T>(initialState);
  const debugContext = useDebugContext();
  
  const debugSetState = (newState: T | ((prevState: T) => T)) => {
    if (options.enableLogging && process.env.NODE_ENV === 'development') {
      const stateInfo = {
        timestamp: new Date().toISOString(),
        oldValue: state,
        newValue: typeof newState === 'function' ? '[function]' : newState,
        stateName,
        component: componentName
      };
      
      console.log(`[Debug] ${componentName} - ${stateName} updated`, stateInfo);
      debugContext.addLog({
        timestamp: new Date(),
        level: 'debug',
        category: 'state',
        message: `${componentName} - ${stateName} updated`,
        details: stateInfo,
        component: componentName
      });
    }
    setState(newState);
  };
  
  return [state, debugSetState] as const;
};

// Hook for monitoring Firebase operations with enhanced debugging
export const useFirebaseDebug = (componentName: string, options: DebugHookOptions = defaultOptions) => {
  const debugContext = useDebugContext();
  
  const logOperation = (operation: string, collection: string, details?: DebugProps) => {
    if (options.enableLogging && process.env.NODE_ENV === 'development') {
      const firebaseInfo = {
        timestamp: new Date().toISOString(),
        operation,
        collection,
        ...details,
        component: componentName
      };
      
      console.log(`[Firebase Debug] ${operation} on ${collection}`, firebaseInfo);
      debugContext.addLog({
        timestamp: new Date(),
        level: 'debug',
        category: 'firebase',
        message: `${operation} on ${collection}`,
        details: firebaseInfo,
        component: componentName
      });
    }
  };
  
  return { logOperation };
};

// Hook for advanced performance profiling
export const usePerformanceProfiler = (componentName: string) => {
  const debugContext = useDebugContext();
  const measurementsRef = useRef<Record<string, number[]>>({});
  
  const startMeasurement = (name: string) => {
    if (process.env.NODE_ENV !== 'development') return;
    
    performance.mark(`${componentName}-${name}-start`);
  };
  
  const endMeasurement = (name: string) => {
    if (process.env.NODE_ENV !== 'development') return;
    
    performance.mark(`${componentName}-${name}-end`);
    const measure = performance.measure(
      `${componentName}-${name}`,
      `${componentName}-${name}-start`,
      `${componentName}-${name}-end`
    );
    
    // Store measurement for statistics
    if (!measurementsRef.current[name]) {
      measurementsRef.current[name] = [];
    }
    measurementsRef.current[name].push(measure.duration);
    
    // Keep only last 100 measurements
    if (measurementsRef.current[name].length > 100) {
      measurementsRef.current[name] = measurementsRef.current[name].slice(-100);
    }
    
    const measurements = measurementsRef.current[name];
    const avg = measurements.reduce((a, b) => a + b, 0) / measurements.length;
    const min = Math.min(...measurements);
    const max = Math.max(...measurements);
    
    const perfInfo = {
      name,
      duration: measure.duration,
      average: avg,
      min,
      max,
      count: measurements.length,
      component: componentName
    };
    
    debugContext.addLog({
      timestamp: new Date(),
      level: 'debug',
      category: 'profiling',
      message: `Performance measurement: ${name}`,
      details: perfInfo,
      component: componentName
    });
    
    return measure.duration;
  };
  
  const getMeasurements = () => {
    return measurementsRef.current;
  };
  
  return { startMeasurement, endMeasurement, getMeasurements };
};

// Hook for memory usage monitoring
export const useMemoryMonitor = (componentName: string, intervalMs: number = 5000) => {
  const debugContext = useDebugContext();
  
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    const monitorMemory = () => {
      if ((performance as any).memory) {
        const memory = {
          used: Math.round((performance as any).memory.usedJSHeapSize / 1048576 * 100) / 100,
          total: Math.round((performance as any).memory.totalJSHeapSize / 1048576 * 100) / 100,
          limit: Math.round((performance as any).memory.jsHeapSizeLimit / 1048576 * 100) / 100,
          component: componentName
        };
        
        debugContext.addLog({
          timestamp: new Date(),
          level: 'debug',
          category: 'memory',
          message: `Memory usage`,
          details: memory,
          component: componentName
        });
      }
    };
    
    monitorMemory();
    const interval = setInterval(monitorMemory, intervalMs);
    
    return () => clearInterval(interval);
  }, [componentName, intervalMs, debugContext]);
};