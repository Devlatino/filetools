import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { buildToolMetadata } from "@/lib/toolMetadata";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tools.excelToPdf" });
  const title = t("metaTitle");
  const description = t("metaDescription");
  return buildToolMetadata({
    locale,
    toolPath: "excel-to-pdf",
    title,
    description,
    keywords: "excel to pdf, xlsx to pdf, convert excel pdf, free, browser",
  });
}

export default async function Layout({ children }) {
  return <>{children}</>;
}
