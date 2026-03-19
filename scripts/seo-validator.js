#!/usr/bin/env node
/**
 * SEO Validator for FileFlip
 *
 * Checks the project source for common SEO issues without running a build.
 * Run with: npm run seo:validate
 * Exit code 0 = all checks passed; 1 = one or more errors found.
 */

import { readFileSync, readdirSync, existsSync } from "fs";
import { join, resolve } from "path";

const ROOT = resolve(process.cwd());
const LOCALES = ["en", "it", "es", "fr", "de", "pt", "zh", "hi", "ar"];
const DEFAULT_LOCALE = "en";
const MAX_TITLE_LEN = 50;   // chars for the metaTitle BEFORE " — FileFlip" is appended
const MIN_DESC_LEN = 120;
const MAX_DESC_LEN = 160;
const BRAND_SUFFIX = " — FileFlip";

let errors = 0;
let warnings = 0;

function err(msg)  { console.error(`  ❌ ERROR:   ${msg}`); errors++; }
function warn(msg) { console.warn( `  ⚠️  WARNING: ${msg}`); warnings++; }
function ok(msg)   { console.log(  `  ✅ OK:      ${msg}`); }

// ─────────────────────────────────────────────────────────────────────────────
// 1. Load English messages for reference
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n📋 Loading messages…");
const messagesDir = join(ROOT, "messages");
const enMessages = JSON.parse(readFileSync(join(messagesDir, "en.json"), "utf-8"));
const enTools = enMessages.tools || {};

// ─────────────────────────────────────────────────────────────────────────────
// 2. Enumerate tool directories
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n🔍 Checking tool directories…");
const toolsDir = join(ROOT, "app", "[locale]", "tools");
const toolEntries = readdirSync(toolsDir, { withFileTypes: true });
const toolSlugs = toolEntries
  .filter(d => d.isDirectory())
  .map(d => d.name);

console.log(`  Found ${toolSlugs.length} tool directories.`);

// Check each tool has page.js (required for the route to exist)
// layout.js without page.js = the route returns 404
const slugsWithPage = new Set();
const slugsWithoutPage = new Set();
for (const slug of toolSlugs) {
  const dir = join(toolsDir, slug);
  const hasPage = existsSync(join(dir, "page.js"));
  const hasLayout = existsSync(join(dir, "layout.js"));
  if (!hasPage) {
    slugsWithoutPage.add(slug);
    // Only flag as error if it's also in the sitemap (real 404 for crawlers)
  }
  if (hasPage && !hasLayout) {
    warn(`Tool '${slug}' has page.js but no layout.js (no per-tool SEO metadata)`);
  }
  if (hasPage) slugsWithPage.add(slug);
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Load sitemap TOOL_PATHS
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n🗺  Checking sitemap…");
const sitemapContent = readFileSync(join(ROOT, "app", "sitemap.js"), "utf-8");

// Strip comments before parsing, then extract only TOOL_PATHS block
const sitemapNoComments = sitemapContent
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\/\/[^\n]*/g, "");
const toolPathsBlock = sitemapNoComments.match(/const TOOL_PATHS\s*=\s*\[([\s\S]*?)\];/)?.[1] ?? "";
const toolPathMatches = [...toolPathsBlock.matchAll(/["'](\/tools\/[^"']+)["']/g)];
const sitemapSlugs = [...new Set(toolPathMatches.map(m => m[1].replace("/tools/", "")))];

// Check for duplicates in sitemap source
const allPathsRaw = toolPathMatches.map(m => m[1]);
const seen = new Set();
for (const p of allPathsRaw) {
  if (seen.has(p)) {
    err(`Sitemap has DUPLICATE entry: ${p}`);
  }
  seen.add(p);
}

// Check every tool with page.js is in the sitemap
for (const slug of slugsWithPage) {
  if (!sitemapSlugs.includes(slug)) {
    warn(`Tool '${slug}' has page.js but is missing from sitemap.js TOOL_PATHS`);
  }
}

// Flag tools in sitemap that lack page.js (they 404)
for (const slug of sitemapSlugs) {
  if (!slugsWithPage.has(slug)) {
    err(`Sitemap references '/tools/${slug}' but it has no page.js — route returns 404`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Load SLUG_TO_ID mapping
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n🔗 Checking relatedTools.js SLUG_TO_ID…");
const relatedContent = readFileSync(join(ROOT, "lib", "relatedTools.js"), "utf-8");

// Extract SLUG_TO_ID keys
const slugToIdMatch = relatedContent.match(/export const SLUG_TO_ID\s*=\s*\{([\s\S]*?)\};/);
const mappedSlugs = new Set();
if (slugToIdMatch) {
  const entries = [...slugToIdMatch[1].matchAll(/"([^"]+)":\s*"([^"]+)"/g)];
  for (const [, slug] of entries) mappedSlugs.add(slug);
}

for (const slug of toolSlugs) {
  if (!mappedSlugs.has(slug)) {
    warn(`Tool '${slug}' missing from SLUG_TO_ID in relatedTools.js`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Check metaTitles and metaDescriptions per language
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n📝 Checking metaTitles and metaDescriptions…");

let titleErrors = 0;
let descErrors = 0;

// Tool keys that are NOT actual tool pages (they're UI strings, not tools)
const NON_TOOL_KEYS = new Set(["title", "subtitle", "available", "searchPlaceholder", "noResults"]);

for (const lang of LOCALES) {
  const msgPath = join(messagesDir, `${lang}.json`);
  if (!existsSync(msgPath)) {
    err(`Missing messages file: ${lang}.json`);
    continue;
  }
  const msgs = JSON.parse(readFileSync(msgPath, "utf-8"));
  const tools = msgs.tools || {};

  // Check every EN tool key exists in this language
  for (const toolKey of Object.keys(enTools)) {
    // Skip UI string keys that are not actual tool entries
    if (NON_TOOL_KEYS.has(toolKey)) continue;

    if (!tools[toolKey]) {
      warn(`[${lang}] Missing tool namespace '${toolKey}'`);
      continue;
    }

    const tool = tools[toolKey];

    // metaTitle checks
    if (!tool.metaTitle) {
      warn(`[${lang}] tools.${toolKey}.metaTitle is missing`);
    } else {
      const title = tool.metaTitle;
      // Check for doubled brand
      if (title.includes("| FileFlip") || title.match(/—\s*FileFlip\s*$/)) {
        err(`[${lang}] tools.${toolKey}.metaTitle contains brand suffix (will be doubled by template): "${title}"`);
        titleErrors++;
      }
      // Check length: rendered = metaTitle + " — FileFlip"
      const rendered = title + BRAND_SUFFIX;
      if (rendered.length > 60) {
        // For non-latin scripts (zh, hi, ar) character count is different — use a higher threshold
        const limit = ["zh", "hi", "ar"].includes(lang) ? 80 : 60;
        if (rendered.length > limit) {
          warn(`[${lang}] tools.${toolKey}.metaTitle will render as ${rendered.length} chars (limit ${limit}): "${title}"`);
          titleErrors++;
        }
      }
    }

    // metaDescription checks
    if (!tool.metaDescription) {
      warn(`[${lang}] tools.${toolKey}.metaDescription is missing`);
    } else {
      const desc = tool.metaDescription;
      // CJK and RTL scripts are semantically denser than Latin — use lower minimums
      const minLen = lang === "zh" ? 60 : (["ar", "hi"].includes(lang) ? 100 : MIN_DESC_LEN);
      if (desc.length < minLen) {
        warn(`[${lang}] tools.${toolKey}.metaDescription too short: ${desc.length} chars (min ${minLen})`);
        descErrors++;
      } else if (desc.length > MAX_DESC_LEN) {
        warn(`[${lang}] tools.${toolKey}.metaDescription too long: ${desc.length} chars (max ${MAX_DESC_LEN})`);
        descErrors++;
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Check TOOL_IDS on homepage
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n🏠 Checking homepage TOOL_IDS…");
const homepageContent = readFileSync(join(ROOT, "app", "[locale]", "page.js"), "utf-8");
const hrefMatches = [...homepageContent.matchAll(/href:\s*["']\/tools\/([^"']+)["']/g)];
const homepageSlugs = new Set(hrefMatches.map(m => m[1]));

// Special pages that live under /tools/ but are not tool-grid entries
const HOMEPAGE_EXCLUDED_SLUGS = new Set(["compare"]);

for (const slug of sitemapSlugs) {
  if (!homepageSlugs.has(slug) && !HOMEPAGE_EXCLUDED_SLUGS.has(slug)) {
    warn(`Tool '${slug}' is in sitemap but NOT linked from homepage TOOL_IDS`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Check constants.js BASE_URL usage
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n🔒 Checking robots.js BASE_URL usage…");
const robotsContent = readFileSync(join(ROOT, "app", "robots.js"), "utf-8");
if (robotsContent.includes("https://www.fileflip.org") || robotsContent.includes("https://fileflip.org")) {
  err("robots.js contains hardcoded URL — use BASE_URL from constants.js instead");
} else {
  ok("robots.js uses BASE_URL");
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Summary
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n" + "═".repeat(60));
console.log(`SEO Validation complete.`);
console.log(`  Tool directories: ${toolSlugs.length}`);
console.log(`  Sitemap slugs:    ${sitemapSlugs.length}`);
console.log(`  Title issues:     ${titleErrors}`);
console.log(`  Desc issues:      ${descErrors}`);
console.log(`  Errors:           ${errors}`);
console.log(`  Warnings:         ${warnings}`);
console.log("═".repeat(60) + "\n");

if (errors > 0) {
  console.error(`❌ ${errors} error(s) found — fix before merging.\n`);
  process.exit(1);
} else if (warnings > 0) {
  console.warn(`⚠️  ${warnings} warning(s) — review recommended.\n`);
  process.exit(0);
} else {
  console.log(`✅ All SEO checks passed.\n`);
  process.exit(0);
}
