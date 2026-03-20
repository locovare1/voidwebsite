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

// Utility function to calculate sale percentage
export function calculateSalePercentage(originalPrice: number, salePrice: number): number {
  if (!originalPrice || !salePrice || salePrice >= originalPrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

// Utility function to get display price (sale price if on sale, otherwise regular price)
export function getDisplayPrice(product: Product): number {
  return product.onSale && product.salePrice ? product.salePrice : product.price;
}

export interface Product {
  id?: string;
  name: string;
  price: number;
  salePrice?: number;
  onSale?: boolean;
  image: string; // Primary image for backward compatibility
  images?: string[]; // Array of all images
  hoverImage?: string;
  category: string;
  description: string;
  link: string;
  displayOnHomePage?: boolean;
  createdAt: Timestamp;

  // New fields for customization
  customFields?: CustomField[];
  sizes?: Size[];
  hasCustomFields?: boolean;
  hasSizes?: boolean;
}

export interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select';
  required: boolean;
  placeholder?: string;
  options?: string[]; // For select type
  maxLength?: number; // For text type
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
  };
}

export interface Size {
  id: string;
  name: string;
  priceModifier?: number; // Additional cost for this size
  available: boolean;
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
    console.log('[ProductService] Creating product with payload:', payload);
    const ref = await addDoc(collection(db, PRODUCTS_COLLECTION), payload);
    console.log('[ProductService] Product created with ID:', ref.id, 'Images saved:', payload.images);
    return ref.id;
  },

  async update(id: string, updates: Partial<Omit<Product, 'id'>>): Promise<void> {
    if (!isBrowser || !db) return;
    console.log('[ProductService] Updating product ID:', id, 'with updates:', updates);
    const ref = doc(db, PRODUCTS_COLLECTION, id);
    await updateDoc(ref, updates);
    console.log('[ProductService] Product updated successfully. Images field:', updates.images);
  },

  async remove(id: string): Promise<void> {
    if (!isBrowser || !db) return;
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
  }
};
