"use client";

import { useCart } from '@/contexts/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import CheckoutModal from '@/components/CheckoutModal';
import AdPlaceholder from '@/components/AdPlaceholder';

export default function CartPage() {
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  const handleCheckout = () => {
    setIsCheckoutModalOpen(true);
  };

  if (items.length === 0) {
    return (
      <div className="pt-20 min-h-screen bg-gradient-to-b from-[#1a0a2e] via-[#2a1a3a] to-[#1a0a2e] relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 py-12 relative z-10">
          {/* Ad Spot - Banner at top */}
          <div className="mb-8">
            <AdPlaceholder size="banner" />
          </div>

          <div className="text-center">
            <div className="max-w-md mx-auto">
              <div className="text-gray-400 mb-8">
                <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold gradient-text mb-4">Your Cart is Empty</h1>
              <p className="text-gray-400 mb-8">
                Looks like you haven&apos;t added any items to your cart yet. Check out our amazing products!
              </p>
              <Link href="/shop" className="void-button glow-on-hover inline-block">
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Ad Spot - Banner at bottom */}
          <div className="mt-12">
            <AdPlaceholder size="banner" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-b from-[#1a0a2e] via-[#2a1a3a] to-[#1a0a2e] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Ad Spot - Banner at top */}
        <div className="mb-8">
          <AdPlaceholder size="banner" />
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Shopping Cart</h1>
          <p className="text-gray-400">Review your items and proceed to checkout</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">
                Cart Items ({items.reduce((sum, item) => sum + item.quantity, 0)})
              </h2>
              <button
                onClick={clearCart}
                className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors duration-300"
              >
                Clear Cart
              </button>
            </div>

            {items.map((item) => (
              <div
                key={item.id}
                className="bg-[#1A1A1A] rounded-xl p-6 border border-[#2A2A2A] hover:border-[#3A3A3A] transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative w-full sm:w-24 h-24 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain rounded-lg"
                    />
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-400 mb-2">{item.category}</p>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold text-white">
                          {item.price === 0 ? 'FREE' : `$${item.price.toFixed(2)}`}
                        </p>
                        <p className="text-sm text-gray-400">each</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 gap-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-[#2A2A2A] hover:bg-[#3A3A3A] flex items-center justify-center text-white transition-colors duration-300"
                        >
                          <MinusIcon className="w-4 h-4" />
                        </button>
                        
                        <span className="text-white font-medium min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-[#2A2A2A] hover:bg-[#3A3A3A] flex items-center justify-center text-white transition-colors duration-300"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <p className="text-lg font-bold text-white">
                          {item.price === 0 ? 'FREE' : `$${(item.price * item.quantity).toFixed(2)}`}
                        </p>
                        
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-400/10 transition-all duration-300"
                          title="Remove item"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#2A2A2A] sticky top-24">
              <h2 className="text-xl font-semibold text-white mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>{total === 0 ? 'FREE' : `$${total.toFixed(2)}`}</span>
                </div>
                
                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                
                {total > 0 && (
                  <div className="flex justify-between text-gray-400">
                    <span>Tax</span>
                    <span>${(total * 0.08).toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t border-[#2A2A2A] pt-4">
                  <div className="flex justify-between text-white text-lg font-bold">
                    <span>Total</span>
                    <span>{total === 0 ? 'FREE' : `$${(total * 1.08).toFixed(2)}`}</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleCheckout}
                className="w-full bg-[#FFFFFF] hover:bg-[#FFFFFF]/90 text-black font-bold py-3 px-4 rounded-lg transition-all duration-300 glow-on-hover"
              >
                {total === 0 ? 'Place Free Order' : `Checkout - $${(total * 1.08).toFixed(2)}`}
              </button>
              
              <Link
                href="/shop"
                className="block w-full text-center mt-4 text-gray-400 hover:text-white transition-colors duration-300"
              >
                Continue Shopping
              </Link>
              <Link
                href="/track-order"
                className="block w-full text-center mt-2 text-gray-500 hover:text-gray-300 transition-colors duration-300 text-sm"
              >
                Track an Order
              </Link>
            </div>
          </div>
        </div>

        {/* Checkout Modal */}
        <CheckoutModal
          isOpen={isCheckoutModalOpen}
          onClose={() => setIsCheckoutModalOpen(false)}
          total={total}
          items={items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          }))}
        />

        {/* Ad Spot - Banner at bottom */}
        <div className="mt-12">
          <AdPlaceholder size="banner" />
        </div>
      </div>
    </div>
  );
}