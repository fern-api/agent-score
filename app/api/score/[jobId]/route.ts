import { NextResponse } from "next/server";
import fs from "fs";
import { getScoreBySlug } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: { jobId: string } }) {
  const { jobId } = params;
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  const since = searchParams.get('since') ? parseInt(searchParams.get('since')!, 10) : null;

  try {
    const raw = fs.readFileSync(`/tmp/score-${jobId}.json`, "utf-8");
    const data = JSON.parse(raw);
    // Only return terminal states from file — if still "running", fall through to Supabase
    if (data.status === 'complete' || data.status === 'error') {
      return NextResponse.json(data);
    }
  } catch { /* file not on this instance */ }

  // Supabase fallback — handles cross-instance polling on Vercel (not needed in dev)
  if (slug && process.env.NODE_ENV !== 'development') {
    try {
      const company = await getScoreBySlug(slug);
      if (company) {
        const scoredAt = new Date(company.scoredAt).getTime();
        // For new/rerun jobs, only accept results scored after polling started
        if (!since || scoredAt > since) {
          return NextResponse.json({
            status: 'complete',
            score: company.score,
            grade: company.grade,
            slug: company.slug,
            summary: company.checks,
            results: company.results,
          });
        }
      }
    } catch { /* Supabase unavailable, keep polling */ }
  }

  return NextResponse.json({ status: "running" });
}
