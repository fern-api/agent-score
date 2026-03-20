import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");

function calculateGrade(score) {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
}

async function main() {
  const companiesPath = path.join(dataDir, "companies.json");
  const scoresPath = path.join(dataDir, "scores.json");

  const companies = JSON.parse(fs.readFileSync(companiesPath, "utf-8"));

  let scores = {};
  if (fs.existsSync(scoresPath)) {
    scores = JSON.parse(fs.readFileSync(scoresPath, "utf-8"));
  }

  const { runChecks } = await import("afdocs");

  console.log(`Scoring ${companies.length} companies...\n`);

  for (const company of companies) {
    try {
      console.log(`Scoring ${company.name} (${company.docsUrl})...`);
      const result = await runChecks(company.docsUrl);

      const score = Math.round(
        (result.summary.pass / result.summary.total) * 100
      );
      const grade = calculateGrade(score);

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
          warn: result.summary.warn,
          fail: result.summary.fail,
        },
        results: result.results,
      };

      console.log(`  -> ${company.name}: ${score} (${grade})\n`);
    } catch (err) {
      console.error(`  -> ERROR scoring ${company.name}:`, err.message || err);
    }
  }

  fs.writeFileSync(scoresPath, JSON.stringify(scores, null, 2));
  console.log(`\nDone! Scores saved to ${scoresPath}`);
}

main().catch(console.error);
