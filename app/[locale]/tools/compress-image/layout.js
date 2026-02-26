import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { buildToolMetadata } from "@/lib/toolMetadata";
import { getToolFaq } from "@/lib/toolFaqs";
import { ToolJsonLd } from "@/components/ToolJsonLd";
import { FaqJsonLd } from "@/components/FaqJsonLd";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tools.compressImage" });
  const title = t("metaTitle");
  const description = t("metaDescription");
  return buildToolMetadata({
    locale,
    toolPath: "compress-image",
    title,
    description,
    keywords: "compress image, compress images online, free, JPG, PNG, WebP, reduce file size",
  });
}

export default async function Layout({ children, params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tools.compressImage" });
  const name = t("metaTitle");
  const description = t("metaDescription");
  const faqs = getToolFaq("compress-image");
  return (
    <>
      <ToolJsonLd name={name} description={description} />
      <FaqJsonLd faqs={faqs} />
      {children}
    </>
  );
}
