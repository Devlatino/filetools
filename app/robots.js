import { BASE_URL } from "@/lib/constants";

/**
 * Genera robots.txt dinamico per Next.js App Router.
 * Consente a tutti i crawler di indicizzare il sito, blocca /api/, indica la sitemap.
 * @returns {import('next').MetadataRoute.Robots}
 */
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
