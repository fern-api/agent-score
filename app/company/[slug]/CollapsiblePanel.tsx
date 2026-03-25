'use client';

import { useState } from 'react';
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

  return (
    <div className={`v3-panel${open ? ' panel-open' : ''}`}>
      <div
        className="v3-panel-header"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="v3-panel-title">// {title.toUpperCase()}</span>
        <div className="v3-panel-header-right">
          <div onClick={(e) => e.stopPropagation()}>
            {copySlot}
          </div>
          <span className="v3-panel-toggle">{open ? '[-]' : '[+]'}</span>
        </div>
      </div>
      <div className="v3-panel-body">
        <div className="v3-panel-body-inner">
          {children}
        </div>
      </div>
    </div>
  );
}
