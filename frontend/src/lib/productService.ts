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

// Reset location permission (for testing or user request)
export function resetLocationPermission() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('locationPermissionGranted');
  }
}

// Check if location permission is granted
export function hasLocationPermission(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('locationPermissionGranted') === 'true';
}

// Country detection utility
export function detectUserCountry(): Promise<string> {
  if (typeof window === 'undefined') {
    return Promise.resolve('US');
  }

  return new Promise((resolve) => {
    // Check if geolocation permission has been granted
    const permissionKey = 'locationPermissionGranted';
    const hasPermission = localStorage.getItem(permissionKey);
    
    const requestLocationPermission = () => {
      if (!hasPermission && typeof window !== 'undefined' && window.confirm) {
        const shouldAllow = window.confirm(
          'This website would like to detect your location to show you the most accurate pricing for your region. ' +
          'This helps us display prices in your local currency and apply any regional discounts. ' +
          'Your location is only used for pricing purposes and is not stored or shared. ' +
          '\n\nWould you like to allow location detection?'
        );
        
        if (shouldAllow) {
          localStorage.setItem(permissionKey, 'true');
          detectCountryDirectly();
        } else {
          localStorage.setItem(permissionKey, 'false');
          resolve('US'); // Fallback to default
        }
      } else {
        detectCountryDirectly();
      }
    };

    const detectCountryDirectly = () => {
      try {
        console.log('🔍 Starting country detection...');
        
        // Method 1: Try to get country from browser locale (most reliable)
        const locale = navigator.language || (navigator as any).userLanguage;
        console.log('🌐 Browser locale:', locale);
        
        if (locale) {
          const countryCode = locale.split('-')[1] || locale.split('_')[1];
          console.log('📍 Locale country code:', countryCode);
          if (countryCode && countryCode.length === 2) {
            console.log('✅ Country detected from locale:', countryCode.toUpperCase());
            resolve(countryCode.toUpperCase());
            return;
          }
        }

        // Method 2: Try to get country from timezone (with comprehensive mappings)
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        console.log('⏰ Browser timezone:', timezone);
        
        if (timezone) {
          // Comprehensive timezone to country mapping
          const timezoneToCountry: { [key: string]: string } = {
            // Middle East - All variations for Saudi Arabia
            'Asia/Riyadh': 'SA',
            'Asia/Riyadh2': 'SA',
            'Asia/Riyadh3': 'SA',
            'Asia/Riyadh4': 'SA',
            'Asia/Riyadh5': 'SA',
            'Asia/Riyadh6': 'SA',
            'Asia/Riyadh7': 'SA',
            'Asia/Riyadh8': 'SA',
            'Asia/Riyadh9': 'SA',
            'Asia/Riyadh10': 'SA',
            'Asia/Riyadh11': 'SA',
            'Asia/Riyadh12': 'SA',
            'Asia/Riyadh13': 'SA',
            'Asia/Riyadh14': 'SA',
            'Asia/Riyadh15': 'SA',
            'Asia/Riyadh16': 'SA',
            'Asia/Riyadh17': 'SA',
            'Asia/Riyadh18': 'SA',
            'Asia/Riyadh19': 'SA',
            'Asia/Riyadh20': 'SA',
            'Asia/Riyadh21': 'SA',
            'Asia/Riyadh22': 'SA',
            'Asia/Riyadh23': 'SA',
            'Asia/Riyadh24': 'SA',
            'Asia/Riyadh25': 'SA',
            'Asia/Riyadh26': 'SA',
            'Asia/Riyadh27': 'SA',
            'Asia/Riyadh28': 'SA',
            'Asia/Riyadh29': 'SA',
            'Asia/Riyadh30': 'SA',
            'Asia/Riyadh31': 'SA',
            'Asia/Riyadh32': 'SA',
            'Asia/Riyadh33': 'SA',
            'Asia/Riyadh34': 'SA',
            'Asia/Dammam': 'SA',
            'Asia/Makkah': 'SA',
            'Asia/Mecca': 'SA',
            'Asia/Jeddah': 'SA',
            'Asia/Jedda': 'SA',
            'Asia/Medina': 'SA',
            'Asia/Hofuf': 'SA',
            'Asia/Najran': 'SA',
            'Asia/Abha': 'SA',
            'Asia/Khobar': 'SA',
            'Asia/Dhahran': 'SA',
            'Asia/Hail': 'SA',
            'Asia/Arar': 'SA',
            'Asia/Skaka': 'SA',
            'Asia/Buraidah': 'SA',
            'Asia/AlJawf': 'SA',
            'Asia/AlBaha': 'SA',
            'Asia/AlQatif': 'SA',
            'Asia/AlKharj': 'SA',
            'Asia/AlUla': 'SA',
            'Asia/Sakakah': 'SA',
            'Asia/Tabuk': 'SA',
            
            // Gulf countries
            'Asia/Dubai': 'AE',
            'Asia/Kuwait': 'KW',
            'Asia/Qatar': 'QA',
            'Asia/Bahrain': 'BH',
            'Asia/Muscat': 'OM',
            
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
          console.log('🗺️ Timezone to country mapping:', detectedCountry);
          if (detectedCountry) {
            console.log('✅ Country detected from timezone:', detectedCountry);
            resolve(detectedCountry);
            return;
          }
        }

        // Method 3: Try to get country from browser accept languages (fallback)
        const languages = navigator.languages || [];
        console.log('🌐 Browser languages:', languages);
        
        for (const lang of languages) {
          const match = lang.match(/([A-Z]{2})/);
          if (match) {
            console.log('✅ Country detected from language:', match[1]);
            resolve(match[1]);
            return;
          }
        }

        // Final fallback
        console.log('⚠️ Using fallback country: US');
        resolve('US');
      } catch (error) {
        console.warn('Country detection error:', error);
        resolve('US');
      }
    };

    // If permission already granted, detect directly
    if (hasPermission === 'true') {
      detectCountryFromBrowser();
    } else {
      requestLocationPermission();
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
