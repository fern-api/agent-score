'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CompanyScore } from '@/lib/scores';

interface LeaderboardProps {
  companies: CompanyScore[];
  categories: string[];
}

function gradeClass(grade: string): string {
  if (grade === 'A+') return 'grade-a-plus';
  if (grade === 'A') return 'grade-a';
  if (grade === 'B') return 'grade-b';
  if (grade === 'C') return 'grade-c';
  if (grade === 'D') return 'grade-d';
  return 'grade-f';
}

function tierCardClass(score: number): string {
  if (score >= 90) return 'card-certified';
  if (score >= 70) return 'card-ready';
  if (score >= 50) return 'card-improving';
  return 'card-needs-work';
}

function getWeakestCategory(company: CompanyScore): string | null {
  if (!company.results || company.results.length === 0) return null;
  const catScores: Record<string, { pass: number; total: number }> = {};
  for (const r of company.results) {
    if (!catScores[r.category]) catScores[r.category] = { pass: 0, total: 0 };
    catScores[r.category].total++;
    if (r.status === 'pass') catScores[r.category].pass++;
  }
  let weakest = '';
  let lowestRatio = Infinity;
  for (const [cat, data] of Object.entries(catScores)) {
    const ratio = data.total > 0 ? data.pass / data.total : 0;
    if (ratio < lowestRatio) {
      lowestRatio = ratio;
      weakest = cat;
    }
  }
  return weakest || null;
}

function getCategoryDot(company: CompanyScore, category: string): 'pass' | 'warn' | 'fail' {
  if (!company.results) return company.score >= 70 ? 'pass' : company.score >= 50 ? 'warn' : 'fail';
  const checks = company.results.filter((r) => r.category.toLowerCase() === category.toLowerCase());
  if (checks.length === 0) return 'pass';
  const allPass = checks.every((c) => c.status === 'pass');
  const anyFail = checks.some((c) => c.status === 'fail');
  if (allPass) return 'pass';
  if (anyFail) return 'fail';
  return 'warn';
}

const GRADE_ORDER = ['A+', 'A', 'B', 'C', 'D', 'F'];

const GRADE_LABELS: Record<string, string> = {
  'A+': 'Exceptional',
  'A': 'Agent-ready',
  'B': 'Good',
  'C': 'Improving',
  'D': 'Needs work',
  'F': 'Not ready',
};

function gradeTierClass(grade: string): string {
  if (grade === 'A+') return 'tier-badge-grade-a-plus';
  if (grade === 'A') return 'tier-badge-grade-a';
  if (grade === 'B') return 'tier-badge-grade-b';
  if (grade === 'C') return 'tier-badge-grade-c';
  if (grade === 'D') return 'tier-badge-grade-d';
  return 'tier-badge-grade-f';
}

export default function Leaderboard({ companies, categories }: LeaderboardProps) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [view, setView] = useState<'directory' | 'table'>('directory');
  const router = useRouter();

  const filtered = activeFilter === 'All'
    ? companies
    : companies.filter((c) => c.category === activeFilter);

  const gradeSegments = GRADE_ORDER
    .map((g) => ({ grade: g, companies: filtered.filter((c) => c.grade === g) }))
    .filter((seg) => seg.companies.length > 0);

  const tableCategories = ['llms.txt', 'Markdown', 'Page Size', 'Structure', 'URL Stability', 'Auth'];

  return (
    <div>
      {/* Toolbar: scrollable filters (left) + view icon toggle (right) */}
      <div className="leaderboard-toolbar">
        <div className="leaderboard-filters">
          <button
            className={`filter-tab${activeFilter === 'All' ? ' active' : ''}`}
            onClick={() => setActiveFilter('All')}
          >
            All
          </button>
          {(() => {
            const categoryCounts = companies.reduce((acc, c) => {
              acc[c.category] = (acc[c.category] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);
            const visibleCategories = categories.filter((cat) => categoryCounts[cat] >= 4);
            return visibleCategories.map((cat) => (
              <button
                key={cat}
                className={`filter-tab${activeFilter === cat ? ' active' : ''}`}
                onClick={() => setActiveFilter(cat)}
              >
                {cat}
              </button>
            ));
          })()}
        </div>
        <div className="leaderboard-view-toggle">
          <button
            className={`view-icon-btn${view === 'directory' ? ' active' : ''}`}
            onClick={() => setView('directory')}
            aria-label="Grid view"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="0" stroke="currentColor" strokeWidth="1.5" />
              <rect x="9" y="1" width="6" height="6" rx="0" stroke="currentColor" strokeWidth="1.5" />
              <rect x="1" y="9" width="6" height="6" rx="0" stroke="currentColor" strokeWidth="1.5" />
              <rect x="9" y="9" width="6" height="6" rx="0" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
          <button
            className={`view-icon-btn${view === 'table' ? ' active' : ''}`}
            onClick={() => setView('table')}
            aria-label="Table view"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <line x1="1" y1="4" x2="15" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="1" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="1" y1="12" x2="15" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Directory view — segmented by grade */}
      {view === 'directory' && (
        <div className="directory-view">
          {gradeSegments.map(({ grade, companies: gradeCompanies }) => (
            <div key={grade} className="tier-section cards-visible">
              <div className="tier-header">
                <h3 className={`tier-name ${gradeTierClass(grade)}`}>
                  Grade {grade}
                  <span className="tier-grade-desc">{GRADE_LABELS[grade]}</span>
                </h3>
              </div>
              <div className="tier-grid-compact">
                {gradeCompanies.map((company) => {
                  const rank = filtered.indexOf(company) + 1;
                  return (
                    <div
                      key={company.slug}
                      className={`company-card ${tierCardClass(company.score)}`}
                      onClick={() => router.push(`/company/${company.slug}`)}
                    >
                      <div className="card-top-row">
                        <span className="card-company-name">
                          <span className="card-rank">#{rank}</span>
                          {company.name}
                        </span>
                        <span className="card-score">{company.score}</span>
                      </div>
                      <div className="card-bottom-row">
                        <span className={`card-grade ${gradeClass(company.grade)}`}>{company.grade}</span>
                        <div className="card-checks">
                          {company.checks.warn > 0 && (
                            <span className="check-badge check-badge-warn">{company.checks.warn}</span>
                          )}
                          {company.checks.fail > 0 && (
                            <span className="check-badge check-badge-fail">{company.checks.fail}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="leaderboard-empty">No companies found in this category.</p>
          )}
        </div>
      )}

      {/* Table view */}
      {view === 'table' && (
        <div className="table-view visible">
          <div className="leaderboard-table-wrapper">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Company</th>
                  <th>Score</th>
                  <th>Grade</th>
                  {tableCategories.map((cat) => (
                    <th key={cat} className="center">{cat}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((company, i) => (
                  <tr
                    key={company.slug}
                    style={{ cursor: 'pointer' }}
                    onClick={() => router.push(`/company/${company.slug}`)}
                  >
                    <td className="rank-cell">{i + 1}</td>
                    <td className="company-cell">{company.name}</td>
                    <td className="score-cell">{company.score}</td>
                    <td className={`grade-cell ${gradeClass(company.grade)}`}>{company.grade}</td>
                    {tableCategories.map((cat) => {
                      const dot = getCategoryDot(company, cat);
                      return (
                        <td key={cat} className="center">
                          <span className={`dot-${dot}`} />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="leaderboard-footer">
        Your docs aren&apos;t listed?{' '}
        <a href="#hero-checker">Check your score for free.</a>
      </p>
    </div>
  );
}
