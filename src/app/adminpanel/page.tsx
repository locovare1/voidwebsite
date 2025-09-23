"use client";

import { useState } from 'react';
import AdminDashboard from '@/components/AdminDashboard';

export default function AdminPanelPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Simple password protection (in production, use proper authentication)
  const ADMIN_PASSWORD = 'voidadmin123';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password');
      setPassword('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="pt-20 min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-8 max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold gradient-text mb-2">Admin Panel</h1>
            <p className="text-gray-400">Enter password to access</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
                placeholder="Enter admin password"
                required
              />
              {error && (
                <p className="text-red-400 text-sm mt-1">{error}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-[#FFFFFF] hover:bg-[#FFFFFF]/90 text-black font-bold py-2 px-4 rounded-lg transition-all duration-300 glow-on-hover"
            >
              Login
            </button>
          </form>

          <div className="mt-6 p-3 bg-[#0F0F0F] rounded-lg border border-[#2A2A2A]">
            <p className="text-xs text-gray-500 text-center">
              Demo Password: <span className="text-gray-400 font-mono">voidadmin123</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-12">
        <AdminDashboard />
      </div>
    </div>
  );
}