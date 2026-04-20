/**
 * Reclassifies company categories in Supabase.
 * Run with: export $(grep -v '^#' .env.local | xargs) && npx tsx scripts/reclassify-categories.ts
 */

const SUPABASE_URL = process.env.SUPABASE_URL!;
const KEY = process.env.SUPABASE_SECRET_KEY!;

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
};

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
  const res = await fetch(`${SUPABASE_URL}/rest/v1/scores?select=slug,name,category`, { headers });
  if (!res.ok) {
    console.error('Failed to fetch scores:', await res.text());
    process.exit(1);
  }
  const rows: { slug: string; name: string; category: string }[] = await res.json();
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

    const patch = await fetch(
      `${SUPABASE_URL}/rest/v1/scores?slug=eq.${encodeURIComponent(row.slug)}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ category: newCategory }),
      }
    );

    if (!patch.ok) {
      console.error(`  ERROR ${row.slug}:`, await patch.text());
    } else {
      console.log(`  updated  ${row.name.padEnd(30)} ${row.category.padEnd(20)} → ${newCategory}`);
      updated++;
    }
  }

  console.log(`\nDone. ${updated} updated, ${skipped} skipped.`);
}

main().catch(err => { console.error(err); process.exit(1); });
