import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildToolMetadata } from "@/lib/toolMetadata";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tools.addWatermark" });
  return buildToolMetadata({
    locale,
    toolPath: "add-watermark",
    title: t("metaTitle"),
    description: t("metaDescription"),
    keywords: "add watermark to image, watermark image online, text watermark free",
  });
}

export default async function Layout({ children, params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return children;
}
