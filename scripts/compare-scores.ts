/**
 * Compare DB scores against the new scoring mechanism (afdocs 0.8.2).
 * Fetches stored results from Supabase and re-scores them locally — no network checks.
 * Prints a diff table sorted by score delta (largest changes first).
 *
 * Run with:
 *   export $(grep -v '^#' .env.local | xargs) && npx tsx scripts/compare-scores.ts
 *
 * Optional flags:
 *   --min-delta N   Only show rows where |delta| >= N  (default: 0, show all)
 *   --changed       Only show rows where score changed
 */

import { computeScore } from '../lib/scoring';
import type { CheckResult } from '../lib/scoring';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const KEY = process.env.SUPABASE_SECRET_KEY!;

if (!SUPABASE_URL || !KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SECRET_KEY env vars');
  process.exit(1);
}

const args = process.argv.slice(2);
const minDelta = Number(args[args.indexOf('--min-delta') + 1] ?? 0) || 0;
const changedOnly = args.includes('--changed');

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
  console.log('Fetching all scores from Supabase...');
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/scores?select=slug,name,score,grade,results&order=score.desc`,
    { headers }
  );
  if (!res.ok) {
    console.error('Failed to fetch:', await res.text());
    process.exit(1);
  }

  const rows: StoredRow[] = await res.json();
  console.log(`Loaded ${rows.length} rows. Re-scoring...\n`);

  type Row = { name: string; oldScore: number; oldGrade: string; newScore: number; newGrade: string; delta: number };
  const results: Row[] = [];
  let skipped = 0;

  for (const row of rows) {
    if (!row.results || row.results.length === 0) {
      skipped++;
      continue;
    }

    const scorable = row.results.filter(
      (r) => !(r.id === 'llms-txt-valid' && r.message?.includes('No blockquote summary found'))
    );

    const scored = computeScore(scorable);
    results.push({
      name: row.name,
      oldScore: row.score,
      oldGrade: row.grade,
      newScore: scored.overall,
      newGrade: scored.grade,
      delta: scored.overall - row.score,
    });
  }

  // Sort by absolute delta descending, then by new score descending
  results.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta) || b.newScore - a.newScore);

  // Apply filters
  const filtered = results.filter(
    (r) => Math.abs(r.delta) >= minDelta && (!changedOnly || r.delta !== 0)
  );

  // Header
  const COL = { name: 36, score: 10, grade: 6, delta: 8 };
  const line = (s: string) => '-'.repeat(s.length);
  const header =
    'Name'.padEnd(COL.name) +
    'DB score'.padStart(COL.score) +
    'New score'.padStart(COL.score) +
    'Grade'.padStart(COL.grade) +
    'Delta'.padStart(COL.delta);
  console.log(header);
  console.log(line(header));

  let up = 0, down = 0, same = 0;

  for (const r of filtered) {
    const deltaStr = r.delta > 0 ? `+${r.delta}` : r.delta === 0 ? '—' : String(r.delta);
    const gradeChange = r.oldGrade !== r.newGrade ? `${r.oldGrade}→${r.newGrade}` : r.newGrade;
    console.log(
      r.name.slice(0, COL.name - 1).padEnd(COL.name) +
      String(r.oldScore).padStart(COL.score) +
      String(r.newScore).padStart(COL.score) +
      gradeChange.padStart(COL.grade) +
      deltaStr.padStart(COL.delta)
    );
    if (r.delta > 0) up++;
    else if (r.delta < 0) down++;
    else same++;
  }

  console.log(line(header));
  console.log(`\nShowing ${filtered.length} of ${results.length} companies (${skipped} skipped — no stored results)`);
  console.log(`Up: ${up}  Down: ${down}  Unchanged: ${same}`);

  // Summary stats
  const changed = results.filter((r) => r.delta !== 0);
  if (changed.length > 0) {
    const avg = changed.reduce((s, r) => s + r.delta, 0) / changed.length;
    const max = changed.reduce((m, r) => r.delta > m.delta ? r : m);
    const min = changed.reduce((m, r) => r.delta < m.delta ? r : m);
    console.log(`\nAmong ${changed.length} changed:`);
    console.log(`  Avg delta:  ${avg.toFixed(1)}`);
    console.log(`  Biggest up: ${max.name} (${max.oldScore} → ${max.newScore}, +${max.delta})`);
    console.log(`  Biggest dn: ${min.name} (${min.oldScore} → ${min.newScore}, ${min.delta})`);
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
