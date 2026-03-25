'use client';

import { useState } from 'react';
import type { CheckResult } from '@/lib/scores';
import '../company.css';

function StatusCell({ status }: { status: string }) {
  if (status === 'pass') return <span className="v3-status-pass">[PASS]</span>;
  if (status === 'warn') return <span className="v3-status-warn">[WARN]</span>;
  if (status === 'fail' || status === 'error') return <span className="v3-status-fail">[FAIL]</span>;
  return <span className="v3-status-skip">[SKIP]</span>;
}

function formatCheckId(id: string): string {
  return id.replace(/-/g, '_').toUpperCase();
}

function buildGroups(results: CheckResult[]) {
  const map = new Map<string, CheckResult[]>();
  for (const r of results) {
    if (!map.has(r.category)) map.set(r.category, []);
    map.get(r.category)!.push(r);
  }
  return Array.from(map.entries()).map(([category, items]) => {
    const passed = items.filter((i) => i.status === 'pass').length;
    const warned = items.filter((i) => i.status === 'warn').length;
    const failed = items.filter((i) => i.status === 'fail' || i.status === 'error').length;
    let summary = `${passed}/${items.length} PASS`;
    if (warned > 0) summary += `, ${warned} WARN`;
    if (failed > 0) summary += `, ${failed} FAIL`;
    return { category, items, summary };
  });
}

export default function CheckGroups({ results }: { results: CheckResult[] }) {
  const groups = buildGroups(results);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  function toggle(category: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }

  return (
    <div>
      {groups.map(({ category, items, summary }) => {
        const isOpen = openGroups.has(category);
        return (
          <div key={category} className={`v3-check-group${isOpen ? ' open' : ''}`}>
            <div className="v3-check-group-header" onClick={() => toggle(category)}>
              <span className="v3-check-group-name">{category.toUpperCase()}</span>
              <span className="v3-check-group-count">{summary}</span>
              <span className="v3-check-group-toggle">{isOpen ? '[-]' : '[+]'}</span>
            </div>
            <div className="v3-check-group-body">
              {items.map((item, i) => (
                <div key={item.id + i} className="v3-check-row">
                  <span className="v3-check-idx">{String(i + 1).padStart(2, '0')}</span>
                  <div className="v3-check-status-cell">
                    <StatusCell status={item.status} />
                  </div>
                  <div className="v3-check-info">
                    <div className="v3-check-name">{formatCheckId(item.id)}</div>
                    <div className="v3-check-result">{item.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
