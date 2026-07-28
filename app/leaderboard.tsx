'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { CompanyScore } from '@/lib/scores';

interface LeaderboardProps {
  companies: CompanyScore[];
  categories: string[];
}

const PREVIEW_COUNT = 5;

function scoreColor(s: number): string {
  if (s >= 90) return '#00ff66';
  if (s >= 80) return '#ccff44';
  if (s >= 70) return '#ffcc00';
  if (s >= 60) return '#ff8800';
  return '#ff4444';
}

function Favicon({ docsUrl, name }: { docsUrl: string; name: string }) {
  const [failed, setFailed] = useState(false);
  let host = '';
  try {
    host = new URL(docsUrl).hostname;
  } catch {
    // fall through to letter tile
  }

  if (failed || !host) {
    return <span className="lb-favicon lb-favicon-fallback">{name.charAt(0).toUpperCase()}</span>;
  }

  return (
    <img
      className="lb-favicon"
      src={`https://www.google.com/s2/favicons?domain=${host}&sz=64`}
      alt=""
      width={20}
      height={20}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export default function Leaderboard({ companies, categories }: LeaderboardProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const passing = companies.filter(c => c.score >= 80).length;

  const toggle = (cat: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="lb-header">
        <div className="lb-header-top">
          <div className="lb-header-left">
            <h2 className="lb-title">Agent score directory</h2>
            <p className="lb-subtitle">How the top API documentation sites score on agent-readiness</p>
          </div>
          <div className="lb-header-stats">
            <div className="lb-stat">
              <span className="lb-stat-num">{companies.length}</span>
              <span className="lb-stat-label">companies scored</span>
            </div>
            <div className="lb-stat">
              <span className="lb-stat-num">{passing}</span>
              <span className="lb-stat-label">passing (80+)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of category panels */}
      <div className="lb-cat-grid">
        {categories.map((cat) => {
          const items = companies.filter(c => c.category === cat);
          if (items.length === 0) return null;
          const isOpen = expanded.has(cat);
          const visible = isOpen ? items : items.slice(0, PREVIEW_COUNT);
          return (
            <div className="lb-panel" key={cat}>
              <div className="lb-panel-title">{cat}</div>
              <div className="lb-panel-rows">
                {visible.map((c, i) => (
                  <Link href={`/agent-score/company/${c.slug}`} className="lb-row" key={c.slug}>
                    <span className="lb-row-rank">{i + 1}</span>
                    <Favicon docsUrl={c.docsUrl} name={c.name} />
                    <span className="lb-row-name">{c.name}</span>
                    <span className="lb-row-result" style={{ color: scoreColor(c.score) }}>
                      <span className="lb-row-score">{c.score}</span>
                      <span className="lb-row-grade">{c.grade}</span>
                    </span>
                  </Link>
                ))}
              </div>
              {items.length > PREVIEW_COUNT && (
                <button className="lb-panel-more" onClick={() => toggle(cat)}>
                  {isOpen ? 'Show less' : `View all ${items.length}`}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
