"use client";

import { useState } from 'react';
import { UserPlusIcon, KeyIcon } from '@heroicons/react/24/outline';
import { AnimatedCard } from '@/components/FramerAnimations';

interface UsersTabProps {
  showCreateUser: boolean;
  setShowCreateUser: (show: boolean) => void;
  newUserEmail: string;
  setNewUserEmail: (email: string) => void;
  newUserPassword: string;
  setNewUserPassword: (password: string) => void;
  creatingUser: boolean;
  handleCreateUser: () => void;
  currentUser: any;
}

export default function UsersTab({
  showCreateUser,
  setShowCreateUser,
  newUserEmail,
  setNewUserEmail,
  newUserPassword,
  setNewUserPassword,
  creatingUser,
  handleCreateUser,
  currentUser
}: UsersTabProps) {
  return (
    <div className="space-y-6">
      <AnimatedCard className="admin-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UserPlusIcon className="w-6 h-6" />
            Admin User Management
          </h2>
          <button
            onClick={() => setShowCreateUser(!showCreateUser)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <UserPlusIcon className="w-4 h-4" />
            {showCreateUser ? 'Cancel' : 'Create New User'}
          </button>
        </div>

        {showCreateUser && (
          <div className="bg-[#0F0F0F] rounded-lg p-6 border border-[#2A2A2A] mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Admin User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password (minimum 6 characters)
                </label>
                <input
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]"
                  placeholder="Enter password"
                />
              </div>
              <button
                onClick={handleCreateUser}
                disabled={creatingUser}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingUser ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </div>
        )}

        <div className="bg-[#0F0F0F] rounded-lg p-6 border border-[#2A2A2A]">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <KeyIcon className="w-5 h-5" />
            Current User
          </h3>
          {currentUser ? (
            <div className="space-y-2">
              <p className="text-gray-300">
                <span className="font-medium">Email:</span> {currentUser.email}
              </p>
              <p className="text-gray-400 text-sm">
                <span className="font-medium">User ID:</span> {currentUser.uid}
              </p>
              <p className="text-gray-400 text-sm">
                All authenticated Firebase users can access the admin panel. Create new users above to give them access.
              </p>
            </div>
          ) : (
            <p className="text-gray-400">Not logged in</p>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg">
          <p className="text-blue-300 text-sm">
            <strong>Note:</strong> All users created here will have full admin access to the admin panel.
            Make sure to only create accounts for trusted team members. Each user will need to log in with
            their own email and password at the admin panel login page.
          </p>
        </div>
      </AnimatedCard>
    </div>
  );
}
