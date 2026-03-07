import { BASE_URL } from "@/lib/constants";
import { toolsBySlug } from "@/lib/toolsData";
import { locales, defaultLocale } from "@/i18n.js";

function buildLocalizedUrls(slug) {
  const urls = {};
  for (const locale of locales) {
    urls[locale] =
      locale === defaultLocale
        ? `${BASE_URL}/tools/${slug}`
        : `${BASE_URL}/${locale}/tools/${slug}`;
  }
  return urls;
}

export async function GET(request, context) {
  const { slug } = await context.params;
  const tool = toolsBySlug[slug];

  if (!tool) {
    return new Response(
      JSON.stringify({ error: "Tool not found", slug }),
      {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=60",
        },
      }
    );
  }

  const data = {
    slug: tool.slug,
    name: tool.name,
    description: tool.description,
    url: `${BASE_URL}/tools/${tool.slug}`,
    localizedUrls: buildLocalizedUrls(tool.slug),
    input: tool.input,
    output: tool.output,
    category: tool.category,
    free: tool.free,
    serverUpload: tool.serverUpload,
    processingLocation: "browser",
    requiresAccount: false,
    maxFileSize: "limited by browser memory",
    howToUse:
      "Navigate to the tool URL, upload a file using the file input, click convert, download the result.",
    useCases: tool.useCases || [],
  };

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
