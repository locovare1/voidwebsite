// US Shipping Cost Calculator
// Formula: CTotal = 23.50 + CZone(Destination ZIP)

import fs from 'fs';
import path from 'path';

interface ZipCodeData {
  zip: string;
  latitude: number;
  longitude: number;
  state: string;
  city: string;
  distance?: number;
  zone?: string;
  zoneCost?: number;
}

interface ProcessedZipData {
  [key: string]: ZipCodeData;
}

// Fixed values from the formula
const CARRIER_BASE_COST = 12.00; // $ Carrier base cost
const FIXED_OVERHEAD = 15.00; // $ Fixed overhead (Packaging + Handling)
const BASE_COST = CARRIER_BASE_COST + FIXED_OVERHEAD; // $ Total base cost (27.00)
const ADDITIONAL_SURCHARGE = 10.00; // $ Additional surcharge for all shipments
const PER_MILE_CHARGE = 0.15; // $ Additional charge per mile
const DISTANCE_CHARGE_RATE = 2.00 / 3; // $ 2 dollars for every 3 miles (0.67 per mile)

// Origin coordinates for ZIP 11549 (Hempstead, NY)
const ORIGIN_LAT = 40.7062;
const ORIGIN_LON = -73.6187;

// Cache for processed ZIP data
let processedZipCache: ProcessedZipData | null = null;

/**
 * Calculate shipping cost using the customized formula
 * CTotal = 27.00 + CZone(Destination ZIP) + $10 surcharge + ($0.15 × distance) + ($2 for every 3 miles)
 */
export function calculateShippingCost(destinationZip: string): {
  totalCost: number;
  baseCost: number;
  zoneCost: number;
  surcharge: number;
  perMileCharge: number;
  distanceCharge: number;
  distance: number;
  zone: string;
  city: string;
  state: string;
} {
  // Get ZIP data with validation
  const zipData = getZipData(destinationZip);
  if (!zipData) {
    throw new Error(`Invalid or not found US ZIP code: ${destinationZip}`);
  }

  // Calculate per-mile charge ($0.15 per mile)
  const perMileCharge = zipData.distance! * PER_MILE_CHARGE;

  // Calculate distance charge ($2 for every 3 miles)
  const distanceCharge = zipData.distance! * DISTANCE_CHARGE_RATE;

  // Apply formula: Base Cost + Zone Cost + Additional Surcharge + Per Mile Charge + Distance Charge
  const totalCost = BASE_COST + zipData.zoneCost! + ADDITIONAL_SURCHARGE + perMileCharge + distanceCharge;

  return {
    totalCost: Math.round(totalCost * 100) / 100,
    baseCost: BASE_COST,
    zoneCost: zipData.zoneCost!,
    surcharge: ADDITIONAL_SURCHARGE,
    perMileCharge: Math.round(perMileCharge * 100) / 100,
    distanceCharge: Math.round(distanceCharge * 100) / 100,
    distance: zipData.distance!,
    zone: zipData.zone!,
    city: zipData.city,
    state: zipData.state
  };
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
 * Process and cache ZIP code database with zones and distances
 */
function processZipDatabase(): ProcessedZipData {
  if (processedZipCache) {
    return processedZipCache;
  }

  try {
    const csvPath = path.join(process.cwd(), 'zip_code_database.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');

    const lines = csvContent.split('\n');
    const headers = lines[0].split(',');

    // Find column indices
    const zipIndex = headers.indexOf('zip');
    const latIndex = headers.indexOf('latitude');
    const lonIndex = headers.indexOf('longitude');
    const stateIndex = headers.indexOf('state');
    const cityIndex = headers.indexOf('primary_city');
    const countryIndex = headers.indexOf('country');
    const shippingZoneIndex = headers.indexOf('shipping_zone');
    const zoneCostIndex = headers.indexOf('zone_cost');
    const distanceIndex = headers.indexOf('distance_from_origin');

    const processedData: ProcessedZipData = {};

    // Process each ZIP code
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle CSV parsing with quoted fields
      const columns = parseCSVLine(line);
      if (columns.length < headers.length - 3) continue; // Account for new columns

      const zip = columns[zipIndex];
      const country = columns[countryIndex];
      const lat = parseFloat(columns[latIndex]);
      const lon = parseFloat(columns[lonIndex]);

      // Only process US ZIP codes with valid coordinates
      if (country !== 'US' || isNaN(lat) || isNaN(lon)) continue;

      // Use pre-calculated values if available, otherwise calculate
      let distance, zone, zoneCost;

      if (shippingZoneIndex >= 0 && zoneCostIndex >= 0 && distanceIndex >= 0 &&
        columns[shippingZoneIndex] && columns[zoneCostIndex] && columns[distanceIndex]) {
        // Use pre-calculated values
        zone = columns[shippingZoneIndex].replace(/"/g, '');
        zoneCost = parseFloat(columns[zoneCostIndex]);
        distance = parseFloat(columns[distanceIndex]);
      } else {
        // Calculate on the fly
        distance = calculateDistance(ORIGIN_LAT, ORIGIN_LON, lat, lon);
        const zoneInfo = calculateZoneCost(distance);
        zone = zoneInfo.zone;
        zoneCost = zoneInfo.zoneCost;
        distance = Math.round(distance * 100) / 100;
      }

      processedData[zip] = {
        zip,
        latitude: lat,
        longitude: lon,
        state: columns[stateIndex],
        city: columns[cityIndex],
        distance,
        zone,
        zoneCost
      };
    }

    processedZipCache = processedData;
    console.log(`Processed ${Object.keys(processedData).length} US ZIP codes`);
    return processedData;
  } catch (error) {
    console.error('Error processing ZIP code database:', error);
    return {};
  }
}

/**
 * Parse CSV line handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

/**
 * Get ZIP code data with validation
 */
function getZipData(zip: string): ZipCodeData | null {
  // Validate ZIP format first
  if (!isValidUSZip(zip)) {
    return null;
  }

  const cleanZip = zip.split('-')[0]; // Take only the first 5 digits
  const processedData = processZipDatabase();

  return processedData[cleanZip] || null;
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
 * Calculate realistic distance-based shipping cost
 * Based on research of actual shipping companies (UPS, FedEx, USPS)
 * Cost increases gradually with distance, not fixed zone rates
 */
function calculateZoneCost(distance: number): { zoneCost: number; zone: string } {
  let zoneCost: number;
  let zone: string;

  if (distance <= 50) {
    // Local delivery - minimal cost
    zoneCost = Math.max(0, distance * 0.02); // $0.02 per mile
    zone = 'Zone 1 (Local)';
  } else if (distance <= 150) {
    // Regional - base cost + distance factor
    zoneCost = 1.00 + (distance - 50) * 0.015; // $1 base + $0.015 per mile over 50
    zone = 'Zone 2 (Regional)';
  } else if (distance <= 300) {
    // Regional extended
    zoneCost = 2.50 + (distance - 150) * 0.017; // $2.50 base + $0.017 per mile over 150
    zone = 'Zone 3 (Regional)';
  } else if (distance <= 600) {
    // Mid-range national
    zoneCost = 5.05 + (distance - 300) * 0.008; // $5.05 base + $0.008 per mile over 300
    zone = 'Zone 4 (Regional)';
  } else if (distance <= 1000) {
    // National
    zoneCost = 7.45 + (distance - 600) * 0.0065; // $7.45 base + $0.0065 per mile over 600
    zone = 'Zone 5 (National)';
  } else if (distance <= 1400) {
    // Extended national
    zoneCost = 10.05 + (distance - 1000) * 0.006; // $10.05 base + $0.006 per mile over 1000
    zone = 'Zone 6 (National)';
  } else if (distance <= 1800) {
    // Long distance
    zoneCost = 12.45 + (distance - 1400) * 0.0065; // $12.45 base + $0.0065 per mile over 1400
    zone = 'Zone 7 (National)';
  } else if (distance <= 2500) {
    // Cross-country
    zoneCost = 15.05 + (distance - 1800) * 0.0035; // $15.05 base + $0.0035 per mile over 1800
    zone = 'Zone 8 (Cross-Country)';
  } else {
    // Extreme distance (Alaska, Hawaii, etc.)
    zoneCost = 17.50 + (distance - 2500) * 0.002; // $17.50 base + $0.002 per mile over 2500
    zone = 'Zone 9 (Extreme Distance)';
  }

  // Round to 2 decimal places and ensure minimum cost
  zoneCost = Math.max(0, Math.round(zoneCost * 100) / 100);

  return { zoneCost, zone };
}

/**
 * Get shipping zones information with customized pricing formula
 */
export function getShippingZones(): Array<{
  zone: string;
  distanceRange: string;
  zoneCostRange: string;
  perMileRange: string;
  distanceChargeRange: string;
  totalCostRange: string;
  description: string;
}> {
  return [
    {
      zone: 'Zone 1 (Local)',
      distanceRange: '0-50 miles',
      zoneCostRange: '$0.00-$1.00',
      perMileRange: '$0.00-$7.50',
      distanceChargeRange: '$0.00-$33.33',
      totalCostRange: '$37.00-$78.83',
      description: 'Base: $27 + Zone + $10 surcharge + $0.15/mile + $2 per 3 miles'
    },
    {
      zone: 'Zone 2 (Regional)',
      distanceRange: '51-150 miles',
      zoneCostRange: '$1.00-$2.50',
      perMileRange: '$7.65-$22.50',
      distanceChargeRange: '$34.00-$100.00',
      totalCostRange: '$79.65-$162.00',
      description: 'Base: $27 + Zone + $10 surcharge + $0.15/mile + $2 per 3 miles'
    },
    {
      zone: 'Zone 3 (Regional)',
      distanceRange: '151-300 miles',
      zoneCostRange: '$2.50-$5.05',
      perMileRange: '$22.65-$45.00',
      distanceChargeRange: '$100.67-$200.00',
      totalCostRange: '$162.82-$287.05',
      description: 'Base: $27 + Zone + $10 surcharge + $0.15/mile + $2 per 3 miles'
    },
    {
      zone: 'Zone 4 (Regional)',
      distanceRange: '301-600 miles',
      zoneCostRange: '$5.05-$7.45',
      perMileRange: '$45.15-$90.00',
      distanceChargeRange: '$200.67-$400.00',
      totalCostRange: '$287.87-$534.45',
      description: 'Base: $27 + Zone + $10 surcharge + $0.15/mile + $2 per 3 miles'
    },
    {
      zone: 'Zone 5 (National)',
      distanceRange: '601-1000 miles',
      zoneCostRange: '$7.45-$10.05',
      perMileRange: '$90.15-$150.00',
      distanceChargeRange: '$400.67-$666.67',
      totalCostRange: '$535.27-$863.72',
      description: 'Base: $27 + Zone + $10 surcharge + $0.15/mile + $2 per 3 miles'
    },
    {
      zone: 'Zone 6 (National)',
      distanceRange: '1001-1400 miles',
      zoneCostRange: '$10.05-$12.45',
      perMileRange: '$150.15-$210.00',
      distanceChargeRange: '$667.33-$933.33',
      totalCostRange: '$864.53-$1192.78',
      description: 'Base: $27 + Zone + $10 surcharge + $0.15/mile + $2 per 3 miles'
    },
    {
      zone: 'Zone 7 (National)',
      distanceRange: '1401-1800 miles',
      zoneCostRange: '$12.45-$15.05',
      perMileRange: '$210.15-$270.00',
      distanceChargeRange: '$934.00-$1200.00',
      totalCostRange: '$1193.60-$1522.05',
      description: 'Base: $27 + Zone + $10 surcharge + $0.15/mile + $2 per 3 miles'
    },
    {
      zone: 'Zone 8 (Cross-Country)',
      distanceRange: '1801-2500 miles',
      zoneCostRange: '$15.05-$17.50',
      perMileRange: '$270.15-$375.00',
      distanceChargeRange: '$1200.67-$1666.67',
      totalCostRange: '$1522.87-$2096.17',
      description: 'Base: $27 + Zone + $10 surcharge + $0.15/mile + $2 per 3 miles'
    },
    {
      zone: 'Zone 9 (Extreme Distance)',
      distanceRange: '2500+ miles',
      zoneCostRange: '$17.50+',
      perMileRange: '$375.00+',
      distanceChargeRange: '$1666.67+',
      totalCostRange: '$2096.17+',
      description: 'Base: $27 + Zone + $10 surcharge + $0.15/mile + $2 per 3 miles'
    }
  ];
}

/**
 * Validate that shipping is only for US
 */
export function validateUSShipping(country: string): boolean {
  return country.toUpperCase() === 'US' || country.toUpperCase() === 'USA';
}

/**
 * Get all processed ZIP codes with their zones and distances
 */
export function getAllZipCodes(): ProcessedZipData {
  return processZipDatabase();
}

/**
 * Validate ZIP code exists in database
 */
export function validateZipCode(zip: string): boolean {
  const zipData = getZipData(zip);
  return zipData !== null;
}