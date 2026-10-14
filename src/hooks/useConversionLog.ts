import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'fx-conversion-log';
const CHANGE_EVENT = 'fx-conversion-log-change';
const MAX_ENTRIES = 50;

export type LogEntry = {
  id: string;
  from: string;
  to: string;
  amount: number;
  result: number;
  at: number;
};

const EMPTY: LogEntry[] = [];

let cache: LogEntry[] = EMPTY;
let cacheRaw: string | null = null;

function read(): LogEntry[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return cache;
  }
  if (raw === cacheRaw) return cache;
  cacheRaw = raw;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : EMPTY;
    cache = Array.isArray(parsed) ? (parsed as LogEntry[]) : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(next: LogEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    cache = next;
    cacheRaw = null;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

/** Conversion history (newest first), persisted and shared across all islands. */
export function useConversionLog() {
  const entries = useSyncExternalStore(subscribe, read, () => EMPTY);

  const add = useCallback((entry: Omit<LogEntry, 'id' | 'at'>) => {
    const now = Date.now();
    write(
      [{ ...entry, id: `${now}-${Math.random().toString(36).slice(2, 7)}`, at: now }, ...read()].slice(
        0,
        MAX_ENTRIES,
      ),
    );
  }, []);

  const remove = useCallback((id: string) => {
    write(read().filter((e) => e.id !== id));
  }, []);

  const clear = useCallback(() => write([]), []);

  return { entries, add, remove, clear };
}
