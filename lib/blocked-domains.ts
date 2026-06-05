const BLOCKED_TLDS = new Set(['.xxx', '.porn', '.sex', '.adult']);

const BLOCKED_DOMAINS = new Set([
  'pornhub.com', 'xvideos.com', 'xhamster.com', 'xnxx.com', 'redtube.com',
  'youporn.com', 'tube8.com', 'beeg.com', 'brazzers.com', 'onlyfans.com',
  'chaturbate.com', 'cam4.com', 'myfreecams.com', 'livejasmin.com', 'stripchat.com',
  'spankbang.com', 'eporner.com', 'tnaflix.com', 'drtuber.com', 'nuvid.com',
  'slutload.com', 'empflix.com', 'xtube.com', 'hclips.com', 'txxx.com',
  'porntrex.com', 'anysex.com', 'fuq.com', 'ixxx.com', 'rulertube.com',
]);

export function isBlockedDomain(url: string): boolean {
  try {
    const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    const { hostname } = new URL(normalized);
    const host = hostname.replace(/^www\./, '').toLowerCase();
    if (BLOCKED_TLDS.has('.' + host.split('.').pop())) return true;
    if (BLOCKED_DOMAINS.has(host)) return true;
    for (const d of Array.from(BLOCKED_DOMAINS)) {
      if (host === d || host.endsWith('.' + d)) return true;
    }
    return false;
  } catch {
    return false;
  }
}
