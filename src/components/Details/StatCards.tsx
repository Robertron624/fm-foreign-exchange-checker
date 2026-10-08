import type { HistoryPoint } from './types';

type Props = Readonly<{ points: HistoryPoint[] }>;

export default function StatCards({ points }: Props) {
  const first = points[0]?.value;
  const last = points.at(-1)?.value;
  const hasData = first !== undefined && last !== undefined;
  const change = hasData ? last - first : 0;
  const pct = hasData && first !== 0 ? (change / first) * 100 : 0;
  const tone = change < 0 ? 'down' : 'up';
  const sign = change >= 0 ? '+' : '';
  const direction = change >= 0 ? '▲' : '▼';

  return (
    <div className="details__stats">
      <div className="details__stat">
        <span className="details__stat-label">OPEN</span>
        <span className="details__stat-value">{hasData ? first.toFixed(4) : '—'}</span>
      </div>
      <div className="details__stat">
        <span className="details__stat-label">LAST</span>
        <span className="details__stat-value">{hasData ? last.toFixed(4) : '—'}</span>
      </div>
      <div className="details__stat">
        <span className="details__stat-label">CHANGE</span>
        <span className={`details__stat-value details__stat-value--${tone}`}>
          {hasData ? `${sign}${change.toFixed(4)}` : '—'}
        </span>
      </div>
      <div className="details__stat">
        <span className="details__stat-label">% CHANGE</span>
        <span className={`details__stat-value details__stat-value--${tone}`}>
          {hasData ? `${direction} ${sign}${pct.toFixed(2)}%` : '—'}
        </span>
      </div>
    </div>
  );
}
