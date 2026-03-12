import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildToolMetadata } from "@/lib/toolMetadata";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tools.csvTools" });
  return buildToolMetadata({
    locale,
    toolPath: "csv-tools",
    title: t("metaTitle"),
    description: t("metaDescription"),
    keywords: "merge CSV files, split CSV online free, CSV tools browser",
  });
}

export default async function Layout({ children, params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return children;
}
