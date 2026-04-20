import { NextResponse } from "next/server";
import fs from "fs";
import { waitUntil } from "@vercel/functions";
import { upsertScore, getScoreBySlug } from "@/lib/supabase";
import { fetchOgName, domainToName } from "@/lib/og-name";
import { computeScore } from "afdocs";
import { inferCategory } from "@/lib/categorize";
import { isBlockedDomain } from "@/lib/blocked-domains";

export const runtime = "nodejs";
export const maxDuration = 300;

const DOCS_SUBDOMAINS = /^(docs|developer|api|reference|developers)\./i;
const DOCS_PATHS = /\/(docs|api|reference|guides|developer|sdk|learn|manual|documentation)\//i;
const DOCS_PLATFORMS = /(readme\.io|gitbook\.io|mintlify\.app|buildwithfern\.com\/learn|\.fern\.dev|\.readme\.io|\.gitbook\.io|github\.io|notion\.site)/i;

// ---------------------------------------------------------------------------
// Rate limiting — cookie-based, 5 scoring requests per hour
// ---------------------------------------------------------------------------

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 3_600_000;
const RL_COOKIE = 'score_rl';

function checkCookieRateLimit(request: Request): { allowed: boolean; timestamps: number[] } {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${RL_COOKIE}=([^;]*)`));
  let timestamps: number[] = [];
  if (match) {
    try {
      const parsed = JSON.parse(decodeURIComponent(match[1]));
      if (Array.isArray(parsed)) {
        const now = Date.now();
        timestamps = parsed.filter((t: unknown) => typeof t === 'number' && now - t < RATE_WINDOW_MS);
      }
    } catch { /* malformed cookie — treat as empty */ }
  }
  return { allowed: timestamps.length < RATE_LIMIT, timestamps };
}

function buildRateLimitCookie(timestamps: number[]): string {
  const value = encodeURIComponent(JSON.stringify([...timestamps, Date.now()]));
  return `${RL_COOKIE}=${value}; Path=/; Max-Age=3600; HttpOnly; SameSite=Strict`;
}

// ---------------------------------------------------------------------------
// Visibility heuristics
// ---------------------------------------------------------------------------

// Free/personal hosting — score but don't show on leaderboard
const PERSONAL_HOSTING = /(^|\.)((github|gitlab)\.io|vercel\.app|netlify\.app|pages\.dev|surge\.sh|render\.com|railway\.app|fly\.dev|cloudflare\.dev|web\.app|firebaseapp\.com|glitch\.me|replit\.dev|codepen\.io)$/i;

async function isKnownCompany(url: string): Promise<boolean> {
  try {
    const { hostname } = new URL(url);
    const domain = hostname.replace(/^(www|docs|developer|api|reference|developers)\./i, '');
    const res = await fetch(`https://logo.clearbit.com/${domain}`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(4000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function shouldHide(url: string): Promise<boolean> {
  try {
    const { hostname } = new URL(url);
    if (PERSONAL_HOSTING.test(hostname)) {
      const known = await isKnownCompany(url);
      console.log('[score] personal hosting domain, clearbit known:', known, hostname);
      return !known;
    }
    return false;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Job file helpers
// ---------------------------------------------------------------------------

function writeJob(jobId: string, data: Record<string, unknown>) {
  try {
    fs.writeFileSync(`/tmp/score-${jobId}.json`, JSON.stringify(data));
  } catch (e) {
    console.error("[score] writeJob failed:", e);
  }
}

// ---------------------------------------------------------------------------
// Docs-site detection
// ---------------------------------------------------------------------------

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
    const r = await fetch(`${parsed.origin}/llms.txt`, {
      signal: AbortSignal.timeout(5000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AgentScore/1.0)" },
    });
    if (r.ok) return { isLikely: true };
  } catch { /* ignore */ }

  try {
    const r = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AgentScore/1.0)", Accept: "text/html" },
    });
    if (!r.ok) {
      return { isLikely: false, warning: `The URL returned HTTP ${r.status}. Verify it is publicly accessible.` };
    }
    const html = await r.text();
    const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.toLowerCase() ?? "";
    if (/docs|documentation|api\s|reference|developer|quickstart/i.test(title)) return { isLikely: true };
    if ((html.match(/<pre|<code/g) ?? []).length >= 3) return { isLikely: true };
    if (/getting started|api reference|quickstart|sdk reference/i.test(html)) return { isLikely: true };
    const baseDomain = host.replace(/^www\./, "");
    return {
      isLikely: false,
      warning: `This URL looks like a marketing or product site, not a documentation site.`,
      suggestion: `docs.${baseDomain}, ${parsed.origin}/docs, or ${parsed.origin}/api`,
    };
  } catch {
    return {
      isLikely: false,
      warning: `Could not fetch the URL — it may be protected by bot-detection.`,
      suggestion: `docs.${parsed.hostname.replace(/^www\./, "")}`,
    };
  }
}

// ---------------------------------------------------------------------------
// Slug helpers
// ---------------------------------------------------------------------------

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

function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// ---------------------------------------------------------------------------
// Job runner
// ---------------------------------------------------------------------------

async function runJob(jobId: string, url: string, slug?: string, name?: string, hidden?: boolean) {
  console.log("[score] runJob start:", jobId, url);
  try {
    const { runChecks } = await import("afdocs");

    const scoringOpts = {
      requestTimeout: process.env.NODE_ENV === 'development' ? 60_000 : 8000,
      requestDelay: 0,
      maxConcurrency: 6,
      maxLinksToTest: 10,
    };
    console.log("[score] runChecks options:", JSON.stringify(scoringOpts));
    const runChecksStart = Date.now();
    const runChecksPromise = runChecks(url, scoringOpts);

    let heartbeat: ReturnType<typeof setInterval> | undefined;
    const result = process.env.NODE_ENV === 'development'
      ? await runChecksPromise
      : await Promise.race([
          runChecksPromise.finally(() => clearInterval(heartbeat)),
          new Promise<never>((_, reject) => {
            heartbeat = setInterval(() => {
              console.log(`[score] still running after ${Math.round((Date.now() - runChecksStart) / 1000)}s for: ${url}`);
            }, 15_000);
            setTimeout(() => {
              clearInterval(heartbeat);
              reject(new Error("Scoring timed out — the docs site may be slow or blocking automated requests."));
            }, 120_000);
          }),
        ]);
    console.log(`[score] runChecks finished in ${Math.round((Date.now() - runChecksStart) / 1000)}s`);
    console.log("[score] runChecks complete:", JSON.stringify(result.summary));

    const scored = computeScore(result);
    const score = scored.overall;
    const grade = scored.grade;

    const effectiveSlug = slug || urlToSlug(url);
    const effectiveName = name ?? effectiveSlug;

    const category = await inferCategory(url, effectiveName);
    console.log("[score] inferred category:", category, "for:", effectiveName);

    let isFern = false;
    try {
      const fernRes = await fetch(`${url}/api/fern-docs/llms.txt`, {
        signal: AbortSignal.timeout(3000),
      });
      isFern = fernRes.ok;
    } catch { /* not fern */ }
    console.log("[score] isFern:", isFern, "for:", url);

    const companyData = {
      name: effectiveName,
      slug: effectiveSlug,
      category,
      docsUrl: url,
      score,
      grade,
      ...(hidden !== undefined ? { hidden } : {}),
      isFern,
      scoredAt: new Date().toISOString(),
      checks: {
        total: result.summary.total,
        pass: result.summary.pass,
        warn: result.summary.warn,
        fail: result.summary.fail,
      },
      results: result.results,
      categoryScores: Object.fromEntries(
        Object.entries(scored.categoryScores).map(([k, v]) => [k, typeof v === 'number' ? v : (v as { score: number }).score])
      ),
    };

    try {
      await upsertScore(companyData);
      console.log("[score] Supabase upsert complete for:", effectiveSlug);
    } catch (dbErr) {
      console.error("[score] Supabase upsert failed:", dbErr instanceof Error ? dbErr.message : dbErr);
    }

    try {
      const { generateOgImageBuffer } = await import("@/lib/og-image-generator");
      const { uploadOgImage } = await import("@/lib/supabase");
      const buffer = await generateOgImageBuffer(companyData);
      await uploadOgImage(effectiveSlug, buffer);
      console.log("[score] OG image uploaded for:", effectiveSlug);
    } catch (ogErr) {
      console.error("[score] OG image generation failed:", ogErr instanceof Error ? ogErr.message : ogErr);
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
    const message = error instanceof Error ? error.message : "Scoring failed";
    const isTimeout = message.includes("timed out");
    writeJob(jobId, { status: "error", message, isTimeout });
    const webhookUrl = process.env.SLACK_DEMO_WEBHOOK_URL;
    if (webhookUrl) {
      const icon = isTimeout ? ":hourglass:" : ":x:";
      const label = isTimeout
        ? "Failed scoring request — site timed out, user wants to be notified when working"
        : "Failed scoring request — user wants to be notified when working";
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `${icon} *${label}*\n*URL:* <${url}|${url}>\n*Error:* ${message}` }),
      }).catch(() => {});
    }
  }
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url: rawUrl, slug: slugParam, name: nameParam, skipDetection, force } = body;
    console.log("[score] POST received", { url: rawUrl, slugParam, skipDetection, force });

    if (!rawUrl) {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }

    // Normalize — prepend https:// if no protocol so URL parsing works everywhere
    const url: string = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;

    if (isBlockedDomain(url)) {
      try {
        const blockedSlug = slugParam || urlToSlug(url);
        await upsertScore({
          name: blockedSlug,
          slug: blockedSlug,
          category: 'Other',
          docsUrl: url,
          score: 0,
          grade: 'F',
          hidden: true,
          scoredAt: new Date().toISOString(),
          checks: { total: 0, pass: 0, warn: 0, fail: 0 },
        });
      } catch (e) {
        console.error("[score] blocked domain DB record failed:", e);
      }
      return NextResponse.json({ error: "blocked", message: "This site is not eligible for scoring." }, { status: 403 });
    }

    // Rate limiting — cookie-based (skip on localhost)
    const host = request.headers.get('host') ?? '';
    const isLocalhost = host.startsWith('localhost') || host.startsWith('127.0.0.1');
    const { allowed, timestamps } = checkCookieRateLimit(request);
    if (!isLocalhost && !allowed) {
      console.log("[score] rate limit exceeded");
      return NextResponse.json(
        { error: "rate_limit", message: `You can score up to ${RATE_LIMIT} sites per hour. Try again later.` },
        { status: 429 }
      );
    }

    // Resolve display name: compare og name vs domain name, pick the shorter
    const ogName = nameParam ? null : await fetchOgName(url);
    const fromDomain = nameParam ? null : domainToName(url);
    let derivedName: string | null = null;
    if (ogName && fromDomain) {
      derivedName = ogName.length <= fromDomain.length ? ogName : fromDomain;
    } else {
      derivedName = ogName ?? fromDomain ?? null;
    }
    const effectiveName: string | null = nameParam ?? derivedName ?? null;
    console.log("[score] name candidates — og:", ogName, "domain:", fromDomain, "chosen:", effectiveName);

    // When the URL has a meaningful path (e.g. docs.nvidia.com/dynamo vs docs.nvidia.com/heavyai),
    // use the full URL slug so path-scoped sites don't collide on the domain-derived name slug.
    const urlPath = (() => { try { return new URL(url).pathname.replace(/^\/|\/$/g, ''); } catch { return ''; } })();
    const effectiveSlug = slugParam || (effectiveName && !urlPath ? nameToSlug(effectiveName) : urlToSlug(url));
    console.log("[score] resolved slug:", effectiveSlug, "name:", effectiveName);

    // Return cached result if company already exists (skip when force=true or in development)
    if (!force && process.env.NODE_ENV !== 'development') {
      try {
        const existing = await getScoreBySlug(effectiveSlug);
        if (existing) {
          console.log("[score] company already exists, returning cached result:", effectiveSlug);
          const jobId = crypto.randomUUID();
          writeJob(jobId, {
            status: "complete",
            score: existing.score,
            grade: existing.grade,
            slug: effectiveSlug,
            summary: {
              total: existing.checks.total,
              pass: existing.checks.pass,
              warn: existing.checks.warn,
              fail: existing.checks.fail,
            },
            results: existing.results,
          });
          return NextResponse.json({ jobId, slug: effectiveSlug, cached: true });
        }
      } catch { /* Supabase check failed — proceed with scoring */ }
    }

    // Docs-site detection
    if (!skipDetection) {
      const detection = await detectDocsUrl(url);
      console.log("[score] detection:", JSON.stringify(detection));
      if (!detection.isLikely) {
        return NextResponse.json(
          { error: "not_a_docs_site", message: detection.warning, suggestion: detection.suggestion },
          { status: 422 }
        );
      }
    }

    // New sites are always hidden until manually approved.
    // Reruns (force=true) pass undefined so upsertScore doesn't overwrite the existing value.
    const hidden = force ? undefined : true;
    console.log("[score] hidden:", hidden, url);

    // Start job
    const jobId = crypto.randomUUID();
    writeJob(jobId, { status: "running" });
    console.log("[score] job created:", jobId);

    if (process.env.NODE_ENV === 'development') {
      runJob(jobId, url, effectiveSlug, effectiveName ?? undefined, hidden).catch(console.error);
    } else {
      waitUntil(runJob(jobId, url, effectiveSlug, effectiveName ?? undefined, hidden));
    }

    // Set updated rate limit cookie
    const response = NextResponse.json({ jobId, slug: effectiveSlug });
    response.headers.set('Set-Cookie', buildRateLimitCookie(timestamps));
    return response;
  } catch (error) {
    console.error("[score] POST error:", error instanceof Error ? error.stack : error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
