/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Image, FileText, Smartphone, Star, Search, ArrowRight, Upload, Download, Lock, Zap, Globe, Twitter, Github, Linkedin, ChevronUp, Maximize2, FileImage, FileOutput, FilePlus, FileDown, Scissors, RotateCw } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { locales, localeNames } from "@/i18n.js";

const TOOL_ICONS = {
  compressImage: Image,
  mergePdf: FileText,
  heicToJpg: Smartphone,
  resizeImage: Maximize2,
  jpgToPng: FileImage,
  pdfToJpg: FileOutput,
  pngToJpg: FileImage,
  imageToPdf: FilePlus,
  compressPdf: FileDown,
  webpToJpg: FileImage,
  splitPdf: Scissors,
  pngToPdf: FilePlus,
  jpgToPdf: FileOutput,
  svgToPng: FileImage,
  rotatePdf: RotateCw,
};

const CATEGORIES = ["all", "images", "pdf"];

const POPULAR_TOOL_IDS = ["compressImage", "heicToJpg", "mergePdf"];

const TOOL_IDS = [
  { id: "compressImage", href: "/tools/compress-image", category: "images", active: true },
  { id: "mergePdf", href: "/tools/merge-pdf", category: "pdf", active: true },
  { id: "heicToJpg", href: "/tools/heic-to-jpg", category: "images", active: true },
  { id: "resizeImage", href: "/tools/resize-image", category: "images", active: true },
  { id: "jpgToPng", href: "/tools/jpg-to-png", category: "images", active: true },
  { id: "pdfToJpg", href: "/tools/pdf-to-jpg", category: "pdf", active: true },
  { id: "pngToJpg", href: "/tools/png-to-jpg", category: "images", active: true },
  { id: "imageToPdf", href: "/tools/image-to-pdf", category: "pdf", active: true },
  { id: "compressPdf", href: "/tools/compress-pdf", category: "pdf", active: true },
  { id: "webpToJpg", href: "/tools/webp-to-jpg", category: "images", active: true },
  { id: "splitPdf", href: "/tools/split-pdf", category: "pdf", active: true },
  { id: "pngToPdf", href: "/tools/png-to-pdf", category: "pdf", active: true },
  { id: "jpgToPdf", href: "/tools/jpg-to-pdf", category: "pdf", active: true },
  { id: "svgToPng", href: "/tools/svg-to-png", category: "images", active: true },
  { id: "rotatePdf", href: "/tools/rotate-pdf", category: "pdf", active: true },
];

const CATEGORY_COLORS = {
  images: { hex: "#3b82f6", rgb: "59, 130, 246" },
  pdf: { hex: "#ef4444", rgb: "239, 68, 68" },
  video: { hex: "#8b5cf6", rgb: "139, 92, 246" },
  utility: { hex: "#10b981", rgb: "16, 185, 129" },
};

export default function Home() {
  const t = useTranslations("home");
  const tTrust = useTranslations("trust");
  const tHowTo = useTranslations("howTo");
  const tCommon = useTranslations("common");
  const tTools = useTranslations("tools");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const year = useMemo(() => new Date().getFullYear(), []);

  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [todayCount, setTodayCount] = useState(50000);
  const [displayToday, setDisplayToday] = useState(50000);
  const [flashToday, setFlashToday] = useState(false);
  const animTodayRef = useRef(null);

  const COOKIE_DAYS = 1;
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const getCookie = (name) => {
      const match = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)"));
      return match ? decodeURIComponent(match[1]) : null;
    };
    const setCookie = (name, value, days) => {
      document.cookie = name + "=" + encodeURIComponent(String(value)) + ";path=/;max-age=" + days * 86400 + ";SameSite=Lax";
    };
    const getStorage = (key) => {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    };
    const setStorage = (key, value) => {
      try {
        localStorage.setItem(key, String(value));
      } catch {}
    };
    const persistToday = (count, date) => {
      setCookie("ff_today_count", count, COOKIE_DAYS);
      setCookie("ff_today_date", date, COOKIE_DAYS);
      setStorage("ff_today_count", String(count));
      setStorage("ff_today_date", date);
    };

    const randomTodayStart = () => 10000 + Math.floor(Math.random() * (200000 - 10000 + 1));

    let today = randomTodayStart();
    const todayDateFromCookie = getCookie("ff_today_date");
    const todayDateFromLs = getStorage("ff_today_date");
    const savedDate = todayDateFromCookie ?? todayDateFromLs;
    if (savedDate !== todayStr) {
      today = randomTodayStart();
      persistToday(today, todayStr);
    } else {
      const todayFromCookie = getCookie("ff_today_count");
      const todayFromLs = getStorage("ff_today_count");
      const raw = todayFromCookie ?? todayFromLs;
      if (raw != null) {
        const n = parseInt(raw, 10);
        if (!Number.isNaN(n) && n >= 0) today = n;
      }
      persistToday(today, todayStr);
    }
    setTodayCount(today);
    setDisplayToday(today);

    const scheduleToday = () => {
      const delay = 5000 + Math.floor(Math.random() * (10000 - 5000 + 1));
      return setTimeout(() => {
        const d = new Date();
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const saved = getCookie("ff_today_date") ?? getStorage("ff_today_date");
        if (saved !== dateStr) {
          const fresh = randomTodayStart();
          persistToday(fresh, dateStr);
          setTodayCount(fresh);
          setDisplayToday(fresh);
        } else {
          const delta = 1 + Math.floor(Math.random() * 3);
          setTodayCount((prev) => {
            const next = prev + delta;
            persistToday(next, dateStr);
            return next;
          });
        }
        setFlashToday(true);
        scheduleToday();
      }, delay);
    };

    const tToday = scheduleToday();
    return () => clearTimeout(tToday);
  }, [todayStr]);

  useEffect(() => {
    const DURATION = 500;
    const startToday = displayToday;
    const endToday = todayCount;
    if (startToday === endToday) return;
    const startTime = performance.now();
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / DURATION);
      const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      setDisplayToday(Math.round(startToday + (endToday - startToday) * ease));
      if (progress < 1) {
        animTodayRef.current = requestAnimationFrame(tick);
      } else {
        setDisplayToday(endToday);
        setFlashToday(false);
      }
    };
    animTodayRef.current = requestAnimationFrame(tick);
    return () => {
      if (animTodayRef.current != null) cancelAnimationFrame(animTodayRef.current);
    };
  }, [todayCount]);

  const tools = useMemo(
    () =>
      TOOL_IDS.map(({ id, href, category, active }) => ({
        id,
        href,
        label: tTools(`${id}.label`),
        short: tTools(`${id}.short`),
        category,
        active,
      })),
    [tTools]
  );

  const [comingSoonTooltipId, setComingSoonTooltipId] = useState(null);
  const howSectionRef = useRef(null);
  const [howInView, setHowInView] = useState(false);
  const toolsSectionRef = useRef(null);
  const [toolsInView, setToolsInView] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showToolCardsSkeleton, setShowToolCardsSkeleton] = useState(true);

  useEffect(() => {
    const el = howSectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setHowInView(true);
      },
      { threshold: 0.2, rootMargin: "0px 0px -50px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const el = toolsSectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setToolsInView(true);
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setShowToolCardsSkeleton(false), 400);
    return () => clearTimeout(id);
  }, []);

  const filteredTools = useMemo(() => {
    let list = activeFilter === "all" ? tools : tools.filter((tool) => tool.category === activeFilter);
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (tool) =>
          tool.label.toLowerCase().includes(q) || tool.short.toLowerCase().includes(q)
      );
    }
    return list;
  }, [tools, activeFilter, searchQuery]);

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
            <img src="/fileflip-logo.svg" alt={tCommon("siteName")} className="h-11 w-auto" width={170} height={44} />
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
          {/* Animated mesh gradient background — dark blue + electric blue */}
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute -left-1/4 top-0 h-[80%] w-[90%] rounded-full bg-gradient-to-br from-slate-900 via-blue-950/80 to-sky-950/70 opacity-90 blur-3xl animate-mesh-1"
              aria-hidden
            />
            <div
              className="absolute -right-1/4 bottom-0 h-[70%] w-[85%] rounded-full bg-gradient-to-tl from-blue-900/60 via-sky-600/30 to-cyan-800/50 blur-3xl animate-mesh-2"
              aria-hidden
            />
            <div
              className="absolute left-1/2 top-1/2 h-[60%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-sky-800/40 via-blue-600/30 to-indigo-800/40 blur-3xl animate-mesh-3"
              aria-hidden
            />
          </div>

          <div className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
            <div className="space-y-8 text-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl lg:text-5xl">
                  {t("heroTitlePart1")}
                  <span className="text-sky-400">
                    {t("heroTitleHighlight")}
                  </span>
                  {t("heroTitlePart2")}
                </h1>
                <p className="mx-auto max-w-xl text-sm text-slate-300 sm:text-base">
                  {t("heroSubtitle")}
                </p>
              </div>

              <div className="mx-auto max-w-xl">
                <label htmlFor="hero-search" className="sr-only">
                  {t("searchPlaceholder")}
                </label>
                <div className="relative">
                  <Search
                    className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden
                  />
                  <input
                    id="hero-search"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("searchPlaceholder")}
                    className="w-full rounded-full border border-white/15 bg-slate-900/80 py-3.5 pl-11 pr-4 text-sm text-slate-50 placeholder:text-slate-500 focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <a
                  href="#tools"
                  className="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition hover:bg-sky-400 hover:shadow-sky-400/30"
                >
                  {t("ctaStart")}
                </a>
                <a
                  href="#tools"
                  className="inline-flex items-center justify-center rounded-full border-2 border-slate-500 bg-transparent px-5 py-2.5 text-sm font-medium text-slate-200 hover:border-sky-400 hover:text-sky-300"
                >
                  {t("ctaSeeAllTools")}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Social proof bar — marquee on mobile, fixed on desktop */}
        <section
          aria-label="Trust"
          className="border-b border-white/10 bg-slate-900/90 py-4 sm:py-5"
        >
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            {/* Desktop: fixed, centered */}
            <div className="hidden items-center justify-center gap-10 text-sm text-slate-300 sm:flex sm:gap-12 lg:gap-16">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-sky-400">
                  <Lock size={18} strokeWidth={2} />
                </span>
                <span>{tTrust("noData")}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-amber-400">
                  <Zap size={18} strokeWidth={2} />
                </span>
                <span>{tTrust("fast")}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-emerald-400">
                  <Globe size={18} strokeWidth={2} />
                </span>
                <span>{tTrust("languages")}</span>
              </div>
            </div>

            {/* Mobile: marquee */}
            <div className="overflow-hidden sm:hidden" aria-hidden>
              <div className="flex w-max animate-marquee gap-8 whitespace-nowrap py-1">
                {[1, 2].map((copy) => (
                  <div key={copy} className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-sky-400">
                        <Lock size={16} strokeWidth={2} />
                      </span>
                      <span className="text-sm text-slate-300">{tTrust("noData")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-amber-400">
                        <Zap size={16} strokeWidth={2} />
                      </span>
                      <span className="text-sm text-slate-300">{tTrust("fast")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-emerald-400">
                        <Globe size={16} strokeWidth={2} />
                      </span>
                      <span className="text-sm text-slate-300">{tTrust("languages")}</span>
                    </div>
                  </div>
                ))}
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
              <span
                className={`text-2xl font-semibold tabular-nums transition-colors duration-300 ${flashToday ? "text-sky-400" : "text-slate-50"}`}
                aria-live="polite"
              >
                {displayToday.toLocaleString(locale)}
              </span>
              <span className="text-xs text-slate-400">
                {t("statsFiles")} {t("statsToday")}
              </span>
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
          ref={howSectionRef}
          className="border-b border-white/10 bg-slate-950 px-4 py-12 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-lg font-semibold text-slate-50 sm:text-xl">
              {tHowTo("title")}
            </h2>
            <p className="mt-2 text-center text-sm text-slate-400">
              {tHowTo("subtitle")}
            </p>

            {/* Desktop: horizontal layout with connecting line */}
            <div className="relative mt-10 hidden items-start sm:mt-12 lg:flex">
              {/* Animated dashed line (horizontal) — runs between circle centers */}
              <div className="absolute left-1/6 right-1/6 top-14 h-px" aria-hidden>
                <svg className="h-full w-full" viewBox="0 0 100 1" preserveAspectRatio="none">
                  <line
                    x1="0"
                    y1="0.5"
                    x2="100"
                    y2="0.5"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="8 6"
                    strokeDashoffset={howInView ? 0 : 100}
                    className="text-sky-500/60 transition-[stroke-dashoffset] duration-1000 ease-out"
                    style={{ strokeLinecap: "round" }}
                  />
                </svg>
              </div>

              {[
                { num: 1, Icon: Search, titleKey: "step1Title", textKey: "step1Text" },
                { num: 2, Icon: Upload, titleKey: "step2Title", textKey: "step2Text" },
                { num: 3, Icon: Download, titleKey: "step3Title", textKey: "step3Text" },
              ].map(({ num, Icon, titleKey, textKey }) => (
                <div key={num} className="flex flex-1 flex-col items-center">
                  <div className="relative z-10 flex h-28 w-28 flex-shrink-0 flex-col items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-slate-50 shadow-lg shadow-sky-500/25">
                    <span className="text-2xl font-bold leading-none">{num}</span>
                    <Icon className="mt-2 h-7 w-7 opacity-95" strokeWidth={1.8} />
                  </div>
                  <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-slate-200">
                    {tHowTo(titleKey)}
                  </h3>
                  <p className="mt-1.5 text-center text-sm text-slate-50">{tHowTo(textKey)}</p>
                </div>
              ))}
            </div>

            {/* Mobile: vertical stack with vertical dashed line */}
            <div className="relative mt-10 flex lg:hidden">
              <div className="absolute left-8 top-0 bottom-0 w-px" aria-hidden>
                <svg className="h-full w-full" viewBox="0 0 1 100" preserveAspectRatio="none">
                  <line
                    x1="0.5"
                    y1="0"
                    x2="0.5"
                    y2="100"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="6 8"
                    strokeDashoffset={howInView ? 0 : 100}
                    className="text-sky-500/60 transition-[stroke-dashoffset] duration-1000 ease-out"
                  />
                </svg>
              </div>
              <div className="flex flex-col gap-8 pl-16">
                {[
                  { num: 1, Icon: Search, titleKey: "step1Title", textKey: "step1Text" },
                  { num: 2, Icon: Upload, titleKey: "step2Title", textKey: "step2Text" },
                  { num: 3, Icon: Download, titleKey: "step3Title", textKey: "step3Text" },
                ].map(({ num, Icon, titleKey, textKey }) => (
                  <div key={num} className="flex flex-col">
                    <div className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-slate-50 shadow-lg shadow-sky-500/25">
                      <span className="text-xl font-bold leading-none">{num}</span>
                      <Icon className="mt-1.5 h-5 w-5 opacity-95" strokeWidth={1.8} />
                    </div>
                    <h3 className="mt-3 text-sm font-semibold uppercase tracking-wide text-slate-200">
                      {tHowTo(titleKey)}
                    </h3>
                    <p className="mt-1 text-sm text-slate-50">{tHowTo(textKey)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="tools" ref={toolsSectionRef} className="tools-section-bg py-14 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl">
                  {tTools("title")}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {tTools("subtitle")}
                </p>
              </div>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                {tTools("available", { count: filteredTools.length })}
              </span>
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
                      : "border border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200"
                  }`}
                >
                  {t(`filter${cat === "all" ? "All" : cat === "textCode" ? "TextCode" : cat.charAt(0).toUpperCase() + cat.slice(1)}`)}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {showToolCardsSkeleton
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={`skeleton-${i}`}
                      className="relative flex flex-col rounded-2xl border border-white/[0.08] bg-[#0f172a] p-6"
                      aria-hidden
                    >
                      <div className="absolute right-4 top-4 h-6 w-16 animate-pulse rounded-full bg-white/10" />
                      <div className="mb-5 h-14 w-14 animate-pulse rounded-full bg-white/10" />
                      <div className="h-5 w-3/4 animate-pulse rounded bg-white/10" />
                      <div className="mt-2 h-4 w-full animate-pulse rounded bg-white/5" />
                      <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-white/5" />
                    </div>
                  ))
                : filteredTools.map((tool, index) => {
                    const IconComponent = TOOL_ICONS[tool.id];
                    const colors = CATEGORY_COLORS[tool.category] || CATEGORY_COLORS.images;
                    const categoryLabel = t(`filter${tool.category === "images" ? "Images" : tool.category === "pdf" ? "Pdf" : "Video"}`);
                    const showTooltip = comingSoonTooltipId === tool.id;

                    const cardContent = (
                      <>
                        <span
                          className="absolute left-4 top-4 rounded-full px-2.5 py-1 text-[11px] font-medium"
                          style={{
                            backgroundColor: `rgba(${colors.rgb}, 0.15)`,
                            color: colors.hex,
                          }}
                        >
                          {categoryLabel}
                        </span>
                        <span
                          className={`absolute right-4 top-4 rounded-full border px-2.5 py-1 text-[10px] font-medium ${
                            tool.active
                              ? "border-white/10 bg-white/5 text-slate-400"
                              : "border-white/10 bg-white/5 text-slate-500"
                          }`}
                        >
                          {tool.active ? t("badgeAvailable") : t("badgeComingSoon")}
                        </span>
                        <div
                          className="tool-card-icon-wrap mb-5 flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
                          style={{ color: colors.hex }}
                        >
                          {IconComponent ? <IconComponent size={32} strokeWidth={1.75} /> : null}
                        </div>
                        <h3 className="text-base font-semibold" style={{ color: "#f1f5f9" }}>
                          {tool.label}
                        </h3>
                        <p className="mt-1.5 line-clamp-2 text-sm" style={{ color: "#94a3b8" }}>
                          {tool.short}
                        </p>
                        <span
                          className="mt-auto flex pt-5 items-center justify-end gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                          style={{ color: colors.hex }}
                        >
                          <ArrowRight size={18} strokeWidth={2} />
                        </span>
                        {showTooltip && !tool.active && (
                          <div
                            className="absolute inset-x-4 bottom-4 rounded-lg border border-white/10 bg-[#0f172a] px-3 py-2 text-xs text-slate-300 shadow-lg"
                            role="tooltip"
                          >
                            {t("tooltipComingSoon")}
                          </div>
                        )}
                      </>
                    );

                    const cardBase = `group relative flex flex-col rounded-2xl p-6 min-h-[220px] tool-card-premium tool-card-enter ${toolsInView ? "tool-card-visible" : ""}`;
                    const cardStyle = {
                      transitionDelay: `${index * 50}ms`,
                      ["--card-hex"]: colors.hex,
                      ["--card-rgb"]: colors.rgb,
                    };

                    if (tool.active) {
                      return (
                        <Link
                          key={tool.id}
                          href={`/${locale}${tool.href}`}
                          prefetch
                          className={cardBase}
                          style={cardStyle}
                        >
                          {cardContent}
                        </Link>
                      );
                    }

                    return (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => setComingSoonTooltipId((prev) => (prev === tool.id ? null : tool.id))}
                        className={`${cardBase} text-left opacity-80 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-[#020817]`}
                        style={cardStyle}
                      >
                        {cardContent}
                      </button>
                    );
                  })}
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

      {/* Back to top — fixed bottom-right, visible after 300px scroll */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/30 transition-all duration-300 hover:bg-sky-400 hover:shadow-sky-400/40 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-950 ${
          showBackToTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
        }`}
        aria-label={tCommon("footer.backToTop")}
      >
        <ChevronUp size={24} strokeWidth={2} />
      </button>

      <footer className="border-t border-white/10 text-white" style={{ backgroundColor: "#0f172a" }}>
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Col 1: Logo + description + social */}
            <div className="space-y-4">
              <Link href={`/${locale}/`} className="inline-block">
                <img src="/fileflip-logo.svg" alt={tCommon("siteName")} className="h-10 w-auto brightness-0 invert" width={155} height={40} />
              </Link>
              <p className="text-sm leading-relaxed text-slate-200">
                {tCommon("footer.description1")}
                <br />
                {tCommon("footer.description2")}
              </p>
              <div className="flex gap-3">
                <a href="#" aria-label="Twitter / X" className="text-slate-300 transition hover:text-white">
                  <Twitter size={20} strokeWidth={1.5} />
                </a>
                <a href="#" aria-label="GitHub" className="text-slate-300 transition hover:text-white">
                  <Github size={20} strokeWidth={1.5} />
                </a>
                <a href="#" aria-label="LinkedIn" className="text-slate-300 transition hover:text-white">
                  <Linkedin size={20} strokeWidth={1.5} />
                </a>
              </div>
            </div>
            {/* Col 2: Tools */}
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
                {tCommon("footer.toolsTitle")}
              </h3>
              <ul className="space-y-2">
                {tools.map((tool) => (
                  <li key={tool.id}>
                    <Link
                      href={`/${locale}${tool.href}`}
                      className="text-sm text-slate-300 transition-colors hover:text-white"
                    >
                      {tool.label}
                    </Link>
                  </li>
                ))}
                <li className="text-sm text-slate-400">{tCommon("footer.moreComingSoon")}</li>
              </ul>
            </div>
            {/* Col 3: Company */}
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
                {tCommon("footer.companyTitle")}
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href={`/${locale}/privacy`} className="text-sm text-slate-300 transition-colors hover:text-white">
                    {tCommon("footer.privacy")}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/terms`} className="text-sm text-slate-300 transition-colors hover:text-white">
                    {tCommon("footer.terms")}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/contact`} className="text-sm text-slate-300 transition-colors hover:text-white">
                    {tCommon("footer.contact")}
                  </Link>
                </li>
                <li>
                  <Link href="/sitemap.xml" className="text-sm text-slate-300 transition-colors hover:text-white">
                    {tCommon("footer.sitemap")}
                  </Link>
                </li>
              </ul>
            </div>
            {/* Col 4: Languages */}
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
                {tCommon("footer.languagesTitle")}
              </h3>
              <ul className="space-y-2">
                {locales.map((loc) => (
                  <li key={loc}>
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          localStorage.setItem("NEXT_LOCALE", loc);
                        } catch (_) {}
                        router.replace(pathname, { locale: loc });
                      }}
                      className={`text-left text-sm transition-colors hover:text-white ${locale === loc ? "font-medium text-white" : "text-slate-300"}`}
                    >
                      {localeNames[loc] ?? loc}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-slate-300">
            © {year} {tCommon("siteName")} · {tCommon("footer.madeWith")} · {tCommon("footer.processedLocally")}
          </div>
        </div>
      </footer>
    </div>
  );
}

