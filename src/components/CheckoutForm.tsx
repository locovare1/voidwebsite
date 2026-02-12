"use client";

import { useState, useEffect, useCallback } from 'react';
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
  const [paymentReady, setPaymentReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Wait for the PaymentElement to be fully mounted and ready
  const handlePaymentElementReady = useCallback(() => {
    setPaymentReady(true);
  }, []);

  const handlePaymentElementChange = useCallback((event: any) => {
    if (event.complete) {
      setPaymentReady(true);
      setErrorMessage(null);
    } else {
      setPaymentReady(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe) {
      onError('Stripe is not initialized. Please refresh the page.');
      return;
    }

    if (!elements) {
      onError('Payment form is not ready. Please try again.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // First, verify the elements are ready
      const paymentElement = elements.getElement('payment');
      if (!paymentElement) {
        onError('Payment element not found. Please refresh and try again.');
        setIsProcessing(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'Payment failed');
        onError(error.message || 'Payment failed');
        setIsProcessing(false);
      } else if (paymentIntent) {
        if (paymentIntent.status === 'succeeded') {
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
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setErrorMessage(errorMsg);
      onError(errorMsg);
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="min-h-[200px]">
        <PaymentElement 
          onReady={handlePaymentElementReady}
          onChange={handlePaymentElementChange}
          options={{
            layout: 'tabs'
          }}
        />
      </div>
      
      {errorMessage && (
        <div className="text-red-400 text-sm p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
          {errorMessage}
        </div>
      )}
      
      <button
        type="submit"
        disabled={!stripe || !elements || !paymentReady || isProcessing}
        className="w-full bg-[#FFFFFF] hover:bg-[#FFFFFF]/90 text-black font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}
