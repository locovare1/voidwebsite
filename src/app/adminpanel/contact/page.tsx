"use client";

import { useState, useEffect } from 'react';
import { contactService, type ContactMessage } from '@/lib/contactService';
import { 
  TrashIcon,
  EnvelopeIcon,
  EyeIcon,
  CheckIcon,
  ArchiveBoxIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const statusColors = {
  unread: 'bg-yellow-900/20 text-yellow-400 border-yellow-500/20',
  read: 'bg-blue-900/20 text-blue-400 border-blue-500/20',
  replied: 'bg-green-900/20 text-green-400 border-green-500/20',
  archived: 'bg-gray-900/20 text-gray-400 border-gray-500/20',
};

export default function ContactPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ContactMessage['status']>('all');

  const loadMessages = async () => {
    try {
      setLoading(true);
      const items = await contactService.getAll();
      setMessages(items);
    } catch (e) {
      console.error('Error loading messages:', e);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleStatusChange = async (id: string, newStatus: ContactMessage['status']) => {
    try {
      await contactService.update(id, { status: newStatus });
      await loadMessages();
      if (selectedMessage?.id === id) {
        const updated = await contactService.getById(id);
        if (updated) setSelectedMessage(updated);
      }
    } catch (e) {
      console.error('Error updating status:', e);
      alert('Failed to update status. Please try again.');
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      await contactService.remove(id);
      await loadMessages();
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
    } catch (e) {
      console.error('Error deleting message:', e);
      alert('Failed to delete message. Please try again.');
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const openMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);
    if (message.status === 'unread') {
      await handleStatusChange(message.id!, 'read');
    }
  };

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = 
      msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || msg.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Contact Messages</h1>
          <p className="text-gray-400 mt-1">View and manage contact form submissions</p>
          {unreadCount > 0 && (
            <p className="text-yellow-400 mt-2 text-sm">
              {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, subject or message..."
              className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
          >
            <option value="all">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
          <div className="p-4 border-b border-[#2A2A2A]">
            <h2 className="text-xl font-semibold text-white">Messages ({filteredMessages.length})</h2>
          </div>
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FFFFFF] mx-auto mb-2"></div>
                <p>Loading messages...</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p>No messages found</p>
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {filteredMessages.map((message) => (
                  <div
                    key={message.id ?? message.email}
                    onClick={() => openMessage(message)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                      selectedMessage?.id === message.id
                        ? 'bg-[#2A2A2A] border-[#FFFFFF]/30'
                        : 'border-[#3A3A3A] hover:bg-[#2A2A2A] hover:border-[#FFFFFF]/20'
                    } ${message.status === 'unread' ? 'border-l-4 border-l-yellow-400' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold truncate">{message.name}</h3>
                        <p className="text-sm text-gray-400 truncate">{message.email}</p>
                      </div>
                      {message.status === 'unread' && (
                        <div className="w-2 h-2 bg-yellow-400 rounded-full ml-2 flex-shrink-0"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 truncate mb-2">{message.subject}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[message.status]}`}>
                        {message.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {message.createdAt ? new Date(message.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
          {selectedMessage ? (
            <>
              <div className="p-4 border-b border-[#2A2A2A] flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Message Details</h2>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm text-gray-400">From</label>
                  <p className="text-white font-semibold">{selectedMessage.name}</p>
                  <p className="text-gray-300">{selectedMessage.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Subject</label>
                  <p className="text-white">{selectedMessage.subject}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Message</label>
                  <p className="text-white whitespace-pre-wrap bg-[#0F0F0F] p-4 rounded-lg border border-[#2A2A2A]">
                    {selectedMessage.message}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Received</label>
                  <p className="text-white">
                    {selectedMessage.createdAt ? new Date(selectedMessage.createdAt.seconds * 1000).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div className="flex gap-2 pt-4 border-t border-[#2A2A2A]">
                  <select
                    value={selectedMessage.status}
                    onChange={(e) => handleStatusChange(selectedMessage.id!, e.target.value as ContactMessage['status'])}
                    className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]"
                  >
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                    <option value="archived">Archived</option>
                  </select>
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2"
                  >
                    <EnvelopeIcon className="w-4 h-4" />
                    Reply
                  </a>
                  <button
                    onClick={() => setShowDeleteConfirm(selectedMessage.id!)}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-gray-400">
              <EnvelopeIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Select a message to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl max-w-md w-full p-6 transform transition-all duration-300 scale-100">
            <div className="text-center">
              <div className="text-red-400 mb-4">
                <TrashIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Message</h3>
              <p className="text-gray-400 mb-6">Are you sure you want to delete this message? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button 
                  onClick={()=>setShowDeleteConfirm(null)} 
                  className="flex-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={()=>{ if (showDeleteConfirm) deleteMessage(showDeleteConfirm); }} 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

