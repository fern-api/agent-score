/**
 * Re-scores all companies from companies.json, saving results to Supabase.
 * Run with:
 *   npx tsx scripts/rescore-to-supabase.ts
 */
import fs from "fs";
import path from "path";
import { upsertScore } from "../lib/supabase";

interface Company {
  name: string;
  slug: string;
  category: string;
  docsUrl: string;
}

function calculateGrade(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
}

async function main() {
  const companies: Company[] = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "data", "companies.json"), "utf-8")
  );

  const { runChecks } = await import("afdocs");

  console.log(`Re-scoring ${companies.length} companies...\n`);

  let succeeded = 0;
  let failed = 0;

  for (const company of companies) {
    try {
      console.log(`Scoring ${company.name} (${company.docsUrl})...`);
      const result = await runChecks(company.docsUrl, {
        requestTimeout: 8000,
        requestDelay: 0,
        maxConcurrency: 6,
        maxLinksToTest: 10,
      });

      const score = Math.round((result.summary.pass / result.summary.total) * 100);
      const grade = calculateGrade(score);

      const companyData = {
        name: company.name,
        slug: company.slug,
        category: company.category,
        docsUrl: company.docsUrl,
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

      await upsertScore(companyData);
      console.log(`  [OK] ${company.name}: ${score} (${grade})`);
      succeeded++;
    } catch (err) {
      console.error(`  [FAIL] ${company.name}:`, (err as Error).message);
      failed++;
    }
  }

  console.log(`\nDone. ${succeeded} succeeded, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
