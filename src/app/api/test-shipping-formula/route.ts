import { NextRequest, NextResponse } from 'next/server';
import { calculateShippingCost, getShippingZones } from '@/lib/shippingCalculator';

export async function GET() {
  try {
    // Test with various ZIP codes to verify the formula
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

    const results = [];
    
    for (const zip of testZips) {
      try {
        const result = await calculateShippingCost(zip);
        results.push({
          zip,
          ...result
        });
      } catch (error) {
        results.push({
          zip,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Get zone information
    const zones = getShippingZones();

    return NextResponse.json({
      formula: {
        description: 'CTotal = 23.50 + CZone(Destination ZIP)',
        fixedInputs: {
          packageBillableWeight: '1.0 lb',
          carrierBaseCost: '$8.50',
          fixedOverhead: '$15.00 (Packaging + Handling)',
          originZip: '11549 (New York)'
        },
        baseCost: 23.50
      },
      testResults: results,
      shippingZones: zones,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to run shipping formula test' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { zip }: { zip: string } = await request.json();
    
    if (!zip) {
      return NextResponse.json(
        { error: 'ZIP code is required' },
        { status: 400 }
      );
    }

    const result = await calculateShippingCost(zip);
    
    return NextResponse.json({
      zip,
      ...result,
      formula: {
        description: 'CTotal = 23.50 + CZone(Destination ZIP)',
        calculation: `$${result.baseCost} + $${result.zoneCost} = $${result.totalCost}`
      }
    });
  } catch (error) {
    console.error('Error calculating shipping for ZIP:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to calculate shipping cost' },
      { status: 500 }
    );
  }
}