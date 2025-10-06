"use client";

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Elements } from '@stripe/react-stripe-js';
import stripePromise from '@/lib/stripe';
import CheckoutForm from './CheckoutForm';
import { useOrders, Order } from '@/contexts/OrderContext';
import { useCart } from '@/contexts/CartContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import OrderSuccessModal from './OrderSuccessModal';
import { generateOrderNumber } from '@/lib/orderUtils';
import { countries, Country, getCountryByCode } from '@/lib/countries';

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

  // Calculate shipping cost when address/zip/country changes
  useEffect(() => {
    const calculateShipping = async () => {
      // Only calculate if we have the required fields
      if (customerInfo.zipCode && customerInfo.country) {
        setIsCalculatingShipping(true);
        console.log('Calculating shipping for:', {
          destinationAddress: customerInfo.address,
          destinationZip: customerInfo.zipCode,
          destinationCountry: customerInfo.country,
          weight: calculateOrderWeight()
        });
        
        try {
          // In a real implementation, you would get the origin ZIP and country from your business location
          // For this example, we'll use a mock origin (New York address)
          const response = await fetch('/api/calculate-shipping', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              originAddress: '123 Main St',
              originCity: 'New York',
              originState: 'NY',
              originZip: '10001',
              originCountry: 'US',
              destinationAddress: customerInfo.address,
              destinationCity: '', // We don't collect city separately, but could parse from address
              destinationState: '', // We don't collect state separately, but could parse from address
              destinationZip: customerInfo.zipCode,
              destinationCountry: customerInfo.country,
              weight: calculateOrderWeight(), // Calculate total weight of items
            }),
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Shipping calculation result:', data);
            setShippingCost(data.shippingCost);
          } else {
            console.log('Shipping API returned error status:', response.status);
            // If there's an error, use a default shipping cost based on distance calculation
            const distanceFactor = calculateDistanceFactor('10001', customerInfo.zipCode, 'US', customerInfo.country);
            const weightFactor = calculateOrderWeight() * 0.5;
            const baseRate = 5.00;
            const fallbackCost = Math.max(2.00, baseRate + weightFactor + distanceFactor);
            setShippingCost(fallbackCost);
          }
        } catch (error) {
          console.error('Error calculating shipping:', error);
          // If there's an error, use a default shipping cost based on distance calculation
          const distanceFactor = calculateDistanceFactor('10001', customerInfo.zipCode, 'US', customerInfo.country);
          const weightFactor = calculateOrderWeight() * 0.5;
          const baseRate = 5.00;
          const fallbackCost = Math.max(2.00, baseRate + weightFactor + distanceFactor);
          setShippingCost(fallbackCost);
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
  }, [customerInfo.zipCode, customerInfo.country, customerInfo, subtotal]);

  /**
   * Calculate a distance factor based on postal codes (simplified)
   * @param originZip - Origin postal code
   * @param destinationZip - Destination postal code
   * @param originCountry - Origin country code
   * @param destinationCountry - Destination country code
   * @returns Distance factor for shipping cost calculation
   */
  const calculateDistanceFactor = (
    originZip: string, 
    destinationZip: string, 
    originCountry: string, 
    destinationCountry: string
  ): number => {
    // For international shipments, calculate based on continent distance
    const isInternational = originCountry !== destinationCountry;
    
    // If it's an international shipment, use continent-based distance calculation
    if (isInternational) {
      // Simple approach: assign distance factors based on continent groups
      const continentGroups: Record<string, number[]> = {
        // North America
        'NA': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        // Europe
        'EU': [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        // Asia
        'AS': [21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
        // Africa
        'AF': [31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
        // South America
        'SA': [41, 42, 43, 44, 45, 46, 47, 48, 49, 50],
        // Oceania
        'OC': [51, 52, 53, 54, 55, 56, 57, 58, 59, 60]
      };
      
      // Assign countries to continent groups (simplified)
      const countryToContinent: Record<string, string> = {
        'US': 'NA', 'CA': 'NA', 'MX': 'NA',
        'GB': 'EU', 'DE': 'EU', 'FR': 'EU', 'IT': 'EU', 'ES': 'EU', 'NL': 'EU', 'SE': 'EU', 'CH': 'EU', 'AT': 'EU', 'BE': 'EU', 'DK': 'EU', 'FI': 'EU', 'NO': 'EU', 'IE': 'EU', 'PT': 'EU', 'GR': 'EU', 'CZ': 'EU', 'HU': 'EU', 'PL': 'EU', 'RO': 'EU',
        'SA': 'AS', 'JP': 'AS', 'CN': 'AS', 'IN': 'AS', 'KR': 'AS', 'AE': 'AS', 'SG': 'AS', 'MY': 'AS', 'TH': 'AS', 'IL': 'AS', 'ID': 'AS', 'PH': 'AS', 'VN': 'AS', 'BD': 'AS', 'PK': 'AS', 'TW': 'AS', 'HK': 'AS',
        'EG': 'AF', 'ZA': 'AF', 'NG': 'AF', 'KE': 'AF', 'MA': 'AF',
        'BR': 'SA', 'AR': 'SA', 'CL': 'SA', 'CO': 'SA',
        'AU': 'OC', 'NZ': 'OC'
      };
      
      const originContinent = countryToContinent[originCountry] || 'NA';
      const destinationContinent = countryToContinent[destinationCountry] || 'NA';
      
      // Calculate distance based on continent groups
      const originGroup = continentGroups[originContinent] || [1];
      const destinationGroup = continentGroups[destinationContinent] || [1];
      
      // Use the first value in each group to calculate distance
      const distance = Math.abs(originGroup[0] - destinationGroup[0]);
      
      // Convert distance to cost (higher distance = higher cost)
      // Scale factor: 0.5 per group distance unit, with minimum of $5 and maximum of $50
      return Math.min(50, Math.max(5, distance * 0.5));
    }
    
    // For domestic shipments (US only), calculate based on ZIP code difference
    if (originCountry === 'US' && destinationCountry === 'US') {
      // Extract numeric parts of ZIP codes
      const originNumeric = parseInt(originZip.replace(/\D/g, ''), 10) || 0;
      const destinationNumeric = parseInt(destinationZip.replace(/\D/g, ''), 10) || 0;
      
      // Calculate absolute difference
      const zipDifference = Math.abs(originNumeric - destinationNumeric);
      
      // Convert difference to cost (higher difference = higher cost)
      // Scale factor: $1 per 10000 ZIP code units, with minimum of $2 and maximum of $20
      return Math.min(20, Math.max(2, zipDifference / 10000));
    }
    
    // For other domestic shipments, use a default calculation based on postal code similarity
    // Extract alphanumeric characters and take the first 3 characters for comparison
    const originCode = originZip.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
    const destinationCode = destinationZip.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
    
    // If either code is empty, return a default distance factor
    if (!originCode || !destinationCode) {
      return 5.00;
    }
    
    // Calculate a rough "distance" based on character differences
    let difference = 0;
    for (let i = 0; i < Math.min(originCode.length, destinationCode.length); i++) {
      // Compare ASCII values of characters
      difference += Math.abs(originCode.charCodeAt(i) - destinationCode.charCodeAt(i));
    }
    
    // Normalize the difference to a cost factor (simplified)
    // Scale factor: 0.1 per character difference, with minimum of $2 and maximum of $25
    const normalizedDifference = difference * 0.1;
    return Math.min(25.00, Math.max(2.00, normalizedDifference));
  };

  /**
   * Calculate the total weight of items in the cart
   * This is a simplified implementation - in a real app, you would have actual product weights
   * @returns Total weight in pounds
   */
  const calculateOrderWeight = (): number => {
    // Simplified: assume each item weighs 1 pound
    return items.reduce((total, item) => total + item.quantity, 0);
  };

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

      const { clientSecret } = await response.json();
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
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
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
                <Elements options={options} stripe={stripePromise}>
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