import { createClient } from '@supabase/supabase-js';
import type { CompanyScore } from './scores';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface ScoreRow {
  slug: string;
  name: string;
  category: string;
  docs_url: string;
  score: number;
  grade: string;
  scored_at: string;
  checks_total: number;
  checks_pass: number;
  checks_warn: number;
  checks_fail: number;
  results: CompanyScore['results'];
}

function rowToCompany(row: ScoreRow): CompanyScore {
  return {
    slug: row.slug,
    name: row.name,
    category: row.category,
    docsUrl: row.docs_url,
    score: row.score,
    grade: row.grade,
    scoredAt: row.scored_at,
    checks: {
      total: row.checks_total,
      pass: row.checks_pass,
      warn: row.checks_warn,
      fail: row.checks_fail,
    },
    results: row.results,
  };
}

export async function upsertScore(company: CompanyScore): Promise<void> {
  const { error } = await supabase.from('scores').upsert({
    slug: company.slug,
    name: company.name,
    category: company.category,
    docs_url: company.docsUrl,
    score: company.score,
    grade: company.grade,
    scored_at: company.scoredAt,
    checks_total: company.checks.total,
    checks_pass: company.checks.pass,
    checks_warn: company.checks.warn,
    checks_fail: company.checks.fail,
    results: company.results ?? null,
  }, { onConflict: 'slug' });
  if (error) throw new Error(`Supabase upsert failed: ${error.message}`);
}

export async function getScoreBySlug(slug: string): Promise<CompanyScore | null> {
  const url = `${process.env.SUPABASE_URL}/rest/v1/scores?select=*&slug=eq.${encodeURIComponent(slug)}&order=scored_at.desc&limit=1`;
  const res = await fetch(url, {
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
    },
  });
  if (!res.ok) return null;
  const rows: ScoreRow[] = await res.json();
  if (!rows.length) return null;
  return rowToCompany(rows[0]);
}

export async function getAllScores(): Promise<CompanyScore[]> {
  const url = `${process.env.SUPABASE_URL}/rest/v1/scores?select=slug,name,category,docs_url,score,grade,scored_at,checks_total,checks_pass,checks_warn,checks_fail&order=scored_at.desc`;
  const res = await fetch(url, {
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
    },
  });
  if (!res.ok) {
    console.error('[supabase] getAllScores fetch error:', res.status, await res.text());
    return [];
  }
  const data: ScoreRow[] = await res.json();
  // Deduplicate by slug — keep the most recently scored row (data already ordered by scored_at.desc)
  const seen = new Set<string>();
  const deduped = data.filter(row => {
    if (seen.has(row.slug)) return false;
    seen.add(row.slug);
    return true;
  });
  return deduped.map(rowToCompany);
}

const OG_BUCKET = 'og-images';

// Ensure bucket exists (called lazily)
async function ensureOgBucket(): Promise<void> {
  const { error } = await supabase.storage.createBucket(OG_BUCKET, { public: true });
  // Ignore "already exists" error
  if (error && !error.message.includes('already exists')) {
    console.error('[og] bucket create error:', error.message);
  }
}

export async function uploadOgImage(slug: string, buffer: Buffer): Promise<void> {
  await ensureOgBucket();
  const { error } = await supabase.storage
    .from(OG_BUCKET)
    .upload(`${slug}.png`, buffer, { contentType: 'image/png', upsert: true });
  if (error) throw new Error(`OG image upload failed: ${error.message}`);
}

export function getOgImagePublicUrl(slug: string): string {
  const { data } = supabase.storage.from(OG_BUCKET).getPublicUrl(`${slug}.png`);
  return data.publicUrl;
}
