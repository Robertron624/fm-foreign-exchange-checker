import { useEffect, useState } from 'react';
import HistoryChart from './HistoryChart';
import RangeSelector from './RangeSelector';
import StatCards from './StatCards';
import { RANGES, type HistoryPoint, type RangeId } from './types';

type Props = Readonly<{ base: string; quote: string }>;

function toISO(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function HistoryPanel({ base, quote }: Props) {
  const [range, setRange] = useState<RangeId>('1M');
  const [points, setPoints] = useState<HistoryPoint[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    const controller = new AbortController();
    const days = RANGES.find((r) => r.id === range)!.days;
    const end = new Date();
    // 1D needs at least two data points, so look back a few days.
    const start = new Date(end.getTime() - Math.max(days, 5) * 86_400_000);
    setStatus('loading');

    void (async () => {
      try {
        const res = await fetch(
          `https://api.frankfurter.dev/v1/${toISO(start)}..${toISO(end)}?base=${base}&symbols=${quote}`,
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

  return (
    <>
      <StatCards points={points} />
      <RangeSelector value={range} onChange={setRange} />
      <HistoryChart pair={`${base}/${quote}`} points={points} status={status} />
    </>
  );
}
