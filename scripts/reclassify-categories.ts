/**
 * Reclassifies company categories in the RDS scores table.
 * (Migrated off Supabase/PostgREST to RDS pg — FER-11415.)
 * Run with: export $(grep -v '^#' .env.local | xargs) && npx tsx scripts/reclassify-categories.ts
 */

import { query } from '../lib/db';

// slug → new category
const RECLASSIFICATIONS: Record<string, string> = {
  // Infrastructure → Cloud Infra
  cloudflare:           'Cloud Infra',
  supabase:             'Cloud Infra',
  redis:                'Cloud Infra',

  // Voice AI
  elevenlabs:           'Voice AI',
  'deepgram-x27-s':     'Voice AI',

  // AI/ML
  mem0:                 'AI/ML',
  'strands-agents-sdk': 'AI/ML',
  roboflow:             'AI/ML',
  ydc:                  'AI/ML',

  // DevTools
  fern:                 'DevTools',
  mintlify:             'DevTools',
  rootly:               'DevTools',
  jfrog:                'DevTools',
  'welcome-to-jfrog':   'DevTools',
  'tanstack-router':    'DevTools',
  pydeprecate:          'DevTools',

  // Payments
  polar:                'Payments',
  payabli:              'Payments',
  'bill-api':           'Payments',
  'deel-developer':     'Payments',

  // Ecommerce
  shopify:              'Ecommerce',

  // Communication
  resend:               'Communication',
  circle:               'Communication',
};

async function main() {
  console.log('Fetching all scores...');
  const { rows } = await query<{ slug: string; name: string; category: string }>(
    `SELECT slug, name, category FROM public.scores`
  );
  console.log(`Found ${rows.length} rows.\n`);

  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    const newCategory = RECLASSIFICATIONS[row.slug];
    if (!newCategory) { skipped++; continue; }
    if (newCategory === row.category) {
      console.log(`  skip  ${row.slug} — already "${newCategory}"`);
      skipped++;
      continue;
    }

    try {
      await query(`UPDATE public.scores SET category = $1 WHERE slug = $2`, [newCategory, row.slug]);
      console.log(`  updated  ${row.name.padEnd(30)} ${row.category.padEnd(20)} → ${newCategory}`);
      updated++;
    } catch (err) {
      console.error(`  ERROR ${row.slug}:`, err instanceof Error ? err.message : err);
    }
  }

  console.log(`\nDone. ${updated} updated, ${skipped} skipped.`);
}

main().catch(err => { console.error(err); process.exit(1); });
