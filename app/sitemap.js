import { routing } from "@/i18n/routing";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://fileflip.org";

const TOOL_PATHS = [
  "/tools/compress-image",
  "/tools/merge-pdf",
  "/tools/heic-to-jpg",
  "/tools/resize-image",
  "/tools/jpg-to-png",
  "/tools/pdf-to-jpg",
  "/tools/png-to-jpg",
  "/tools/image-to-pdf",
  "/tools/compress-pdf",
  "/tools/webp-to-jpg",
  "/tools/split-pdf",
  "/tools/png-to-pdf",
  "/tools/jpg-to-pdf",
  "/tools/svg-to-png",
  "/tools/rotate-pdf",
  "/tools/image-to-webp",
  "/tools/pdf-to-png",
  "/tools/gif-to-mp4",
  "/tools/crop-image",
  "/tools/bmp-to-jpg",
  "/tools/extract-pdf-pages",
  "/tools/tiff-to-jpg",
  "/tools/add-watermark-pdf",
  "/tools/mp4-to-gif",
  "/tools/jpg-to-webp",
  "/tools/pdf-to-text",
  "/tools/create-zip",
  "/tools/trim-video",
  "/tools/video-to-mp3",
  "/tools/compress-video",
  "/tools/mute-video",
  "/tools/video-speed",
  "/tools/add-audio-to-video",
  "/tools/resize-video",
  "/tools/merge-videos",
  "/tools/loop-video",
  "/tools/remove-background",
  "/tools/resize-image-social",
  "/tools/add-text-to-image",
  "/tools/trim-audio",
  "/tools/audio-to-mp3",
  "/tools/qr-code-generator",
  "/tools/compare",
];

const BLOG_SLUGS = ["webp-vs-jpg", "how-to-compress-pdf", "gif-to-mp4-why"];

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
        changeFrequency: path === "/tools/compare" ? "monthly" : "monthly",
        priority: path === "/tools/compare" ? 0.8 : 0.8,
        alternates: { languages: toolLanguages },
      });
    }
  }

  const blogLanguages = buildAlternatesLanguages("/blog");
  for (const locale of routing.locales) {
    const pathPrefix = locale === routing.defaultLocale ? "" : `/${locale}`;
    entries.push({
      url: `${BASE_URL}${pathPrefix}/blog`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: { languages: blogLanguages },
    });
  }

  for (const slug of BLOG_SLUGS) {
    const blogSlugLanguages = buildAlternatesLanguages(`/blog/${slug}`);
    for (const locale of routing.locales) {
      const pathPrefix = locale === routing.defaultLocale ? "" : `/${locale}`;
      entries.push({
        url: `${BASE_URL}${pathPrefix}/blog/${slug}`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: { languages: blogSlugLanguages },
      });
    }
  }

  return entries;
}
