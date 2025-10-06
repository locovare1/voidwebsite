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
  // For now, we'll return a mock value since we don't have The Easy API endpoint
  // In a real implementation, you would:
  // 1. Make a request to The Easy API endpoint
  // 2. Parse the response and return the shipping cost
  
  // Mock calculation based on distance and weight
  const baseRate = 5.00;
  const weightFactor = weight * 0.5;
  const distanceFactor = calculateDistanceFactor(originZip, destinationZip);
  
  return Math.max(5.00, baseRate + weightFactor + distanceFactor);
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