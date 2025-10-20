import { NextRequest, NextResponse } from 'next/server';
import { calculateShippingCost, validateUSShipping } from '@/lib/shippingCalculator';




export async function POST(request: NextRequest) {
  try {
    const { 
      destinationZip, 
      destinationCountry 
    }: { destinationZip: string; destinationCountry: string } = await request.json();

    // Log the incoming request for debugging
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

    // Validate that shipping is only for US
    if (!validateUSShipping(destinationCountry)) {
      return NextResponse.json(
        { error: 'Shipping is currently only available within the United States' },
        { status: 400 }
      );
    }

    // Calculate shipping cost using the mathematical formula
    const result = calculateShippingCost(destinationZip);

    console.log('Calculated shipping cost:', result);

    return NextResponse.json({
      shippingCost: result.totalCost,
      breakdown: result.breakdown,
      distance: result.distance,
      zone: result.zone,
      city: result.city,
      state: result.state,
      currency: 'USD',
      estimatedDelivery: '3-5 business days',
      pipelineSteps: result.pipelineSteps,
      algorithm: {
        type: 'Complex Pipeline System',
        description: 'Multi-factor shipping calculation with linear distance effects',
        factors: [
          'Base Costs (Carrier + Handling + Packaging)',
          'Distance Costs (Linear with multiplier effects)',
          'Weight Costs (Standard 1lb package)',
          'Geographic Costs (Urban/Rural surcharges)',
          'Service Costs (Standard service fees)',
          'Operational Costs (Fuel + Overhead)',
          'Seasonal Adjustments (Peak/Off-season multipliers)'
        ]
      }
    });
  } catch (error) {
    console.error('Error calculating shipping:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to calculate shipping cost' },
      { status: 500 }
    );
  }
}