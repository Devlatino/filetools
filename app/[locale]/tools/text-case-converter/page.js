"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Copy, Check, Trash2, ArrowDownUp, Download } from "lucide-react";
import {
  toUpperCase,
  toLowerCase,
  toTitleCase,
  toSentenceCase,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  toKebabCase,
  toAlternatingCase,
  toInverseCase,
} from "@/lib/textCase";
import { FaqSection } from "@/components/FaqSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const CONVERTERS = [
  { key: "uppercase", fn: toUpperCase },
  { key: "lowercase", fn: toLowerCase },
  { key: "titleCase", fn: toTitleCase },
  { key: "sentenceCase", fn: toSentenceCase },
  { key: "camelCase", fn: toCamelCase },
  { key: "pascalCase", fn: toPascalCase },
  { key: "snakeCase", fn: toSnakeCase },
  { key: "kebabCase", fn: toKebabCase },
  { key: "alternatingCase", fn: toAlternatingCase },
  { key: "inverseCase", fn: toInverseCase },
];

export default function TextCaseConverterPage() {
  const locale = useLocale();
  const t = useTranslations("tools.textCaseConverter");
  const tCommon = useTranslations("common");
  const [input, setInput] = useState("");
  const [activeKey, setActiveKey] = useState("sentenceCase");
  const [copied, setCopied] = useState(false);

  const activeFn = CONVERTERS.find((c) => c.key === activeKey)?.fn ?? toSentenceCase;
  const output = input ? activeFn(input) : "";

  const wordCount = output.trim() ? output.trim().split(/\s+/).length : 0;
  const charCount = output.length;

  const handleConvert = useCallback((key) => {
    setActiveKey(key);
  }, []);

  const handleCopy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [output]);

  const handleClear = useCallback(() => {
    setInput("");
  }, []);

  const handleSwap = useCallback(() => {
    setInput(output);
  }, [output]);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  const basePath = locale === "en" ? "" : locale;

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
          toolPath="text-case-converter"
        />

        <div className="mt-6">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("title")}</h1>
          <p className="mt-1 text-sm text-slate-300">{t("description")}</p>
        </div>

        <div className="mt-6 space-y-6">
          <div className="flex flex-col gap-2">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleClear}
                className="rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-slate-700"
              >
                <Trash2 size={14} className="mr-1 inline" />
                {t("clear")}
              </button>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("inputPlaceholder")}
              className="min-h-[140px] w-full resize-y rounded-xl border border-white/10 bg-slate-900 p-4 text-sm text-slate-200 placeholder-slate-500 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
              spellCheck="false"
            />
            <div className="flex justify-end text-xs text-slate-500">
              {input.length} {t("characters")} · {input.trim() ? input.trim().split(/\s+/).length : 0} {t("words")}
            </div>
          </div>

          <div>
            <div className="mb-2 text-xs font-medium text-slate-400">{t("activeConversion")}</div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {CONVERTERS.map(({ key }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleConvert(key)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    activeKey === key
                      ? "border-sky-500 bg-sky-500/20 text-sky-200"
                      : "border-white/10 bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {t(key)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <textarea
              value={output}
              readOnly
              placeholder={t("outputPlaceholder")}
              className="min-h-[140px] w-full resize-y rounded-xl border border-white/10 bg-slate-900 p-4 text-sm text-slate-200 placeholder-slate-500"
              spellCheck="false"
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-slate-500">
                {charCount} {t("characters")} · {wordCount} {t("words")}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
                  disabled={!output}
                >
                  {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  {copied ? t("copied") : t("copyOutput")}
                </button>
                <button
                  type="button"
                  onClick={handleSwap}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
                  disabled={!output}
                >
                  <ArrowDownUp size={16} />
                  {t("swap")}
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
        <RelatedTools locale={locale} currentSlug="text-case-converter" />
        <div className="mt-10">
          <FaqSection namespace="tools.textCaseConverter" />
        </div>
      </div>
    </div>
  );
}
