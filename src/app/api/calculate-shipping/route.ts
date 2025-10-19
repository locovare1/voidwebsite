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
      baseCost: result.baseCost,
      zoneCost: result.zoneCost,
      surcharge: result.surcharge,
      perMileCharge: result.perMileCharge,
      distanceCharge: result.distanceCharge,
      distance: result.distance,
      zone: result.zone,
      city: result.city,
      state: result.state,
      currency: 'USD',
      estimatedDelivery: '3-5 business days',
      formula: {
        description: 'CTotal = $27.00 + CZone + $10 surcharge + ($0.15 × miles) + ($2 per 3 miles)',
        baseCost: result.baseCost,
        zoneCost: result.zoneCost,
        surcharge: result.surcharge,
        perMileCharge: result.perMileCharge,
        distanceCharge: result.distanceCharge,
        distance: result.distance,
        total: result.totalCost
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