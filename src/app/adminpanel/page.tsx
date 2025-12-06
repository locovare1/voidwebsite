"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import AdminDashboard from '@/components/AdminDashboard';

export default function AdminPanelPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Check authentication state on component mount
  useEffect(() => {
    if (!auth) return;
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      setError('Firebase Auth not initialized');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsAuthenticated(true);
      setError('');
    } catch (err: any) {
      console.error('Login error:', err);
      let errorMessage = 'Invalid credentials';
      
      if (err.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (err.code === 'auth/user-not-found') {
        errorMessage = 'No user found with this email';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Try again later.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    
    try {
      await signOut(auth);
      setIsAuthenticated(false);
      setEmail('');
      setPassword('');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="pt-20 min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="admin-card glass shine-hover rounded-xl p-8 max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold gradient-text mb-2">Admin Panel</h1>
            <p className="text-gray-400">Sign in with your admin account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
                placeholder="admin@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
                placeholder="Enter your password"
                required
              />
              {error && (
                <p className="text-red-400 text-sm mt-1">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FFFFFF] hover:bg-[#FFFFFF]/90 text-black font-bold py-2 px-4 rounded-lg transition-all duration-300 glow-on-hover shine-hover disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 p-3 bg-[#0F0F0F] rounded-lg border border-white/10">
            <p className="text-xs text-gray-500 text-center">
              Use your Firebase Authentication credentials
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold gradient-text">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 text-red-400 font-medium py-2 px-4 rounded-lg transition-all duration-300"
          >
            Logout
          </button>
        </div>
        <AdminDashboard />
      </div>
    </div>
  );
}