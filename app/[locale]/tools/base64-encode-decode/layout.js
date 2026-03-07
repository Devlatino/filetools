import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildToolMetadata } from "@/lib/toolMetadata";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tools.base64EncodeDecode" });
  return buildToolMetadata({
    locale,
    toolPath: "base64-encode-decode",
    title: t("metaTitle"),
    description: t("metaDescription"),
    keywords: "base64 encoder, base64 decoder, base64 online free, encode decode base64",
  });
}

export default async function Layout({ children, params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tools.base64EncodeDecode" });
  const name = t("metaTitle");
  const description = t("metaDescription");

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web Browser",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    isAccessibleForFree: true,
    browserRequirements: "Requires JavaScript",
    provider: { "@type": "Organization", name: "FileFlip", url: "https://www.fileflip.org" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareSchema).replace(/</g, "\\u003c"),
        }}
      />
      {children}
    </>
  );
}
