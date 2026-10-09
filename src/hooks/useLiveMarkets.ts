import { useEffect, useState } from 'react';
import { MARKETS, REFRESH_INTERVAL, DAYS_OF_HISTORY } from '../constants';
import type { LoadStatus, Market, MarketQuote } from '../types';

interface RateHistory {
  rates: Record<string, Record<string, number>>;
}

const CURRENCIES = [...new Set(MARKETS.flatMap(({ base, quote }) => [base, quote]))]
  .filter((currency) => currency !== 'USD')
  .join(',');

function getMarketRate(rates: Record<string, number>, market: Market): number {
  const usdRate = market.base === 'USD' ? rates[market.quote] : rates[market.base];

  if (typeof usdRate !== 'number' || !Number.isFinite(usdRate) || usdRate <= 0) {
    throw new Error(`No rate available for ${market.label}`);
  }

  return market.base === 'USD' ? usdRate : 1 / usdRate;
}

/** Loads the latest market quotes and refreshes them periodically. */
export function useLiveMarkets() {
  const [quotes, setQuotes] = useState<MarketQuote[]>([]);
  const [asOfDate, setAsOfDate] = useState('');
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [retryCount, setRetryCount] = useState(0);

  const retry = () => {
    setStatus('loading');
    setRetryCount((count) => count + 1);
  };

  useEffect(() => {
    const controller = new AbortController();
    let refreshTimer: number | undefined;

    async function loadMarkets() {
      try {
        const startDate = new Date(Date.now() - DAYS_OF_HISTORY * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10);
        const url = `https://api.frankfurter.dev/v1/${startDate}..?base=USD&symbols=${CURRENCIES}`;
        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`Market request failed with status ${response.status}`);
        }

        const history = (await response.json()) as RateHistory;
        const snapshots = Object.entries(history.rates).sort(([left], [right]) =>
          left.localeCompare(right),
        );

        if (snapshots.length < 2) {
          throw new Error('Not enough rate history to calculate market changes');
        }

        const [previous, current] = snapshots.slice(-2);
        setQuotes(
          MARKETS.map((market) => {
            const previousRate = getMarketRate(previous[1], market);
            const currentRate = getMarketRate(current[1], market);
            return {
              market,
              rate: currentRate,
              change: ((currentRate - previousRate) / previousRate) * 100,
            };
          }),
        );
        setAsOfDate(current[0]);
        setStatus('ready');
      } catch {
        if (!controller.signal.aborted) setStatus('error');
      } finally {
        if (!controller.signal.aborted) {
          refreshTimer = window.setTimeout(loadMarkets, REFRESH_INTERVAL);
        }
      }
    }

    void loadMarkets();

    return () => {
      controller.abort();
      if (refreshTimer !== undefined) window.clearTimeout(refreshTimer);
    };
  }, [retryCount]);

  return { quotes, asOfDate, status, retry };
}
