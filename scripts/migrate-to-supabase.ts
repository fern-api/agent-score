/**
 * One-time migration script: reads data/scores.json and bulk-upserts all
 * company score records into Supabase.
 *
 * Run with:
 *   npx ts-node --project tsconfig.json scripts/migrate-to-supabase.ts
 */

import { getLeaderboardSync } from "../lib/scores";
import { upsertScore } from "../lib/supabase";

async function main() {
  const companies = getLeaderboardSync();
  console.log(`Migrating ${companies.length} companies to Supabase…`);

  let succeeded = 0;
  let failed = 0;

  for (const company of companies) {
    try {
      await upsertScore(company);
      console.log(`  [OK] ${company.slug} (score: ${company.score})`);
      succeeded++;
    } catch (err) {
      console.error(`  [FAIL] ${company.slug}:`, (err as Error).message);
      failed++;
    }
  }

  console.log(`\nDone. ${succeeded} succeeded, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
