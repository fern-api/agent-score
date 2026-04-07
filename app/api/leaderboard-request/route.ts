import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { email, url, slug } = await req.json();
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'email required' }, { status: 400 });
  }
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'url required' }, { status: 400 });
  }

  const webhookUrl = process.env.SLACK_DEMO_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  }

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `:trophy: Leaderboard request from \`${email}\` for <${url}|${slug ?? url}>`,
    }),
  });

  return NextResponse.json({ ok: true });
}
