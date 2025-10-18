// Simple test to verify the shipping calculator logic
// This tests the core calculation without requiring the server

// Mock the ZIP code data for testing
const mockZipData = {
  '10001': { latitude: 40.7505, longitude: -73.9934, city: 'New York', state: 'NY' }, // NYC
  '90210': { latitude: 34.0901, longitude: -118.4065, city: 'Beverly Hills', state: 'CA' }, // LA
  '60601': { latitude: 41.8781, longitude: -87.6298, city: 'Chicago', state: 'IL' }, // Chicago
  '11549': { latitude: 40.7062, longitude: -73.6187, city: 'Hempstead', state: 'NY' } // Origin
};

// Origin coordinates for ZIP 11549 (Hempstead, NY)
const ORIGIN_LAT = 40.7062;
const ORIGIN_LON = -73.6187;
const BASE_COST = 23.50;

// Calculate distance using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
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

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

// Calculate zone cost based on distance
function calculateZoneCost(distance) {
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

// Test the calculation
function testShippingCalculation(zip) {
  const destData = mockZipData[zip];
  if (!destData) {
    return { error: `ZIP code ${zip} not found in test data` };
  }

  const distance = calculateDistance(ORIGIN_LAT, ORIGIN_LON, destData.latitude, destData.longitude);
  const { zoneCost, zone } = calculateZoneCost(distance);
  const totalCost = BASE_COST + zoneCost;

  return {
    zip,
    city: destData.city,
    state: destData.state,
    distance: Math.round(distance * 100) / 100,
    zone,
    zoneCost,
    baseCost: BASE_COST,
    totalCost: Math.round(totalCost * 100) / 100,
    formula: `$${BASE_COST} + $${zoneCost} = $${totalCost.toFixed(2)}`
  };
}

// Run tests
console.log('🚚 Testing Shipping Calculator Formula');
console.log('Formula: CTotal = 23.50 + CZone(Destination ZIP)');
console.log('Origin: ZIP 11549 (Hempstead, NY)\n');

const testZips = ['11549', '10001', '60601', '90210'];

testZips.forEach(zip => {
  const result = testShippingCalculation(zip);
  if (result.error) {
    console.log(`❌ ${result.error}`);
  } else {
    console.log(`📍 ZIP ${result.zip} (${result.city}, ${result.state}):`);
    console.log(`   Distance: ${result.distance} miles`);
    console.log(`   Zone: ${result.zone}`);
    console.log(`   Calculation: ${result.formula}`);
    console.log(`   Total Cost: $${result.totalCost}`);
    console.log('');
  }
});

console.log('✅ Shipping calculator test completed!');