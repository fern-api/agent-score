'use client';

import { useState } from 'react';
import type { CheckResult } from '@/lib/scores';
import '../company.css';

function barColor(score: number): string {
  if (score >= 90) return '#00e87b';
  if (score >= 80) return '#ccff44';
  if (score >= 70) return '#ffcc00';
  if (score >= 60) return '#ff8800';
  return '#ff4444';
}

function dotColor(status: string): string {
  if (status === 'pass') return '#00e87b';
  if (status === 'warn') return '#ffcc00';
  if (status === 'fail' || status === 'error') return '#ff4444';
  return 'var(--fg-dim)';
}

function formatCategoryName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

function formatCheckId(id: string): string {
  return id.toLowerCase().replace(/_/g, '-');
}

const CHECK_CATEGORY_SLUG: Record<string, string> = {
  // Content Discoverability
  'llms-txt-exists':         'content-discoverability',
  'llms-txt-valid':          'content-discoverability',
  'llms-txt-size':           'content-discoverability',
  'llms-txt-links-resolve':  'content-discoverability',
  'llms-txt-links-markdown': 'content-discoverability',
  'llms-txt-directive-html': 'content-discoverability',
  'llms-txt-directive-md':   'content-discoverability',
  // Markdown Availability
  'markdown-url-support':    'markdown-availability',
  'content-negotiation':     'markdown-availability',
  // Page Size
  'rendering-strategy':      'page-size',
  'page-size-markdown':      'page-size',
  'page-size-html':          'page-size',
  'content-start-position':  'page-size',
  // Content Structure
  'tabbed-content-serialization': 'content-structure',
  'section-header-quality':       'content-structure',
  'markdown-code-fence-validity': 'content-structure',
  // URL Stability
  'http-status-codes':  'url-stability',
  'redirect-behavior':  'url-stability',
  // Observability
  'llms-txt-coverage':       'observability',
  'markdown-content-parity': 'observability',
  'cache-header-hygiene':    'observability',
  // Authentication
  'auth-gate-detection':      'authentication',
  'auth-alternative-access':  'authentication',
};

function checkDocsUrl(id: string): string | null {
  const slug = CHECK_CATEGORY_SLUG[formatCheckId(id)];
  if (!slug) return null;
  return `https://afdocs.dev/checks/${slug}#${formatCheckId(id)}`;
}

interface Category {
  name: string;
  score: number;
  meta: string;
}

interface Props {
  categories: Category[];
  results: CheckResult[];
  categoryScores?: Record<string, number>;
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

function calcCategoryScore(items: CheckResult[]): number {
  const scorable = items.filter(r => r.status !== 'skip' && r.status !== 'error');
  if (scorable.length === 0) return 0;
  const pass = scorable.filter(r => r.status === 'pass').length;
  const warn = scorable.filter(r => r.status === 'warn').length;
  return Math.round(((pass + warn * 0.5) / scorable.length) * 100);
}

export default function CategoryCheckGroups({ categories, results, categoryScores }: Props) {
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
        const score = categoryScores?.[cat.name] ?? calcCategoryScore(items);
        const passCount = items.filter(r => r.status === 'pass').length;
        const warnCount = items.filter(r => r.status === 'warn').length;
        const failCount = items.filter(r => r.status === 'fail' || r.status === 'error').length;

        const bodyId = `check-group-body-${formatCategoryName(cat.name)}`;

        return (
          <div key={cat.name} className={`co-check-group${isOpen ? ' open' : ''}`}>
            <button
              className="co-check-group-header"
              aria-expanded={isOpen}
              aria-controls={bodyId}
              onClick={() => toggle(cat.name)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggle(cat.name);
                }
              }}
            >
              <div className="co-check-group-name-wrap">
                <span className="co-check-group-name">{formatCategoryName(cat.name)}</span>
                <span className="co-check-group-count">
                  {passCount} passed{warnCount > 0 ? ` / ${warnCount} warnings` : ''}{failCount > 0 ? ` / ${failCount} failed` : ''}
                </span>
              </div>
              <div className="co-check-group-bar-track">
                <div
                  className="co-check-group-bar-fill"
                  style={{ width: `${score}%`, background: barColor(score) }}
                />
              </div>
              <span className="co-check-group-score">{score}</span>
              <span className={`co-check-group-chevron${isOpen ? ' open' : ''}`} aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6,4 10,8 6,12"/>
                </svg>
              </span>
            </button>
            <div id={bodyId} className="co-check-group-body">
              {items.map((item, i) => {
                const docsUrl = checkDocsUrl(item.id);
                return (
                  <div key={item.id + i} className="co-check-item">
                    <span
                      className="co-check-item-dot"
                      style={{ background: dotColor(item.status) }}
                      aria-label={item.status === 'pass' ? 'Pass' : item.status === 'warn' ? 'Warning' : item.status === 'fail' || item.status === 'error' ? 'Fail' : 'Skip'}
                      role="img"
                    />
                    <span className="co-check-item-id">{formatCheckId(item.id)}</span>
                    <span className="co-check-item-msg">{item.message}</span>
                    {docsUrl && (
                      <a
                        href={docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="co-check-item-learn"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Learn more
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
