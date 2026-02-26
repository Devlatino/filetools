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
];

/**
 * Genera la sitemap XML dinamica per Next.js App Router.
 * @returns {import('next').MetadataRoute.Sitemap}
 */
export default function sitemap() {
  const lastModified = new Date().toISOString();
  const entries = [];

  for (const locale of routing.locales) {
    entries.push({
      url: `${BASE_URL}/${locale}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
    });
    for (const path of TOOL_PATHS) {
      entries.push({
        url: `${BASE_URL}/${locale}${path}`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }

  return entries;
}
