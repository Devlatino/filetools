import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { BASE_URL } from "@/lib/constants";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  const pathSegment = "/privacy";
  const canonical =
    locale === routing.defaultLocale
      ? `${BASE_URL}${pathSegment}`
      : `${BASE_URL}/${locale}${pathSegment}`;
  const languages = {};
  for (const loc of routing.locales) {
    languages[loc] =
      loc === routing.defaultLocale
        ? `${BASE_URL}${pathSegment}`
        : `${BASE_URL}/${loc}${pathSegment}`;
  }
  languages["x-default"] = `${BASE_URL}${pathSegment}`;
  const title = t("title");
  return {
    title,
    description: t("sections.dataCollected.body").slice(0, 160),
    alternates: { canonical, languages },
    openGraph: { title, url: canonical, siteName: "FileFlip", type: "website" },
    twitter: { card: "summary_large_image", title },
  };
}

export default function PrivacyLayout({ children }) {
  return children;
}
