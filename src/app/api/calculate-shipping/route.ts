import { NextRequest, NextResponse } from 'next/server';
import { getEasyAPIKey, calculateEasyShippingCost } from '@/lib/easyShipping';

interface ShippingRequest {
  originAddress: string;
  originCity: string;
  originState: string;
  originZip: string;
  originCountry: string;
  destinationAddress: string;
  destinationCity: string;
  destinationState: string;
  destinationZip: string;
  destinationCountry: string;
  weight: number; // in pounds
}

export async function POST(request: NextRequest) {
  try {
    const { 
      originAddress,
      originCity,
      originState,
      originZip, 
      originCountry,
      destinationAddress,
      destinationCity,
      destinationState,
      destinationZip, 
      destinationCountry, 
      weight 
    }: ShippingRequest = await request.json();

    // Validate required fields
    if (!originAddress || !originCity || !originState || !originZip || !originCountry || 
        !destinationAddress || !destinationCity || !destinationState || !destinationZip || !destinationCountry || 
        weight === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate weight
    if (weight <= 0) {
      return NextResponse.json(
        { error: 'Weight must be greater than 0' },
        { status: 400 }
      );
    }

    // Get API key
    const apiKey = getEasyAPIKey();
    console.log('Using The Easy API key:', apiKey);

    // Calculate shipping cost using the real API
    const shippingCost = await calculateEasyShippingCost(
      originAddress,
      originCity,
      originState,
      originZip, 
      originCountry,
      destinationAddress,
      destinationCity,
      destinationState,
      destinationZip, 
      destinationCountry, 
      weight
    );

    return NextResponse.json({
      shippingCost: parseFloat(shippingCost.toFixed(2)),
      currency: 'USD',
      estimatedDelivery: '3-5 business days',
      apiKey: apiKey // Include API key in response for debugging
    });
  } catch (error) {
    console.error('Error calculating shipping:', error);
    return NextResponse.json(
      { error: 'Failed to calculate shipping cost' },
      { status: 500 }
    );
  }
}