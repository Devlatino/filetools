"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const PRIVACY_SECTION_KEYS = [
  "controller",
  "dataCollected",
  "cookies",
  "rights",
  "transfers",
  "adsense",
  "contact",
];

export default function PrivacyPage() {
  const locale = useLocale();
  const t = useTranslations("privacy");
  const tCommon = useTranslations("common");

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
            <span className="text-sm text-slate-400">{tCommon("footer.privacy")}</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-slate-400">
          <Link href="/" className="hover:text-slate-200">
            {tCommon("breadcrumbHome")}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-200">{t("title")}</span>
        </nav>

        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-slate-500">{t("lastUpdated")}</p>

        <div className="mt-6 space-y-6">
          {PRIVACY_SECTION_KEYS.map((key) => (
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
