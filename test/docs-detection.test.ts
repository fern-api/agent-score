import { afterEach, describe, expect, it, vi } from "vitest";
import { detectDocsUrl } from "@/lib/docs-detection";

// --- fetch stub helpers -----------------------------------------------------
// detectDocsUrl makes up to two network calls: GET <origin>/llms.txt, then GET <url>.
// We stub global fetch and route by URL so tests stay deterministic and offline.

type FakeResponse = { ok: boolean; status: number; text: () => Promise<string> };

function resp(ok: boolean, status: number, body = ""): FakeResponse {
  return { ok, status, text: async () => body };
}

interface Routes {
  llms?: FakeResponse | "throw";
  page?: FakeResponse | "throw";
}

function stubFetch(routes: Routes) {
  const fetchMock = vi.fn(async (input: string | URL) => {
    const u = String(input);
    const which = u.endsWith("/llms.txt") ? "llms" : "page";
    const r = routes[which];
    if (r === undefined) throw new Error(`unexpected fetch: ${u}`);
    if (r === "throw") throw new Error("network error");
    return r as unknown as Response;
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const MARKETING_HTML = "<html><head><title>Acme — Project Management Platform</title></head><body><h1>Run your work</h1></body></html>";

afterEach(() => vi.unstubAllGlobals());

describe("detectDocsUrl — structural signals (no network needed)", () => {
  it("accepts a docs/developer subdomain without fetching", async () => {
    const f = stubFetch({});
    expect(await detectDocsUrl("https://developers.monday.com/")).toEqual({ isLikely: true });
    expect(await detectDocsUrl("https://docs.stripe.com/")).toEqual({ isLikely: true });
    expect(f).not.toHaveBeenCalled();
  });

  it("accepts a docs-ish path", async () => {
    stubFetch({});
    expect(await detectDocsUrl("https://example.com/docs/getting-started")).toEqual({ isLikely: true });
    expect(await detectDocsUrl("https://example.com/api/reference")).toEqual({ isLikely: true });
  });

  it("accepts a known docs platform host", async () => {
    stubFetch({});
    expect(await detectDocsUrl("https://acme.readme.io/")).toEqual({ isLikely: true });
    expect(await detectDocsUrl("https://acme.gitbook.io/docs")).toEqual({ isLikely: true });
  });

  it("rejects an invalid URL", async () => {
    const out = await detectDocsUrl("not a url");
    expect(out.isLikely).toBe(false);
    expect(out.warning).toMatch(/invalid url/i);
  });
});

describe("detectDocsUrl — apex marketing site (the monday.com case)", () => {
  it("rejects a marketing apex even when it ships an llms.txt", async () => {
    // monday.com: bare apex, /llms.txt returns 200, homepage is marketing.
    stubFetch({ llms: resp(true, 200), page: resp(true, 200, MARKETING_HTML) });
    const out = await detectDocsUrl("https://monday.com/");
    expect(out.isLikely).toBe(false);
    expect(out.warning).toMatch(/marketing or product site/i);
    expect(out.suggestion).toMatch(/docs\.monday\.com/);
  });

  it("rejects a marketing apex with no llms.txt", async () => {
    stubFetch({ llms: resp(false, 404), page: resp(true, 200, MARKETING_HTML) });
    const out = await detectDocsUrl("https://monday.com/");
    expect(out.isLikely).toBe(false);
    expect(out.warning).toMatch(/marketing or product site/i);
  });
});

describe("detectDocsUrl — apex content signals", () => {
  it("accepts an apex whose homepage title looks like docs", async () => {
    stubFetch({ llms: resp(false, 404), page: resp(true, 200, "<title>Acme API Reference</title>") });
    expect(await detectDocsUrl("https://acme.com/")).toEqual({ isLikely: true });
  });

  it("accepts an apex homepage with several code blocks", async () => {
    const html = "<title>Acme</title><pre>a</pre><code>b</code><code>c</code>";
    stubFetch({ llms: resp(false, 404), page: resp(true, 200, html) });
    expect(await detectDocsUrl("https://acme.com/")).toEqual({ isLikely: true });
  });
});

describe("detectDocsUrl — llms.txt nuance", () => {
  it("treats llms.txt as sufficient for a non-root path (no homepage fetch)", async () => {
    const f = stubFetch({ llms: resp(true, 200) });
    expect(await detectDocsUrl("https://example.com/platform")).toEqual({ isLikely: true });
    // homepage fetch should never happen — only the llms.txt call
    expect(f).toHaveBeenCalledTimes(1);
  });

  it("trusts llms.txt when the homepage fetch fails (bot protection)", async () => {
    stubFetch({ llms: resp(true, 200), page: "throw" });
    expect(await detectDocsUrl("https://example.com/")).toEqual({ isLikely: true });
  });
});

describe("detectDocsUrl — unreachable page", () => {
  it("reports an HTTP error when the homepage is not ok and there is no llms.txt", async () => {
    stubFetch({ llms: resp(false, 404), page: resp(false, 503) });
    const out = await detectDocsUrl("https://example.com/");
    expect(out.isLikely).toBe(false);
    expect(out.warning).toMatch(/HTTP 503/);
  });
});
