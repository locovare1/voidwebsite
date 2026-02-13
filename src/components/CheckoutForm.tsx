"use client";

import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

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
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setMessage(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setMessage("Card element not found");
      setIsProcessing(false);
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: customerInfo.name,
            email: customerInfo.email,
            address: { line1: customerInfo.address, postal_code: customerInfo.zipCode, country: customerInfo.country },
          },
        },
      });

      if (error) {
        setMessage(error.message || "Payment failed");
        onError(error.message || "Payment failed");
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        const order = {
          id: paymentIntent.id,
          items: items.map((item: any) => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity, image: item.image })),
          total,
          customerInfo,
          status: "accepted",
          paymentIntentId: paymentIntent.id,
          createdAt: new Date().toISOString(),
        };
        onSuccess(order);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Payment failed";
      setMessage(errorMsg);
      onError(errorMsg);
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: { 
        color: "#ffffff", 
        fontFamily: "Arial, sans-serif", 
        fontSmoothing: "antialiased", 
        fontSize: "16px", 
        "::placeholder": { color: "#9ca3af" },
        iconColor: "#ffffff",
      },
      invalid: { color: "#ef4444", iconColor: "#ef4444" },
      complete: { color: "#22c55e", iconColor: "#22c55e" },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Card Number with Expiry and CVC */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Card Details</label>
        <div className="p-4 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A]">
          <CardElement options={cardElementOptions} />
        </div>
        <p className="text-xs text-gray-500 mt-2">Enter your card number, expiry date, and CVC in the field above</p>
      </div>

      {message && <div className="text-red-400 text-sm p-3 bg-red-900/20 rounded-lg">{message}</div>}
      
      <button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full bg-[#FFFFFF] hover:bg-[#FFFFFF]/90 text-black font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? "Processing..." : `Pay $${total.toFixed(2)}`}
      </button>
    </form>
  );
}
