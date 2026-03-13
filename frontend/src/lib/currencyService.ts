export const DEFAULT_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.35,
  AUD: 1.52,
  JPY: 150.0,
  CNY: 7.20,
  INR: 92.5079, // User's requested rate ($38 -> 3515.30)
  BRL: 4.98,
  MXN: 16.80,
  CHF: 0.88,
  SEK: 10.30,
  NOK: 10.60,
  DKK: 6.85,
  NZD: 1.64,
  SGD: 1.34,
  HKD: 7.82,
  KRW: 1330.0,
  AED: 3.67,
  SAR: 3.75,
  TRY: 32.0,
  PKR: 278.0,
  IDR: 15700.0,
  MYR: 4.70,
  THB: 35.80,
  PHP: 56.0,
  ZAR: 18.70,
  RUB: 91.50,
  TWD: 31.50,
  VND: 24700.0,
  ILS: 3.65,
  EGP: 47.50,
  ARS: 850.0,
  COP: 3900.0,
  CLP: 970.0,
  PEN: 3.70,
  UAH: 38.50,
  PLN: 3.95,
  CZK: 23.30,
  HUF: 365.0,
  RON: 4.60,
};

export interface CurrencyDetails {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

export const SUPPORTED_CURRENCIES: CurrencyDetails[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', locale: 'en-CA' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', locale: 'pt-BR' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', locale: 'es-MX' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', locale: 'de-CH' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', locale: 'sv-SE' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', locale: 'nb-NO' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone', locale: 'da-DK' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', locale: 'en-NZ' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', locale: 'zh-HK' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', locale: 'ko-KR' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', locale: 'ar-AE' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', locale: 'ar-SA' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', locale: 'tr-TR' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', locale: 'en-PK' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', locale: 'id-ID' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', locale: 'ms-MY' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', locale: 'th-TH' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', locale: 'en-PH' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', locale: 'en-ZA' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble', locale: 'ru-RU' },
  { code: 'TWD', symbol: 'NT$', name: 'Taiwan Dollar', locale: 'zh-TW' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', locale: 'vi-VN' },
  { code: 'ILS', symbol: '₪', name: 'Israeli New Shekel', locale: 'he-IL' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', locale: 'ar-EG' },
  { code: 'ARS', symbol: '$', name: 'Argentine Peso', locale: 'es-AR' },
  { code: 'COP', symbol: '$', name: 'Colombian Peso', locale: 'es-CO' },
  { code: 'CLP', symbol: '$', name: 'Chilean Peso', locale: 'es-CL' },
  { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol', locale: 'es-PE' },
  { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia', locale: 'uk-UA' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', locale: 'pl-PL' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', locale: 'cs-CZ' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', locale: 'hu-HU' },
  { code: 'RON', symbol: 'lei', name: 'Romanian Leu', locale: 'ro-RO' },
];

/**
 * Converts an amount from USD to the target currency.
 * @param amount Amount in USD
 * @param targetCurrency Target currency code (e.g., 'INR')
 * @returns Converted amount
 */
export const convertFromUSD = (amount: number, targetCurrency: string): number => {
  const rate = DEFAULT_RATES[targetCurrency] || 1;
  return amount * rate;
};

/**
 * Formats a price according to the currency and locale.
 * @param amount Amount in target currency
 * @param currencyCode Currency code
 * @returns Formatted string
 */
export const formatCurrency = (amount: number, currencyCode: string): string => {
  if (amount <= 0) return 'FREE';
  
  const currencyInfo = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode) || SUPPORTED_CURRENCIES[0];
  
  return new Intl.NumberFormat(currencyInfo.locale, {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
};

/**
 * Converts and formats a price from USD.
 * @param amountUSD Amount in USD
 * @param targetCurrency Target currency code
 * @returns Formatted string
 */
export const formatFromUSD = (amountUSD: number, targetCurrency: string): string => {
  const converted = convertFromUSD(amountUSD, targetCurrency);
  return formatCurrency(converted, targetCurrency);
};

/**
 * Zero-decimal currencies in Stripe
 * See: https://stripe.com/docs/currencies#zero-decimal
 */
export const ZERO_DECIMAL_CURRENCIES = [
  'BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF'
];

/**
 * Converts an amount for Stripe API (smallest unit).
 * @param amount Amount in currency units
 * @param currencyCode Currency code
 * @returns Amount in smallest units
 */
export const getStripeAmount = (amount: number, currencyCode: string): number => {
  const isZeroDecimal = ZERO_DECIMAL_CURRENCIES.includes(currencyCode.toUpperCase());
  return isZeroDecimal ? Math.round(amount) : Math.round(amount * 100);
};
