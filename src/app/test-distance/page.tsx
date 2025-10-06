"use client";

import { useState } from 'react';

// Copy of the distance calculation function for testing
const calculateDistanceFactor = (
  originZip: string, 
  destinationZip: string, 
  originCountry: string, 
  destinationCountry: string
): number => {
  // For international shipments, calculate based on continent distance
  const isInternational = originCountry !== destinationCountry;
  
  // If it's an international shipment, use continent-based distance calculation
  if (isInternational) {
    // Simple approach: assign distance factors based on continent groups
    const continentGroups: Record<string, number[]> = {
      // North America
      'NA': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      // Europe
      'EU': [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
      // Asia
      'AS': [21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
      // Africa
      'AF': [31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
      // South America
      'SA': [41, 42, 43, 44, 45, 46, 47, 48, 49, 50],
      // Oceania
      'OC': [51, 52, 53, 54, 55, 56, 57, 58, 59, 60]
    };
    
    // Assign countries to continent groups (simplified)
    const countryToContinent: Record<string, string> = {
      'US': 'NA', 'CA': 'NA', 'MX': 'NA',
      'GB': 'EU', 'DE': 'EU', 'FR': 'EU', 'IT': 'EU', 'ES': 'EU', 'NL': 'EU', 'SE': 'EU', 'CH': 'EU', 'AT': 'EU', 'BE': 'EU', 'DK': 'EU', 'FI': 'EU', 'NO': 'EU', 'IE': 'EU', 'PT': 'EU', 'GR': 'EU', 'CZ': 'EU', 'HU': 'EU', 'PL': 'EU', 'RO': 'EU',
      'SA': 'AS', 'JP': 'AS', 'CN': 'AS', 'IN': 'AS', 'KR': 'AS', 'AE': 'AS', 'SG': 'AS', 'MY': 'AS', 'TH': 'AS', 'IL': 'AS', 'ID': 'AS', 'PH': 'AS', 'VN': 'AS', 'BD': 'AS', 'PK': 'AS', 'TW': 'AS', 'HK': 'AS',
      'EG': 'AF', 'ZA': 'AF', 'NG': 'AF', 'KE': 'AF', 'MA': 'AF',
      'BR': 'SA', 'AR': 'SA', 'CL': 'SA', 'CO': 'SA',
      'AU': 'OC', 'NZ': 'OC'
    };
    
    const originContinent = countryToContinent[originCountry] || 'NA';
    const destinationContinent = countryToContinent[destinationCountry] || 'NA';
    
    // Calculate distance based on continent groups
    const originGroup = continentGroups[originContinent] || [1];
    const destinationGroup = continentGroups[destinationContinent] || [1];
    
    // Use the first value in each group to calculate distance
    const distance = Math.abs(originGroup[0] - destinationGroup[0]);
    
    // Convert distance to cost (higher distance = higher cost)
    // Scale factor: 0.5 per group distance unit, with minimum of $5 and maximum of $50
    return Math.min(50, Math.max(5, distance * 0.5));
  }
  
  // For domestic shipments (US only), calculate based on ZIP code difference
  if (originCountry === 'US' && destinationCountry === 'US') {
    // Extract numeric parts of ZIP codes
    const originNumeric = parseInt(originZip.replace(/\D/g, ''), 10) || 0;
    const destinationNumeric = parseInt(destinationZip.replace(/\D/g, ''), 10) || 0;
    
    // Calculate absolute difference
    const zipDifference = Math.abs(originNumeric - destinationNumeric);
    
    // Convert difference to cost (higher difference = higher cost)
    // Scale factor: $1 per 10000 ZIP code units, with minimum of $2 and maximum of $20
    return Math.min(20, Math.max(2, zipDifference / 10000));
  }
  
  // For other domestic shipments, use a default calculation based on postal code similarity
  // Extract alphanumeric characters and take the first 3 characters for comparison
  const originCode = originZip.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
  const destinationCode = destinationZip.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
  
  // If either code is empty, return a default distance factor
  if (!originCode || !destinationCode) {
    return 5.00;
  }
  
  // Calculate a rough "distance" based on character differences
  let difference = 0;
  for (let i = 0; i < Math.min(originCode.length, destinationCode.length); i++) {
    // Compare ASCII values of characters
    difference += Math.abs(originCode.charCodeAt(i) - destinationCode.charCodeAt(i));
  }
  
  // Normalize the difference to a cost factor (simplified)
  // Scale factor: 0.1 per character difference, with minimum of $2 and maximum of $25
  const normalizedDifference = difference * 0.1;
  return Math.min(25.00, Math.max(2.00, normalizedDifference));
};

export default function TestDistance() {
  const [testResults, setTestResults] = useState<any[]>([]);
  
  const runTests = () => {
    const tests = [
      {
        name: "US to Saudi Arabia",
        originZip: "10001",
        destinationZip: "12345",
        originCountry: "US",
        destinationCountry: "SA",
        expected: "International shipping"
      },
      {
        name: "US to US (same ZIP)",
        originZip: "10001",
        destinationZip: "10001",
        originCountry: "US",
        destinationCountry: "US",
        expected: "Domestic shipping - same ZIP"
      },
      {
        name: "US to US (different ZIP)",
        originZip: "10001",
        destinationZip: "90210",
        originCountry: "US",
        destinationCountry: "US",
        expected: "Domestic shipping - different ZIP"
      },
      {
        name: "US to Canada",
        originZip: "10001",
        destinationZip: "M5V 3L9",
        originCountry: "US",
        destinationCountry: "CA",
        expected: "International shipping"
      },
      {
        name: "US to UK",
        originZip: "10001",
        destinationZip: "SW1A 1AA",
        originCountry: "US",
        destinationCountry: "GB",
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
      
      const weightFactor = 2 * 0.5; // 2 lbs at $0.50/lb
      const baseRate = 5.00;
      const totalCost = baseRate + weightFactor + distanceFactor;
      
      return {
        ...test,
        distanceFactor: distanceFactor.toFixed(2),
        weightFactor: weightFactor.toFixed(2),
        baseRate: baseRate.toFixed(2),
        totalCost: totalCost.toFixed(2)
      };
    });
    
    setTestResults(results);
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Distance Calculation Tests</h1>
        
        <div className="mb-8">
          <button
            onClick={runTests}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
          >
            Run Distance Calculation Tests
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
          <h2 className="text-xl font-semibold mb-4">How the Calculation Works</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Distance Factor:</strong> Calculated based on continent groups or ZIP code differences</li>
            <li><strong>Weight Factor:</strong> $0.50 per pound</li>
            <li><strong>Base Rate:</strong> $5.00 handling fee</li>
            <li><strong>Total Cost:</strong> Base Rate + Weight Factor + Distance Factor</li>
            <li><strong>Minimum Cost:</strong> $2.00</li>
          </ul>
        </div>
      </div>
    </div>
  );
}