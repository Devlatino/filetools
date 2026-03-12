import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildToolMetadata } from "@/lib/toolMetadata";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tools.colorConverter" });
  return buildToolMetadata({
    locale,
    toolPath: "color-converter",
    title: t("metaTitle"),
    description: t("metaDescription"),
    keywords: "color converter HEX RGB HSL, color code converter online free",
  });
}

export default async function Layout({ children, params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return children;
}
