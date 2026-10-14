import { splitPair } from '../../hooks/useFavorites';
import { FilledStarIcon } from '../Icons';
import { usePairQuotes } from './hooks/usePairQuotes';

const formatRate = (rate: number) => {
  if (rate >= 100) return rate.toFixed(2);
  if (rate >= 10) return rate.toFixed(3);
  return rate.toFixed(4);
};

type Props = Readonly<{
  favorites: readonly string[];
  onToggleFavorite: (pair: string) => void;
}>;

export default function FavoritesPanel({ favorites, onToggleFavorite }: Props) {
  const { quotes, status, retry } = usePairQuotes(favorites);

  return (
    <div className="details__fav">
      <header className="details__fav-header">
        <p className="details__fav-title">PINNED PAIRS</p>
        <p className="details__fav-count">{favorites.length} FAVORITES</p>
      </header>

      {favorites.length === 0 ? (
        <p className="details__fav-empty">No favorites yet. Star a pair to pin it here.</p>
      ) : (
        <ul className="details__fav-list" aria-busy={status === 'loading'}>
          {favorites.map((pair) => {
            const [from, to] = splitPair(pair);
            const quote = quotes[pair];
            const change = quote?.change;
            const up = (change ?? 0) >= 0;
            return (
              <li key={pair} className="details__fav-item">
                <p className="details__fav-pair">
                  <span>{from}</span> 
                    <img src="/images/icon-arrow-right.svg" alt={`${from} to ${to}`} />
                  <span>{to}</span>
                </p>
                <div className="details__fav-values">
                  <span className="details__fav-rate">
                    {quote ? formatRate(quote.rate) : '—'}
                  </span>
                  {change !== null && change !== undefined && (
                    <span
                      className={`details__fav-change ${up ? 'is-up' : 'is-down'}`}
                    >
                      {up ? '▲ +' : '▼ '}
                      {change.toFixed(2)}%
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="details__fav-star"
                  aria-label={`Remove ${from} to ${to} from favorites`}
                  onClick={() => onToggleFavorite(pair)}
                >
                  <FilledStarIcon fillColor="var(--color-lime-500)" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {status === 'error' && (
        <div className="details__compare-error" role="alert">
          <p>Couldn’t load rates.</p>
          <button type="button" onClick={retry}>
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
