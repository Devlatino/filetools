import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { buildToolMetadata } from "@/lib/toolMetadata";
import ToolSchemaMarkup from "@/components/ToolSchemaMarkup";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: "tools.textCaseConverter",
  });
  return buildToolMetadata({
    locale,
    toolPath: "text-case-converter",
    title: t("metaTitle"),
    description: t("metaDescription"),
    keywords:
      "text case converter, uppercase, lowercase, camelCase, snake_case, free online",
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
