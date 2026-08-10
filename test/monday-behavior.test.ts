import { afterEach, describe, expect, it, vi } from "vitest";
import { isBlockedDomain } from "@/lib/blocked-domains";
import { resolveSlugAlias } from "@/lib/slug-aliases";
import { nameToSlug } from "@/lib/slug";
import { detectDocsUrl } from "@/lib/docs-detection";

// Executable spec for the monday.com behavior on this branch:
//   - the marketing apex monday.com is hard-blocked so it can never be graded as
//     docs — submitting it returns "not eligible" rather than redirecting (the
//     alias approach was superseded by the pre-cache apex block, see #27/#28);
//   - developers.monday.com is a real docs site and stays gradeable.

afterEach(() => vi.unstubAllGlobals());

describe("monday.com marketing apex", () => {
  it("is hard-blocked so it is never scored as docs (apex + www, not subdomains)", () => {
    expect(isBlockedDomain("https://monday.com/")).toBe(true);
    expect(isBlockedDomain("https://www.monday.com/")).toBe(true);
    // docs subdomains are NOT blocked by the apex-only guard.
    expect(isBlockedDomain("https://developers.monday.com/")).toBe(false);
  });

  it("derives to the slug `monday` with no alias redirect (the apex is rejected outright)", () => {
    // monday.com resolves to display name "Monday" → slug "monday".
    const slug = nameToSlug("Monday");
    expect(slug).toBe("monday");
    // alias is intentionally disabled, so the slug passes through unchanged.
    expect(resolveSlugAlias(slug)).toBe(slug);
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
