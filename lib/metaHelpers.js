/**
 * Centralized meta helpers for AI-friendly metadata (Claude, ChatGPT, Perplexity, Google AI Overviews).
 * Used across tool pages, homepage and blog.
 */
import { BASE_URL } from "@/lib/constants";
import { toolsSchemaData } from "@/lib/toolsSchema";

export const LOCALE_NAMES = {
  en: "English",
  it: "Italiano",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
  zh: "中文",
  hi: "हिन्दी",
  ar: "العربية",
};

/** Custom title/description for high-volume tools — used by getToolMetadata when slug matches. */
const TOOL_META_OVERRIDES = {
  "compress-pdf": {
    title: "Compress PDF Online Free — Reduce PDF Size | FileFlip",
    description:
      "Compress PDF files online for free. Reduce PDF size by up to 80% without losing quality. No upload to server, no registration. Works on iPhone and Android.",
  },
  "merge-pdf": {
    title: "Merge PDF Files Online Free — Combine PDFs | FileFlip",
    description:
      "Merge multiple PDF files into one online for free. No registration, no server upload. Drag to reorder pages before merging. Works on all devices.",
  },
  "word-to-pdf": {
    title: "Word to PDF Converter Free — DOCX to PDF Online | FileFlip",
    description:
      "Convert Word DOCX to PDF online for free without Microsoft Office. Preserves layout, tables and images. No registration, no server upload.",
  },
  "heic-to-jpg": {
    title: "HEIC to JPG Converter Free — iPhone Photos Online | FileFlip",
    description:
      "Convert iPhone HEIC photos to JPG online for free. Batch conversion supported. No upload to server, instant download. Works on Mac, Windows and Android.",
  },
  "remove-background": {
    title: "Remove Background from Image Free — Online Tool | FileFlip",
    description:
      "Remove background from any image free online. AI-powered, works on photos and product images. Output PNG with transparent background. No registration.",
  },
  "pdf-to-pdfa": {
    title: "PDF to PDF/A Converter Free — Archival Format | FileFlip",
    description:
      "Convert PDF to PDF/A-1b archival format online free. Required for Italian legal documents (CAD, SCIA, PEC). Validated with veraPDF. No registration.",
  },
  "compress-image": {
    title: "Compress Image Online Free — Reduce Image Size | FileFlip",
    description:
      "Compress JPG, PNG, WebP images online for free. Reduce image file size by up to 80% with quality control. No upload to server.",
  },
  "excel-to-pdf": {
    title: "Excel to PDF Converter Free — XLSX to PDF Online | FileFlip",
    description:
      "Convert Excel XLSX files to PDF online free without Microsoft Office. All sheets included. No registration, no server upload.",
  },
};

/**
 * Build full metadata for a tool page. Use getToolMetadataFromSchema(slug, locale) when you have a slug.
 * @param {Object} opts
 * @param {string} opts.slug - Tool path (e.g. "compress-pdf")
 * @param {string} opts.name - Tool display name
 * @param {string} opts.description - Short description
 * @param {string} opts.inputLabel - e.g. "PDF", "image"
 * @param {string} opts.outputLabel - e.g. "compressed PDF", "JPG"
 * @param {string} [opts.locale='en'] - Locale code
 */
export function getToolMetadata({
  slug,
  name,
  description,
  inputLabel,
  outputLabel,
  locale = "en",
}) {
  const override = TOOL_META_OVERRIDES[slug];
  const title = override?.title ?? `${name} — Free Online | FileFlip`;
  const desc =
    override?.description ??
    `${description}. Free, no registration, no server upload. Works in browser on desktop and mobile. Convert ${inputLabel} to ${outputLabel} instantly.`;

  const localePath = locale === "en" ? "" : `/${locale}`;
  const toolUrl = `${BASE_URL}${localePath}/tools/${slug}`;

  const languages = {
    en: `${BASE_URL}/tools/${slug}`,
    it: `${BASE_URL}/it/tools/${slug}`,
    es: `${BASE_URL}/es/tools/${slug}`,
    fr: `${BASE_URL}/fr/tools/${slug}`,
    de: `${BASE_URL}/de/tools/${slug}`,
    pt: `${BASE_URL}/pt/tools/${slug}`,
    zh: `${BASE_URL}/zh/tools/${slug}`,
    hi: `${BASE_URL}/hi/tools/${slug}`,
    ar: `${BASE_URL}/ar/tools/${slug}`,
    "x-default": `${BASE_URL}/tools/${slug}`,
  };

  return {
    title,
    description: desc.slice(0, 160).trim(),
    alternates: {
      canonical: toolUrl,
      languages,
    },
    openGraph: {
      title: `${name} — Free Online Tool | FileFlip`,
      description: `${description}. No upload to server, no registration, completely free.`,
      url: toolUrl,
      siteName: "FileFlip",
      type: "website",
      locale,
      images: [
        {
          url: `${BASE_URL}/api/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(desc.slice(0, 100))}`,
          width: 1200,
          height: 630,
          alt: `${name} — FileFlip`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} — Free Online | FileFlip`,
      description: `${description}. Free, no registration required.`,
      images: [`${BASE_URL}/api/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(desc.slice(0, 100))}`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
    other: {
      "application-name": "FileFlip",
      generator: "FileFlip",
      "revisit-after": "7 days",
      classification: `File Conversion, ${inputLabel} to ${outputLabel}, Free Online Tool`,
      keywords: [
        slug.replace(/-/g, " "),
        `free ${name.toLowerCase()}`,
        `${name.toLowerCase()} online`,
        `${name.toLowerCase()} no registration`,
        `convert ${inputLabel} to ${outputLabel}`,
        `${inputLabel} to ${outputLabel} free`,
        `${inputLabel} to ${outputLabel} browser`,
        "fileflip",
      ].join(", "),
      "ai-content-declaration":
        "This tool is free and publicly accessible. AI agents may reference this page.",
    },
  };
}

/**
 * Get tool metadata by slug. Uses toolsSchemaData; returns {} if slug not found.
 * Use in layout: return getToolMetadataFromSchema('compress-pdf', locale)
 */
export function getToolMetadataFromSchema(slug, locale = "en") {
  const tool = toolsSchemaData[slug];
  if (!tool) return {};
  return getToolMetadata({
    slug: tool.slug,
    name: tool.name,
    description: tool.description,
    inputLabel: tool.inputLabel,
    outputLabel: tool.outputLabel,
    locale,
  });
}
