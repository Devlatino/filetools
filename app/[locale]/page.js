/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

const TOOL_IDS = [
  { id: "compressImage", href: "/tools/compress-image", icon: "IMG", iconBg: "bg-sky-500" },
  { id: "mergePdf", href: "/tools/merge-pdf", icon: "PDF", iconBg: "bg-rose-500" },
  { id: "compressPdf", href: "/tools/compress-pdf", icon: "PDF", iconBg: "bg-rose-400" },
  { id: "jpgToPng", href: "/tools/jpg-to-png", icon: "JPG", iconBg: "bg-sky-400" },
  { id: "pngToJpg", href: "/tools/png-to-jpg", icon: "PNG", iconBg: "bg-indigo-400" },
  { id: "imageToWebp", href: "/tools/image-to-webp", icon: "WBP", iconBg: "bg-emerald-400" },
  { id: "resizeImage", href: "/tools/resize-image", icon: "SIZE", iconBg: "bg-indigo-500" },
  { id: "pdfToImages", href: "/tools/pdf-to-images", icon: "PDF", iconBg: "bg-amber-400" },
  { id: "createZip", href: "/tools/create-zip", icon: "ZIP", iconBg: "bg-cyan-400" },
  { id: "extractZip", href: "/tools/extract-zip", icon: "ZIP", iconBg: "bg-cyan-500" },
];

export default function Home() {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const tTools = useTranslations("tools");
  const locale = useLocale();
  const year = useMemo(() => new Date().getFullYear(), []);

  const tools = useMemo(
    () =>
      TOOL_IDS.map(({ id, href, icon, iconBg }) => ({
        href,
        label: tTools(`${id}.label`),
        short: tTools(`${id}.short`),
        icon,
        iconBg,
      })),
    [tTools]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="relative z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href={`/${locale}/`} prefetch className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500 text-lg font-bold text-slate-950 shadow-sm">
              F
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-semibold tracking-tight">
                {tCommon("siteName")}
              </span>
              <span className="text-xs text-slate-300">
                {tCommon("tagline")}
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-4">
            <div className="hidden items-center gap-6 text-xs font-medium text-slate-300 sm:flex">
              <a href="#tools" className="hover:text-sky-400">
                {tCommon("nav.tools")}
              </a>
              <a href="#come-funziona" className="hover:text-sky-400">
                {tCommon("nav.howItWorks")}
              </a>
              <a href="#faq" className="hover:text-sky-400">
                {tCommon("nav.faq")}
              </a>
            </div>
            <LanguageSwitcher currentLocale={locale} />
          </nav>
        </div>
      </header>

      <main id="top" className="flex-1">
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.20),transparent_55%),radial-gradient(circle_at_bottom,_rgba(37,99,235,0.18),transparent_55%)]" />
          <div className="pointer-events-none absolute -left-1/3 top-10 h-64 w-[140%] animate-wave rounded-[999px] bg-gradient-to-r from-sky-500/25 via-cyan-400/15 to-blue-500/25 blur-3xl" />
          <div className="pointer-events-none absolute -right-1/3 bottom-0 h-80 w-[120%] animate-wave-slow rounded-[999px] bg-gradient-to-tr from-indigo-500/25 via-sky-500/10 to-cyan-400/25 blur-3xl" />

          <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <div className="space-y-8 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/25 bg-slate-950/80 px-3 py-1 text-[11px] font-medium text-sky-200 shadow-sm shadow-sky-500/20 backdrop-blur">
                {t("badge")}
              </div>

              <div className="space-y-4">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                  {t("title")}
                  <span className="block bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                    {t("titleHighlight")}
                  </span>
                </h1>
                <p className="mx-auto max-w-xl text-sm text-slate-300 sm:text-base">
                  {t("subtitle")}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-start">
                <a
                  href="#tools"
                  className="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-sm transition-transform transition-colors hover:-translate-y-0.5 hover:bg-sky-400"
                >
                  {t("cta")}
                </a>
                <a
                  href="#come-funziona"
                  className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-5 py-2 text-xs font-medium text-slate-200 hover:border-sky-400 hover:text-sky-300"
                >
                  {t("ctaSecondary")}
                </a>
              </div>

              <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-300 sm:justify-start">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {t("noWatermark")}
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {t("worksEverywhere")}
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {t("simpleInterface")}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="come-funziona"
          className="border-b border-white/10 bg-slate-950"
        >
          <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:flex-row sm:px-6 lg:px-8">
            <div className="sm:w-1/3">
              <h2 className="text-base font-semibold text-slate-50">
                {t("howTitle")}
              </h2>
              <p className="mt-2 text-xs text-slate-300">
                {t("howSubtitle")}
              </p>
            </div>
            <div className="grid flex-1 gap-4 text-sm sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-slate-900 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                  {t("step1Title")}
                </p>
                <p className="mt-2 text-slate-50">{t("step1Desc")}</p>
                <p className="mt-1 text-xs text-slate-300">
                  {t("step1Example")}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                  {t("step2Title")}
                </p>
                <p className="mt-2 text-slate-50">{t("step2Desc")}</p>
                <p className="mt-1 text-xs text-slate-300">
                  {t("step2Note")}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                  {t("step3Title")}
                </p>
                <p className="mt-2 text-slate-50">{t("step3Desc")}</p>
                <p className="mt-1 text-xs text-slate-300">
                  {t("step3Note")}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="tools" className="bg-slate-950 py-14 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  {t("toolsTitle")}
                </h2>
                <p className="mt-1 text-sm text-slate-300">
                  {t("toolsSubtitle")}
                </p>
              </div>
              <span className="inline-flex items-center rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs font-medium text-sky-100">
                {t("toolsCount", { count: tools.length })}
              </span>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {tools.map((tool) => (
                <Link
                  key={tool.href}
                  href={`/${locale}${tool.href}`}
                  prefetch
                  className="group flex flex-col rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-sm transition-colors hover:border-sky-400/70 hover:bg-slate-900"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${tool.iconBg} text-xs font-semibold text-slate-950`}
                    >
                      {tool.icon}
                    </div>
                    <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-[10px] font-medium text-emerald-100">
                      {tCommon("open")}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold">{tool.label}</h3>
                  <p className="mt-1.5 text-xs text-slate-300">{tool.short}</p>
                  <span className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-slate-100/10 px-3 py-2 text-xs font-semibold text-slate-100 transition-colors group-hover:bg-sky-400 group-hover:text-slate-950">
                    {tCommon("goToTool")}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section
          id="faq"
          className="border-t border-white/10 bg-slate-950 py-10 sm:py-12"
        >
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-4 text-lg font-semibold text-slate-50 sm:text-xl">
              {t("faqTitle")}
            </h2>
            <div className="space-y-4 text-sm text-slate-300">
              <div>
                <p className="font-medium text-slate-50">{t("faq1Q")}</p>
                <p className="mt-1">{t("faq1A")}</p>
              </div>
              <div>
                <p className="font-medium text-slate-50">{t("faq2Q")}</p>
                <p className="mt-1">{t("faq2A")}</p>
              </div>
              <div>
                <p className="font-medium text-slate-50">{t("faq3Q")}</p>
                <p className="mt-1">{t("faq3A")}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-slate-950">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-slate-400 sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {year} {tCommon("siteName")} · {tCommon("footer.copyright")}
          </p>
          <div className="flex gap-4">
            <button type="button" className="hover:text-sky-400">
              {tCommon("footer.privacy")}
            </button>
            <button type="button" className="hover:text-sky-400">
              {tCommon("footer.terms")}
            </button>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="hover:text-sky-400"
            >
              {tCommon("footer.backToTop")}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

function LanguageSwitcher({ currentLocale }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const locales = [
    { code: "en", name: "English" },
    { code: "it", name: "Italiano" },
    { code: "es", name: "Español" },
    { code: "zh", name: "中文" },
    { code: "hi", name: "हिन्दी" },
    { code: "ar", name: "العربية" },
    { code: "pt", name: "Português" },
    { code: "fr", name: "Français" },
  ];

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`relative ${isOpen ? "z-[60]" : ""}`} ref={menuRef}>
      <button
        type="button"
        onClick={toggle}
        className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-900/80 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:border-sky-400/50 hover:text-sky-200"
        aria-label="Select language"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="max-w-[4rem] truncate sm:max-w-none">
          {locales.find((l) => l.code === currentLocale)?.name ?? currentLocale}
        </span>
        <svg className="h-3.5 w-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full z-[60] pt-1">
          <div className="min-w-[10rem] rounded-xl border border-white/10 bg-slate-900 py-1 shadow-xl">
            {locales.map((loc) => (
              <Link
                key={loc.code}
                href={`/${loc.code}/`}
                className="block px-3 py-2 text-xs text-slate-200 hover:bg-sky-500/20 hover:text-sky-100"
              >
                {loc.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
