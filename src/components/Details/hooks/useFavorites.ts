import { useEffect, useState } from 'react';

const STORAGE_KEY = 'fx-favorites';
const DEFAULTS = ['GBP', 'JPY', 'INR', 'BDT'];

/** Favorite currency codes, persisted in localStorage. */
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(DEFAULTS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setFavorites(JSON.parse(stored) as string[]);
    } catch {
      /* ignore unreadable storage */
    }
  }, []);

  const toggle = (code: string) =>
    setFavorites((current) => {
      const next = current.includes(code)
        ? current.filter((c) => c !== code)
        : [...current, code];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });

  return { favorites, toggle };
}
