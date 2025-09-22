'use client';

import FirebaseTest from '@/components/FirebaseTest';
import ReviewTest from '@/components/ReviewTest';

export default function DebugPage() {
  return (
    <div className="pt-20 min-h-screen bg-[#0F0F0F]">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-text">Debug & Testing</h1>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            Test Firebase connectivity and review system functionality
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <FirebaseTest />
          <ReviewTest />
        </div>
        
        <div className="mt-8 bg-[#1A1A1A] p-6 rounded-lg border border-[#2A2A2A] max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-4">Troubleshooting Steps</h2>
          <div className="text-gray-300 space-y-2">
            <p>1. <strong>Test Firebase Connection:</strong> Click the blue button to test basic Firebase connectivity</p>
            <p>2. <strong>Test Review Service:</strong> Click the green button to test the review service specifically</p>
            <p>3. <strong>Check Console:</strong> Open browser developer tools (F12) and check the Console tab for detailed error messages</p>
            <p>4. <strong>Check Network:</strong> In developer tools, check the Network tab to see if Firebase requests are being made</p>
            <p>5. <strong>Firebase Rules:</strong> Make sure Firestore security rules allow writes to the &apos;reviews&apos; collection</p>
          </div>
        </div>
      </div>
    </div>
  );
}