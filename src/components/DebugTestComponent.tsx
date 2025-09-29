'use client';

import { useEffect } from 'react';
import { useDebug, useDebugState, usePerformanceProfiler, useMemoryMonitor } from '@/hooks/useDebug';

interface TestComponentProps {
  name: string;
  delay?: number;
}

export default function DebugTestComponent({ name, delay = 100 }: TestComponentProps) {
  const { measurePerformance, log } = useDebug(`DebugTestComponent-${name}`);
  const [count, setCount] = useDebugState(0, 'count', `DebugTestComponent-${name}`);
  const { startMeasurement, endMeasurement } = usePerformanceProfiler(`DebugTestComponent-${name}`);
  
  // Monitor memory usage
  useMemoryMonitor(`DebugTestComponent-${name}`, 10000);

  useEffect(() => {
    log('info', `Component ${name} mounted`);
    
    // Simulate some work
    startMeasurement('initial-load');
    measurePerformance('expensive-operation', () => {
      // Simulate expensive operation
      const start = Date.now();
      while (Date.now() - start < delay) {
        // Busy wait
      }
    });
    endMeasurement('initial-load');
  }, [name, delay, log, measurePerformance, startMeasurement, endMeasurement]);

  const handleClick = () => {
    log('debug', `Button clicked in component ${name}`, { count: count + 1 });
    setCount(prev => prev + 1);
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg mb-4">
      <h3 className="text-white font-bold mb-2">Debug Test Component: {name}</h3>
      <p className="text-gray-300 mb-2">Count: {count}</p>
      <button 
        onClick={handleClick}
        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
      >
        Increment Count
      </button>
    </div>
  );
}