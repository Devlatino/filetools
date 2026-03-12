import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildToolMetadata } from "@/lib/toolMetadata";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tools.encryptText" });
  return buildToolMetadata({
    locale,
    toolPath: "encrypt-text",
    title: t("metaTitle"),
    description: t("metaDescription"),
    keywords: "encrypt text AES-256 online free, decrypt text with password browser",
  });
}

export default async function Layout({ children, params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return children;
}
