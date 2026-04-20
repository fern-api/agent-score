/**
 * Backfills category_scores for all companies in Supabase.
 * Reads existing `results` JSON and re-computes weighted per-category scores
 * using computeScore — no re-fetching of any docs sites.
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

const SUPABASE_URL = process.env.SUPABASE_URL!;
const KEY = process.env.SUPABASE_SECRET_KEY!;
const SKIP_EXISTING = process.env.SKIP_EXISTING !== 'false';
const LOG_FILE = process.env.LOG_FILE ?? './backfill-category-scores.log';
const FILTER_SLUGS = process.env.SLUGS ? process.env.SLUGS.split(',').map((s) => s.trim()) : null;
const PAGE_SIZE = 100;

if (!SUPABASE_URL || !KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SECRET_KEY env vars');
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
  results: CheckResult[] | null;
  category_scores: Record<string, number> | null;
}

function log(msg: string) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

async function fetchAllRows(): Promise<StoredRow[]> {
  const rows: StoredRow[] = [];
  let offset = 0;

  while (true) {
    const url = new URL(`${SUPABASE_URL}/rest/v1/scores`);
    url.searchParams.set('select', 'slug,name,results,category_scores');
    url.searchParams.set('order', 'name.asc');
    url.searchParams.set('limit', String(PAGE_SIZE));
    url.searchParams.set('offset', String(offset));

    const res = await fetch(url.toString(), { headers });
    if (!res.ok) {
      console.error('Failed to fetch rows:', await res.text());
      process.exit(1);
    }

    const page: StoredRow[] = await res.json();
    if (page.length === 0) break;
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return rows;
}

async function updateCategoryScores(slug: string, categoryScores: Record<string, number>): Promise<void> {
  const url = `${SUPABASE_URL}/rest/v1/scores?slug=eq.${encodeURIComponent(slug)}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ category_scores: categoryScores }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PATCH failed (${res.status}): ${text}`);
  }
}

async function main() {
  // Clear or create log file for this run
  fs.writeFileSync(LOG_FILE, `=== backfill-category-scores run at ${new Date().toISOString()} ===\n`);

  log('Fetching all companies from Supabase...');
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
