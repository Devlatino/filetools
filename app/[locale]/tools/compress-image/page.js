"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import imageCompression from "browser-image-compression";
import { Image as ImageIcon, Loader2, Check, Download } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ToolSteps } from "@/components/ToolSteps";

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
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

  const qualityLabel = useMemo(() => `${quality} / 100`, [quality]);

  const ACCEPT_TYPES = ["image/jpeg", "image/png", "image/webp"];

  const processFile = useCallback((file) => {
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
  }, [t]);

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

  const reductionText = useMemo(() => {
    if (!originalFile || !compressedFile) return "";
    const diff = originalFile.size - compressedFile.size;
    const ratio = (1 - compressedFile.size / originalFile.size) * 100;
    if (diff <= 0) return t("reductionSimilar");
    return t("reductionSaved", { bytes: formatBytes(diff), percent: ratio.toFixed(1) });
  }, [compressedFile, originalFile, t]);

  const successMessage = useMemo(() => {
    if (!originalFile || !compressedFile) return null;
    const ratio = (1 - compressedFile.size / originalFile.size) * 100;
    const percent = ratio <= 0 ? 0 : Math.round(ratio);
    return tCommon("successSaved", {
      original: formatBytes(originalFile.size),
      result: formatBytes(compressedFile.size),
      percent,
    });
  }, [originalFile, compressedFile, tCommon]);

  const downloadSubline = useMemo(() => {
    if (!originalFile || !compressedFile) return null;
    const ratio = (1 - compressedFile.size / originalFile.size) * 100;
    const percent = ratio <= 0 ? 0 : Math.round(ratio);
    return tCommon("downloadSubline", {
      percent,
      result: formatBytes(compressedFile.size),
    });
  }, [originalFile, compressedFile, tCommon]);

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
        <Breadcrumb
          locale={locale}
          homeLabel={tCommon("breadcrumbHome")}
          toolsLabel={tCommon("nav.tools")}
          toolLabel={t("label")}
          toolPath="compress-image"
        />
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("metaTitle")}
          </h1>
          <p className="max-w-xl text-sm text-slate-300">
            {t("metaDescription")}
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-6">
          <ToolSteps currentStep={currentStep}>
            <ToolSteps.Step title={t("step1Title")}>
              <p className="text-xs text-slate-400">{t("step1Supported")}</p>
              <label className="mt-2 inline-flex cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-sm hover:bg-sky-400">
                {t("selectButton")}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </ToolSteps.Step>
            <ToolSteps.Step title={t("step2Title")}>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-medium">{t("qualityLabel")}</span>
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-200">
                    {qualityLabel}
                  </span>
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
                <p className="text-[11px] text-slate-400">
                  {t("qualityHint")}
                </p>
                <div className="mt-2 space-y-2">
                  <button
                    type="button"
                    disabled={!originalFile || isCompressing}
                    onClick={handleCompress}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-sm hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isCompressing ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        {tCommon("processingLabel")}
                      </>
                    ) : (
                      t("compressButton")
                    )}
                  </button>
                  {isCompressing && (
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
                      <div className="h-full w-full animate-[progress-bar_1.2s_ease-in-out_infinite] rounded-full bg-sky-500" style={{ transformOrigin: "left" }} />
                    </div>
                  )}
                  {successMessage && !isCompressing && (
                    <p className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                      <Check size={14} className="shrink-0" />
                      {successMessage}
                    </p>
                  )}
                </div>
              </div>
            </ToolSteps.Step>
            <ToolSteps.Step title={t("step3Title")}>
              <p className="text-xs text-slate-400">{t("step3Description")}</p>
              {compressedFile ? (
                <div className="mt-3 animate-download-enter">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 hover:shadow-emerald-400/30"
                  >
                    <Download size={20} strokeWidth={2} />
                    {t("downloadButton")}
                  </button>
                  {downloadSubline && (
                    <p className="mt-1.5 text-[11px] text-emerald-200/90">{downloadSubline}</p>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  disabled
                  className="mt-2 inline-flex items-center justify-center rounded-full border border-slate-600 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-500 cursor-not-allowed"
                >
                  {t("downloadButton")}
                </button>
              )}
            </ToolSteps.Step>
          </ToolSteps>
          {error && <p className="mt-4 text-xs text-rose-400">{error}</p>}
        </section>

        {!originalFile ? (
          <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-6">
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
              className={`flex min-h-[280px] cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed px-6 py-12 transition-colors duration-200 ${
                isDragOver
                  ? "border-sky-400 bg-sky-500/10"
                  : "border-slate-500 bg-slate-900/50 animate-dropzone-dash"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full transition-colors ${
                  isDragOver ? "bg-sky-500/20 text-sky-300" : "bg-slate-700/80 text-slate-400"
                }`}
              >
                <ImageIcon size={32} strokeWidth={1.5} />
              </div>
              <p
                className={`text-center text-sm font-medium transition-colors ${
                  isDragOver ? "text-sky-200" : "text-slate-300"
                }`}
              >
                {isDragOver ? t("dropzoneDrop") : t("dropzonePrompt")}
              </p>
            </label>
          </section>
        ) : (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-50">
              {t("beforeAfterTitle")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3">
                <p className="text-xs font-medium text-slate-100">{t("originalLabel")}</p>
                <p className="mt-1 text-[11px] text-slate-400">
                  {originalFile.name} · {formatBytes(originalFile.size)}
                </p>
                <div className="mt-3 flex items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950/60 px-2 py-4">
                  <img
                    src={originalUrl}
                    alt={t("originalLabel")}
                    width={400}
                    height={256}
                    loading="lazy"
                    className="max-h-64 w-auto rounded-md object-contain"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3">
                <p className="text-xs font-medium text-slate-100">{t("compressedLabel")}</p>
                <p className="mt-1 text-[11px] text-slate-400">
                  {compressedFile
                    ? `${compressedFile.name || originalFile?.name || "Image"} · ${formatBytes(compressedFile.size)}`
                    : t("resultPlaceholder")}
                </p>
                <div className="mt-3 flex items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950/60 px-2 py-4">
                  {compressedUrl ? (
                    <img
                      src={compressedUrl}
                      alt={t("compressedLabel")}
                      width={400}
                      height={256}
                      loading="lazy"
                      className="max-h-64 w-auto rounded-md object-contain"
                    />
                  ) : (
                    <span className="text-[11px] text-slate-500">
                      {t("noResultYet")}
                    </span>
                  )}
                </div>
                {reductionText && (
                  <p className="mt-2 text-[11px] text-emerald-300">
                    {reductionText}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}
        <RelatedTools locale={locale} currentSlug="compress-image" />
        <EditorialSection namespace="tools.compressImage" />
        <FaqSection namespace="tools.compressImage" />
      </main>
    </div>
  );
}
