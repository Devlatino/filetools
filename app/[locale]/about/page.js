import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { BASE_URL } from "@/lib/constants";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  const pathSegment = "/about";
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
  const description = t("description");
  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "FileFlip",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function AboutPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "about" });
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
          <span className="text-slate-200">{tCommon("footer.about")}</span>
        </nav>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t("title")}
        </h1>

        <div className="mt-6 space-y-6 leading-relaxed text-slate-300">
          <p>{t("description")}</p>
          <p>{t("mission")}</p>
          <p>{t("howItWorks")}</p>
          <p>{t("privacy")}</p>
          <p>{t("team")}</p>
        </div>

        <h2 className="mt-8 text-xl font-semibold text-slate-100">
          Find us on
        </h2>
        <ul className="mt-2 space-y-2 text-slate-400">
          <li>
            Product Hunt:{" "}
            <a
              href="https://www.producthunt.com/products/fileflip"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:underline"
            >
              producthunt.com/products/fileflip
            </a>
          </li>
          <li>
            SaaSHub:{" "}
            <a
              href="https://www.saashub.com/fileflip"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:underline"
            >
              saashub.com/fileflip
            </a>
          </li>
        </ul>
      </main>

      <footer className="mt-16 border-t border-white/10 py-8 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} FileFlip</p>
      </footer>
    </div>
  );
}
