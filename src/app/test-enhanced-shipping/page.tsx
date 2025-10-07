"use client";

import { useState } from 'react';

export default function TestEnhancedShipping() {
  const [formData, setFormData] = useState({
    originAddress: '123 Main St',
    originCity: 'New York',
    originState: 'NY',
    originZip: '11549',
    originCountry: 'US',
    destinationAddress: '',
    destinationCity: '',
    destinationState: '',
    destinationZip: '',
    destinationCountry: 'SA', // Default to Saudi Arabia
    weight: 1
  });

  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateShipping = async () => {
    setIsCalculating(true);
    setError(null);
    setShippingCost(null);

    try {
      const response = await fetch('/api/calculate-shipping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setShippingCost(data.shippingCost);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to calculate shipping');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred while calculating shipping');
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Enhanced Shipping Cost Calculator</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Origin Information */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Origin (Business Location)</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <input
                  type="text"
                  name="originAddress"
                  value={formData.originAddress}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                  readOnly
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    name="originCity"
                    value={formData.originCity}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  <input
                    type="text"
                    name="originState"
                    value={formData.originState}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                    readOnly
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">ZIP Code</label>
                  <input
                    type="text"
                    name="originZip"
                    value={formData.originZip}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <input
                    type="text"
                    name="originCountry"
                    value={formData.originCountry}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Destination Information */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Destination (Customer)</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <input
                  type="text"
                  name="destinationAddress"
                  value={formData.destinationAddress}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                  placeholder="Enter address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    name="destinationCity"
                    value={formData.destinationCity}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  <input
                    type="text"
                    name="destinationState"
                    value={formData.destinationState}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                    placeholder="Enter state"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">ZIP/Postal Code</label>
                  <input
                    type="text"
                    name="destinationZip"
                    value={formData.destinationZip}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                    placeholder="Enter ZIP/Postal code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <select
                    name="destinationCountry"
                    value={formData.destinationCountry}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                  >
                    <option value="US">United States</option>
                    <option value="SA">Saudi Arabia</option>
                    <option value="GB">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="JP">Japan</option>
                    <option value="CN">China</option>
                    <option value="IN">India</option>
                    <option value="BR">Brazil</option>
                    <option value="MX">Mexico</option>
                    <option value="KR">South Korea</option>
                    <option value="IT">Italy</option>
                    <option value="ES">Spain</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Weight (lbs)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  min="0.1"
                  step="0.1"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={calculateShipping}
            disabled={isCalculating}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50"
          >
            {isCalculating ? 'Calculating...' : 'Calculate Shipping Cost'}
          </button>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-900 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Error</h3>
            <p>{error}</p>
          </div>
        )}

        {shippingCost !== null && (
          <div className="mt-6 p-6 bg-green-900 rounded-lg text-center">
            <h3 className="text-2xl font-bold mb-2">Shipping Cost Calculated</h3>
            <p className="text-3xl font-bold text-green-300">${shippingCost.toFixed(2)}</p>
            <p className="mt-2 text-gray-300">
              For a {formData.weight}lb package from {formData.originCity}, {formData.originCountry} 
              to {formData.destinationCountry} ({formData.destinationZip})
            </p>
          </div>
        )}

        <div className="mt-8 bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Test Cases</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  destinationZip: '110001',
                  destinationCountry: 'IN',
                  weight: 2
                }));
              }}
              className="bg-purple-600 hover:bg-purple-700 py-2 px-4 rounded"
            >
              India Test
            </button>
            <button
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  destinationZip: '12345',
                  destinationCountry: 'SA',
                  weight: 1
                }));
              }}
              className="bg-purple-600 hover:bg-purple-700 py-2 px-4 rounded"
            >
              Saudi Arabia Test
            </button>
            <button
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  destinationZip: 'M5V 3L9',
                  destinationCountry: 'CA',
                  weight: 3
                }));
              }}
              className="bg-purple-600 hover:bg-purple-700 py-2 px-4 rounded"
            >
              Canada Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}