import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildToolMetadata } from "@/lib/toolMetadata";
import { getToolMetadataFromSchema } from "@/lib/metaHelpers";
import ToolSchemaMarkup from "@/components/ToolSchemaMarkup";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const meta = getToolMetadataFromSchema("unit-converter", locale);
  if (Object.keys(meta).length > 0) return meta;
  const t = await getTranslations({ locale, namespace: "tools.unitConverter" });
  return buildToolMetadata({
    locale,
    toolPath: "unit-converter",
    title: t("metaTitle"),
    description: t("metaDescription"),
    keywords: "unit converter, length, weight, temperature, convert units",
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
