interface ScoreRingProps {
  score: number;
  grade: string;
}

function scoreColorClass(score: number): string {
  if (score >= 80) return 'score-color-hi';
  if (score >= 65) return 'score-color-good';
  if (score >= 45) return 'score-color-mid';
  if (score >= 30) return 'score-color-low';
  return 'score-color-fail';
}

export default function ScoreRing({ score, grade }: ScoreRingProps) {
  const colorCls = scoreColorClass(score);

  return (
    <div className="score-display">
      <div className={`score-big-number ${colorCls}`}>{score}</div>
      <div className="score-out-of">// OUT_OF_100</div>
      <div className="score-grade-badge">GRADE_{grade}</div>
    </div>
  );
}
