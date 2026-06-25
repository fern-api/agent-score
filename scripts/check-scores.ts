/**
 * Quick health check against the agent-score RDS database (`agent_score`).
 * Run with: export $(grep -v '^#' .env.local | xargs) && npx tsx scripts/check-scores.ts
 */
import { query } from '../lib/db';

const url = process.env.AGENT_SCORE_DATABASE_URL;
console.log('AGENT_SCORE_DATABASE_URL set:', !!url, url ? url.replace(/:[^:@/]*@/, ':***@').slice(0, 60) + '...' : 'MISSING');

async function main() {
  try {
    const { rows } = await query<{ slug: string; score: number }>(
      `SELECT slug, score FROM public.scores ORDER BY score DESC`
    );
    console.log('Total rows:', rows.length);
    rows.slice(0, 5).forEach(r => console.log(' -', r.slug, r.score));
  } catch (err) {
    console.error('Error:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
