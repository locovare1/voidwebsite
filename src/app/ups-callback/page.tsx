"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UPSCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Parse URL parameters from UPS callback
    const urlParams = new URLSearchParams(window.location.search);
    const statusCode = urlParams.get('status');
    const transactionId = urlParams.get('transactionId');
    const errorReason = urlParams.get('error');

    if (statusCode === 'success') {
      setStatus('success');
      setMessage('Shipping label created successfully!');
      // Here you would typically update your order status in your database
      // and redirect the user to an appropriate page
    } else if (statusCode === 'error') {
      setStatus('error');
      setMessage(`Error creating shipping label: ${errorReason || 'Unknown error'}`);
    } else {
      setStatus('error');
      setMessage('Invalid callback parameters');
    }

    // Optional: Redirect after a delay
    const timer = setTimeout(() => {
      router.push('/adminpanel'); // Redirect to admin panel or order page
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-4">
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-[#FFFFFF] border-t-transparent rounded-full animate-spin"></div>
              <h2 className="text-xl font-bold text-white">Processing UPS Callback</h2>
              <p className="text-gray-400">Please wait while we process your shipping information...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">Success!</h2>
              <p className="text-gray-400">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">Error</h2>
              <p className="text-gray-400">{message}</p>
            </div>
          )}
        </div>

        <div className="mt-6">
          <button
            onClick={() => router.push('/adminpanel')}
            className="w-full bg-[#FFFFFF] hover:bg-[#FFFFFF]/90 text-black font-bold py-3 px-4 rounded-lg transition-all duration-300"
          >
            Go to Admin Panel
          </button>
        </div>
      </div>
    </div>
  );
}