"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Upload, Loader2, Check, Download, FileSearch } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { FaqSection } from "@/components/FaqSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

/**
 * Parse page range string "1-3, 5, 7-9" to 0-based indices.
 * Returns { indices: number[] } or { error: string }.
 */
function parsePageRange(input, totalPages) {
  if (!input || typeof input !== "string") {
    return { error: "empty" };
  }
  const trimmed = input.trim();
  if (!trimmed) return { error: "empty" };
  const parts = trimmed.split(",").map((p) => p.trim()).filter(Boolean);
  const indices = new Set();
  for (const part of parts) {
    if (part.includes("-")) {
      const [a, b] = part.split("-").map((s) => parseInt(s.trim(), 10));
      if (Number.isNaN(a) || Number.isNaN(b) || a < 1 || b < 1 || a > b) {
        return { error: "invalid_range" };
      }
      for (let i = a; i <= b; i++) {
        if (i > totalPages) return { error: "out_of_bounds" };
        indices.add(i - 1);
      }
    } else {
      const n = parseInt(part, 10);
      if (Number.isNaN(n) || n < 1) return { error: "invalid_page" };
      if (n > totalPages) return { error: "out_of_bounds" };
      indices.add(n - 1);
    }
  }
  const sorted = Array.from(indices).sort((x, y) => x - y);
  return { indices: sorted };
}

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function StepIndicator({ step1, step2, step3, t }) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold sm:h-8 sm:w-8 ${
            step1 === "done"
              ? "bg-emerald-500 text-slate-950"
              : step1 === "active"
                ? "bg-sky-500 text-slate-950"
                : "bg-slate-700 text-slate-400"
          }`}
        >
          {step1 === "done" ? <Check size={14} strokeWidth={2.5} /> : "1"}
        </span>
        <span
          className={`text-xs font-medium sm:text-sm ${
            step1 === "active" ? "text-sky-300" : step1 === "done" ? "text-emerald-300" : "text-slate-500"
          }`}
        >
          {t("stepIndicatorUpload")}
        </span>
      </div>
      <div className="h-px w-4 bg-slate-600 sm:w-8" aria-hidden />
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold sm:h-8 sm:w-8 ${
            step2 === "done"
              ? "bg-emerald-500 text-slate-950"
              : step2 === "active"
                ? "bg-sky-500 text-slate-950"
                : "bg-slate-700 text-slate-400"
          }`}
        >
          {step2 === "done" ? <Check size={14} strokeWidth={2.5} /> : "2"}
        </span>
        <span
          className={`text-xs font-medium sm:text-sm ${
            step2 === "active" ? "text-sky-300" : step2 === "done" ? "text-emerald-300" : "text-slate-500"
          }`}
        >
          {t("stepIndicatorExtract")}
        </span>
      </div>
      <div className="h-px w-4 bg-slate-600 sm:w-8" aria-hidden />
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold sm:h-8 sm:w-8 ${
            step3 === "done"
              ? "bg-emerald-500 text-slate-950"
              : step3 === "active"
                ? "bg-sky-500 text-slate-950"
                : "bg-slate-700 text-slate-400"
          }`}
        >
          {step3 === "done" ? <Check size={14} strokeWidth={2.5} /> : "3"}
        </span>
        <span
          className={`text-xs font-medium sm:text-sm ${
            step3 === "active" ? "text-sky-300" : step3 === "done" ? "text-emerald-300" : "text-slate-500"
          }`}
        >
          {t("stepIndicatorDownload")}
        </span>
      </div>
    </div>
  );
}

export default function ExtractPdfPagesPage() {
  const locale = useLocale();
  const t = useTranslations("tools.extractPdfPages");
  const tCommon = useTranslations("common");
  const tTool = useTranslations("tool");
  const [pdfFile, setPdfFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [rangeInput, setRangeInput] = useState("");
  const [resultBlob, setResultBlob] = useState(null);
  const [resultUrl, setResultUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const step1Status = currentStep >= 2 ? "done" : currentStep === 1 ? "active" : "pending";
  const step2Status = currentStep >= 3 ? "done" : currentStep === 2 ? "active" : "pending";
  const step3Status = currentStep === 3 ? "active" : "pending";

  const processFile = useCallback(
    async (file) => {
      if (!file) {
        setPdfFile(null);
        setPageCount(0);
        setRangeInput("");
        setResultBlob(null);
        setResultUrl((u) => {
          if (u) URL.revokeObjectURL(u);
          return "";
        });
        setCurrentStep(1);
        return;
      }
      if (file.type !== "application/pdf") {
        setError(t("errorPdfOnly"));
        setPdfFile(null);
        setPageCount(0);
        return;
      }
      setError("");
      setResultBlob(null);
      setResultUrl((u) => {
        if (u) URL.revokeObjectURL(u);
        return "";
      });
      setPdfFile(file);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const doc = await PDFDocument.load(arrayBuffer);
        setPageCount(doc.getPageCount());
      } catch {
        setPageCount(0);
      }
      setCurrentStep(2);
    },
    [t]
  );

  const handleFileChange = useCallback(
    (e) => {
      processFile(e.target.files?.[0] ?? null);
    },
    [processFile]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.relatedTarget && e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      processFile(e.dataTransfer?.files?.[0] ?? null);
    },
    [processFile]
  );

  const handleExtract = useCallback(async () => {
    if (!pdfFile || pageCount <= 0) {
      setError(t("errorSelectFirst"));
      return;
    }
    const parsed = parsePageRange(rangeInput, pageCount);
    if (parsed.error) {
      if (parsed.error === "empty") setError(t("errorRangeEmpty"));
      else if (parsed.error === "invalid_range" || parsed.error === "invalid_page") setError(t("errorRangeInvalid"));
      else setError(t("errorRangeOutOfBounds"));
      return;
    }
    setError("");
    setIsExtracting(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const srcDoc = await PDFDocument.load(arrayBuffer);
      const newDoc = await PDFDocument.create();
      const copiedPages = await newDoc.copyPages(srcDoc, parsed.indices);
      copiedPages.forEach((page) => newDoc.addPage(page));
      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      setResultBlob(blob);
      setResultUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
      setCurrentStep(3);
    } catch (err) {
      console.error(err);
      setError(t("errorExtractFailed"));
    } finally {
      setIsExtracting(false);
    }
  }, [pdfFile, pageCount, rangeInput, t]);

  const handleDownload = useCallback(() => {
    if (!resultBlob || !resultUrl) return;
    const base = pdfFile?.name?.replace(/\.pdf$/i, "") || "document";
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `${base}-extracted.pdf`;
    a.click();
  }, [resultBlob, resultUrl, pdfFile]);

  const handleReset = useCallback(() => {
    setPdfFile(null);
    setPageCount(0);
    setRangeInput("");
    setResultBlob(null);
    setResultUrl((u) => {
      if (u) URL.revokeObjectURL(u);
      return "";
    });
    setCurrentStep(1);
    setError("");
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href={`/${locale}/`} prefetch className="flex items-center gap-2">
            <img src="/fileflip-logo.svg" alt={tCommon("siteName")} className="h-11 w-auto" width={170} height={44} />
            <span className="text-sm text-slate-400">{t("label")}</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumb
          locale={locale}
          homeLabel={tCommon("breadcrumbHome")}
          toolsLabel={tCommon("nav.tools")}
          toolLabel={t("label")}
          toolPath="extract-pdf-pages"
        />

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_340px]">
          <section className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("metaTitle")}</h1>
              <p className="mt-1 text-sm text-slate-300">{t("metaDescription")}</p>
            </div>

            <StepIndicator step1={step1Status} step2={step2Status} step3={step3Status} t={t} />

            <div className="w-full">
              {!pdfFile ? (
                <label
                  role="button"
                  tabIndex={0}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  className={`flex h-[200px] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 px-4 transition-colors duration-200 ${
                    isDragOver
                      ? "border-sky-500 bg-sky-500/15"
                      : "border-dashed border-sky-500/70 bg-slate-900/50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                  <Upload
                    size={40}
                    strokeWidth={1.5}
                    className={isDragOver ? "text-sky-400" : "text-sky-500/80"}
                  />
                  <p className={`text-center text-sm font-medium ${isDragOver ? "text-sky-200" : "text-slate-300"}`}>
                    {isDragOver ? t("releaseToUpload") : tTool("dropZone")}
                  </p>
                </label>
              ) : (
                <div className="flex h-[200px] w-full items-center gap-4 rounded-xl border-2 border-dashed border-sky-500/50 bg-slate-900/60 p-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-rose-500/20">
                    <FileSearch size={28} className="text-rose-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-100">{pdfFile.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{formatBytes(pdfFile.size)}</p>
                    {pageCount > 0 && (
                      <p className="mt-1 text-xs text-sky-300">{t("pageCountLabel", { count: pageCount })}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {pdfFile && pageCount > 0 && !resultBlob && (
              <>
                <div className="space-y-2">
                  <label htmlFor="range-input" className="block text-sm font-medium text-slate-300">
                    {t("rangeLabel")}
                  </label>
                  <input
                    id="range-input"
                    type="text"
                    value={rangeInput}
                    onChange={(e) => setRangeInput(e.target.value)}
                    placeholder={t("rangePlaceholder")}
                    className="w-full rounded-xl border border-white/20 bg-slate-800 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <button
                  type="button"
                  disabled={isExtracting}
                  onClick={handleExtract}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-sky-500 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition hover:bg-sky-400 hover:shadow-sky-400/30 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 size={22} className="animate-spin shrink-0" />
                      <span>{t("extractingLabel")}</span>
                    </>
                  ) : (
                    <>
                      <FileSearch size={22} strokeWidth={2} className="shrink-0" />
                      <span>{t("extractButton")}</span>
                    </>
                  )}
                </button>
              </>
            )}

            {error && <p className="text-sm text-rose-400">{error}</p>}

            {resultBlob && resultUrl && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-300">{t("step3Description")}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-base font-semibold text-white transition hover:bg-emerald-500"
                  >
                    <Download size={20} strokeWidth={2} />
                    {t("downloadButton")}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-xl border border-white/20 bg-slate-800 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
                  >
                    {tCommon("reset")}
                  </button>
                </div>
              </div>
            )}
          </section>

          <aside className="space-y-8 lg:max-w-[340px]">
            <EditorialSection namespace="tools.extractPdfPages" />
          </aside>
        </div>

        <div className="mt-10">
          <RelatedTools locale={locale} currentSlug="extract-pdf-pages" />
        </div>

        <div className="mt-10">
          <FaqSection namespace="tools.extractPdfPages" />
        </div>
      </main>
    </div>
  );
}
