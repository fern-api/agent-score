/**
 * Backfills category_scores for all companies in the RDS scores table.
 * Reads existing `results` JSON and re-computes weighted per-category scores
 * using computeScore — no re-fetching of any docs sites.
 * (Migrated off Supabase/PostgREST to RDS pg — FER-11415.)
 *
 * Run with:
 *   export $(grep -v '^#' .env.local | xargs) && npx tsx scripts/backfill-category-scores.ts
 *
 * Options (env vars):
 *   SLUGS=stripe,twilio   — only backfill specific slugs (comma-separated)
 *   SKIP_EXISTING=true    — skip companies that already have category_scores set (default: true)
 *   LOG_FILE=./backfill.log — path to write progress log (default: ./backfill-category-scores.log)
 */

import fs from 'fs';
import { computeScore } from '../lib/scoring';
import type { CheckResult } from '../lib/scores';
import { query } from '../lib/db';

const SKIP_EXISTING = process.env.SKIP_EXISTING !== 'false';
const LOG_FILE = process.env.LOG_FILE ?? './backfill-category-scores.log';
const FILTER_SLUGS = process.env.SLUGS ? process.env.SLUGS.split(',').map((s) => s.trim()) : null;

interface StoredRow {
  slug: string;
  name: string;
  results: CheckResult[] | null;
  category_scores: Record<string, number> | null;
}

function log(msg: string) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

async function fetchAllRows(): Promise<StoredRow[]> {
  const { rows } = await query<StoredRow>(
    `SELECT slug, name, results, category_scores FROM public.scores ORDER BY name ASC`
  );
  return rows;
}

async function updateCategoryScores(slug: string, categoryScores: Record<string, number>): Promise<void> {
  await query(`UPDATE public.scores SET category_scores = $1 WHERE slug = $2`, [
    JSON.stringify(categoryScores),
    slug,
  ]);
}

async function main() {
  // Clear or create log file for this run
  fs.writeFileSync(LOG_FILE, `=== backfill-category-scores run at ${new Date().toISOString()} ===\n`);

  log('Fetching all companies from RDS...');
  let rows = await fetchAllRows();
  log(`Fetched ${rows.length} total companies`);

  if (FILTER_SLUGS) {
    rows = rows.filter((r) => FILTER_SLUGS.includes(r.slug));
    log(`Filtered to ${rows.length} companies: ${FILTER_SLUGS.join(', ')}`);
  }

  if (SKIP_EXISTING) {
    const before = rows.length;
    rows = rows.filter((r) => !r.category_scores);
    const skipped = before - rows.length;
    if (skipped > 0) log(`Skipping ${skipped} companies that already have category_scores`);
  }

  const noResults = rows.filter((r) => !r.results || r.results.length === 0);
  if (noResults.length > 0) {
    log(`Skipping ${noResults.length} companies with no stored results: ${noResults.map((r) => r.slug).join(', ')}`);
  }
  rows = rows.filter((r) => r.results && r.results.length > 0);

  log(`${rows.length} companies to backfill\n`);

  let succeeded = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const prefix = `[${String(i + 1).padStart(String(rows.length).length)}/${rows.length}]`;

    try {
      const scored = computeScore(row.results as CheckResult[]);
      await updateCategoryScores(row.slug, scored.categoryScores);
      const cats = Object.entries(scored.categoryScores)
        .map(([k, v]) => `${k}:${v}`)
        .join(', ');
      log(`${prefix} ✓ ${row.name} (${row.slug}) — ${cats}`);
      succeeded++;
    } catch (err) {
      log(`${prefix} ✗ ${row.name} (${row.slug}) — ${(err as Error).message}`);
      failed++;
    }
  }

  log(`\n─────────────────────────────────`);
  log(`Done. ${succeeded} updated, ${failed} failed.`);
  log(`Progress written to: ${LOG_FILE}`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
