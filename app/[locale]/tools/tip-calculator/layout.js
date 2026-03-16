import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { buildToolMetadata } from "@/lib/toolMetadata";
import ToolSchemaMarkup from "@/components/ToolSchemaMarkup";

export async function generateMetadata({ params }) {
  const resolved = await params;
  const locale = resolved?.locale ?? "en";
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tools.tipCalculator" });
  return buildToolMetadata({
    locale,
    toolPath: "tip-calculator",
    title: t("metaTitle"),
    description: t("metaDescription"),
    keywords: "tip calculator, split bill, gratuity, restaurant tip",
  });
}

export default async function Layout({ children, params }) {
  const resolved = await params;
  const locale = resolved?.locale ?? "en";
  setRequestLocale(locale);
  return (
    <>
      <ToolSchemaMarkup locale={locale} />
      {children}
    </>
  );
}
