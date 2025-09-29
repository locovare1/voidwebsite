'use client';

import { useState, useEffect, useMemo } from 'react';
import { useDebug } from '@/contexts/DebugContext';
import { useDebug as useDebugHook } from '@/hooks/useDebug';
import { 
  ChartBarIcon, 
  ClockIcon, 
  CpuChipIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  TrashIcon,
  PlayIcon,
  StopIcon,
  BugAntIcon
} from '@heroicons/react/24/outline';

export default function EnhancedDebugPanel() {
  const debugContext = useDebug();
  const { log } = useDebugHook('EnhancedDebugPanel');
  const [activeTab, setActiveTab] = useState<'logs' | 'tests' | 'performance' | 'system'>('logs');
  const [logFilter, setLogFilter] = useState<'all' | 'info' | 'warn' | 'error' | 'debug'>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Filter logs based on selected filter
  const filteredLogs = useMemo(() => {
    if (logFilter === 'all') return debugContext.logs;
    return debugContext.logs.filter(log => log.level === logFilter);
  }, [debugContext.logs, logFilter]);

  // Start performance monitoring when component mounts
  useEffect(() => {
    debugContext.startMonitoring();
    log('info', 'Debug panel initialized');
    
    return () => {
      debugContext.stopMonitoring();
      log('info', 'Debug panel unmounted');
    };
  }, [debugContext, log]);

  // Auto-refresh logs
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      // Trigger re-render by updating state
      setLogFilter(prev => prev);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const runAllTests = async () => {
    setIsRunningTests(true);
    try {
      await debugContext.runAllTests();
      log('info', 'All tests completed successfully');
    } catch (error: any) {
      log('error', 'Error running tests', { error: error.message });
    } finally {
      setIsRunningTests(false);
    }
  };

  const clearLogs = () => {
    debugContext.clearLogs();
    log('info', 'Logs cleared');
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-900/30 border-red-800/50';
      case 'warn': return 'bg-yellow-900/30 border-yellow-800/50';
      case 'info': return 'bg-blue-900/30 border-blue-800/50';
      case 'debug': return 'bg-green-900/30 border-green-800/50';
      default: return 'bg-gray-900/30 border-gray-800/50';
    }
  };

  const getLogLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <ExclamationTriangleIcon className="h-4 w-4 text-red-400" />;
      case 'warn': return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-400" />;
      case 'info': return <InformationCircleIcon className="h-4 w-4 text-blue-400" />;
      case 'debug': return <BugAntIcon className="h-4 w-4 text-green-400" />;
      default: return <InformationCircleIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="bg-[#1A1A1A] p-6 rounded-lg border border-[#2A2A2A]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-white font-bold text-xl flex items-center gap-2">
          <BugAntIcon className="h-6 w-6 text-green-400" />
          Enhanced Debug System
        </h3>
        <div className="flex gap-2">
          <button
            onClick={clearLogs}
            className="bg-gray-700 hover:bg-gray-600 text-white py-1 px-3 rounded text-sm transition-colors flex items-center gap-1"
          >
            <TrashIcon className="h-4 w-4" />
            Clear Logs
          </button>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`py-1 px-3 rounded text-sm transition-colors flex items-center gap-1 ${
              autoRefresh 
                ? 'bg-green-700 hover:bg-green-600 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          >
            {autoRefresh ? (
              <>
                <StopIcon className="h-4 w-4" />
                Stop Auto-refresh
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4" />
                Start Auto-refresh
              </>
            )}
          </button>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#2A2A2A] p-4 rounded-lg">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <CpuChipIcon className="h-4 w-4" />
            Network
          </div>
          <div className={`text-lg font-bold mt-1 ${
            debugContext.systemStatus.network === 'connected' ? 'text-green-400' : 
            debugContext.systemStatus.network === 'disconnected' ? 'text-red-400' : 'text-gray-400'
          }`}>
            {debugContext.systemStatus.network}
          </div>
        </div>
        <div className="bg-[#2A2A2A] p-4 rounded-lg">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <CpuChipIcon className="h-4 w-4" />
            Firebase
          </div>
          <div className={`text-lg font-bold mt-1 ${
            debugContext.systemStatus.firebase === 'connected' ? 'text-green-400' : 
            debugContext.systemStatus.firebase === 'disconnected' ? 'text-red-400' : 'text-gray-400'
          }`}>
            {debugContext.systemStatus.firebase}
          </div>
        </div>
        <div className="bg-[#2A2A2A] p-4 rounded-lg">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <CpuChipIcon className="h-4 w-4" />
            Review Service
          </div>
          <div className={`text-lg font-bold mt-1 ${
            debugContext.systemStatus.reviewService === 'connected' ? 'text-green-400' : 
            debugContext.systemStatus.reviewService === 'disconnected' ? 'text-red-400' : 'text-gray-400'
          }`}>
            {debugContext.systemStatus.reviewService}
          </div>
        </div>
        <div className="bg-[#2A2A2A] p-4 rounded-lg">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <ChartBarIcon className="h-4 w-4" />
            Active Tests
          </div>
          <div className="text-lg font-bold mt-1 text-blue-400">
            {debugContext.activeTests.length}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2A2A2A] mb-6">
        <button
          onClick={() => setActiveTab('logs')}
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === 'logs'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Logs ({debugContext.logs.length})
        </button>
        <button
          onClick={() => setActiveTab('tests')}
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === 'tests'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Tests ({debugContext.tests.length})
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === 'performance'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Performance
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === 'system'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          System
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'logs' && (
        <div>
          {/* Log Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setLogFilter('all')}
              className={`px-3 py-1 rounded text-xs ${
                logFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All ({debugContext.logs.length})
            </button>
            <button
              onClick={() => setLogFilter('info')}
              className={`px-3 py-1 rounded text-xs ${
                logFilter === 'info'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Info
            </button>
            <button
              onClick={() => setLogFilter('debug')}
              className={`px-3 py-1 rounded text-xs ${
                logFilter === 'debug'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Debug
            </button>
            <button
              onClick={() => setLogFilter('warn')}
              className={`px-3 py-1 rounded text-xs ${
                logFilter === 'warn'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Warning
            </button>
            <button
              onClick={() => setLogFilter('error')}
              className={`px-3 py-1 rounded text-xs ${
                logFilter === 'error'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Error
            </button>
          </div>

          {/* Logs List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No logs found. Run some tests or operations to see logs here.
              </div>
            ) : (
              filteredLogs.map((logEntry) => (
                <div 
                  key={logEntry.id} 
                  className={`p-4 rounded-lg border ${getLogLevelColor(logEntry.level)}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-2">
                      {getLogLevelIcon(logEntry.level)}
                      <div>
                        <div className="font-bold text-white">{logEntry.message}</div>
                        {logEntry.component && (
                          <div className="text-xs text-gray-400 mt-1">
                            Component: {logEntry.component}
                          </div>
                        )}
                        {logEntry.category && (
                          <div className="text-xs text-gray-400 mt-1">
                            Category: {logEntry.category}
                          </div>
                        )}
                        {logEntry.details && (
                          <div className="mt-2 text-sm text-gray-300">
                            <pre className="whitespace-pre-wrap text-xs">
                              {JSON.stringify(logEntry.details, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 text-right">
                      <div>{logEntry.timestamp.toLocaleTimeString()}</div>
                      <div>{logEntry.timestamp.toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'tests' && (
        <div>
          {/* Test Controls */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={runAllTests}
              disabled={isRunningTests}
              className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isRunningTests ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <PlayIcon className="h-4 w-4" />
                  Run All Tests
                </>
              )}
            </button>
          </div>

          {/* Tests List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {debugContext.tests.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No tests run yet. Click "Run All Tests" to start.
              </div>
            ) : (
              debugContext.tests.map((test) => (
                <div 
                  key={test.id} 
                  className={`p-4 rounded-lg border ${
                    test.status === 'success' 
                      ? 'bg-green-900/20 border-green-800/30' 
                      : test.status === 'failed' 
                        ? 'bg-red-900/20 border-red-800/30' 
                        : test.status === 'running'
                          ? 'bg-blue-900/20 border-blue-800/30'
                          : 'bg-gray-900/20 border-gray-800/30'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-white">{test.name}</div>
                      <div className={`mt-1 ${
                        test.status === 'success' ? 'text-green-400' : 
                        test.status === 'failed' ? 'text-red-400' : 
                        test.status === 'running' ? 'text-blue-400' : 'text-gray-400'
                      }`}>
                        Status: {test.status}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 text-right">
                      <div>Started: {test.startTime.toLocaleTimeString()}</div>
                      {test.endTime && (
                        <div>Ended: {test.endTime.toLocaleTimeString()}</div>
                      )}
                      {test.duration && (
                        <div>Duration: {test.duration}ms</div>
                      )}
                    </div>
                  </div>
                  {test.error && (
                    <div className="mt-2 text-sm text-red-400">
                      <div className="font-bold">Error:</div>
                      <pre className="whitespace-pre-wrap">{test.error}</pre>
                    </div>
                  )}
                  {test.result && (
                    <div className="mt-2 text-sm text-gray-300">
                      <div className="font-bold">Result:</div>
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(test.result, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-[#2A2A2A] p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <CpuChipIcon className="h-4 w-4" />
                FPS
              </div>
              <div className="text-2xl font-bold text-white">
                {debugContext.performance.fps.toFixed(1)}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Frame Time: {debugContext.performance.frameTime.toFixed(2)}ms
              </div>
            </div>
            <div className="bg-[#2A2A2A] p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <ChartBarIcon className="h-4 w-4" />
                Resources
              </div>
              <div className="text-2xl font-bold text-white">
                {debugContext.performance.resources}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Loaded Resources
              </div>
            </div>
          </div>

          {debugContext.performance.memory && (
            <div className="bg-[#2A2A2A] p-4 rounded-lg mb-6">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <CpuChipIcon className="h-4 w-4" />
                Memory Usage
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-lg font-bold text-white">
                    {debugContext.performance.memory.used} MB
                  </div>
                  <div className="text-xs text-gray-400">Used</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">
                    {debugContext.performance.memory.total} MB
                  </div>
                  <div className="text-xs text-gray-400">Total</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">
                    {debugContext.performance.memory.limit} MB
                  </div>
                  <div className="text-xs text-gray-400">Limit</div>
                </div>
              </div>
              <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ 
                    width: `${(debugContext.performance.memory.used / debugContext.performance.memory.limit) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          )}

          {debugContext.performance.navigation && (
            <div className="bg-[#2A2A2A] p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <ClockIcon className="h-4 w-4" />
                Navigation Timing
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Load Time</div>
                  <div className="text-white">
                    {debugContext.performance.navigation ? debugContext.performance.navigation.loadEventEnd - debugContext.performance.navigation.startTime : 'N/A'}ms
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">DOM Content Loaded</div>
                  <div className="text-white">
                    {debugContext.performance.navigation ? debugContext.performance.navigation.domContentLoadedEventEnd - debugContext.performance.navigation.startTime : 'N/A'}ms
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'system' && (
        <div>
          <div className="bg-[#2A2A2A] p-4 rounded-lg mb-6">
            <h4 className="text-white font-bold mb-3">System Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-400">User Agent</div>
                <div className="text-white truncate">{navigator.userAgent}</div>
              </div>
              <div>
                <div className="text-gray-400">Platform</div>
                <div className="text-white">{navigator.platform}</div>
              </div>
              <div>
                <div className="text-gray-400">Language</div>
                <div className="text-white">{navigator.language}</div>
              </div>
              <div>
                <div className="text-gray-400">Cookies Enabled</div>
                <div className="text-white">{navigator.cookieEnabled ? 'Yes' : 'No'}</div>
              </div>
            </div>
          </div>

          <div className="bg-[#2A2A2A] p-4 rounded-lg">
            <h4 className="text-white font-bold mb-3">Debug Configuration</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-400">Monitoring Status</div>
                <div className="text-white">
                  {debugContext.isMonitoring ? 'Active' : 'Inactive'}
                </div>
              </div>
              <div>
                <div className="text-gray-400">Log Count</div>
                <div className="text-white">{debugContext.logs.length}</div>
              </div>
              <div>
                <div className="text-gray-400">Test Count</div>
                <div className="text-white">{debugContext.tests.length}</div>
              </div>
              <div>
                <div className="text-gray-400">Active Tests</div>
                <div className="text-white">{debugContext.activeTests.length}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 pt-4 border-t border-[#2A2A2A]">
        <h4 className="text-white font-bold mb-2">Debugging Instructions</h4>
        <ul className="text-gray-400 text-sm space-y-1">
          <li>• Use the tabs to navigate between different debugging views</li>
          <li>• Filter logs by level to focus on specific types of messages</li>
          <li>• Run tests to check system components and services</li>
          <li>• Monitor performance metrics to identify bottlenecks</li>
          <li>• Check system information for browser and environment details</li>
          <li>• Enable auto-refresh to continuously update log display</li>
        </ul>
      </div>
    </div>
  );
}