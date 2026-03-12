"use client";

import Script from "next/script";
import { BASE_URL } from "@/lib/constants";

export function SchemaMarkup({
  title,
  description,
  slug,
  locale,
  category = "UtilitiesApplication",
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: title,
    applicationCategory: category,
    applicationSubCategory: "FileConverter",
    operatingSystem: "Web, Windows, macOS, Linux, Android, iOS",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    url: locale === "en" ? `${BASE_URL}/tools/${slug}` : `${BASE_URL}/${locale}/tools/${slug}`,
    description,
    featureList: [
      "No file upload to servers",
      "100% browser-side processing",
      "Free forever",
      "No registration required",
      "Available in 9 languages",
    ],
    isAccessibleForFree: true,
    provider: {
      "@type": "Organization",
      name: "FileFlip",
      url: BASE_URL,
      logo: `${BASE_URL}/fileflip-logo.svg`,
      sameAs: ["https://www.producthunt.com/products/fileflip"],
    },
  };

  return (
    <Script
      id={`schema-${slug}`}
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
    />
  );
}

export default SchemaMarkup;
