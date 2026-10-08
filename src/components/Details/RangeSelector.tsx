import { RANGES, type RangeId } from './types';

type Props = Readonly<{ value: RangeId; onChange: (range: RangeId) => void }>;

export default function RangeSelector({ value, onChange }: Props) {
  return (
    <div className="details__ranges" role="group" aria-label="Time range">
      {RANGES.map((range) => (
        <button
          key={range.id}
          type="button"
          aria-pressed={value === range.id}
          className="details__range"
          onClick={() => onChange(range.id)}
        >
          {range.id}
        </button>
      ))}
    </div>
  );
}
