/**
 * Debug scoring for a single URL — prints per-check breakdown.
 * Usage: npx tsx scripts/debug-score.ts https://elevenlabs.io/docs
 */

import { computeScore } from '../lib/scoring';
import type { CheckResult } from '../lib/scoring';

const url = process.argv[2];
if (!url) { console.error('Usage: npx tsx scripts/debug-score.ts <url>'); process.exit(1); }

const WEIGHTS: Record<string, number> = {
  'llms-txt-exists': 10, 'rendering-strategy': 10, 'auth-gate-detection': 10,
  'llms-txt-size': 7, 'llms-txt-links-resolve': 7, 'llms-txt-links-markdown': 7,
  'markdown-url-support': 7, 'page-size-html': 7, 'page-size-markdown': 7,
  'http-status-codes': 7, 'llms-txt-directive': 7,
  'llms-txt-valid': 4, 'content-negotiation': 4, 'content-start-position': 4,
  'tabbed-content-serialization': 4, 'markdown-code-fence-validity': 4,
  'llms-txt-freshness': 4, 'markdown-content-parity': 4, 'auth-alternative-access': 4,
  'redirect-behavior': 4,
  'section-header-quality': 2, 'cache-header-hygiene': 2,
};

async function main() {
  const { runChecks } = await import('afdocs');
  console.log(`Running checks for ${url}...\n`);
  const result = await runChecks(url, { requestTimeout: 8000, requestDelay: 0, maxConcurrency: 6, maxLinksToTest: 10 });

  console.log('Raw check results:');
  for (const r of result.results) {
    const d = r.details ? JSON.stringify(r.details).slice(0, 120) : '';
    console.log(`  ${r.status.padEnd(5)} ${r.id.padEnd(35)} ${d}`);
  }
  console.log();

  const scorable = result.results.filter(
    (r: { id: string; message: string }) =>
      !(r.id === 'llms-txt-valid' && r.message.includes('No blockquote summary found'))
  );

  const scored = computeScore(scorable as CheckResult[]);
  console.log(`Score: ${scored.overall}/100 (${scored.grade})`);
  if (scored.cap) console.log(`Cap applied: ${scored.cap.cap} — ${scored.cap.reason}`);
}

main().catch(err => { console.error(err); process.exit(1); });
