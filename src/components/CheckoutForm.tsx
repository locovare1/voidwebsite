"use client";

import { useState, FormEvent } from 'react';
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
  total: number;
  onSuccess: (order: any) => void;
  onError: (error: string) => void;
}

export default function CheckoutForm({ clientSecret, customerInfo, total, onSuccess, onError }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
        redirect: 'if_required',
      });

      if (error) {
        onError(error.message || 'Payment failed');
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Create order object from payment intent and customer info
        const order = {
          id: paymentIntent.id,
          customerInfo,
          total,
          status: 'completed',
          paymentIntentId: paymentIntent.id,
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
      <PaymentElement />
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

