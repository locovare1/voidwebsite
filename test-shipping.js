// Simple test script to verify shipping calculations
const testZips = [
  '10001', // NYC - should be Zone 1 (local)
  '19101', // Philadelphia - should be Zone 2 
  '20001', // Washington DC - should be Zone 2
  '33101', // Miami - should be Zone 4
  '60601', // Chicago - should be Zone 4
  '75201', // Dallas - should be Zone 5
  '80201', // Denver - should be Zone 5
  '90210', // Los Angeles - should be Zone 8
  '98101', // Seattle - should be Zone 7
  '11549'  // Origin ZIP - should be Zone 1 (0 distance)
];

async function testShippingCalculation() {
  console.log('Testing shipping calculation API...\n');
  
  for (const zip of testZips) {
    try {
      const response = await fetch('http://localhost:3000/api/test-shipping-formula', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ zip }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`ZIP ${zip}:`);
        console.log(`  Distance: ${data.distance} miles`);
        console.log(`  Zone: ${data.zone}`);
        console.log(`  Zone Cost: $${data.zoneCost}`);
        console.log(`  Total Cost: $${data.totalCost} (Formula: $23.50 + $${data.zoneCost})`);
        console.log('');
      } else {
        console.log(`Error for ZIP ${zip}: ${response.status}`);
      }
    } catch (error) {
      console.log(`Error testing ZIP ${zip}:`, error.message);
    }
  }
}

// Run the test if this script is executed directly
if (typeof window === 'undefined') {
  testShippingCalculation();
}