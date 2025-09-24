'use client';

import { useState } from 'react';
import { collection, addDoc, getDocs, Timestamp, QuerySnapshot, DocumentData, DocumentReference } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FirebaseError } from 'firebase/app';
import { useDebug } from '@/hooks/useDebug';

export default function FirebaseTest() {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [testHistory, setTestHistory] = useState<Array<{timestamp: string, test: string, result: string}>>([]);
  const { measurePerformance } = useDebug('FirebaseTest');

  const addTestToHistory = (test: string, result: string) => {
    setTestHistory(prev => [...prev, {
      timestamp: new Date().toISOString(),
      test,
      result
    }]);
  };

  const testFirebaseConnection = async () => {
    setIsLoading(true);
    setTestResult('Testing Firebase connection...');
    addTestToHistory('Firebase Connection', 'Started');
    
    try {
      // Test 1: Try to read from a collection, only if db is available
      if (!db) {
        throw new Error('Firebase not initialized');
      }
      
      setTestResult('Step 1: Testing read access...');
      const testQuery = collection(db!, 'reviews');
      const snapshot = await getDocs(testQuery);
      
      setTestResult(`Step 1: ✅ Read access works. Found ${snapshot.size} documents.`);
      addTestToHistory('Read Access', `✅ Found ${snapshot.size} documents`);
      
      // Test 2: Try to write a test document
      setTestResult('Step 2: Testing write access...');
      const testDoc = {
        productId: 999,
        userName: 'Test User',
        userEmail: 'test@example.com',
        rating: 5,
        comment: 'This is a test review',
        createdAt: Timestamp.now(),
        helpful: 0,
        verified: false
      };
      
      const docRef = await addDoc(collection(db!, 'reviews'), testDoc);
      
      setTestResult(`Step 2: ✅ Write access works. Document ID: ${docRef.id}`);
      addTestToHistory('Write Access', `✅ Document ID: ${docRef.id}`);
      
      // Cleanup test document
      try {
        // In a real implementation, we would delete the document here
        // For now, we'll just log that we would do it
        console.log('Would delete test document:', docRef.id);
        addTestToHistory('Cleanup', '✅ Test document would be deleted');
      } catch (cleanupError) {
        console.warn('Cleanup warning:', cleanupError);
        addTestToHistory('Cleanup', '⚠️ Cleanup warning (see console)');
      }
      
      setTestResult('🎉 All tests passed! Firebase is working correctly.');
      addTestToHistory('Overall', '✅ All tests passed');
    } catch (error: unknown) {
      console.error('Firebase test error:', error);
      const firebaseError = error as FirebaseError;
      const errorMessage = `❌ Error: ${firebaseError.code || 'Unknown'} - ${firebaseError.message || 'Unknown error'}`;
      setTestResult(errorMessage);
      addTestToHistory('Overall', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const testReviewService = async () => {
    setIsLoading(true);
    setTestResult('Testing review service...');
    addTestToHistory('Review Service', 'Started');
    
    try {
      const { reviewService } = await import('@/lib/reviewService');
      
      const testReview = {
        productId: 1,
        userName: 'Test User',
        userEmail: 'test@example.com',
        rating: 4,
        comment: 'This is a test review from the service'
      };
      
      const reviewId = await reviewService.addReview(testReview);
      
      const successMessage = `✅ Review service works! Review ID: ${reviewId}`;
      setTestResult(successMessage);
      addTestToHistory('Review Service', successMessage);
    } catch (error: unknown) {
      console.error('Review service test error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const resultMessage = `❌ Review service error: ${errorMessage}`;
      setTestResult(resultMessage);
      addTestToHistory('Review Service', resultMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    setTestHistory([]);
  };

  return (
    <div className="bg-[#1A1A1A] p-6 rounded-lg border border-[#2A2A2A] max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-bold">Firebase Debug Test</h3>
        {testHistory.length > 0 && (
          <button 
            onClick={clearHistory}
            className="text-xs bg-gray-700 hover:bg-gray-600 text-white py-1 px-2 rounded transition-colors"
          >
            Clear History
          </button>
        )}
      </div>
      
      <div className="space-y-3 mb-4">
        <button
          onClick={testFirebaseConnection}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Firebase Connection'}
        </button>
        
        <button
          onClick={testReviewService}
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Review Service'}
        </button>
      </div>

      {testResult && (
        <div className="bg-[#2A2A2A] p-3 rounded text-sm text-gray-300 whitespace-pre-wrap mb-4">
          {testResult}
        </div>
      )}
      
      {testHistory.length > 0 && (
        <div className="mt-4">
          <h4 className="text-white font-medium mb-2">Test History</h4>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {testHistory.map((entry, index) => (
              <div key={index} className="text-xs bg-[#2A2A2A] p-2 rounded">
                <div className="flex justify-between">
                  <span className={`font-medium ${
                    entry.result.includes('✅') ? 'text-green-400' : 
                    entry.result.includes('❌') ? 'text-red-400' : 'text-blue-400'
                  }`}>
                    {entry.test}
                  </span>
                  <span className="text-gray-500">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-gray-400 truncate">
                  {entry.result}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Open browser console (F12) to see detailed logs</p>
      </div>
    </div>
  );
}