// List of countries with their ISO codes for shipping calculations
export interface Country {
  name: string;
  code: string;
  currency: string;
  postalCodeFormat?: string;
}

export const countries: Country[] = [
  { name: 'United States', code: 'US', currency: 'USD', postalCodeFormat: '12345 or 12345-6789' },
  { name: 'Saudi Arabia', code: 'SA', currency: 'SAR', postalCodeFormat: '12345' },
  { name: 'United Kingdom', code: 'GB', currency: 'GBP', postalCodeFormat: 'AB12 3CD' },
  { name: 'Canada', code: 'CA', currency: 'CAD', postalCodeFormat: 'A1A 1A1' },
  { name: 'Australia', code: 'AU', currency: 'AUD', postalCodeFormat: '1234' },
  { name: 'Germany', code: 'DE', currency: 'EUR', postalCodeFormat: '12345' },
  { name: 'France', code: 'FR', currency: 'EUR', postalCodeFormat: '12345' },
  { name: 'Japan', code: 'JP', currency: 'JPY', postalCodeFormat: '123-4567' },
  { name: 'China', code: 'CN', currency: 'CNY', postalCodeFormat: '123456' },
  { name: 'India', code: 'IN', currency: 'INR', postalCodeFormat: '123456' },
  { name: 'Brazil', code: 'BR', currency: 'BRL', postalCodeFormat: '12345-678' },
  { name: 'Mexico', code: 'MX', currency: 'MXN', postalCodeFormat: '12345' },
  { name: 'South Korea', code: 'KR', currency: 'KRW', postalCodeFormat: '12345' },
  { name: 'Italy', code: 'IT', currency: 'EUR', postalCodeFormat: '12345' },
  { name: 'Spain', code: 'ES', currency: 'EUR', postalCodeFormat: '12345' },
  { name: 'Netherlands', code: 'NL', currency: 'EUR', postalCodeFormat: '1234 AB' },
  { name: 'Sweden', code: 'SE', currency: 'SEK', postalCodeFormat: '123 45' },
  { name: 'Switzerland', code: 'CH', currency: 'CHF', postalCodeFormat: '1234' },
  { name: 'United Arab Emirates', code: 'AE', currency: 'AED', postalCodeFormat: '12345' },
  { name: 'Singapore', code: 'SG', currency: 'SGD', postalCodeFormat: '123456' },
  { name: 'Malaysia', code: 'MY', currency: 'MYR', postalCodeFormat: '12345' },
  { name: 'Thailand', code: 'TH', currency: 'THB', postalCodeFormat: '12345' },
  { name: 'Turkey', code: 'TR', currency: 'TRY', postalCodeFormat: '12345' },
  { name: 'South Africa', code: 'ZA', currency: 'ZAR', postalCodeFormat: '1234' },
  { name: 'Russia', code: 'RU', currency: 'RUB', postalCodeFormat: '123456' },
  { name: 'Poland', code: 'PL', currency: 'PLN', postalCodeFormat: '12-345' },
  { name: 'Argentina', code: 'AR', currency: 'ARS', postalCodeFormat: 'A1234ABC' },
  { name: 'Chile', code: 'CL', currency: 'CLP', postalCodeFormat: '1234567' },
  { name: 'Colombia', code: 'CO', currency: 'COP', postalCodeFormat: '123456' },
  { name: 'Egypt', code: 'EG', currency: 'EGP', postalCodeFormat: '12345' },
  { name: 'Nigeria', code: 'NG', currency: 'NGN', postalCodeFormat: '123456' },
  { name: 'Kenya', code: 'KE', currency: 'KES', postalCodeFormat: '12345' },
  { name: 'Morocco', code: 'MA', currency: 'MAD', postalCodeFormat: '12345' },
  { name: 'Israel', code: 'IL', currency: 'ILS', postalCodeFormat: '12345' },
  { name: 'Indonesia', code: 'ID', currency: 'IDR', postalCodeFormat: '12345' },
  { name: 'Philippines', code: 'PH', currency: 'PHP', postalCodeFormat: '1234' },
  { name: 'Vietnam', code: 'VN', currency: 'VND', postalCodeFormat: '123456' },
  { name: 'Bangladesh', code: 'BD', currency: 'BDT', postalCodeFormat: '1234' },
  { name: 'Pakistan', code: 'PK', currency: 'PKR', postalCodeFormat: '12345' },
  { name: 'Ukraine', code: 'UA', currency: 'UAH', postalCodeFormat: '12345' },
  { name: 'Portugal', code: 'PT', currency: 'EUR', postalCodeFormat: '1234-567' },
  { name: 'Greece', code: 'GR', currency: 'EUR', postalCodeFormat: '123 45' },
  { name: 'Czech Republic', code: 'CZ', currency: 'CZK', postalCodeFormat: '123 45' },
  { name: 'Hungary', code: 'HU', currency: 'HUF', postalCodeFormat: '1234' },
  { name: 'Romania', code: 'RO', currency: 'RON', postalCodeFormat: '123456' },
  { name: 'Austria', code: 'AT', currency: 'EUR', postalCodeFormat: '1234' },
  { name: 'Belgium', code: 'BE', currency: 'EUR', postalCodeFormat: '1234' },
  { name: 'Denmark', code: 'DK', currency: 'DKK', postalCodeFormat: '1234' },
  { name: 'Finland', code: 'FI', currency: 'EUR', postalCodeFormat: '12345' },
  { name: 'Norway', code: 'NO', currency: 'NOK', postalCodeFormat: '1234' },
  { name: 'Ireland', code: 'IE', currency: 'EUR', postalCodeFormat: 'A12 B345' },
  { name: 'New Zealand', code: 'NZ', currency: 'NZD', postalCodeFormat: '1234' },
  { name: 'Hong Kong', code: 'HK', currency: 'HKD', postalCodeFormat: '123456' },
  { name: 'Taiwan', code: 'TW', currency: 'TWD', postalCodeFormat: '12345' },
];

export const getCountryByCode = (code: string): Country | undefined => {
  return countries.find(country => country.code === code);
};

export const getCountryByName = (name: string): Country | undefined => {
  return countries.find(country => country.name === name);
};