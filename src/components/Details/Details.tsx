import { useState } from 'react';
import './Details.scss';
import ComparePanel from './ComparePanel';
import HistoryPanel from './HistoryPanel';
import FavoritesPanel from './FavoritesPanel';
import { useFavorites } from '../../hooks/useFavorites';
import LogPanel from './LogPanel';
import { useConversionLog } from '../../hooks/useConversionLog';
import TabSelector from './TabSelector';
import { TABS, type TabId } from './types';

type Props = Readonly<{ base?: string; quote?: string }>;

export default function Details({ base = 'USD', quote = 'EUR' }: Props) {
  const [tab, setTab] = useState<TabId>('history');
  const { favorites, toggle } = useFavorites();
  const log = useConversionLog();

  return (
    <section className="details" aria-label="Details">
      <TabSelector
        value={tab}
        onChange={setTab}
        favoritesCount={favorites.length}
        logCount={log.entries.length}
      />

      {TABS.map((t) => (
        <div
          key={t.id}
          id={`details-panel-${t.id}`}
          role="tabpanel"
          aria-labelledby={`details-tab-${t.id}`}
          hidden={tab !== t.id}
          className="details__panel"
        >
          {t.id === 'history' && tab === 'history' && (
            <HistoryPanel base={base} quote={quote} />
          )}
          {t.id === 'compare' && tab === 'compare' && (
            <ComparePanel base={base} favorites={favorites} onToggleFavorite={toggle} />
          )}
          {t.id === 'favorites' && tab === 'favorites' && (
            <FavoritesPanel favorites={favorites} onToggleFavorite={toggle} />
          )}
          {t.id === 'log' && tab === 'log' && (
            <LogPanel entries={log.entries} onRemove={log.remove} onClear={log.clear} />
          )}
        </div>
      ))}
    </section>
  );
}
