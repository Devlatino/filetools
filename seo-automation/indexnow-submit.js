/**
 * Submit specific URL batches to IndexNow.
 * Usage: node seo-automation/indexnow-submit.js <batch-name>
 * Example: node seo-automation/indexnow-submit.js batch-21
 *
 * Requires in .env.local: INDEXNOW_KEY, NEXT_PUBLIC_SITE_URL (or BASE_URL)
 */
const path = require("path");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env.local") });

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.BASE_URL || "https://www.fileflip.org";
const KEY = process.env.INDEXNOW_KEY;

const LOCALES = ["en", "it", "es", "fr", "de", "pt", "zh", "hi", "ar"];

const BATCHES = {
  "batch-23": [
    "tools/qr-code-generator",
    "tools/age-calculator",
    "tools/tip-calculator",
  ],
  "batch-qr-update": [
    "tools/qr-code-generator",
  ],
  "batch-22": [
    "tools/color-picker",
    "tools/url-encoder-decoder",
    "tools/hash-generator",
  ],
  "batch-21-fix": [
    "tools/text-case-converter",
    "zh/tools/text-case-converter",
    "ar/tools/text-case-converter",
    "zh/tools/word-counter",
    "ar/tools/word-counter",
    "hi/tools/lorem-ipsum-generator",
  ],
  "batch-21": [
    "tools/word-counter",
    "tools/text-case-converter",
    "tools/lorem-ipsum-generator",
  ],
  "blog-batch-5": [
    "blog/jpg-to-pdf",
    "blog/how-to-merge-pdf-files",
    "blog/how-to-convert-image-to-text",
  ],
};

function buildUrls(pathSegments) {
  const urls = [];
  for (const segment of pathSegments) {
    urls.push(`${BASE_URL}/${segment}`);
    for (const locale of LOCALES) {
      if (locale === "en") continue;
      urls.push(`${BASE_URL}/${locale}/${segment}`);
    }
  }
  return urls;
}

async function main() {
  const batchName = process.argv[2];
  if (!batchName || !BATCHES[batchName]) {
    console.error("Usage: node seo-automation/indexnow-submit.js <batch-name>");
    console.error("Available batches:", Object.keys(BATCHES).join(", "));
    process.exit(1);
  }
  if (!KEY) {
    console.error("INDEXNOW_KEY is not set in .env.local");
    process.exit(1);
  }

  const pathSegments = BATCHES[batchName];
  const urlList =
    batchName === "batch-21-fix"
      ? pathSegments.map((seg) => `${BASE_URL}/${seg}`)
      : buildUrls(pathSegments);
  const host = new URL(BASE_URL).host;

  console.log(`Submitting batch "${batchName}" (${urlList.length} URLs) to IndexNow...`);

  const res = await fetch("https://api.indexnow.org/IndexNow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      host,
      key: KEY,
      keyLocation: `${BASE_URL}/${KEY}.txt`,
      urlList,
    }),
  });

  const text = await res.text();
  console.log("Status:", res.status);
  if (text) console.log("Response:", text);
  if (!res.ok) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
