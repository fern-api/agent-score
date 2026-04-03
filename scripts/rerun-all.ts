/**
 * Re-runs checks and scoring for all companies in Supabase.
 * Fetches the company list from Supabase, re-runs afdocs checks,
 * and upserts fresh results using the current scoring module.
 *
 * Run with:
 *   export $(grep -v '^#' .env.local | xargs) && npx tsx scripts/rerun-all.ts
 *
 * Options (env vars):
 *   SLUGS=stripe,twilio   — only rerun specific slugs (comma-separated)
 *   DELAY_MS=2000         — ms to wait between companies (default: 1000)
 */

import { computeScore } from '../lib/scoring';
import { upsertScore } from '../lib/supabase';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const DELAY_MS = parseInt(process.env.DELAY_MS ?? '1000', 10);
const DEFAULT_SLUGS = [
  'zendesk', 'ydc', 'workos', 'vercel', 'twilio', 'tanstack-router', 'support',
  'supabase', 'stripe', 'strands-agents-sdk', 'stackby-developer-api-v1', 'square',
  'sonatype-nexus-repository', 'slack-developer', 'shopify', 'shipfox', 'sentry',
  'sap', 'salesforce', 'rootly', 'roboflow', 'resend', 'docs',
];
const FILTER_SLUGS = process.env.SLUGS ? process.env.SLUGS.split(',').map((s) => s.trim()) : DEFAULT_SLUGS;

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
  docs_url: string;
  category: string;
  hidden: boolean;
  scored_at: string | null;
}

const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function startSpinner(label: string): () => void {
  let frame = 0;
  const start = Date.now();
  const id = setInterval(() => {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    process.stdout.write(`\r  ${SPINNER[frame % SPINNER.length]} ${label} (${elapsed}s)`);
    frame++;
  }, 100);
  return () => {
    clearInterval(id);
    process.stdout.write('\r\x1b[K'); // clear spinner line
  };
}

async function main() {
  const { runChecks } = await import('afdocs');

  process.stdout.write('Fetching company list from Supabase... ');
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/scores?select=slug,name,docs_url,category,hidden,scored_at&order=name.asc`,
    { headers }
  );
  if (!res.ok) {
    console.error('\nFailed to fetch companies:', await res.text());
    process.exit(1);
  }

  let companies: StoredRow[] = await res.json();

  // Deduplicate by slug (keep first occurrence)
  const seen = new Set<string>();
  companies = companies.filter((c) => {
    if (seen.has(c.slug)) return false;
    seen.add(c.slug);
    return true;
  });

  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
  const staleCompanies = companies.filter(
    (c) => !c.scored_at || new Date(c.scored_at) < thirtyMinAgo
  );
  const skipped = companies.length - staleCompanies.length;
  if (skipped > 0) {
    console.log(`  Skipping ${skipped} companies scored in the last 30 min`);
  }
  companies = staleCompanies;

  if (FILTER_SLUGS) {
    companies = companies.filter((c) => FILTER_SLUGS.includes(c.slug));
  }

  console.log(`${companies.length} companies\n`);

  let succeeded = 0;
  let failed = 0;

  for (let i = 0; i < companies.length; i++) {
    const company = companies[i];
    const prefix = `[${String(i + 1).padStart(String(companies.length).length)}/${companies.length}]`;
    console.log(`${prefix} ${company.name}`);
    console.log(`         ${company.docs_url}`);

    const stopSpinner = startSpinner('running checks');
    let result: Awaited<ReturnType<typeof runChecks>>;

    try {
      result = await runChecks(company.docs_url, {
        requestTimeout: 8000,
        requestDelay: 0,
        maxConcurrency: 6,
        maxLinksToTest: 10,
      });
      stopSpinner();
    } catch (err) {
      stopSpinner();
      console.log(`  ✗ checks failed: ${(err as Error).message}\n`);
      failed++;
      if (i < companies.length - 1) await sleep(DELAY_MS);
      continue;
    }

    // Print per-check results
    for (const r of result.results) {
      const icon = r.status === 'pass' ? '✓' : r.status === 'warn' ? '~' : r.status === 'fail' ? '✗' : '-';
      const color =
        r.status === 'pass' ? '\x1b[32m' :
        r.status === 'warn' ? '\x1b[33m' :
        r.status === 'fail' ? '\x1b[31m' : '\x1b[90m';
      console.log(`  ${color}${icon}\x1b[0m ${r.id.padEnd(32)} ${r.message.slice(0, 60)}`);
    }

    // Exclude llms-txt-valid when the only issue is a missing blockquote
    const scorableResults = result.results.filter(
      (r: { id: string; message: string }) =>
        !(r.id === 'llms-txt-valid' && r.message.includes('No blockquote summary found'))
    );

    const scored = computeScore(scorableResults as Parameters<typeof computeScore>[0]);

    const stopSaving = startSpinner('saving to Supabase');
    try {
      await upsertScore({
        name: company.name,
        slug: company.slug,
        category: company.category,
        docsUrl: company.docs_url,
        score: scored.overall,
        grade: scored.grade,
        hidden: company.hidden,
        scoredAt: new Date().toISOString(),
        checks: {
          total: result.summary.total,
          pass: result.summary.pass,
          warn: result.summary.warn,
          fail: result.summary.fail,
        },
        results: result.results,
      });
      stopSaving();
      const capNote = scored.cap ? ` (capped: ${scored.cap.reason})` : '';
      console.log(`  → \x1b[1m${scored.overall}/100 (${scored.grade})\x1b[0m${capNote}\n`);
      succeeded++;
    } catch (err) {
      stopSaving();
      console.error(`  ✗ save failed: ${(err as Error).message}\n`);
      failed++;
    }

    if (i < companies.length - 1) await sleep(DELAY_MS);
  }

  console.log(`─────────────────────────────────`);
  console.log(`Done. ${succeeded} succeeded, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
