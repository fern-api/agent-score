'use client';

import { useState } from 'react';
import type { CheckResult } from '@/lib/scores';

function barColor(score: number) {
  if (score >= 70) return 'green';
  if (score >= 50) return 'yellow';
  return 'red';
}

function StatusIcon({ status }: { status: string }) {
  const cls = `check-icon ${status === 'error' ? 'fail' : status}`;
  if (status === 'pass')
    return (
      <svg className={cls} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    );
  if (status === 'warn')
    return (
      <svg className={cls} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    );
  if (status === 'fail' || status === 'error')
    return (
      <svg className={cls} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    );
  return (
    <svg className={cls} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
    </svg>
  );
}

function formatCheckId(id: string): string {
  return id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
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

function categoryPriority(items: CheckResult[]): number {
  const hasFail = items.some((r) => r.status === 'fail' || r.status === 'error');
  const hasWarn = items.some((r) => r.status === 'warn');
  if (hasFail) return 0;
  if (hasWarn) return 1;
  return 2;
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
        return (
          <div key={cat.name} className={`check-group${isOpen ? ' open' : ''}`}>
            <div className="check-group-header" onClick={() => toggle(cat.name)}>
              <span className="check-group-name">{cat.name}</span>
              <span className="check-group-count">{cat.meta}</span>
              <div className="check-group-bar">
                <div className="category-bar-track">
                  <div
                    className={`category-bar-fill ${barColor(cat.score)} animated`}
                    style={{ '--bar-target': `${cat.score}%` } as React.CSSProperties}
                  />
                </div>
              </div>
              <span className="category-score">{cat.score}</span>
              <svg className="check-group-chevron" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 8l5 5 5-5" />
              </svg>
            </div>
            <div className="check-group-body">
              <div className="check-group-body-inner">
                {items.map((item, i) => (
                  <div key={item.id + i} className={`check-row${isOpen ? ' visible' : ''}`}>
                    <StatusIcon status={item.status} />
                    <div className="check-info">
                      <div className="check-name">{formatCheckId(item.id)}</div>
                      <div className="check-result">{item.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
