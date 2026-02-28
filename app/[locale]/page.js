/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Image, FileText, Smartphone, Star } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const TOOL_ICONS = {
  compressImage: Image,
  mergePdf: FileText,
  heicToJpg: Smartphone,
};

const CATEGORIES = ["all", "images", "pdf"];

const POPULAR_TOOL_IDS = ["compressImage", "heicToJpg", "mergePdf"];

const TOOL_IDS = [
  { id: "compressImage", href: "/tools/compress-image", iconBg: "bg-sky-500", category: "images" },
  { id: "mergePdf", href: "/tools/merge-pdf", iconBg: "bg-rose-500", category: "pdf" },
  { id: "heicToJpg", href: "/tools/heic-to-jpg", iconBg: "bg-amber-600", category: "images" },
];

export default function Home() {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const tTools = useTranslations("tools");
  const locale = useLocale();
  const year = useMemo(() => new Date().getFullYear(), []);

  const [activeFilter, setActiveFilter] = useState("all");
  const [filesProcessed, setFilesProcessed] = useState(1_240_000);

  useEffect(() => {
    const t = setInterval(() => {
      setFilesProcessed((n) => n + Math.floor(1 + Math.random() * 3));
    }, 120);
    return () => clearInterval(t);
  }, []);

  const tools = useMemo(
    () =>
      TOOL_IDS.map(({ id, href, iconBg, category }) => ({
        id,
        href,
        label: tTools(`${id}.label`),
        short: tTools(`${id}.short`),
        iconBg,
        category,
      })),
    [tTools]
  );

  const filteredTools = useMemo(
    () =>
      activeFilter === "all" ? tools : tools.filter((tool) => tool.category === activeFilter),
    [tools, activeFilter]
  );

  const faqSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [1, 2, 3, 4, 5, 6, 7, 8].map((i) => ({
        "@type": "Question",
        name: t(`faq${i}Q`),
        acceptedAnswer: {
          "@type": "Answer",
          text: t(`faq${i}A`),
        },
      })),
    }),
    [t]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="relative z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href={`/${locale}/`} prefetch className="flex items-center gap-2">
            <img src="/fileflip-logo.svg" alt={tCommon("siteName")} className="h-9 w-auto" width={140} height={36} />
            <span className="hidden text-xs text-slate-300 sm:inline">{tCommon("tagline")}</span>
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
            <LanguageSwitcher />
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
          aria-label={t("statsLabel")}
          className="border-b border-white/10 bg-slate-900/40 py-6"
        >
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-8 px-4 sm:flex-nowrap sm:justify-between sm:gap-0 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
              <span className="text-2xl font-semibold tabular-nums text-slate-50">
                {filesProcessed.toLocaleString(locale)}
              </span>
              <span className="text-xs text-slate-400">{t("statsFiles")}</span>
            </div>
            <div className="hidden h-4 w-px bg-slate-600 sm:block" aria-hidden />
            <div className="flex flex-col items-center gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
              <span className="text-2xl font-semibold tabular-nums text-slate-50">
                {TOOL_IDS.length}
              </span>
              <span className="text-xs text-slate-400">{t("statsTools")}</span>
            </div>
            <div className="hidden h-4 w-px bg-slate-600 sm:block" aria-hidden />
            <div className="flex flex-col items-center gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
              <span className="flex items-center gap-1 text-2xl font-semibold text-slate-50">
                <span className="tabular-nums">4.8</span>
                <span className="flex text-amber-400" aria-hidden>
                  <Star size={18} className="fill-amber-400" stroke="currentColor" />
                  <Star size={18} className="fill-amber-400" stroke="currentColor" />
                  <Star size={18} className="fill-amber-400" stroke="currentColor" />
                  <Star size={18} className="fill-amber-400" stroke="currentColor" />
                  <Star size={18} className="fill-amber-400/80 stroke-amber-400" />
                </span>
              </span>
              <span className="text-xs text-slate-400">{t("statsRating")}</span>
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
                {t("toolsCount", { count: filteredTools.length })}
              </span>
            </div>

            <div className="mb-10">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
                {t("popularToolsTitle")}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tools
                  .filter((tool) => POPULAR_TOOL_IDS.includes(tool.id))
                  .sort((a, b) => POPULAR_TOOL_IDS.indexOf(a.id) - POPULAR_TOOL_IDS.indexOf(b.id))
                  .map((tool) => (
                    <Link
                      key={tool.id}
                      href={`/${locale}${tool.href}`}
                      prefetch
                      className="group relative flex flex-col rounded-2xl border border-sky-400/20 bg-slate-800/90 p-6 shadow-lg transition-all duration-300 ease-in-out hover:border-sky-400/50 hover:bg-slate-800 hover:shadow-sky-500/10"
                    >
                      <span className="absolute right-4 top-4 rounded-full bg-amber-500/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
                        {t("popularBadge")}
                      </span>
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl shadow-inner transition-transform group-hover:scale-105">
                        <div className={`flex h-full w-full items-center justify-center rounded-xl ${tool.iconBg} text-slate-950`}>
                          {(() => {
                            const IconComponent = TOOL_ICONS[tool.id];
                            return IconComponent ? <IconComponent size={24} strokeWidth={2} /> : null;
                          })()}
                        </div>
                      </div>
                      <h4 className="text-base font-semibold text-slate-50">{tool.label}</h4>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-300">{tool.short}</p>
                      <span className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-sky-500/20 px-4 py-2.5 text-sm font-semibold text-sky-100 transition-colors group-hover:bg-sky-500 group-hover:text-slate-950">
                        {tCommon("goToTool")}
                      </span>
                    </Link>
                  ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveFilter(cat)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    activeFilter === cat
                      ? "bg-sky-500 text-slate-950"
                      : "border border-slate-500/60 bg-transparent text-slate-300 hover:border-slate-400 hover:text-slate-100"
                  }`}
                >
                  {t(`filter${cat === "all" ? "All" : cat === "textCode" ? "TextCode" : cat.charAt(0).toUpperCase() + cat.slice(1)}`)}
                </button>
              ))}
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTools.map((tool) => (
                <Link
                  key={tool.href}
                  href={`/${locale}${tool.href}`}
                  prefetch
                  className="group flex flex-col rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-sm transition-all duration-300 ease-in-out hover:border-sky-400/70 hover:bg-slate-900"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${tool.iconBg} text-slate-950`}
                    >
                      {(() => {
                        const IconComponent = TOOL_ICONS[tool.id];
                        return IconComponent ? <IconComponent size={20} strokeWidth={2} /> : null;
                      })()}
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
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c"),
            }}
          />
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-4 text-lg font-semibold text-slate-50 sm:text-xl">
              {t("faqTitle")}
            </h2>
            <div className="space-y-6 text-sm text-slate-300">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i}>
                  <p className="font-medium text-slate-50">{t(`faq${i}Q`)}</p>
                  <p className="mt-1 leading-relaxed">{t(`faq${i}A`)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-slate-950">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-3">
              <Link href={`/${locale}/`} className="inline-block">
                <img src="/fileflip-logo.svg" alt={tCommon("siteName")} className="h-8 w-auto" width={120} height={32} />
              </Link>
              <p className="text-xs leading-relaxed text-slate-400">
                {tCommon("footer.description1")}
                <br />
                {tCommon("footer.description2")}
              </p>
            </div>
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-300">
                {tCommon("footer.toolsImages")}
              </h3>
              <ul className="space-y-2">
                {tools
                  .filter((t) => t.category === "images")
                  .map((tool) => (
                    <li key={tool.id}>
                      <Link
                        href={`/${locale}${tool.href}`}
                        className="text-xs text-slate-400 transition-colors hover:text-sky-400"
                      >
                        {tool.label}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-300">
                {tCommon("footer.toolsPdfVideo")}
              </h3>
              <ul className="space-y-2">
                {tools
                  .filter((t) => t.category === "pdf" || t.category === "video")
                  .map((tool) => (
                    <li key={tool.id}>
                      <Link
                        href={`/${locale}${tool.href}`}
                        className="text-xs text-slate-400 transition-colors hover:text-sky-400"
                      >
                        {tool.label}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-300">
                {tCommon("footer.usefulLinks")}
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href={`/${locale}/#tools`} className="text-xs text-slate-400 transition-colors hover:text-sky-400">
                    {tCommon("footer.allTools")}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/privacy`} className="text-xs text-slate-400 transition-colors hover:text-sky-400">
                    {tCommon("footer.privacy")}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/terms`} className="text-xs text-slate-400 transition-colors hover:text-sky-400">
                    {tCommon("footer.terms")}
                  </Link>
                </li>
                <li>
                  <Link href="/sitemap.xml" className="text-xs text-slate-400 transition-colors hover:text-sky-400">
                    {tCommon("footer.sitemap")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-slate-400 sm:flex-row">
            <p>
              © {year} {tCommon("siteName")} · {tCommon("footer.copyright")}
            </p>
            <LanguageSwitcher />
          </div>
        </div>
      </footer>
    </div>
  );
}

