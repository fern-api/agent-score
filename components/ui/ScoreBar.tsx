'use client';

interface ScoreBarProps {
  score: number;
  showLabel?: boolean;
  height?: 'sm' | 'md';
}

function getBarColor(score: number): string {
  if (score >= 90) return '#00e87b';
  if (score >= 80) return '#ccff44';
  if (score >= 70) return '#ffcc00';
  if (score >= 60) return '#ff8800';
  return '#ff4444';
}

function getBarGlow(score: number): string {
  if (score >= 90) return '0 0 8px rgba(0, 232, 123, 0.3)';
  if (score >= 80) return '0 0 8px rgba(204, 255, 68, 0.3)';
  if (score >= 70) return '0 0 8px rgba(255, 204, 0, 0.3)';
  if (score >= 60) return '0 0 8px rgba(255, 136, 0, 0.3)';
  return '0 0 8px rgba(255, 68, 68, 0.3)';
}

export default function ScoreBar({ score, showLabel = true, height = 'md' }: ScoreBarProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const barColor = getBarColor(clamped);
  const glow = getBarGlow(clamped);
  const h = height === 'sm' ? '6px' : '10px';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
      <div
        style={{
          flex: 1,
          height: h,
          borderRadius: 0,
          background: 'rgba(255, 255, 255, 0.05)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: h,
            borderRadius: 0,
            background: barColor,
            boxShadow: glow,
            width: `${clamped}%`,
            transition: 'width 0.7s ease-out',
          }}
        />
      </div>
      {showLabel && (
        <span
          style={{
            fontFamily: "'Geist Mono', 'SF Mono', monospace",
            fontSize: '14px',
            color: 'var(--color-text-primary)',
            width: '32px',
            textAlign: 'right',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {clamped}
        </span>
      )}
    </div>
  );
}
