import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { buildToolMetadata } from "@/lib/toolMetadata";
import { getToolFaq } from "@/lib/toolFaqs";
import { ToolJsonLd } from "@/components/ToolJsonLd";
import { FaqJsonLd } from "@/components/FaqJsonLd";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tools.mergePdf" });
  const title = t("metaTitle");
  const description = t("metaDescription");
  return buildToolMetadata({
    locale,
    toolPath: "merge-pdf",
    title,
    description,
    keywords: "merge PDF, combine PDF, join PDF online, free, multiple PDF in one",
  });
}

export default async function Layout({ children, params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tools.mergePdf" });
  const name = t("metaTitle");
  const description = t("metaDescription");
  const faqs = getToolFaq("merge-pdf");
  return (
    <>
      <ToolJsonLd name={name} description={description} />
      <FaqJsonLd faqs={faqs} />
      {children}
    </>
  );
}
