import { CurrencyCode, CurrencyInfo } from '../types/trading';

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  USD: {
    code: 'USD',
    country: 'United States',
    name: 'US Dollar',
    symbol: '$',
    rateAgainstUSD: 1.0,
    flag: '🇺🇸',
  },
  NGN: {
    code: 'NGN',
    country: 'Nigeria',
    name: 'Nigerian Naira',
    symbol: '₦',
    rateAgainstUSD: 1485.5,
    flag: '🇳🇬',
  },
  ZAR: {
    code: 'ZAR',
    country: 'South Africa',
    name: 'South African Rand',
    symbol: 'R',
    rateAgainstUSD: 18.35,
    flag: '🇿🇦',
  },
  MWK: {
    code: 'MWK',
    country: 'Malawi',
    name: 'Malawian Kwacha',
    symbol: 'MK',
    rateAgainstUSD: 1745.0,
    flag: '🇲🇼',
  },
  ZMW: {
    code: 'ZMW',
    country: 'Zambia',
    name: 'Zambian Kwacha',
    symbol: 'K',
    rateAgainstUSD: 27.8,
    flag: '🇿🇲',
  },
  ZIG: {
    code: 'ZIG',
    country: 'Zimbabwe',
    name: 'Zimbabwe Gold (ZiG)',
    symbol: 'ZiG',
    rateAgainstUSD: 26.9,
    flag: '🇿🇼',
  },
};

export const MIN_DEPOSIT_USD = 5.0;
export const MAX_DEPOSIT_USD = 1000.0;
export const MIN_STAKE_USD = 0.5;

/** Convert an amount in USD to the chosen currency */
export function convertFromUSD(amountUSD: number, currency: CurrencyCode): number {
  const info = CURRENCIES[currency];
  return amountUSD * info.rateAgainstUSD;
}

/** Convert an amount in chosen currency back to USD */
export function convertToUSD(amountLocal: number, currency: CurrencyCode): number {
  const info = CURRENCIES[currency];
  return amountLocal / (info.rateAgainstUSD || 1);
}

/** Format currency with symbol and decimal precision */
export function formatCurrency(
  amountUSD: number,
  currency: CurrencyCode,
  includeSymbol: boolean = true
): string {
  const info = CURRENCIES[currency];
  const localVal = amountUSD * info.rateAgainstUSD;
  const decimals = info.rateAgainstUSD > 100 ? 0 : 2;

  const formattedNum = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(localVal);

  if (!includeSymbol) return formattedNum;
  return `${info.symbol} ${formattedNum}`;
}
