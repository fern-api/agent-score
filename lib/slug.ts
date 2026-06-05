// Slug derivation for leaderboard entries. Extracted from the score route so the
// derivation rules (e.g. monday.com → "monday") are unit-testable in isolation.

// Slug from a full URL, including any path (e.g. developer.monday.com/api-reference
// → "developer-monday-com-api-reference"). Used for path-scoped/staging hosts.
export function urlToSlug(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    const pathPart = parsed.pathname.replace(/\//g, "-").replace(/^-+|-+$/g, "");
    const base = pathPart ? `${host}-${pathPart}` : host;
    return base.replace(/[^a-z0-9-]/gi, "-").replace(/-+/g, "-").toLowerCase().slice(0, 80);
  } catch {
    return "unknown";
  }
}

// Slug from a display name (e.g. "Monday" → "monday"). Used for domain-rooted sites
// so they collapse onto a single company slug.
export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
