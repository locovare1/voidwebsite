// Test the $10 surcharge on all shipping costs
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

function testSurcharge() {
    console.log('💰 Testing $10 Surcharge on All Shipping Costs\n');

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

    console.log('📍 Shipping Cost Examples with $10 Surcharge:');
    console.log('─'.repeat(90));
    console.log('ZIP     City              Distance    Zone Cost   Base Cost   Surcharge   Total Cost');
    console.log('─'.repeat(90));

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
                    const totalCost = baseCost + zoneCost + surcharge;

                    const zipStr = zip.padEnd(7);
                    const distStr = `${distance} mi`.padEnd(10);
                    const zoneStr = `$${zoneCost.toFixed(2)}`.padEnd(10);
                    const baseStr = `$${baseCost.toFixed(2)}`.padEnd(10);
                    const surStr = `$${surcharge.toFixed(2)}`.padEnd(10);
                    const totalStr = `$${totalCost.toFixed(2)}`;

                    console.log(`${zipStr} ${city} ${distStr} ${zoneStr} ${baseStr} ${surStr} ${totalStr}`);
                }
                break;
            }
        }
    }

    console.log('─'.repeat(90));
    console.log('\n💡 Formula: Total Cost = Base Cost ($23.50) + Zone Cost (varies) + Surcharge ($10.00)');
    console.log('\n📊 Cost Breakdown:');
    console.log('   • Base Cost: $23.50 (fixed)');
    console.log('   • Zone Cost: $0.00 - $19.25+ (distance-based)');
    console.log('   • Surcharge: $10.00 (fixed for all shipments)');
    console.log('   • Total Range: $33.50 - $52.75+');
}

testSurcharge();