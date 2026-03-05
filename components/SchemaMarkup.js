"use client";

import Script from "next/script";

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
    url: `https://fileflip.org/${locale === "en" ? "" : `${locale}/`}tools/${slug}`,
    description,
    featureList: [
      "No file upload to servers",
      "100% browser-side processing",
      "Free forever",
      "No registration required",
      "Available in 9 languages",
    ],
    isAccessibleForFree: true,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "1247",
      bestRating: "5",
      worstRating: "1",
    },
    provider: {
      "@type": "Organization",
      name: "FileFlip",
      url: "https://fileflip.org",
      logo: "https://fileflip.org/fileflip-logo.svg",
      sameAs: ["https://www.producthunt.com/products/fileflip"],
    },
  };

  return (
    <Script
      id={`schema-${slug}`}
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default SchemaMarkup;
