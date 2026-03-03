import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { buildToolMetadata } from "@/lib/toolMetadata";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tools.pdfPageNumbers" });
  const title = t("metaTitle");
  const description = t("metaDescription");
  return buildToolMetadata({
    locale,
    toolPath: "pdf-add-page-numbers",
    title,
    description,
    keywords: "pdf page numbers, add page numbers to pdf, pdf numbering, free, browser",
  });
}

export default async function Layout({ children }) {
  return <>{children}</>;
}
