// The Easy API Shipping Calculation Utility
// This module handles real-time shipping cost calculations using The Easy API

// API key for The Easy API
const EASY_API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE3OTEyNTI1NjEsImF1ZCI6MTU1NX0.KlmuGy47-AuMAXgLWQt5nt1wplktXrmg1w-EIrmNkyI';

import { countries, getCountryByCode } from '@/lib/countries';

interface EasyShippingRateRequest {
  origin: {
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  destination: {
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  package: {
    weight: number; // in pounds
  };
}

interface EasyShippingRateResponse {
  rate: {
    total: number;
    currency: string;
    estimatedDelivery: string;
  };
}

/**
 * Calculate shipping cost using The Easy API
 * @param originAddress - Origin street address
 * @param originCity - Origin city
 * @param originState - Origin state
 * @param originZip - Origin ZIP code
 * @param originCountry - Origin country code
 * @param destinationAddress - Destination street address
 * @param destinationCity - Destination city
 * @param destinationState - Destination state
 * @param destinationZip - Destination ZIP code
 * @param destinationCountry - Destination country code
 * @param weight - Package weight in pounds
 * @returns Shipping cost in USD
 */
export async function calculateEasyShippingCost(
  originAddress: string,
  originCity: string,
  originState: string,
  originZip: string,
  originCountry: string,
  destinationAddress: string,
  destinationCity: string,
  destinationState: string,
  destinationZip: string,
  destinationCountry: string,
  weight: number
): Promise<number> {
  try {
    // Log the request for debugging
    console.log('Shipping calculation request:', {
      origin: { address: originAddress, city: originCity, state: originState, zip: originZip, country: originCountry },
      destination: { address: destinationAddress, city: destinationCity, state: destinationState, zip: destinationZip, country: destinationCountry },
      weight: weight
    });

    // Make a request to The Easy API endpoint
    const response = await fetch('https://api.theeasyapi.com/shipping/rates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${EASY_API_KEY}`
      },
      body: JSON.stringify({
        origin: {
          address: originAddress,
          city: originCity,
          state: originState,
          zip: originZip,
          country: originCountry
        },
        destination: {
          address: destinationAddress,
          city: destinationCity,
          state: destinationState,
          zip: destinationZip,
          country: destinationCountry
        },
        package: {
          weight: weight
        }
      })
    });

    // Check if the response is successful
    if (!response.ok) {
      console.log(`The Easy API request failed with status ${response.status}, falling back to mock calculation`);
      throw new Error(`API request failed with status ${response.status}`);
    }

    // Parse the response
    const data: EasyShippingRateResponse = await response.json();
    
    console.log('API response:', data);
    // Return the shipping cost
    return data.rate.total;
  } catch (error) {
    console.error('Error calculating shipping cost with The Easy API:', error);
    // Fallback to mock calculation if API call fails
    // This is a more realistic calculation based on weight and distance
    const isInternational = originCountry !== destinationCountry;
    console.log('Using fallback calculation. International:', isInternational, 'Origin:', originCountry, 'Destination:', destinationCountry);
    const baseRate = isInternational ? 25.00 : 5.00; // Higher base rate for international
    const weightFactor = weight * (isInternational ? 3.0 : 1.0); // Higher weight factor for international
    const distanceFactor = calculateDistanceFactor(originZip, destinationZip, originCountry, destinationCountry);
    console.log('Calculation factors - Base:', baseRate, 'Weight:', weightFactor, 'Distance:', distanceFactor);
    const totalCost = baseRate + weightFactor + distanceFactor;
    const minCost = isInternational ? 15.00 : 5.00; // Higher minimum for international
    const finalCost = Math.max(minCost, totalCost);
    console.log('Final calculated cost:', finalCost);
    return finalCost;
  }
}

/**
 * Calculate a distance factor based on postal codes (simplified)
 * @param originZip - Origin postal code
 * @param destinationZip - Destination postal code
 * @param originCountry - Origin country code
 * @param destinationCountry - Destination country code
 * @returns Distance factor for shipping cost calculation
 */
function calculateDistanceFactor(
  originZip: string, 
  destinationZip: string, 
  originCountry: string, 
  destinationCountry: string
): number {
  // This is a simplified mock implementation that works with international postal codes
  // In a real implementation, you would use a geocoding service
  // to calculate the actual distance between locations
  
  // For international shipments, use a higher distance factor
  const isInternational = originCountry !== destinationCountry;
  
  // If it's an international shipment, use a base distance factor
  if (isInternational) {
    // Simple approach: assign distance factors based on continent groups
    const continentGroups: Record<string, number[]> = {
      // North America
      'NA': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      // Europe
      'EU': [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
      // Asia
      'AS': [21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
      // Africa
      'AF': [31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
      // South America
      'SA': [41, 42, 43, 44, 45, 46, 47, 48, 49, 50],
      // Oceania
      'OC': [51, 52, 53, 54, 55, 56, 57, 58, 59, 60]
    };
    
    // Assign countries to continent groups (simplified)
    const countryToContinent: Record<string, string> = {
      'US': 'NA', 'CA': 'NA', 'MX': 'NA',
      'GB': 'EU', 'DE': 'EU', 'FR': 'EU', 'IT': 'EU', 'ES': 'EU', 'NL': 'EU', 'SE': 'EU', 'CH': 'EU', 'AT': 'EU', 'BE': 'EU', 'DK': 'EU', 'FI': 'EU', 'NO': 'EU', 'IE': 'EU', 'PT': 'EU', 'GR': 'EU', 'CZ': 'EU', 'HU': 'EU', 'PL': 'EU', 'RO': 'EU',
      'SA': 'AS', 'JP': 'AS', 'CN': 'AS', 'IN': 'AS', 'KR': 'AS', 'AE': 'AS', 'SG': 'AS', 'MY': 'AS', 'TH': 'AS', 'IL': 'AS', 'ID': 'AS', 'PH': 'AS', 'VN': 'AS', 'BD': 'AS', 'PK': 'AS', 'TW': 'AS', 'HK': 'AS',
      'EG': 'AF', 'ZA': 'AF', 'NG': 'AF', 'KE': 'AF', 'MA': 'AF',
      'BR': 'SA', 'AR': 'SA', 'CL': 'SA', 'CO': 'SA',
      'AU': 'OC', 'NZ': 'OC'
    };
    
    const originContinent = countryToContinent[originCountry] || 'NA';
    const destinationContinent = countryToContinent[destinationCountry] || 'NA';
    
    // If both countries are in the same continent group, use a lower distance factor
    if (originContinent === destinationContinent) {
      return 15.00;
    }
    
    // Otherwise, use a higher distance factor for intercontinental shipping
    return 25.00;
  }
  
  // For domestic shipments, use the original ZIP code-based calculation
  // Extract alphanumeric characters and take the first 3 characters for comparison
  const originCode = originZip.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
  const destinationCode = destinationZip.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
  
  // If either code is empty, return a default distance factor
  if (!originCode || !destinationCode) {
    return 10.00;
  }
  
  // Calculate a rough "distance" based on character differences
  let difference = 0;
  for (let i = 0; i < Math.min(originCode.length, destinationCode.length); i++) {
    // Compare ASCII values of characters
    difference += Math.abs(originCode.charCodeAt(i) - destinationCode.charCodeAt(i));
  }
  
  // Normalize the difference to a cost factor (simplified)
  const normalizedDifference = difference / 10;
  return Math.min(20.00, normalizedDifference);
}

/**
 * Get the configured API key
 * @returns The Easy API key
 */
export function getEasyAPIKey(): string {
  return EASY_API_KEY;
}