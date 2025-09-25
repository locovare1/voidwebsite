"use client";

import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { useCart } from '@/contexts/CartContext';
import { useOrders, Order } from '@/contexts/OrderContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { generateOrderNumber } from '@/lib/orderUtils';

interface CheckoutFormProps {
  clientSecret: string;
  customerInfo: {
    name: string;
    email: string;
    address: string;
    zipCode: string;
    phone: string;
    country: string;
  };
  onSuccess: (order: Order) => void;
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

    // Use the site URL from environment or fallback to window.location.origin
    const returnUrl = process.env.NEXT_PUBLIC_SITE_URL 
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/payment-success`
      : `${window.location.origin}/payment-success`;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
        receipt_email: customerInfo.email,
        shipping: {
          name: customerInfo.name,
          address: {
            line1: customerInfo.address,
            postal_code: customerInfo.zipCode,
            country: customerInfo.country || 'US',
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
        id: generateOrderNumber(),
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
      
      try {
        console.log('Saving paid order to Firebase:', newOrder.id);
        
        // Save order to Firebase with timeout, only if db is available
        if (db) {
          const savePromise = setDoc(doc(db, 'orders', newOrder.id), {
            ...newOrder,
            createdAt: new Date(), // Use Firebase Timestamp
          });
          
          // Add timeout to prevent hanging
          await Promise.race([
            savePromise,
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Firebase timeout')), 10000)
            )
          ]);
          
          console.log('Paid order saved to Firebase successfully');
        } else {
          console.log('Firebase not available, skipping save');
        }
      } catch (error) {
        console.error('Error saving order to Firebase:', error);
        // Don't throw the error, just log it
      }
      
      // Always proceed with local storage and success
      addOrderToContext(newOrder);
      clearCart();
      setMessage('Payment successful! Thank you for your order.');
      
      // Show success message for a moment then show order details
      setTimeout(() => {
        onSuccess(newOrder);
      }, 1500);
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