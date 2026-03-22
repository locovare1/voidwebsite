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

// Country detection utility with HTML5 Geolocation API
export function detectUserCountry(): Promise<string> {
  if (typeof window === 'undefined') {
    return Promise.resolve('US');
  }

  return new Promise((resolve) => {
    // Check if geolocation permission has been granted
    const permissionKey = 'locationPermissionGranted';
    const hasPermission = localStorage.getItem(permissionKey);
    
    const requestLocationPermission = () => {
      // Always ask for permission first time
      if (!hasPermission && typeof window !== 'undefined' && window.confirm) {
        const shouldAllow = window.confirm(
          'This website would like to detect your location using GPS to show you the most accurate pricing for your region. ' +
          'This helps us display prices in your local currency and apply any regional discounts. ' +
          'Your location is only used for pricing purposes and is not stored or shared. ' +
          '\n\nWould you like to allow GPS location detection?'
        );
        
        if (shouldAllow) {
          localStorage.setItem(permissionKey, 'true');
          console.log('✅ User granted GPS permission, starting detection...');
          detectCountryWithGeolocation();
        } else {
          localStorage.setItem(permissionKey, 'false');
          console.log('❌ User denied GPS permission, using fallback...');
          resolve('US'); // Fallback to default
        }
      } else {
        console.log('🔄 Permission already checked, proceeding with detection...');
        detectCountryWithGeolocation();
      }
    };

    const detectCountryWithGeolocation = () => {
      try {
        console.log('🔍 Starting country detection with Geolocation...');
        
        // Check if we're in a secure context (HTTPS required for geolocation)
        if (!window.isSecureContext) {
          console.log('⚠️ Not in secure context (HTTPS), geolocation may be blocked');
          console.log('🔄 Falling back to browser-based detection...');
          detectCountryFromBrowser();
          return;
        }
        
        console.log('✅ Secure context detected, checking geolocation availability...');
        
        // Method 1: Try HTML5 Geolocation API (most accurate)
        if (navigator.geolocation) {
          console.log('✅ Geolocation API available, requesting position...');
          console.log('🛰 Current position options:', {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
          });
          
          // Define the geolocation request function
          const requestGeolocationPosition = () => {
            navigator.geolocation.getCurrentPosition(
              // Success callback
              async (position) => {
                console.log('📍 SUCCESS! Got GPS position:', {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  accuracy: position.coords.accuracy,
                  altitude: position.coords.altitude,
                  altitudeAccuracy: position.coords.altitudeAccuracy,
                  heading: position.coords.heading,
                  speed: position.coords.speed
                });
                
                try {
                  console.log('🌐 Starting reverse geocoding...');
                  // Use a reverse geocoding service to get country from coordinates
                  const geocodingUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=18&addressdetails=1`;
                  console.log('🔗 Geocoding URL:', geocodingUrl);
                  
                  const response = await fetch(geocodingUrl);
                  console.log('📡 Geocoding response status:', response.status);
                  
                  if (!response.ok) {
                    throw new Error(`Geocoding failed: ${response.status} ${response.statusText}`);
                  }
                  
                  const data = await response.json();
                  console.log('📄 Geocoding response data:', data);
                  
                  if (data && data.address && data.address.country_code) {
                    const countryCode = data.address.country_code.toUpperCase();
                    console.log('🌍 SUCCESS! Country detected from GPS:', countryCode);
                    console.log('🏠 Address details:', data.address);
                    resolve(countryCode);
                    return;
                  } else {
                    console.log('⚠️ No country code in geocoding response');
                    // Fallback to browser-based detection
                    detectCountryFromBrowser();
                  }
                } catch (geocodingError) {
                  console.warn('❌ Geocoding error:', geocodingError);
                  console.log('🔄 Falling back to browser-based detection...');
                  // Fallback to browser-based detection
                  detectCountryFromBrowser();
                }
              },
              // Error callback
              (error) => {
                console.error('❌ GPS Geolocation error:', {
                  code: error.code,
                  message: error.message,
                  PERMISSION_DENIED: error.code === 1,
                  POSITION_UNAVAILABLE: error.code === 2,
                  TIMEOUT: error.code === 3
                });
                
                if (error.code === 1) {
                  console.log('🚫 User denied GPS permission');
                  // Don't fallback immediately, let user decide
                  resolve('US');
                } else {
                  console.log('🔄 GPS failed, falling back to browser-based detection...');
                  // Fallback to browser-based detection
                  detectCountryFromBrowser();
                }
              },
              // Options
              {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
              }
            );
          };
          
          // Check if geolocation is actually blocked by permissions policy
          try {
            // Try to access geolocation permissions directly
            navigator.permissions.query({ name: 'geolocation' }).then((result) => {
              console.log('🔐 Geolocation permission state:', result.state);
              
              if (result.state === 'denied') {
                console.log('🚫 Geolocation permission denied by user');
                console.log('🔄 Falling back to browser-based detection...');
                detectCountryFromBrowser();
                return;
              }
              
              if (result.state === 'prompt') {
                console.log('❓ Geolocation permission prompt required');
              }
              
              // Proceed with geolocation request
              requestGeolocationPosition();
            }).catch((error) => {
              console.log('⚠️ Could not query geolocation permissions:', error);
              console.log('🔄 Proceeding with geolocation request anyway...');
              requestGeolocationPosition();
            });
          } catch (permissionsError) {
            console.log('⚠️ Permissions API not available, proceeding with geolocation...');
            requestGeolocationPosition();
          }
        } else {
          console.log('❌ Geolocation API not available in this browser');
          // Fallback to browser-based detection
          detectCountryFromBrowser();
        }
      } catch (error) {
        console.error('❌ Critical error in geolocation detection:', error);
        console.log('🔄 Falling back to browser-based detection...');
        detectCountryFromBrowser();
      }
    };

    const detectCountryFromBrowser = () => {
      try {
        console.log('🔍 Starting browser-based country detection...');
        
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

        // Method 2: Enhanced Saudi Arabia detection
        console.log('🇸🇦 Checking for Saudi Arabia indicators...');
        
        // Check for Saudi Arabia specific indicators
        const isSaudiArabia = 
          // Check locale for Arabic language
          locale && (
            locale.toLowerCase().includes('ar') || 
            locale.toLowerCase().includes('sa') ||
            locale.toLowerCase().includes('saudi') ||
            locale.toLowerCase().includes('arab')
          ) ||
          // Check timezone for Saudi timezones
          (Intl.DateTimeFormat().resolvedOptions().timeZone || '').toLowerCase().includes('riyadh') ||
          (Intl.DateTimeFormat().resolvedOptions().timeZone || '').toLowerCase().includes('makkah') ||
          (Intl.DateTimeFormat().resolvedOptions().timeZone || '').toLowerCase().includes('jeddah') ||
          (Intl.DateTimeFormat().resolvedOptions().timeZone || '').toLowerCase().includes('dammam') ||
          // Check currency settings if available
          (Intl && Intl.NumberFormat && (new Intl.NumberFormat(undefined, { style: 'currency' }).resolvedOptions().currency === 'SAR')) ||
          // Check time offset (Saudi Arabia is UTC+3)
          new Date().getTimezoneOffset() === 180; // Saudi Arabia time zone
          
        console.log('🇸🇦 Saudi Arabia indicators:', {
          locale,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          timeOffset: new Date().getTimezoneOffset(),
          isSaudi: isSaudiArabia
        });
        
        if (isSaudiArabia) {
          console.log('✅ Saudi Arabia detected from browser indicators');
          resolve('SA');
          return;
        }

        // Method 3: Try to get country from timezone (with comprehensive mappings)
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

        // Method 4: Try to get country from browser accept languages (fallback)
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
      detectCountryWithGeolocation();
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
