'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { reviewService } from '@/lib/reviewService';
import { collection, getDocs, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';

// Define types for our state and functions
interface TestResult {
  test: string;
  result: string;
  details: Record<string, any> | null;
  timestamp: string;
}

interface PerformanceMetrics {
  memory: {
    used: number;
    total: number;
    limit: number;
  } | 'N/A';
  navigation: any;
  resources: number;
}

export default function AdvancedDebug() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [networkStatus, setNetworkStatus] = useState('Unknown');
  const [firebaseStatus, setFirebaseStatus] = useState('Unknown');
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    memory: 'N/A',
    navigation: {},
    resources: 0
  });

  const addTestResult = (test: string, result: string, details: Record<string, any> | null = null) => {
    setTestResults(prev => [...prev, { test, result, details, timestamp: new Date().toISOString() }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  // Test Firebase connectivity
  const testFirebaseConnection = async () => {
    setIsLoading(true);
    addTestResult('Firebase Connection', 'Testing...', {});
    
    try {
      if (!db) {
        throw new Error('Firebase not initialized');
      }
      
      // Test read access
      addTestResult('Firebase Read Test', 'Testing...', {});
      const testQuery = collection(db, 'reviews');
      const startTime = performance.now();
      const snapshot = await getDocs(testQuery);
      const endTime = performance.now();
      
      addTestResult('Firebase Read Test', '✅ Success', {
        documentCount: snapshot.size,
        responseTime: `${(endTime - startTime).toFixed(2)}ms`
      });
      
      // Test write access
      addTestResult('Firebase Write Test', 'Testing...', {});
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
      
      addTestResult('Firebase Write Test', '✅ Success', {
        documentId: docRef.id,
        responseTime: `${(writeEndTime - writeStartTime).toFixed(2)}ms`
      });
      
      // Cleanup - delete the test document
      await deleteDoc(doc(db, 'reviews', docRef.id));
      addTestResult('Firebase Cleanup', '✅ Test document deleted', { documentId: docRef.id });
      
      addTestResult('Firebase Connection', '✅ All tests passed', {});
      setFirebaseStatus('Connected');
    } catch (error: any) {
      console.error('Firebase test error:', error);
      addTestResult('Firebase Connection', '❌ Failed', { 
        error: error.message || 'Unknown error',
        code: error.code || 'N/A'
      });
      setFirebaseStatus('Disconnected');
    } finally {
      setIsLoading(false);
    }
  };

  // Test Review Service
  const testReviewService = async () => {
    setIsLoading(true);
    addTestResult('Review Service', 'Testing...', {});
    
    try {
      // Test adding a review
      addTestResult('Review Service - Add', 'Testing...', {});
      const startTime = performance.now();
      const reviewId = await reviewService.addReview({
        productId: 1,
        userName: 'Service Test User',
        userEmail: 'service@example.com',
        rating: 4,
        comment: 'Service test review'
      });
      const endTime = performance.now();
      
      addTestResult('Review Service - Add', '✅ Success', {
        reviewId,
        responseTime: `${(endTime - startTime).toFixed(2)}ms`
      });
      
      // Test getting reviews
      addTestResult('Review Service - Get Reviews', 'Testing...', {});
      const getStartTime = performance.now();
      const reviews = await reviewService.getProductReviews(1);
      const getEndTime = performance.now();
      
      addTestResult('Review Service - Get Reviews', '✅ Success', {
        reviewCount: reviews.length,
        responseTime: `${(getEndTime - getStartTime).toFixed(2)}ms`
      });
      
      // Test getting stats
      addTestResult('Review Service - Get Stats', 'Testing...', {});
      const statsStartTime = performance.now();
      const stats = await reviewService.getReviewStats(1);
      const statsEndTime = performance.now();
      
      addTestResult('Review Service - Get Stats', '✅ Success', {
        totalReviews: stats.totalReviews,
        averageRating: stats.averageRating,
        responseTime: `${(statsEndTime - statsStartTime).toFixed(2)}ms`
      });
      
      addTestResult('Review Service', '✅ All tests passed', {});
    } catch (error: any) {
      console.error('Review service test error:', error);
      addTestResult('Review Service', '❌ Failed', { 
        error: error.message || 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test Network Status
  const testNetworkStatus = async () => {
    addTestResult('Network Status', 'Testing...', {});
    
    try {
      const startTime = performance.now();
      const response = await fetch('https://httpbin.org/get', { 
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache'
      });
      const endTime = performance.now();
      
      if (response.ok) {
        setNetworkStatus('Connected');
        addTestResult('Network Status', '✅ Connected', {
          responseTime: `${(endTime - startTime).toFixed(2)}ms`,
          status: response.status
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error: any) {
      setNetworkStatus('Disconnected');
      addTestResult('Network Status', '❌ Disconnected', { 
        error: error.message || 'Unknown error'
      });
    }
  };

  // Test All Systems
  const testAllSystems = async () => {
    clearResults();
    await testNetworkStatus();
    await testFirebaseConnection();
    await testReviewService();
  };

  // Performance Monitoring
  useEffect(() => {
    const monitorPerformance = () => {
      const metrics: PerformanceMetrics = {
        memory: (performance as any).memory ? {
          used: Math.round((performance as any).memory.usedJSHeapSize / 1048576 * 100) / 100,
          total: Math.round((performance as any).memory.totalJSHeapSize / 1048576 * 100) / 100,
          limit: Math.round((performance as any).memory.jsHeapSizeLimit / 1048576 * 100) / 100
        } : 'N/A',
        navigation: performance.getEntriesByType('navigation')[0] || {},
        resources: performance.getEntriesByType('resource').length
      };
      setPerformanceMetrics(metrics);
    };

    monitorPerformance();
    const interval = setInterval(monitorPerformance, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#1A1A1A] p-6 rounded-lg border border-[#2A2A2A]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-white font-bold text-xl">Advanced Debug System</h3>
        <button
          onClick={clearResults}
          className="bg-gray-700 hover:bg-gray-600 text-white py-1 px-3 rounded text-sm transition-colors"
        >
          Clear Results
        </button>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#2A2A2A] p-4 rounded-lg">
          <div className="text-gray-400 text-sm">Network</div>
          <div className={`text-lg font-bold ${networkStatus === 'Connected' ? 'text-green-400' : 'text-red-400'}`}>
            {networkStatus}
          </div>
        </div>
        <div className="bg-[#2A2A2A] p-4 rounded-lg">
          <div className="text-gray-400 text-sm">Firebase</div>
          <div className={`text-lg font-bold ${firebaseStatus === 'Connected' ? 'text-green-400' : 'text-red-400'}`}>
            {firebaseStatus}
          </div>
        </div>
        <div className="bg-[#2A2A2A] p-4 rounded-lg">
          <div className="text-gray-400 text-sm">Performance</div>
          <div className="text-lg font-bold text-blue-400">
            {performanceMetrics.resources ? `${performanceMetrics.resources} resources` : 'N/A'}
          </div>
        </div>
      </div>

      {/* Test Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <button
          onClick={testNetworkStatus}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Network'}
        </button>
        
        <button
          onClick={testFirebaseConnection}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Firebase'}
        </button>
        
        <button
          onClick={testReviewService}
          disabled={isLoading}
          className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Review Service'}
        </button>
        
        <button
          onClick={testAllSystems}
          disabled={isLoading}
          className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test All Systems'}
        </button>
      </div>

      {/* Performance Metrics */}
      <div className="bg-[#2A2A2A] p-4 rounded-lg mb-6">
        <h4 className="text-white font-bold mb-3">Performance Metrics</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {performanceMetrics.memory !== 'N/A' && (
            <div>
              <div className="text-gray-400">Memory Usage</div>
              <div className="text-white">
                {typeof performanceMetrics.memory !== 'string' && `${performanceMetrics.memory.used} MB / ${performanceMetrics.memory.total} MB`}
              </div>
            </div>
          )}
          <div>
            <div className="text-gray-400">Resources Loaded</div>
            <div className="text-white">{performanceMetrics.resources || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Test Results */}
      <div>
        <h4 className="text-white font-bold mb-3">Test Results</h4>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {testResults.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No test results yet. Run a test to see results here.
            </div>
          ) : (
            testResults.map((result, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border ${
                  result.result.includes('✅') 
                    ? 'bg-green-900/20 border-green-800/30' 
                    : result.result.includes('❌') 
                      ? 'bg-red-900/20 border-red-800/30' 
                      : 'bg-blue-900/20 border-blue-800/30'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-white">{result.test}</div>
                    <div className={`mt-1 ${result.result.includes('✅') ? 'text-green-400' : result.result.includes('❌') ? 'text-red-400' : 'text-blue-400'}`}>
                      {result.result}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                {result.details && (
                  <div className="mt-2 text-sm text-gray-300">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 pt-4 border-t border-[#2A2A2A]">
        <h4 className="text-white font-bold mb-2">Debugging Instructions</h4>
        <ul className="text-gray-400 text-sm space-y-1">
          <li>{'\u2022'} Run individual tests to check specific system components</li>
          <li>{'\u2022'} Use &quot;Test All Systems&quot; to run a comprehensive diagnostic</li>
          <li>{'\u2022'} Check browser console (F12) for detailed error logs</li>
          <li>{'\u2022'} Monitor performance metrics for resource usage</li>
          <li>{'\u2022'} Clear results to start fresh testing sessions</li>
        </ul>
      </div>
    </div>
  );
}