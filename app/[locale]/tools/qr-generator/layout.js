import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildToolMetadata } from "@/lib/toolMetadata";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tools.qrGenerator" });
  return buildToolMetadata({
    locale,
    toolPath: "qr-generator",
    title: t("metaTitle"),
    description: t("metaDescription"),
    keywords: "QR code generator online free, custom QR code, WiFi QR code",
  });
}

export default async function Layout({ children, params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return children;
}
