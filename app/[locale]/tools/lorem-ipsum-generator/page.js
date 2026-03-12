"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Copy, Check, Download, FileText, Code } from "lucide-react";
import { generateText } from "@/lib/loremIpsum";
import { FaqSection } from "@/components/FaqSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const TYPES = [
  { key: "paragraphs", amountDefault: 5, amountMin: 1, amountMax: 20 },
  { key: "sentences", amountDefault: 10, amountMin: 1, amountMax: 50 },
  { key: "words", amountDefault: 100, amountMin: 10, amountMax: 500 },
  { key: "list", amountDefault: 8, amountMin: 3, amountMax: 30 },
  { key: "html", amountDefault: 3, amountMin: 1, amountMax: 10 },
];

export default function LoremIpsumGeneratorPage() {
  const locale = useLocale();
  const t = useTranslations("tools.loremIpsumGenerator");
  const tCommon = useTranslations("common");
  const [type, setType] = useState("paragraphs");
  const [amount, setAmount] = useState(5);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [includeHtml, setIncludeHtml] = useState(false);
  const [sentenceLength, setSentenceLength] = useState("medium");
  const [seed, setSeed] = useState(0);
  const [activeTab, setActiveTab] = useState("raw");
  const [copied, setCopied] = useState(false);

  const typeConfig = TYPES.find((x) => x.key === type) || TYPES[0];
  const amountMin = typeConfig.amountMin;
  const amountMax = typeConfig.amountMax;
  const amountVal = Math.min(amountMax, Math.max(amountMin, amount));

  const output = useMemo(
    () =>
      generateText({
        type,
        amount: amountVal,
        startWithLorem,
        includeHtml,
        sentenceLength,
        seed,
      }),
    [type, amountVal, startWithLorem, includeHtml, sentenceLength, seed]
  );

  const wordCount = output.trim() ? output.trim().split(/\s+/).length : 0;
  const charCount = output.length;

  const handleGenerate = useCallback(() => {
    setSeed((s) => s + 1);
  }, []);

  const handleTypeChange = useCallback((key) => {
    setType(key);
    const config = TYPES.find((x) => x.key === key);
    if (config) setAmount(config.amountDefault);
  }, []);

  const handleCopy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [output]);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lorem-ipsum.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  const basePath = locale === "en" ? "" : locale;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href={basePath ? `/${basePath}/` : "/"} prefetch className="flex items-center gap-2">
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
          toolPath="lorem-ipsum-generator"
        />

        <div className="mt-6">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("title")}</h1>
          <p className="mt-1 text-sm text-slate-300">{t("description")}</p>
        </div>

        <div className="mt-6 space-y-6">
          <div>
            <div className="mb-2 text-xs font-medium text-slate-400">{t("type")}</div>
            <div className="flex flex-wrap gap-2">
              {TYPES.map(({ key }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleTypeChange(key)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                    type === key
                      ? "border-sky-500 bg-sky-500/20 text-sky-200"
                      : "border-white/10 bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {t(key)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-medium text-slate-400">{t("amount")}</label>
              <span className="text-sm text-slate-300">{amountVal}</span>
            </div>
            <input
              type="range"
              min={amountMin}
              max={amountMax}
              value={amountVal}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-1 w-full accent-sky-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={startWithLorem}
                onChange={(e) => setStartWithLorem(e.target.checked)}
                className="rounded border-white/20 bg-slate-800 text-sky-500 focus:ring-sky-500"
              />
              <span className="text-sm text-slate-300">{t("startWithLorem")}</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={includeHtml}
                onChange={(e) => setIncludeHtml(e.target.checked)}
                className="rounded border-white/20 bg-slate-800 text-sky-500 focus:ring-sky-500"
              />
              <span className="text-sm text-slate-300">{t("includeHtmlTags")}</span>
            </label>
          </div>

          <div>
            <div className="mb-2 text-xs font-medium text-slate-400">{t("sentenceLength")}</div>
            <div className="flex gap-2">
              {["short", "medium", "long"].map((len) => (
                <button
                  key={len}
                  type="button"
                  onClick={() => setSentenceLength(len)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                    sentenceLength === len
                      ? "border-sky-500 bg-sky-500/20 text-sky-200"
                      : "border-white/10 bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {t(len)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleGenerate}
              className="rounded-xl bg-sky-500 px-8 py-3 text-base font-semibold text-slate-950 transition hover:bg-sky-400"
            >
              {t("generate")}
            </button>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/60 overflow-hidden">
            <div className="flex border-b border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab("raw")}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition ${
                  activeTab === "raw" ? "border-b-2 border-sky-500 bg-slate-900 text-sky-200" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <FileText size={16} />
                {t("rawText")}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition ${
                  activeTab === "preview" ? "border-b-2 border-sky-500 bg-slate-900 text-sky-200" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Code size={16} />
                {t("htmlPreview")}
              </button>
            </div>
            <div className="min-h-[200px] p-4">
              {activeTab === "raw" ? (
                <textarea
                  value={output}
                  readOnly
                  className="h-full min-h-[200px] w-full resize-y rounded-lg border-0 bg-slate-950 p-3 font-mono text-sm text-slate-200 focus:ring-0"
                  spellCheck="false"
                />
              ) : (
                <div
                  className="prose prose-invert max-w-none rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-slate-200 prose-p:mb-2 prose-ul:my-2 prose-li:my-0"
                  dangerouslySetInnerHTML={{ __html: output || "<p></p>" }}
                />
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-4 py-3">
              <span className="text-xs text-slate-500">
                {wordCount} {t("wordCount")} · {charCount} {t("charCount")}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
                  disabled={!output}
                >
                  {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  {copied ? t("copied") : t("copy")}
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
                  disabled={!output}
                >
                  <Download size={16} />
                  {t("download")}
                </button>
              </div>
            </div>
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
        <RelatedTools locale={locale} currentSlug="lorem-ipsum-generator" />
        <div className="mt-10">
          <FaqSection namespace="tools.loremIpsumGenerator" />
        </div>
      </div>
    </div>
  );
}
