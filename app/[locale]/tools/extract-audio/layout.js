import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildToolMetadata } from "@/lib/toolMetadata";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tools.extractAudio" });
  return buildToolMetadata({
    locale,
    toolPath: "extract-audio",
    title: t("metaTitle"),
    description: t("metaDescription"),
    keywords: "extract audio from video online free, MP4 to MP3 browser",
  });
}

export default async function Layout({ children, params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return children;
}
