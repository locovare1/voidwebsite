import { NextRequest, NextResponse } from 'next/server';
import { calculateShippingCost, validateUSShipping } from '@/lib/shippingCalculator';

export async function POST(request: NextRequest) {
  try {
    const { 
      destinationZip, 
      destinationCountry 
    }: { destinationZip: string; destinationCountry: string } = await request.json();

    console.log('Shipping calculation request:', {
      destinationZip,
      destinationCountry
    });

    // Validate required fields
    if (!destinationZip || !destinationCountry) {
      return NextResponse.json(
        { error: 'Missing required fields: destinationZip and destinationCountry' },
        { status: 400 }
      );
    }

    // Validate US only
    if (!validateUSShipping(destinationCountry)) {
      return NextResponse.json(
        { error: 'Shipping is currently only available within the United States' },
        { status: 400 }
      );
    }

    // Calculate shipping with real-time sophisticated algorithm
    const result = calculateShippingCost(destinationZip);

    console.log('Calculated shipping cost:', result.totalCost);

    return NextResponse.json({
      success: true,
      shippingCost: result.totalCost,
      breakdown: result.breakdown,
      distance: result.distance,
      city: result.city,
      state: result.state,
      currency: 'USD',
      estimatedDelivery: '3-5 business days',
      calculationDetails: result.calculationDetails,
      algorithm: {
        type: 'Real-Time Sophisticated Multi-Factor',
        description: 'Dense algorithm with linear distance effects and multiple cost factors',
        factors: [
          'Base Costs (Carrier, Handling, Packaging, Insurance)',
          'Distance Costs (Tiered linear rates)',
          'Weight Costs (Standard 1lb package)',
          'Fuel Surcharge (18% of distance costs)',
          'Operational Costs (Processing + Facility fees)',
          'Geographic Adjustment (Urban/Rural multipliers)',
          'Seasonal Adjustment (Peak/Off-peak pricing)'
        ]
      }
    });
  } catch (error) {
    console.error('Error calculating shipping:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate shipping cost' 
      },
      { status: 500 }
    );
  }
}
