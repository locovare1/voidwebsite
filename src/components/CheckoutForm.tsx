"use client";

import { useState, useEffect } from 'react';
import {
  PaymentElement,
  CardElement,
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
  const [useCardElement, setUseCardElement] = useState(false);

  // Try PaymentElement first, fall back to CardElement if it fails
  useEffect(() => {
    // Give PaymentElement time to load, if it doesn't show within 3 seconds, switch to CardElement
    const timer = setTimeout(() => {
      if (!elements) {
        setUseCardElement(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [elements]);

  const handleCardSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setMessage('Card element not found');
      setIsProcessing(false);
      return;
    }

    const { error, paymentIntent } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: {
        name: customerInfo.name,
        email: customerInfo.email,
        address: {
          line1: customerInfo.address,
          postal_code: customerInfo.zipCode,
          country: customerInfo.country,
        },
      },
    });

    if (error) {
      setMessage(error.message || 'Payment failed');
      onError(error.message || 'Payment failed');
      setIsProcessing(false);
      return;
    }

    // Now confirm the payment intent
    if (paymentIntent) {
      const { error: confirmError, paymentIntent: confirmedIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentIntent.id,
      });

      if (confirmError) {
        setMessage(confirmError.message || 'Payment failed');
        onError(confirmError.message || 'Payment failed');
        setIsProcessing(false);
      } else if (confirmedIntent && confirmedIntent.status === 'succeeded') {
        const order = {
          id: confirmedIntent.id,
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
          paymentIntentId: confirmedIntent.id,
          createdAt: new Date().toISOString(),
        };
        onSuccess(order);
      }
    }
  };

  const handlePaymentElementSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
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
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#6b7280',
        },
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
  };

  return (
    <form onSubmit={useCardElement ? handleCardSubmit : handlePaymentElementSubmit} className="space-y-4">
      {useCardElement ? (
        <div className="p-4 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A]">
          <CardElement options={cardElementOptions} />
        </div>
      ) : (
        <div className="min-h-[200px]">
          <PaymentElement />
        </div>
      )}
      
      {message && (
        <div className={`text-sm p-3 rounded-lg ${message.includes('error') || message.includes('wrong') || message.includes('failed') ? 'text-red-400 bg-red-900/20' : 'text-yellow-400 bg-yellow-900/20'}`}>
          {message}
        </div>
      )}
      
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-[#FFFFFF] hover:bg-[#FFFFFF]/90 text-black font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
      </button>
    </form>
  );
}
