import { NextRequest, NextResponse } from 'next/server';
import { calculateEasyShippingCost } from '@/lib/easyShipping';

export async function GET() {
  try {
    // Test the calculation function directly with enhanced accuracy
    const cost = await calculateEasyShippingCost(
      '123 Main St',
      'New York',
      'NY',
      '11549', // Updated to correct ZIP code
      'US',
      '456 King Fahd Road',
      'Riyadh',
      'Riyadh',
      '12345', // Saudi postal code
      'SA',
      2 // 2 pounds
    );

    return NextResponse.json({
      shippingCost: parseFloat(cost.toFixed(2)),
      test: 'successful',
      originZip: '11549',
      destinationZip: '12345',
      destinationCountry: 'SA',
      weight: 2
    });
  } catch (error) {
    console.error('Test calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate shipping cost', details: (error as Error).message },
      { status: 500 }
    );
  }
}