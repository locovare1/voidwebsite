export interface ShippingResult {
  totalCost: number;
  breakdown: {
    base: number;
    distance: number;
    weight: number;
    fuelSurcharge: number;
    operational: number;
    geographic: number;
    seasonal: number;
  };
  distance: number;
  city: string;
  state: string;
  calculationDetails: string;
}

export function validateUSShipping(country: string): boolean {
  return country.toUpperCase() === 'US';
}

export function calculateShippingCost(zipCode: string): ShippingResult {
  // Simplified shipping calculation
  const baseCost = 10.00;
  const distanceCost = 5.00;
  const weightCost = 3.00;
  const fuelSurcharge = distanceCost * 0.18;
  const operationalCost = 2.50;
  const geographicAdjustment = 1.00;
  const seasonalAdjustment = 1.00;
  
  const totalCost = baseCost + distanceCost + weightCost + fuelSurcharge + 
                    operationalCost + geographicAdjustment + seasonalAdjustment;

  return {
    totalCost: Math.round(totalCost * 100) / 100,
    breakdown: {
      base: baseCost,
      distance: distanceCost,
      weight: weightCost,
      fuelSurcharge: Math.round(fuelSurcharge * 100) / 100,
      operational: operationalCost,
      geographic: geographicAdjustment,
      seasonal: seasonalAdjustment,
    },
    distance: 100, // miles
    city: 'Unknown',
    state: 'Unknown',
    calculationDetails: 'Simplified calculation'
  };
}

