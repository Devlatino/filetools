import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { buildToolMetadata } from "@/lib/toolMetadata";
import ToolSchemaMarkup from "@/components/ToolSchemaMarkup";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: "tools.loremIpsumGenerator",
  });
  return buildToolMetadata({
    locale,
    toolPath: "lorem-ipsum-generator",
    title: t("metaTitle"),
    description: t("metaDescription"),
    keywords: "lorem ipsum generator, placeholder text, paragraphs, free online",
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
