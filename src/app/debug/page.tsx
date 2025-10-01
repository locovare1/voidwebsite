'use client';

import EnhancedDebugPanel from '@/components/EnhancedDebugPanel';

export default function DebugPage() {
  return (
    <div className="pt-20 min-h-screen bg-[#0F0F0F]">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-text">Enhanced Debug Panel</h1>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            Comprehensive debugging and testing suite with real-time monitoring
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <EnhancedDebugPanel />
        </div>
        
        <div className="mt-8 bg-[#1A1A1A] p-6 rounded-lg border border-[#2A2A2A] max-w-6xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-4">Debug Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-300">
            <div>
              <h3 className="font-bold text-white mb-2">🔧 Usage</h3>
              <ul className="text-sm space-y-1">
                <li>• Logs tab shows all system events</li>
                <li>• Tests tab runs system diagnostics</li>
                <li>• Performance tab monitors app metrics</li>
                <li>• System tab shows service status</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-white mb-2">⚡ Features</h3>
              <ul className="text-sm space-y-1">
                <li>• Real-time log monitoring</li>
                <li>• Automated system testing</li>
                <li>• Performance metrics tracking</li>
                <li>• Service status monitoring</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-white mb-2">🛠️ Controls</h3>
              <ul className="text-sm space-y-1">
                <li>• Clear logs to reset history</li>
                <li>• Toggle auto-refresh for logs</li>
                <li>• Run individual or all tests</li>
                <li>• Filter logs by severity level</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}