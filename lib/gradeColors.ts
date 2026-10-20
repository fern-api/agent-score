/**
 * Canonical score → color mapping.
 * Used by ScoreRing, company page, and the OG image generator
 * so colors stay in sync everywhere.
 */
export function scoreColor(score: number): string {
  if (score >= 90) return '#00e87b';
  if (score >= 80) return '#ccff44';
  if (score >= 70) return '#ffcc00';
  if (score >= 60) return '#ff8800';
  return '#ff4444';
}

/** Theme-aware CSS variable for the same thresholds (use in DOM styles, not images/canvas). */
export function scoreColorVar(score: number): string {
  if (score >= 90) return 'var(--score-a-alt)';
  if (score >= 80) return 'var(--score-b)';
  if (score >= 70) return 'var(--score-c)';
  if (score >= 60) return 'var(--score-d)';
  return 'var(--score-f)';
}

/** Dark tinted background for grade badges, keyed to the same thresholds. */
export function scoreBg(score: number): string {
  if (score >= 90) return '#0d1f15';
  if (score >= 80) return '#1a2000';
  if (score >= 70) return '#1f1c00';
  if (score >= 60) return '#1f1200';
  return '#1f0d0d';
}
