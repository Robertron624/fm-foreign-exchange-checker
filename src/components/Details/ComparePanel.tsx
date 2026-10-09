import { CURRENCY_FLAGS } from '../../constants';
import { FilledStarIcon, OutlineStarIcon } from '../Icons';
import { useMultiCurrencyRates } from './hooks/useMultiCurrencyRates';

const AMOUNT = 1000;

const PAIRS = [
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'BDT', name: 'Bangladeshi Taka' },
] as const;

const SYMBOLS = PAIRS.map((p) => p.code);

const money = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatRate = (rate: number) => (rate >= 100 ? rate.toFixed(2) : rate.toFixed(4));

type Props = Readonly<{
  base: string;
  favorites: readonly string[];
  onToggleFavorite: (code: string) => void;
}>;

export default function ComparePanel({ base, favorites, onToggleFavorite }: Props) {
  const { rates, status, retry } = useMultiCurrencyRates(base, SYMBOLS);

  return (
    <div className="details__compare">
      <header className="details__compare-header">
        <p className="details__compare-title">
          <span className='multi-currency-title'>MULTI-CURRENCY</span> {money.format(AMOUNT).replace('.00', '')} FROM {base}
        </p>
        <p className="details__compare-count">{PAIRS.length} PAIRS</p>
      </header>

      {status === 'error' ? (
        <div className="details__compare-error" role="alert">
          <p>Couldn’t load rates.</p>
          <button type="button" onClick={retry}>
            Retry
          </button>
        </div>
      ) : (
        <ul className="details__compare-list" aria-busy={status === 'loading'}>
          {PAIRS.map(({ code, name }) => {
            const rate = rates[code];
            const isFavorite = favorites.includes(code);
            const flag = CURRENCY_FLAGS[code];
            return (
              <li key={code} className="details__compare-item">
                {flag && (
                  <img
                    className="details__compare-flag"
                    src={`/images/flags/${flag}.webp`}
                    alt=""
                    width={24}
                    height={24}
                  />
                )}
                <div className="details__compare-currency">
                  <span className="details__compare-code">{code}</span>
                  <span className="details__compare-name">{name}</span>
                </div>
                <div className="details__compare-values">
                  <span className="details__compare-amount">
                    {rate === undefined ? '—' : money.format(rate * AMOUNT)}
                  </span>
                  <span className="details__compare-rate">
                    {rate === undefined ? '' : `@ ${formatRate(rate)}`}
                  </span>
                </div>
                <button
                  type="button"
                  className="details__compare-fav"
                  aria-pressed={isFavorite}
                  aria-label={`${isFavorite ? 'Remove' : 'Add'} ${code} ${isFavorite ? 'from' : 'to'} favorites`}
                  onClick={() => onToggleFavorite(code)}
                >
                  {isFavorite ? (
                    <FilledStarIcon fillColor="var(--color-lime-500)" />
                  ) : (
                    <OutlineStarIcon strokeColor="var(--color-neutral-50)" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
