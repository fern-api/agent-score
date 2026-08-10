/**
 * Re-scores all companies using stored check results from the RDS scores table.
 * Recomputes score/grade from stored results WITHOUT re-running network checks.
 * (Migrated off Supabase/PostgREST to RDS pg — FER-11415.)
 *
 * Run with:
 *   export $(grep -v '^#' .env.local | xargs) && npx tsx scripts/rescore-from-stored.ts
 */

import { computeScore } from '../lib/scoring';
import type { CheckResult } from '../lib/scoring';
import { query } from '../lib/db';

interface StoredRow {
  slug: string;
  name: string;
  score: number;
  grade: string;
  results: CheckResult[] | null;
}

async function main() {
  console.log('Fetching all scores with stored results...');
  const { rows } = await query<StoredRow>(
    `SELECT slug, name, score, grade, results FROM public.scores ORDER BY score DESC`
  );
  console.log(`Found ${rows.length} rows.\n`);

  let updated = 0;
  let unchanged = 0;
  let skipped = 0;

  for (const row of rows) {
    if (!row.results || row.results.length === 0) {
      console.log(`  skip     ${row.slug} — no stored results`);
      skipped++;
      continue;
    }

    // Exclude llms-txt-valid when the only issue is a missing blockquote (matches route.ts logic)
    const scorableResults = row.results.filter(
      (r) => !(r.id === 'llms-txt-valid' && r.message?.includes('No blockquote summary found'))
    );

    const scored = computeScore(scorableResults);
    const newScore = scored.overall;
    const newGrade = scored.grade;

    if (newScore === row.score && newGrade === row.grade) {
      console.log(`  skip     ${row.name.padEnd(35)} ${row.score} ${row.grade} (unchanged)`);
      unchanged++;
      continue;
    }

    try {
      await query(`UPDATE public.scores SET score = $1, grade = $2 WHERE slug = $3`, [newScore, newGrade, row.slug]);
      const arrow = `${String(row.score).padStart(3)} ${row.grade.padEnd(2)} → ${String(newScore).padStart(3)} ${newGrade}`;
      console.log(`  updated  ${row.name.padEnd(35)} ${arrow}`);
      updated++;
    } catch (err) {
      console.error(`  ERROR    ${row.slug}:`, err instanceof Error ? err.message : err);
    }
  }

  console.log(`\nDone. ${updated} updated, ${unchanged} unchanged, ${skipped} skipped (no results).`);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
