import fs from "fs";
import path from "path";

export interface CheckResult {
  id: string;
  category: string;
  status: "pass" | "fail" | "warn" | "skip" | "error";
  message: string;
  dependsOn?: string[];
}

export interface CompanyScore {
  name: string;
  slug: string;
  category: string;
  docsUrl: string;
  score: number;
  grade: string;
  scoredAt: string;
  checks: {
    total: number;
    pass: number;
    warn: number;
    fail: number;
  };
  results?: CheckResult[];
}

export interface Company {
  name: string;
  slug: string;
  category: string;
  docsUrl: string;
}

const DATA_DIR = path.join(process.cwd(), "data");

export function getScores(): Record<string, CompanyScore> {
  const raw = fs.readFileSync(path.join(DATA_DIR, "scores.json"), "utf-8");
  return JSON.parse(raw);
}

export function getCompanies(): Company[] {
  const raw = fs.readFileSync(path.join(DATA_DIR, "companies.json"), "utf-8");
  return JSON.parse(raw);
}

export function getCompany(slug: string): CompanyScore | null {
  const scores = getScores();
  return scores[slug] ?? null;
}

// Async version that uses Supabase as the primary source, falling back to scores.json
export async function getCompanyWithFallback(slug: string): Promise<CompanyScore | null> {
  const { getScoreBySlug } = await import('./supabase');
  const fromSupabase = await getScoreBySlug(slug);
  if (fromSupabase) return fromSupabase;
  // Fall back to static file
  const scores = getScores();
  return scores[slug] ?? null;
}

// Sync fallback for the migration script — reads directly from scores.json
export function getLeaderboardSync(category?: string): CompanyScore[] {
  const scores = getScores();
  let entries = Object.values(scores);
  if (category) {
    entries = entries.filter(
      (e) => e.category.toLowerCase() === category.toLowerCase()
    );
  }
  return entries.sort((a, b) => b.score - a.score);
}

// Async version that reads from Supabase
export async function getLeaderboard(category?: string): Promise<CompanyScore[]> {
  const { getAllScores } = await import('./supabase');
  const all = await getAllScores();
  let entries = category
    ? all.filter((e) => e.category.toLowerCase() === category.toLowerCase())
    : all;
  return entries.sort((a, b) => b.score - a.score);
}

export function calculateGrade(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
}
