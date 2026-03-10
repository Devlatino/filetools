import { routing } from "@/i18n/routing";
import { BASE_URL } from "@/lib/constants";

const HIGH_PRIORITY_TOOLS = [
  'compress-pdf', 'merge-pdf', 'split-pdf', 'compress-image',
  'heic-to-jpg', 'remove-background', 'word-to-pdf', 'pdf-to-jpg',
  'resize-image', 'jpg-to-png', 'png-to-jpg', 'image-to-pdf',
  'excel-to-pdf', 'qr-code-generator', 'pdf-to-pdfa',
];

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
  "/tools/stl-viewer",
  "/tools/obj-to-stl",
  "/tools/image-to-lithophane",
  "/tools/compare",
  "/tools/pdf-unlock",
  "/tools/protect-pdf",
  "/tools/pdf-add-page-numbers",
  "/tools/reorder-pdf-pages",
  "/tools/word-to-pdf",
  "/tools/favicon-generator",
  "/tools/dxf-viewer",
  "/tools/excel-to-pdf",
  "/tools/pdf-to-pdfa",
  "/tools/csv-to-pdf",
  "/tools/json-formatter",
  "/tools/base64-encode-decode",
  "/tools/image-to-text",
  "/tools/password-generator",
  "/tools/markdown-to-pdf",
  "/tools/unit-converter",
];

const BLOG_SLUGS = [
  "webp-vs-jpg",
  "how-to-compress-pdf",
  "gif-to-mp4-why",
  "best-free-pdf-converter-online",
  "how-to-convert-excel-to-pdf",
  "what-is-pdfa-and-when-do-you-need-it",
  "how-to-compress-images-without-losing-quality",
  "heic-to-jpg-how-to-convert-iphone-photos",
  "how-to-remove-background-from-image-free",
  "merge-pdf-free-online-guide",
  "word-to-pdf-without-microsoft-office",
  "how-to-split-pdf-online-free",
  "best-image-format-for-web-jpg-png-webp",
];

// Fixed date for tools — update on each deploy
const TOOL_LAST_MOD = "2025-03-01T00:00:00.000Z";

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
  const now = new Date().toISOString();
  const entries = [];

  // Homepage — always fresh
  const homeLanguages = buildAlternatesLanguages("");
  for (const locale of routing.locales) {
    const path = locale === routing.defaultLocale ? "" : `/${locale}`;
    entries.push({
      url: `${BASE_URL}${path}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
      alternates: { languages: homeLanguages },
    });
  }

  // Tools index — high priority
  const toolsIndexLanguages = buildAlternatesLanguages("/tools");
  for (const locale of routing.locales) {
    const pathPrefix = locale === routing.defaultLocale ? "" : `/${locale}`;
    entries.push({
      url: `${BASE_URL}${pathPrefix}/tools`,
      lastModified: TOOL_LAST_MOD,
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: { languages: toolsIndexLanguages },
    });
  }

  // Individual tool pages
  for (const path of TOOL_PATHS) {
    const slug = path.replace("/tools/", "");
    const isHighPriority = HIGH_PRIORITY_TOOLS.includes(slug);
    const toolLanguages = buildAlternatesLanguages(path);
    for (const locale of routing.locales) {
      const pathPrefix =
        locale === routing.defaultLocale ? "" : `/${locale}`;
      entries.push({
        url: `${BASE_URL}${pathPrefix}${path}`,
        lastModified: TOOL_LAST_MOD,
        changeFrequency: "monthly",
        priority: isHighPriority ? 0.9 : 0.8,
        alternates: { languages: toolLanguages },
      });
    }
  }

  // Blog index — always fresh
  const blogLanguages = buildAlternatesLanguages("/blog");
  for (const locale of routing.locales) {
    const pathPrefix = locale === routing.defaultLocale ? "" : `/${locale}`;
    entries.push({
      url: `${BASE_URL}${pathPrefix}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: { languages: blogLanguages },
    });
  }

  // Blog posts
  for (const slug of BLOG_SLUGS) {
    const blogSlugLanguages = buildAlternatesLanguages(`/blog/${slug}`);
    for (const locale of routing.locales) {
      const pathPrefix = locale === routing.defaultLocale ? "" : `/${locale}`;
      entries.push({
        url: `${BASE_URL}${pathPrefix}/blog/${slug}`,
        lastModified: TOOL_LAST_MOD,
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: { languages: blogSlugLanguages },
      });
    }
  }

  // Static pages
  const staticPages = ["/about", "/privacy", "/contact", "/terms"];
  for (const page of staticPages) {
    const pageLanguages = buildAlternatesLanguages(page);
    for (const locale of routing.locales) {
      const pathPrefix = locale === routing.defaultLocale ? "" : `/${locale}`;
      entries.push({
        url: `${BASE_URL}${pathPrefix}${page}`,
        lastModified: TOOL_LAST_MOD,
        changeFrequency: "yearly",
        priority: 0.4,
        alternates: { languages: pageLanguages },
      });
    }
  }

  return entries;
}
