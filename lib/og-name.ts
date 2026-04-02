const GENERIC_SEGMENT = /^(overview|home|homepage|pricing|getting\s*started|introduction|welcome|api|reference|changelog|blog|community|support|docs|documentation)$/i;

export function cleanOgName(raw: string): string {
  let name = raw;

  // For "A | B" or "A · B" patterns, pick the shortest non-generic segment
  if (/[|·]/.test(name)) {
    const parts = name.split(/\s*[|·]\s*/).map(p => p.trim()).filter(Boolean);
    const meaningful = parts.filter(p => !GENERIC_SEGMENT.test(p));
    if (meaningful.length > 0) {
      name = meaningful.reduce((a, b) => a.length <= b.length ? a : b);
    }
  }

  return name
    .replace(/\s*[-–—]\s*(docs|documentation|api\s*reference|developer\s*docs|developers|home|overview|portal|homepage|developer\s*portal|developer\s*hub)\s*$/i, '')
    .replace(/\s+(docs|documentation|developers?)\s*$/i, '')
    .replace(/^(docs|documentation)\s*[|\-–—]\s*/i, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .trim();
}

// Derive a simple capitalized name from the domain (e.g. docs.stripe.com → Stripe)
export function domainToName(url: string): string | null {
  try {
    const { hostname } = new URL(url);
    const clean = hostname
      .replace(/^(www|docs|developer|api|reference|developers|dev)\./i, '')
      .replace(/\.(com|io|dev|co|net|org|app|ai|cloud|tech|build|run|so|sh)(\.[a-z]{2})?$/i, '');
    if (!clean || clean.includes('.')) return null;
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  } catch {
    return null;
  }
}

export async function fetchOgName(url: string): Promise<string | null> {
  try {
    const r = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AgentScore/1.0)', Accept: 'text/html' },
    });
    if (!r.ok) return null;
    const html = await r.text();
    const siteName = html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i)?.[1]
      ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:site_name["']/i)?.[1];
    if (siteName?.trim()) return cleanOgName(siteName);
    const appName = html.match(/<meta[^>]+name=["']application-name["'][^>]+content=["']([^"']+)["']/i)?.[1]
      ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']application-name["']/i)?.[1];
    if (appName?.trim()) return cleanOgName(appName);
    const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1]
      ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i)?.[1];
    if (ogTitle?.trim()) return cleanOgName(ogTitle);
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch?.[1]?.trim()) return cleanOgName(titleMatch[1]);
    return null;
  } catch {
    return null;
  }
}
