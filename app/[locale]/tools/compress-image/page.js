"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import imageCompression from "browser-image-compression";
import { Upload, Loader2, Check, Download, Zap } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
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
          {t("stepIndicatorSettings")}
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

function BeforeAfterReveal({ originalUrl, compressedUrl, originalLabel, compressedLabel }) {
  const containerRef = useRef(null);
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = useCallback(
    (clientX) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setPosition(pct);
    },
    []
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (isDragging) handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );
  const handleMouseUp = useCallback(() => setIsDragging(false), []);
  const handleTouchMove = useCallback(
    (e) => {
      if (e.touches.length) handleMove(e.touches[0].clientX);
    },
    [handleMove]
  );

  useEffect(() => {
    if (!isDragging) return;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-slate-300">
        {originalLabel} ↔ {compressedLabel}
      </p>
      <div
        ref={containerRef}
        className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-900"
        onTouchMove={handleTouchMove}
        onTouchStart={(e) => e.touches.length === 1 && handleMove(e.touches[0].clientX)}
      >
        {/* Before: clipped to left side */}
        <div
          className="absolute inset-0 flex items-center justify-center bg-slate-950"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <img
            src={originalUrl}
            alt={originalLabel}
            className="max-h-full w-auto max-w-full object-contain"
            draggable={false}
          />
        </div>
        {/* After: clipped to right side */}
        <div
          className="absolute inset-0 flex items-center justify-center bg-slate-950"
          style={{ clipPath: `inset(0 0 0 ${position}%)` }}
        >
          <img
            src={compressedUrl}
            alt={compressedLabel}
            className="max-h-full w-auto max-w-full object-contain"
            draggable={false}
          />
        </div>
        {/* Divider */}
        <div
          className="absolute top-0 bottom-0 w-1 cursor-ew-resize select-none bg-sky-500 shadow-lg"
          style={{ left: `${position}%`, transform: "translateX(-50%)" }}
          onMouseDown={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onTouchStart={(e) => {
            if (e.touches.length === 1) handleMove(e.touches[0].clientX);
          }}
          role="slider"
          aria-label={`${originalLabel} / ${compressedLabel}`}
          aria-valuenow={Math.round(position)}
          aria-valuemin={0}
          aria-valuemax={100}
          tabIndex={0}
          onKeyDown={(e) => {
            const step = e.key === "ArrowLeft" ? -5 : e.key === "ArrowRight" ? 5 : 0;
            if (step) {
              e.preventDefault();
              setPosition((p) => Math.max(0, Math.min(100, p + step)));
            }
          }}
        />
      </div>
    </div>
  );
}

export default function CompressImagePage() {
  const locale = useLocale();
  const t = useTranslations("tools.compressImage");
  const tCommon = useTranslations("common");
  const [originalFile, setOriginalFile] = useState(null);
  const [compressedFile, setCompressedFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [compressedUrl, setCompressedUrl] = useState("");
  const [quality, setQuality] = useState(70);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const step1Status = currentStep >= 2 ? "done" : currentStep === 1 ? "active" : "pending";
  const step2Status = currentStep >= 3 ? "done" : currentStep === 2 ? "active" : "pending";
  const step3Status = currentStep === 3 ? "active" : "pending";

  const ACCEPT_TYPES = ["image/jpeg", "image/png", "image/webp"];

  const processFile = useCallback(
    (file) => {
      if (!file) {
        setOriginalFile(null);
        setOriginalUrl((u) => {
          if (u) URL.revokeObjectURL(u);
          return "";
        });
        setCurrentStep(1);
        return;
      }
      if (!ACCEPT_TYPES.includes(file.type)) {
        setError(t("errorUnsupportedFormat"));
        setOriginalFile(null);
        setOriginalUrl("");
        return;
      }
      setError("");
      setCompressedFile(null);
      setCompressedUrl((u) => {
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
    (event) => {
      processFile(event.target.files?.[0] ?? null);
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
      const file = e.dataTransfer?.files?.[0];
      processFile(file ?? null);
    },
    [processFile]
  );

  const handleCompress = useCallback(async () => {
    if (!originalFile) {
      setError(t("errorSelectFirst"));
      return;
    }
    setError("");
    setIsCompressing(true);
    try {
      const compressed = await imageCompression(originalFile, {
        maxSizeMB: originalFile.size / (1024 * 1024),
        maxWidthOrHeight: 5000,
        useWebWorker: true,
        initialQuality: Math.min(Math.max(quality / 100, 0.01), 1),
      });
      setCompressedFile(compressed);
      if (compressedUrl) URL.revokeObjectURL(compressedUrl);
      setCompressedUrl(URL.createObjectURL(compressed));
      setCurrentStep(3);
    } catch (err) {
      setError(t("errorCompressionFailed"));
      console.error(err);
    } finally {
      setIsCompressing(false);
    }
  }, [compressedUrl, originalFile, quality, t]);

  const handleDownload = useCallback(() => {
    if (!compressedFile) return;
    const link = document.createElement("a");
    link.href = compressedUrl || URL.createObjectURL(compressedFile);
    link.download = `fileflip-compressed-${originalFile?.name || "image"}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, [compressedFile, compressedUrl, originalFile]);

  const successSubline = useMemo(() => {
    if (!originalFile || !compressedFile) return null;
    const ratio = (1 - compressedFile.size / originalFile.size) * 100;
    const percent = ratio <= 0 ? 0 : Math.round(ratio);
    return tCommon("successSaved", {
      original: formatBytes(originalFile.size),
      result: formatBytes(compressedFile.size),
      percent,
    });
  }, [originalFile, compressedFile, tCommon]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href={`/${locale}/`} prefetch className="flex items-center gap-2">
            <img
              src="/fileflip-logo.svg"
              alt={tCommon("siteName")}
              className="h-9 w-auto"
              width={140}
              height={36}
            />
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
          toolPath="compress-image"
        />

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_340px]">
          {/* Left column: tool */}
          <section className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("metaTitle")}</h1>
              <p className="mt-1 text-sm text-slate-300">{t("metaDescription")}</p>
            </div>

            {/* Step indicator */}
            <StepIndicator step1={step1Status} step2={step2Status} step3={step3Status} t={t} />

            {/* Upload zone: full width, 200px height, dashed blue, rounded */}
            <div className="w-full">
              {!originalFile ? (
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
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Upload
                    size={40}
                    strokeWidth={1.5}
                    className={isDragOver ? "text-sky-400" : "text-sky-500/80"}
                  />
                  <p
                    className={`text-center text-sm font-medium ${
                      isDragOver ? "text-sky-200" : "text-slate-300"
                    }`}
                  >
                    {isDragOver ? t("releaseToUpload") : t("dropzonePrompt")}
                  </p>
                </label>
              ) : (
                <div className="flex h-[200px] w-full items-center gap-4 rounded-xl border-2 border-dashed border-sky-500/50 bg-slate-900/60 p-4">
                  <div className="flex h-full shrink-0 overflow-hidden rounded-lg bg-slate-800">
                    <img
                      src={originalUrl}
                      alt=""
                      className="h-full w-auto object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-100">{originalFile.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{formatBytes(originalFile.size)}</p>
                  </div>
                </div>
              )}
            </div>

            {error && <p className="text-sm text-rose-400">{error}</p>}

            {/* Controls: quality slider */}
            {originalFile && (
              <div className="space-y-3 rounded-xl border border-white/10 bg-slate-900/60 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">{t("smallerFile")}</span>
                  <span className="rounded-full bg-sky-500/20 px-3 py-1 text-sm font-semibold text-sky-300">
                    {quality}
                  </span>
                  <span className="text-slate-400">{t("higherQuality")}</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-sky-500"
                />
              </div>
            )}

            {/* Primary action: Compress */}
            {originalFile && !compressedFile && (
              <button
                type="button"
                disabled={isCompressing}
                onClick={handleCompress}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-sky-500 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition hover:bg-sky-400 hover:shadow-sky-400/30 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isCompressing ? (
                  <>
                    <Loader2 size={22} className="animate-spin shrink-0" />
                    <span>{t("compressingLabel")}</span>
                  </>
                ) : (
                  <>
                    <Zap size={22} strokeWidth={2} className="shrink-0" />
                    <span>{t("compressButton")}</span>
                  </>
                )}
              </button>
            )}
            {isCompressing && (
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
                <div
                  className="h-full w-full animate-[progress-bar_1.2s_ease-in-out_infinite] rounded-full bg-sky-500"
                  style={{ transformOrigin: "left" }}
                />
              </div>
            )}

            {/* After compress: download button + subline */}
            {compressedFile && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-emerald-500 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 hover:shadow-emerald-400/30"
                >
                  <Download size={22} strokeWidth={2} className="shrink-0" />
                  {t("downloadButton")}
                </button>
                {successSubline && (
                  <p className="text-center text-sm text-emerald-300">{successSubline}</p>
                )}
              </div>
            )}

            {/* Before/after reveal — only after compression */}
            {compressedFile && originalUrl && compressedUrl && (
              <BeforeAfterReveal
                originalUrl={originalUrl}
                compressedUrl={compressedUrl}
                originalLabel={t("originalLabel")}
                compressedLabel={t("compressedLabel")}
              />
            )}
          </section>

          {/* Right column: info, FAQ, related */}
          <aside className="space-y-8 lg:max-w-[340px]">
            <EditorialSection namespace="tools.compressImage" />
            <FaqSection namespace="tools.compressImage" />
            <RelatedTools locale={locale} currentSlug="compress-image" />
          </aside>
        </div>
      </main>
    </div>
  );
}
