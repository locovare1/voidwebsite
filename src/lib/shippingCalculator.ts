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

// Complex Pipeline Shipping Calculator - Multiple Factors Combined
const PIPELINE_CONFIG = {
  // Base costs
  carrierBaseCost: 12.00,
  handlingFee: 8.50,
  packagingFee: 6.50,

  // Distance-based factors (linear)
  baseDistanceRate: 0.25,        // Base rate per mile
  distanceMultiplier: 1.15,      // Multiplier for distance calculation
  distanceThreshold: 100,        // Miles where additional factors kick in

  // Weight factors (assuming 1lb standard)
  weightBaseCost: 2.00,
  weightPerPound: 1.50,

  // Geographic factors
  urbanSurcharge: 3.00,          // Additional cost for major cities
  ruralSurcharge: 5.00,          // Additional cost for rural areas

  // Service factors
  standardServiceFee: 4.00,
  expeditedMultiplier: 1.8,

  // Fuel and operational costs
  fuelSurchargeRate: 0.12,       // 12% of base calculation
  operationalOverhead: 7.25,

  // Time-based factors
  peakSeasonMultiplier: 1.25,    // Holiday/peak times
  offSeasonDiscount: 0.95,       // Off-peak discount
}

// Origin coordinates for ZIP 11549 (Hempstead, NY)
const ORIGIN_LAT = 40.7062;
const ORIGIN_LON = -73.6187;

// Cache for processed ZIP data
let processedZipCache: ProcessedZipData | null = null;

/**
 * Complex Pipeline Shipping Calculator
 * Multiple factors combined in a processing pipeline with linear distance effects
 */
export function calculateShippingCost(destinationZip: string): {
  totalCost: number;
  breakdown: {
    baseCosts: number;
    distanceCosts: number;
    weightCosts: number;
    geographicCosts: number;
    serviceCosts: number;
    operationalCosts: number;
    adjustments: number;
  };
  distance: number;
  zone: string;
  city: string;
  state: string;
  pipelineSteps: Array<{
    step: string;
    calculation: string;
    amount: number;
    runningTotal: number;
  }>;
} {
  // Get ZIP data with validation
  const zipData = getZipData(destinationZip);
  if (!zipData) {
    throw new Error(`Invalid or not found US ZIP code: ${destinationZip}`);
  }

  const distance = zipData.distance!;
  const pipelineSteps: Array<{ step: string; calculation: string; amount: number; runningTotal: number }> = [];
  let runningTotal = 0;

  // PIPELINE STEP 1: Base Costs
  const baseCosts = PIPELINE_CONFIG.carrierBaseCost + PIPELINE_CONFIG.handlingFee + PIPELINE_CONFIG.packagingFee;
  runningTotal += baseCosts;
  pipelineSteps.push({
    step: 'Base Costs',
    calculation: `Carrier ($${PIPELINE_CONFIG.carrierBaseCost}) + Handling ($${PIPELINE_CONFIG.handlingFee}) + Packaging ($${PIPELINE_CONFIG.packagingFee})`,
    amount: baseCosts,
    runningTotal
  });

  // PIPELINE STEP 2: Distance Costs (Linear)
  const baseDistanceCost = distance * PIPELINE_CONFIG.baseDistanceRate;
  const distanceMultiplierEffect = distance > PIPELINE_CONFIG.distanceThreshold ?
    (distance - PIPELINE_CONFIG.distanceThreshold) * (PIPELINE_CONFIG.distanceMultiplier - 1) * PIPELINE_CONFIG.baseDistanceRate : 0;
  const totalDistanceCosts = baseDistanceCost + distanceMultiplierEffect;
  runningTotal += totalDistanceCosts;
  pipelineSteps.push({
    step: 'Distance Costs',
    calculation: `(${distance} miles × $${PIPELINE_CONFIG.baseDistanceRate}) + multiplier effect`,
    amount: totalDistanceCosts,
    runningTotal
  });

  // PIPELINE STEP 3: Weight Costs (assuming 1lb standard package)
  const weightCosts = PIPELINE_CONFIG.weightBaseCost + (1 * PIPELINE_CONFIG.weightPerPound);
  runningTotal += weightCosts;
  pipelineSteps.push({
    step: 'Weight Costs',
    calculation: `Base ($${PIPELINE_CONFIG.weightBaseCost}) + (1 lb × $${PIPELINE_CONFIG.weightPerPound})`,
    amount: weightCosts,
    runningTotal
  });

  // PIPELINE STEP 4: Geographic Costs
  const isUrban = isUrbanArea(zipData.city, zipData.state);
  const isRural = isRuralArea(distance, zipData.state);
  let geographicCosts = 0;
  if (isUrban) {
    geographicCosts += PIPELINE_CONFIG.urbanSurcharge;
  } else if (isRural) {
    geographicCosts += PIPELINE_CONFIG.ruralSurcharge;
  }
  runningTotal += geographicCosts;
  pipelineSteps.push({
    step: 'Geographic Costs',
    calculation: `${isUrban ? 'Urban' : isRural ? 'Rural' : 'Standard'} area surcharge`,
    amount: geographicCosts,
    runningTotal
  });

  // PIPELINE STEP 5: Service Costs
  const serviceCosts = PIPELINE_CONFIG.standardServiceFee;
  runningTotal += serviceCosts;
  pipelineSteps.push({
    step: 'Service Costs',
    calculation: `Standard service fee`,
    amount: serviceCosts,
    runningTotal
  });

  // PIPELINE STEP 6: Operational Costs
  const fuelSurcharge = runningTotal * PIPELINE_CONFIG.fuelSurchargeRate;
  const operationalCosts = PIPELINE_CONFIG.operationalOverhead + fuelSurcharge;
  runningTotal += operationalCosts;
  pipelineSteps.push({
    step: 'Operational Costs',
    calculation: `Overhead ($${PIPELINE_CONFIG.operationalOverhead}) + Fuel (${(PIPELINE_CONFIG.fuelSurchargeRate * 100)}% of subtotal)`,
    amount: operationalCosts,
    runningTotal
  });

  // PIPELINE STEP 7: Time-based Adjustments
  const seasonalMultiplier = getCurrentSeasonalMultiplier();
  const adjustments = runningTotal * (seasonalMultiplier - 1);
  runningTotal += adjustments;
  pipelineSteps.push({
    step: 'Seasonal Adjustments',
    calculation: `${seasonalMultiplier > 1 ? 'Peak season' : 'Off-season'} multiplier (${seasonalMultiplier}x)`,
    amount: adjustments,
    runningTotal
  });

  return {
    totalCost: Math.round(runningTotal * 100) / 100,
    breakdown: {
      baseCosts: Math.round(baseCosts * 100) / 100,
      distanceCosts: Math.round(totalDistanceCosts * 100) / 100,
      weightCosts: Math.round(weightCosts * 100) / 100,
      geographicCosts: Math.round(geographicCosts * 100) / 100,
      serviceCosts: Math.round(serviceCosts * 100) / 100,
      operationalCosts: Math.round(operationalCosts * 100) / 100,
      adjustments: Math.round(adjustments * 100) / 100,
    },
    distance,
    zone: zipData.zone!,
    city: zipData.city,
    state: zipData.state,
    pipelineSteps: pipelineSteps.map(step => ({
      ...step,
      amount: Math.round(step.amount * 100) / 100,
      runningTotal: Math.round(step.runningTotal * 100) / 100
    }))
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
 * Determine if location is urban area (major cities)
 */
function isUrbanArea(city: string, state: string): boolean {
  const majorCities = [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
    'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
    'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis',
    'Seattle', 'Denver', 'Washington', 'Boston', 'El Paso', 'Nashville',
    'Detroit', 'Oklahoma City', 'Portland', 'Las Vegas', 'Memphis', 'Louisville',
    'Baltimore', 'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno', 'Sacramento',
    'Mesa', 'Kansas City', 'Atlanta', 'Long Beach', 'Colorado Springs', 'Raleigh',
    'Miami', 'Virginia Beach', 'Omaha', 'Oakland', 'Minneapolis', 'Tulsa',
    'Arlington', 'Tampa', 'New Orleans'
  ];

  return majorCities.some(majorCity =>
    city.toLowerCase().includes(majorCity.toLowerCase()) ||
    majorCity.toLowerCase().includes(city.toLowerCase())
  );
}

/**
 * Determine if location is rural area (based on distance and state characteristics)
 */
function isRuralArea(distance: number, state: string): boolean {
  const ruralStates = ['MT', 'WY', 'ND', 'SD', 'AK', 'NE', 'KS', 'OK', 'NM', 'NV', 'UT', 'ID'];
  const isRuralState = ruralStates.includes(state);
  const isLongDistance = distance > 500;

  return isRuralState || isLongDistance;
}

/**
 * Get current seasonal multiplier (simplified - in real app would use actual dates)
 */
function getCurrentSeasonalMultiplier(): number {
  const currentMonth = new Date().getMonth() + 1; // 1-12

  // Peak season: November-December (holidays), June-August (summer)
  if ([11, 12, 6, 7, 8].includes(currentMonth)) {
    return PIPELINE_CONFIG.peakSeasonMultiplier;
  }

  // Off season: January-February
  if ([1, 2].includes(currentMonth)) {
    return PIPELINE_CONFIG.offSeasonDiscount;
  }

  // Standard season
  return 1.0;
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
 * Get pipeline configuration and factor information
 */
export function getShippingPipelineInfo(): {
  pipelineSteps: string[];
  configuration: typeof PIPELINE_CONFIG;
  description: string;
} {
  return {
    pipelineSteps: [
      'Base Costs (Carrier + Handling + Packaging)',
      'Distance Costs (Linear with multiplier effects)',
      'Weight Costs (Standard package)',
      'Geographic Costs (Urban/Rural adjustments)',
      'Service Costs (Standard service fees)',
      'Operational Costs (Fuel surcharge + Overhead)',
      'Seasonal Adjustments (Peak/Off-season multipliers)'
    ],
    configuration: PIPELINE_CONFIG,
    description: 'Complex multi-factor pipeline system with linear distance effects and no min/max limits'
  };
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