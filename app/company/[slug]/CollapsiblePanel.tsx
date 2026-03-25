'use client';

import { useId, useState } from 'react';
import '../company.css';

export default function CollapsiblePanel({
  title,
  copySlot,
  children,
}: {
  title: string;
  copySlot: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const panelBodyId = useId();

  return (
    <div className={`co-panel${open ? ' panel-open' : ''}`}>
      <div className="co-panel-header">
        <button
          className="v3-panel-toggle-btn"
          aria-expanded={open}
          aria-controls={panelBodyId}
          onClick={() => setOpen((o) => !o)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
        >
          <span className="co-panel-title">{title}</span>
          <span className="co-panel-chevron" aria-hidden="true">&#8964;</span>
        </button>
        <div style={{ marginLeft: '10px' }} onClick={(e) => e.stopPropagation()}>
          {copySlot}
        </div>
      </div>
      <div id={panelBodyId} className="co-panel-body">
        <div className="co-panel-body-inner">
          {children}
        </div>
      </div>
    </div>
  );
}
