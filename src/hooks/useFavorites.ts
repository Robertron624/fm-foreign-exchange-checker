import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'fx-favorite-pairs';
const CHANGE_EVENT = 'fx-favorites-change';

const DEFAULTS = [
  'USD-EUR',
  'GBP-USD',
  'USD-JPY',
  'USD-BDT',
  'EUR-GBP',
  'AUD-NZD',
  'USD-INR',
  'EUR-CHF',
  'GBP-JPY',
  'USD-TRY',
];

export const pairKey = (from: string, to: string) => `${from}-${to}`;
export const splitPair = (pair: string) => pair.split('-') as [string, string];

let cache: string[] = DEFAULTS;
let cacheRaw: string | null = null;

function read(): string[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return cache;
  }
  if (raw === cacheRaw) return cache;
  cacheRaw = raw;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : DEFAULTS;
    cache = Array.isArray(parsed) ? (parsed as string[]) : DEFAULTS;
  } catch {
    cache = DEFAULTS;
  }
  return cache;
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

/** Favorite currency pairs ("USD-EUR"), persisted and shared across all islands. */
export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, read, () => DEFAULTS);

  const toggle = useCallback((pair: string) => {
    const current = read();
    const next = current.includes(pair)
      ? current.filter((p) => p !== pair)
      : [...current, pair];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      cache = next;
      cacheRaw = null;
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return { favorites, toggle };
}
