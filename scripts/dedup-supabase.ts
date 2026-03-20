/**
 * Removes duplicate rows in Supabase scores table, keeping the most recently scored row per slug.
 * Run with: export $(grep -v '^#' .env.local | xargs) && npx tsx scripts/dedup-supabase.ts
 */

const SUPABASE_URL = process.env.SUPABASE_URL!;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
};

async function main() {
  // Fetch all rows with their id and scored_at, ordered by scored_at desc
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/scores?select=id,slug,score,scored_at&order=scored_at.desc`,
    { headers }
  );
  const rows: { id: number; slug: string; score: number; scored_at: string }[] = await res.json();
  console.log(`Total rows: ${rows.length}`);

  // Group by slug, keep first (most recent), delete the rest
  const seen = new Map<string, number>(); // slug -> id to keep
  const toDelete: number[] = [];

  for (const row of rows) {
    if (!seen.has(row.slug)) {
      seen.set(row.slug, row.id);
    } else {
      toDelete.push(row.id);
    }
  }

  console.log(`Unique slugs: ${seen.size}`);
  console.log(`Duplicate rows to delete: ${toDelete.length}`);

  if (toDelete.length === 0) {
    console.log('No duplicates found.');
    return;
  }

  // Show which slugs had duplicates
  const dupSlugs = new Set<string>();
  for (const row of rows) {
    if (toDelete.includes(row.id)) dupSlugs.add(row.slug);
  }
  console.log('Duplicate slugs:', [...dupSlugs]);

  // Delete duplicates one by one
  let deleted = 0;
  for (const id of toDelete) {
    const del = await fetch(`${SUPABASE_URL}/rest/v1/scores?id=eq.${id}`, {
      method: 'DELETE',
      headers,
    });
    if (del.ok) {
      deleted++;
    } else {
      console.error(`Failed to delete id=${id}:`, del.status, await del.text());
    }
  }
  console.log(`Deleted ${deleted} duplicate rows.`);
}

main().catch(console.error);
