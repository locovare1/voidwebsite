// The Easy API Shipping Calculation Utility
// This module handles real-time shipping cost calculations using The Easy API

// API key for The Easy API
const EASY_API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE3OTEyNTI1NjEsImF1ZCI6MTU1NX0.KlmuGy47-AuMAXgLWQt5nt1wplktXrmg1w-EIrmNkyI';

interface EasyShippingRateRequest {
  origin: {
    zip: string;
    country: string;
  };
  destination: {
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
 * @param originZip - Origin ZIP code
 * @param originCountry - Origin country code
 * @param destinationZip - Destination ZIP code
 * @param destinationCountry - Destination country code
 * @param weight - Package weight in pounds
 * @returns Shipping cost in USD
 */
export async function calculateEasyShippingCost(
  originZip: string,
  originCountry: string,
  destinationZip: string,
  destinationCountry: string,
  weight: number
): Promise<number> {
  try {
    // Make a request to The Easy API endpoint
    const response = await fetch('https://api.theeasyapi.com/shipping/rates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${EASY_API_KEY}`
      },
      body: JSON.stringify({
        origin: {
          zip: originZip,
          country: originCountry
        },
        destination: {
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
      throw new Error(`The Easy API request failed with status ${response.status}`);
    }

    // Parse the response
    const data: EasyShippingRateResponse = await response.json();
    
    // Return the shipping cost
    return data.rate.total;
  } catch (error) {
    console.error('Error calculating shipping cost with The Easy API:', error);
    // Fallback to mock calculation if API call fails
    const baseRate = 5.00;
    const weightFactor = weight * 0.5;
    const distanceFactor = calculateDistanceFactor(originZip, destinationZip);
    return Math.max(5.00, baseRate + weightFactor + distanceFactor);
  }
}

/**
 * Calculate a distance factor based on ZIP codes (simplified)
 * @param originZip - Origin ZIP code
 * @param destinationZip - Destination ZIP code
 * @returns Distance factor for shipping cost calculation
 */
function calculateDistanceFactor(originZip: string, destinationZip: string): number {
  // This is a simplified mock implementation
  // In a real implementation, you would use a geocoding service
  // to calculate the actual distance between ZIP codes
  
  // Extract the first 3 digits of each ZIP code for a rough comparison
  const originPrefix = parseInt(originZip.substring(0, 3)) || 0;
  const destinationPrefix = parseInt(destinationZip.substring(0, 3)) || 0;
  
  // Calculate a rough "distance" based on ZIP code differences
  const zipDifference = Math.abs(originPrefix - destinationPrefix);
  
  // Convert to a cost factor (simplified)
  return Math.min(20.00, zipDifference * 0.1);
}

/**
 * Get the configured API key
 * @returns The Easy API key
 */
export function getEasyAPIKey(): string {
  return EASY_API_KEY;
}