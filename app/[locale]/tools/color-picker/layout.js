import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildToolMetadata } from "@/lib/toolMetadata";
import { getToolMetadataFromSchema } from "@/lib/metaHelpers";
import ToolSchemaMarkup from "@/components/ToolSchemaMarkup";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const meta = getToolMetadataFromSchema("color-picker", locale);
  if (Object.keys(meta).length > 0) return meta;
  const t = await getTranslations({ locale, namespace: "tools.colorPicker" });
  return buildToolMetadata({
    locale,
    toolPath: "color-picker",
    title: t("metaTitle"),
    description: t("metaDescription"),
    keywords: "color picker, HEX RGB HSL CMYK, color converter, WCAG contrast, color harmonies",
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
