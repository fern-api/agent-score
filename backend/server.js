import express from "express";
import cors from "cors";
import { runChecks } from "afdocs";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, _res, next) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${req.method} ${req.url}`);
  next();
});

// ---------------------------------------------------------------------------
// Score persistence
// ---------------------------------------------------------------------------
const DATA_DIR = join(__dirname, "data");
const SCORES_PATH = join(DATA_DIR, "scores.json");

/** Ensure the data directory exists. */
function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Load scores from disk. Returns an object keyed by URL.
 * Handles legacy format (keyed by slug with checks.pass/checks.total)
 * by normalising entries to the canonical shape.
 */
function loadScores() {
  ensureDataDir();
  if (!existsSync(SCORES_PATH)) {
    writeFileSync(SCORES_PATH, "{}", "utf-8");
    return {};
  }
  try {
    const raw = readFileSync(SCORES_PATH, "utf-8");
    const parsed = JSON.parse(raw);

    // Normalise: legacy entries may be keyed by slug and use checks.pass/checks.total
    const normalised = {};
    for (const [key, entry] of Object.entries(parsed)) {
      const url = entry.url ?? entry.docsUrl ?? key;
      normalised[url] = {
        url,
        name: entry.name ?? null,
        slug: entry.slug ?? null,
        category: entry.category ?? null,
        score: entry.score ?? null,
        pass: entry.pass ?? entry.checks?.pass ?? null,
        total: entry.total ?? entry.checks?.total ?? null,
        report: entry.report ?? null,
        scoredAt: entry.scoredAt ?? null,
      };
    }
    return normalised;
  } catch (err) {
    console.error("Failed to parse scores.json, starting fresh:", err.message);
    return {};
  }
}

/** Persist scores to disk. */
function saveScores() {
  ensureDataDir();
  writeFileSync(SCORES_PATH, JSON.stringify(scores, null, 2), "utf-8");
}

// In-memory scores store (url -> score entry)
const scores = loadScores();

// ---------------------------------------------------------------------------
// Job queue
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} Job
 * @property {string} id
 * @property {string} url
 * @property {string} [name]       - Optional company name
 * @property {string} [slug]       - Optional company slug
 * @property {string} [category]   - Optional company category
 * @property {"queued"|"running"|"completed"|"failed"} status
 * @property {object|null} result
 * @property {string|null} error
 * @property {string} createdAt
 * @property {string|null} completedAt
 */

/** @type {Map<string, Job>} */
const jobs = new Map();

/** @type {Job[]} */
const queue = [];

let processing = false;

/** Create a new job and add it to the queue. Returns the job. */
function enqueueJob({ url, name, slug, category }) {
  const job = {
    id: randomUUID(),
    url,
    name: name ?? null,
    slug: slug ?? null,
    category: category ?? null,
    status: "queued",
    result: null,
    error: null,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
  jobs.set(job.id, job);
  queue.push(job);
  processQueue(); // kick off processing (no-op if already running)
  return job;
}

/** Process the queue one job at a time. */
async function processQueue() {
  if (processing) return;
  processing = true;

  while (queue.length > 0) {
    const job = queue.shift();
    job.status = "running";
    console.log(`[queue] Running job ${job.id} — scoring ${job.url}`);

    const startTime = Date.now();
    try {
      const report = await runChecks(job.url);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      job.status = "completed";
      job.result = report;
      job.completedAt = new Date().toISOString();

      console.log(
        `[queue] Job ${job.id} completed in ${elapsed}s — ${report.summary.pass}/${report.summary.total} checks passed`
      );

      // Persist to scores store
      const scoreEntry = {
        url: job.url,
        name: job.name,
        slug: job.slug,
        category: job.category,
        score: report.summary.score,
        pass: report.summary.pass,
        total: report.summary.total,
        report,
        scoredAt: job.completedAt,
      };
      scores[job.url] = scoreEntry;
      saveScores();
    } catch (err) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      job.status = "failed";
      job.error = err instanceof Error ? err.message : String(err);
      job.completedAt = new Date().toISOString();
      console.error(
        `[queue] Job ${job.id} failed after ${elapsed}s:`,
        job.error
      );
    }
  }

  processing = false;
}

// ---------------------------------------------------------------------------
// URL validation helper
// ---------------------------------------------------------------------------
function validateUrl(url) {
  if (!url || typeof url !== "string") {
    return { valid: false, error: "Missing required parameter: url" };
  }
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }
  if (!parsed.protocol.startsWith("http")) {
    return { valid: false, error: "URL must use http or https protocol" };
  }
  return { valid: true, parsed };
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    jobsInQueue: queue.length,
    jobsTotal: jobs.size,
    scoresStored: Object.keys(scores).length,
  });
});

// ---------------------------------------------------------------------------
// GET /api/v1/score?url=...
// Synchronous scoring — blocks until the score is ready.
// ---------------------------------------------------------------------------
app.get("/api/v1/score", async (req, res) => {
  const { url } = req.query;
  const validation = validateUrl(url);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  try {
    console.log(`Scoring ${url} ...`);
    const startTime = Date.now();
    const report = await runChecks(url);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(
      `Scored ${url} in ${elapsed}s — ${report.summary.pass}/${report.summary.total} checks passed`
    );

    // Persist to scores store
    const scoreEntry = {
      url,
      name: null,
      slug: null,
      category: null,
      score: report.summary.score,
      pass: report.summary.pass,
      total: report.summary.total,
      report,
      scoredAt: new Date().toISOString(),
    };
    scores[url] = scoreEntry;
    saveScores();

    res.json(report);
  } catch (err) {
    console.error(`Scoring failed for ${url}:`, err);
    res.status(500).json({
      error: "Scoring failed",
      message: err instanceof Error ? err.message : String(err),
    });
  }
});

// ---------------------------------------------------------------------------
// POST /api/v1/batch-score
// Accepts { urls: string[] } or { companies: Array<{docsUrl, name?, slug?, category?}> }
// Queues each URL for background scoring.
// ---------------------------------------------------------------------------
app.post("/api/v1/batch-score", (req, res) => {
  const { urls, companies } = req.body;

  // Normalise input: accept either an array of URLs or an array of company objects
  let items = [];

  if (Array.isArray(companies) && companies.length > 0) {
    items = companies.map((c) => ({
      url: c.docsUrl ?? c.url,
      name: c.name ?? null,
      slug: c.slug ?? null,
      category: c.category ?? null,
    }));
  } else if (Array.isArray(urls) && urls.length > 0) {
    items = urls.map((u) => ({ url: u, name: null, slug: null, category: null }));
  } else {
    return res.status(400).json({
      error:
        'Request body must contain "urls" (string[]) or "companies" (object[])',
    });
  }

  // Validate every URL up-front before queuing any
  const errors = [];
  for (const item of items) {
    const v = validateUrl(item.url);
    if (!v.valid) {
      errors.push({ url: item.url, error: v.error });
    }
  }
  if (errors.length > 0) {
    return res.status(400).json({ error: "Invalid URLs in batch", details: errors });
  }

  const created = items.map((item) => {
    const job = enqueueJob(item);
    return { id: job.id, url: job.url, status: job.status };
  });

  res.status(201).json({
    message: `${created.length} job(s) queued`,
    jobs: created,
  });
});

// ---------------------------------------------------------------------------
// GET /api/v1/jobs/:id
// ---------------------------------------------------------------------------
app.get("/api/v1/jobs/:id", (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  // Return a lean view (omit the full report for running/queued jobs)
  const response = {
    id: job.id,
    url: job.url,
    name: job.name,
    slug: job.slug,
    category: job.category,
    status: job.status,
    createdAt: job.createdAt,
    completedAt: job.completedAt,
    error: job.error,
  };

  if (job.status === "completed" && job.result) {
    response.result = job.result;
  }

  res.json(response);
});

// ---------------------------------------------------------------------------
// GET /api/v1/jobs
// List all jobs with optional status filter: ?status=queued|running|completed|failed
// ---------------------------------------------------------------------------
app.get("/api/v1/jobs", (req, res) => {
  const statusFilter = req.query.status;
  let list = Array.from(jobs.values());

  if (statusFilter) {
    list = list.filter((j) => j.status === statusFilter);
  }

  // Return lean summaries (no full report)
  const summaries = list.map((j) => ({
    id: j.id,
    url: j.url,
    name: j.name,
    slug: j.slug,
    category: j.category,
    status: j.status,
    createdAt: j.createdAt,
    completedAt: j.completedAt,
    error: j.error,
  }));

  res.json({ total: summaries.length, jobs: summaries });
});

// ---------------------------------------------------------------------------
// GET /api/v1/leaderboard
// Returns all stored scores sorted by score descending.
// Optional query params: ?category=AI/ML&limit=10
// ---------------------------------------------------------------------------
app.get("/api/v1/leaderboard", (_req, res) => {
  const { category, limit } = _req.query;

  let entries = Object.values(scores).map((s) => ({
    url: s.url,
    name: s.name,
    slug: s.slug,
    category: s.category,
    score: s.score,
    pass: s.pass,
    total: s.total,
    scoredAt: s.scoredAt,
  }));

  // Filter by category if requested
  if (category) {
    entries = entries.filter(
      (e) => e.category && e.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Sort by score descending, then by name ascending as tiebreaker
  entries.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (a.name ?? a.url).localeCompare(b.name ?? b.url);
  });

  // Apply limit
  if (limit) {
    const n = parseInt(limit, 10);
    if (!isNaN(n) && n > 0) {
      entries = entries.slice(0, n);
    }
  }

  res.json({
    total: entries.length,
    leaderboard: entries,
  });
});

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err instanceof Error ? err.message : String(err),
  });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Agent Score backend running on http://localhost:${PORT}`);
  console.log(`Loaded ${Object.keys(scores).length} stored score(s)`);
  console.log();
  console.log("Endpoints:");
  console.log(`  GET  /health`);
  console.log(`  GET  /api/v1/score?url=<docs_url>`);
  console.log(`  POST /api/v1/batch-score`);
  console.log(`  GET  /api/v1/jobs`);
  console.log(`  GET  /api/v1/jobs/:id`);
  console.log(`  GET  /api/v1/leaderboard`);
});
