export type { Grade, ScoreCap, CheckResult } from 'afdocs';
export { toGrade } from 'afdocs';

import { computeScore as afdocsComputeScore } from 'afdocs';
import type { CheckResult, Grade, ScoreCap } from 'afdocs';

export interface ScoreResult {
  overall: number;
  grade: Grade;
  cap?: ScoreCap;
  categoryScores: Record<string, number>;
}

export function computeScore(results: CheckResult[]): ScoreResult {
  const counts = { pass: 0, warn: 0, fail: 0, skip: 0, error: 0 };
  for (const r of results) {
    if (r.status in counts) counts[r.status as keyof typeof counts]++;
  }

  const report = {
    url: '',
    timestamp: new Date().toISOString(),
    specUrl: '',
    results,
    summary: { total: results.length, ...counts },
  };

  const scored = afdocsComputeScore(report);

  const categoryScores: Record<string, number> = {};
  for (const [cat, val] of Object.entries(scored.categoryScores)) {
    categoryScores[cat] = typeof val === 'number' ? val : (val.score ?? 0);
  }

  return { overall: scored.overall, grade: scored.grade, cap: scored.cap, categoryScores };
}
