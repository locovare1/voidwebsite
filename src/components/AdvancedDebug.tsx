'use client';

import Link from 'next/link';

export default function AdvancedDebug() {
  return (
    <div className="bg-[#1A1A1A] p-6 rounded-lg border border-[#2A2A2A]">
      <div className="text-center mb-6">
        <h3 className="text-white font-bold text-xl mb-2">⚠️ Deprecated Debug System</h3>
        <p className="text-gray-400 mb-4">
          This debug system has been deprecated in favor of the enhanced debugging system.
        </p>
        
        <Link 
          href="/debug" 
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
        >
          Go to Enhanced Debug System
        </Link>
      </div>
      
      <div className="bg-yellow-900/20 border border-yellow-800/30 p-4 rounded-lg">
        <h4 className="text-yellow-400 font-bold mb-2">Enhanced Debugging Available</h4>
        <p className="text-gray-300 text-sm">
          The enhanced debugging system provides:
        </p>
        <ul className="text-gray-300 text-sm list-disc pl-5 mt-2 space-y-1">
          <li>Real-time system status monitoring</li>
          <li>Advanced performance metrics tracking</li>
          <li>Comprehensive logging with filtering</li>
          <li>Multi-tab interface for organized debugging</li>
          <li>Test history tracking with status visualization</li>
          <li>Memory usage monitoring</li>
          <li>Component lifecycle tracking</li>
          <li>Performance profiling capabilities</li>
        </ul>
      </div>
      
      <div className="mt-6 pt-4 border-t border-[#2A2A2A]">
        <h4 className="text-white font-bold mb-2">Migration Notice</h4>
        <p className="text-gray-400 text-sm">
          Please use the enhanced debugging system at <Link href="/debug" className="text-blue-400 hover:underline">/debug</Link> for all debugging needs.
          This component will be removed in a future update.
        </p>
      </div>
    </div>
  );
}
