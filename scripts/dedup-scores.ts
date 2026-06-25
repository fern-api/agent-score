/**
 * Removes duplicate rows in the scores table, keeping the most recently scored
 * row per slug. Talks to the agent-score RDS database (`agent_score`).
 * Run with: export $(grep -v '^#' .env.local | xargs) && npx tsx scripts/dedup-scores.ts
 *
 * Note: on RDS `slug` is the conflict key for upserts, so duplicates by slug
 * should not normally exist; this remains as a safety/cleanup utility.
 */
import { query } from '../lib/db';

async function main() {
  const before = await query<{ n: string }>(`SELECT count(*)::text AS n FROM public.scores`);
  const uniq = await query<{ n: string }>(`SELECT count(DISTINCT slug)::text AS n FROM public.scores`);
  console.log(`Total rows: ${before.rows[0].n}`);
  console.log(`Unique slugs: ${uniq.rows[0].n}`);

  // Delete every row that is not the newest scored_at for its slug.
  const del = await query<{ slug: string }>(
    `DELETE FROM public.scores s
     USING (SELECT slug, max(scored_at) AS keep FROM public.scores GROUP BY slug) k
     WHERE s.slug = k.slug AND s.scored_at < k.keep
     RETURNING s.slug`
  );

  if (del.rowCount === 0) {
    console.log('No duplicates found.');
    return;
  }
  console.log(`Deleted ${del.rowCount} duplicate rows.`);
  console.log('Affected slugs:', [...new Set(del.rows.map(r => r.slug))]);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
