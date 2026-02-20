import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy,
  Timestamp,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const isBrowser = typeof window !== 'undefined';

export interface Product {
  id?: string;
  name: string;
  price: number;
  image: string;
  hoverImage?: string;
  category: string;
  description: string;
  link: string;
  displayOnHomePage?: boolean;
  createdAt: Timestamp;
}

const PRODUCTS_COLLECTION = 'products';

export const productService = {
  async getAll(): Promise<Product[]> {
    if (!isBrowser || !db) return [];
    const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) return [];
    return snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as Omit<Product, 'id'>)
    }));
  },

  async getById(id: string): Promise<Product | null> {
    if (!isBrowser || !db) return null;
    const ref = doc(db, PRODUCTS_COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as Omit<Product, 'id'>) };
  },

  async create(input: Omit<Product, 'id' | 'createdAt'>): Promise<string> {
    if (!isBrowser || !db) return 'mock-id';
    const payload: Omit<Product, 'id'> = {
      ...input,
      createdAt: Timestamp.now()
    };
    const ref = await addDoc(collection(db, PRODUCTS_COLLECTION), payload);
    return ref.id;
  },

  async update(id: string, updates: Partial<Omit<Product, 'id'>>): Promise<void> {
    if (!isBrowser || !db) return;
    const ref = doc(db, PRODUCTS_COLLECTION, id);
    await updateDoc(ref, updates);
  },

  async remove(id: string): Promise<void> {
    if (!isBrowser || !db) return;
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
  }
};
