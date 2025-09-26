import { NextRequest, NextResponse } from 'next/server';

interface ShippingRequest {
  originZip: string;
  originCountry: string;
  destinationZip: string;
  destinationCountry: string;
  weight: number; // in pounds
}

export async function POST(request: NextRequest) {
  try {
    const { originZip, originCountry, destinationZip, destinationCountry, weight }: ShippingRequest = await request.json();

    // Validate required fields
    if (!originZip || !originCountry || !destinationZip || !destinationCountry || weight === undefined) {
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

    // Calculate shipping cost
    // In a real implementation, this would call the UPS API
    const shippingCost = calculateShippingCost(originZip, originCountry, destinationZip, destinationCountry, weight);

    return NextResponse.json({
      shippingCost: parseFloat(shippingCost.toFixed(2)),
      currency: 'USD',
      estimatedDelivery: '3-5 business days'
    });
  } catch (error) {
    console.error('Error calculating shipping:', error);
    return NextResponse.json(
      { error: 'Failed to calculate shipping cost' },
      { status: 500 }
    );
  }
}

/**
 * Calculate shipping cost (mock implementation)
 * @param originZip - Origin ZIP code
 * @param originCountry - Origin country code
 * @param destinationZip - Destination ZIP code
 * @param destinationCountry - Destination country code
 * @param weight - Package weight in pounds
 * @returns Shipping cost in USD
 */
function calculateShippingCost(
  originZip: string,
  originCountry: string,
  destinationZip: string,
  destinationCountry: string,
  weight: number
): number {
  // For international shipments, apply a higher base rate
  const isInternational = originCountry !== destinationCountry;
  
  // Base rate
  const baseRate = isInternational ? 15.00 : 5.00;
  
  // Weight factor
  const weightFactor = weight * (isInternational ? 2.0 : 1.0);
  
  // Distance factor (simplified)
  const distanceFactor = calculateDistanceFactor(originZip, destinationZip, isInternational);
  
  // Calculate final cost
  const totalCost = baseRate + weightFactor + distanceFactor;
  
  // Ensure minimum shipping cost
  return Math.max(isInternational ? 10.00 : 5.00, totalCost);
}

/**
 * Calculate a distance factor based on ZIP codes (simplified)
 * @param originZip - Origin ZIP code
 * @param destinationZip - Destination ZIP code
 * @param isInternational - Whether the shipment is international
 * @returns Distance factor for shipping cost calculation
 */
function calculateDistanceFactor(originZip: string, destinationZip: string, isInternational: boolean): number {
  if (isInternational) {
    // For international shipments, return a fixed factor
    return 10.00;
  }
  
  // Extract the first 3 digits of each ZIP code for a rough comparison
  const originPrefix = parseInt(originZip.substring(0, 3)) || 0;
  const destinationPrefix = parseInt(destinationZip.substring(0, 3)) || 0;
  
  // Calculate a rough "distance" based on ZIP code differences
  const zipDifference = Math.abs(originPrefix - destinationPrefix);
  
  // Convert to a cost factor (simplified)
  return Math.min(20.00, zipDifference * 0.1);
}