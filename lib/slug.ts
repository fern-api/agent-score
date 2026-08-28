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

// Shape every stored slug must have: lowercase alphanumerics and dashes only.
// Client-supplied slugs are checked against this so fuzzed/scanner input can't
// create a leaderboard row per payload variant.
const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/;

export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}

// Display names are shown verbatim on the leaderboard, so keep them short and
// free of markup/control characters.
export function isValidName(name: string): boolean {
  return name.trim().length > 0 && name.length <= 60 && !/[<>{}|\\^`\x00-\x1f]/.test(name);
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
