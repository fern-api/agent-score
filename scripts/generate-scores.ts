import fs from "fs";
import path from "path";

interface Company {
  name: string;
  slug: string;
  category: string;
  docsUrl: string;
}

interface CheckResult {
  id: string;
  status: "pass" | "fail" | "warn";
  description: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RunChecksResult = any;

function calculateGrade(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
}

async function main() {
  const dataDir = path.join(process.cwd(), "data");
  const companiesPath = path.join(dataDir, "companies.json");
  const scoresPath = path.join(dataDir, "scores.json");

  const companies: Company[] = JSON.parse(
    fs.readFileSync(companiesPath, "utf-8")
  );

  // Load existing scores to preserve any we already have
  let scores: Record<string, unknown> = {};
  if (fs.existsSync(scoresPath)) {
    scores = JSON.parse(fs.readFileSync(scoresPath, "utf-8"));
  }

  const { runChecks } = await import("afdocs");

  console.log(`Scoring ${companies.length} companies...\n`);

  for (const company of companies) {
    try {
      console.log(`Scoring ${company.name} (${company.docsUrl})...`);
      const result: RunChecksResult = await runChecks(company.docsUrl);

      const score = Math.round(
        (result.summary.pass / result.summary.total) * 100
      );
      const grade = calculateGrade(score);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const warnCount = result.checks.filter((c: any) => c.status === "warn").length;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const failCount = result.checks.filter((c: any) => c.status === "fail").length;

      scores[company.slug] = {
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
          warn: warnCount,
          fail: failCount,
        },
      };

      console.log(`  -> ${company.name}: ${score} (${grade})\n`);
    } catch (err) {
      console.error(`  -> ERROR scoring ${company.name}:`, err);
    }
  }

  fs.writeFileSync(scoresPath, JSON.stringify(scores, null, 2));
  console.log(`\nDone! Scores saved to ${scoresPath}`);
}

main().catch(console.error);
