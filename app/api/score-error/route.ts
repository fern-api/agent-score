import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { url, message } = await request.json();
    const webhookUrl = process.env.SLACK_DEMO_WEBHOOK_URL;
    if (webhookUrl && url) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `:warning: *Scoring error*\n*URL:* <${url}|${url}>\n*Error:* ${message ?? "Unknown error"}`,
        }),
      });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
