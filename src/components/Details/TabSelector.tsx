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
  return (
    <>
      <div className="details__select-wrap">
        <select
          className="details__select"
          aria-label="Details section"
          value={value}
          onChange={(e) => onChange(e.target.value as TabId)}
        >
          {TABS.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label.toUpperCase()}
            </option>
          ))}
        </select>
        {selectedCount !== undefined && (
          <span className="details__badge" aria-hidden="true">
            {selectedCount}
          </span>
        )}
      </div>

      <div className="details__tabs" role="tablist" aria-label="Details sections">
        {TABS.map((tab) => (
          <button
            key={tab.id}
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
