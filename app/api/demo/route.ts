import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { email, source, url } = await req.json();
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  const webhookUrl = process.env.SLACK_DEMO_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  }

  const SOURCE_EMOJI: Record<string, string> = {
    'Built by Fern CTA': ':rocket:',
    'scoring timeout': ':hourglass:',
    'footer': ':link:',
    'Make your docs agent-friendly CTA': ':robot_face:',
    'Built with Fern badge': ':star:',
    'check results gate': ':eyes:',
  };

  let text: string;
  if (source === 'check results gate' && url) {
    text = `:eyes: \`${email}\` requested to see the results on ${url}`;
  } else if (source) {
    const emoji = SOURCE_EMOJI[source] ?? ':calendar:';
    text = `${emoji} \`${email}\` is trying to book a demo from \`${source}\``;
  } else {
    text = `:calendar: \`${email}\` is trying to book a demo`;
  }

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  return NextResponse.json({ ok: true });
}
