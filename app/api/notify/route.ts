import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { email, url } = await request.json();
    if (!email || !url) {
      return NextResponse.json({ error: "email and url are required" }, { status: 400 });
    }

    const webhookUrl = process.env.SLACK_DEMO_WEBHOOK_URL;
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `:bell: *Failed scoring request — user wants to be notified when working*\n*Email:* ${email}\n*URL:* <${url}|${url}>`,
        }),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[notify] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
