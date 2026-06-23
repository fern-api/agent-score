import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isBlockedDomain } from '@/lib/blocked-domains';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get('secret') !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let rows: { slug: string; docs_url: string }[];
  try {
    const res = await query<{ slug: string; docs_url: string }>(
      `SELECT slug, docs_url FROM public.scores`
    );
    rows = res.rows;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }

  const toDelete = rows
    .filter(r => isBlockedDomain(r.docs_url) || r.slug === 'unknown')
    .map(r => r.slug);

  if (toDelete.length === 0) {
    return NextResponse.json({ deleted: 0, slugs: [] });
  }

  try {
    await query(`DELETE FROM public.scores WHERE slug = ANY($1)`, [toDelete]);
  } catch (delError) {
    return NextResponse.json({ error: delError instanceof Error ? delError.message : String(delError) }, { status: 500 });
  }

  return NextResponse.json({ deleted: toDelete.length, slugs: toDelete });
}
