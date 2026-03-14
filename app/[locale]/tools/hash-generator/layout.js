import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildToolMetadata } from "@/lib/toolMetadata";
import { getToolMetadataFromSchema } from "@/lib/metaHelpers";
import ToolSchemaMarkup from "@/components/ToolSchemaMarkup";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const meta = getToolMetadataFromSchema("hash-generator", locale);
  if (Object.keys(meta).length > 0) return meta;
  const t = await getTranslations({ locale, namespace: "tools.hashGenerator" });
  return buildToolMetadata({
    locale,
    toolPath: "hash-generator",
    title: t("metaTitle"),
    description: t("metaDescription"),
    keywords: "hash generator, MD5, SHA-256, SHA-512, checksum, HMAC, file hash",
  });
}

export default async function Layout({ children, params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <ToolSchemaMarkup locale={locale} />
      {children}
    </>
  );
}
