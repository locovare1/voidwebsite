'use client';

import { useState } from 'react';
import { collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FirebaseError } from 'firebase/app';

export default function FirebaseTest() {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testFirebaseConnection = async () => {
    setIsLoading(true);
    setTestResult('Testing Firebase connection...');
    
    try {
      // Test 1: Try to read from a collection
      setTestResult('Step 1: Testing read access...');
      const testQuery = collection(db, 'reviews');
      const snapshot = await getDocs(testQuery);
      setTestResult(`Step 1: ✅ Read access works. Found ${snapshot.size} documents.`);
      
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
      
      const docRef = await addDoc(collection(db, 'reviews'), testDoc);
      setTestResult(`Step 2: ✅ Write access works. Document ID: ${docRef.id}`);
      
      setTestResult('🎉 All tests passed! Firebase is working correctly.');
    } catch (error: unknown) {
      console.error('Firebase test error:', error);
      const firebaseError = error as FirebaseError;
      setTestResult(`❌ Error: ${firebaseError.code || 'Unknown'} - ${firebaseError.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testReviewService = async () => {
    setIsLoading(true);
    setTestResult('Testing review service...');
    
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
      setTestResult(`✅ Review service works! Review ID: ${reviewId}`);
    } catch (error: unknown) {
      console.error('Review service test error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setTestResult(`❌ Review service error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#1A1A1A] p-6 rounded-lg border border-[#2A2A2A] max-w-md">
      <h3 className="text-white font-bold mb-4">Firebase Debug Test</h3>
      
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
        <div className="bg-[#2A2A2A] p-3 rounded text-sm text-gray-300 whitespace-pre-wrap">
          {testResult}
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Open browser console (F12) to see detailed logs</p>
      </div>
    </div>
  );
}