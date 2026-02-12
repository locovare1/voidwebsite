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
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe) {
      return;
    }

    if (!elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setMessage(error.message || 'An error occurred');
      onError(error.message || 'Payment failed');
      setIsProcessing(false);
    } else {
      // Payment succeeded - but we need to check via stripe.retrievePaymentIntent
      // Since redirect: 'if_required', we handle success differently
    }
  };

  // Also listen for payment intent status changes
  useEffect(() => {
    if (!stripe || !clientSecret) return;

    const retrievePaymentIntent = async () => {
      const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
      
      if (paymentIntent) {
        switch (paymentIntent.status) {
          case 'succeeded':
            const order = {
              id: paymentIntent.id,
              items: items.map((item: any) => ({
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
            break;
          case 'processing':
            setMessage('Processing your payment...');
            break;
          case 'requires_payment_method':
            setMessage('Please provide your payment details.');
            setIsProcessing(false);
            break;
          default:
            setMessage('Something went wrong.');
            setIsProcessing(false);
            break;
        }
      }
    };

    retrievePaymentIntent();
  }, [stripe, clientSecret, items, total, customerInfo, onSuccess]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="min-h-[200px]">
        <PaymentElement />
      </div>
      
      {message && (
        <div className={`text-sm p-3 rounded-lg ${message.includes('error') || message.includes('wrong') ? 'text-red-400 bg-red-900/20' : 'text-yellow-400 bg-yellow-900/20'}`}>
          {message}
        </div>
      )}
      
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-[#FFFFFF] hover:bg-[#FFFFFF]/90 text-black font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}
