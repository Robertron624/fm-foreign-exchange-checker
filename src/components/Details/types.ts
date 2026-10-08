export const TABS = [
  { id: 'history', label: 'History' },
  { id: 'compare', label: 'Compare' },
  { id: 'favorites', label: 'Favorites' },
  { id: 'change', label: '% Change' },
] as const;

export type TabId = (typeof TABS)[number]['id'];

export const RANGES = [
  { id: '1D', days: 1 },
  { id: '1W', days: 7 },
  { id: '1M', days: 30 },
  { id: '3M', days: 90 },
  { id: '1Y', days: 365 },
  { id: '5Y', days: 1825 },
] as const;

export type RangeId = (typeof RANGES)[number]['id'];

export type HistoryPoint = { date: string; value: number };
