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

// Utility function to get location-specific price
export function getLocationSpecificPrice(product: Product, countryCode?: string): number {
  // If no country code or no country-specific pricing, return default price
  if (!countryCode || !product.countryPrices) {
    return getDisplayPrice(product);
  }
  
  // Check if there's a specific price for this country
  const countrySpecificPrice = product.countryPrices[countryCode.toUpperCase()];
  if (countrySpecificPrice) {
    return countrySpecificPrice;
  }
  
  // Fall back to default price
  return getDisplayPrice(product);
}

// Country detection utility
export function detectUserCountry(): Promise<string> {
  if (typeof window === 'undefined') {
    return Promise.resolve('US');
  }

  return new Promise((resolve) => {
    try {
      // Method 1: Try to get country from browser locale
      const locale = navigator.language || (navigator as any).userLanguage;
      if (locale) {
        const countryCode = locale.split('-')[1] || locale.split('_')[1];
        if (countryCode && countryCode.length === 2) {
          resolve(countryCode.toUpperCase());
          return;
        }
      }

      // Method 2: Try to get country from timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timezone) {
        // Enhanced timezone to country mapping
        const timezoneToCountry: { [key: string]: string } = {
          // Middle East
          'Asia/Riyadh': 'SA',
          'Asia/Dubai': 'AE',
          'Asia/Kuwait': 'KW',
          'Asia/Qatar': 'QA',
          'Asia/Bahrain': 'BH',
          'Asia/Muscat': 'OM',
          'Asia/Tehran': 'IR',
          'Asia/Baghdad': 'IQ',
          'Asia/Jerusalem': 'IL',
          'Asia/Damascus': 'SY',
          'Asia/Beirut': 'LB',
          'Asia/Amman': 'JO',
          
          // Europe
          'Europe/London': 'GB',
          'Europe/Paris': 'FR',
          'Europe/Berlin': 'DE',
          'Europe/Rome': 'IT',
          'Europe/Madrid': 'ES',
          'Europe/Amsterdam': 'NL',
          'Europe/Brussels': 'BE',
          'Europe/Vienna': 'AT',
          'Europe/Zurich': 'CH',
          'Europe/Stockholm': 'SE',
          'Europe/Oslo': 'NO',
          'Europe/Copenhagen': 'DK',
          'Europe/Helsinki': 'FI',
          'Europe/Warsaw': 'PL',
          'Europe/Prague': 'CZ',
          'Europe/Budapest': 'HU',
          'Europe/Bucharest': 'RO',
          'Europe/Sofia': 'BG',
          'Europe/Belgrade': 'RS',
          'Europe/Zagreb': 'HR',
          'Europe/Athens': 'GR',
          'Europe/Lisbon': 'PT',
          'Europe/Dublin': 'IE',
          
          // Americas
          'America/New_York': 'US',
          'America/Los_Angeles': 'US',
          'America/Chicago': 'US',
          'America/Denver': 'US',
          'America/Phoenix': 'US',
          'America/Toronto': 'CA',
          'America/Vancouver': 'CA',
          'America/Montreal': 'CA',
          'America/Sao_Paulo': 'BR',
          'America/Mexico_City': 'MX',
          'America/Argentina/Buenos_Aires': 'AR',
          'America/Chile/Santiago': 'CL',
          'America/Peru/Lima': 'PE',
          'America/Colombia/Bogota': 'CO',
          'America/Venezuela/Caracas': 'VE',
          
          // Asia Pacific
          'Asia/Tokyo': 'JP',
          'Asia/Shanghai': 'CN',
          'Asia/Hong_Kong': 'HK',
          'Asia/Singapore': 'SG',
          'Asia/Seoul': 'KR',
          'Asia/Bangkok': 'TH',
          'Asia/Jakarta': 'ID',
          'Asia/Manila': 'PH',
          'Asia/Kuala_Lumpur': 'MY',
          'Asia/Taipei': 'TW',
          'Asia/Ho_Chi_Minh': 'VN',
          
          // Australia & Oceania
          'Australia/Sydney': 'AU',
          'Australia/Melbourne': 'AU',
          'Australia/Perth': 'AU',
          'New_Zealand/Auckland': 'NZ',
          
          // Africa
          'Africa/Cairo': 'EG',
          'Africa/Johannesburg': 'ZA',
          'Africa/Lagos': 'NG',
          'Africa/Nairobi': 'KE',
          'Africa/Casablanca': 'MA',
          'Africa/Algiers': 'DZ',
          'Africa/Tunis': 'TN',
          
          // Add more as needed...
        };
        
        const detectedCountry = timezoneToCountry[timezone];
        if (detectedCountry) {
          resolve(detectedCountry);
          return;
        }
      }

      // Method 3: Try to get country from IP geolocation (async)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // This would require a geolocation API to get country from coordinates
            // For now, we'll skip this method as it requires user permission
          },
          (error) => {
            console.warn('Geolocation error:', error);
          }
        );
      }

      // Method 4: Try to get country from browser accept languages
      const languages = navigator.languages || [];
      for (const lang of languages) {
        const match = lang.match(/([A-Z]{2})/);
        if (match) {
          resolve(match[1]);
          return;
        }
      }

      // Fallback to default
      resolve('US');
    } catch (error) {
      console.warn('Country detection error:', error);
      resolve('US');
    }
  });
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
  // Country-specific pricing
  countryPrices?: {
    [countryCode: string]: number;
  };
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
