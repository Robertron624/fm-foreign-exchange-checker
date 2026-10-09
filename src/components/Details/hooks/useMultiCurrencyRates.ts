import { useEffect, useState } from 'react';
import type { LoadStatus } from '../../../types';

/** Fetches the latest rates of the given quote currencies against a base currency. */
export function useMultiCurrencyRates(base: string, symbols: readonly string[]) {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [retryCount, setRetryCount] = useState(0);
  const key = symbols.join(',');

  const retry = () => {
    setStatus('loading');
    setRetryCount((count) => count + 1);
  };

  useEffect(() => {
    const controller = new AbortController();

    void (async () => {
      try {
        // Frankfurter lacks some currencies (e.g. BDT), so use this broader source.
        const res = await fetch(`https://open.er-api.com/v6/latest/${base}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(String(res.status));
        const data: { rates: Record<string, number> } = await res.json();
        setRates(
          Object.fromEntries(
            key.split(',').filter((s) => s in data.rates).map((s) => [s, data.rates[s]]),
          ),
        );
        setStatus('ready');
      } catch {
        if (!controller.signal.aborted) setStatus('error');
      }
    })();

    return () => controller.abort();
  }, [base, key, retryCount]);

  return { rates, status, retry };
}
