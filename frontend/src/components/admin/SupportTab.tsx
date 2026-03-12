"use client";

import { useState, useEffect } from 'react';
import { useSupport } from '@/contexts/SupportContext';
import { ChatBubbleLeftRightIcon, PencilIcon, TrashIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import { AnimatedCard } from '@/components/FramerAnimations';
import { Timestamp } from 'firebase/firestore';

interface AdminSupportTabProps {
  onLogAction?: (action: any, entity: any, entityId: string, details: string, options?: any) => Promise<string>;
}

export default function AdminSupportTab({ onLogAction }: AdminSupportTabProps) {
  const { getAllTickets, updateTicketStatus, updateTicketSubject, deleteTicket, sendMessage, subscribeToTicket } = useSupport();
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [newSubject, setNewSubject] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'in-progress' | 'closed'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTickets();
  }, [filter]);

  useEffect(() => {
    if (selectedTicket) {
      const unsubscribe = subscribeToTicket(selectedTicket, (ticket) => {
        setTickets(prev => prev.map(t => t.id === ticket.id ? ticket : t));
      });
      return () => unsubscribe();
    }
  }, [selectedTicket]);

  const loadTickets = async () => {
    setIsLoading(true);
    const allTickets = await getAllTickets();
    
    if (filter !== 'all') {
      const filtered = allTickets.filter(t => t.status === filter);
      setTickets(filtered);
    } else {
      setTickets(allTickets);
    }
    
    setIsLoading(false);
  };

  const handleStatusChange = async (ticketId: string, newStatus: 'open' | 'in-progress' | 'closed') => {
    try {
      await updateTicketStatus(ticketId, newStatus);
      await loadTickets();
      
      if (onLogAction) {
        await onLogAction('update', 'supportTicket', ticketId, `Changed ticket status to ${newStatus}`, {
          level: 'info',
          status: 'success',
          metadata: { newStatus }
        });
      }
      
      alert('Ticket status updated successfully!');
    } catch (error) {
      console.error('Failed to update ticket status:', error);
      alert('Failed to update ticket status');
    }
  };

  const handleEditSubject = (ticketId: string, currentSubject: string) => {
    setEditingSubject(ticketId);
    setNewSubject(currentSubject);
  };

  const handleSaveSubject = async (ticketId: string) => {
    try {
      await updateTicketSubject(ticketId, newSubject);
      setEditingSubject(null);
      await loadTickets();
      
      if (onLogAction) {
        await onLogAction('update', 'supportTicket', ticketId, `Updated ticket subject`, {
          level: 'info',
          status: 'success',
          metadata: { newSubject }
        });
      }
      
      alert('Ticket subject updated successfully!');
    } catch (error) {
      console.error('Failed to update ticket subject:', error);
      alert('Failed to update ticket subject');
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) return;

    try {
      await deleteTicket(ticketId);
      setSelectedTicket(null);
      await loadTickets();
      
      if (onLogAction) {
        await onLogAction('delete', 'supportTicket', ticketId, 'Deleted support ticket', {
          level: 'info',
          status: 'success'
        });
      }
      
      alert('Ticket deleted successfully!');
    } catch (error) {
      console.error('Failed to delete ticket:', error);
      alert('Failed to delete ticket');
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;

    try {
      await sendMessage(selectedTicket, replyMessage, 'admin');
      setReplyMessage('');
      await loadTickets();
      
      if (onLogAction) {
        await onLogAction('create', 'supportMessage', selectedTicket, 'Sent admin reply to customer', {
          level: 'info',
          status: 'success',
          metadata: { messageLength: replyMessage.length }
        });
      }
    } catch (error) {
      console.error('Failed to send reply:', error);
      alert('Failed to send reply');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  const currentTicket = tickets.find(t => t.id === selectedTicket);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'in-progress': return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
      case 'closed': return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
      default: return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    }
  };

  return (
    <div className="space-y-6">
      <AnimatedCard className="admin-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="w-6 h-6" />
            Customer Support Tickets
          </h2>
          <button
            onClick={loadTickets}
            className="flex items-center gap-2 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 border-b border-[#2A2A2A] pb-2">
          {(['all', 'open', 'in-progress', 'closed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === status
                  ? 'bg-purple-600 text-white'
                  : 'bg-[#1A1A1A] text-gray-400 hover:text-white hover:bg-[#2A2A2A]'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== 'all' && (
                <span className="ml-2 opacity-60">
                  ({tickets.filter(t => t.status === status).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-600/20 flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="w-8 h-8 text-purple-400" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">No Support Tickets</h4>
            <p className="text-gray-400 text-sm">
              {filter === 'all' ? 'No tickets have been created yet' : `No ${filter} tickets`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tickets List */}
            <div className="lg:col-span-1 space-y-2 max-h-[600px] overflow-y-auto">
              {tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket.id || null)}
                  className={`w-full p-4 rounded-lg border text-left transition-all ${
                    selectedTicket === ticket.id
                      ? 'bg-purple-600/20 border-purple-600'
                      : 'bg-[#0F0F0F] border-[#2A2A2A] hover:border-purple-600/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-white text-sm truncate flex-1">
                      {ticket.subject}
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded-full border ${getStatusBadgeClass(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="truncate">{ticket.userEmail}</span>
                    <span>
                      {ticket.messages?.length || 0} msgs • {ticket.updatedAt?.toDate().toLocaleDateString()}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Ticket Detail View */}
            {selectedTicket && currentTicket ? (
              <div className="lg:col-span-2 bg-[#0F0F0F] rounded-lg border border-[#2A2A2A] overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-[#2A2A2A]">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      {editingSubject === currentTicket.id ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newSubject}
                            onChange={(e) => setNewSubject(e.target.value)}
                            className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded px-3 py-1 text-white text-sm"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveSubject(currentTicket.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingSubject(null)}
                            className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white px-3 py-1 rounded text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <h3 className="text-lg font-bold text-white mb-1">{currentTicket.subject}</h3>
                          <button
                            onClick={() => handleEditSubject(currentTicket.id, currentTicket.subject)}
                            className="flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm"
                          >
                            <PencilIcon className="w-3 h-3" />
                            Edit Subject
                          </button>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={currentTicket.status}
                        onChange={(e) => handleStatusChange(currentTicket.id, e.target.value as any)}
                        className="bg-[#1A1A1A] border border-[#2A2A2A] rounded px-3 py-1 text-white text-sm"
                      >
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="closed">Closed</option>
                      </select>
                      <button
                        onClick={() => handleDeleteTicket(currentTicket.id)}
                        className="bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 text-red-400 p-2 rounded transition-colors"
                        title="Delete Ticket"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Customer:</span>
                      <span className="text-white ml-2">{currentTicket.userEmail}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Created:</span>
                      <span className="text-white ml-2">{currentTicket.createdAt?.toDate().toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="p-4 h-[300px] overflow-y-auto space-y-3 bg-[#0A0A0A]">
                  {currentTicket.messages.map((message: any, index: number) => (
                    <div
                      key={index}
                      className={`flex ${message.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-xl px-4 py-2 ${
                          message.sender === 'customer'
                            ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white'
                            : 'bg-[#2A2A2A] text-gray-100 border border-[#3A3A3A]'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className="text-xs opacity-60 mt-1">
                          {message.timestamp?.toDate().toLocaleString()} • {message.sender}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply Input */}
                <div className="p-4 border-t border-[#2A2A2A] bg-[#0F0F0F]">
                  <div className="flex gap-2">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-600 resize-none h-20"
                      placeholder="Type your reply..."
                    />
                    <button
                      onClick={handleSendReply}
                      disabled={!replyMessage.trim()}
                      className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-all disabled:cursor-not-allowed self-end"
                    >
                      Send Reply
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="lg:col-span-2 flex items-center justify-center bg-[#0F0F0F] rounded-lg border border-[#2A2A2A] p-12">
                <div className="text-center">
                  <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-400">Select a ticket to view details</h4>
                </div>
              </div>
            )}
          </div>
        )}
      </AnimatedCard>
    </div>
  );
}
