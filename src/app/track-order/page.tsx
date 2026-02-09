"use client";

import { useState } from 'react';
import { useOrderTracking } from '@/hooks/useOrderTracking';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const { order, loading, error, trackOrder } = useOrderTracking();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderNumber.trim()) {
      trackOrder(orderNumber.trim());
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-900/20 text-yellow-400 border-yellow-500/20',
      accepted: 'bg-blue-900/20 text-blue-400 border-blue-500/20',
      processing: 'bg-purple-900/20 text-purple-400 border-purple-500/20',
      delivered: 'bg-green-900/20 text-green-400 border-green-500/20',
      declined: 'bg-red-900/20 text-red-400 border-red-500/20',
      canceled: 'bg-gray-900/20 text-gray-400 border-gray-500/20',
    };
    return colors[status] || 'bg-gray-900/20 text-gray-400 border-gray-500/20';
  };

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-b from-[#1a0a2e] via-[#2a1a3a] to-[#1a0a2e] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Back Button */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-300"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Home
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-4">
              Track Your Order
            </h1>
            <p className="text-gray-400">
              Enter your order number to check the status and details
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#2A2A2A] mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-300 mb-2">
                  Order Number
                </label>
                <input
                  type="text"
                  id="orderNumber"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Enter your order number..."
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] transition-all duration-300"
                  disabled={loading}
                />
              </div>
              
              <button
                type="submit"
                disabled={loading || !orderNumber.trim()}
                className="w-full bg-[#FFFFFF] hover:bg-[#FFFFFF]/90 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 px-4 rounded-lg transition-all duration-300 glow-on-hover"
              >
                {loading ? 'Searching...' : 'Track Order'}
              </button>
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4 mb-8">
              <p className="text-red-400 text-center">{error}</p>
            </div>
          )}

          {/* Order Details */}
          {order && !error && (
            <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#2A2A2A]">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Order #{order.id.substring(0, 8).toUpperCase()}
                </h2>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Order Information</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-400">
                      <span className="text-gray-300">Order Date:</span>{' '}
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p className="text-gray-400">
                      <span className="text-gray-300">Total Amount:</span>{' '}
                      <span className="text-white font-medium">
                        {order.total === 0 ? 'FREE' : `$${order.total.toFixed(2)}`}
                      </span>
                    </p>
                    <p className="text-gray-400">
                      <span className="text-gray-300">Items:</span>{' '}
                      <span className="text-white">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-400">
                      <span className="text-gray-300">Name:</span>{' '}
                      <span className="text-white">{order.customerInfo.name}</span>
                    </p>
                    <p className="text-gray-400">
                      <span className="text-gray-300">Email:</span>{' '}
                      <span className="text-white">{order.customerInfo.email}</span>
                    </p>
                    <p className="text-gray-400">
                      <span className="text-gray-300">Phone:</span>{' '}
                      <span className="text-white">{order.customerInfo.phone}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Order Items</h3>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 bg-[#0F0F0F] rounded-lg">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <div className="bg-gray-700 w-full h-full rounded flex items-center justify-center">
                          <span className="text-gray-400 text-xs">IMG</span>
                        </div>
                      </div>
                      <div className="flex-grow">
                        <p className="text-white font-medium">{item.name}</p>
                        <p className="text-gray-400 text-sm">
                          Qty: {item.quantity} × {item.price === 0 ? 'FREE' : `$${item.price.toFixed(2)}`}
                        </p>
                      </div>
                      <div className="text-white font-medium">
                        {item.price === 0 ? 'FREE' : `$${(item.price * item.quantity).toFixed(2)}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Explanation */}
              <div className="mt-8 pt-6 border-t border-[#2A2A2A]">
                <h3 className="text-lg font-semibold text-white mb-3">Order Status</h3>
                <div className="bg-[#0F0F0F] rounded-lg p-4">
                  <p className="text-gray-400">
                    {order.status === 'pending' && 'Your order is being reviewed and processed.'}
                    {order.status === 'accepted' && 'Your order has been accepted and is being prepared.'}
                    {order.status === 'processing' && 'Your order is currently being processed and prepared for shipment.'}
                    {order.status === 'delivered' && 'Your order has been successfully delivered.'}
                    {order.status === 'declined' && 'Unfortunately, your order has been declined.'}
                    {order.status === 'canceled' && 'Your order has been canceled.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!order && !loading && !error && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-gray-400">
                Enter your order number above to track your order status
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}