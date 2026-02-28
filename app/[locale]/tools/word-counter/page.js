"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { getToolFaq } from "@/lib/toolFaqs";
import { FaqSection } from "@/components/FaqSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const WORDS_PER_MINUTE = 200;

export default function WordCounterPage() {
  const locale = useLocale();
  const t = useTranslations("tools.wordCounter");
  const tCommon = useTranslations("common");
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
    const wordCount = words.length;
    const charsWithSpaces = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    const sentences = trimmed ? trimmed.split(/[.!?]+/).filter(Boolean).length : 0;
    const paragraphs = trimmed ? trimmed.split(/\n\n+/).filter(Boolean).length : 0;
    const readingMinutes = Math.ceil(wordCount / WORDS_PER_MINUTE) || 0;
    const freq = {};
    words.forEach((w) => {
      const lower = w.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (lower) freq[lower] = (freq[lower] || 0) + 1;
    });
    const topWords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));

    return {
      wordCount,
      charsWithSpaces,
      charsNoSpaces,
      sentences,
      paragraphs,
      readingMinutes,
      topWords,
    };
  }, [text]);

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
  };

  const handleDownload = () => {
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "text.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href={`/${locale}/`} prefetch className="flex items-center gap-2">
            <img src="/fileflip-logo.svg" alt={tCommon("siteName")} className="h-9 w-auto" width={140} height={36} />
            <span className="text-sm text-slate-400">{t("label")}</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto flex max-w-4xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumb locale={locale} homeLabel={tCommon("breadcrumbHome")} toolsLabel={tCommon("nav.tools")} toolLabel={t("label")} toolPath="word-counter" />
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("metaTitle")}</h1>
          <p className="max-w-xl text-sm text-slate-300">{t("metaDescription")}</p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-5">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type your text here…"
            className="min-h-[200px] w-full rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-200 placeholder:text-slate-500"
            rows={10}
          />
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
              <p className="text-xs text-slate-400">Words</p>
              <p className="text-xl font-semibold text-slate-50">{stats.wordCount}</p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
              <p className="text-xs text-slate-400">Characters (with spaces)</p>
              <p className="text-xl font-semibold text-slate-50">{stats.charsWithSpaces}</p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
              <p className="text-xs text-slate-400">Characters (no spaces)</p>
              <p className="text-xl font-semibold text-slate-50">{stats.charsNoSpaces}</p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
              <p className="text-xs text-slate-400">Sentences</p>
              <p className="text-xl font-semibold text-slate-50">{stats.sentences}</p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
              <p className="text-xs text-slate-400">Paragraphs</p>
              <p className="text-xl font-semibold text-slate-50">{stats.paragraphs}</p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
              <p className="text-xs text-slate-400">Reading time (~{WORDS_PER_MINUTE} wpm)</p>
              <p className="text-xl font-semibold text-slate-50">{stats.readingMinutes} min</p>
            </div>
          </div>
          {stats.topWords.length > 0 && (
            <div className="mt-4 rounded-lg border border-slate-700 bg-slate-950/60 p-3">
              <p className="mb-2 text-xs text-slate-400">Top 10 words</p>
              <div className="flex flex-wrap gap-2">
                {stats.topWords.map(({ word, count }) => (
                  <span key={word} className="rounded-full bg-slate-700 px-2 py-1 text-xs text-slate-200">
                    {word} ({count})
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="mt-4 flex gap-3">
            <button type="button" onClick={handleCopy} disabled={!text} className="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400 disabled:opacity-50">
              Copy text
            </button>
            <button type="button" onClick={handleDownload} disabled={!text} className="rounded-full border border-sky-400/50 bg-slate-800 px-4 py-2 text-xs font-semibold text-sky-200 hover:bg-slate-700 disabled:opacity-50">
              Download .txt
            </button>
          </div>
        </section>

        <RelatedTools locale={locale} currentSlug="word-counter" />
        <FaqSection faqs={getToolFaq("word-counter")} />
      </main>
    </div>
  );
}
