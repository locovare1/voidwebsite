"use client";

import { useState, useEffect } from 'react';
import { updateEmail, updatePassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { 
  CogIcon, 
  BellIcon, 
  ShieldCheckIcon, 
  CreditCardIcon,
  UserCircleIcon,
  KeyIcon
} from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [user, setUser] = useState<any>(null);
  
  // General settings state
  const [siteName, setSiteName] = useState('Void Esports');
  const [adminEmail, setAdminEmail] = useState('admin@voidesports.org');
  const [timezone, setTimezone] = useState('(GMT-05:00) Eastern Time (US & Canada)');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [darkMode, setDarkMode] = useState(true);
  
  // Notification settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [reviewNotifications, setReviewNotifications] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  
  // Security settings state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Account settings state
  const [firstName, setFirstName] = useState('Admin');
  const [lastName, setLastName] = useState('User');
  const [emailAddress, setEmailAddress] = useState('admin@voidesports.org');
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Get current user on component mount
  useEffect(() => {
    if (auth?.currentUser) {
      setUser(auth.currentUser);
      setEmailAddress(auth.currentUser.email || '');
      setAdminEmail(auth.currentUser.email || '');
    }
  }, []);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setError('');
    setTimeout(() => setMessage(''), 3000);
  };

  const showError = (errMsg: string) => {
    setError(errMsg);
    setMessage('');
    setTimeout(() => setError(''), 5000);
  };

  const handleSaveGeneralSettings = async () => {
    setLoading(true);
    try {
      // In a real app, you would save these to a database
      // For now, we'll just show a success message
      showMessage('General settings saved successfully!');
    } catch (err: any) {
      showError(err.message || 'Failed to save general settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotificationSettings = async () => {
    setLoading(true);
    try {
      // In a real app, you would save these to a database
      showMessage('Notification settings saved successfully!');
    } catch (err: any) {
      showError(err.message || 'Failed to save notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    setLoading(true);
    try {
      if (!auth?.currentUser) {
        throw new Error('No user is currently signed in');
      }
      
      if (newPassword !== confirmPassword) {
        throw new Error('New passwords do not match');
      }
      
      if (newPassword.length < 6) {
        throw new Error('Password should be at least 6 characters');
      }
      
      await updatePassword(auth.currentUser, newPassword);
      showMessage('Password updated successfully!');
      
      // Reset password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      if (!auth?.currentUser) {
        throw new Error('No user is currently signed in');
      }
      
      // Update profile information
      await updateProfile(auth.currentUser, {
        displayName: `${firstName} ${lastName}`
      });
      
      // Update email if it has changed
      if (emailAddress !== auth.currentUser.email) {
        await updateEmail(auth.currentUser, emailAddress);
      }
      
      showMessage('Profile updated successfully!');
    } catch (err: any) {
      showError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: CogIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'payments', name: 'Payments', icon: CreditCardIcon },
    { id: 'account', name: 'Account', icon: UserCircleIcon },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your admin panel preferences</p>
      </div>

      {/* Status Messages */}
      {message && (
        <div className="bg-green-900/30 border border-green-800/50 text-green-400 px-4 py-3 rounded-lg">
          {message}
        </div>
      )}
      
      {error && (
        <div className="bg-red-900/30 border border-red-800/50 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-[#2A2A2A]">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'border-[#FFFFFF] text-[#FFFFFF]'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Settings Content */}
      <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">General Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Timezone
                  </label>
                  <select 
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
                  >
                    <option>(GMT-12:00) International Date Line West</option>
                    <option>(GMT-11:00) Midway Island, Samoa</option>
                    <option>(GMT-10:00) Hawaii</option>
                    <option>(GMT-09:00) Alaska</option>
                    <option>(GMT-08:00) Pacific Time (US & Canada)</option>
                    <option>(GMT-07:00) Mountain Time (US & Canada)</option>
                    <option>(GMT-06:00) Central Time (US & Canada)</option>
                    <option>(GMT-05:00) Eastern Time (US & Canada)</option>
                    <option>(GMT-04:00) Atlantic Time (Canada)</option>
                    <option>(GMT-03:30) Newfoundland</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date Format
                  </label>
                  <select 
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
                  >
                    <option>MM/DD/YYYY</option>
                    <option>DD/MM/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-[#2A2A2A]">
                <div>
                  <h3 className="text-lg font-medium text-white">Dark Mode</h3>
                  <p className="text-gray-400 text-sm">Enable dark mode for the admin panel</p>
                </div>
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] ${
                    darkMode ? 'bg-[#FFFFFF]' : 'bg-[#2A2A2A]'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}></span>
                </button>
              </div>
              
              <div className="pt-4">
                <button
                  onClick={handleSaveGeneralSettings}
                  disabled={loading}
                  className="bg-[#FFFFFF] hover:bg-[#FFFFFF]/90 text-black font-medium py-2 px-4 rounded-lg transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Notification Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">Email Notifications</h3>
                    <p className="text-gray-400 text-sm">Receive email notifications for important events</p>
                  </div>
                  <button 
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] ${
                      emailNotifications ? 'bg-[#FFFFFF]' : 'bg-[#2A2A2A]'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}></span>
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">Order Updates</h3>
                    <p className="text-gray-400 text-sm">Get notified when orders are placed or updated</p>
                  </div>
                  <button 
                    onClick={() => setOrderUpdates(!orderUpdates)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] ${
                      orderUpdates ? 'bg-[#FFFFFF]' : 'bg-[#2A2A2A]'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      orderUpdates ? 'translate-x-6' : 'translate-x-1'
                    }`}></span>
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">Review Notifications</h3>
                    <p className="text-gray-400 text-sm">Receive alerts when new reviews are posted</p>
                  </div>
                  <button 
                    onClick={() => setReviewNotifications(!reviewNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] ${
                      reviewNotifications ? 'bg-[#FFFFFF]' : 'bg-[#2A2A2A]'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      reviewNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}></span>
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">Security Alerts</h3>
                    <p className="text-gray-400 text-sm">Get notified of security-related events</p>
                  </div>
                  <button 
                    onClick={() => setSecurityAlerts(!securityAlerts)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] ${
                      securityAlerts ? 'bg-[#FFFFFF]' : 'bg-[#2A2A2A]'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      securityAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}></span>
                  </button>
                </div>
              </div>
              
              <div className="pt-4">
                <button
                  onClick={handleSaveNotificationSettings}
                  disabled={loading}
                  className="bg-[#FFFFFF] hover:bg-[#FFFFFF]/90 text-black font-medium py-2 px-4 rounded-lg transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Security Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Two-Factor Authentication</h3>
                  <p className="text-gray-400 text-sm mb-4">Add an extra layer of security to your account</p>
                  <button className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg transition-all duration-300">
                    Enable 2FA
                  </button>
                </div>
                
                <div className="pt-4 border-t border-[#2A2A2A]">
                  <h3 className="text-lg font-medium text-white mb-2">Change Password</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={handleUpdatePassword}
                    disabled={loading}
                    className="mt-4 bg-[#FFFFFF] hover:bg-[#FFFFFF]/90 text-black font-medium py-2 px-4 rounded-lg transition-all duration-300 disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Payment Settings</h2>
              
              <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <CreditCardIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Stripe Integration</h3>
                    <p className="text-gray-400 text-sm">Payment processing powered by Stripe</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Publishable Key
                  </label>
                  <input
                    type="password"
                    defaultValue="pk_live_****************************************"
                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Secret Key
                  </label>
                  <input
                    type="password"
                    defaultValue="sk_live_****************************************"
                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Webhook Secret
                  </label>
                  <input
                    type="password"
                    defaultValue="whsec_****************************************"
                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button className="bg-[#FFFFFF] hover:bg-[#FFFFFF]/90 text-black font-medium py-2 px-4 rounded-lg transition-all duration-300">
                  Save Changes
                </button>
                <button 
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/create-payment-intent', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          amount: 1.00,
                          currency: 'usd',
                          metadata: {
                            test: 'true',
                            source: 'admin-panel'
                          }
                        }),
                      });
                      
                      if (response.ok) {
                        alert('✅ Stripe connection successful!');
                      } else {
                        const error = await response.json();
                        alert(`❌ Stripe connection failed: ${error.error}`);
                      }
                    } catch (error: any) {
                      alert(`❌ Stripe connection failed: ${error.message}`);
                    }
                  }}
                  className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Test Connection
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'account' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Account Settings</h2>
              
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="bg-gray-700 w-20 h-20 rounded-full flex items-center justify-center">
                    <UserCircleIcon className="w-12 h-12 text-gray-400" />
                  </div>
                  <button className="absolute bottom-0 right-0 bg-[#2A2A2A] rounded-full p-1 hover:bg-[#3A3A3A] transition-colors duration-200">
                    <KeyIcon className="w-4 h-4 text-gray-300" />
                  </button>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Admin User</h3>
                  <p className="text-gray-400">{user?.email || 'admin@voidesports.org'}</p>
                  <button className="text-sm text-[#FFFFFF] hover:text-[#dedede] mt-1">
                    Change profile photo
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#2A2A2A]">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>
              
              <button 
                onClick={handleUpdateProfile}
                disabled={loading}
                className="bg-[#FFFFFF] hover:bg-[#FFFFFF]/90 text-black font-medium py-2 px-4 rounded-lg transition-all duration-300 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          )}
        </div>
        
        <div className="bg-[#0F0F0F] border-t border-[#2A2A2A] px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}