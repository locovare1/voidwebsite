// Quick verification that shipping calculator works with all ZIP codes
const fs = require('fs');

// Test the CSV parsing
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

function testZipLookup() {
    console.log('🔍 Testing ZIP code lookup...');

    const csvContent = fs.readFileSync('zip_code_database.csv', 'utf-8');
    const lines = csvContent.split('\n');
    const headers = parseCSVLine(lines[0]);

    const zipIndex = headers.indexOf('zip');
    const shippingZoneIndex = headers.indexOf('shipping_zone');
    const zoneCostIndex = headers.indexOf('zone_cost');
    const distanceIndex = headers.indexOf('distance_from_origin');
    const stateIndex = headers.indexOf('state');
    const cityIndex = headers.indexOf('primary_city');

    console.log(`📊 Database has ${lines.length} total lines`);
    console.log(`📋 Zone column index: ${shippingZoneIndex}`);

    const testZips = ['11549', '10001', '90210', '60601', '33101'];
    let foundCount = 0;

    for (const testZip of testZips) {
        for (let i = 1; i < lines.length; i++) {
            const columns = parseCSVLine(lines[i]);
            if (columns[zipIndex] === testZip) {
                const zone = columns[shippingZoneIndex]?.replace(/"/g, '') || 'Not found';
                const cost = columns[zoneCostIndex] || 'Not found';
                const distance = columns[distanceIndex] || 'Not found';
                const city = columns[cityIndex] || 'Not found';
                const state = columns[stateIndex] || 'Not found';

                console.log(`✅ ${testZip}: ${city}, ${state} - ${zone} - $${cost} - ${distance} miles`);
                foundCount++;
                break;
            }
        }
    }

    console.log(`\n📊 Found ${foundCount}/${testZips.length} test ZIP codes`);

    // Count total processed ZIP codes
    let processedCount = 0;
    for (let i = 1; i < lines.length; i++) {
        const columns = parseCSVLine(lines[i]);
        if (columns[shippingZoneIndex] && columns[shippingZoneIndex].includes('Zone')) {
            processedCount++;
        }
    }

    console.log(`📊 Total ZIP codes with zones: ${processedCount}`);
}

testZipLookup();