const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://fileflip.it";

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
];

/** @type {import('next').MetadataRoute.Sitemap} */
export default function sitemap() {
  const now = new Date().toISOString();

  const homepage = {
    url: BASE_URL,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 1,
  };

  const toolEntries = TOOL_PATHS.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  return [homepage, ...toolEntries];
}
