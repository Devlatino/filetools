import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildToolMetadata } from "@/lib/toolMetadata";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tools.mergeImages" });
  return buildToolMetadata({
    locale,
    toolPath: "merge-images",
    title: t("metaTitle"),
    description: t("metaDescription"),
    keywords: "merge images online free, combine images browser, join photos",
  });
}

export default async function Layout({ children, params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return children;
}
