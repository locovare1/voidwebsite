"use client";

import { useState, useEffect } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

interface CustomerInfo {
  name: string;
  email: string;
  address: string;
  zipCode: string;
  phone: string;
  country: string;
}

interface CheckoutFormProps {
  clientSecret: string;
  customerInfo: CustomerInfo;
  items: any[];
  total: number;
  onSuccess: (order: any) => void;
  onError: (error: string) => void;
}

export default function CheckoutForm({ clientSecret, customerInfo, items, total, onSuccess, onError }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (elements) {
      setIsMounted(true);
    }
  }, [elements]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements || !isMounted) {
      onError('Payment system not ready. Please try again.');
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        onError(error.message || 'Payment failed');
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        const order = {
          id: paymentIntent.id,
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          })),
          total: total,
          customerInfo: customerInfo,
          status: 'accepted',
          paymentIntentId: paymentIntent.id,
          createdAt: new Date().toISOString(),
        };
        onSuccess(order);
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : 'An error occurred');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="min-h-[200px]">
        {isMounted ? (
          <PaymentElement />
        ) : (
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-400">Loading payment form...</div>
          </div>
        )}
      </div>
      <button
        type="submit"
        disabled={!stripe || !elements || !isMounted || isProcessing}
        className="w-full bg-[#FFFFFF] hover:bg-[#FFFFFF]/90 text-black font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}
