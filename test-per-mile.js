// Test the new pricing with $0.25 per mile charge
const fs = require('fs');

function parseCSVLine(line) {
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

function testPerMileCharges() {
  console.log('💰 Testing New Pricing: Base + Zone + $10 Surcharge + $0.25/Mile\n');
  
  const csvContent = fs.readFileSync('zip_code_database.csv', 'utf-8');
  const lines = csvContent.split('\n');
  const headers = parseCSVLine(lines[0]);
  
  const zipIndex = headers.indexOf('zip');
  const cityIndex = headers.indexOf('primary_city');
  const stateIndex = headers.indexOf('state');
  const shippingZoneIndex = headers.indexOf('shipping_zone');
  const zoneCostIndex = headers.indexOf('zone_cost');
  const distanceIndex = headers.indexOf('distance_from_origin');
  
  // Sample ZIP codes to test
  const testZips = ['11549', '10001', '19101', '33101', '60601', '80201', '90210', '98101'];
  
  console.log('📍 Complete Shipping Cost Breakdown:');
  console.log('─'.repeat(110));
  console.log('ZIP     City              Distance    Zone Cost   Base Cost   Surcharge   Per Mile    Total Cost');
  console.log('─'.repeat(110));
  
  for (const zip of testZips) {
    for (let i = 1; i < lines.length; i++) {
      const columns = parseCSVLine(lines[i]);
      if (columns[zipIndex] === zip) {
        const city = (columns[cityIndex] || 'Unknown').substring(0, 15).padEnd(15);
        const zone = columns[shippingZoneIndex]?.replace(/"/g, '') || '';
        const zoneCost = parseFloat(columns[zoneCostIndex]) || 0;
        const distance = parseFloat(columns[distanceIndex]) || 0;
        
        if (zone && zoneCost >= 0) {
          const baseCost = 23.50;
          const surcharge = 10.00;
          const perMileCharge = distance * 0.25;
          const totalCost = baseCost + zoneCost + surcharge + perMileCharge;
          
          const zipStr = zip.padEnd(7);
          const distStr = `${distance} mi`.padEnd(10);
          const zoneStr = `$${zoneCost.toFixed(2)}`.padEnd(10);
          const baseStr = `$${baseCost.toFixed(2)}`.padEnd(10);
          const surStr = `$${surcharge.toFixed(2)}`.padEnd(10);
          const mileStr = `$${perMileCharge.toFixed(2)}`.padEnd(10);
          const totalStr = `$${totalCost.toFixed(2)}`;
          
          console.log(`${zipStr} ${city} ${distStr} ${zoneStr} ${baseStr} ${surStr} ${mileStr} ${totalStr}`);
        }
        break;
      }
    }
  }
  
  console.log('─'.repeat(110));
  console.log('\n💡 New Formula: Total = Base ($23.50) + Zone Cost + Surcharge ($10.00) + Distance × $0.25');
  console.log('\n📊 Cost Components:');
  console.log('   • Base Cost: $23.50 (fixed)');
  console.log('   • Zone Cost: $0.00 - $19.25+ (distance-based)');
  console.log('   • Surcharge: $10.00 (fixed for all shipments)');
  console.log('   • Per Mile: $0.25 × distance in miles');
  console.log('\n🚀 Examples of Per-Mile Impact:');
  console.log('   • 100 miles: +$25.00 per-mile charge');
  console.log('   • 500 miles: +$125.00 per-mile charge');
  console.log('   • 1000 miles: +$250.00 per-mile charge');
  console.log('   • 2000 miles: +$500.00 per-mile charge');
  console.log('   • 3000 miles: +$750.00 per-mile charge');
}

testPerMileCharges();