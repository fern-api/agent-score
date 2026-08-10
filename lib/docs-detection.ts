// Heuristics for deciding whether a submitted URL is a documentation site
// (eligible for scoring) versus a marketing/product landing page (not eligible).
//
// Extracted from the score route so the logic is unit-testable in isolation
// (it only depends on the global fetch, which tests can stub).

export const DOCS_SUBDOMAINS = /^(docs|developer|api|reference|developers|learn)\./i;
export const DOCS_PATHS = /\/(docs|api|reference|guides|developer|sdk|learn|manual|documentation)\//i;
export const DOCS_PLATFORMS = /(readme\.io|gitbook\.io|mintlify\.app|buildwithfern\.com\/learn|\.fern\.dev|\.readme\.io|\.gitbook\.io|github\.io|notion\.site)/i;

export interface DocsDetection {
  isLikely: boolean;
  warning?: string;
  suggestion?: string;
}

export async function detectDocsUrl(url: string): Promise<DocsDetection> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { isLikely: false, warning: "Invalid URL format." };
  }

  const host = parsed.hostname;
  const pathStr = parsed.pathname + "/";

  if (DOCS_SUBDOMAINS.test(host)) return { isLikely: true };
  if (DOCS_PATHS.test(pathStr)) return { isLikely: true };
  if (DOCS_PLATFORMS.test(host + parsed.pathname)) return { isLikely: true };

  // An llms.txt is a strong docs signal — but marketing sites increasingly ship one
  // too (e.g. monday.com serves /llms.txt from its product homepage). For a bare apex
  // root it's not sufficient on its own; defer to the homepage content check below so
  // a marketing landing page can still be rejected. For any deeper path it stands.
  const isRoot = parsed.pathname === "/" || parsed.pathname === "";
  let hasLlms = false;
  try {
    const r = await fetch(`${parsed.origin}/llms.txt`, {
      signal: AbortSignal.timeout(5000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AgentScore/1.0)" },
    });
    hasLlms = r.ok;
  } catch { /* ignore */ }
  if (hasLlms && !isRoot) return { isLikely: true };

  try {
    const r = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AgentScore/1.0)", Accept: "text/html" },
    });
    if (!r.ok) {
      return { isLikely: false, warning: `The URL returned HTTP ${r.status}. Verify it is publicly accessible.` };
    }
    const html = await r.text();
    const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.toLowerCase() ?? "";
    if (/docs|documentation|api\s|reference|developer|quickstart/i.test(title)) return { isLikely: true };
    if ((html.match(/<pre|<code/g) ?? []).length >= 3) return { isLikely: true };
    if (/getting started|api reference|quickstart|sdk reference/i.test(html)) return { isLikely: true };
    const baseDomain = host.replace(/^www\./, "");
    return {
      isLikely: false,
      warning: `This URL looks like a marketing or product site, not a documentation site.`,
      suggestion: `docs.${baseDomain}, ${parsed.origin}/docs, or ${parsed.origin}/api`,
    };
  } catch {
    // Couldn't analyze the page — if it advertised an llms.txt, trust that rather
    // than reject on a fetch failure (only a *visible* marketing page is rejected).
    if (hasLlms) return { isLikely: true };
    return {
      isLikely: false,
      warning: `Could not fetch the URL — it may be protected by bot-detection.`,
      suggestion: `docs.${parsed.hostname.replace(/^www\./, "")}`,
    };
  }
}
