import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildToolMetadata } from "@/lib/toolMetadata";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tools.removeMetadata" });
  return buildToolMetadata({
    locale,
    toolPath: "remove-metadata",
    title: t("metaTitle"),
    description: t("metaDescription"),
    keywords: "remove image metadata EXIF online free, strip EXIF browser",
  });
}

export default async function Layout({ children, params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return children;
}
