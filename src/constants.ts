export const MARKETS = [
  { base: 'EUR', quote: 'USD', label: 'EUR/USD' },
  { base: 'GBP', quote: 'USD', label: 'GBP/USD' },
  { base: 'USD', quote: 'JPY', label: 'USD/JPY' },
  { base: 'USD', quote: 'CHF', label: 'USD/CHF' },
  { base: 'AUD', quote: 'USD', label: 'AUD/USD' },
  { base: 'USD', quote: 'CAD', label: 'USD/CAD' },
] as const;

export const REFRESH_INTERVAL = 15 * 60 * 1000;
export const DAYS_OF_HISTORY = 7;