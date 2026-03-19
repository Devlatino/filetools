import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildToolMetadata } from "@/lib/toolMetadata";
import { getToolMetadataFromSchema } from "@/lib/metaHelpers";
import ToolSchemaMarkup from "@/components/ToolSchemaMarkup";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const meta = getToolMetadataFromSchema("compare", locale);
  if (Object.keys(meta).length > 0) return meta;
  const t = await getTranslations({ locale, namespace: "tools.compare" });
  return buildToolMetadata({
    locale,
    toolPath: "compare",
    title: t("metaTitle"),
    description: t("metaDescription"),
    keywords: "fileflip vs smallpdf, fileflip vs ilovepdf, free pdf tools comparison, client-side pdf converter",
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
