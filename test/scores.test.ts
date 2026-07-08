import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the RDS query layer so we can exercise the pure transform/filter logic
// in lib/database.ts (rowToCompany normalisation + blocked-domain filtering)
// without a live database.
const query = vi.fn();
vi.mock("@/lib/db", () => ({
  query: (...args: unknown[]) => query(...args),
}));

import { getScoreBySlug } from "@/lib/database";

function makeRow(overrides: Record<string, unknown> = {}) {
  return {
    slug: "stripe",
    name: "Stripe",
    category: "payments",
    docs_url: "https://docs.stripe.com",
    score: 90,
    grade: "A+",
    scored_at: "2024-01-01T00:00:00.000Z",
    checks_total: 10,
    checks_pass: 9,
    checks_warn: 1,
    checks_fail: 0,
    results: [],
    category_scores: null,
    afdocs_version: null,
    hidden: false,
    is_fern: false,
    ...overrides,
  };
}

describe("getScoreBySlug", () => {
  beforeEach(() => {
    query.mockReset();
  });

  it("returns null when no row is found", async () => {
    query.mockResolvedValueOnce({ rows: [] });
    expect(await getScoreBySlug("missing")).toBeNull();
  });

  it("maps a row into a CompanyScore", async () => {
    query.mockResolvedValueOnce({ rows: [makeRow()] });
    const company = await getScoreBySlug("stripe");
    expect(company).toMatchObject({
      slug: "stripe",
      name: "Stripe",
      docsUrl: "https://docs.stripe.com",
      score: 90,
      grade: "A+",
      checks: { total: 10, pass: 9, warn: 1, fail: 0 },
    });
  });

  it("normalises a Date scored_at into an ISO string", async () => {
    query.mockResolvedValueOnce({
      rows: [makeRow({ scored_at: new Date("2024-06-01T12:34:56.000Z") })],
    });
    const company = await getScoreBySlug("stripe");
    expect(company?.scoredAt).toBe("2024-06-01T12:34:56.000Z");
  });

  it("treats blocked-domain records as not found", async () => {
    query.mockResolvedValueOnce({
      rows: [makeRow({ slug: "blocked", docs_url: "https://pornhub.com" })],
    });
    expect(await getScoreBySlug("blocked")).toBeNull();
  });

  it("returns null and swallows query errors", async () => {
    query.mockRejectedValueOnce(new Error("db down"));
    expect(await getScoreBySlug("stripe")).toBeNull();
  });
});
