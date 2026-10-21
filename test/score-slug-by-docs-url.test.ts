import { afterEach, describe, expect, it, vi } from "vitest";

const query = vi.fn();
vi.mock("@/lib/db", () => ({ query: (...args: unknown[]) => query(...args) }));

afterEach(() => query.mockReset());

async function getScoreSlugByDocsUrl(url: string) {
  const mod = await import("@/lib/supabase");
  return mod.getScoreSlugByDocsUrl(url);
}

describe("getScoreSlugByDocsUrl", () => {
  it("returns the slug an already-scored URL is stored under", async () => {
    query.mockResolvedValue({ rows: [{ slug: "salesforce" }] });
    await expect(getScoreSlugByDocsUrl("https://developer.salesforce.com/docs")).resolves.toBe("salesforce");
  });

  it("normalizes trailing slashes and case before matching", async () => {
    query.mockResolvedValue({ rows: [] });
    await getScoreSlugByDocsUrl("https://Developer.Salesforce.com/docs//");
    expect(query.mock.calls[0][1]).toEqual(["https://developer.salesforce.com/docs"]);
  });

  it("returns null for URLs with no entry", async () => {
    query.mockResolvedValue({ rows: [] });
    await expect(getScoreSlugByDocsUrl("https://docs.example.com")).resolves.toBeNull();
  });

  it("returns null when the lookup fails", async () => {
    query.mockRejectedValue(new Error("connection refused"));
    await expect(getScoreSlugByDocsUrl("https://docs.example.com")).resolves.toBeNull();
  });
});
