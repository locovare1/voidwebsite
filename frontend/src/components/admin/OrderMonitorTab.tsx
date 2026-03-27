"use client";

import { useState, useEffect } from 'react';
import { AlertTriangleIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface OrderAlert {
  type: 'CRITICAL_PAYMENT_MISMATCH' | 'DUPLICATE_ORDER' | 'ORPHANED_PAYMENT' | 'UNUSUAL_ACTIVITY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  orderId?: string;
  paymentIntentId?: string;
  data: any;
  timestamp: string;
}

interface MonitorResponse {
  success: boolean;
  timestamp: string;
  alerts: OrderAlert[];
  criticalAlerts: OrderAlert[];
  totalAlerts: number;
  lastCheck: string | null;
  report: string;
}

export default function OrderMonitorTab() {
  const [monitorData, setMonitorData] = useState<MonitorResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchMonitorData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/monitor-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ORDER_MONITOR_SECRET || 'default-secret-key'}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setMonitorData(data);
      setLastRefresh(new Date());
    } catch (err: any) {
      console.error('Error fetching monitor data:', err);
      setError(err.message || 'Failed to fetch order monitoring data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitorData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchMonitorData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <AlertTriangleIcon className="w-5 h-5 text-red-500" />;
      case 'HIGH':
        return <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />;
      case 'MEDIUM':
        return <InformationCircleIcon className="w-5 h-5 text-yellow-500" />;
      case 'LOW':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'HIGH':
        return 'bg-orange-500/10 border-orange-500/30 text-orange-400';
      case 'MEDIUM':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
      case 'LOW':
        return 'bg-green-500/10 border-green-500/30 text-green-400';
      default:
        return 'bg-gray-500/10 border-gray-500/30 text-gray-400';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading && !monitorData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Loading order monitoring data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangleIcon className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-bold text-white">Order Monitor Error</h2>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchMonitorData}
            className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <AlertTriangleIcon className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-bold text-white">Order System Monitor</h2>
          </div>
          <div className="flex items-center gap-3">
            {lastRefresh && (
              <span className="text-sm text-gray-400">
                Last check: {lastRefresh.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={fetchMonitorData}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded text-sm font-medium"
            >
              {loading ? 'Checking...' : 'Check Now'}
            </button>
          </div>
        </div>

        {/* Status Summary */}
        {monitorData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{monitorData.totalAlerts}</div>
              <div className="text-sm text-gray-400">Total Alerts</div>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-400">{monitorData.criticalAlerts.length}</div>
              <div className="text-sm text-red-400">Critical</div>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-400">
                {monitorData.alerts.filter(a => a.severity === 'HIGH').length}
              </div>
              <div className="text-sm text-orange-400">High Priority</div>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">
                {monitorData.alerts.filter(a => a.severity === 'LOW').length}
              </div>
              <div className="text-sm text-green-400">Low Priority</div>
            </div>
          </div>
        )}
      </div>

      {/* Alerts List */}
      {monitorData && monitorData.alerts.length > 0 && (
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Recent Alerts</h3>
          <div className="space-y-3">
            {monitorData.alerts.map((alert, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start gap-3">
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{alert.type}</span>
                      <span className="text-xs opacity-75">
                        {formatTimestamp(alert.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{alert.message}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {alert.orderId && (
                        <span className="bg-black/20 px-2 py-1 rounded">
                          Order: {alert.orderId}
                        </span>
                      )}
                      {alert.paymentIntentId && (
                        <span className="bg-black/20 px-2 py-1 rounded">
                          Payment: {alert.paymentIntentId}
                        </span>
                      )}
                      <span className="bg-black/20 px-2 py-1 rounded">
                        Severity: {alert.severity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Report */}
      {monitorData && (
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Full System Report</h3>
          <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg p-4">
            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
              {monitorData.report}
            </pre>
          </div>
        </div>
      )}

      {/* No Alerts */}
      {monitorData && monitorData.alerts.length === 0 && (
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
          <div className="text-center py-8">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">All Systems Operational</h3>
            <p className="text-gray-400">No order issues detected. Everything is running smoothly.</p>
          </div>
        </div>
      )}
    </div>
  );
}
