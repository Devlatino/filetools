"use client";

import { usePathname } from "next/navigation";
import { BASE_URL } from "@/lib/constants";
import { toolsSchemaData } from "@/lib/toolsSchema";

export default function ToolSchemaMarkup({ locale }) {
  const pathname = usePathname();
  const slug = pathname?.split("/tools/")[1]?.split("/")[0] || pathname?.split("/").filter(Boolean).pop();
  const tool = slug ? toolsSchemaData[slug] : null;

  if (!tool) return null;

  const localePath = locale === "en" ? "" : `/${locale}`;
  const toolUrl = `${BASE_URL}${localePath}/tools/${tool.slug}`;

  const graph = [
    {
      "@type": "WebApplication",
      "@id": `${toolUrl}#webapp`,
      name: tool.name,
      description: tool.description,
      url: toolUrl,
      applicationCategory: "UtilitiesApplication",
      applicationSubCategory: tool.category,
      browserRequirements: "Requires JavaScript. Works in Chrome, Firefox, Safari, Edge.",
      operatingSystem: "Any (browser-based, no installation required)",
      softwareVersion: "1.0",
      inLanguage: locale,
      availableOnDevice: ["Desktop", "Mobile", "Tablet"],
      isAccessibleForFree: true,
      isFamilyFriendly: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        description: "Free, no registration required",
      },
      provider: {
        "@type": "Organization",
        "@id": `${BASE_URL}#organization`,
        name: "FileFlip",
        url: BASE_URL,
        logo: `${BASE_URL}/fileflip-logo.svg`,
      },
      featureList: [
        `Input format: ${tool.inputFormats}`,
        `Output format: ${tool.outputFormats}`,
        "No file upload to server",
        "No registration required",
        "No watermarks",
        "Free to use",
        "Works on mobile",
        "Available in 9 languages",
      ],
      privacyPolicy: `${BASE_URL}/privacy`,
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "1247",
        bestRating: "5",
        worstRating: "1",
      },
      sameAs: [
        `${BASE_URL}/tools/${tool.slug}`,
        `${BASE_URL}/it/tools/${tool.slug}`,
        `${BASE_URL}/es/tools/${tool.slug}`,
        `${BASE_URL}/fr/tools/${tool.slug}`,
        `${BASE_URL}/de/tools/${tool.slug}`,
        `${BASE_URL}/pt/tools/${tool.slug}`,
        `${BASE_URL}/zh/tools/${tool.slug}`,
        `${BASE_URL}/hi/tools/${tool.slug}`,
        `${BASE_URL}/ar/tools/${tool.slug}`,
      ],
    },
    {
      "@type": "HowTo",
      "@id": `${toolUrl}#howto`,
      name: `How to use ${tool.name}`,
      description: `Step-by-step guide to ${tool.description.toLowerCase()}`,
      url: toolUrl,
      totalTime: "PT30S",
      tool: { "@type": "HowToTool", name: "FileFlip", url: BASE_URL },
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Open the tool",
          text: `Navigate to ${toolUrl} in your browser. No installation or registration required.`,
          url: toolUrl,
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Upload your file",
          text: `Click the upload area or drag and drop your ${tool.inputLabel} file. The file is processed locally in your browser.`,
          url: toolUrl,
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Convert",
          text: "Click the convert button. Processing happens instantly in your browser with no server upload.",
          url: toolUrl,
        },
        {
          "@type": "HowToStep",
          position: 4,
          name: "Download",
          text: `Download your converted ${tool.outputLabel} file. The result is ready in seconds.`,
          url: toolUrl,
        },
      ],
    },
    ...(Array.isArray(tool.faqs) && tool.faqs.length > 0
      ? [
          {
            "@type": "FAQPage",
            "@id": `${toolUrl}#faq`,
            mainEntity: tool.faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          },
        ]
      : []),
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}${localePath}` },
        { "@type": "ListItem", position: 2, name: "Tools", item: `${BASE_URL}${localePath}/tools` },
        { "@type": "ListItem", position: 3, name: tool.name, item: toolUrl },
      ],
    },
  ];

  const schema = { "@context": "https://schema.org", "@graph": graph };
  const html = JSON.stringify(schema).replace(/</g, "\\u003c");

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: html }} />;
}
