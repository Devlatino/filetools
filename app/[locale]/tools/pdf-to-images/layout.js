import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { buildToolMetadata } from "@/lib/toolMetadata";
import { getToolFaq } from "@/lib/toolFaqs";
import { ToolJsonLd } from "@/components/ToolJsonLd";
import { FaqJsonLd } from "@/components/FaqJsonLd";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tools.pdfToImages" });
  const title = t("metaTitle");
  const description = t("metaDescription");
  return buildToolMetadata({
    locale,
    toolPath: "pdf-to-images",
    title,
    description,
    keywords: "PDF to images, PDF to PNG, extract PDF pages as images, free",
  });
}

export default async function Layout({ children, params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tools.pdfToImages" });
  const name = t("metaTitle");
  const description = t("metaDescription");
  const faqs = getToolFaq("pdf-to-images");
  return (
    <>
      <ToolJsonLd name={name} description={description} />
      <FaqJsonLd faqs={faqs} />
      {children}
    </>
  );
}
