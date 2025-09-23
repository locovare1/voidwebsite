"use client";

import { useState, useCallback, useRef } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/contexts/OrderContext';

export function useOrderTracking() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const trackOrder = useCallback(async (orderNumber: string) => {
    setLoading(true);
    setError(null);
    setOrder(null);

    // Clean up previous listener
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    try {
      // First try to get from Firebase, only if db is available
      if (db) {
        const orderDoc = await getDoc(doc(db, 'orders', orderNumber));
        
        if (orderDoc.exists()) {
          const firebaseOrder = orderDoc.data();
          
          // Convert Firebase order to our Order format
          const order: Order = {
            id: orderDoc.id,
            items: firebaseOrder.items.map((item: {
              id: number;
              name: string;
              price: number;
              quantity: number;
              image?: string;
            }) => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image || '/placeholder-product.jpg', // Add default image if missing
            })),
            total: firebaseOrder.total || firebaseOrder.finalTotal || 0,
            customerInfo: firebaseOrder.customerInfo,
            status: firebaseOrder.status || 'pending',
            createdAt: firebaseOrder.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            paymentIntentId: firebaseOrder.paymentIntentId,
          };
          
          setOrder(order);
          
          // Set up real-time listener for status updates
          const unsubscribe = onSnapshot(doc(db, 'orders', orderNumber), (doc) => {
            if (doc.exists()) {
              const updatedData = doc.data();
              const updatedOrder: Order = {
                id: doc.id,
                items: updatedData.items.map((item: {
                  id: number;
                  name: string;
                  price: number;
                  quantity: number;
                  image?: string;
                }) => ({
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  quantity: item.quantity,
                  image: item.image || '/placeholder-product.jpg',
                })),
                total: updatedData.total || updatedData.finalTotal || 0,
                customerInfo: updatedData.customerInfo,
                status: updatedData.status || 'pending',
                createdAt: updatedData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                paymentIntentId: updatedData.paymentIntentId,
              };
              setOrder(updatedOrder);
            }
          });
          
          // Store unsubscribe function for cleanup
          unsubscribeRef.current = unsubscribe;
        } else {
          // If not found in Firebase, try localStorage (for backward compatibility)
          const localOrders = localStorage.getItem('void-orders');
          if (localOrders) {
            const orders: Order[] = JSON.parse(localOrders);
            const foundOrder = orders.find(o => o.id === orderNumber);
            
            if (foundOrder) {
              setOrder(foundOrder);
            } else {
              setError('Order not found. Please check your order number and try again.');
            }
          } else {
            setError('Order not found. Please check your order number and try again.');
          }
        }
      } else {
        // If Firebase is not available, try localStorage
        const localOrders = localStorage.getItem('void-orders');
        if (localOrders) {
          const orders: Order[] = JSON.parse(localOrders);
          const foundOrder = orders.find(o => o.id === orderNumber);
          
          if (foundOrder) {
            setOrder(foundOrder);
          } else {
            setError('Order not found. Please check your order number and try again.');
          }
        } else {
          setError('Order not found. Please check your order number and try again.');
        }
      }
    } catch (err) {
      console.error('Error tracking order:', err);
      setError('Failed to track order. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    order,
    loading,
    error,
    trackOrder,
  };
}