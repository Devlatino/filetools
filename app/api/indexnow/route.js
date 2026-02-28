/**
 * IndexNow API: notifies Bing, Yandex, etc. with all site URLs.
 * Protected by x-indexnow-secret. For automatic ping after deploy, use the
 * GitHub Action (.github/workflows/indexnow.yml) or a Vercel Deploy Hook that
 * calls this route with the secret header. See README "IndexNow" section.
 */
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
];

/**
 * Build the same URL list as sitemap.js: homepage per locale + tool page per locale × tool.
 */
function buildUrlList() {
  const urls = [];

  for (const locale of routing.locales) {
    const path = locale === routing.defaultLocale ? "" : `/${locale}`;
    urls.push(`${BASE_URL}${path}`);
  }

  for (const toolPath of TOOL_PATHS) {
    for (const locale of routing.locales) {
      const pathPrefix =
        locale === routing.defaultLocale ? "" : `/${locale}`;
      urls.push(`${BASE_URL}${pathPrefix}${toolPath}`);
    }
  }

  return urls;
}

/**
 * GET or POST /api/indexnow
 * Protected by x-indexnow-secret. Notifies IndexNow with all site URLs.
 */
export async function GET(request) {
  return handleIndexNow(request);
}

export async function POST(request) {
  return handleIndexNow(request);
}

async function handleIndexNow(request) {
  if (request.headers.get('x-indexnow-secret') !== process.env.INDEXNOW_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const key = process.env.INDEXNOW_KEY;

  if (!key) {
    return Response.json(
      { error: "INDEXNOW_KEY is not set" },
      { status: 500 }
    );
  }

  const host = new URL(BASE_URL).host;
  const keyLocation = `${BASE_URL}/${key}.txt`;
  const urlList = buildUrlList();

  try {
    const res = await fetch("https://api.indexnow.org/IndexNow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host,
        key,
        keyLocation,
        urlList,
      }),
    });

    const status = res.status;
    if (!res.ok) {
      const text = await res.text();
      return Response.json(
        {
          error: "IndexNow request failed",
          status,
          body: text.slice(0, 500),
        },
        { status: 502 }
      );
    }

    return Response.json({
      success: true,
      urlCount: urlList.length,
      response: status,
    });
  } catch (err) {
    return Response.json(
      { error: err?.message || "IndexNow request failed" },
      { status: 502 }
    );
  }
}
