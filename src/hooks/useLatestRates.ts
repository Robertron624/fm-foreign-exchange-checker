import { useEffect, useState } from 'react';
import { REFRESH_INTERVAL } from '../constants';
import type { LoadStatus } from '../types';

export type Rates = Record<string, number>;

/** Loads the latest USD-based rates and keeps them refreshed. */
export function useLatestRates() {
  const [rates, setRates] = useState<Rates>({});
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [retryCount, setRetryCount] = useState(0);

  const retry = () => {
    setStatus('loading');
    setRetryCount((n) => n + 1);
  };

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        // Broader coverage than Frankfurter (e.g. AED, ARS, BDT).
        const res = await fetch('https://open.er-api.com/v6/latest/USD', {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        setRates({ ...data.rates, USD: 1 });
        setStatus('ready');
      } catch (err) {
        console.error(err);
        if (!controller.signal.aborted) setStatus((s) => (s === 'ready' ? s : 'error'));
      }
    };
    void load();
    const timer = setInterval(load, REFRESH_INTERVAL);
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, [retryCount]);

  return { rates, status, retry };
}
