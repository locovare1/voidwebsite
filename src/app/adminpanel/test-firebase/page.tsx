"use client";

import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function FirebaseTestPage() {
  const [testResult, setTestResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testFirebaseOperations = async () => {
    if (!db) {
      setTestResult('Firebase not initialized');
      return;
    }

    setIsLoading(true);
    setTestResult('Testing Firebase operations...');

    try {
      // 1. Test creating a document
      setTestResult('1. Creating test document...');
      const testDoc = {
        name: 'Test Document',
        createdAt: new Date().toISOString(),
        testField: 'test-value'
      };

      const docRef = await addDoc(collection(db, 'test-collection'), testDoc);
      setTestResult(`1. Created document with ID: ${docRef.id}`);

      // 2. Test reading documents
      setTestResult('2. Reading documents...');
      const q = query(collection(db, 'test-collection'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      setTestResult(`2. Found ${querySnapshot.size} documents`);

      // 3. Test updating the document
      setTestResult('3. Updating document...');
      await updateDoc(doc(db, 'test-collection', docRef.id), {
        updatedAt: new Date().toISOString(),
        testField: 'updated-value'
      });
      setTestResult('3. Document updated successfully');

      // 4. Test deleting the document
      setTestResult('4. Deleting document...');
      await deleteDoc(doc(db, 'test-collection', docRef.id));
      setTestResult('4. Document deleted successfully');

      setTestResult('✅ All Firebase operations completed successfully!');
    } catch (error) {
      console.error('Firebase test error:', error);
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Firebase Test</h1>
        
        <div className="bg-[#1A1A1A] rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Firebase Operations</h2>
          <p className="text-gray-400 mb-4">
            This test will create, read, update, and delete a test document in Firebase.
          </p>
          
          <button
            onClick={testFirebaseOperations}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Run Firebase Test'}
          </button>
        </div>

        {testResult && (
          <div className="bg-[#1A1A1A] rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="bg-[#0F0F0F] p-4 rounded-lg">
              <pre className="whitespace-pre-wrap">{testResult}</pre>
            </div>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-500">
          <p>Check the browser console for detailed logs.</p>
        </div>
      </div>
    </div>
  );
}