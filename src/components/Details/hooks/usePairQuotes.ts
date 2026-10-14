import { useEffect, useState } from 'react';
import type { LoadStatus } from '../../../types';

export type PairQuote = { rate: number; change: number | null };

const API = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api';

const isoDaysAgo = (days: number) =>
  new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);

async function fetchBase(base: string, version: string, signal: AbortSignal) {
  const lower = base.toLowerCase();
  const res = await fetch(`${API}@${version}/v1/currencies/${lower}.json`, { signal });
  if (!res.ok) throw new Error(String(res.status));
  const data = await res.json();
  return data[lower] as Record<string, number>;
}

/** Latest rate and day-over-day % change for each "BASE-QUOTE" pair. */
export function usePairQuotes(pairs: readonly string[]) {
  const [quotes, setQuotes] = useState<Record<string, PairQuote>>({});
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [retryCount, setRetryCount] = useState(0);

  const retry = () => {
    setStatus('loading');
    setRetryCount((n) => n + 1);
  };

  const key = pairs.join(',');

  useEffect(() => {
    if (!key) {
      setStatus('ready');
      return;
    }
    const controller = new AbortController();
    const bases = [...new Set(key.split(',').map((p) => p.split('-')[0]))];
    const yesterday = isoDaysAgo(1);

    const load = async () => {
      try {
        const entries = await Promise.all(
          bases.map(async (base) => {
            const [latest, previous] = await Promise.all([
              fetchBase(base, 'latest', controller.signal),
              fetchBase(base, yesterday, controller.signal).catch(() => null),
            ]);
            return [base, latest, previous] as const;
          }),
        );
        const next: Record<string, PairQuote> = {};
        for (const pair of key.split(',')) {
          const [base, quote] = pair.split('-');
          const entry = entries.find(([b]) => b === base);
          const rate = entry?.[1][quote.toLowerCase()];
          if (rate === undefined) continue;
          const prev = entry?.[2]?.[quote.toLowerCase()];
          next[pair] = { rate, change: prev ? ((rate - prev) / prev) * 100 : null };
        }
        setQuotes(next);
        setStatus('ready');
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error(err);
          setStatus('error');
        }
      }
    };
    void load();
    return () => controller.abort();
  }, [key, retryCount]);

  return { quotes, status, retry };
}
