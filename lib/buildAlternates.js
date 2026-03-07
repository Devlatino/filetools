import { BASE_URL } from "@/lib/constants";
import { routing } from "@/i18n/routing";

/**
 * Build hreflang alternates with ABSOLUTE URLs only.
 * Using relative paths causes Next.js/crawlers to resolve against current path,
 * producing wrong URLs like /ar/fr/blog instead of /fr/blog.
 * @param {string} pathSegment - e.g. "" for home, "/blog", or "/blog/my-post-slug"
 * @returns {{ [locale: string]: string }} languages object with full absolute URLs
 */
export function buildAbsoluteLanguageAlternates(pathSegment) {
  const segment = pathSegment || "";
  const languages = {};
  for (const loc of routing.locales) {
    const path =
      loc === routing.defaultLocale ? segment : `/${loc}${segment}`;
    languages[loc] = `${BASE_URL}${path}`;
  }
  languages["x-default"] = `${BASE_URL}${segment}`;
  return languages;
}
