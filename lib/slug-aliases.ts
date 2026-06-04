// Maps an auto-generated/typed slug → the canonical leaderboard slug we want to show.
// Use this when a domain a user is likely to type (e.g. monday.com → "monday") resolves
// to a weaker entry than the curated leaderboard entry we'd rather surface.
export const SLUG_ALIASES: Record<string, string> = {
  monday: 'developer-monday-com-apps',
};

export function resolveSlugAlias(slug: string): string {
  return SLUG_ALIASES[slug] ?? slug;
}
