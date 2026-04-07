'use client';

import Link from 'next/link';
import GradeBadge from './GradeBadge';
import ScoreBar from './ScoreBar';

export interface Company {
  rank: number;
  name: string;
  slug: string;
  category: string;
  score: number;
  grade: string;
}

interface CompanyCardProps {
  company: Company;
}

export default function CompanyCard({ company }: CompanyCardProps) {
  return (
    <Link
      href={`/agent-score/company/${company.slug}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        borderRadius: 0,
        border: '1px solid rgba(0, 232, 123, 0.12)',
        background: 'var(--color-bg)',
        padding: '14px 16px',
        textDecoration: 'none',
        transition: 'all 0.2s ease',
        position: 'relative',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = 'rgba(0, 232, 123, 0.25)';
        el.style.background = 'rgba(0, 232, 123, 0.02)';
        el.style.boxShadow = '0 0 20px rgba(0, 232, 123, 0.06)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = 'rgba(0, 232, 123, 0.12)';
        el.style.background = 'var(--color-bg)';
        el.style.boxShadow = 'none';
      }}
    >
      {/* Rank */}
      <span
        style={{
          fontFamily: "'Geist Mono', 'SF Mono', monospace",
          fontSize: '13px',
          color: 'var(--color-text-muted)',
          width: '32px',
          textAlign: 'right',
          flexShrink: 0,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {company.rank}
      </span>

      {/* Company name */}
      <span
        style={{
          fontFamily: "'Geist Mono', 'SF Mono', monospace",
          fontWeight: 600,
          color: 'var(--color-text-heading)',
          width: '144px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {company.name}
      </span>

      {/* Category badge */}
      <span
        className="hidden sm:inline-flex"
        style={{
          fontFamily: "'Geist Mono', 'SF Mono', monospace",
          fontSize: '12px',
          fontWeight: 500,
          padding: '3px 10px',
          borderRadius: 0,
          border: '1px solid rgba(255, 255, 255, 0.06)',
          color: 'var(--fg-mid)',
          background: 'transparent',
          flexShrink: 0,
        }}
      >
        {company.category}
      </span>

      {/* Score bar — fills remaining space */}
      <div className="flex-1 hidden md:block">
        <ScoreBar score={company.score} showLabel={false} height="sm" />
      </div>

      {/* Score number */}
      <span
        style={{
          fontFamily: "'Geist Mono', 'SF Mono', monospace",
          fontSize: '14px',
          fontWeight: 500,
          color: 'var(--color-text-primary)',
          width: '32px',
          textAlign: 'right',
          fontVariantNumeric: 'tabular-nums',
          flexShrink: 0,
        }}
      >
        {company.score}
      </span>

      {/* Grade badge */}
      <GradeBadge grade={company.grade} size="sm" />
    </Link>
  );
}
