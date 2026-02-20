"use client";

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { collection, getDocs, query, orderBy, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  customerInfo: {
    name: string;
    email: string;
    address: string;
    zipCode: string;
    phone: string;
    country: string;
  };
  status: 'pending' | 'accepted' | 'processing' | 'delivered' | 'declined' | 'canceled';
  createdAt: string;
  paymentIntentId?: string;
  setId?: string;
}

export interface OrderSet {
  id: string;
  name: string;
  orders: Order[];
  createdAt: string;
  isExpanded?: boolean;
}

interface OrderState {
  orders: Order[];
  sets: OrderSet[];
}

type OrderAction =
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { id: string; status: Order['status'] } }
  | { type: 'DELETE_ORDER'; payload: string }
  | { type: 'LOAD_ORDERS'; payload: Order[] }
  | { type: 'LOAD_SETS'; payload: OrderSet[] }
  | { type: 'CREATE_SET'; payload: OrderSet }
  | { type: 'TOGGLE_SET'; payload: string }
  | { type: 'DELETE_SET'; payload: string };

const initialState: OrderState = {
  orders: [],
  sets: [],
};

function orderReducer(state: OrderState, action: OrderAction): OrderState {
  switch (action.type) {
    case 'ADD_ORDER': {
      const newOrders = [action.payload, ...state.orders];
      
      // Check if we need to create a new set (every 5 orders without a setId)
      const unsetOrders = newOrders.filter(order => !order.setId);
      let newSets = [...state.sets];
      
      if (unsetOrders.length >= 5) {
        // Create a new set with the 5 oldest unset orders
        const ordersForSet = unsetOrders.slice(-5);
        const setId = `set_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        const newSet: OrderSet = {
          id: setId,
          name: `Order Set ${state.sets.length + 1}`,
          orders: ordersForSet.map(order => ({ ...order, setId })),
          createdAt: new Date().toISOString(),
          isExpanded: false,
        };
        
        newSets = [newSet, ...newSets];
        
        // Update orders to include setId
        const updatedOrders = newOrders.map(order => {
          const orderInSet = ordersForSet.find(setOrder => setOrder.id === order.id);
          return orderInSet ? { ...order, setId } : order;
        });
        
        return {
          ...state,
          orders: updatedOrders,
          sets: newSets,
        };
      }
      
      return {
        ...state,
        orders: newOrders,
      };
    }
    
    case 'UPDATE_ORDER_STATUS': {
      const updatedOrders = state.orders.map(order =>
        order.id === action.payload.id
          ? { ...order, status: action.payload.status }
          : order
      );
      
      // Update orders in sets as well
      const updatedSets = state.sets.map(set => ({
        ...set,
        orders: set.orders.map(order =>
          order.id === action.payload.id
            ? { ...order, status: action.payload.status }
            : order
        ),
      }));
      
      return {
        ...state,
        orders: updatedOrders,
        sets: updatedSets,
      };
    }
    
    case 'DELETE_ORDER': {
      const updatedOrders = state.orders.filter(order => order.id !== action.payload);
      
      // Update sets by removing the order and checking if set becomes empty
      const updatedSets = state.sets
        .map(set => ({
          ...set,
          orders: set.orders.filter(order => order.id !== action.payload),
        }))
        .filter(set => set.orders.length > 0); // Remove empty sets
      
      return {
        ...state,
        orders: updatedOrders,
        sets: updatedSets,
      };
    }
    
    case 'LOAD_ORDERS':
      return {
        ...state,
        orders: action.payload,
      };
    
    case 'LOAD_SETS':
      return {
        ...state,
        sets: action.payload,
      };
    
    case 'CREATE_SET':
      return {
        ...state,
        sets: [action.payload, ...state.sets],
      };
    
    case 'TOGGLE_SET':
      return {
        ...state,
        sets: state.sets.map(set =>
          set.id === action.payload
            ? { ...set, isExpanded: !set.isExpanded }
            : set
        ),
      };
    
    case 'DELETE_SET': {
      const setToDelete = state.sets.find(set => set.id === action.payload);
      if (!setToDelete) return state;
      
      // Remove setId from orders that were in this set
      const updatedOrders = state.orders.map(order =>
        setToDelete.orders.some(setOrder => setOrder.id === order.id)
          ? { ...order, setId: undefined }
          : order
      );
      
      return {
        ...state,
        orders: updatedOrders,
        sets: state.sets.filter(set => set.id !== action.payload),
      };
    }
    
    default:
      return state;
  }
}

interface OrderContextType extends OrderState {
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  toggleSet: (setId: string) => void;
  deleteSet: (setId: string) => void;
  getUnsetOrders: () => Order[];
  loadOrdersFromFirebase: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(orderReducer, initialState);

  // Load orders and sets from localStorage first, then try Firebase
  useEffect(() => {
    const loadFromLocalStorage = () => {
      // Only run on client side
      if (typeof window === 'undefined') return;
      
      // Load orders from localStorage first (immediate)
      const savedOrders = localStorage.getItem('void-orders');
      if (savedOrders) {
        try {
          const orders = JSON.parse(savedOrders);
          dispatch({ type: 'LOAD_ORDERS', payload: orders });
        } catch (error) {
          console.error('Error loading orders from localStorage:', error);
        }
      }

      // Load sets from localStorage
      const savedSets = localStorage.getItem('void-sets');
      if (savedSets) {
        try {
          const sets = JSON.parse(savedSets);
          dispatch({ type: 'LOAD_SETS', payload: sets });
        } catch (error) {
          console.error('Error loading sets from localStorage:', error);
        }
      }
    };

    const loadFromFirebase = async () => {
      // Only run on client side
      if (typeof window === 'undefined') return;
      
      // Check if db is available
      if (!db) {
        console.log('Firebase not initialized, skipping Firebase load');
        return;
      }
      
      try {
        console.log('Attempting to load orders from Firebase...');
        
        const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(ordersQuery);
        
        const firebaseOrders: Order[] = [];
        querySnapshot.forEach((doc) => {
          try {
            const data = doc.data();
            
            // Validate required fields
            if (!data.items || !Array.isArray(data.items) || !data.customerInfo) {
              console.warn(`Skipping invalid order ${doc.id}:`, data);
              return;
            }

            const order: Order = {
              id: doc.id,
              items: data.items.map((item: {
                id: number;
                name: string;
                price: number;
                quantity: number;
                image?: string;
              }) => ({
                id: item.id || 0,
                name: item.name || 'Unknown Item',
                price: item.price || 0,
                quantity: item.quantity || 1,
                image: item.image || '/placeholder-product.jpg',
              })),
              total: data.total || data.finalTotal || 0,
              customerInfo: {
                name: data.customerInfo?.name || 'Unknown',
                email: data.customerInfo?.email || '',
                address: data.customerInfo?.address || '',
                zipCode: data.customerInfo?.zipCode || '',
                phone: data.customerInfo?.phone || '',
                country: data.customerInfo?.country || '',
              },
              status: data.status || 'pending',
              createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
              paymentIntentId: data.paymentIntentId,
            };
            firebaseOrders.push(order);
          } catch (itemError) {
            console.error(`Error processing order ${doc.id}:`, itemError);
          }
        });
        
        console.log(`Loaded ${firebaseOrders.length} orders from Firebase`);
        
        if (firebaseOrders.length > 0) {
          dispatch({ type: 'LOAD_ORDERS', payload: firebaseOrders });
        }
      } catch (error) {
        console.error('Error loading orders from Firebase:', error);
        // Don't throw the error, just log it and continue with localStorage data
      }
    };

    // Load localStorage data immediately
    loadFromLocalStorage();
    
    // Try Firebase after a short delay to avoid blocking the UI
    setTimeout(() => {
      loadFromFirebase();
    }, 1000);
  }, []);

  // Save orders and sets to localStorage whenever they change
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('void-orders', JSON.stringify(state.orders));
  }, [state.orders]);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('void-sets', JSON.stringify(state.sets));
  }, [state.sets]);

  const loadOrdersFromFirebase = async () => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Check if db is available
    if (!db) {
      console.log('Firebase not initialized, skipping Firebase load');
      return;
    }
    
    try {
      console.log('Attempting to load orders from Firebase...');
      
      const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(ordersQuery);
      
      const firebaseOrders: Order[] = [];
      querySnapshot.forEach((doc) => {
        try {
          const data = doc.data();
          
          // Validate required fields
          if (!data.items || !Array.isArray(data.items) || !data.customerInfo) {
            console.warn(`Skipping invalid order ${doc.id}:`, data);
            return;
          }

          const order: Order = {
            id: doc.id,
            items: data.items.map((item: {
              id: number;
              name: string;
              price: number;
              quantity: number;
              image?: string;
            }) => ({
              id: item.id || 0,
              name: item.name || 'Unknown Item',
              price: item.price || 0,
              quantity: item.quantity || 1,
              image: item.image || '/placeholder-product.jpg',
            })),
            total: data.total || data.finalTotal || 0,
            customerInfo: {
              name: data.customerInfo?.name || 'Unknown',
              email: data.customerInfo?.email || '',
              address: data.customerInfo?.address || '',
              zipCode: data.customerInfo?.zipCode || '',
              phone: data.customerInfo?.phone || '',
              country: data.customerInfo?.country || '',
            },
            status: data.status || 'pending',
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            paymentIntentId: data.paymentIntentId,
          };
          firebaseOrders.push(order);
        } catch (itemError) {
          console.error(`Error processing order ${doc.id}:`, itemError);
        }
      });
      
      console.log(`Loaded ${firebaseOrders.length} orders from Firebase`);
      
      if (firebaseOrders.length > 0) {
        dispatch({ type: 'LOAD_ORDERS', payload: firebaseOrders });
      }
    } catch (error) {
      console.error('Error loading orders from Firebase:', error);
      // Don't throw the error, just log it and continue with localStorage data
    }
  };

  const addOrder = (order: Order) => {
    dispatch({ type: 'ADD_ORDER', payload: order });
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    // Update in Firebase first
    if (db) {
      try {
        await updateDoc(doc(db, 'orders', id), {
          status: status
        });
        console.log('Order status updated in Firebase:', id, status);
      } catch (error) {
        console.error('Error updating order status in Firebase:', error);
      }
    }
    
    // Then update local state
    dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { id, status } });
  };

  const deleteOrder = async (id: string) => {
    // Delete from Firebase first
    if (db) {
      try {
        await deleteDoc(doc(db, 'orders', id));
        console.log('Order deleted from Firebase:', id);
      } catch (error) {
        console.error('Error deleting order from Firebase:', error);
      }
    }
    
    // Then update local state
    dispatch({ type: 'DELETE_ORDER', payload: id });
  };

  const toggleSet = (setId: string) => {
    dispatch({ type: 'TOGGLE_SET', payload: setId });
  };

  const deleteSet = (setId: string) => {
    dispatch({ type: 'DELETE_SET', payload: setId });
  };

  const getUnsetOrders = () => {
    return state.orders.filter(order => !order.setId);
  };

  return (
    <OrderContext.Provider
      value={{
        ...state,
        addOrder,
        updateOrderStatus,
        deleteOrder,
        toggleSet,
        deleteSet,
        getUnsetOrders,
        loadOrdersFromFirebase
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}