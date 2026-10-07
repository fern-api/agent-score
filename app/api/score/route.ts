import { NextResponse } from "next/server";
import fs from "fs";
import { waitUntil } from "@vercel/functions";
import { upsertScore, getScoreBySlug, getScoreSlugByDocsUrl } from "@/lib/supabase";
import { fetchOgName, domainToName } from "@/lib/og-name";
import { computeScore } from "afdocs";
import { AFDOCS_VERSION } from "@/lib/scoring";
import { inferCategory } from "@/lib/categorize";
import { isBlockedDomain } from "@/lib/blocked-domains";
import { resolveSlugAlias } from "@/lib/slug-aliases";
import { detectDocsUrl } from "@/lib/docs-detection";
import { urlToSlug, nameToSlug } from "@/lib/slug";

export const runtime = "nodejs";
export const maxDuration = 300;

// ---------------------------------------------------------------------------
// Rate limiting — cookie-based + IP-based, 5 scoring requests per hour
// ---------------------------------------------------------------------------

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 3_600_000;
const RL_COOKIE = 'score_rl';

// In-memory IP rate limit store (per serverless instance; supplements cookie RL)
const ipRateLimitStore = new Map<string, number[]>();

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

function checkIpRateLimit(request: Request): boolean {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') ?? 'unknown';
  if (ip === 'unknown') return true; // can't identify — let cookie RL handle it
  const now = Date.now();
  const recent = (ipRateLimitStore.get(ip) ?? []).filter(t => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    console.log('[score] IP rate limit exceeded:', ip);
    return false;
  }
  ipRateLimitStore.set(ip, [...recent, now]);
  // Prune old entries to avoid unbounded growth
  if (ipRateLimitStore.size > 5000) {
    const cutoff = now - RATE_WINDOW_MS;
    for (const [k, v] of ipRateLimitStore) {
      if (v.every(t => t < cutoff)) ipRateLimitStore.delete(k);
    }
  }
  return true;
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
        Object.entries(scored.categoryScores).map(([k, v]) => [k, typeof v === 'number' ? v : ((v as { score: number | null }).score ?? 0)])
      ),
      afdocsVersion: AFDOCS_VERSION,
    };

    try {
      await upsertScore(companyData);
      console.log("[score] Supabase upsert complete for:", effectiveSlug);
      const webhookUrl = process.env.SLACK_DEMO_WEBHOOK_URL;
      if (webhookUrl) {
        const scoredPageUrl = `https://fern-agent-score.vercel.app/agent-score/company/${effectiveSlug}`;
        const docsHost = new URL(url).hostname;
        fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: `:white_check_mark: *${effectiveName} scored ${score} (${grade})*\n*Docs:* <${url}|${docsHost}>\n*Results:* <${scoredPageUrl}|View score>` }),
        }).catch(() => {});
      }
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

    if (!rawUrl || typeof rawUrl !== 'string') {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }

    // Reject obviously garbage inputs early — before any async work
    if (rawUrl.length > 500) {
      console.log('[score] rejected: url too long', rawUrl.length);
      return NextResponse.json({ error: "invalid_url", message: "URL is too long." }, { status: 400 });
    }
    if (/[<>{}|\\^`\x00-\x1f]/.test(rawUrl)) {
      console.log('[score] rejected: url contains invalid characters');
      return NextResponse.json({ error: "invalid_url", message: "URL contains invalid characters." }, { status: 400 });
    }

    // Normalize — prepend https:// if no protocol so URL parsing works everywhere
    const url: string = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;

    // Validate it parses as a real URL with a proper hostname
    try {
      const parsed = new URL(url);
      if (!parsed.hostname || !parsed.hostname.includes('.')) {
        return NextResponse.json({ error: "invalid_url", message: "Please provide a valid URL." }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "invalid_url", message: "Please provide a valid URL." }, { status: 400 });
    }

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

    // Rate limiting — cookie-based + IP-based (skip on localhost)
    const host = request.headers.get('host') ?? '';
    const isLocalhost = host.startsWith('localhost') || host.startsWith('127.0.0.1');
    let rlTimestamps: number[] = [];
    if (!isLocalhost) {
      const { allowed, timestamps } = checkCookieRateLimit(request);
      const ipAllowed = checkIpRateLimit(request);
      if (!allowed || !ipAllowed) {
        console.log("[score] rate limit exceeded");
        return NextResponse.json(
          { error: "rate_limit", message: `You can score up to ${RATE_LIMIT} sites per hour. Try again later.` },
          { status: 429 }
        );
      }
      rlTimestamps = timestamps;
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
    // Fern preview/staging hosts (*.ferndocs.com) always slug by URL so they stay distinct from the
    // canonical live company entry — otherwise e.g. docusign.ferndocs.com collapses onto the "docusign" slug.
    const isFernHost = (() => { try { return /(^|\.)ferndocs\.com$/i.test(new URL(url).hostname); } catch { return false; } })();
    // A URL that is already on the leaderboard keeps its stored slug, so re-submitting it
    // updates that entry instead of creating a second one under a URL-derived slug (which is
    // what curated entries with a path — e.g. developer.salesforce.com/docs — would otherwise get).
    const storedSlugForUrl = slugParam ? null : await getScoreSlugByDocsUrl(url);
    const rawSlug =
      slugParam ||
      storedSlugForUrl ||
      (effectiveName && !urlPath && !isFernHost ? nameToSlug(effectiveName) : urlToSlug(url));
    // Alias a likely-typed domain (e.g. "monday" → "developer-monday-com-api-reference") to a curated
    // leaderboard entry. This is a *redirect for lookups only*: we surface the existing canonical entry
    // but never score/overwrite it. Actual scoring always stores under the raw slug (see runJob below).
    const aliasSlug = resolveSlugAlias(rawSlug);
    console.log("[score] resolved slug:", rawSlug, "name:", effectiveName, rawSlug !== aliasSlug ? `(alias → ${aliasSlug})` : '');

    // An explicit alias means this domain should ALWAYS surface a curated entry and never be
    // scored — e.g. the monday.com marketing apex resolves to its developer-docs entry. Resolve
    // it up front, independent of the force/dev cache path below and before docs detection, so
    // the user is navigated straight to that entry instead of hitting a "not a docs site"
    // rejection. Falls through to the normal flow only if the curated entry is missing.
    if (aliasSlug !== rawSlug) {
      try {
        const canonical = await getScoreBySlug(aliasSlug);
        if (canonical) {
          console.log("[score] alias redirect:", rawSlug, "→", canonical.slug);
          return NextResponse.json({ existing: true, slug: canonical.slug });
        }
        console.log("[score] alias target not found, falling through:", aliasSlug);
      } catch { /* lookup failed — fall through to normal flow */ }
    }

    // Return cached result if company already exists (skip when force=true or in development).
    // Prefer the alias target so a typed domain points at the curated entry.
    if (!force && process.env.NODE_ENV !== 'development') {
      try {
        const existing =
          (await getScoreBySlug(aliasSlug)) ??
          (aliasSlug !== rawSlug ? await getScoreBySlug(rawSlug) : null);
        if (existing) {
          console.log("[score] company already exists, returning cached result:", existing.slug);
          const jobId = crypto.randomUUID();
          writeJob(jobId, {
            status: "complete",
            score: existing.score,
            grade: existing.grade,
            slug: existing.slug,
            summary: {
              total: existing.checks.total,
              pass: existing.checks.pass,
              warn: existing.checks.warn,
              fail: existing.checks.fail,
            },
            results: existing.results,
          });
          return NextResponse.json({ jobId, slug: existing.slug, cached: true });
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
      runJob(jobId, url, rawSlug, effectiveName ?? undefined, hidden).catch(console.error);
    } else {
      waitUntil(runJob(jobId, url, rawSlug, effectiveName ?? undefined, hidden));
    }

    // Set updated rate limit cookie
    const response = NextResponse.json({ jobId, slug: rawSlug });
    response.headers.set('Set-Cookie', buildRateLimitCookie(rlTimestamps));
    return response;
  } catch (error) {
    console.error("[score] POST error:", error instanceof Error ? error.stack : error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
