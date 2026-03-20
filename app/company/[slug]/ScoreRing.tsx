const GRADE_COLORS: Record<string, string> = {
  'A+': 'var(--color-accent)',
  'A':  'var(--color-accent)',
  'B':  '#eab308',
  'C':  '#f97316',
  'D':  '#ef4444',
  'F':  '#888888',
};

interface ScoreRingProps {
  score: number;
  grade: string;
}

export default function ScoreRing({ score, grade }: ScoreRingProps) {
  const ringTarget = ((1 - score / 100) * 565.48).toFixed(2);
  const ringColor = GRADE_COLORS[grade] ?? 'var(--color-accent)';

  return (
    <div className="score-ring-wrapper">
      <svg className="score-ring-svg" viewBox="0 0 200 200">
        <circle className="score-ring-bg" cx="100" cy="100" r="90" />
        <circle
          className="score-ring-fill animated"
          cx="100"
          cy="100"
          r="90"
          style={{ '--ring-target': ringTarget, stroke: ringColor } as React.CSSProperties}
        />
      </svg>
      <span className="score-number">{score}</span>
    </div>
  );
}
