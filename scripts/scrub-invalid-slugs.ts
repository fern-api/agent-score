/**
 * Deletes score rows whose slug isn't a slug — e.g. the SQL-injection scanner
 * payloads that a scan of POST /api/score stored as 22 separate Middesk/Auth0
 * leaderboard entries on 2026-08-20.
 *
 * Dry run (default):
 *   npx tsx --env-file=.env.local scripts/scrub-invalid-slugs.ts
 * Delete:
 *   npx tsx --env-file=.env.local scripts/scrub-invalid-slugs.ts --apply
 */
import { query } from '../lib/db';
import { isValidSlug } from '../lib/slug';

async function main() {
  const apply = process.argv.includes('--apply');
  const { rows } = await query<{ slug: string; name: string; docs_url: string; scored_at: string }>(
    `SELECT slug, name, docs_url, scored_at FROM public.scores ORDER BY scored_at DESC`
  );

  const invalid = rows.filter((row) => !isValidSlug(row.slug));
  console.log(`Rows: ${rows.length}, invalid slugs: ${invalid.length}`);
  for (const row of invalid) {
    console.log(`  ${JSON.stringify(row.slug)} — ${row.name} — ${row.docs_url}`);
  }
  if (!invalid.length) return;

  if (!apply) {
    console.log('\nDry run — pass --apply to delete these rows.');
    return;
  }

  const del = await query(`DELETE FROM public.scores WHERE slug = ANY($1)`, [invalid.map((r) => r.slug)]);
  console.log(`\nDeleted ${del.rowCount} rows.`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
