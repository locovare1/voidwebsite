"use client";

import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { reviewService } from '@/lib/reviewService';
import { collection, getDocs, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';

// Define types
export interface DebugLogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug' | 'trace';
  category: string;
  message: string;
  details?: any;
  component?: string;
}

export interface DebugTestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  logs: DebugLogEntry[];
  result?: any;
  error?: string;
}

export interface DebugPerformanceMetrics {
  memory: {
    used: number;
    total: number;
    limit: number;
  } | null;
  navigation: PerformanceNavigationTiming | null;
  resources: number;
  fps: number;
  frameTime: number;
  cpu: number | null;
}

export interface DebugState {
  logs: DebugLogEntry[];
  tests: DebugTestResult[];
  performance: DebugPerformanceMetrics;
  systemStatus: {
    network: 'unknown' | 'connected' | 'disconnected';
    firebase: 'unknown' | 'connected' | 'disconnected';
    reviewService: 'unknown' | 'connected' | 'disconnected';
  };
  isMonitoring: boolean;
  activeTests: string[];
}

type DebugAction =
  | { type: 'ADD_LOG'; payload: DebugLogEntry }
  | { type: 'CLEAR_LOGS' }
  | { type: 'START_TEST'; payload: { id: string; name: string } }
  | { type: 'UPDATE_TEST'; payload: { id: string; status: 'running' | 'success' | 'failed'; result?: any; error?: string } }
  | { type: 'END_TEST'; payload: { id: string; result?: any; error?: string } }
  | { type: 'UPDATE_PERFORMANCE'; payload: DebugPerformanceMetrics }
  | { type: 'UPDATE_SYSTEM_STATUS'; payload: Partial<DebugState['systemStatus']> }
  | { type: 'START_MONITORING' }
  | { type: 'STOP_MONITORING' }
  | { type: 'ADD_ACTIVE_TEST'; payload: string }
  | { type: 'REMOVE_ACTIVE_TEST'; payload: string };

const initialState: DebugState = {
  logs: [],
  tests: [],
  performance: {
    memory: null,
    navigation: null,
    resources: 0,
    fps: 60,
    frameTime: 16.67,
    cpu: null,
  },
  systemStatus: {
    network: 'unknown',
    firebase: 'unknown',
    reviewService: 'unknown',
  },
  isMonitoring: false,
  activeTests: [],
};

function debugReducer(state: DebugState, action: DebugAction): DebugState {
  switch (action.type) {
    case 'ADD_LOG':
      return {
        ...state,
        logs: [action.payload, ...state.logs.slice(0, 999)], // Keep only last 1000 logs
      };
    
    case 'CLEAR_LOGS':
      return {
        ...state,
        logs: [],
      };
    
    case 'START_TEST':
      return {
        ...state,
        tests: [
          {
            id: action.payload.id,
            name: action.payload.name,
            status: 'running',
            startTime: new Date(),
            logs: [],
          },
          ...state.tests,
        ],
        activeTests: [...state.activeTests, action.payload.id],
      };
    
    case 'UPDATE_TEST':
      return {
        ...state,
        tests: state.tests.map(test =>
          test.id === action.payload.id
            ? {
                ...test,
                status: action.payload.status,
                result: action.payload.result,
                error: action.payload.error,
              }
            : test
        ),
      };
    
    case 'END_TEST':
      return {
        ...state,
        tests: state.tests.map(test =>
          test.id === action.payload.id
            ? {
                ...test,
                status: action.payload.error ? 'failed' : 'success',
                endTime: new Date(),
                duration: new Date().getTime() - test.startTime.getTime(),
                result: action.payload.result,
                error: action.payload.error,
              }
            : test
        ),
        activeTests: state.activeTests.filter(id => id !== action.payload.id),
      };
    
    case 'UPDATE_PERFORMANCE':
      return {
        ...state,
        performance: action.payload,
      };
    
    case 'UPDATE_SYSTEM_STATUS':
      return {
        ...state,
        systemStatus: {
          ...state.systemStatus,
          ...action.payload,
        },
      };
    
    case 'START_MONITORING':
      return {
        ...state,
        isMonitoring: true,
      };
    
    case 'STOP_MONITORING':
      return {
        ...state,
        isMonitoring: false,
      };
    
    case 'ADD_ACTIVE_TEST':
      return {
        ...state,
        activeTests: [...state.activeTests, action.payload],
      };
    
    case 'REMOVE_ACTIVE_TEST':
      return {
        ...state,
        activeTests: state.activeTests.filter(id => id !== action.payload),
      };
    
    default:
      return state;
  }
}

interface DebugContextType extends DebugState {
  addLog: (entry: Omit<DebugLogEntry, 'id'>) => void;
  clearLogs: () => void;
  startTest: (name: string) => string;
  updateTest: (id: string, status: 'running' | 'success' | 'failed', result?: any, error?: string) => void;
  endTest: (id: string, result?: any, error?: string) => void;
  updatePerformance: (metrics: DebugPerformanceMetrics) => void;
  updateSystemStatus: (status: Partial<DebugState['systemStatus']>) => void;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  runTest: (name: string, testFn: () => Promise<any>) => Promise<void>;
  runAllTests: () => Promise<void>;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export function DebugProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(debugReducer, initialState);
  const fpsRef = useRef<{ frameCount: number; lastTime: number; fps: number }>({
    frameCount: 0,
    lastTime: performance.now(),
    fps: 60,
  });

  const addLog = (entry: Omit<DebugLogEntry, 'id'>) => {
    dispatch({
      type: 'ADD_LOG',
      payload: {
        id: Math.random().toString(36).substring(2, 11),
        ...entry,
      },
    });
  };

  const clearLogs = () => {
    dispatch({ type: 'CLEAR_LOGS' });
  };

  const startTest = (name: string): string => {
    const id = Math.random().toString(36).substring(2, 11);
    dispatch({ type: 'START_TEST', payload: { id, name } });
    addLog({
      timestamp: new Date(),
      level: 'info',
      category: 'test',
      message: `Starting test: ${name}`,
      component: 'DebugProvider',
    });
    return id;
  };

  const updateTest = (id: string, status: 'running' | 'success' | 'failed', result?: any, error?: string) => {
    dispatch({ type: 'UPDATE_TEST', payload: { id, status, result, error } });
  };

  const endTest = (id: string, result?: any, error?: string) => {
    dispatch({ type: 'END_TEST', payload: { id, result, error } });
    const test = state.tests.find(t => t.id === id);
    if (test) {
      addLog({
        timestamp: new Date(),
        level: error ? 'error' : 'info',
        category: 'test',
        message: `Test ${test.name} ${error ? 'failed' : 'completed'}${error ? `: ${error}` : ''}`,
        component: 'DebugProvider',
        details: {
          duration: test.duration,
          result,
        },
      });
    }
  };

  const updatePerformance = (metrics: DebugPerformanceMetrics) => {
    dispatch({ type: 'UPDATE_PERFORMANCE', payload: metrics });
  };

  const updateSystemStatus = (status: Partial<DebugState['systemStatus']>) => {
    dispatch({ type: 'UPDATE_SYSTEM_STATUS', payload: status });
  };

  const startMonitoring = () => {
    dispatch({ type: 'START_MONITORING' });
  };

  const stopMonitoring = () => {
    dispatch({ type: 'STOP_MONITORING' });
  };

  // Enhanced test runner with error handling
  const runTest = async (name: string, testFn: () => Promise<any>) => {
    const testId = startTest(name);
    try {
      const result = await testFn();
      endTest(testId, result);
    } catch (error: any) {
      endTest(testId, null, error.message || 'Unknown error');
      throw error;
    }
  };

  // Test Firebase connectivity
  const testFirebaseConnection = async () => {
    return runTest('Firebase Connection', async () => {
      updateSystemStatus({ firebase: 'unknown' });
      
      if (!db) {
        throw new Error('Firebase not initialized');
      }
      
      try {
        // Test read access
        const testQuery = collection(db, 'reviews');
        const startTime = performance.now();
        const snapshot = await getDocs(testQuery);
        const endTime = performance.now();
        
        // Test write access
        const testDoc = {
          productId: 999,
          userName: 'Debug Test User',
          userEmail: 'debug@example.com',
          rating: 5,
          comment: 'Debug test review',
          createdAt: Timestamp.now(),
          helpful: 0,
          verified: false
        };
        
        const writeStartTime = performance.now();
        const docRef = await addDoc(collection(db, 'reviews'), testDoc);
        const writeEndTime = performance.now();
        
        // Cleanup - delete the test document
        await deleteDoc(doc(db, 'reviews', docRef.id));
        
        updateSystemStatus({ firebase: 'connected' });
        return {
          documentCount: snapshot.size,
          readTime: `${(endTime - startTime).toFixed(2)}ms`,
          writeTime: `${(writeEndTime - writeStartTime).toFixed(2)}ms`,
          testDocumentId: docRef.id,
        };
      } catch (error: any) {
        updateSystemStatus({ firebase: 'disconnected' });
        throw error;
      }
    });
  };

  // Test Review Service
  const testReviewService = async () => {
    return runTest('Review Service', async () => {
      try {
        // Test adding a review
        const startTime = performance.now();
        const reviewId = await reviewService.addReview({
          productId: 1,
          userName: 'Service Test User',
          userEmail: 'service@example.com',
          rating: 4,
          comment: 'Service test review'
        });
        const endTime = performance.now();
        
        // Test getting reviews
        const getStartTime = performance.now();
        const reviews = await reviewService.getProductReviews(1);
        const getEndTime = performance.now();
        
        // Test getting stats
        const statsStartTime = performance.now();
        const stats = await reviewService.getReviewStats(1);
        const statsEndTime = performance.now();
        
        return {
          addReview: {
            reviewId,
            responseTime: `${(endTime - startTime).toFixed(2)}ms`
          },
          getReviews: {
            reviewCount: reviews.length,
            responseTime: `${(getEndTime - getStartTime).toFixed(2)}ms`
          },
          getStats: {
            totalReviews: stats.totalReviews,
            averageRating: stats.averageRating,
            responseTime: `${(statsEndTime - statsStartTime).toFixed(2)}ms`
          }
        };
      } catch (error: any) {
        throw error;
      }
    });
  };

  // Test Network Status
  const testNetworkStatus = async () => {
    return runTest('Network Status', async () => {
      try {
        const startTime = performance.now();
        const response = await fetch('https://httpbin.org/get', { 
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache'
        });
        const endTime = performance.now();
        
        if (response.ok) {
          updateSystemStatus({ network: 'connected' });
          return {
            responseTime: `${(endTime - startTime).toFixed(2)}ms`,
            status: response.status
          };
        } else {
          updateSystemStatus({ network: 'disconnected' });
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error: any) {
        updateSystemStatus({ network: 'disconnected' });
        throw error;
      }
    });
  };

  // Test All Systems
  const runAllTests = async () => {
    try {
      await Promise.all([
        testNetworkStatus(),
        testFirebaseConnection(),
        testReviewService(),
      ]);
    } catch (error) {
      console.error('Error running all tests:', error);
      throw error;
    }
  };

  // Performance monitoring
  useEffect(() => {
    if (!state.isMonitoring) return;

    const monitorPerformance = () => {
      const metrics: DebugPerformanceMetrics = {
        memory: (performance as any).memory ? {
          used: Math.round((performance as any).memory.usedJSHeapSize / 1048576 * 100) / 100,
          total: Math.round((performance as any).memory.totalJSHeapSize / 1048576 * 100) / 100,
          limit: Math.round((performance as any).memory.jsHeapSizeLimit / 1048576 * 100) / 100
        } : null,
        navigation: performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming || null,
        resources: performance.getEntriesByType('resource').length,
        fps: fpsRef.current.fps,
        frameTime: 1000 / fpsRef.current.fps,
        cpu: null, // Would require more complex implementation
      };
      updatePerformance(metrics);
    };

    // FPS monitoring
    let frameId: number;
    const measureFPS = (currentTime: number) => {
      fpsRef.current.frameCount++;
      
      if (currentTime - fpsRef.current.lastTime >= 1000) {
        fpsRef.current.fps = Math.round((fpsRef.current.frameCount * 1000) / (currentTime - fpsRef.current.lastTime));
        fpsRef.current.frameCount = 0;
        fpsRef.current.lastTime = currentTime;
      }
      
      frameId = requestAnimationFrame(measureFPS);
    };
    
    frameId = requestAnimationFrame(measureFPS);
    
    const interval = setInterval(monitorPerformance, 1000);
    return () => {
      clearInterval(interval);
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [state.isMonitoring]);

  return (
    <DebugContext.Provider
      value={{
        ...state,
        addLog,
        clearLogs,
        startTest,
        updateTest,
        endTest,
        updatePerformance,
        updateSystemStatus,
        startMonitoring,
        stopMonitoring,
        runTest,
        runAllTests,
      }}
    >
      {children}
    </DebugContext.Provider>
  );
}

export function useDebug() {
  const context = useContext(DebugContext);
  if (context === undefined) {
    throw new Error('useDebug must be used within a DebugProvider');
  }
  return context;
}