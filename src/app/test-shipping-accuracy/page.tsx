"use client";

import { useState, useEffect } from 'react';

// Copy of the enhanced distance calculation function for testing
const calculateDistanceFactor = (
  originZip: string, 
  destinationZip: string, 
  originCountry: string, 
  destinationCountry: string
): number => {
  // For international shipments, calculate based on continent distance with enhanced accuracy
  const isInternational = originCountry !== destinationCountry;
  
  // If it's an international shipment, use continent-based distance calculation
  if (isInternational) {
    // Enhanced approach: assign distance factors based on continent groups with more granular values
    const continentGroups: Record<string, number[]> = {
      // North America (0-10 range)
      'NA': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      // Europe (15-25 range)
      'EU': [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
      // Asia (30-40 range)
      'AS': [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
      // Africa (45-55 range)
      'AF': [45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55],
      // South America (60-70 range)
      'SA': [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70],
      // Oceania (75-85 range)
      'OC': [75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85]
    };
    
    // Assign countries to continent groups with more accurate mappings
    const countryToContinent: Record<string, string> = {
      // North America
      'US': 'NA', 'CA': 'NA', 'MX': 'NA', 'GT': 'NA', 'BZ': 'NA', 'SV': 'NA', 'HN': 'NA', 'NI': 'NA', 'CR': 'NA', 'PA': 'NA',
      // Europe
      'GB': 'EU', 'DE': 'EU', 'FR': 'EU', 'IT': 'EU', 'ES': 'EU', 'NL': 'EU', 'SE': 'EU', 'CH': 'EU', 'AT': 'EU', 'BE': 'EU', 
      'DK': 'EU', 'FI': 'EU', 'NO': 'EU', 'IE': 'EU', 'PT': 'EU', 'GR': 'EU', 'CZ': 'EU', 'HU': 'EU', 'PL': 'EU', 'RO': 'EU',
      'BG': 'EU', 'HR': 'EU', 'SK': 'EU', 'SI': 'EU', 'EE': 'EU', 'LV': 'EU', 'LT': 'EU', 'LU': 'EU', 'MT': 'EU', 'CY': 'EU',
      // Asia
      'SA': 'AS', 'JP': 'AS', 'CN': 'AS', 'IN': 'AS', 'KR': 'AS', 'AE': 'AS', 'SG': 'AS', 'MY': 'AS', 'TH': 'AS', 'IL': 'AS', 
      'ID': 'AS', 'PH': 'AS', 'VN': 'AS', 'BD': 'AS', 'PK': 'AS', 'TW': 'AS', 'HK': 'AS', 'LK': 'AS', 'NP': 'AS', 'KH': 'AS',
      'LA': 'AS', 'MM': 'AS', 'BN': 'AS', 'MV': 'AS', 'JO': 'AS', 'LB': 'AS', 'KW': 'AS', 'QA': 'AS', 'BH': 'AS', 'OM': 'AS',
      // Africa
      'EG': 'AF', 'ZA': 'AF', 'NG': 'AF', 'KE': 'AF', 'MA': 'AF', 'ET': 'AF', 'GH': 'AF', 'TZ': 'AF', 'UG': 'AF', 'DZ': 'AF',
      'SD': 'AF', 'AO': 'AF', 'CM': 'AF', 'MZ': 'AF', 'MG': 'AF', 'CI': 'AF', 'BJ': 'AF', 'ZW': 'AF', 'ZM': 'AF', 'SN': 'AF',
      // South America
      'BR': 'SA', 'AR': 'SA', 'CL': 'SA', 'CO': 'SA', 'PE': 'SA', 'VE': 'SA', 'EC': 'SA', 'BO': 'SA', 'PY': 'SA', 'UY': 'SA',
      'GY': 'SA', 'SR': 'SA', 'GF': 'SA',
      // Oceania
      'AU': 'OC', 'NZ': 'OC', 'FJ': 'OC', 'PG': 'OC', 'NC': 'OC', 'SB': 'OC', 'VU': 'OC', 'WS': 'OC', 'TO': 'OC', 'TV': 'OC'
    };
    
    const originContinent = countryToContinent[originCountry] || 'NA';
    const destinationContinent = countryToContinent[destinationCountry] || 'NA';
    
    // Calculate distance based on continent groups
    const originGroup = continentGroups[originContinent] || [0];
    const destinationGroup = continentGroups[destinationContinent] || [0];
    
    // Use the middle value in each group to calculate distance
    const originValue = originGroup[Math.floor(originGroup.length / 2)];
    const destinationValue = destinationGroup[Math.floor(destinationGroup.length / 2)];
    
    // Calculate distance with a more realistic scale
    const distance = Math.abs(originValue - destinationValue);
    
    // Convert distance to cost with enhanced accuracy
    // Scale factor: $0.85 per distance unit, with minimum of $12 and maximum of $150
    return Math.min(150, Math.max(12, distance * 0.85));
  }
  
  // For domestic shipments (US only), calculate based on ZIP code difference with enhanced accuracy
  if (originCountry === 'US' && destinationCountry === 'US') {
    // Extract numeric parts of ZIP codes
    const originNumeric = parseInt(originZip.replace(/\D/g, ''), 10) || 0;
    const destinationNumeric = parseInt(destinationZip.replace(/\D/g, ''), 10) || 0;
    
    // Calculate absolute difference
    const zipDifference = Math.abs(originNumeric - destinationNumeric);
    
    // Convert difference to cost with enhanced accuracy
    // Scale factor: $0.0002 per ZIP code unit difference, with minimum of $5 and maximum of $75
    // This provides a more realistic range for US shipping costs
    return Math.min(75, Math.max(5, zipDifference * 0.0002));
  }
  
  // For other domestic shipments, use a default calculation based on postal code similarity
  // Extract alphanumeric characters and take the first 4 characters for better comparison
  const originCode = originZip.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
  const destinationCode = destinationZip.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
  
  // If either code is empty, return a default distance factor
  if (!originCode || !destinationCode) {
    return 10.00;
  }
  
  // Calculate a more accurate "distance" based on character differences
  let difference = 0;
  const maxLength = Math.max(originCode.length, destinationCode.length);
  
  for (let i = 0; i < maxLength; i++) {
    const originChar = i < originCode.length ? originCode.charCodeAt(i) : 0;
    const destChar = i < destinationCode.length ? destinationCode.charCodeAt(i) : 0;
    // Weight the difference more heavily for position (first characters matter more)
    const positionWeight = Math.max(1, 5 - i); // First char has weight 5, second 4, etc.
    difference += Math.abs(originChar - destChar) * positionWeight;
  }
  
  // Normalize the difference to a cost factor with enhanced accuracy
  // Scale factor: 0.05 per weighted character difference, with minimum of $5 and maximum of $100
  const normalizedDifference = difference * 0.05;
  return Math.min(100, Math.max(5, normalizedDifference));
};

export default function TestShippingAccuracy() {
  const [testResults, setTestResults] = useState<any[]>([]);
  
  const runTests = () => {
    const tests = [
      {
        name: "US to Saudi Arabia (11549 to 12345)",
        originZip: "11549",
        destinationZip: "12345",
        originCountry: "US",
        destinationCountry: "SA",
        weight: 1,
        expected: "International shipping"
      },
      {
        name: "US to US (same ZIP)",
        originZip: "11549",
        destinationZip: "11549",
        originCountry: "US",
        destinationCountry: "US",
        weight: 1,
        expected: "Domestic shipping - same ZIP"
      },
      {
        name: "US to US (different ZIP)",
        originZip: "11549",
        destinationZip: "90210",
        originCountry: "US",
        destinationCountry: "US",
        weight: 2,
        expected: "Domestic shipping - different ZIP"
      },
      {
        name: "US to Canada",
        originZip: "11549",
        destinationZip: "M5V 3L9",
        originCountry: "US",
        destinationCountry: "CA",
        weight: 3,
        expected: "International shipping"
      },
      {
        name: "US to UK",
        originZip: "11549",
        destinationZip: "SW1A 1AA",
        originCountry: "US",
        destinationCountry: "GB",
        weight: 1.5,
        expected: "International shipping"
      },
      {
        name: "US to India",
        originZip: "11549",
        destinationZip: "110001",
        originCountry: "US",
        destinationCountry: "IN",
        weight: 2,
        expected: "International shipping"
      }
    ];
    
    const results = tests.map(test => {
      const distanceFactor = calculateDistanceFactor(
        test.originZip,
        test.destinationZip,
        test.originCountry,
        test.destinationCountry
      );
      
      const weightFactor = test.weight * 0.75; // $0.75 per pound
      const baseRate = 8.50; // Base handling fee
      const totalCost = baseRate + weightFactor + distanceFactor;
      const finalCost = Math.max(3.00, totalCost); // Minimum cost
      
      return {
        ...test,
        distanceFactor: distanceFactor.toFixed(2),
        weightFactor: weightFactor.toFixed(2),
        baseRate: baseRate.toFixed(2),
        totalCost: finalCost.toFixed(2)
      };
    });
    
    setTestResults(results);
  };
  
  useEffect(() => {
    runTests();
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Enhanced Shipping Calculation Accuracy Test</h1>
        
        <div className="mb-8">
          <button
            onClick={runTests}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
          >
            Run Enhanced Shipping Calculation Tests
          </button>
        </div>
        
        {testResults.length > 0 && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-700">
                  <th className="py-3 px-4 text-left">Test Case</th>
                  <th className="py-3 px-4 text-left">Origin ZIP</th>
                  <th className="py-3 px-4 text-left">Dest ZIP</th>
                  <th className="py-3 px-4 text-left">Weight (lbs)</th>
                  <th className="py-3 px-4 text-left">Distance Factor</th>
                  <th className="py-3 px-4 text-left">Weight Factor</th>
                  <th className="py-3 px-4 text-left">Base Rate</th>
                  <th className="py-3 px-4 text-left">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {testResults.map((result, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'}>
                    <td className="py-3 px-4">{result.name}</td>
                    <td className="py-3 px-4">{result.originZip}</td>
                    <td className="py-3 px-4">{result.destinationZip}</td>
                    <td className="py-3 px-4">{result.weight}</td>
                    <td className="py-3 px-4">${result.distanceFactor}</td>
                    <td className="py-3 px-4">${result.weightFactor}</td>
                    <td className="py-3 px-4">${result.baseRate}</td>
                    <td className="py-3 px-4 font-bold text-green-400">${result.totalCost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="mt-8 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Enhanced Calculation Formula</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Distance Factor:</strong> Calculated based on continent groups or ZIP code differences with enhanced accuracy</li>
            <li><strong>Weight Factor:</strong> $0.75 per pound (increased for better accuracy)</li>
            <li><strong>Base Rate:</strong> $8.50 handling fee (adjusted for better accuracy)</li>
            <li><strong>Total Cost:</strong> Base Rate + Weight Factor + Distance Factor</li>
            <li><strong>Minimum Cost:</strong> $3.00 (increased for better accuracy)</li>
            <li><strong>Origin ZIP:</strong> 11549 (New York)</li>
          </ul>
        </div>
        
        <div className="mt-8 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Enhanced Accuracy Features</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Continent-based distance calculation:</strong> More granular continent groupings with realistic distance values</li>
            <li><strong>Position-weighted postal code comparison:</strong> First characters in postal codes have higher weight in distance calculation</li>
            <li><strong>Realistic cost ranges:</strong> International shipping $12-150, US domestic $5-75, other countries $5-100</li>
            <li><strong>Improved weight factor:</strong> $0.75 per pound for more accurate pricing</li>
            <li><strong>Better base rate:</strong> $8.50 handling fee for more realistic costs</li>
          </ul>
        </div>
      </div>
    </div>
  );
}