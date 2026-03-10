import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildToolMetadata } from "@/lib/toolMetadata";
import { getToolMetadataFromSchema } from "@/lib/metaHelpers";
import ToolSchemaMarkup from "@/components/ToolSchemaMarkup";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const meta = getToolMetadataFromSchema("markdown-to-pdf", locale);
  if (Object.keys(meta).length > 0) return meta;
  const t = await getTranslations({ locale, namespace: "tools.markdownToPdf" });
  return buildToolMetadata({
    locale,
    toolPath: "markdown-to-pdf",
    title: t("metaTitle"),
    description: t("metaDescription"),
    keywords: "markdown to pdf, convert markdown pdf, md to pdf online free",
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
