"use client";

import { useEffect, useState } from 'react';
import { XMarkIcon, CheckCircleIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { Order } from '@/contexts/OrderContext';
import Image from 'next/image';
import { formatOrderNumber } from '@/lib/orderUtils';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export default function OrderSuccessModal({ isOpen, onClose, order }: OrderSuccessModalProps) {
  const [copied, setCopied] = useState(false);
  


  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const copyOrderNumber = async () => {
    if (order) {
      try {
        await navigator.clipboard.writeText(order.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy order number:', err);
      }
    }
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10000] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2A2A2A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Order Confirmed!</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-300 p-1"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Success Message */}
          <div className="text-center">
            <p className="text-gray-300 mb-4">
              Thank you for your order! We&apos;ve received your purchase and will process it shortly.
            </p>
            <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-4">
              <p className="text-green-400 text-sm">
                You&apos;ll receive an email confirmation at <span className="font-medium">{order.customerInfo.email}</span>
              </p>
            </div>
          </div>

          {/* Order Number */}
          <div className="bg-[#1A1A1A] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-white">Order Number</h3>
              <button
                onClick={copyOrderNumber}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-300 text-sm"
              >
                <ClipboardDocumentIcon className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="bg-[#0F0F0F] rounded-lg p-3 border border-[#2A2A2A]">
              <p className="text-white font-mono text-lg break-all">{order.id}</p>
              <p className="text-gray-400 text-sm mt-1">Order #{formatOrderNumber(order.id, true)}</p>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Save this number to track your order status
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-[#1A1A1A] rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Order Details</h3>
            
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Order Date:</span>
                <span className="text-white">
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-green-400 capitalize">{order.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Items:</span>
                <span className="text-white">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2 bg-[#0F0F0F] rounded-lg">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain rounded"
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-white text-sm font-medium truncate">{item.name}</p>
                    <p className="text-gray-400 text-xs">
                      Qty: {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-white text-sm font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-[#2A2A2A]">
              <div className="flex justify-between text-lg font-bold text-white">
                <span>Total:</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-[#1A1A1A] rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Shipping Information</h3>
            <div className="space-y-1 text-sm">
              <p className="text-white font-medium">{order.customerInfo.name}</p>
              <p className="text-gray-400">{order.customerInfo.address}</p>
              <p className="text-gray-400">{order.customerInfo.zipCode}</p>
              <p className="text-gray-400">{order.customerInfo.phone}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => window.open(`/track-order?order=${order.id}`, '_blank')}
              className="flex-1 bg-[#FFFFFF] hover:bg-[#FFFFFF]/90 text-black font-bold py-3 px-4 rounded-lg transition-all duration-300 glow-on-hover"
            >
              Track Order
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-3 px-4 rounded-lg transition-all duration-300"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}