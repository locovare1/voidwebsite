'use client';

import AdvancedDebug from '@/components/AdvancedDebug';

export default function DebugPage() {
  return (
    <div className="pt-20 min-h-screen bg-[#0F0F0F]">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-text">Advanced Debug & Testing</h1>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            Comprehensive testing suite for Firebase connectivity, review system functionality, and performance monitoring
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <AdvancedDebug />
        </div>
        
        <div className="mt-8 bg-[#1A1A1A] p-6 rounded-lg border border-[#2A2A2A] max-w-6xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-4">Advanced Troubleshooting Guide</h2>
          <div className="text-gray-300 space-y-3">
            <div>
              <h3 className="font-bold text-white mb-1">1. System Status Monitoring</h3>
              <p>Real-time monitoring of network connectivity, Firebase status, and performance metrics.</p>
            </div>
            
            <div>
              <h3 className="font-bold text-white mb-1">2. Comprehensive Testing</h3>
              <p>Run individual component tests or full system diagnostics to identify issues.</p>
            </div>
            
            <div>
              <h3 className="font-bold text-white mb-1">3. Performance Analysis</h3>
              <p>Monitor memory usage, resource loading times, and response metrics.</p>
            </div>
            
            <div>
              <h3 className="font-bold text-white mb-1">4. Detailed Error Reporting</h3>
              <p>Comprehensive error logs with timestamps and detailed diagnostic information.</p>
            </div>
            
            <div className="pt-3 border-t border-[#2A2A2A]">
              <h3 className="font-bold text-white mb-2">If Issues Persist:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Check browser console (F12) for detailed JavaScript errors</li>
                <li>Verify Firebase security rules allow read/write access to collections</li>
                <li>Ensure your Firebase project has billing enabled for production use</li>
                <li>Check network connectivity and firewall settings</li>
                <li>Review Firebase Console for any service outages or quota limits</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}