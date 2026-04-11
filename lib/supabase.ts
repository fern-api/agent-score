import { createClient } from '@supabase/supabase-js';
import type { CompanyScore } from './scores';
import { isBlockedDomain } from './blocked-domains';

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabase;
}

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
  category_scores?: Record<string, number> | null;
  hidden?: boolean;
  is_fern?: boolean;
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
    categoryScores: row.category_scores ?? undefined,
    hidden: row.hidden ?? false,
    isFern: row.is_fern ?? false,
  };
}

export async function upsertScore(company: CompanyScore): Promise<void> {
  const payload: Record<string, unknown> = {
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
    category_scores: company.categoryScores ?? null,
  };
  // Only write hidden when explicitly provided — preserves manual overrides
  if (company.hidden !== undefined) payload.hidden = company.hidden;
  if (company.isFern !== undefined) payload.is_fern = company.isFern;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await getSupabase().from('scores').upsert(payload as any, { onConflict: 'slug' });
  if (error) throw new Error(`Supabase upsert failed: ${error.message}`);
}

export async function getScoreBySlug(slug: string): Promise<CompanyScore | null> {
  const url = `${process.env.SUPABASE_URL}/rest/v1/scores?select=*&slug=eq.${encodeURIComponent(slug)}&order=scored_at.desc&limit=1`;
  const res = await fetch(url, {
    cache: 'no-store',
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
    },
  });
  if (!res.ok) return null;
  const rows: ScoreRow[] = await res.json();
  if (!rows.length) return null;
  const company = rowToCompany(rows[0]);
  // Never surface blocked-domain records — treat them as not found
  if (isBlockedDomain(company.docsUrl)) return null;
  return company;
}

export async function deleteScoresByFilter(filter: { slugs?: string[]; docsUrls?: string[] }): Promise<void> {
  const sb = getSupabase();
  if (filter.slugs?.length) {
    const { error } = await sb.from('scores').delete().in('slug', filter.slugs);
    if (error) console.error('[supabase] deleteScoresByFilter slugs error:', error.message);
  }
  if (filter.docsUrls?.length) {
    const { error } = await sb.from('scores').delete().in('docs_url', filter.docsUrls);
    if (error) console.error('[supabase] deleteScoresByFilter docsUrls error:', error.message);
  }
}

export async function getAllScores(): Promise<CompanyScore[]> {
  const url = `${process.env.SUPABASE_URL}/rest/v1/scores?select=slug,name,category,docs_url,score,grade,scored_at,checks_total,checks_pass,checks_warn,checks_fail,is_fern&hidden=eq.false&order=scored_at.desc&limit=10000`;
  const res = await fetch(url, {
    cache: 'no-store',
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
  const { error } = await getSupabase().storage.createBucket(OG_BUCKET, { public: true });
  // Ignore "already exists" error
  if (error && !error.message.includes('already exists')) {
    console.error('[og] bucket create error:', error.message);
  }
}

export async function uploadOgImage(slug: string, buffer: Buffer): Promise<void> {
  await ensureOgBucket();
  const { error } = await getSupabase().storage
    .from(OG_BUCKET)
    .upload(`${slug}.png`, buffer, { contentType: 'image/png', upsert: true });
  if (error) throw new Error(`OG image upload failed: ${error.message}`);
}

export function getOgImagePublicUrl(slug: string): string {
  const { data } = getSupabase().storage.from(OG_BUCKET).getPublicUrl(`${slug}.png`);
  return data.publicUrl;
}
