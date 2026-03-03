import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { buildToolMetadata } from "@/lib/toolMetadata";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tools.reorderPdf" });
  const title = t("metaTitle");
  const description = t("metaDescription");
  return buildToolMetadata({
    locale,
    toolPath: "reorder-pdf-pages",
    title,
    description,
    keywords: "reorder pdf pages, pdf page order, rearrange pdf, free, browser",
  });
}

export default async function Layout({ children }) {
  return <>{children}</>;
}
