import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildToolMetadata } from "@/lib/toolMetadata";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tools.pdfToPptx" });
  return buildToolMetadata({
    locale,
    toolPath: "pdf-to-pptx",
    title: t("metaTitle"),
    description: t("metaDescription"),
    keywords: "PDF to PowerPoint PPTX online free, convert PDF to presentation",
  });
}

export default async function Layout({ children, params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return children;
}
