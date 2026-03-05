"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Upload, Loader2, Check, Download, Eraser } from "lucide-react";
import imageCompression from "browser-image-compression";
import { FaqSection } from "@/components/FaqSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SchemaMarkup } from "@/components/SchemaMarkup";

const ACCEPT = "image/jpeg,image/png,image/webp";

/** Max dimension for background removal (avoids OOM and timeouts) */
const REMOVE_BG_MAX_DIM = 1024;
const REMOVE_BG_MAX_SIZE_MB = 2;

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
          {t("stepIndicatorProcess")}
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

export default function RemoveBackgroundPage() {
  const locale = useLocale();
  const t = useTranslations("tools.removeBackground");
  const tCommon = useTranslations("common");
  const tTool = useTranslations("tool");
  const [originalFile, setOriginalFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [resultBlob, setResultBlob] = useState(null);
  const [resultUrl, setResultUrl] = useState("");
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState(null);
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
        setOriginalFile(null);
        setOriginalUrl((u) => {
          if (u) URL.revokeObjectURL(u);
          return "";
        });
        setResultBlob(null);
        setResultUrl((u) => {
          if (u) URL.revokeObjectURL(u);
          return "";
        });
        setStatus("idle");
        setCurrentStep(1);
        return;
      }
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setError(t("errorUnsupportedFormat"));
        setOriginalFile(null);
        setOriginalUrl("");
        return;
      }
      setError("");
      setResultBlob(null);
      setResultUrl((u) => {
        if (u) URL.revokeObjectURL(u);
        return "";
      });
      setOriginalFile(file);
      setOriginalUrl(URL.createObjectURL(file));
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

  const handleRemoveBackground = useCallback(async () => {
    if (!originalFile || !originalUrl) {
      setError(t("errorSelectFirst"));
      return;
    }
    setError("");
    setProgress(null);
    setStatus("loading");
    try {
      setStatus("processing");
      const compressedFile = await imageCompression(originalFile, {
        maxSizeMB: REMOVE_BG_MAX_SIZE_MB,
        maxWidthOrHeight: REMOVE_BG_MAX_DIM,
        useWebWorker: true,
        fileType: originalFile.type,
      });

      const { removeBackground } = await import("@imgly/background-removal");
      const blob = await removeBackground(compressedFile, {
        publicPath: `${window.location.origin}/background-removal/`,
        progress: (key, current, total) => {
          if (total > 0) setProgress(Math.round((current / total) * 100));
        },
      });
      if (!blob) {
        setError(t("errorRemoveFailed"));
        setStatus("idle");
        setProgress(null);
        return;
      }
      setResultBlob(blob);
      setResultUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
      setCurrentStep(3);
    } catch (err) {
      console.error("Tool error:", err);
      setError(t("errorRemoveFailed"));
    } finally {
      setStatus("idle");
      setProgress(null);
    }
  }, [originalFile, originalUrl, t]);

  const handleDownload = useCallback(() => {
    if (!resultBlob) return;
    const link = document.createElement("a");
    link.href = resultUrl || URL.createObjectURL(resultBlob);
    const base = originalFile?.name?.replace(/\.[^.]+$/, "") || "image";
    link.download = `fileflip-no-bg-${base}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, [resultBlob, resultUrl, originalFile]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <SchemaMarkup
        title={t("metaTitle")}
        description={t("metaDescription")}
        slug="remove-background"
        locale={locale}
      />
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
          toolPath="remove-background"
        />

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_340px]">
          <section className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("metaTitle")}</h1>
              <p className="mt-1 text-sm text-slate-300">{t("metaDescription")}</p>
            </div>

            <StepIndicator step1={step1Status} step2={step2Status} step3={step3Status} t={t} />

            <div className="w-full">
              {!originalFile ? (
                <label
                  role="button"
                  tabIndex={0}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex h-[200px] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 px-4 transition-colors duration-200 ${
                    isDragOver
                      ? "border-sky-500 bg-sky-500/15"
                      : "border-dashed border-sky-500/70 bg-slate-900/50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPT}
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
                <div className="space-y-4">
                  <div className="flex gap-4 rounded-xl border-2 border-dashed border-sky-500/50 bg-slate-900/60 p-4">
                    <div className="flex h-40 shrink-0 overflow-hidden rounded-lg bg-slate-800">
                      <img src={originalUrl} alt="" className="h-full w-auto object-contain" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-100">{originalFile.name}</p>
                    </div>
                  </div>
                  {resultUrl && (
                    <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">
                        {t("previewAfter")}
                      </p>
                      <div className="flex h-40 overflow-hidden rounded-lg bg-[repeating-conic-gradient(#333_0%_25%,#222_0%_50%)] bg-[length:12px_12px]">
                        <img src={resultUrl} alt="" className="h-full w-auto object-contain" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {error && <p className="text-sm text-rose-400">{error}</p>}

            {originalFile && !resultBlob && (
              <button
                type="button"
                disabled={status === "loading" || status === "processing"}
                onClick={handleRemoveBackground}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-sky-500 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition hover:bg-sky-400 hover:shadow-sky-400/30 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 size={22} className="animate-spin shrink-0" />
                    <span>{t("loadingModel")}</span>
                    {progress != null && <span className="opacity-90"> ({progress}%)</span>}
                  </>
                ) : status === "processing" ? (
                  <>
                    <Loader2 size={22} className="animate-spin shrink-0" />
                    <span>{t("processingLabel")}</span>
                    {progress != null && <span className="opacity-90"> ({progress}%)</span>}
                  </>
                ) : (
                  <>
                    <Eraser size={22} strokeWidth={2} className="shrink-0" />
                    <span>{t("removeButton")}</span>
                  </>
                )}
              </button>
            )}

            {resultBlob && (
              <div className="space-y-2">
                <p className="text-sm text-slate-300">{t("step3Description")}</p>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-emerald-500 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 hover:shadow-emerald-400/30"
                >
                  <Download size={22} strokeWidth={2} className="shrink-0" />
                  {t("downloadButton")}
                </button>
              </div>
            )}
          </section>

          <aside className="space-y-8 lg:max-w-[340px]">
            <EditorialSection namespace="tools.removeBackground" />
          </aside>
        </div>

        <div className="mt-10">
          <RelatedTools locale={locale} currentSlug="remove-background" />
        </div>

        <div className="mt-10">
          <FaqSection namespace="tools.removeBackground" />
        </div>
      </main>
    </div>
  );
}
