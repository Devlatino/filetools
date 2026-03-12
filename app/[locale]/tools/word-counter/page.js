"use client";

import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Copy, Check, Trash2 } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const STOP_WORDS = new Set([
  "the", "a", "an", "is", "in", "on", "at", "to", "for", "of",
  "and", "or", "but", "it", "this", "that", "with", "from",
  "by", "as", "are", "was", "were", "be", "been", "have",
  "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "not", "no", "so", "if", "then",
  "than", "when", "where", "who", "which", "how", "what", "all",
  "some", "more", "also", "just", "can", "its", "their", "our",
  "your", "my", "we", "you", "he", "she", "they", "i", "me",
  "him", "her", "us", "them",
]);

const SOCIAL_LIMITS = [
  { key: "meta", max: 160, labelKey: "metaDesc" },
  { key: "title", max: 60, labelKey: "titleTag" },
  { key: "twitter", max: 280, labelKey: "twitter" },
  { key: "instagram", max: 2200, labelKey: "instagram" },
  { key: "linkedin", max: 3000, labelKey: "linkedin" },
];

function computeStats(text) {
  if (!text || !text.trim()) {
    return {
      words: 0,
      chars: 0,
      charsNoSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      lines: 0,
      readingMin: 0,
      readingSec: 0,
      speakingMin: 0,
      speakingSec: 0,
      readability: "easy",
      avgWordsPerSentence: 0,
    };
  }
  const trimmed = text.trim();
  const words = trimmed
    ? trimmed.split(/\s+/).filter(Boolean).length
    : 0;
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;
  const sentences = trimmed
    ? trimmed.split(/[.!?]+/).filter((s) => s.trim()).length
    : 0;
  const paragraphs = trimmed
    ? trimmed.split(/\n\n+/).filter(Boolean).length
    : 0;
  const lines = text.split(/\n/).length;
  const readingTotalSec = words / 225 * 60;
  const readingMin = Math.floor(readingTotalSec / 60);
  const readingSec = Math.round(readingTotalSec % 60);
  const speakingTotalSec = words / 130 * 60;
  const speakingMin = Math.floor(speakingTotalSec / 60);
  const speakingSec = Math.round(speakingTotalSec % 60);
  const avgWordsPerSentence =
    sentences > 0 ? words / sentences : 0;
  let readability = "easy";
  if (avgWordsPerSentence >= 14 && avgWordsPerSentence <= 20) readability = "medium";
  else if (avgWordsPerSentence > 20) readability = "hard";
  return {
    words,
    chars,
    charsNoSpaces,
    sentences,
    paragraphs,
    lines,
    readingMin,
    readingSec,
    speakingMin,
    speakingSec,
    readability,
    avgWordsPerSentence,
  };
}

function computeTopKeywords(text) {
  if (!text || !text.trim()) return [];
  const tokens = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
  const freq = {};
  tokens.forEach((w) => {
    freq[w] = (freq[w] || 0) + 1;
  });
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));
}


export default function WordCounterPage() {
  const locale = useLocale();
  const t = useTranslations("tools.wordCounter");
  const tCommon = useTranslations("common");
  const [text, setText] = useState("");
  const [stats, setStats] = useState(computeStats(""));
  const [copied, setCopied] = useState(false);
  const debounceRef = useRef(null);

  const analyze = useCallback((raw) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setStats(computeStats(raw));
      debounceRef.current = null;
    }, 100);
  }, []);

  const handleChange = useCallback(
    (e) => {
      const val = e.target.value;
      setText(val);
      analyze(val);
    },
    [analyze]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const topKeywords = useMemo(() => computeTopKeywords(text), [text]);
  const maxKeywordCount = topKeywords[0]?.count ?? 1;

  const handleClear = useCallback(() => {
    setText("");
    setStats(computeStats(""));
  }, []);

  const handleCopy = useCallback(() => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  const basePath = locale === "en" ? "" : `/${locale}`;
  const socialLabels = {
    metaDesc: t("metaDescLabel"),
    titleTag: t("titleTagLabel"),
    twitter: t("twitterLabel"),
    instagram: t("instagramLabel"),
    linkedin: t("linkedinLabel"),
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href={`/${basePath || ""}/`} prefetch className="flex items-center gap-2">
            <img src="/fileflip-logo.svg" alt={tCommon("siteName")} className="h-11 w-auto" width={170} height={44} />
            <span className="text-sm text-slate-400">{t("title")}</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumb
          locale={locale}
          homeLabel={tCommon("breadcrumbHome")}
          toolsLabel={tCommon("nav.tools")}
          toolLabel={t("title")}
          toolPath="word-counter"
        />

        <div className="mt-6">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("title")}</h1>
          <p className="mt-1 text-sm text-slate-300">{t("description")}</p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[60%_40%]">
          <div className="flex flex-col gap-3">
            <textarea
              value={text}
              onChange={handleChange}
              placeholder={t("placeholder")}
              className="min-h-[200px] w-full resize-y rounded-xl border border-white/10 bg-slate-900 p-4 text-sm text-slate-200 placeholder-slate-500 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/30 md:min-h-[300px]"
              spellCheck="true"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="rounded-lg border border-white/10 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700"
              >
                <Trash2 size={16} className="mr-1.5 inline" />
                {t("clearText")}
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-lg border border-white/10 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
                disabled={!text}
              >
                {copied ? <Check size={16} className="mr-1.5 inline text-emerald-400" /> : <Copy size={16} className="mr-1.5 inline" />}
                {copied ? t("copied") : t("copyText")}
              </button>
            </div>
          </div>

          <div className="max-h-[calc(100vh-12rem)] overflow-y-auto rounded-xl border border-white/10 bg-slate-900/60 p-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-slate-800/80 p-3">
                <div className="text-2xl font-bold text-slate-50">{stats.words}</div>
                <div className="text-xs text-slate-400">{t("words")}</div>
              </div>
              <div className="rounded-lg bg-slate-800/80 p-3">
                <div className="text-2xl font-bold text-slate-50">{stats.chars}</div>
                <div className="text-xs text-slate-400">{t("characters")}</div>
              </div>
              <div className="rounded-lg bg-slate-800/80 p-3">
                <div className="text-2xl font-bold text-slate-50">{stats.charsNoSpaces}</div>
                <div className="text-xs text-slate-400">{t("charactersNoSpaces")}</div>
              </div>
              <div className="rounded-lg bg-slate-800/80 p-3">
                <div className="text-2xl font-bold text-slate-50">{stats.sentences}</div>
                <div className="text-xs text-slate-400">{t("sentences")}</div>
              </div>
              <div className="rounded-lg bg-slate-800/80 p-3">
                <div className="text-2xl font-bold text-slate-50">{stats.paragraphs}</div>
                <div className="text-xs text-slate-400">{t("paragraphs")}</div>
              </div>
              <div className="rounded-lg bg-slate-800/80 p-3">
                <div className="text-2xl font-bold text-slate-50">{stats.lines}</div>
                <div className="text-xs text-slate-400">{t("lines")}</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs font-medium text-slate-400">{t("readingTime")}</div>
              <div className="text-slate-100">{stats.readingMin} {t("minutes")} {stats.readingSec} {t("seconds")}</div>
            </div>
            <div className="mt-1">
              <div className="text-xs font-medium text-slate-400">{t("speakingTime")}</div>
              <div className="text-slate-100">{stats.speakingMin} {t("minutes")} {stats.speakingSec} {t("seconds")}</div>
            </div>
            <div className="mt-4">
              <div className="text-xs font-medium text-slate-400">{t("readabilityLevel")}</div>
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                  stats.readability === "easy"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : stats.readability === "medium"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-rose-500/20 text-rose-400"
                }`}
              >
                {t(stats.readability)}
              </span>
            </div>
            <div className="mt-4">
              <div className="mb-2 text-xs font-medium text-slate-400">{t("socialLimits")}</div>
              <div className="space-y-2">
                {SOCIAL_LIMITS.map(({ key, max, labelKey }) => {
                  const val = stats.chars;
                  const pct = max > 0 ? (val / max) * 100 : 0;
                  const barColor =
                    pct < 80 ? "bg-emerald-500" : pct <= 100 ? "bg-amber-500" : "bg-rose-500";
                  const label = socialLabels[labelKey] || key;
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">{label}</span>
                        <span className="text-slate-200">{val} / {max}</span>
                      </div>
                      <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
                        <div
                          className={`h-full ${barColor}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {topKeywords.length > 0 && (
              <div className="mt-4">
                <div className="mb-2 text-xs font-medium text-slate-400">{t("topKeywords")}</div>
                <ul className="space-y-1.5">
                  {topKeywords.map(({ word, count }) => (
                    <li key={word} className="flex items-center gap-2">
                      <span className="w-24 truncate text-sm text-slate-200">{word}</span>
                      <div className="flex-1 overflow-hidden rounded bg-slate-700">
                        <div
                          className="h-1.5 rounded bg-sky-500"
                          style={{ width: `${(count / maxKeywordCount) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400">{count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <section className="mt-10 rounded-2xl border border-white/10 bg-slate-900/40 p-4 sm:p-6">
          <h2 className="mb-3 text-lg font-semibold text-slate-50">{t("howToUse")}</h2>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-300">
            <li>{t("step1")}</li>
            <li>{t("step2")}</li>
            <li>{t("step3")}</li>
          </ol>
        </section>
      </main>

      <div className="mx-auto max-w-6xl px-4 pb-4 sm:px-6 lg:px-8">
        <RelatedTools locale={locale} currentSlug="word-counter" />
        <div className="mt-10">
          <FaqSection namespace="tools.wordCounter" />
        </div>
      </div>
    </div>
  );
}
