// Maps an auto-generated/typed slug → the canonical leaderboard slug we want to show.
// Use this when a domain a user is likely to type (e.g. monday.com → "monday") resolves
// to a weaker entry than the curated leaderboard entry we'd rather surface.
export const SLUG_ALIASES: Record<string, string> = {
  // monday.com is a marketing site, not docs — surface the curated developer-docs
  // entry instead of scoring (or rejecting) the apex. Submitting monday.com navigates
  // here rather than showing a "not eligible" error.
  monday: 'developer-monday-com-api-reference',
};

export function resolveSlugAlias(slug: string): string {
  return SLUG_ALIASES[slug] ?? slug;
}
