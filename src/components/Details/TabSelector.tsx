import { useCallback, useRef, useState } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useSlidingPill } from './hooks/useSlidingPill';
import { TABS, type TabId } from './types';

type Props = Readonly<{
  value: TabId;
  onChange: (tab: TabId) => void;
  favoritesCount?: number;
  logCount?: number;
}>;

export default function TabSelector({ value, onChange, favoritesCount, logCount }: Props) {
  const counts: Partial<Record<TabId, number | undefined>> = {
    favorites: favoritesCount,
    log: logCount,
  };
  const selectedCount = counts[value];
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { registerItem, pillStyle } = useSlidingPill(value);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(wrapRef, open, close);
  return (
    <>
      <div
        className="details__select-wrap"
        ref={wrapRef}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
      >
        <button
          type="button"
          className="details__select"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label="Details section"
          onClick={() => setOpen((o) => !o)}
        >
          <span>{TABS.find((t) => t.id === value)?.label.toUpperCase()}</span>
          {selectedCount !== undefined && (
            <span className="details__badge" aria-hidden="true">
              {selectedCount}
            </span>
          )}
        </button>
        {open && (
          <ul className="details__menu" role="listbox" aria-label="Details section">
            {TABS.map((tab) => (
              <li key={tab.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={value === tab.id}
                  className="details__menu-item"
                  onClick={() => {
                    onChange(tab.id);
                    setOpen(false);
                  }}
                >
                  <span>{tab.label.toUpperCase()}</span>
                  {counts[tab.id] !== undefined && (
                    <span className="details__badge">{counts[tab.id]}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="details__tabs" role="tablist" aria-label="Details sections">
        {pillStyle && <span className="details__tab-indicator" aria-hidden="true" style={pillStyle} />}
        {TABS.map((tab) => (
          <button
            key={tab.id}
            ref={registerItem(tab.id)}
            id={`details-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={value === tab.id}
            aria-controls={`details-panel-${tab.id}`}
            className="details__tab"
            onClick={() => onChange(tab.id)}
          >
            {tab.label.toUpperCase()}
            {counts[tab.id] !== undefined && (
              <span className="details__badge">{counts[tab.id]}</span>
            )}
          </button>
        ))}
      </div>
    </>
  );
}
