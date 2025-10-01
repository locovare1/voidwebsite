"use client";

import { useState } from 'react';
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
                    defaultValue="Void Esports"
                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    defaultValue="admin@voidesports.org"
                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Timezone
                  </label>
                  <select className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300">
                    <option>(GMT-12:00) International Date Line West</option>
                    <option>(GMT-11:00) Midway Island, Samoa</option>
                    <option>(GMT-10:00) Hawaii</option>
                    <option>(GMT-09:00) Alaska</option>
                    <option>(GMT-08:00) Pacific Time (US & Canada)</option>
                    <option>(GMT-07:00) Mountain Time (US & Canada)</option>
                    <option>(GMT-06:00) Central Time (US & Canada)</option>
                    <option selected>(GMT-05:00) Eastern Time (US & Canada)</option>
                    <option>(GMT-04:00) Atlantic Time (Canada)</option>
                    <option>(GMT-03:30) Newfoundland</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date Format
                  </label>
                  <select className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300">
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
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#2A2A2A] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
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
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#2A2A2A] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">Order Updates</h3>
                    <p className="text-gray-400 text-sm">Get notified when orders are placed or updated</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#FFFFFF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"></span>
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">Review Notifications</h3>
                    <p className="text-gray-400 text-sm">Receive alerts when new reviews are posted</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#2A2A2A] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">Security Alerts</h3>
                    <p className="text-gray-400 text-sm">Get notified of security-related events</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#FFFFFF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"></span>
                  </button>
                </div>
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
                        className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
                      />
                    </div>
                  </div>
                  <button className="mt-4 bg-[#FFFFFF] hover:bg-[#FFFFFF]/90 text-black font-medium py-2 px-4 rounded-lg transition-all duration-300">
                    Update Password
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
                <button className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg transition-all duration-300">
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
                  <p className="text-gray-400">admin@voidesports.org</p>
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
                    defaultValue="Admin"
                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    defaultValue="User"
                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue="admin@voidesports.org"
                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>
              
              <button className="bg-[#FFFFFF] hover:bg-[#FFFFFF]/90 text-black font-medium py-2 px-4 rounded-lg transition-all duration-300">
                Update Profile
              </button>
            </div>
          )}
        </div>
        
        <div className="bg-[#0F0F0F] border-t border-[#2A2A2A] px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <button className="bg-[#FFFFFF] hover:bg-[#FFFFFF]/90 text-black font-medium py-2 px-4 rounded-lg transition-all duration-300">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}