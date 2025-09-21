import { collection, addDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface OrderData {
  customerInfo: {
    name: string;
    email: string;
    address: string;
    zipCode: string;
    phone: string;
  };
  items: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
    category: string;
  }>;
  total: number;
  tax: number;
  finalTotal: number;
  paymentIntentId?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Timestamp;
}

export interface OrderWithId extends OrderData {
  id: string;
}

export const addOrder = async (orderData: Omit<OrderData, 'createdAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding order:', error);
    throw error;
  }
};

export const getAllOrders = async (): Promise<OrderWithId[]> => {
  try {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const orders: OrderWithId[] = [];
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data() as OrderData,
      });
    });
    
    return orders;
  } catch (error) {
    console.error('Error getting orders:', error);
    throw error;
  }
};