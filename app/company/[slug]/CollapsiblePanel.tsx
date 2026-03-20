'use client';

import { useState } from 'react';

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

  return (
    <div className={`exec-summary-block collapsible-panel${open ? ' panel-open' : ''}`}>
      <div
        className="exec-summary-header"
        onClick={() => setOpen((o) => !o)}
        style={{ cursor: 'pointer' }}
      >
        <span className="exec-summary-title">{title}</span>
        <div className="panel-header-right">
          <div className="panel-header-actions" onClick={(e) => e.stopPropagation()}>
            {copySlot}
          </div>
          <svg
            className="panel-chevron"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 8l5 5 5-5" />
          </svg>
        </div>
      </div>
      <div className="panel-body">
        {children}
      </div>
    </div>
  );
}
