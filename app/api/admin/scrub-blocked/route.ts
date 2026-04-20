import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isBlockedDomain } from '@/lib/blocked-domains';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get('secret') !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  const { data: rows, error } = await supabase
    .from('scores')
    .select('slug, docs_url');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const toDelete = rows
    .filter(r => isBlockedDomain(r.docs_url) || r.slug === 'unknown')
    .map(r => r.slug);

  if (toDelete.length === 0) {
    return NextResponse.json({ deleted: 0, slugs: [] });
  }

  const { error: delError } = await supabase
    .from('scores')
    .delete()
    .in('slug', toDelete);

  if (delError) return NextResponse.json({ error: delError.message }, { status: 500 });

  return NextResponse.json({ deleted: toDelete.length, slugs: toDelete });
}
