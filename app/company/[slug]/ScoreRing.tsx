'use client';

import { useEffect, useRef } from 'react';
import { scoreColor } from '@/lib/gradeColors';

interface ScoreRingProps {
  score: number;
  grade: string;
}

export default function ScoreRing({ score, grade }: ScoreRingProps) {
  const circleRef = useRef<SVGCircleElement>(null);

  const size = 160;
  const strokeWidth = 8;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const color = scoreColor(score);

  useEffect(() => {
    const el = circleRef.current;
    if (!el) return;
    // Start fully hidden, then animate to final offset
    el.style.strokeDashoffset = String(circumference);
    el.style.transition = 'none';
    // Force reflow
    void el.getBoundingClientRect();
    el.style.transition = 'stroke-dashoffset 0.9s cubic-bezier(0.4, 0, 0.2, 1)';
    el.style.strokeDashoffset = String(offset);
  }, [circumference, offset]);

  return (
    <div className="co-score-ring-wrap">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="co-score-ring-svg"
        role="img"
        aria-label={`Score: ${score} out of 100, grade ${grade}`}
      >
        <title>{`Score: ${score} out of 100, grade ${grade}`}</title>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        {/* Fill arc */}
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
        />
        {/* Score number */}
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          fontSize="64"
          fontFamily="'Geist Mono', 'Courier New', monospace"
          fontWeight="500"
        >
          {score}
        </text>
      </svg>
    </div>
  );
}
