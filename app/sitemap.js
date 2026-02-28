import { routing } from "@/i18n/routing";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://fileflip.org";

const TOOL_PATHS = [
  "/tools/compress-image",
  "/tools/merge-pdf",
  "/tools/heic-to-jpg",
];

/**
 * Build alternates.languages for a path segment (e.g. "" for home or "/tools/compress-image").
 * With localePrefix 'as-needed', default locale (en) has no URL prefix.
 */
function buildAlternatesLanguages(pathSegment) {
  const languages = {};
  for (const loc of routing.locales) {
    const path =
      loc === routing.defaultLocale
        ? pathSegment || ""
        : pathSegment
          ? `/${loc}${pathSegment}`
          : `/${loc}`;
    languages[loc] = `${BASE_URL}${path}`;
  }
  languages["x-default"] =
    routing.defaultLocale === "en"
      ? `${BASE_URL}${pathSegment || ""}`
      : `${BASE_URL}/en${pathSegment || ""}`;
  return languages;
}

/**
 * Genera la sitemap XML dinamica per Next.js App Router con alternates multilingua.
 * Ogni URL include i tag xhtml:link per tutte le varianti lingua (hreflang).
 * @returns {import('next').MetadataRoute.Sitemap}
 */
export default function sitemap() {
  const lastModified = new Date();
  const entries = [];

  const homeLanguages = buildAlternatesLanguages("");
  for (const locale of routing.locales) {
    const path = locale === routing.defaultLocale ? "" : `/${locale}`;
    entries.push({
      url: `${BASE_URL}${path}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
      alternates: { languages: homeLanguages },
    });
  }

  for (const path of TOOL_PATHS) {
    const toolLanguages = buildAlternatesLanguages(path);
    for (const locale of routing.locales) {
      const pathPrefix =
        locale === routing.defaultLocale ? "" : `/${locale}`;
      entries.push({
        url: `${BASE_URL}${pathPrefix}${path}`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.8,
        alternates: { languages: toolLanguages },
      });
    }
  }

  return entries;
}
