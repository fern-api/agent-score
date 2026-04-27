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

/**
 * Convert afdocs's `categoryScores` map (whose values may be either a plain
 * number or a `CategoryScore` object since v0.16, with `score: number | null`
 * since v0.17) into a flat numeric map.
 *
 * Categories whose score is `null` (all checks were `notApplicable` because
 * fewer than 5 pages were sampled — see v0.17 migration guide) are dropped
 * from the map. Downstream consumers fall back to local calculation when a
 * category is missing.
 */
export function normalizeCategoryScores(
  raw: Record<string, number | { score: number | null }>,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [cat, val] of Object.entries(raw)) {
    const num = typeof val === 'number' ? val : val.score;
    if (num !== null && num !== undefined) out[cat] = num;
  }
  return out;
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

  return {
    overall: scored.overall,
    grade: scored.grade,
    cap: scored.cap,
    categoryScores: normalizeCategoryScores(
      scored.categoryScores as Record<string, number | { score: number | null }>,
    ),
  };
}
