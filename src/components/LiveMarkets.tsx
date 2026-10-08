import { useEffect, useState, type ReactNode } from 'react';
import { MARKETS, REFRESH_INTERVAL, DAYS_OF_HISTORY } from '../constants';
import type { LoadStatus, Market } from '../types';
import './LiveMarkets.scss';

const CURRENCIES = [...new Set(MARKETS.flatMap(({ base, quote }) => [base, quote]))]
  .filter((currency) => currency !== 'USD')
  .join(',');


interface MarketQuote {
  market: Market;
  rate: number;
  change: number;
}

interface RateHistory {
  rates: Record<string, Record<string, number>>;
}


function getMarketRate(rates: Record<string, number>, market: Market): number {
  const usdRate = market.base === 'USD' ? rates[market.quote] : rates[market.base];

  if (typeof usdRate !== 'number' || !Number.isFinite(usdRate) || usdRate <= 0) {
    throw new Error(`No rate available for ${market.label}`);
  }

  return market.base === 'USD' ? usdRate : 1 / usdRate;
}

function formatRate(rate: number, market: Market): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: market.quote === 'JPY' ? 2 : 4,
    maximumFractionDigits: market.quote === 'JPY' ? 2 : 4,
  }).format(rate);
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(date + 'T00:00:00Z'));
}

export default function LiveMarkets() {
  const [quotes, setQuotes] = useState<MarketQuote[]>([]);
  const [asOfDate, setAsOfDate] = useState('');
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [retryCount, setRetryCount] = useState(0);

  let marketContent: ReactNode;

  if (status === 'loading' && quotes.length === 0) {
    marketContent = (
      <output className="live-markets__message">
        Loading latest rates…
      </output>
    );
  } else if (status === 'error' && quotes.length === 0) {
    marketContent = (
      <output className="live-markets__message">
        <span>Rates unavailable</span>
        <button
          className="live-markets__retry"
          type="button"
          onClick={() => {
            setStatus('loading');
            setRetryCount((count) => count + 1);
          }}
        >
          Retry
        </button>
      </output>
    );
  } else {
    marketContent = (
      <ul className="market-quotes" aria-live="polite" aria-busy={status === 'loading'}>
        {quotes.map(({ market, rate, change }) => {
          const direction = change >= 0 ? 'up' : 'down';
          const changeLabel = `${Math.abs(change).toFixed(2)} percent ${direction} since the previous ECB fixing`;

          return (
            <li className="market-quote" data-direction={direction} key={market.label}>
              <span className="market-quote__pair">{market.label}</span>
              <strong className="market-quote__rate">{formatRate(rate, market)}</strong>
              <span className="market-quote__change" aria-label={changeLabel}>
                <span aria-hidden="true">{change >= 0 ? '▲' : '▼'}</span>{' '}
                {change >= 0 ? '+' : ''}
                {change.toFixed(2)}%
              </span>
            </li>
          );
        })}
      </ul>
    );
  }

  useEffect(() => {
    const controller = new AbortController();
    let refreshTimer: number | undefined;

    async function loadMarkets() {
      try {
        const startDate = new Date(Date.now() - DAYS_OF_HISTORY * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10);
        const url =
          'https://api.frankfurter.dev/v1/' +
          startDate +
          '..?base=USD&symbols=' +
          CURRENCIES;
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
        const nextQuotes = MARKETS.map((market) => {
          const previousRate = getMarketRate(previous[1], market);
          const currentRate = getMarketRate(current[1], market);

          return {
            market,
            rate: currentRate,
            change: ((currentRate - previousRate) / previousRate) * 100,
          };
        });

        setQuotes(nextQuotes);
        setAsOfDate(current[0]);
        setStatus('ready');
      } catch {
        if (!controller.signal.aborted) {
          setStatus('error');
        }
      } finally {
        if (!controller.signal.aborted) {
          refreshTimer = window.setTimeout(loadMarkets, REFRESH_INTERVAL);
        }
      }
    }

    void loadMarkets();

    return () => {
      controller.abort();
      if (refreshTimer !== undefined) {
        window.clearTimeout(refreshTimer);
      }
    };
  }, [retryCount]);

  return (
    <section className="live-markets" aria-label="Live markets">
      <div className="inner">
        <div className="live-markets__heading">
          <p className="live-markets__title">
            <span className="live-markets__status-dot" aria-hidden="true" />
            <span className='live-markets__title-text'>
              Live Markets
            </span>
          </p>
        </div>
        {marketContent}
      </div>
    </section>
  );
}