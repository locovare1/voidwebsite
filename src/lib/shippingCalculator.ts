// REAL-TIME SOPHISTICATED SHIPPING CALCULATOR
// Dense algorithm with actual working calculations

import fs from 'fs';
import path from 'path';

interface ZipCodeData {
  zip: string;
  latitude: number;
  longitude: number;
  state: string;
  city: string;
  distance?: number;
}

interface ProcessedZipData {
  [key: string]: ZipCodeData;
}

// ACTUAL SHIPPING COST FACTORS - REAL NUMBERS
const SHIPPING_FACTORS = {
  // Fixed base costs
  CARRIER_BASE: 12.00,
  HANDLING: 8.50,
  PACKAGING: 6.50,
  INSURANCE: 2.50,
  
  // Distance rates (per mile) - LINEAR
  BASE_RATE_PER_MILE: 0.35,
  LONG_DISTANCE_RATE: 0.28,  // Kicks in after 500 miles
  EXTREME_DISTANCE_RATE: 0.22, // Kicks in after 1500 miles
  
  // Weight (1lb standard)
  WEIGHT_BASE: 3.00,
  WEIGHT_PER_LB: 1.75,
  
  // Fuel surcharge (percentage of distance cost)
  FUEL_PERCENTAGE: 0.18,
  
  // Operational overhead
  PROCESSING_FEE: 4.50,
  FACILITY_FEE: 3.25,
  
  // Geographic multipliers
  URBAN_MULTIPLIER: 1.08,
  RURAL_MULTIPLIER: 1.12,
  
  // Seasonal (current month based)
  PEAK_MULTIPLIER: 1.15,
  OFF_PEAK_MULTIPLIER: 0.95,
};

// Origin coordinates for ZIP 11549 (Hempstead, NY)
const ORIGIN_LAT = 40.7062;
const ORIGIN_LON = -73.6187;

// Cache for processed ZIP data
let processedZipCache: ProcessedZipData | null = null;

/**
 * MAIN CALCULATION FUNCTION - REAL-TIME SOPHISTICATED ALGORITHM
 */
export function calculateShippingCost(destinationZip: string): {
  totalCost: number;
  breakdown: {
    baseCosts: number;
    distanceCosts: number;
    weightCosts: number;
    fuelSurcharge: number;
    operationalCosts: number;
    geographicAdjustment: number;
    seasonalAdjustment: number;
  };
  distance: number;
  city: string;
  state: string;
  calculationDetails: string[];
} {
  const zipData = getZipData(destinationZip);
  if (!zipData) {
    throw new Error(`Invalid US ZIP code: ${destinationZip}`);
  }

  const distance = zipData.distance!;
  const calculationDetails: string[] = [];
  
  // STEP 1: BASE COSTS (Fixed)
  const baseCosts = SHIPPING_FACTORS.CARRIER_BASE + 
                    SHIPPING_FACTORS.HANDLING + 
                    SHIPPING_FACTORS.PACKAGING + 
                    SHIPPING_FACTORS.INSURANCE;
  calculationDetails.push(`Base Costs: $${SHIPPING_FACTORS.CARRIER_BASE} + $${SHIPPING_FACTORS.HANDLING} + $${SHIPPING_FACTORS.PACKAGING} + $${SHIPPING_FACTORS.INSURANCE} = $${baseCosts.toFixed(2)}`);
  
  // STEP 2: DISTANCE COSTS (Linear with tiered rates)
  let distanceCosts = 0;
  if (distance <= 500) {
    distanceCosts = distance * SHIPPING_FACTORS.BASE_RATE_PER_MILE;
    calculationDetails.push(`Distance Costs: ${distance} miles × $${SHIPPING_FACTORS.BASE_RATE_PER_MILE}/mile = $${distanceCosts.toFixed(2)}`);
  } else if (distance <= 1500) {
    const firstTier = 500 * SHIPPING_FACTORS.BASE_RATE_PER_MILE;
    const secondTier = (distance - 500) * SHIPPING_FACTORS.LONG_DISTANCE_RATE;
    distanceCosts = firstTier + secondTier;
    calculationDetails.push(`Distance Costs: (500 × $${SHIPPING_FACTORS.BASE_RATE_PER_MILE}) + (${distance - 500} × $${SHIPPING_FACTORS.LONG_DISTANCE_RATE}) = $${distanceCosts.toFixed(2)}`);
  } else {
    const firstTier = 500 * SHIPPING_FACTORS.BASE_RATE_PER_MILE;
    const secondTier = 1000 * SHIPPING_FACTORS.LONG_DISTANCE_RATE;
    const thirdTier = (distance - 1500) * SHIPPING_FACTORS.EXTREME_DISTANCE_RATE;
    distanceCosts = firstTier + secondTier + thirdTier;
    calculationDetails.push(`Distance Costs: (500 × $${SHIPPING_FACTORS.BASE_RATE_PER_MILE}) + (1000 × $${SHIPPING_FACTORS.LONG_DISTANCE_RATE}) + (${distance - 1500} × $${SHIPPING_FACTORS.EXTREME_DISTANCE_RATE}) = $${distanceCosts.toFixed(2)}`);
  }
  
  // STEP 3: WEIGHT COSTS (1lb standard)
  const weightCosts = SHIPPING_FACTORS.WEIGHT_BASE + (1 * SHIPPING_FACTORS.WEIGHT_PER_LB);
  calculationDetails.push(`Weight Costs: $${SHIPPING_FACTORS.WEIGHT_BASE} + (1 lb × $${SHIPPING_FACTORS.WEIGHT_PER_LB}) = $${weightCosts.toFixed(2)}`);
  
  // STEP 4: FUEL SURCHARGE (percentage of distance costs)
  const fuelSurcharge = distanceCosts * SHIPPING_FACTORS.FUEL_PERCENTAGE;
  calculationDetails.push(`Fuel Surcharge: $${distanceCosts.toFixed(2)} × ${SHIPPING_FACTORS.FUEL_PERCENTAGE} = $${fuelSurcharge.toFixed(2)}`);
  
  // STEP 5: OPERATIONAL COSTS
  const operationalCosts = SHIPPING_FACTORS.PROCESSING_FEE + SHIPPING_FACTORS.FACILITY_FEE;
  calculationDetails.push(`Operational Costs: $${SHIPPING_FACTORS.PROCESSING_FEE} + $${SHIPPING_FACTORS.FACILITY_FEE} = $${operationalCosts.toFixed(2)}`);
  
  // STEP 6: GEOGRAPHIC ADJUSTMENT
  const isUrban = checkUrbanArea(zipData.city);
  const isRural = checkRuralArea(zipData.state, distance);
  let geoMultiplier = 1.0;
  let geoType = 'Standard';
  
  if (isUrban) {
    geoMultiplier = SHIPPING_FACTORS.URBAN_MULTIPLIER;
    geoType = 'Urban';
  } else if (isRural) {
    geoMultiplier = SHIPPING_FACTORS.RURAL_MULTIPLIER;
    geoType = 'Rural';
  }
  
  const subtotal = baseCosts + distanceCosts + weightCosts + fuelSurcharge + operationalCosts;
  const geographicAdjustment = subtotal * (geoMultiplier - 1);
  calculationDetails.push(`Geographic Adjustment (${geoType}): $${subtotal.toFixed(2)} × ${(geoMultiplier - 1).toFixed(2)} = $${geographicAdjustment.toFixed(2)}`);
  
  // STEP 7: SEASONAL ADJUSTMENT
  const seasonalMultiplier = getSeasonalMultiplier();
  const seasonType = seasonalMultiplier > 1 ? 'Peak Season' : seasonalMultiplier < 1 ? 'Off-Peak' : 'Standard';
  const subtotalWithGeo = subtotal + geographicAdjustment;
  const seasonalAdjustment = subtotalWithGeo * (seasonalMultiplier - 1);
  calculationDetails.push(`Seasonal Adjustment (${seasonType}): $${subtotalWithGeo.toFixed(2)} × ${(seasonalMultiplier - 1).toFixed(2)} = $${seasonalAdjustment.toFixed(2)}`);
  
  // FINAL TOTAL
  const totalCost = subtotalWithGeo + seasonalAdjustment;
  calculationDetails.push(`TOTAL: $${totalCost.toFixed(2)}`);
  
  return {
    totalCost: Math.round(totalCost * 100) / 100,
    breakdown: {
      baseCosts: Math.round(baseCosts * 100) / 100,
      distanceCosts: Math.round(distanceCosts * 100) / 100,
      weightCosts: Math.round(weightCosts * 100) / 100,
      fuelSurcharge: Math.round(fuelSurcharge * 100) / 100,
      operationalCosts: Math.round(operationalCosts * 100) / 100,
      geographicAdjustment: Math.round(geographicAdjustment * 100) / 100,
      seasonalAdjustment: Math.round(seasonalAdjustment * 100) / 100,
    },
    distance: Math.round(distance * 100) / 100,
    city: zipData.city,
    state: zipData.state,
    calculationDetails
  };
}

/**
 * Check if city is urban area
 */
function checkUrbanArea(city: string): boolean {
  const urbanCities = [
    'new york', 'los angeles', 'chicago', 'houston', 'phoenix', 'philadelphia',
    'san antonio', 'san diego', 'dallas', 'san jose', 'austin', 'jacksonville',
    'fort worth', 'columbus', 'charlotte', 'san francisco', 'indianapolis',
    'seattle', 'denver', 'washington', 'boston', 'nashville', 'detroit',
    'portland', 'las vegas', 'memphis', 'baltimore', 'milwaukee', 'atlanta',
    'miami', 'oakland', 'minneapolis', 'tampa', 'new orleans'
  ];
  
  const cityLower = city.toLowerCase();
  return urbanCities.some(urban => cityLower.includes(urban) || urban.includes(cityLower));
}

/**
 * Check if area is rural
 */
function checkRuralArea(state: string, distance: number): boolean {
  const ruralStates = ['MT', 'WY', 'ND', 'SD', 'AK', 'NE', 'KS', 'ID', 'NM', 'NV'];
  return ruralStates.includes(state) || distance > 800;
}

/**
 * Get seasonal multiplier based on current month
 */
function getSeasonalMultiplier(): number {
  const month = new Date().getMonth() + 1;
  
  // Peak: Nov-Dec (holidays), Jun-Aug (summer)
  if ([11, 12, 6, 7, 8].includes(month)) {
    return SHIPPING_FACTORS.PEAK_MULTIPLIER;
  }
  
  // Off-peak: Jan-Feb
  if ([1, 2].includes(month)) {
    return SHIPPING_FACTORS.OFF_PEAK_MULTIPLIER;
  }
  
  return 1.0;
}

/**
 * Validate US ZIP code format
 */
function isValidUSZip(zip: string): boolean {
  return /^\d{5}(-\d{4})?$/.test(zip);
}

/**
 * Get ZIP code data with validation
 */
function getZipData(zip: string): ZipCodeData | null {
  if (!isValidUSZip(zip)) {
    return null;
  }
  
  const cleanZip = zip.split('-')[0];
  const processedData = processZipDatabase();
  
  return processedData[cleanZip] || null;
}

/**
 * Process and cache ZIP code database
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
    
    const zipIndex = headers.indexOf('zip');
    const latIndex = headers.indexOf('latitude');
    const lonIndex = headers.indexOf('longitude');
    const stateIndex = headers.indexOf('state');
    const cityIndex = headers.indexOf('primary_city');
    const countryIndex = headers.indexOf('country');
    const distanceIndex = headers.indexOf('distance_from_origin');
    
    const processedData: ProcessedZipData = {};
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const columns = parseCSVLine(line);
      if (columns.length < headers.length - 3) continue;
      
      const zip = columns[zipIndex];
      const country = columns[countryIndex];
      const lat = parseFloat(columns[latIndex]);
      const lon = parseFloat(columns[lonIndex]);
      
      if (country !== 'US' || isNaN(lat) || isNaN(lon)) continue;
      
      let distance;
      if (distanceIndex >= 0 && columns[distanceIndex]) {
        distance = parseFloat(columns[distanceIndex]);
      } else {
        distance = calculateDistance(ORIGIN_LAT, ORIGIN_LON, lat, lon);
      }
      
      processedData[zip] = {
        zip,
        latitude: lat,
        longitude: lon,
        state: columns[stateIndex],
        city: columns[cityIndex],
        distance: Math.round(distance * 100) / 100
      };
    }
    
    processedZipCache = processedData;
    console.log(`Loaded ${Object.keys(processedData).length} US ZIP codes`);
    return processedData;
  } catch (error) {
    console.error('Error loading ZIP database:', error);
    return {};
  }
}

/**
 * Parse CSV line with quoted fields
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
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

/**
 * Calculate distance using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Validate US shipping
 */
export function validateUSShipping(country: string): boolean {
  return country.toUpperCase() === 'US' || country.toUpperCase() === 'USA';
}

/**
 * Validate ZIP code exists
 */
export function validateZipCode(zip: string): boolean {
  return getZipData(zip) !== null;
}

/**
 * Get all ZIP codes
 */
export function getAllZipCodes(): ProcessedZipData {
  return processZipDatabase();
}
