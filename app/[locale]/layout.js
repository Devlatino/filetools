import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { BASE_URL } from "@/lib/constants";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const languages = {};
  for (const loc of routing.locales) {
    languages[loc] =
      loc === routing.defaultLocale ? BASE_URL : `${BASE_URL}/${loc}`;
  }
  languages["x-default"] =
    routing.defaultLocale === "en" ? BASE_URL : `${BASE_URL}/en`;
  return {
    alternates: { languages },
  };
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  if (!routing.locales.includes(locale)) {
    return null;
  }
  setRequestLocale(locale);
  const messages = await getMessages();
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
