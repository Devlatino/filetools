import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { buildToolMetadata } from "@/lib/toolMetadata";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tools.dwgToPdf" });
  const title = t("metaTitle");
  const description = t("metaDescription");
  return {
    ...buildToolMetadata({
      locale,
      toolPath: "dwg-to-pdf",
      title,
      description,
      keywords: "dwg to pdf, autocad to pdf, convert dwg, free, cloudconvert",
    }),
    robots: "noindex, nofollow",
  };
}

export default async function Layout({ children }) {
  return <>{children}</>;
}
