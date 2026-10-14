import type { LogEntry } from '../../hooks/useConversionLog';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });

function formatAge(at: number, now: number) {
  const diff = Math.max(0, now - at);
  if (diff < HOUR) return `${Math.max(1, Math.floor(diff / MINUTE))}M`;
  if (diff < 24 * HOUR) return `${Math.floor(diff / HOUR)}H`;
  return dateFormat.format(at);
}

const formatAmount = (value: number) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: value >= 10_000 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);

type Props = Readonly<{
  entries: readonly LogEntry[];
  onRemove: (id: string) => void;
  onClear: () => void;
}>;

export default function LogPanel({ entries, onRemove, onClear }: Props) {
  const now = Date.now();

  return (
    <div className="details__log">
      <h3 className="details__log-title">CONVERSION LOG</h3>
      <div className="details__log-header">
        {entries.length > 0 && (
          <>
            <p className="details__log-count">{entries.length} LOGGED</p>
            <button type="button" className="details__log-clear" onClick={onClear}>
              CLEAR ALL
            </button>
          </>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="details__fav-empty">
          <h4>No conversions logged yet</h4>
          <p>Every conversion is recorded here automatically when you tap LOG CONVERSION. Your log is private to this session and this browser.</p>
        </div>
      ) : (
        <ul className="details__log-list">
          {entries.map((entry) => (
            <li key={entry.id} className="details__log-item">
              <div className="details__log-meta">
                <span className="details__log-time">{formatAge(entry.at, now)}</span>
                <span className="details__log-pair">
                  {entry.from}
                  <img src="/images/icon-arrow-right.svg" alt="to" width={12} height={12} />
                  {entry.to}
                </span>
              </div>
              <div className="details__log-values">
                <span className="details__log-amount">{formatAmount(entry.amount)}</span>
                <span className="details__log-result">{formatAmount(entry.result)}</span>
              </div>
              <button
                type="button"
                className="details__log-delete"
                aria-label={`Delete ${entry.from} to ${entry.to} entry`}
                onClick={() => onRemove(entry.id)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
