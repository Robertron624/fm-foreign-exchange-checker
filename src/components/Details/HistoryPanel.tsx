import HistoryChart from './HistoryChart';
import RangeSelector from './RangeSelector';
import StatCards from './StatCards';
import { useState } from 'react';
import { useRateHistory } from './hooks/useRateHistory';
import type { RangeId } from './types';

type Props = Readonly<{ base: string; quote: string }>;

export default function HistoryPanel({ base, quote }: Props) {
  const [range, setRange] = useState<RangeId>('1M');
  const { points, status } = useRateHistory(base, quote, range);

  return (
    <>
      <StatCards points={points} />
      <RangeSelector value={range} onChange={setRange} />
      <HistoryChart pair={`${base}/${quote}`} points={points} status={status} />
    </>
  );
}
