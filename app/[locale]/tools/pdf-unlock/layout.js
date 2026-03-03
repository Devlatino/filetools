import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { buildToolMetadata } from "@/lib/toolMetadata";
import { getToolFaq } from "@/lib/toolFaqs";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tools.pdfUnlock" });
  const title = t("metaTitle");
  const description = t("metaDescription");
  return buildToolMetadata({
    locale,
    toolPath: "pdf-unlock",
    title,
    description,
    keywords: "unlock pdf, remove pdf password, pdf password remove, free, browser",
  });
}

export default async function Layout({ children, params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <>{children}</>;
}
