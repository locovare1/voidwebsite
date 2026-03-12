"use client";

import { useState } from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid } from '@heroicons/react/24/solid';
import CustomerSupportChat from './CustomerSupportChat';

export default function CustomerSupportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);

  return (
    <>
      {/* Floating Support Button */}
      <div className="fixed bottom-6 right-6 z-40">
        {/* Notification Badge */}
        {hasNotifications && !isOpen && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        )}

        {/* Main Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            relative
            w-14 h-14 
            rounded-full 
            shadow-lg 
            flex 
            items-center 
            justify-center
            transition-all
            duration-300
            hover:scale-110
            focus:outline-none
            focus:ring-2
            focus:ring-purple-500
            focus:ring-offset-2
            focus:ring-offset-[#0F0F0F]
            ${isOpen 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900'
            }
          `}
          aria-label="Customer Support"
        >
          {isOpen ? (
            <ChatBubbleLeftRightIconSolid className="w-7 h-7 text-white" />
          ) : (
            <ChatBubbleLeftRightIcon className="w-7 h-7 text-white" />
          )}
        </button>

        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg shadow-xl whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <span className="text-white text-sm font-medium">Need Help?</span>
            <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-[#1A1A1A] border-r border-b border-[#2A2A2A]" />
          </div>
        )}
      </div>

      {/* Chat Modal */}
      <CustomerSupportChat isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
