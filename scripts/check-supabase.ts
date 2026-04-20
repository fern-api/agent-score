import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;

console.log('SUPABASE_URL set:', !!url, url ? url.slice(0, 40) + '...' : 'MISSING');
console.log('SERVICE_ROLE_KEY set:', !!key);

const sb = createClient(url!, key!);

async function main() {
  const { data, error } = await sb.from('scores').select('slug, score').order('score', { ascending: false });
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Total rows:', data?.length);
    data?.slice(0, 5).forEach(r => console.log(' -', r.slug, r.score));
  }
}

main();
