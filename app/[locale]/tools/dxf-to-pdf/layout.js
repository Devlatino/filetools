import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { buildToolMetadata } from "@/lib/toolMetadata";
import { getToolMetadataFromSchema } from "@/lib/metaHelpers";
import ToolSchemaMarkup from "@/components/ToolSchemaMarkup";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const meta = getToolMetadataFromSchema("dxf-to-pdf", locale);
  if (Object.keys(meta).length > 0) return meta;
  const t = await getTranslations({ locale, namespace: "tools.dxfToPdf" });
  const title = t("metaTitle");
  const description = t("metaDescription");
  return {
    ...buildToolMetadata({
      locale,
      toolPath: "dxf-to-pdf",
      title,
      description,
      keywords: "dxf to pdf, cad to pdf, convert dxf, free, cloudconvert",
    }),
    robots: "noindex, nofollow",
  };
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
