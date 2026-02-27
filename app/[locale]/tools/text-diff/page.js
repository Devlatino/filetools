"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { diffWords } from "diff";
import { getToolFaq } from "@/lib/toolFaqs";
import { FaqSection } from "@/components/FaqSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";

export default function TextDiffPage() {
  const locale = useLocale();
  const t = useTranslations("tools.textDiff");
  const tCommon = useTranslations("common");
  const [original, setOriginal] = useState("");
  const [modified, setModified] = useState("");

  const result = useMemo(() => {
    if (!original && !modified) return { parts: [], added: 0, removed: 0, unchanged: 0 };
    const changes = diffWords(original, modified);
    let added = 0, removed = 0, unchanged = 0;
    const parts = changes.map((part) => {
      const words = part.value.trim() ? part.value.split(/\s+/).length : 0;
      if (part.added) added += words;
      else if (part.removed) removed += words;
      else unchanged += words;
      return { ...part, words };
    });
    return { parts, added, removed, unchanged };
  }, [original, modified]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href={`/${locale}/`} prefetch className="flex items-center gap-2">
            <img src="/fileflip-logo.svg" alt={tCommon("siteName")} className="h-9 w-auto" width={140} height={36} />
            <span className="text-sm text-slate-400">{t("label")}</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto flex max-w-4xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumb locale={locale} homeLabel={tCommon("breadcrumbHome")} toolsLabel={tCommon("nav.tools")} toolLabel={t("label")} toolPath="text-diff" />
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("metaTitle")}</h1>
          <p className="max-w-xl text-sm text-slate-300">{t("metaDescription")}</p>
        </section>
        <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-300">Original text</label>
              <textarea
                value={original}
                onChange={(e) => setOriginal(e.target.value)}
                placeholder="Paste original text here…"
                className="mt-1 min-h-[200px] w-full rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-200 placeholder:text-slate-500"
                rows={10}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300">Modified text</label>
              <textarea
                value={modified}
                onChange={(e) => setModified(e.target.value)}
                placeholder="Paste modified text here…"
                className="mt-1 min-h-[200px] w-full rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-200 placeholder:text-slate-500"
                rows={10}
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs">
            <span className="rounded bg-emerald-500/20 px-2 py-1 text-emerald-300">Added: {result.added} words</span>
            <span className="rounded bg-red-500/20 px-2 py-1 text-red-300">Removed: {result.removed} words</span>
            <span className="rounded bg-slate-500/20 px-2 py-1 text-slate-300">Unchanged: {result.unchanged} words</span>
          </div>
          {result.parts.length > 0 && (
            <div className="mt-4 rounded-lg border border-slate-700 bg-slate-950/60 p-3">
              <p className="mb-2 text-xs font-medium text-slate-300">Diff (green = added, red = removed)</p>
              <div className="min-h-[80px] whitespace-pre-wrap break-words font-mono text-sm">
                {result.parts.map((part, i) => (
                  <span
                    key={i}
                    className={
                      part.added
                        ? "bg-emerald-500/30 text-emerald-200"
                        : part.removed
                          ? "bg-red-500/30 text-red-200"
                          : "text-slate-300"
                    }
                  >
                    {part.value}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
        <RelatedTools locale={locale} currentSlug="text-diff" />
        <FaqSection faqs={getToolFaq("text-diff")} />
      </main>
    </div>
  );
}
