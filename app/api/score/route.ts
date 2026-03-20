import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { waitUntil } from "@vercel/functions";
import { calculateGrade } from "@/lib/scores";
import { upsertScore } from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 300;

const DOCS_SUBDOMAINS = /^(docs|developer|api|reference|developers)\./i;
const DOCS_PATHS = /\/(docs|api|reference|guides|developer|sdk|learn|manual|documentation)\//i;
const DOCS_PLATFORMS = /(readme\.io|gitbook\.io|mintlify\.app|buildwithfern\.com\/learn|\.fern\.dev|\.readme\.io|\.gitbook\.io|github\.io|notion\.site)/i;

function jobPath(jobId: string) {
  return `/tmp/score-${jobId}.json`;
}

function writeJob(jobId: string, data: Record<string, unknown>) {
  try {
    fs.writeFileSync(jobPath(jobId), JSON.stringify(data));
  } catch (e) {
    console.error("[score] writeJob failed:", e);
  }
}

async function detectDocsUrl(url: string): Promise<{ isLikely: boolean; warning?: string; suggestion?: string }> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { isLikely: false, warning: "Invalid URL format." };
  }

  const host = parsed.hostname;
  const pathStr = parsed.pathname + "/";

  if (DOCS_SUBDOMAINS.test(host)) return { isLikely: true };
  if (DOCS_PATHS.test(pathStr)) return { isLikely: true };
  if (DOCS_PLATFORMS.test(host + parsed.pathname)) return { isLikely: true };

  try {
    const llmsUrl = `${parsed.origin}/llms.txt`;
    const r = await fetch(llmsUrl, {
      signal: AbortSignal.timeout(5000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AgentScore/1.0)" },
    });
    if (r.ok) return { isLikely: true };
  } catch {
    // ignore
  }

  try {
    const r = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AgentScore/1.0)",
        Accept: "text/html",
      },
    });

    if (!r.ok) {
      return {
        isLikely: false,
        warning: `The URL returned HTTP ${r.status}. Verify it is publicly accessible.`,
      };
    }

    const html = await r.text();
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].toLowerCase() : "";
    if (/docs|documentation|api\s|reference|developer|quickstart/i.test(title)) return { isLikely: true };
    const codeCount = (html.match(/<pre|<code/g) || []).length;
    if (codeCount >= 3) return { isLikely: true };
    if (/getting started|api reference|quickstart|sdk reference/i.test(html)) return { isLikely: true };

    const baseDomain = host.replace(/^www\./, "");
    return {
      isLikely: false,
      warning: `This URL looks like a marketing or product site, not a documentation site.`,
      suggestion: `Try: docs.${baseDomain}, ${parsed.origin}/docs, or ${parsed.origin}/api`,
    };
  } catch {
    return {
      isLikely: false,
      warning: `Could not fetch the URL — it may be protected by bot-detection.`,
      suggestion: `Try: docs.${parsed.hostname.replace(/^www\./, "")}`,
    };
  }
}

function urlToSlug(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    const pathPart = parsed.pathname.replace(/\//g, "-").replace(/^-+|-+$/g, "");
    const base = pathPart ? `${host}-${pathPart}` : host;
    return base.replace(/[^a-z0-9-]/gi, "-").replace(/-+/g, "-").toLowerCase().slice(0, 80);
  } catch {
    return "unknown";
  }
}

async function runJob(jobId: string, url: string, slug?: string, name?: string) {
  console.log("[score] runJob start:", jobId, url);
  try {
    const { runChecks } = await import("afdocs");

    // Race against a 50s hard timeout so the job always writes a terminal state
    const result = await Promise.race([
      runChecks(url, {
        requestTimeout: 8000,
        requestDelay: 0,
        maxConcurrency: 6,
        maxLinksToTest: 10,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Scoring timed out — the docs site may be slow or blocking automated requests.")), 50_000)
      ),
    ]);
    console.log("[score] runChecks complete:", JSON.stringify(result.summary));

    const score = Math.round((result.summary.pass / result.summary.total) * 100);
    const grade = calculateGrade(score);
    const effectiveSlug = slug || urlToSlug(url);
    const effectiveName = name ?? effectiveSlug;

    const companyData = {
      name: effectiveName,
      slug: effectiveSlug,
      category: "Other",
      docsUrl: url,
      score,
      grade,
      scoredAt: new Date().toISOString(),
      checks: {
        total: result.summary.total,
        pass: result.summary.pass,
        warn: result.summary.warn,
        fail: result.summary.fail,
      },
      results: result.results,
    };

    // Persist to Supabase (primary store)
    try {
      await upsertScore(companyData);
      console.log("[score] Supabase upsert complete for:", effectiveSlug);
    } catch (dbErr) {
      console.error("[score] Supabase upsert failed:", dbErr instanceof Error ? dbErr.message : dbErr);
    }

    // Generate and store OG image
    try {
      const { generateOgImageBuffer } = await import("@/lib/og-image-generator");
      const { uploadOgImage } = await import("@/lib/supabase");
      const buffer = await generateOgImageBuffer(companyData);
      await uploadOgImage(effectiveSlug, buffer);
      console.log("[score] OG image uploaded for:", effectiveSlug);
    } catch (ogErr) {
      console.error("[score] OG image generation failed:", ogErr instanceof Error ? ogErr.message : ogErr);
    }

    // Best-effort fallback: write to scores.json
    try {
      const scoresPath = path.join(process.cwd(), "data", "scores.json");
      const scores = JSON.parse(fs.readFileSync(scoresPath, "utf-8"));
      scores[effectiveSlug] = companyData;
      fs.writeFileSync(scoresPath, JSON.stringify(scores, null, 2));
    } catch {
      // expected to fail on Vercel read-only fs — Supabase is the source of truth
    }

    writeJob(jobId, {
      status: "complete",
      score,
      grade,
      slug: effectiveSlug,
      summary: result.summary,
      results: result.results,
    });
  } catch (error) {
    console.error("[score] runJob error:", error instanceof Error ? error.stack : error);
    writeJob(jobId, {
      status: "error",
      message: error instanceof Error ? error.message : "Scoring failed",
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, slug, name, skipDetection } = body;
    console.log("[score] POST received", { url, slug, skipDetection });

    if (!url) {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }

    // Fast docs-site detection before starting the async job
    if (!skipDetection) {
      let existingScores: Record<string, unknown> = {};
      try {
        const scoresPath = path.join(process.cwd(), "data", "scores.json");
        existingScores = JSON.parse(fs.readFileSync(scoresPath, "utf-8"));
      } catch {
        // ignore
      }
      const alreadyKnown = slug && existingScores[slug];
      if (!alreadyKnown) {
        const detection = await detectDocsUrl(url);
        console.log("[score] detection:", JSON.stringify(detection));
        if (!detection.isLikely) {
          return NextResponse.json(
            { error: "not_a_docs_site", message: detection.warning, suggestion: detection.suggestion },
            { status: 422 }
          );
        }
      }
    }

    // Generate job, write pending state, kick off background work
    const jobId = crypto.randomUUID();
    writeJob(jobId, { status: "running" });
    console.log("[score] job created:", jobId);

    waitUntil(runJob(jobId, url, slug, name));

    return NextResponse.json({ jobId });
  } catch (error) {
    console.error("[score] POST error:", error instanceof Error ? error.stack : error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
