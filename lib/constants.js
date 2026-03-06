/**
 * Canonical base URL for the site. Must match the final URL after redirects
 * (e.g. if fileflip.org redirects to www.fileflip.org, use www).
 * Used in sitemap, robots, canonical tags, and hreflang for SEO consistency.
 */
export const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.fileflip.org";
