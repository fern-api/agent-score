'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { CompanyScore } from '@/lib/scores';

interface LeaderboardProps {
  companies: CompanyScore[];
  categories: string[];
}

const PANEL_SIZE = 5;

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
    // fall back to the letter tile
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
  const [view, setView] = useState<'categories' | 'all'>('categories');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? companies
    : companies.filter(c => c.category === activeCategory);

  const passing = companies.filter(c => c.score >= 80).length;

  const panels = categories
    .map(cat => ({ cat, items: companies.filter(c => c.category === cat) }))
    .filter(p => p.items.length > 0)
    .sort((a, b) => {
      if (a.cat === 'Other') return 1;
      if (b.cat === 'Other') return -1;
      return b.items.length - a.items.length;
    });

  const openFull = (cat: string) => {
    setActiveCategory(cat);
    setView('all');
    document.getElementById('leaderboard')?.scrollIntoView({ behavior: 'smooth' });
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
        {view === 'all' && (
          <div className="lb-toolbar">
            <div className="lb-filters">
              {['All', ...categories].map(cat => (
                <button
                  key={cat}
                  className={`filter-tab${activeCategory === cat ? ' active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {view === 'categories' ? (
        <>
          {/* Top companies per category */}
          <div className="lb-cat-grid">
            {panels.map(({ cat, items }) => (
              <div className="lb-panel" key={cat}>
                <button className="lb-panel-title" onClick={() => openFull(cat)}>
                  <span>{cat}</span>
                  <span className="lb-panel-count">{items.length}</span>
                </button>
                <div className="lb-panel-rows">
                  {items.slice(0, PANEL_SIZE).map((c, i) => (
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
              </div>
            ))}
          </div>
          <div className="lb-view-toggle">
            <button className="lb-view-toggle-btn" onClick={() => openFull('All')}>
              View full leaderboard <span aria-hidden>&rarr;</span>
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Full grid grouped by grade */}
          {(['A+', 'A', 'B', 'C', 'D', 'F'] as const).map((grade) => {
            const gradeLabels: Record<string, string> = {
              'A+': 'Exceptional',
              'A':  'Agent-Ready',
              'B':  'Good',
              'C':  'Improving',
              'D':  'Needs Work',
              'F':  'Not Agent Supported',
            };
            const gradeItems = filtered.filter(c => c.grade === grade);
            if (gradeItems.length === 0) return null;
            return (
              <div key={grade}>
                <div className="lb-grade-section">
                  <span className="lb-grade-label" style={{ color: scoreColor(gradeItems[0].score) }}>
                    Grade {grade}:
                  </span>
                  <span className="lb-grade-desc">{gradeLabels[grade]}</span>
                </div>
                <div className="lb-grid">
                  {gradeItems.map((c) => (
                    <Link href={`/agent-score/company/${c.slug}`} className="lb-item" key={c.slug}>
                      <span className="lb-info">
                        <span className="lb-name">{c.name}</span>
                        <span className="lb-cat">{c.category}</span>
                      </span>
                      <span className="lb-score" style={{ color: scoreColor(c.score) }}>
                        {c.score}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
          <div className="lb-view-toggle">
            <button
              className="lb-view-toggle-btn"
              onClick={() => {
                setView('categories');
                document.getElementById('leaderboard')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span aria-hidden>&larr;</span> Back to top by category
            </button>
          </div>
        </>
      )}
    </div>
  );
}
