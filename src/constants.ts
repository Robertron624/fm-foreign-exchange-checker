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

export const CURRENCY_FLAGS: Record<string, string> = {
  AUD: 'au', BDT: 'bd', BRL: 'br', CAD: 'ca', CHF: 'ch', CNY: 'cn', CZK: 'cz', DKK: 'dk',
  EUR: 'eu', GBP: 'gb', HKD: 'hk', HUF: 'hu', IDR: 'id', INR: 'in', ISK: 'is',
  JPY: 'jp', KRW: 'kr', MXN: 'mx', MYR: 'my', NOK: 'no', NZD: 'nz', PHP: 'ph',
  PLN: 'pl', RON: 'ro', SEK: 'se', SGD: 'sg', THB: 'th', TRY: 'tr', USD: 'us',
  ZAR: 'za',
  AED: 'ae', ARS: 'ar', BGN: 'bg', BHD: 'bh', CLP: 'cl', COP: 'co', EGP: 'eg', HNL: 'hn',
  HTG: 'ht', JOD: 'jo', KES: 'ke', KWD: 'kw', LBP: 'lb', LKR: 'lk', MAD: 'ma', NGN: 'ng',
  NPR: 'np', OMR: 'om', PEN: 'pe', PKR: 'pk', QAR: 'qa', RUB: 'ru', SAR: 'sa', TWD: 'tw',
  UAH: 'ua', VND: 'vn',
};

export const POPULAR_CURRENCIES = ['USD', 'EUR', 'GBP'] as const;
