"use client";

import React, { createContext, useContext, useReducer, useEffect } from 'react';

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
        const setId = `set_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
  updateOrderStatus: (id: string, status: Order['status']) => void;
  deleteOrder: (id: string) => void;
  toggleSet: (setId: string) => void;
  deleteSet: (setId: string) => void;
  getUnsetOrders: () => Order[];
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(orderReducer, initialState);

  // Load orders and sets from localStorage on mount
  useEffect(() => {
    const savedOrders = localStorage.getItem('void-orders');
    const savedSets = localStorage.getItem('void-sets');
    
    if (savedOrders) {
      try {
        const orders = JSON.parse(savedOrders);
        dispatch({ type: 'LOAD_ORDERS', payload: orders });
      } catch (error) {
        console.error('Error loading orders from localStorage:', error);
      }
    }
    
    if (savedSets) {
      try {
        const sets = JSON.parse(savedSets);
        dispatch({ type: 'LOAD_SETS', payload: sets });
      } catch (error) {
        console.error('Error loading sets from localStorage:', error);
      }
    }
  }, []);

  // Save orders and sets to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('void-orders', JSON.stringify(state.orders));
  }, [state.orders]);

  useEffect(() => {
    localStorage.setItem('void-sets', JSON.stringify(state.sets));
  }, [state.sets]);

  const addOrder = (order: Order) => {
    dispatch({ type: 'ADD_ORDER', payload: order });
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { id, status } });
  };

  const deleteOrder = (id: string) => {
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