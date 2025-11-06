"use client";

import { useState, useEffect, useCallback } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Elements } from '@stripe/react-stripe-js';
import getStripe from '@/lib/stripe';
import CheckoutForm from './CheckoutForm';
import { useOrders, Order } from '@/contexts/OrderContext';
import { useCart } from '@/contexts/CartContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import OrderSuccessModal from './OrderSuccessModal';
import { generateOrderNumber } from '@/lib/orderUtils';


interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  items: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
}

interface CustomerInfo {
  name: string;
  email: string;
  address: string;
  zipCode: string;
  phone: string;
  country: string;
}

export default function CheckoutModal({ isOpen, onClose, total, items }: CheckoutModalProps) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    address: '',
    zipCode: '',
    phone: '',
    country: '',
  });
  
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [orderProcessed, setOrderProcessed] = useState(false);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

  
  const { addOrder } = useOrders();
  const { clearCart } = useCart();

  const isFormValid = Object.values(customerInfo).every(value => value.trim() !== '');
  const subtotal = total;
  // For free products, we don't apply tax
  const tax = (total > 0) ? total * 0.08 : 0;
  const finalTotal = subtotal + tax + shippingCost;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setOrderProcessed(false); // Reset when opening
    } else {
      document.body.style.overflow = 'unset';
      if (!orderProcessed) {
        setShowPayment(false);
        setClientSecret('');
      }
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, orderProcessed]);

  /**
   * Calculate the total weight of items in the cart
   * This is a simplified implementation - in a real app, you would have actual product weights
   * @returns Total weight in pounds
   */
  const calculateOrderWeight = useCallback((): number => {
    // Simplified: assume each item weighs 1 pound
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  // Calculate shipping cost when zip/country changes
  useEffect(() => {
    const calculateShipping = async () => {
      // Only calculate if we have the required fields
      if (customerInfo.zipCode && customerInfo.country) {
        setIsCalculatingShipping(true);
        console.log('Calculating shipping for:', {
          destinationZip: customerInfo.zipCode,
          destinationCountry: customerInfo.country
        });
        
        try {
          // Use the new simplified shipping API with mathematical formula
          const response = await fetch('/api/calculate-shipping', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              destinationZip: customerInfo.zipCode,
              destinationCountry: customerInfo.country
            }),
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Shipping calculation result:', data);
            setShippingCost(data.shippingCost);
          } else {
            const errorData = await response.json();
            console.log('Shipping API returned error:', errorData);
            
            // For non-US addresses, set shipping to 0 (not supported)
            if (customerInfo.country.toUpperCase() !== 'US') {
              setShippingCost(0);
            } else {
              // For US addresses with invalid ZIP, use fallback
              setShippingCost(23.50); // Base cost from formula
            }
          }
        } catch (error) {
          console.error('Error calculating shipping:', error);
          // Fallback to base cost for US, 0 for international
          if (customerInfo.country.toUpperCase() === 'US') {
            setShippingCost(23.50); // Base cost from formula
          } else {
            setShippingCost(0);
          }
        } finally {
          setIsCalculatingShipping(false);
        }
      }
    };

    // Debounce the shipping calculation
    const timer = setTimeout(() => {
      // Always run the calculation
      calculateShipping();
    }, 500);

    return () => clearTimeout(timer);
  }, [customerInfo.zipCode, customerInfo.country, customerInfo, subtotal, calculateOrderWeight]);



  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };



  const handleProceedToPayment = async () => {
    if (!isFormValid) return;

    setIsLoading(true);
    
    try {
      // If total is $0 or less, skip payment processing and create order directly
      if (finalTotal <= 0) {
        // Create order directly for free items
        const newOrder = {
          id: generateOrderNumber(),
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          total: finalTotal,
          customerInfo: customerInfo,
          status: 'accepted' as const, // Free orders are automatically accepted
          createdAt: new Date().toISOString(),
        };
        
        try {
          console.log('Saving order to Firebase:', newOrder.id);
          
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
            
            console.log('Order saved to Firebase successfully');
          } else {
            console.log('Firebase not available, skipping save');
          }
        } catch (error) {
          console.error('Error saving free order to Firebase:', error);
          // Don't show alert, just log the error
        }
        
        // Always proceed with local storage and success modal
        addOrder(newOrder);
        clearCart();
        
        // Set the completed order and show success modal immediately
        setCompletedOrder(newOrder);
        setOrderProcessed(true);
        setShowSuccessModal(true);
        
        // Close the checkout modal immediately
        onClose();
        
        return;
      }

      // For paid orders, proceed with Stripe
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: finalTotal,
          currency: 'usd',
          metadata: {
            customerName: customerInfo.name,
            customerEmail: customerInfo.email,
            customerAddress: customerInfo.address,
            customerZipCode: customerInfo.zipCode,
            customerPhone: customerInfo.phone,
            customerCountry: customerInfo.country,
            items: JSON.stringify(items.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price
            }))),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initialize payment');
      }

      const responseData = await response.json();
      const { clientSecret } = responseData;
      
      setClientSecret(clientSecret);
      setShowPayment(true);
    } catch (error) {
      console.error('Error creating payment intent:', error);
      alert('Failed to initialize payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const appearance = {
    theme: 'night' as const,
    variables: {
      colorPrimary: '#FFFFFF',
      colorBackground: '#1A1A1A',
      colorText: '#FFFFFF',
      colorDanger: '#df1b41',
      fontFamily: 'Arial, Helvetica, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <>
      {/* Checkout Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2A2A2A]">
          <h2 className="text-xl font-bold gradient-text">
            {showPayment ? 'Complete Payment' : 'Checkout'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-300 p-1"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {!showPayment ? (
            <>
              {/* Customer Information Form */}
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Shipping Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={customerInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
                    placeholder="Enter your address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      value={customerInfo.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
                      placeholder="ZIP Code"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
                      placeholder="Phone"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Country *
                  </label>
                  <select
                    value={customerInfo.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
                  >
                    <option value="">Select your country</option>
                    <option value="US">United States</option>
                  </select>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-[#1A1A1A] rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>{subtotal <= 0 ? 'FREE' : `$${subtotal.toFixed(2)}`}</span>
                  </div>
                  {subtotal > 0 && (
                    <div className="flex justify-between text-gray-400">
                      <span>Tax (8%)</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-400">
                    <span>Shipping</span>
                    <span>
                      {isCalculatingShipping ? (
                        <span className="text-gray-400">Calculating...</span>
                      ) : shippingCost > 0 ? (
                        `$${shippingCost.toFixed(2)}`
                      ) : (
                        'Free'
                      )}
                    </span>
                  </div>
                  <div className="border-t border-[#2A2A2A] pt-2 mt-2">
                    <div className="flex justify-between text-white font-bold">
                      <span>Total</span>
                      <span>{finalTotal <= 0 ? 'FREE' : `$${finalTotal.toFixed(2)}`}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Proceed Button */}
              <button
                onClick={handleProceedToPayment}
                disabled={!isFormValid || isLoading}
                className="w-full bg-[#FFFFFF] hover:bg-[#FFFFFF]/90 text-black font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed glow-on-hover"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : finalTotal <= 0 ? (
                  'Place Free Order'
                ) : (
                  `Pay with Stripe - $${finalTotal.toFixed(2)}`
                )}
              </button>
            </>
          ) : (
            <>
              {/* Payment Form */}
              {clientSecret && (
                <Elements options={options} stripe={getStripe()}>
                  <CheckoutForm 
                    clientSecret={clientSecret}
                        customerInfo={customerInfo}
                        onSuccess={(order) => {
                          setCompletedOrder(order);
                          setOrderProcessed(true);
                          setShowSuccessModal(true);
                          // Close checkout modal immediately
                          onClose();
                        }}
                        total={finalTotal}
                      />
                </Elements>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )}

      {/* Order Success Modal - Persists even when checkout modal closes */}
      <OrderSuccessModal
        isOpen={showSuccessModal && orderProcessed}
        onClose={() => {
          setShowSuccessModal(false);
          setCompletedOrder(null);
          setOrderProcessed(false);
          // Reset checkout modal state
          setCustomerInfo({
            name: '',
            email: '',
            address: '',
            zipCode: '',
            phone: '',
            country: '',
          });
          setShowPayment(false);
          setClientSecret('');
        }}
        order={completedOrder}
      />
    </>
  );
}