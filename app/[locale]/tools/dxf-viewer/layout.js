import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { buildToolMetadata } from "@/lib/toolMetadata";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tools.dxfViewer" });
  const title = t("metaTitle");
  const description = t("metaDescription");
  return buildToolMetadata({
    locale,
    toolPath: "dxf-viewer",
    title,
    description,
    keywords: "dxf viewer, view dxf, cad viewer, free, browser",
  });
}

export default async function Layout({ children }) {
  return <>{children}</>;
}
