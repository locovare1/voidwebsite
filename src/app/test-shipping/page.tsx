"use client";

import { useState } from 'react';
import { countries } from '@/lib/countries';

export default function TestShippingPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('SA');

  const testShipping = async (countryCode: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/calculate-shipping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originAddress: '123 Main St',
          originCity: 'New York',
          originState: 'NY',
          originZip: '10001',
          originCountry: 'US',
          destinationAddress: 'Test Address',
          destinationCity: 'Test City',
          destinationState: 'Test State',
          destinationZip: '12345',
          destinationCountry: countryCode,
          weight: 5
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      console.error('Error:', error);
      setResult({ error: error?.message || 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Shipping Calculation Test</h1>
        
        <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#2A2A2A] mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Test Different Countries</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-[#0F0F0F] border border-[#2A2A2A] text-white rounded-lg px-4 py-2"
            >
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => testShipping(selectedCountry)}
              disabled={loading}
              className="bg-[#FFFFFF] hover:bg-[#FFFFFF]/90 text-black font-bold py-2 px-4 rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Calculating...' : 'Test Selected Country'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#2A2A2A]">
            <h2 className="text-xl font-bold text-white mb-4">Test Saudi Arabia</h2>
            <button
              onClick={() => testShipping('SA')}
              disabled={loading}
              className="w-full bg-[#FFFFFF] hover:bg-[#FFFFFF]/90 text-black font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              Test Saudi Shipping
            </button>
          </div>
          
          <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#2A2A2A]">
            <h2 className="text-xl font-bold text-white mb-4">Test Germany</h2>
            <button
              onClick={() => testShipping('DE')}
              disabled={loading}
              className="w-full bg-[#FFFFFF] hover:bg-[#FFFFFF]/90 text-black font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              Test Germany Shipping
            </button>
          </div>
          
          <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#2A2A2A]">
            <h2 className="text-xl font-bold text-white mb-4">Test Domestic (US)</h2>
            <button
              onClick={() => testShipping('US')}
              disabled={loading}
              className="w-full bg-[#FFFFFF] hover:bg-[#FFFFFF]/90 text-black font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              Test Domestic Shipping
            </button>
          </div>
        </div>
        
        {result && (
          <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#2A2A2A]">
            <h2 className="text-xl font-bold text-white mb-4">Result</h2>
            <pre className="text-gray-300 whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}