import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { BASE_URL } from "@/lib/constants";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const TERMS_SECTION_KEYS = [
  "acceptance",
  "service",
  "acceptableUse",
  "limitation",
  "ip",
  "changes",
  "law",
];

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "terms" });
  const pathSegment = "/terms";
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
  const description = t("sections.service.body");
  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      title: `${title} | FileFlip`,
      description,
      url: canonical,
      siteName: "FileFlip",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | FileFlip`,
      description,
    },
  };
}

export default async function TermsPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "terms" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" prefetch className="flex items-center gap-2">
            <img
              src="/fileflip-logo.svg"
              alt={tCommon("siteName")}
              className="h-11 w-auto"
              width={170}
              height={44}
            />
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-slate-400">
          <Link href="/" className="hover:text-slate-200">
            {tCommon("breadcrumbHome")}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-200">{t("title")}</span>
        </nav>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-slate-500">{t("lastUpdated")}</p>

        <div className="mt-6 space-y-6">
          {TERMS_SECTION_KEYS.map((key) => (
            <section key={key}>
              <h2 className="text-lg font-semibold text-slate-100">
                {t(`sections.${key}.title`)}
              </h2>
              <p className="mt-2 leading-relaxed text-slate-300">
                {t(`sections.${key}.body`)}
              </p>
            </section>
          ))}
        </div>
      </main>

      <footer className="mt-16 border-t border-white/10 py-8 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} FileFlip</p>
      </footer>
    </div>
  );
}
