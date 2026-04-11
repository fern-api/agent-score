/**
 * Score a single URL locally and upload the result to Supabase.
 * Useful for sites that time out on the live scorer.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/score-single.ts <url> [name] [slug] [category] [--hidden]
 *
 * Examples:
 *   npx tsx --env-file=.env.local scripts/score-single.ts https://developers.google.com/maps/ "Google Maps" google-maps "DevTools"
 *   npx tsx --env-file=.env.local scripts/score-single.ts https://developers.google.com/maps/ "Google Maps" google-maps "DevTools" --hidden
 */
import { upsertScore } from "../lib/supabase";
import { inferCategory } from "../lib/categorize";
import { computeScore } from "afdocs";

function elapsed(start: number): string {
  const s = Math.floor((Date.now() - start) / 1000);
  return s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;
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

async function main() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const flags = process.argv.slice(2).filter((a) => a.startsWith("--"));

  const rawUrl = args[0];
  if (!rawUrl) {
    console.error("Usage: score-single.ts <url> [name] [slug] [category] [--hidden]");
    process.exit(1);
  }

  const url = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
  const nameArg = args[1];
  const slugArg = args[2];
  const categoryArg = args[3];
  const hidden = flags.includes("--hidden");

  console.log(`\nScoring: ${url}`);
  console.log(`  name:     ${nameArg ?? "(derive from url)"}`);
  console.log(`  slug:     ${slugArg ?? "(derive from url)"}`);
  console.log(`  category: ${categoryArg ?? "(infer)"}`);
  console.log(`  hidden:   ${hidden}\n`);

  const { createContext, getChecksSorted } = await import("afdocs");

  const ctx = createContext(url, {
    requestTimeout: 15_000,
    requestDelay: 200,
    maxConcurrency: 3,
    maxLinksToTest: 10,
  });

  const allChecks = getChecksSorted();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results: any[] = [];

  for (let i = 0; i < allChecks.length; i++) {
    const check = allChecks[i];
    const checkStart = Date.now();
    process.stdout.write(`[${i + 1}/${allChecks.length}] ${check.id} ... `);
    try {
      const r = await check.run(ctx);
      results.push(r);
      ctx.previousResults.set(check.id, r);
      process.stdout.write(`${r.status} (${elapsed(checkStart)})\n`);
    } catch (err) {
      results.push({ id: check.id, category: check.category, status: "error", message: `${err instanceof Error ? err.message : String(err)}` });
      process.stdout.write(`error (${elapsed(checkStart)})\n`);
    }
  }

  const summary = {
    total: results.length,
    pass: results.filter((r) => r.status === "pass").length,
    warn: results.filter((r) => r.status === "warn").length,
    fail: results.filter((r) => r.status === "fail").length,
    skip: results.filter((r) => r.status === "skip").length,
    error: results.filter((r) => r.status === "error").length,
  };
  const result = { url, timestamp: new Date().toISOString(), results, summary };

  console.log(`Checks done: ${summary.pass}/${summary.total} pass, ${summary.fail} fail, ${summary.warn} warn`);

  const scored = computeScore(result);
  const score = scored.overall;
  const grade = scored.grade;

  const effectiveSlug = slugArg ?? urlToSlug(url);
  const effectiveName = nameArg ?? effectiveSlug;

  const category = categoryArg ?? (await inferCategory(url, effectiveName));
  console.log(`Category: ${category}`);

  let isFern = false;
  try {
    const fernRes = await fetch(`${url}/api/fern-docs/llms.txt`, {
      signal: AbortSignal.timeout(3000),
    });
    isFern = fernRes.ok;
  } catch { /* not fern */ }

  const companyData = {
    name: effectiveName,
    slug: effectiveSlug,
    category,
    docsUrl: url,
    score,
    grade,
    hidden,
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
      Object.entries(scored.categoryScores).map(([k, v]) => [
        k,
        typeof v === "number" ? v : (v as { score: number }).score,
      ])
    ),
  };

  console.log(`\nScore: ${score} (${grade})`);
  console.log(`Checks: ${result.summary.pass}/${result.summary.total} pass`);

  process.stdout.write("Uploading to Supabase ... ");
  await upsertScore(companyData);
  process.stdout.write(`done\n`);
  console.log(`slug="${effectiveSlug}"`);

  // OG image
  try {
    process.stdout.write("Generating OG image ... ");
    const { generateOgImageBuffer } = await import("../lib/og-image-generator");
    const { uploadOgImage } = await import("../lib/supabase");
    const buffer = await generateOgImageBuffer(companyData);
    await uploadOgImage(effectiveSlug, buffer);
    process.stdout.write("uploaded\n");
  } catch (e) {
    process.stdout.write("\n");
    console.warn("OG image skipped:", (e as Error).message);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
