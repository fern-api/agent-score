'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { CompanyScore } from '@/lib/scores';

interface LeaderboardProps {
  companies: CompanyScore[];
  categories: string[];
}

function scoreColor(s: number): string {
  if (s >= 80) return '#00ff66';
  if (s >= 65) return '#ccff44';
  if (s >= 45) return '#ffcc00';
  if (s >= 30) return '#ff8800';
  return '#ff4444';
}

export default function Leaderboard({ companies, categories }: LeaderboardProps) {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? companies
    : companies.filter(c => c.category === activeCategory);

  const passing = companies.filter(c => c.score >= 80).length;
  const avgScore = Math.round(companies.reduce((sum, c) => sum + c.score, 0) / companies.length);

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
            <div className="lb-stat">
              <span className="lb-stat-num">{avgScore}</span>
              <span className="lb-stat-label">average score</span>
            </div>
          </div>
        </div>
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
      </div>

      {/* Grid grouped by grade */}
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
                <Link href={`/company/${c.slug}`} className="lb-item" key={c.slug}>
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
    </div>
  );
}
