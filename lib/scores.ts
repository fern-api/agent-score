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
  categoryScores?: Record<string, number>;
  hidden?: boolean;
}

export async function getCompanyWithFallback(slug: string): Promise<CompanyScore | null> {
  const { getScoreBySlug } = await import('./supabase');
  return getScoreBySlug(slug);
}

export async function getLeaderboard(category?: string): Promise<CompanyScore[]> {
  const { getAllScores } = await import('./supabase');
  const all = await getAllScores();
  const entries = category
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
