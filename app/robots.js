/**
 * Genera robots.txt dinamico per Next.js App Router.
 * Consente a tutti i crawler di indicizzare il sito, blocca /api/, indica la sitemap.
 * @returns {import('next').MetadataRoute.Robots}
 */
export default function robots() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://fileflip.org";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
