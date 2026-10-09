import type { ReactNode } from 'react';
import type { Market } from '../types';
import { useLiveMarkets } from '../hooks/useLiveMarkets';
import './LiveMarkets.scss';

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
  const { quotes, asOfDate, status, retry } = useLiveMarkets();

  let marketContent: ReactNode;

  console.log(asOfDate)

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
          onClick={retry}
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