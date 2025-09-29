'use client';

import { DebugProvider } from '@/contexts/DebugContext';
import DebugTestComponent from '@/components/DebugTestComponent';
import EnhancedDebugPanel from '@/components/EnhancedDebugPanel';

export default function DebugTestPage() {
  return (
    <DebugProvider>
      <div className="pt-20 min-h-screen bg-[#0F0F0F]">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold gradient-text">Debug Test Page</h1>
            <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
              This page demonstrates the enhanced debugging capabilities
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Test Components</h2>
              <DebugTestComponent name="Component 1" delay={50} />
              <DebugTestComponent name="Component 2" delay={100} />
              <DebugTestComponent name="Component 3" delay={200} />
              
              <div className="mt-8 p-6 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A]">
                <h3 className="text-xl font-bold text-white mb-4">Debugging Information</h3>
                <p className="text-gray-300 mb-4">
                  This page demonstrates the enhanced debugging capabilities including:
                </p>
                <ul className="text-gray-300 list-disc pl-5 space-y-2">
                  <li>Component lifecycle tracking</li>
                  <li>Performance measurement</li>
                  <li>State change monitoring</li>
                  <li>Memory usage tracking</li>
                  <li>Detailed logging with categorization</li>
                  <li>Performance profiling</li>
                </ul>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Debug Panel</h2>
              <EnhancedDebugPanel />
            </div>
          </div>
        </div>
      </div>
    </DebugProvider>
  );
}