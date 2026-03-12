import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildToolMetadata } from "@/lib/toolMetadata";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tools.pdfToImages" });
  return buildToolMetadata({
    locale,
    toolPath: "pdf-to-images",
    title: t("metaTitle"),
    description: t("metaDescription"),
    keywords: "PDF to images online free, convert PDF pages to PNG, browser",
  });
}

export default async function Layout({ children, params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return children;
}
