"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import JSZip from "jszip";
import { Upload, Loader2, Check, Download, FileOutput } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

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
          {t("stepIndicatorConvert")}
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

const SCALE = 2;

export default function PdfToJpgPage() {
  const locale = useLocale();
  const t = useTranslations("tools.pdfToJpg");
  const tCommon = useTranslations("common");
  const tTool = useTranslations("tool");
  const [pdfFile, setPdfFile] = useState(null);
  const [results, setResults] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const step1Status = currentStep >= 2 ? "done" : currentStep === 1 ? "active" : "pending";
  const step2Status = currentStep >= 3 ? "done" : currentStep === 2 ? "active" : "pending";
  const step3Status = currentStep === 3 ? "active" : "pending";

  const processFile = useCallback(
    (file) => {
      if (!file) {
        setPdfFile(null);
        setResults([]);
        setCurrentStep(1);
        return;
      }
      if (file.type !== "application/pdf") {
        setError(t("errorPdfOnly"));
        setPdfFile(null);
        return;
      }
      setError("");
      setResults([]);
      setPdfFile(file);
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

  const handleConvert = useCallback(async () => {
    if (!pdfFile || typeof window === "undefined") return;
    setError("");
    setResults([]);
    setIsConverting(true);
    setProgress(0);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      if (typeof pdfjsLib.GlobalWorkerOptions !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
        try {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || "4.10.38"}/pdf.worker.min.mjs`;
        } catch {
          // worker optional; getDocument may work in main thread for smaller PDFs
        }
      }
      const arrayBuffer = await pdfFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      const out = [];
      for (let i = 1; i <= numPages; i++) {
        setProgress(Math.round((i / numPages) * 100));
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: SCALE });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        const renderContext = {
          canvasContext: ctx,
          viewport,
        };
        const renderTask = page.render(renderContext);
        await (renderTask.promise || renderTask);
        const blob = await new Promise((resolve) => {
          canvas.toBlob(resolve, "image/jpeg", 0.9);
        });
        if (blob) {
          out.push({
            pageIndex: i,
            blob,
            url: URL.createObjectURL(blob),
          });
        }
      }
      setResults(out);
      setCurrentStep(3);
    } catch (err) {
      setError(t("errorConversionFailed"));
      console.error(err);
    } finally {
      setIsConverting(false);
      setProgress(0);
    }
  }, [pdfFile, t]);

  const handleDownloadOne = useCallback((item) => {
    const a = document.createElement("a");
    a.href = item.url;
    const base = pdfFile?.name?.replace(/\.pdf$/i, "") || "document";
    a.download = `${base}-page-${item.pageIndex}.jpg`;
    a.click();
  }, [pdfFile]);

  const handleDownloadZip = useCallback(async () => {
    if (!results.length || !pdfFile) return;
    const zip = new JSZip();
    const base = pdfFile.name.replace(/\.pdf$/i, "") || "document";
    results.forEach((item) => {
      zip.file(`${base}-page-${item.pageIndex}.jpg`, item.blob);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${base}-all-pages.zip`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [results, pdfFile]);

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
          toolPath="pdf-to-jpg"
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
                    className="hidden"
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
                    <FileOutput size={28} className="text-rose-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-100">{pdfFile.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{formatBytes(pdfFile.size)}</p>
                  </div>
                </div>
              )}
            </div>

            {error && <p className="text-sm text-rose-400">{error}</p>}

            {pdfFile && !results.length && (
              <button
                type="button"
                disabled={isConverting}
                onClick={handleConvert}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-sky-500 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition hover:bg-sky-400 hover:shadow-sky-400/30 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isConverting ? (
                  <>
                    <Loader2 size={22} className="animate-spin shrink-0" />
                    <span>{t("convertingLabel")} {progress > 0 && `${progress}%`}</span>
                  </>
                ) : (
                  <>
                    <FileOutput size={22} strokeWidth={2} className="shrink-0" />
                    <span>{t("convertButton")}</span>
                  </>
                )}
              </button>
            )}

            {isConverting && progress > 0 && (
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
                <div
                  className="h-full rounded-full bg-sky-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {results.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-300">{t("downloadLabel")}</p>
                <div className="flex flex-wrap gap-2">
                  {results.map((item) => (
                    <button
                      key={item.pageIndex}
                      type="button"
                      onClick={() => handleDownloadOne(item)}
                      className="rounded-lg border border-white/20 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-700"
                    >
                      {t("downloadPage", { page: item.pageIndex })}
                    </button>
                  ))}
                  {results.length > 1 && (
                    <button
                      type="button"
                      onClick={handleDownloadZip}
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
                    >
                      {t("downloadAllZip")}
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>

          <aside className="space-y-8 lg:max-w-[340px]">
            <EditorialSection namespace="tools.pdfToJpg" />
          </aside>
        </div>

        <div className="mt-10">
          <RelatedTools locale={locale} currentSlug="pdf-to-jpg" />
        </div>

        <div className="mt-10">
          <FaqSection namespace="tools.pdfToJpg" />
        </div>
      </main>
    </div>
  );
}
