"use client";

import { useState } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { generateOrderNumber } from '@/lib/orderUtils';

export default function OrderTestButton() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<string>('');

  const testFirebaseConnection = async () => {
    setTesting(true);
    setResult('Testing Firebase connection...');

    try {
      // Generate test order
      const testOrderId = generateOrderNumber();
      const testOrder = {
        id: testOrderId,
        items: [
          {
            id: 1,
            name: 'Test Item',
            price: 0,
            quantity: 1,
            image: '/placeholder.jpg'
          }
        ],
        total: 0,
        customerInfo: {
          name: 'Test Customer',
          email: 'test@example.com',
          address: 'Test Address',
          zipCode: '12345',
          phone: '555-0123'
        },
        status: 'pending' as const,
        createdAt: new Date().toISOString()
      };

      // Try to save to Firebase
      await setDoc(doc(db, 'orders', testOrderId), {
        ...testOrder,
        createdAt: new Date()
      });

      // Try to read it back
      const docSnap = await getDoc(doc(db, 'orders', testOrderId));
      
      if (docSnap.exists()) {
        setResult(`✅ Firebase connection successful! Test order created: ${testOrderId}`);
      } else {
        setResult('❌ Order was not found after creation');
      }
    } catch (error) {
      console.error('Firebase test error:', error);
      setResult(`❌ Firebase connection failed: ${error}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="p-4 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] mb-4">
      <h3 className="text-white font-semibold mb-2">Firebase Connection Test</h3>
      <button
        onClick={testFirebaseConnection}
        disabled={testing}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 mb-2"
      >
        {testing ? 'Testing...' : 'Test Firebase Connection'}
      </button>
      {result && (
        <div className="text-sm text-gray-300 mt-2 p-2 bg-[#0F0F0F] rounded">
          {result}
        </div>
      )}
    </div>
  );
}