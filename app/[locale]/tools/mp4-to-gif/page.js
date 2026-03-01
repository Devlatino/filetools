"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Upload, Loader2, Check, Download, Film } from "lucide-react";
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

const INPUT_NAME = "input.mp4";
const OUTPUT_NAME = "output.gif";

export default function Mp4ToGifPage() {
  const locale = useLocale();
  const t = useTranslations("tools.mp4ToGif");
  const tCommon = useTranslations("common");
  const tTool = useTranslations("tool");
  const [mp4File, setMp4File] = useState(null);
  const [resultBlob, setResultBlob] = useState(null);
  const [resultUrl, setResultUrl] = useState("");
  const [isLoadingFfmpeg, setIsLoadingFfmpeg] = useState(false);
  const [ffmpegReady, setFfmpegReady] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const ffmpegRef = useRef(null);

  const step1Status = currentStep >= 2 ? "done" : currentStep === 1 ? "active" : "pending";
  const step2Status = currentStep >= 3 ? "done" : currentStep === 2 ? "active" : "pending";
  const step3Status = currentStep === 3 ? "active" : "pending";

  const loadFfmpeg = useCallback(async () => {
    if (ffmpegRef.current) return ffmpegRef.current;
    setIsLoadingFfmpeg(true);
    setError("");
    try {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const { fetchFile } = await import("@ffmpeg/util");
      const ffmpeg = new FFmpeg();
      await ffmpeg.load();
      ffmpegRef.current = { ffmpeg, fetchFile };
      setFfmpegReady(true);
      return ffmpegRef.current;
    } catch (err) {
      setError(t("errorLoadFfmpeg"));
      console.error(err);
      return null;
    } finally {
      setIsLoadingFfmpeg(false);
    }
  }, [t]);

  const processFile = useCallback(
    (file) => {
      if (!file) {
        setMp4File(null);
        setCurrentStep(1);
        setResultBlob(null);
        setResultUrl((u) => {
          if (u) URL.revokeObjectURL(u);
          return "";
        });
        return;
      }
      const isMp4 =
        file.type === "video/mp4" ||
        file.name.toLowerCase().endsWith(".mp4") ||
        file.name.toLowerCase().endsWith(".m4v");
      if (!isMp4) {
        setError(t("errorMp4Only"));
        setMp4File(null);
        return;
      }
      setError("");
      setResultBlob(null);
      setResultUrl((u) => {
        if (u) URL.revokeObjectURL(u);
        return "";
      });
      setMp4File(file);
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

  const handleConvert = useCallback(async () => {
    if (!mp4File) {
      setError(t("errorSelectFirst"));
      return;
    }
    const loaded = await loadFfmpeg();
    if (!loaded) return;
    const { ffmpeg, fetchFile } = loaded;
    setError("");
    setResultBlob(null);
    setResultUrl((u) => {
      if (u) URL.revokeObjectURL(u);
      return "";
    });
    setIsConverting(true);
    setProgress(0);
    const progressHandler = (e) => {
      const p = e?.progress;
      if (typeof p === "number") setProgress(Math.round(Math.min(1, Math.max(0, p)) * 100));
    };
    ffmpeg.on("progress", progressHandler);
    try {
      await ffmpeg.writeFile(INPUT_NAME, await fetchFile(mp4File));
      await ffmpeg.exec([
        "-i",
        INPUT_NAME,
        "-vf",
        "fps=10,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse",
        "-loop",
        "0",
        OUTPUT_NAME,
      ]);
      const data = await ffmpeg.readFile(OUTPUT_NAME);
      const blob = new Blob([data], { type: "image/gif" });
      setResultBlob(blob);
      setResultUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
      setCurrentStep(3);
    } catch (err) {
      setError(t("errorConversionFailed"));
      console.error(err);
    } finally {
      ffmpeg.off("progress", progressHandler);
      setIsConverting(false);
      setProgress(0);
    }
  }, [mp4File, loadFfmpeg, t]);

  const handleDownload = useCallback(() => {
    if (!resultBlob || !resultUrl) return;
    const base = mp4File?.name?.replace(/\.(mp4|m4v)$/i, "") || "animation";
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `${base}.gif`;
    a.click();
  }, [resultBlob, resultUrl, mp4File]);

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
          toolPath="mp4-to-gif"
        />

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_340px]">
          <section className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("metaTitle")}</h1>
              <p className="mt-1 text-sm text-slate-300">{t("metaDescription")}</p>
            </div>

            <StepIndicator step1={step1Status} step2={step2Status} step3={step3Status} t={t} />

            <div className="w-full">
              {!mp4File ? (
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
                    accept="video/mp4,.mp4,.m4v"
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
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-violet-500/20">
                    <Film size={28} className="text-violet-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-100">{mp4File.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{formatBytes(mp4File.size)}</p>
                  </div>
                </div>
              )}
            </div>

            {mp4File && !resultBlob && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
                <p className="text-sm text-amber-200">{t("warningGifLarger")}</p>
              </div>
            )}

            {isLoadingFfmpeg && (
              <div className="flex items-center gap-3 rounded-xl border border-sky-500/30 bg-slate-900/60 px-4 py-3">
                <Loader2 size={22} className="animate-spin shrink-0 text-sky-400" />
                <p className="text-sm text-slate-300">{t("loadingFfmpeg")}</p>
              </div>
            )}

            {error && <p className="text-sm text-rose-400">{error}</p>}

            {mp4File && !resultBlob && !isLoadingFfmpeg && (
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
                    <Film size={22} strokeWidth={2} className="shrink-0" />
                    <span>{t("convertButton")}</span>
                  </>
                )}
              </button>
            )}

            {isConverting && (
              <div className="space-y-2">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
                  <div
                    className="h-full rounded-full bg-sky-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {progress > 0 && (
                  <p className="text-center text-xs text-slate-400">{t("progressLabel", { percent: progress })}</p>
                )}
              </div>
            )}

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
                </div>
              </div>
            )}
          </section>

          <aside className="space-y-8 lg:max-w-[340px]">
            <EditorialSection namespace="tools.mp4ToGif" />
          </aside>
        </div>

        <div className="mt-10">
          <RelatedTools locale={locale} currentSlug="mp4-to-gif" />
        </div>

        <div className="mt-10">
          <FaqSection namespace="tools.mp4ToGif" />
        </div>
      </main>
    </div>
  );
}
