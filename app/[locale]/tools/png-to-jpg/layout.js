import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { buildToolMetadata } from "@/lib/toolMetadata";
import { getToolFaq } from "@/lib/toolFaqs";
import { ToolJsonLd } from "@/components/ToolJsonLd";
import { FaqJsonLd } from "@/components/FaqJsonLd";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tools.pngToJpg" });
  const title = t("metaTitle");
  const description = t("metaDescription");
  return buildToolMetadata({
    locale,
    toolPath: "png-to-jpg",
    title,
    description,
    keywords: "PNG to JPG, convert PNG to JPG, image converter online, free",
  });
}

export default async function Layout({ children, params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tools.pngToJpg" });
  const name = t("metaTitle");
  const description = t("metaDescription");
  const faqs = getToolFaq("png-to-jpg");
  return (
    <>
      <ToolJsonLd name={name} description={description} />
      <FaqJsonLd faqs={faqs} />
      {children}
    </>
  );
}
