import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildToolMetadata } from "@/lib/toolMetadata";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tools.colorPalette" });
  return buildToolMetadata({
    locale,
    toolPath: "color-palette",
    title: t("metaTitle"),
    description: t("metaDescription"),
    keywords: "extract color palette from image, dominant colors image free",
  });
}

export default async function Layout({ children, params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return children;
}
