"use client";

import Link from "next/link";
import { BASE_URL } from "@/lib/constants";

/**
 * Breadcrumb navigation: Home > Tools > [Tool name]
 * Renders clickable links and JSON-LD BreadcrumbList schema.
 */
export function Breadcrumb({ locale, homeLabel, toolsLabel, toolLabel, toolPath }) {
  const homeUrl = locale === "en" ? BASE_URL : `${BASE_URL}/${locale}`;
  const toolsUrl = locale === "en" ? `${BASE_URL}/#tools` : `${BASE_URL}/${locale}/#tools`;
  const toolUrl = locale === "en" ? `${BASE_URL}/tools/${toolPath}` : `${BASE_URL}/${locale}/tools/${toolPath}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: homeLabel,
        item: homeUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: toolsLabel,
        item: toolsUrl,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: toolLabel,
        item: toolUrl,
      },
    ],
  };

  const jsonStr = JSON.stringify(schema).replace(/</g, "\\u003c");

  return (
    <>
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-2 text-sm text-slate-300"
      >
        <Link
          href={locale === "en" ? "/" : `/${locale}/`}
          prefetch
          className="transition-colors hover:text-sky-400"
        >
          {homeLabel}
        </Link>
        <span aria-hidden="true">›</span>
        <Link
          href={locale === "en" ? "/#tools" : `/${locale}/#tools`}
          prefetch
          className="transition-colors hover:text-sky-400"
        >
          {toolsLabel}
        </Link>
        <span aria-hidden="true">›</span>
        <span className="text-slate-200" aria-current="page">
          {toolLabel}
        </span>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonStr }}
      />
    </>
  );
}
