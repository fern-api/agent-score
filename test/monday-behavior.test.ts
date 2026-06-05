import { afterEach, describe, expect, it, vi } from "vitest";
import { isBlockedDomain } from "@/lib/blocked-domains";
import { resolveSlugAlias } from "@/lib/slug-aliases";
import { nameToSlug } from "@/lib/slug";
import { detectDocsUrl } from "@/lib/docs-detection";

// Executable spec for the agreed monday.com behavior:
//   - the marketing apex monday.com is never graded — submitting it redirects the
//     user to the curated developer-docs leaderboard entry instead;
//   - developers.monday.com is a real docs site and stays gradeable.

afterEach(() => vi.unstubAllGlobals());

const CANONICAL = "developer-monday-com-api-reference";

describe("monday.com marketing apex", () => {
  it("is NOT hard-blocked (it redirects rather than 403s)", () => {
    expect(isBlockedDomain("https://monday.com/")).toBe(false);
  });

  it("derives to the slug `monday`, which aliases to the curated entry → redirect", () => {
    // monday.com resolves to display name "Monday" → slug "monday".
    const slug = nameToSlug("Monday");
    expect(slug).toBe("monday");
    const target = resolveSlugAlias(slug);
    expect(target).toBe(CANONICAL);
    // alias differs from the raw slug, which is what triggers the redirect.
    expect(target).not.toBe(slug);
  });

  it("is rejected by docs-detection as a backstop (never scored as docs)", async () => {
    // apex root, ships /llms.txt, but the homepage is a marketing page.
    vi.stubGlobal("fetch", vi.fn(async (input: string | URL) => {
      const u = String(input);
      const body = u.endsWith("/llms.txt") ? "" : "<title>monday.com — Work Platform</title>";
      return { ok: true, status: 200, text: async () => body } as unknown as Response;
    }));
    const out = await detectDocsUrl("https://monday.com/");
    expect(out.isLikely).toBe(false);
  });
});

describe("developers.monday.com", () => {
  it("is recognized as a docs site (gradeable) with no network call", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(await detectDocsUrl("https://developers.monday.com/")).toEqual({ isLikely: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
