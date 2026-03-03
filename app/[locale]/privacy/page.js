"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function PrivacyPage() {
  const locale = useLocale();
  const t = useTranslations("common");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href={`/${locale}/`} prefetch className="flex items-center gap-2">
            <img src="/fileflip-logo.svg" alt={t("siteName")} className="h-11 w-auto" width={170} height={44} />
            <span className="text-sm text-slate-400">{t("footer.privacy")}</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-slate-400">
          <Link href={`/${locale}/`} className="hover:text-slate-200">
            {t("breadcrumbHome")}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-200">{t("footer.privacy")}</span>
        </nav>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("footer.privacy")}</h1>
        <p className="mt-4 leading-relaxed text-slate-300">{t("pages.privacy.body")}</p>
      </main>
    </div>
  );
}
