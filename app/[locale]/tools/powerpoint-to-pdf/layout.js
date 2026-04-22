import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildToolMetadata } from "@/lib/toolMetadata";
import ToolSchemaMarkup from "@/components/ToolSchemaMarkup";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tools.powerpointToPdf" });
  return buildToolMetadata({
    locale,
    toolPath: "powerpoint-to-pdf",
    title: t("metaTitle"),
    description: t("metaDescription"),
    keywords: "powerpoint to pdf, pptx to pdf, convert ppt to pdf online free",
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
