// US Shipping Cost Calculator
// Based on the mathematical formula provided:
// CTotal = 23.50 + CZone(Destination ZIP)
// Where CZone varies based on distance from origin ZIP 11549 (New York) to destination ZIP

import fs from 'fs';
import path from 'path';

interface ZipCodeData {
  zip: string;
  latitude: number;
  longitude: number;
  state: string;
  city: string;
}

// Fixed values from the formula
const PACKAGE_BILLABLE_WEIGHT = 1.0; // lb
const CARRIER_BASE_COST = 8.50; // $
const FIXED_OVERHEAD = 15.00; // $ (Packaging + Handling)
const ORIGIN_ZIP = '11549'; // New York
const BASE_COST = 23.50; // $ (8.50 + 15.00)

// Origin coordinates for ZIP 11549 (Hempstead, NY)
const ORIGIN_LAT = 40.7062;
const ORIGIN_LON = -73.6187;

/**
 * Calculate shipping cost using the exact formula provided
 * CTotal = 23.50 + CZone(Destination ZIP)
 */
export async function calculateShippingCost(destinationZip: string): Promise<{
  totalCost: number;
  baseCost: number;
  zoneCost: number;
  distance: number;
  zone: string;
}> {
  try {
    // Validate destination ZIP is US format
    if (!isValidUSZip(destinationZip)) {
      throw new Error('Invalid US ZIP code format');
    }

    // Get destination coordinates
    const destCoords = await getZipCoordinates(destinationZip);
    if (!destCoords) {
      throw new Error(`ZIP code ${destinationZip} not found in database`);
    }

    // Calculate distance in miles
    const distance = calculateDistance(ORIGIN_LAT, ORIGIN_LON, destCoords.latitude, destCoords.longitude);

    // Calculate zone cost based on distance
    const { zoneCost, zone } = calculateZoneCost(distance);

    // Apply the formula: CTotal = 23.50 + CZone
    const totalCost = BASE_COST + zoneCost;

    return {
      totalCost: Math.round(totalCost * 100) / 100, // Round to 2 decimal places
      baseCost: BASE_COST,
      zoneCost,
      distance: Math.round(distance * 100) / 100,
      zone
    };
  } catch (error) {
    console.error('Error calculating shipping cost:', error);
    throw error;
  }
}

/**
 * Validate US ZIP code format
 */
function isValidUSZip(zip: string): boolean {
  // US ZIP codes: 5 digits or 5+4 format
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zip);
}

/**
 * Get coordinates for a ZIP code from the database
 */
async function getZipCoordinates(zip: string): Promise<ZipCodeData | null> {
  try {
    // Read the CSV file
    const csvPath = path.join(process.cwd(), 'zip_code_database.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    // Parse CSV and find the ZIP code
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',');
    
    // Find column indices
    const zipIndex = headers.indexOf('zip');
    const latIndex = headers.indexOf('latitude');
    const lonIndex = headers.indexOf('longitude');
    const stateIndex = headers.indexOf('state');
    const cityIndex = headers.indexOf('primary_city');
    
    // Clean the ZIP code (remove any extra characters)
    const cleanZip = zip.split('-')[0]; // Take only the first 5 digits
    
    // Search for the ZIP code
    for (let i = 1; i < lines.length; i++) {
      const columns = lines[i].split(',');
      if (columns[zipIndex] === cleanZip) {
        return {
          zip: columns[zipIndex],
          latitude: parseFloat(columns[latIndex]),
          longitude: parseFloat(columns[lonIndex]),
          state: columns[stateIndex],
          city: columns[cityIndex]
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error reading ZIP code database:', error);
    return null;
  }
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in miles
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate zone cost based on distance
 * This implements the CZone part of the formula
 */
function calculateZoneCost(distance: number): { zoneCost: number; zone: string } {
  // Define shipping zones based on distance from origin (11549 - New York)
  // These zones are based on typical USPS/UPS zone structures
  
  if (distance <= 50) {
    return { zoneCost: 0.00, zone: 'Zone 1 (Local)' };
  } else if (distance <= 150) {
    return { zoneCost: 2.50, zone: 'Zone 2 (Regional)' };
  } else if (distance <= 300) {
    return { zoneCost: 5.00, zone: 'Zone 3 (Regional)' };
  } else if (distance <= 600) {
    return { zoneCost: 7.50, zone: 'Zone 4 (Regional)' };
  } else if (distance <= 1000) {
    return { zoneCost: 10.00, zone: 'Zone 5 (National)' };
  } else if (distance <= 1400) {
    return { zoneCost: 12.50, zone: 'Zone 6 (National)' };
  } else if (distance <= 1800) {
    return { zoneCost: 15.00, zone: 'Zone 7 (National)' };
  } else {
    return { zoneCost: 17.50, zone: 'Zone 8 (Cross-Country)' };
  }
}

/**
 * Get shipping zones information
 */
export function getShippingZones(): Array<{
  zone: string;
  distanceRange: string;
  cost: number;
  totalCost: number;
}> {
  const zones = [
    { zone: 'Zone 1 (Local)', distanceRange: '0-50 miles', cost: 0.00 },
    { zone: 'Zone 2 (Regional)', distanceRange: '51-150 miles', cost: 2.50 },
    { zone: 'Zone 3 (Regional)', distanceRange: '151-300 miles', cost: 5.00 },
    { zone: 'Zone 4 (Regional)', distanceRange: '301-600 miles', cost: 7.50 },
    { zone: 'Zone 5 (National)', distanceRange: '601-1000 miles', cost: 10.00 },
    { zone: 'Zone 6 (National)', distanceRange: '1001-1400 miles', cost: 12.50 },
    { zone: 'Zone 7 (National)', distanceRange: '1401-1800 miles', cost: 15.00 },
    { zone: 'Zone 8 (Cross-Country)', distanceRange: '1801+ miles', cost: 17.50 }
  ];

  return zones.map(zone => ({
    ...zone,
    totalCost: BASE_COST + zone.cost
  }));
}

/**
 * Validate that shipping is only for US
 */
export function validateUSShipping(country: string): boolean {
  return country.toUpperCase() === 'US' || country.toUpperCase() === 'USA';
}