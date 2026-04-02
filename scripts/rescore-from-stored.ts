/**
 * Re-scores all companies using stored check results from Supabase.
 * Recomputes score/grade from stored results WITHOUT re-running network checks.
 *
 * Run with:
 *   export $(grep -v '^#' .env.local | xargs) && npx tsx scripts/rescore-from-stored.ts
 */

import { computeScore } from '../lib/scoring';
import type { CheckResult } from '../lib/scoring';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
  process.exit(1);
}

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
};

interface StoredRow {
  slug: string;
  name: string;
  score: number;
  grade: string;
  results: CheckResult[] | null;
}

async function main() {
  console.log('Fetching all scores with stored results...');
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/scores?select=slug,name,score,grade,results&order=score.desc`,
    { headers }
  );
  if (!res.ok) {
    console.error('Failed to fetch scores:', await res.text());
    process.exit(1);
  }

  const rows: StoredRow[] = await res.json();
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

    const patch = await fetch(
      `${SUPABASE_URL}/rest/v1/scores?slug=eq.${encodeURIComponent(row.slug)}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ score: newScore, grade: newGrade }),
      }
    );

    if (!patch.ok) {
      console.error(`  ERROR    ${row.slug}:`, await patch.text());
    } else {
      const arrow = `${String(row.score).padStart(3)} ${row.grade.padEnd(2)} → ${String(newScore).padStart(3)} ${newGrade}`;
      console.log(`  updated  ${row.name.padEnd(35)} ${arrow}`);
      updated++;
    }
  }

  console.log(`\nDone. ${updated} updated, ${unchanged} unchanged, ${skipped} skipped (no results).`);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
