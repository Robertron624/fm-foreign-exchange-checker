import { useState } from 'react';
import './Details.scss';
import HistoryPanel from './HistoryPanel';
import TabSelector from './TabSelector';
import { TABS, type TabId } from './types';

type Props = Readonly<{ base?: string; quote?: string }>;

export default function Details({ base = 'USD', quote = 'EUR' }: Props) {
  const [tab, setTab] = useState<TabId>('history');

  return (
    <section className="details" aria-label="Details">
      <TabSelector value={tab} onChange={setTab} />

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
        </div>
      ))}
    </section>
  );
}
