import { useSlidingPill } from './hooks/useSlidingPill';
import { RANGES, type RangeId } from './types';

type Props = Readonly<{ value: RangeId; onChange: (range: RangeId) => void }>;

export default function RangeSelector({ value, onChange }: Props) {
  const { registerItem, pillStyle } = useSlidingPill(value);

  return (
    <fieldset className="details__ranges" role="group" aria-label="Time range">
      {pillStyle && <span className="details__range-pill" aria-hidden="true" style={pillStyle} />}
      {RANGES.map((range) => (
        <button
          key={range.id}
          ref={registerItem(range.id)}
          type="button"
          aria-pressed={value === range.id}
          className="details__range"
          onClick={() => onChange(range.id)}
        >
          {range.id}
        </button>
      ))}
    </fieldset>
  );
}
