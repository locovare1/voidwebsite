"use client";

import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { useCart } from '@/contexts/CartContext';
import { useOrders } from '@/contexts/OrderContext';

interface CheckoutFormProps {
  clientSecret: string;
  customerInfo: {
    name: string;
    email: string;
    address: string;
    zipCode: string;
    phone: string;
  };
  onSuccess: () => void;
  total: number;
}

export default function CheckoutForm({ customerInfo, onSuccess, total }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { clearCart, items } = useCart();
  const { addOrder: addOrderToContext } = useOrders();

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage('');

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
        receipt_email: customerInfo.email,
        shipping: {
          name: customerInfo.name,
          address: {
            line1: customerInfo.address,
            postal_code: customerInfo.zipCode,
            country: 'US',
          },
          phone: customerInfo.phone,
        },
      },
      redirect: 'if_required',
    });

    if (error) {
      if (error.type === 'card_error' || error.type === 'validation_error') {
        setMessage(error.message || 'An error occurred');
      } else {
        setMessage('An unexpected error occurred.');
      }
    } else {
      // Payment succeeded - create order
      const newOrder = {
        id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        total: total,
        customerInfo: customerInfo,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
      };
      
      addOrderToContext(newOrder);
      clearCart();
      setMessage('Payment successful! Thank you for your order.');
      
      // Show success message for a moment then close
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">Payment Details</h3>
        <p className="text-gray-400 text-sm">
          Total: <span className="font-bold text-white">${total.toFixed(2)}</span>
        </p>
      </div>

      <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#2A2A2A]">
        <PaymentElement 
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.includes('successful') 
            ? 'bg-green-900/20 border border-green-500/20 text-green-400' 
            : 'bg-red-900/20 border border-red-500/20 text-red-400'
        }`}>
          {message}
        </div>
      )}

      <button
        disabled={isLoading || !stripe || !elements}
        className="w-full bg-[#FFFFFF] hover:bg-[#FFFFFF]/90 text-black font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed glow-on-hover"
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
            Processing Payment...
          </div>
        ) : (
          `Pay $${total.toFixed(2)}`
        )}
      </button>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          Powered by <span className="font-semibold">Stripe</span> • Secure Payment Processing
        </p>
      </div>
    </form>
  );
}