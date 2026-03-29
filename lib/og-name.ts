export function cleanOgName(raw: string): string {
  return raw
    .replace(/\s*[|\-–—]\s*(docs|documentation|api\s*reference|developer\s*docs|developers|home|overview|portal)\s*$/i, '')
    .replace(/^(docs|documentation)\s*[|\-–—]\s*/i, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .trim();
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
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:site_name["']/i)?.[1];
    if (siteName) return cleanOgName(siteName);
    const appName = html.match(/<meta[^>]+name=["']application-name["'][^>]+content=["']([^"']+)["']/i)?.[1]
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']application-name["']/i)?.[1];
    if (appName) return cleanOgName(appName);
    const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1]
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i)?.[1];
    if (ogTitle) return cleanOgName(ogTitle);
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) return cleanOgName(titleMatch[1]);
    return null;
  } catch {
    return null;
  }
}
