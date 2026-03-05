import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { buildToolMetadata } from "@/lib/toolMetadata";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tools.pdfToPdfa" });
  const title = t("metaTitle");
  const description = t("metaDescription");
  return buildToolMetadata({
    locale,
    toolPath: "pdf-to-pdfa",
    title,
    description,
    keywords: "pdf to pdfa, pdfa converter, iso 19005, archiving",
  });
}

export default async function Layout({ children }) {
  return <>{children}</>;
}
