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
        const res = await fetch('https://api.frankfurter.dev/v1/latest?base=USD', {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        setRates({ USD: 1, ...data.rates });
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
