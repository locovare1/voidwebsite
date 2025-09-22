"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { MagnifyingGlassIcon, ClockIcon, CheckCircleIcon, TruckIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useOrderTracking } from '@/hooks/useOrderTracking';
import Image from 'next/image';
import { formatOrderNumber } from '@/lib/orderUtils';

const statusIcons = {
  pending: ClockIcon,
  accepted: CheckCircleIcon,
  processing: TruckIcon,
  delivered: CheckCircleIcon,
  declined: XCircleIcon,
  canceled: XCircleIcon,
};

const statusColors = {
  pending: 'text-yellow-400 bg-yellow-900/20 border-yellow-500/20',
  accepted: 'text-blue-400 bg-blue-900/20 border-blue-500/20',
  processing: 'text-purple-400 bg-purple-900/20 border-purple-500/20',
  delivered: 'text-green-400 bg-green-900/20 border-green-500/20',
  declined: 'text-red-400 bg-red-900/20 border-red-500/20',
  canceled: 'text-gray-400 bg-gray-900/20 border-gray-500/20',
};

const statusDescriptions = {
  pending: 'Your order has been received and is awaiting confirmation.',
  accepted: 'Your order has been confirmed and is being prepared.',
  processing: 'Your order is currently being processed and will be shipped soon.',
  delivered: 'Your order has been delivered successfully!',
  declined: 'Your order has been declined. Please contact support for more information.',
  canceled: 'Your order has been canceled.',
};

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const { order, loading, error, trackOrder } = useOrderTracking();
  const searchParams = useSearchParams();

  // Auto-fill order number from URL parameter
  useEffect(() => {
    const orderParam = searchParams.get('order');
    if (orderParam) {
      setOrderNumber(orderParam);
      trackOrder(orderParam);
    }
  }, [searchParams, trackOrder]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderNumber.trim()) {
      trackOrder(orderNumber.trim());
    }
  };

  const StatusIcon = order ? statusIcons[order.status] : ClockIcon;

  return (
    <div className="min-h-screen bg-[#0F0F0F] py-12">
      <div className="void-container">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold gradient-text mb-4">Track Your Order</h1>
            <p className="text-gray-400 text-lg">
              Enter your order number to check the status of your purchase
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-8 mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-300 mb-2">
                  Order Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="orderNumber"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="Enter your order number (e.g., VOID-20241222-A1B2C)"
                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] text-white rounded-lg px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] transition-all duration-300"
                    required
                  />
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading || !orderNumber.trim()}
                className="w-full bg-[#FFFFFF] hover:bg-[#FFFFFF]/90 text-black font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed glow-on-hover"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                    Tracking Order...
                  </div>
                ) : (
                  'Track Order'
                )}
              </button>
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/20 text-red-400 rounded-lg p-4 mb-8">
              <div className="flex items-center gap-2">
                <XCircleIcon className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Order Details */}
          {order && (
            <div className="space-y-8">
              {/* Order Status */}
              <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Order #{formatOrderNumber(order.id, true)}
                    </h2>
                    <p className="text-gray-400">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${statusColors[order.status]}`}>
                    <StatusIcon className="w-5 h-5" />
                    <span className="font-medium capitalize">{order.status}</span>
                  </div>
                </div>

                <div className="bg-[#0F0F0F] rounded-lg p-6">
                  <p className="text-gray-300">{statusDescriptions[order.status]}</p>
                </div>
              </div>

              {/* Order Progress */}
              <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-8">
                <h3 className="text-xl font-bold text-white mb-6">Order Progress</h3>
                
                {order.status === 'declined' || order.status === 'canceled' ? (
                  // Show declined/canceled status
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full border-2 border-[#FFFFFF] bg-[#FFFFFF] text-black flex items-center justify-center">
                        <ClockIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-grow">
                        <div className="font-medium text-white">Pending</div>
                        <div className="text-sm text-gray-300">{statusDescriptions.pending}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${statusColors[order.status].replace('text-', 'border-').replace('bg-', 'bg-')} text-current`}>
                        <XCircleIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-grow">
                        <div className={`font-medium ${statusColors[order.status].split(' ')[0]}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </div>
                        <div className={`text-sm ${statusColors[order.status].split(' ')[0].replace('text-', 'text-').replace('400', '300')}`}>
                          {statusDescriptions[order.status]}
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${statusColors[order.status].split(' ')[0].replace('text-', 'bg-')}`}></div>
                    </div>
                  </div>
                ) : (
                  // Show normal progress
                  <div className="space-y-4">
                    {(['pending', 'accepted', 'processing', 'delivered'] as const).map((status, index) => {
                      const isCompleted = ['accepted', 'processing', 'delivered'].includes(order.status) && 
                                        ['pending', 'accepted', 'processing', 'delivered'].indexOf(order.status) >= index;
                      const isCurrent = order.status === status;
                      
                      const StepIcon = statusIcons[status];
                      
                      return (
                        <div key={status} className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                            isCompleted || isCurrent
                              ? 'border-[#FFFFFF] bg-[#FFFFFF] text-black'
                              : 'border-gray-600 bg-[#0F0F0F]'
                          }`}>
                            <StepIcon className="w-5 h-5" />
                          </div>
                          
                          <div className="flex-grow">
                            <div className={`font-medium ${
                              isCompleted || isCurrent 
                                ? 'text-white' 
                                : 'text-gray-400'
                            }`}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </div>
                            <div className={`text-sm ${
                              isCompleted || isCurrent 
                                ? 'text-gray-300' 
                                : 'text-gray-500'
                            }`}>
                              {statusDescriptions[status]}
                            </div>
                          </div>
                          
                          {isCurrent && (
                            <div className="w-3 h-3 bg-[#FFFFFF] rounded-full animate-pulse"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Customer Information */}
              <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-8">
                <h3 className="text-xl font-bold text-white mb-6">Shipping Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Customer</h4>
                    <p className="text-white">{order.customerInfo.name}</p>
                    <p className="text-gray-400">{order.customerInfo.email}</p>
                    <p className="text-gray-400">{order.customerInfo.phone}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Shipping Address</h4>
                    <p className="text-white">{order.customerInfo.address}</p>
                    <p className="text-gray-400">{order.customerInfo.zipCode}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-8">
                <h3 className="text-xl font-bold text-white mb-6">Order Items</h3>
                
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-[#0F0F0F] rounded-lg">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-contain rounded"
                        />
                      </div>
                      
                      <div className="flex-grow">
                        <h4 className="text-white font-medium">{item.name}</h4>
                        <p className="text-gray-400 text-sm">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-white font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-gray-400 text-sm">
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-6 border-t border-[#2A2A2A]">
                  <div className="flex justify-between text-xl font-bold text-white">
                    <span>Total:</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}