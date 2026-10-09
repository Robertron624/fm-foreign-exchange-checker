import { useEffect, useState } from 'react';
import { RANGES, type HistoryPoint, type RangeId } from '../types';

export type HistoryStatus = 'loading' | 'ready' | 'error';

const API_URL = 'https://api.frankfurter.dev/v1';
const DAY_MS = 86_400_000;

const toISO = (date: Date) => date.toISOString().slice(0, 10);

/** Fetches the rate history of a currency pair for the given range. */
export function useRateHistory(base: string, quote: string, range: RangeId) {
  const [points, setPoints] = useState<HistoryPoint[]>([]);
  const [status, setStatus] = useState<HistoryStatus>('loading');

  useEffect(() => {
    const controller = new AbortController();
    const days = RANGES.find((r) => r.id === range)!.days;
    const end = new Date();
    // 1D needs at least two data points, so look back a few days.
    const start = new Date(end.getTime() - Math.max(days, 5) * DAY_MS);
    setStatus('loading');

    void (async () => {
      try {
        const res = await fetch(
          `${API_URL}/${toISO(start)}..${toISO(end)}?base=${base}&symbols=${quote}`,
          { signal: controller.signal },
        );
        if (!res.ok) throw new Error(String(res.status));
        const data: { rates: Record<string, Record<string, number>> } = await res.json();
        let next = Object.entries(data.rates)
          .map(([date, r]) => ({ date, value: r[quote] }))
          .sort((a, b) => a.date.localeCompare(b.date));
        if (days === 1) next = next.slice(-2);
        setPoints(next);
        setStatus('ready');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') setStatus('error');
      }
    })();

    return () => controller.abort();
  }, [base, quote, range]);

  return { points, status };
}
