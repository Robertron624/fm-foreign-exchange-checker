import { MARKETS } from './constants';

export type LoadStatus = 'loading' | 'ready' | 'error';

export type Market = (typeof MARKETS)[number];

export interface MarketQuote {
  market: Market;
  rate: number;
  change: number;
}