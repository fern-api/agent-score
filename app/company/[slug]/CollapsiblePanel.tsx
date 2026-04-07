'use client';

import { useId, useState } from 'react';
import '../company.css';

export default function CollapsiblePanel({
  title,
  copySlot,
  children,
  showFade = false,
  alwaysOpen = false,
}: {
  title: string;
  copySlot: React.ReactNode;
  children: React.ReactNode;
  showFade?: boolean;
  alwaysOpen?: boolean;
}) {
  const [open, setOpen] = useState(alwaysOpen);
  const panelBodyId = useId();

  return (
    <div className={`co-panel${open ? ' panel-open' : ''}${showFade ? ' panel-fade' : ''}`}>
      <div
        className="co-panel-header"
        onClick={alwaysOpen ? undefined : () => setOpen((o) => !o)}
        style={{ cursor: alwaysOpen ? 'default' : 'pointer' }}
      >
        <button
          className="v3-panel-toggle-btn"
          aria-expanded={open}
          aria-controls={panelBodyId}
          tabIndex={-1}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1, background: 'transparent', border: 'none', padding: 0, cursor: alwaysOpen ? 'default' : 'pointer', textAlign: 'left', pointerEvents: 'none' }}
        >
          <span className="co-panel-title">{title}</span>
          {!alwaysOpen && (
            <span className="co-panel-chevron" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4,6 8,10 12,6"/>
              </svg>
            </span>
          )}
        </button>
        <div style={{ marginLeft: '10px' }} onClick={(e) => e.stopPropagation()}>
          {copySlot}
        </div>
      </div>
      <div id={panelBodyId} className="co-panel-body">
        <div className="co-panel-body-inner">
          {children}
        </div>
        <div className="co-panel-fade-overlay" />
      </div>
    </div>
  );
}
