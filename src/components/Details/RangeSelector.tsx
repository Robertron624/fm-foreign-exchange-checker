import { useLayoutEffect, useRef, useState } from 'react';
import { RANGES, type RangeId } from './types';

type Props = Readonly<{ value: RangeId; onChange: (range: RangeId) => void }>;

export default function RangeSelector({ value, onChange }: Props) {
  const buttons = useRef(new Map<RangeId, HTMLButtonElement>());
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const update = () => {
      const el = buttons.current.get(value);
      if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [value]);

  return (
    <div className="details__ranges" role="group" aria-label="Time range">
      {pill && (
        <span
          className="details__range-pill"
          aria-hidden="true"
          style={{ transform: `translateX(${pill.left}px)`, width: pill.width }}
        />
      )}
      {RANGES.map((range) => (
        <button
          key={range.id}
          ref={(el) => {
            if (el) buttons.current.set(range.id, el);
          }}
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
