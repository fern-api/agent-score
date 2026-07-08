import type { CompanyScore } from './scores';
import { isBlockedDomain } from './blocked-domains';
import { query } from './db';

// OG-image storage moved from Supabase Storage to S3 (FER-11415). Re-exported
// here so existing callers (`@/lib/database`) keep working unchanged.
export { uploadOgImage, getOgImagePublicUrl } from './og-storage';

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
  afdocs_version?: string | null;
  hidden?: boolean;
  is_fern?: boolean;
}

function rowToCompany(row: ScoreRow): CompanyScore {
  // pg returns timestamptz columns as Date objects; PostgREST returned ISO
  // strings. Normalise to an ISO string so downstream display/sort is stable.
  const scoredAt =
    typeof row.scored_at === 'string'
      ? row.scored_at
      : new Date(row.scored_at as unknown as string).toISOString();
  return {
    slug: row.slug,
    name: row.name,
    category: row.category,
    docsUrl: row.docs_url,
    score: row.score,
    grade: row.grade,
    scoredAt,
    checks: {
      total: row.checks_total,
      pass: row.checks_pass,
      warn: row.checks_warn,
      fail: row.checks_fail,
    },
    results: row.results,
    categoryScores: row.category_scores ?? undefined,
    afdocsVersion: row.afdocs_version ?? undefined,
    hidden: row.hidden ?? false,
    isFern: row.is_fern ?? false,
  };
}

export async function upsertScore(company: CompanyScore): Promise<void> {
  // Base columns always written. hidden/is_fern are only written when the
  // caller explicitly provides them, preserving manual overrides (matches the
  // previous supabase-js upsert behaviour).
  const cols: string[] = [
    'slug', 'name', 'category', 'docs_url', 'score', 'grade', 'scored_at',
    'checks_total', 'checks_pass', 'checks_warn', 'checks_fail',
    'results', 'category_scores', 'afdocs_version',
  ];
  const vals: unknown[] = [
    company.slug,
    company.name,
    company.category,
    company.docsUrl,
    company.score,
    company.grade,
    company.scoredAt,
    company.checks.total,
    company.checks.pass,
    company.checks.warn,
    company.checks.fail,
    company.results ? JSON.stringify(company.results) : null,
    company.categoryScores ? JSON.stringify(company.categoryScores) : null,
    company.afdocsVersion ?? null,
  ];
  if (company.hidden !== undefined) { cols.push('hidden'); vals.push(company.hidden); }
  if (company.isFern !== undefined) { cols.push('is_fern'); vals.push(company.isFern); }

  const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
  // On conflict, update every column we're inserting except the conflict key.
  const updates = cols
    .filter((c) => c !== 'slug')
    .map((c) => `${c} = EXCLUDED.${c}`)
    .join(', ');

  try {
    await query(
      `INSERT INTO public.scores (${cols.join(', ')}) VALUES (${placeholders})
       ON CONFLICT (slug) DO UPDATE SET ${updates}`,
      vals
    );
  } catch (err) {
    throw new Error(`scores upsert failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function getScoreBySlug(slug: string): Promise<CompanyScore | null> {
  try {
    const { rows } = await query<ScoreRow>(
      `SELECT * FROM public.scores WHERE slug = $1 ORDER BY scored_at DESC LIMIT 1`,
      [slug]
    );
    if (!rows.length) return null;
    const company = rowToCompany(rows[0]);
    // Never surface blocked-domain records — treat them as not found.
    if (isBlockedDomain(company.docsUrl)) return null;
    return company;
  } catch {
    return null;
  }
}

export async function deleteScoresByFilter(filter: { slugs?: string[]; docsUrls?: string[] }): Promise<void> {
  if (filter.slugs?.length) {
    try {
      await query(`DELETE FROM public.scores WHERE slug = ANY($1)`, [filter.slugs]);
    } catch (err) {
      console.error('[scores] deleteScoresByFilter slugs error:', err instanceof Error ? err.message : err);
    }
  }
  if (filter.docsUrls?.length) {
    try {
      await query(`DELETE FROM public.scores WHERE docs_url = ANY($1)`, [filter.docsUrls]);
    } catch (err) {
      console.error('[scores] deleteScoresByFilter docsUrls error:', err instanceof Error ? err.message : err);
    }
  }
}

export async function getAllScores(): Promise<CompanyScore[]> {
  try {
    const { rows } = await query<ScoreRow>(
      `SELECT slug, name, category, docs_url, score, grade, scored_at,
              checks_total, checks_pass, checks_warn, checks_fail, is_fern
       FROM public.scores
       WHERE hidden = false
       ORDER BY scored_at DESC
       LIMIT 10000`
    );
    // Deduplicate by slug — keep the most recently scored row (rows already
    // ordered by scored_at DESC).
    const seen = new Set<string>();
    const deduped = rows.filter((row) => {
      if (seen.has(row.slug)) return false;
      seen.add(row.slug);
      return true;
    });
    return deduped.map(rowToCompany);
  } catch (err) {
    console.error('[scores] getAllScores error:', err instanceof Error ? err.message : err);
    return [];
  }
}
