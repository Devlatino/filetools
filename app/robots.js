import { BASE_URL } from "@/lib/constants";

export default function robots() {
  return {
    rules: [
      // Standard search engines
      {
        userAgent: "Googlebot",
        allow: "/",
      },
      {
        userAgent: "Bingbot",
        allow: "/",
      },
      // AI crawlers — esplicitamente permessi
      {
        userAgent: "ClaudeBot",
        allow: "/",
      },
      {
        userAgent: "anthropic-ai",
        allow: "/",
      },
      {
        userAgent: "GPTBot",
        allow: "/",
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
      },
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
      },
      {
        userAgent: "Applebot",
        allow: "/",
      },
      {
        userAgent: "Applebot-Extended",
        allow: "/",
      },
      {
        userAgent: "CCBot",
        allow: "/",
      },
      {
        userAgent: "cohere-ai",
        allow: "/",
      },
      {
        userAgent: "YouBot",
        allow: "/",
      },
      // Everyone else
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/_next/", "/cdn-cgi/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
