'use client';

import { useState } from 'react';
import type { CheckResult } from '@/lib/scores';
import '../company.css';

function scoreColorHex(score: number): string {
  if (score >= 80) return '#00ff66';
  if (score >= 65) return '#ccff44';
  if (score >= 45) return '#ffcc00';
  if (score >= 30) return '#ff8800';
  return '#ff4444';
}

function scoreColorClass(score: number): string {
  if (score >= 80) return 'score-color-hi';
  if (score >= 65) return 'score-color-good';
  if (score >= 45) return 'score-color-mid';
  if (score >= 30) return 'score-color-low';
  return 'score-color-fail';
}

function StatusCell({ status }: { status: string }) {
  if (status === 'pass') return <span className="v3-status-pass">[PASS]</span>;
  if (status === 'warn') return <span className="v3-status-warn">[WARN]</span>;
  if (status === 'fail' || status === 'error') return <span className="v3-status-fail">[FAIL]</span>;
  return <span className="v3-status-skip">[SKIP]</span>;
}

function formatCheckId(id: string): string {
  return id.replace(/-/g, '_').toUpperCase();
}

interface Category {
  name: string;
  score: number;
  meta: string;
}

interface Props {
  categories: Category[];
  results: CheckResult[];
}

const STATUS_PRIORITY: Record<string, number> = { fail: 0, error: 0, warn: 1, pass: 2, skip: 3 };

function statusPriority(s: string) {
  return STATUS_PRIORITY[s] ?? 2;
}

function buildGroupMap(results: CheckResult[]) {
  const map = new Map<string, CheckResult[]>();
  for (const r of results) {
    if (!map.has(r.category)) map.set(r.category, []);
    map.get(r.category)!.push(r);
  }
  return map;
}

export default function CategoryCheckGroups({ categories, results }: Props) {
  const groupMap = buildGroupMap(results);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  function toggle(name: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  const sortedCategories = [...categories].sort((a, b) => a.score - b.score);

  return (
    <div>
      {sortedCategories.map((cat) => {
        const isOpen = openGroups.has(cat.name);
        const items = [...(groupMap.get(cat.name) || [])].sort(
          (a, b) => statusPriority(a.status) - statusPriority(b.status)
        );
        const colorClass = scoreColorClass(cat.score);
        const colorHex = scoreColorHex(cat.score);

        return (
          <div key={cat.name} className={`v3-check-group${isOpen ? ' open' : ''}`}>
            <div className="v3-check-group-header" onClick={() => toggle(cat.name)}>
              <span className="v3-check-group-name">{cat.name.toUpperCase()}</span>
              <span className="v3-check-group-count">{cat.meta.toUpperCase()}</span>
              <div
                className="v3-check-group-bar"
              >
                <div
                  className="v3-check-group-bar-fill"
                  style={
                    {
                      '--bar-width': `${cat.score}%`,
                      background: colorHex,
                    } as React.CSSProperties
                  }
                />
              </div>
              <span className={`v3-check-group-score ${colorClass}`}>{cat.score}</span>
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
