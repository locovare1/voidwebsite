import { NextRequest, NextResponse } from 'next/server';
import { getEasyAPIKey, calculateEasyShippingCost } from '@/lib/easyShipping';
import { countries, getCountryByCode } from '@/lib/countries';

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

    // Log the incoming request for debugging
    console.log('Shipping calculation request:', {
      origin: { originAddress, originCity, originState, originZip, originCountry },
      destination: { destinationAddress, destinationCity, destinationState, destinationZip, destinationCountry },
      weight
    });

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

    // Validate countries
    const originCountryInfo = getCountryByCode(originCountry);
    const destinationCountryInfo = getCountryByCode(destinationCountry);
    
    if (!originCountryInfo) {
      return NextResponse.json(
        { error: `Invalid origin country code: ${originCountry}` },
        { status: 400 }
      );
    }
    
    if (!destinationCountryInfo) {
      return NextResponse.json(
        { error: `Invalid destination country code: ${destinationCountry}` },
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

    console.log('Calculated shipping cost:', shippingCost);

    return NextResponse.json({
      shippingCost: parseFloat(shippingCost.toFixed(2)),
      currency: destinationCountryInfo.currency || 'USD',
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