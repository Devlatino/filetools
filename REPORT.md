# FileFlip SEO Audit Report — Phase 1

**Generated:** 2026-03-13
**Domain:** https://www.fileflip.org
**Tools found:** 82 directories
**Languages:** 9 (en, it, es, fr, de, pt, zh, hi, ar)

---

## 🔴 CRITICAL ISSUES

### 1. Sitemap Duplicates (`app/sitemap.js`)
Three tool paths appear **twice** in `TOOL_PATHS`, producing 6 duplicate sitemap entries × 9 locales = **54 extra URLs** in the XML sitemap:

| Path | Lines |
|------|-------|
| `/tools/lorem-ipsum-generator` | 75 and 92 |
| `/tools/word-counter` | 73 and 93 |
| `/tools/text-case-converter` | 74 and 94 |

**Impact:** Duplicate sitemap entries can confuse crawlers and dilute crawl budget.

---

### 2. Tools Missing from Sitemap (`app/sitemap.js`)
Three tools exist in the filesystem with full page.js + layout.js but are **not listed in TOOL_PATHS**:

| Tool | Directory |
|------|-----------|
| `compare` | `app/[locale]/tools/compare/` |
| `dwg-to-pdf` | `app/[locale]/tools/dwg-to-pdf/` |
| `dxf-to-pdf` | `app/[locale]/tools/dxf-to-pdf/` |

**Impact:** These pages will not appear in the XML sitemap. Google may not discover or re-crawl them.

---

### 3. Title Tag — Doubled Brand (9 tools × 9 locales = **81 pages**)
`buildToolMetadata()` in `lib/toolMetadata.js` uses the condition `title.includes("— FileFlip")` to detect if the brand is already present, then the Next.js root layout appends ` — FileFlip` via template `"%s — FileFlip"`.

Several `metaTitle` values in `messages/*.json` already contain `"| FileFlip"` (pipe format, not em-dash), so the condition never fires → the brand is appended **twice** by the template:

| Tool key | Current metaTitle (en) | Rendered title |
|----------|------------------------|----------------|
| `jsonFormatter` | `JSON Formatter & Validator Online Free \| FileFlip` | `JSON Formatter & Validator Online Free \| FileFlip — FileFlip` |
| `base64EncodeDecode` | `Base64 Encode & Decode Online Free \| FileFlip` | `Base64 Encode & Decode Online Free \| FileFlip — FileFlip` |
| `imageToText` | `Image to Text OCR Online Free \| FileFlip` | `Image to Text OCR Online Free \| FileFlip — FileFlip` |
| `passwordGenerator` | `Password Generator — Free & Secure \| FileFlip` | `Password Generator — Free & Secure \| FileFlip — FileFlip` |
| `markdownToPdf` | `Markdown to PDF Converter — Free Online \| FileFlip` | `Markdown to PDF Converter — Free Online \| FileFlip — FileFlip` |
| `unitConverter` | `Unit Converter — Length, Weight, Temperature & More \| FileFlip` | `Unit Converter — Length, Weight, Temperature & More \| FileFlip — FileFlip` |

**Impact:** All 6 tools × 9 locales = 54 pages with visibly broken title tags in SERPs.

---

### 4. Title Tags Too Long (> 60 chars) — additional 3 tools × 9 locales = **27 pages**

| Tool key | metaTitle (en) | Est. rendered length |
|----------|----------------|---------------------|
| `wordCounter` | `Word Counter — Count Words, Characters & Reading Time Free` | 70 chars |
| `textCaseConverter` | `Text Case Converter — UPPERCASE, lowercase, camelCase Free` | 71 chars |
| `loremIpsumGenerator` | `Lorem Ipsum Generator — Paragraphs, Words & HTML Free` | 65 chars |

Also borderline:
| `unitConverter` (after brand fix) | `Unit Converter — Length, Weight, Temperature & More` | 63 chars |

---

## 🟡 HIGH PRIORITY ISSUES

### 5. 15 Tools Orphaned (in sitemap, not on homepage grid or tools listing)
These tools exist in the filesystem **and** in the sitemap but are **not reachable via any internal link** (not in `TOOL_IDS` on homepage and not rendered in `tools/page.js` TOOL_CATEGORIES):

| Slug | Exists | In Sitemap | In Homepage | In Tools Page |
|------|--------|-----------|-------------|---------------|
| add-watermark | ✅ | ✅ | ❌ | ❌ |
| color-converter | ✅ | ✅ | ❌ | ❌ |
| color-palette | ✅ | ✅ | ❌ | ❌ |
| csv-tools | ✅ | ✅ | ❌ | ❌ |
| encrypt-text | ✅ | ✅ | ❌ | ❌ |
| extract-audio | ✅ | ✅ | ❌ | ❌ |
| extract-frames | ✅ | ✅ | ❌ | ❌ |
| extract-zip | ✅ | ✅ | ❌ | ❌ |
| markdown-to-html | ✅ | ✅ | ❌ | ❌ |
| merge-images | ✅ | ✅ | ❌ | ❌ |
| pdf-to-images | ✅ | ✅ | ❌ | ❌ |
| pdf-to-pptx | ✅ | ✅ | ❌ | ❌ |
| qr-generator | ✅ | ✅ | ❌ | ❌ |
| remove-metadata | ✅ | ✅ | ❌ | ❌ |
| text-diff | ✅ | ✅ | ❌ | ❌ |

**Impact:** Pages exist and are indexed but have zero incoming internal links → low PageRank flow, poor crawlability.

### 6. Additional Tools Missing from tools/page.js TOOL_CATEGORIES
Beyond the 15 orphaned tools above, these active tools are in the homepage grid but missing from the `/tools` listing page:

| Slug | In Homepage | In Tools Page |
|------|-------------|---------------|
| password-generator | ✅ | ❌ |
| markdown-to-pdf | ✅ | ❌ |
| word-counter | ✅ | ❌ |
| text-case-converter | ✅ | ❌ |
| lorem-ipsum-generator | ✅ | ❌ |
| image-to-text | ✅ | ❌ |
| unit-converter | ✅ | ❌ |

Developer Tools in `tools/page.js` only lists 2 tools (`json-formatter`, `base64-encode-decode`) when 9+ should be listed.

### 7. Tools Missing from SLUG_TO_ID (`lib/relatedTools.js`)
These slugs are not in `SLUG_TO_ID`, so `tools/page.js` renders `null` for them:

| Slug | In Filesystem | In SLUG_TO_ID |
|------|--------------|--------------|
| `compare` | ✅ | ❌ |
| `dwg-to-pdf` | ✅ | ❌ |
| `dxf-to-pdf` | ✅ | ❌ |
| `unit-converter` | ✅ | ❌ |
| `password-generator` | ✅ | ❌ |

Also missing from `RELATED_TOOLS`.

---

## 🟡 MEDIUM PRIORITY ISSUES

### 8. OG Tags — Missing og:image on Tools Index Page (`app/[locale]/tools/page.js`)
`generateMetadata()` in tools/page.js sets `og:title`, `og:description`, `og:url`, `og:siteName`, `og:type` but **no `og:image`**.
→ Social previews will use the root fallback (`/og.png`) instead of a tool-specific image.
Also missing: `og:locale`, `og:locale:alternate`.

### 9. Outdated Tool Count References
Multiple files reference "56+" or "61" tools while the actual count is 80+:

| File | Outdated text |
|------|--------------|
| `app/[locale]/tools/page.js` | "Browse 56+ free online tools…" (title and description) |
| `app/[locale]/tools/page.js` | "56+ free tools…" (H1 sub-copy) |
| `app/layout.js` | "FileFlip — Free Online File Converter \| 61 Tools" (default title) |
| `app/layout.js` | "61 tools for PDF, images…" (meta description) |
| `app/layout.js` | "61 free tools for PDF…" (OG description) |

### 10. robots.js uses hardcoded www URL instead of BASE_URL
`app/robots.js` has hardcoded `https://www.fileflip.org` instead of `${BASE_URL}`.
Affects sitemap URL and host declaration.

---

## 🔵 INFORMATIONAL ISSUES

### 11. compare Tool — Fully Orphaned
`compare` is linked from `tools/page.js` Image Tools section (slug is present), but `SLUG_TO_ID["compare"]` is undefined → `if (!id) return null` → the card doesn't render.
The tool is accessible via direct URL only.

### 12. remove-background — Disabled on Homepage
`{ id: "removeBackground", active: false }` in homepage TOOL_IDS means it won't show on the grid.
However it IS linked from `tools/page.js` Image Tools and exists in the sitemap. This is likely intentional but creates an inconsistency.

### 13. Message Files Out of Sync
`fr.json` is 359 lines shorter than `en.json` (2,748 vs 3,107 lines), suggesting missing keys in French.

---

## SUMMARY

| Issue | Pages affected | Priority |
|-------|---------------|----------|
| Sitemap duplicates (3 tools × 9 locales) | 27 | 🔴 CRITICAL |
| Tools missing from sitemap (3 tools × 9 locales) | 27 | 🔴 CRITICAL |
| Doubled brand in title (6 tools × 9 locales) | 54 | 🔴 CRITICAL |
| Title too long (3+ tools × 9 locales) | 27+ | 🟡 HIGH |
| 15 orphaned tools (no incoming links) | 15 | 🟡 HIGH |
| 7 tools missing from /tools listing page | 7 | 🟡 HIGH |
| 5 slugs missing from SLUG_TO_ID | 5 | 🟡 HIGH |
| OG image missing on /tools page | 9 | 🟡 MEDIUM |
| Outdated tool counts (56+/61) | ~5 files | 🟡 MEDIUM |
| robots.js hardcoded URL | 1 | 🟡 MEDIUM |

---

## FIXES PLANNED (Phases 2–8)

1. **sitemap.js** — remove 3 duplicates, add compare + dwg-to-pdf + dxf-to-pdf
2. **relatedTools.js** — add 5 missing SLUG_TO_ID entries + RELATED_TOOLS
3. **tools/page.js** — add all missing tools to categories, fix counts, add og:image
4. **messages/*.json** (all 9 langs) — fix 6 doubled-brand metaTitles, shorten 3 too-long titles
5. **app/layout.js** — update "61" → "80+"
6. **app/robots.js** — use BASE_URL instead of hardcoded www
7. **scripts/seo-validator.js** — automated SEO validation script
8. **.github/workflows/seo-check.yml** — CI/CD SEO gate
