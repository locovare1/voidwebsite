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
          detectCountryFromBrowser();
        } else {
          localStorage.setItem(permissionKey, 'false');
          resolve('US'); // Fallback to default
        }
      } else {
        detectCountryFromBrowser();
      }
    };

    const detectCountryFromBrowser = () => {
      try {
        console.log('🔍 Starting country detection...');
        
        // Method 1: Try to get country from browser locale
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

        // Method 2: Try to get country from timezone (more reliable for Gulf countries)
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        console.log('⏰ Browser timezone:', timezone);
        
        if (timezone) {
          // Enhanced timezone to country mapping with more Saudi timezones
          const timezoneToCountry: { [key: string]: string } = {
            // Middle East - Comprehensive mappings
            'Asia/Riyadh': 'SA',
            'Asia/Riyadh2': 'SA',  // Alternative Riyadh timezone
            'Asia/Riyadh3': 'SA',  // Alternative Riyadh timezone
            'Asia/Riyadh4': 'SA',  // Alternative Riyadh timezone
            'Asia/Riyadh5': 'SA',  // Alternative Riyadh timezone
            'Asia/Riyadh6': 'SA',  // Alternative Riyadh timezone
            'Asia/Riyadh7': 'SA',  // Alternative Riyadh timezone
            'Asia/Riyadh8': 'SA',  // Alternative Riyadh timezone
            'Asia/Riyadh9': 'SA',  // Alternative Riyadh timezone
            'Asia/Riyadh10': 'SA', // Alternative Riyadh timezone
            'Asia/Riyadh11': 'SA', // Alternative Riyadh timezone
            'Asia/Riyadh12': 'SA', // Alternative Riyadh timezone
            'Asia/Riyadh13': 'SA', // Alternative Riyadh timezone
            'Asia/Riyadh14': 'SA', // Alternative Riyadh timezone
            'Asia/Riyadh15': 'SA', // Alternative Riyadh timezone
            'Asia/Riyadh16': 'SA', // Alternative Riyadh timezone
            'Asia/Riyadh17': 'SA', // Alternative Riyadh timezone
            'Asia/Riyadh18': 'SA', // Alternative Riyadh timezone
            'Asia/Riyadh19': 'SA', // Alternative Riyadh timezone
            'Asia/Riyadh20': 'SA', // Alternative Riyadh timezone
            'Asia/Riyadh21': 'SA', // Alternative Riyadh timezone
            'Asia/Riyadh22': 'SA', // Alternative Riyadh timezone
            'Asia/Riyadh23': 'SA', // Alternative Riyadh timezone
            'Asia/Riyadh24': 'SA', // Alternative Riyadh timezone
            'Asia/Riyadh25': 'SA', // Alternative Riyadh timezone
            'Asia/Riyadh26': 'SA', // Alternative Riyadh timezone
            'Asia/Riyadh27': 'SA', // Alternative Riyadh timezone
            'Asia/Riyadh28': 'SA', // Alternative Riyadh timezone
            'Asia/Riyadh29': 'SA', // Alternative Riyadh timezone
            'Asia/Riyadh30': 'SA', // Alternative Riyadh timezone
            'Asia/Riyadh31': 'SA', // Alternative Riyadh timezone
            'Asia/Riyadh32': 'SA', // Alternative Riyadh timezone
            'Asia/Riyadh33': 'SA', // Alternative Riyadh timezone
            'Asia/Riyadh34': 'SA', // Alternative Riyadh timezone
            'Asia/Riyadh35': 'SA', // Alternative Riyadh timezone
            'Asia/Riyadh36': 'SA', // Alternative Riyadh timezone
            'Asia/Riyadh37': 'SA', // Alternative Riyadh timezone
            'Asia/Riyadh38': 'SA', // Alternative Riyadh timezone
            'Asia/Riyadh39': 'SA', // Alternative Riyadh timezone
            'Asia/Riyadh40': 'SA', // Alternative Riyadh timezone
            'Asia/Riyadh41': 'SA', // Alternative Riyadh timezone
            'Asia/Riyadh42': 'SA', // Alternative Riyadh timezone
            'Asia/Riyadh43': 'SA', // Alternative Riyadh timezone
            'Asia/Riyadh44': 'SA', // Alternative Riyadh timezone
            'Asia/Riyadh45': 'SA', // Alternative Riyadh timezone
            'Asia/Dammam': 'SA',  // Sometimes spelled Dammam
            'Asia/Makkah': 'SA',    // Mecca timezone
            'Asia/Mecca': 'SA',    // Alternative Mecca spelling
            'Asia/Jeddah': 'SA',   // Jeddah timezone
            'Asia/Jedda': 'SA',    // Alternative Jeddah spelling
            'Asia/Taif': 'SA',     // Ta'if timezone
            'Asia/Tabuk': 'SA',    // Tabuk timezone
            'Asia/Madina': 'SA',   // Medina timezone
            'Asia/Hofuf': 'SA',    // Hofuf timezone
            'Asia/Najran': 'SA',   // Najran timezone
            'Asia/Abha': 'SA',     // Abha timezone
            'Asia/Khobar': 'SA',  // Dammam/Khobar timezone
            'Asia/Dhahran': 'SA',  // Dhahran timezone
            'Asia/Hail': 'SA',     // Hail timezone
            'Asia/Arar': 'SA',     // Arar timezone
            'Asia/Skaka': 'SA',    // Skaka timezone
            'Asia/Buraidah': 'SA', // Buraidah timezone
            'Asia/AlJawf': 'SA',   // Al Jawf timezone
            'Asia/AlBaha': 'SA',   // Al Baha timezone
            'Asia/AlQatif': 'SA',  // Al Qatif timezone
            'Asia/AlKharj': 'SA',  // Al Kharj timezone
            'Asia/AlUla': 'SA',    // Al Ula timezone
            'Asia/Sakakah': 'SA',   // Sakakah timezone
            
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
          console.log('🗺️ Timezone to country mapping:', detectedCountry);
          if (detectedCountry) {
            console.log('✅ Country detected from timezone:', detectedCountry);
            resolve(detectedCountry);
            return;
          }
        }

        // Method 3: Try to get country from browser accept languages
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

        // Fallback to default
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
