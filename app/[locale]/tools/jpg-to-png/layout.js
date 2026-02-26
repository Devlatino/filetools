import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { buildToolMetadata } from "@/lib/toolMetadata";
import { getToolFaq } from "@/lib/toolFaqs";
import { ToolJsonLd } from "@/components/ToolJsonLd";
import { FaqJsonLd } from "@/components/FaqJsonLd";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tools.jpgToPng" });
  const title = t("metaTitle");
  const description = t("metaDescription");
  return buildToolMetadata({
    locale,
    toolPath: "jpg-to-png",
    title,
    description,
    keywords: "JPG to PNG, convert JPG to PNG, image converter online, free",
  });
}

export default async function Layout({ children, params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tools.jpgToPng" });
  const name = t("metaTitle");
  const description = t("metaDescription");
  const faqs = getToolFaq("jpg-to-png");
  return (
    <>
      <ToolJsonLd name={name} description={description} />
      <FaqJsonLd faqs={faqs} />
      {children}
    </>
  );
}
