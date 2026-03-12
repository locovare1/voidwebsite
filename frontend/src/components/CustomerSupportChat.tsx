"use client";

import { useState, useEffect, useRef } from 'react';
import { useSupport } from '@/contexts/SupportContext';
import { XMarkIcon, PaperAirplaneIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { Timestamp } from 'firebase/firestore';

interface CustomerSupportChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomerSupportChat({ isOpen, onClose }: CustomerSupportChatProps) {
  const { createTicket, getUserTickets, sendMessage, currentUser } = useSupport();
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [initialMessage, setInitialMessage] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && currentUser) {
      loadTickets();
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [tickets, selectedTicket]);

  const loadTickets = async () => {
    setIsLoading(true);
    const userTickets = await getUserTickets();
    setTickets(userTickets);
    if (userTickets.length > 0 && !selectedTicket) {
      setSelectedTicket(userTickets[0].id || null);
    }
    setIsLoading(false);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleCreateTicket = async () => {
    if (!subject.trim() || !initialMessage.trim() || !customerName.trim() || !customerEmail.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await createTicket(subject, initialMessage, customerName, customerEmail);
      setSubject('');
      setInitialMessage('');
      setCustomerName('');
      setCustomerEmail('');
      setIsCreating(false);
      await loadTickets();
    } catch (error) {
      console.error('Failed to create ticket:', error);
      alert('Failed to create ticket. Please try again.');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;

    try {
      await sendMessage(selectedTicket, newMessage, 'customer');
      setNewMessage('');
      await loadTickets();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const currentTicket = tickets.find(t => t.id === selectedTicket);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity"
        onClick={onClose}
      />

      {/* Chat Window */}
      <div className="relative w-full sm:w-[500px] h-[80vh] sm:h-[600px] bg-[#1A1A1A] border border-[#2A2A2A] rounded-t-2xl sm:rounded-2xl shadow-2xl pointer-events-auto flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A] bg-gradient-to-r from-purple-900/50 to-[#1A1A1A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-purple-800 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0c-2.829 2.829-7.429 2.829-10.243 0-2.828-2.828-2.828-7.428 0-10.242 2.829-2.829 7.429-2.829 10.243 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Customer Support</h3>
              <p className="text-xs text-gray-400">
                {currentUser ? 'We\'re here to help!' : 'Please log in for support'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors"
            aria-label="Close chat"
          >
            <XMarkIcon className="w-6 h-6 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {!currentUser ? (
            /* Login Required Message */
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-600/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Login Required</h4>
                <p className="text-gray-400 text-sm">Please log in to access customer support</p>
              </div>
            </div>
          ) : isCreating ? (
            /* Create New Ticket Form */
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Your Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-600"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-600"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-600"
                    placeholder="Brief description of your issue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                  <textarea
                    value={initialMessage}
                    onChange={(e) => setInitialMessage(e.target.value)}
                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-600 h-32 resize-none"
                    placeholder="Describe your issue in detail..."
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => setIsCreating(false)}
                    className="flex-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateTicket}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-medium py-2 px-4 rounded-lg transition-all"
                  >
                    Create Ticket
                  </button>
                </div>
              </div>
            </div>
          ) : selectedTicket && currentTicket ? (
            /* Chat View */
            <div className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentTicket.messages.map((message: any, index: number) => (
                  <div
                    key={index}
                    className={`flex ${message.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.sender === 'customer'
                          ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white'
                          : 'bg-[#2A2A2A] text-gray-100'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs opacity-60 mt-1">
                        {message.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-[#2A2A2A] bg-[#0F0F0F]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-600"
                    placeholder="Type your message..."
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 disabled:from-gray-600 disabled:to-gray-700 text-white p-2 rounded-xl transition-all disabled:cursor-not-allowed"
                  >
                    <PaperAirplaneIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Tickets List */
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-600/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">No Support Tickets</h4>
                  <p className="text-gray-400 text-sm mb-4">Create your first ticket to get help</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket.id)}
                      className={`w-full p-4 rounded-lg border text-left transition-all ${
                        selectedTicket === ticket.id
                          ? 'bg-purple-600/20 border-purple-600'
                          : 'bg-[#0F0F0F] border-[#2A2A2A] hover:border-purple-600/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-white truncate flex-1">{ticket.subject}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ml-2 ${
                          ticket.status === 'open' ? 'bg-green-600/20 text-green-400' :
                          ticket.status === 'in-progress' ? 'bg-blue-600/20 text-blue-400' :
                          'bg-gray-600/20 text-gray-400'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        {ticket.messages?.length || 0} messages • Updated {ticket.updatedAt?.toDate().toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {/* New Ticket Button */}
              <button
                onClick={() => setIsCreating(true)}
                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <PlusCircleIcon className="w-5 h-5" />
                Create New Ticket
              </button>

              {/* Existing Tickets */}
              {tickets.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[#2A2A2A]">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Your Tickets</h4>
                  <div className="space-y-2">
                    {tickets.slice(0, 3).map((ticket) => (
                      <button
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket.id)}
                        className="w-full p-3 rounded-lg bg-[#0F0F0F] border border-[#2A2A2A] hover:border-purple-600/50 text-left transition-all"
                      >
                        <h4 className="text-sm font-medium text-white truncate">{ticket.subject}</h4>
                        <p className="text-xs text-gray-400 mt-1">
                          {ticket.messages?.length || 0} messages
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
