'use client';
import { useState } from 'react';

export default function ViewToggle() {
  const [mode, setMode] = useState<'simple' | 'unabridged'>('simple');

  return (
    <>
      <div className="view-toggle-wrapper">
        <div className="view-toggle">
          <button
            className={`view-toggle-btn${mode === 'simple' ? ' active' : ''}`}
            onClick={() => setMode('simple')}
          >
            Simple
          </button>
          <button
            className={`view-toggle-btn${mode === 'unabridged' ? ' active' : ''}`}
            onClick={() => setMode('unabridged')}
          >
            Unabridged
          </button>
        </div>
      </div>

      {mode === 'simple' && (
        <style>{`
          .content-section { display: none; }
          .content-section[data-section="section-1"],
          .content-section[data-section="section-16"],
          .content-section[data-section="section-20"],
          .content-section[data-section="section-22"],
          .content-section[data-section="section-23"] { display: block; }
          .toc-list li { display: none; }
          .toc-list li[data-toc="section-1"],
          .toc-list li[data-toc="section-16"],
          .toc-list li[data-toc="section-20"],
          .toc-list li[data-toc="section-22"],
          .toc-list li[data-toc="section-23"] { display: block; }
        `}</style>
      )}
    </>
  );
}
