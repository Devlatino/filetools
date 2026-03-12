import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildToolMetadata } from "@/lib/toolMetadata";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tools.markdownToHtml" });
  return buildToolMetadata({
    locale,
    toolPath: "markdown-to-html",
    title: t("metaTitle"),
    description: t("metaDescription"),
    keywords: "markdown to HTML converter online free, preview markdown browser",
  });
}

export default async function Layout({ children, params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return children;
}
