import { useId } from 'react';
import type { HistoryPoint } from './types';

type Props = Readonly<{
  pair: string;
  points: HistoryPoint[];
  status: 'loading' | 'ready' | 'error';
}>;

const W = 600;
const H = 240;
const PAD_X = 8;
const PAD_Y = 12;

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
  });
}

export default function HistoryChart({ pair, points, status }: Props) {
  const gradientId = useId();

  const showStale = status === 'loading' && points.length >= 2;
  if (!showStale && (status !== 'ready' || points.length < 2)) {
    return (
      <div className="details__chart details__chart--empty">
        <p>
          {status === 'loading' && 'Loading chart…'}
          {status === 'error' && 'Could not load history.'}
          {status === 'ready' && 'Not enough data for this range.'}
        </p>
      </div>
    );
  }

  const values = points.map((p) => p.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const mid = (max + min) / 2;
  const span = max - min || 1;
  const x = (i: number) => PAD_X + (i / (points.length - 1)) * (W - PAD_X * 2);
  const y = (v: number) => PAD_Y + (1 - (v - min) / span) * (H - PAD_Y * 2);

  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const area = `${line} L${x(points.length - 1)},${H} L${x(0)},${H} Z`;
  const last = points.at(-1)!;
  const labelIdx = [0, 0.25, 0.5, 0.75, 1].map((r) => Math.round(r * (points.length - 1)));

  return (
    <div className="details__chart">
      <div className="details__chart-head">
        <h3 className="details__chart-pair">{pair}</h3>
        <p className="details__chart-meta">
          {last.value.toFixed(4)} · {formatDate(last.date).toUpperCase()}
        </p>
      </div>

      <div className="details__chart-body">
        <ul className="details__y-axis" aria-hidden="true">
          <li>{max.toFixed(4)}</li>
          <li>{mid.toFixed(4)}</li>
          <li>{min.toFixed(4)}</li>
        </ul>
        <div className="details__plot">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            role="img"
            aria-label={`${pair} rate history chart`}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ceff39" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#ceff39" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[PAD_Y, H / 2, H - PAD_Y].map((gy) => (
              <line key={gy} x1="0" x2={W} y1={gy} y2={gy} className="details__grid-line" />
            ))}
            <path d={area} fill={`url(#${gradientId})`} />
            <path d={line} className="details__line" vectorEffect="non-scaling-stroke" />
          </svg>
          <ul className="details__x-axis" aria-hidden="true">
            {labelIdx.map((i, n) => (
              <li key={`label-${i}`} className={n % 2 ? 'details__x-extra' : undefined}>{formatDate(points[i].date)}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
