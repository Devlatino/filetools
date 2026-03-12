import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildToolMetadata } from "@/lib/toolMetadata";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tools.extractZip" });
  return buildToolMetadata({
    locale,
    toolPath: "extract-zip",
    title: t("metaTitle"),
    description: t("metaDescription"),
    keywords: "extract ZIP online free, unzip files browser, no upload",
  });
}

export default async function Layout({ children, params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return children;
}
