import { routing } from "@/i18n/routing";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://fileflip.org";

const TOOL_PATHS = [
  "/tools/compress-image",
  "/tools/merge-pdf",
  "/tools/compress-pdf",
  "/tools/jpg-to-png",
  "/tools/png-to-jpg",
  "/tools/image-to-webp",
  "/tools/resize-image",
  "/tools/pdf-to-images",
  "/tools/create-zip",
  "/tools/extract-zip",
  "/tools/svg-to-png",
  "/tools/remove-background",
  "/tools/merge-images",
  "/tools/pdf-to-text",
  "/tools/add-watermark",
  "/tools/color-converter",
  "/tools/favicon-generator",
  "/tools/compress-video",
  "/tools/extract-audio",
  "/tools/word-counter",
  "/tools/heic-to-jpg",
  "/tools/remove-metadata",
  "/tools/pdf-to-pptx",
  "/tools/color-palette",
  "/tools/text-diff",
  "/tools/encrypt-text",
  "/tools/markdown-to-html",
  "/tools/qr-generator",
  "/tools/extract-frames",
  "/tools/csv-tools",
];

/**
 * Build alternates.languages for a path segment (e.g. "" for home or "/tools/compress-image").
 * Returns absolute URLs for all locales plus x-default (English).
 */
function buildAlternatesLanguages(pathSegment) {
  const languages = {};
  for (const loc of routing.locales) {
    const path = pathSegment ? `/${loc}${pathSegment}` : `/${loc}`;
    languages[loc] = `${BASE_URL}${path}`;
  }
  languages["x-default"] = pathSegment ? `${BASE_URL}/en${pathSegment}` : `${BASE_URL}/en`;
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
    entries.push({
      url: `${BASE_URL}/${locale}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
      alternates: { languages: homeLanguages },
    });
  }

  for (const path of TOOL_PATHS) {
    const toolLanguages = buildAlternatesLanguages(path);
    for (const locale of routing.locales) {
      entries.push({
        url: `${BASE_URL}/${locale}${path}`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.8,
        alternates: { languages: toolLanguages },
      });
    }
  }

  return entries;
}
