'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Country {
  code: string;
  name: string;
  flag: string;
}

const countries: Country[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴' },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬' },
  { code: 'RS', name: 'Serbia', flag: '🇷🇸' },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿' },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦' },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭' },
  { code: 'OM', name: 'Oman', flag: '🇴🇲' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱' },
  { code: 'IR', name: 'Iran', flag: '🇮🇷' },
  { code: 'IQ', name: 'Iraq', flag: '🇮🇶' },
  { code: 'SY', name: 'Syria', flag: '🇸🇾' },
  { code: 'LB', name: 'Lebanon', flag: '🇱🇧' },
  { code: 'JO', name: 'Jordan', flag: '🇯🇴' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
];

interface CountrySelectorProps {
  onCountryChange: (countryCode: string) => void;
  initialCountry?: string;
}

export default function CountrySelector({ onCountryChange, initialCountry }: CountrySelectorProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>(initialCountry || 'US');
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(!initialCountry);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (initialCountry) {
      setSelectedCountry(initialCountry);
      setShowWelcome(false);
    }
  }, [initialCountry]);

  const handleCountrySelect = (countryCode: string) => {
    setSelectedCountry(countryCode);
    onCountryChange(countryCode);
    setIsOpen(false);
    setShowWelcome(false);
  };

  const selectedCountryData = countries.find(c => c.code === selectedCountry);

  // Filter countries based on search term
  const filteredCountries = countries.filter(country => 
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {showWelcome ? 'Welcome! 🌍' : 'Select Your Country 🌍'}
          </h2>
          <p className="text-gray-600 mb-4">
            {showWelcome 
              ? 'Please choose your country of residence for the best results on our prices as they vary by country and region.'
              : 'Choose your country to see region-specific pricing and discounts.'
            }
          </p>
          {selectedCountryData && (
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
              <span className="text-2xl">{selectedCountryData.flag}</span>
              <span className="font-medium">{selectedCountryData.name}</span>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredCountries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No countries found matching "{searchTerm}"
            </div>
          ) : (
            filteredCountries.map((country) => (
              <button
                key={country.code}
                onClick={() => handleCountrySelect(country.code)}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                  selectedCountry === country.code
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                <span className="text-2xl">{country.flag}</span>
                <div className="flex-1">
                  <div className="font-medium">{country.name}</div>
                  <div className="text-sm opacity-75">{country.code}</div>
                </div>
                {selectedCountry === country.code && (
                  <div className="text-blue-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414 1.414L8 12.586l7.293-7.293a1 1 0 011.414 1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))
          )}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => handleCountrySelect(selectedCountry)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
