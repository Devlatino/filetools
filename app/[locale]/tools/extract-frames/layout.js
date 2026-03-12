import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildToolMetadata } from "@/lib/toolMetadata";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tools.extractFrames" });
  return buildToolMetadata({
    locale,
    toolPath: "extract-frames",
    title: t("metaTitle"),
    description: t("metaDescription"),
    keywords: "extract frames from video online free, video to JPG browser",
  });
}

export default async function Layout({ children, params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return children;
}
