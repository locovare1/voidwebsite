'use client';

import FirebaseTest from '@/components/FirebaseTest';
import ReviewTest from '@/components/ReviewTest';
import StripeTest from '@/components/StripeTest';

export default function DebugPage() {
  return (
    <div className="pt-20 min-h-screen bg-[#0F0F0F]">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-text">Debug & Testing Suite</h1>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            Comprehensive testing for Firebase, Reviews, and Stripe Payment systems
          </p>
          
          {/* Live Stripe Warning */}
          {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_live_') && (
            <div className="mt-6 bg-red-900/20 border border-red-500/50 rounded-lg p-4 max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl">⚠️</span>
                <h3 className="text-lg font-bold text-red-400">LIVE STRIPE KEYS DETECTED</h3>
                <span className="text-2xl">⚠️</span>
              </div>
              <p className="text-red-300 text-sm">
                <strong>WARNING:</strong> You are using LIVE Stripe keys. Real payments will be processed! 
                Use real credit cards only. Test cards will not work.
              </p>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FirebaseTest />
          <ReviewTest />
          <StripeTest />
        </div>
        
        <div className="mt-8 bg-[#1A1A1A] p-6 rounded-lg border border-[#2A2A2A] max-w-6xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-4">Troubleshooting Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-300">
            <div>
              <h3 className="font-bold text-white mb-2">🔥 Firebase Issues</h3>
              <ul className="text-sm space-y-1">
                <li>• Check Firebase security rules</li>
                <li>• Verify project billing is enabled</li>
                <li>• Ensure network connectivity</li>
                <li>• Check Firebase Console for outages</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-white mb-2">⭐ Review System</h3>
              <ul className="text-sm space-y-1">
                <li>• Test Firebase connection first</li>
                <li>• Verify all form fields are filled</li>
                <li>• Check browser console for errors</li>
                <li>• Ensure proper data validation</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-white mb-2">💳 Stripe Payments</h3>
              <ul className="text-sm space-y-1">
                <li>• Verify API keys are correct</li>
                <li>• Check environment variables</li>
                <li>• Test payment intent creation</li>
                <li>• Ensure HTTPS in production</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-[#2A2A2A]">
            <h3 className="font-bold text-white mb-2">🚀 Production Deployment</h3>
            <div className="text-sm text-gray-300 space-y-1">
              <p>• All environment variables must be set in Vercel dashboard</p>
              <p>• Firebase security rules must allow production domain</p>
              <p>• Stripe webhooks should be configured for production events</p>
              <p>• Check browser console (F12) for any JavaScript errors</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}