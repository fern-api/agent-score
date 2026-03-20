#!/usr/bin/env node

/**
 * score-all.js
 *
 * Reads companies.json and submits all documentation URLs to the backend's
 * batch-score endpoint. Then polls until every job has completed (or failed)
 * and prints a summary table.
 *
 * Usage:
 *   node scripts/score-all.js                     # uses default http://localhost:3001
 *   API_URL=http://localhost:4000 node scripts/score-all.js
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_URL = process.env.API_URL || "http://localhost:3001";
const COMPANIES_PATH = join(__dirname, "..", "data", "companies.json");
const POLL_INTERVAL_MS = 5_000; // 5 seconds between polls

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function post(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${path} failed (${res.status}): ${text}`);
  }
  return res.json();
}

async function get(path) {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET ${path} failed (${res.status}): ${text}`);
  }
  return res.json();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // Load companies
  let companies;
  try {
    const raw = readFileSync(COMPANIES_PATH, "utf-8");
    companies = JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to read ${COMPANIES_PATH}:`, err.message);
    process.exit(1);
  }

  console.log(`Loaded ${companies.length} companies from ${COMPANIES_PATH}`);
  console.log(`Submitting batch to ${API_URL}/api/v1/batch-score ...\n`);

  // Submit batch
  const batchResult = await post("/api/v1/batch-score", { companies });
  const jobIds = batchResult.jobs.map((j) => j.id);
  console.log(`Queued ${jobIds.length} jobs.\n`);

  // Poll until all jobs are terminal (completed or failed)
  const terminal = new Set(["completed", "failed"]);
  let allDone = false;

  while (!allDone) {
    await sleep(POLL_INTERVAL_MS);

    const { jobs } = await get("/api/v1/jobs");
    const tracked = jobs.filter((j) => jobIds.includes(j.id));

    const completed = tracked.filter((j) => j.status === "completed").length;
    const failed = tracked.filter((j) => j.status === "failed").length;
    const running = tracked.filter((j) => j.status === "running").length;
    const queued = tracked.filter((j) => j.status === "queued").length;

    process.stdout.write(
      `\r  Completed: ${completed}  Failed: ${failed}  Running: ${running}  Queued: ${queued}  `
    );

    allDone = tracked.every((j) => terminal.has(j.status));
  }

  console.log("\n\nAll jobs finished. Fetching leaderboard...\n");

  // Print leaderboard
  const { leaderboard } = await get("/api/v1/leaderboard");

  // Table header
  const nameWidth = 20;
  const catWidth = 16;
  console.log(
    "Rank".padEnd(6) +
      "Company".padEnd(nameWidth) +
      "Category".padEnd(catWidth) +
      "Score".padStart(7) +
      "  Pass/Total"
  );
  console.log("-".repeat(6 + nameWidth + catWidth + 7 + 12));

  leaderboard.forEach((entry, i) => {
    const rank = String(i + 1).padEnd(6);
    const name = (entry.name ?? entry.url).slice(0, nameWidth - 2).padEnd(nameWidth);
    const cat = (entry.category ?? "-").slice(0, catWidth - 2).padEnd(catWidth);
    const score =
      entry.score != null ? String(entry.score).padStart(7) : "   N/A";
    const passFail = `  ${entry.pass}/${entry.total}`;
    console.log(`${rank}${name}${cat}${score}${passFail}`);
  });

  console.log(`\nTotal scored: ${leaderboard.length}`);
}

main().catch((err) => {
  console.error("\nFatal error:", err);
  process.exit(1);
});
