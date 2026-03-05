"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Upload, Loader2, Check, Download, Gauge } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SchemaMarkup } from "@/components/SchemaMarkup";

function StepIndicator({ step1, step2, step3, t }) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold sm:h-8 sm:w-8 ${
            step1 === "done" ? "bg-emerald-500 text-slate-950" : step1 === "active" ? "bg-sky-500 text-slate-950" : "bg-slate-700 text-slate-400"
          }`}
        >
          {step1 === "done" ? <Check size={14} strokeWidth={2.5} /> : "1"}
        </span>
        <span className={`text-xs font-medium sm:text-sm ${step1 === "active" ? "text-sky-300" : step1 === "done" ? "text-emerald-300" : "text-slate-500"}`}>
          {t("stepIndicatorUpload")}
        </span>
      </div>
      <div className="h-px w-4 bg-slate-600 sm:w-8" aria-hidden />
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold sm:h-8 sm:w-8 ${
            step2 === "done" ? "bg-emerald-500 text-slate-950" : step2 === "active" ? "bg-sky-500 text-slate-950" : "bg-slate-700 text-slate-400"
          }`}
        >
          {step2 === "done" ? <Check size={14} strokeWidth={2.5} /> : "2"}
        </span>
        <span className={`text-xs font-medium sm:text-sm ${step2 === "active" ? "text-sky-300" : step2 === "done" ? "text-emerald-300" : "text-slate-500"}`}>
          {t("stepIndicatorSpeed")}
        </span>
      </div>
      <div className="h-px w-4 bg-slate-600 sm:w-8" aria-hidden />
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold sm:h-8 sm:w-8 ${
            step3 === "active" ? "bg-sky-500 text-slate-950" : "bg-slate-700 text-slate-400"
          }`}
        >
          {step3 === "active" ? <Check size={14} strokeWidth={2.5} /> : "3"}
        </span>
        <span className={`text-xs font-medium sm:text-sm ${step3 === "active" ? "text-sky-300" : "text-slate-500"}`}>
          {t("stepIndicatorDownload")}
        </span>
      </div>
    </div>
  );
}

const VIDEO_ACCEPT = "video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov";
const SPEED_OPTIONS = [
  { value: 0.5, labelKey: "speedSlow" },
  { value: 0.75, labelKey: "speedSlightlySlow" },
  { value: 1.5, labelKey: "speedFast" },
  { value: 2, labelKey: "speedTimelapse" },
];

function getExt(file) {
  return (file.name.match(/\.(mp4|webm|mov)$/i)?.[1] ?? "mp4").toLowerCase();
}

export default function VideoSpeedPage() {
  const locale = useLocale();
  const t = useTranslations("tools.videoSpeed");
  const tCommon = useTranslations("common");
  const tTool = useTranslations("tool");
  const [videoFile, setVideoFile] = useState(null);
  const [speed, setSpeed] = useState(1.5);
  const [resultBlob, setResultBlob] = useState(null);
  const [resultUrl, setResultUrl] = useState("");
  const [isLoadingFfmpeg, setIsLoadingFfmpeg] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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
        setVideoFile(null);
        setCurrentStep(1);
        setResultBlob(null);
        setResultUrl((u) => {
          if (u) URL.revokeObjectURL(u);
          return "";
        });
        return;
      }
      const ok = /\.(mp4|webm|mov)$/i.test(file.name) || ["video/mp4", "video/webm", "video/quicktime"].includes(file.type);
      if (!ok) {
        setError(t("errorVideoOnly"));
        setVideoFile(null);
        return;
      }
      setError("");
      setResultBlob(null);
      setResultUrl((u) => {
        if (u) URL.revokeObjectURL(u);
        return "";
      });
      setVideoFile(file);
      setCurrentStep(2);
    },
    [t]
  );

  const handleFileChange = useCallback((e) => processFile(e.target.files?.[0] ?? null), [processFile]);
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
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    processFile(e.dataTransfer?.files?.[0] ?? null);
  }, [processFile]);

  const handleChangeSpeed = useCallback(async () => {
    if (!videoFile) {
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
    setIsProcessing(true);
    setProgress(0);
    const progressHandler = (e) => {
      const p = e?.progress;
      if (typeof p === "number") setProgress(Math.round(Math.min(1, Math.max(0, p)) * 100));
    };
    ffmpeg.on("progress", progressHandler);
    const ext = getExt(videoFile);
    const inputName = `input.${ext}`;
    const outputName = `output.${ext}`;
    const setpts = 1 / speed;
    const atempo = speed;
    try {
      await ffmpeg.writeFile(inputName, await fetchFile(videoFile));
      await ffmpeg.exec(["-i", inputName, "-vf", `setpts=${setpts}*PTS`, "-af", `atempo=${atempo}`, "-c:v", "libx264", "-preset", "fast", "-crf", "23", "-c:a", "aac", outputName]);
      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data], { type: videoFile.type });
      setResultBlob(blob);
      setResultUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
      setCurrentStep(3);
    } catch (err) {
      setError(t("errorSpeedFailed"));
      console.error(err);
    } finally {
      ffmpeg.off("progress", progressHandler);
      setIsProcessing(false);
      setProgress(0);
    }
  }, [videoFile, speed, loadFfmpeg, t]);

  const handleDownload = useCallback(() => {
    if (!resultBlob || !resultUrl) return;
    const ext = getExt(videoFile);
    const base = videoFile?.name?.replace(/\.(mp4|webm|mov)$/i, "") || "speed";
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `${base}-${speed}x.${ext}`;
    a.click();
  }, [resultBlob, resultUrl, videoFile, speed]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <SchemaMarkup
        title={t("metaTitle")}
        description={t("metaDescription")}
        slug="video-speed"
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
        <Breadcrumb locale={locale} homeLabel={tCommon("breadcrumbHome")} toolsLabel={tCommon("nav.tools")} toolLabel={t("label")} toolPath="video-speed" />

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_340px]">
          <section className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("metaTitle")}</h1>
              <p className="mt-1 text-sm text-slate-300">{t("metaDescription")}</p>
            </div>

            <StepIndicator step1={step1Status} step2={step2Status} step3={step3Status} t={t} />

            <div className="w-full">
              {!videoFile ? (
                <label
                  role="button"
                  tabIndex={0}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex h-[200px] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 px-4 transition-colors duration-200 ${
                    isDragOver ? "border-sky-500 bg-sky-500/15" : "border-dashed border-sky-500/70 bg-slate-900/50"
                  }`}
                >
                  <input ref={fileInputRef} type="file" accept={VIDEO_ACCEPT} className="sr-only" onChange={handleFileChange} />
                  <Upload size={40} strokeWidth={1.5} className={isDragOver ? "text-sky-400" : "text-sky-500/80"} />
                  <p className={`text-center text-sm font-medium ${isDragOver ? "text-sky-200" : "text-slate-300"}`}>
                    {isDragOver ? t("releaseToUpload") : tTool("dropZone")}
                  </p>
                </label>
              ) : (
                <div className="flex h-[200px] w-full flex-col justify-center gap-4 rounded-xl border-2 border-dashed border-sky-500/50 bg-slate-900/60 p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-violet-500/20">
                      <Gauge size={28} className="text-violet-400" />
                    </div>
                    <p className="truncate text-sm font-medium text-slate-100">{videoFile.name}</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-medium text-slate-400">{t("speedSelectLabel")}</p>
                    <div className="flex flex-wrap gap-2">
                      {SPEED_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setSpeed(opt.value)}
                          className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                            speed === opt.value
                              ? "border-sky-500 bg-sky-500/20 text-sky-300"
                              : "border-slate-600 bg-slate-800/60 text-slate-300 hover:border-slate-500"
                          }`}
                        >
                          {t(opt.labelKey)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {isLoadingFfmpeg && (
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-sky-500/30 bg-slate-900/60 px-4 py-3">
                  <Loader2 size={22} className="animate-spin shrink-0 text-sky-400" />
                  <p className="text-sm text-slate-300">{t("loadingFfmpeg")}</p>
                </div>
              )}

              {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}

              {videoFile && !resultBlob && !isLoadingFfmpeg && (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleChangeSpeed}
                  className="mt-4 flex w-full items-center justify-center gap-3 rounded-xl bg-sky-500 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={22} className="animate-spin shrink-0" />
                      <span>{t("processingLabel")} {progress > 0 && `${progress}%`}</span>
                    </>
                  ) : (
                    <>
                      <Gauge size={22} strokeWidth={2} className="shrink-0" />
                      <span>{t("changeSpeedButton")}</span>
                    </>
                  )}
                </button>
              )}

              {isProcessing && (
                <div className="mt-4 space-y-2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
                    <div className="h-full rounded-full bg-sky-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                  {progress > 0 && <p className="text-center text-xs text-slate-400">{t("progressLabel", { percent: progress })}</p>}
                </div>
              )}

              {resultBlob && resultUrl && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm font-medium text-slate-300">{t("step3Description")}</p>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-base font-semibold text-white transition hover:bg-emerald-500"
                  >
                    <Download size={20} strokeWidth={2} />
                    {t("downloadButton")}
                  </button>
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-8 lg:max-w-[340px]">
            <EditorialSection namespace="tools.videoSpeed" />
          </aside>
        </div>

        <div className="mt-10">
          <RelatedTools locale={locale} currentSlug="video-speed" />
        </div>

        <div className="mt-10">
          <FaqSection namespace="tools.videoSpeed" />
        </div>
      </main>
    </div>
  );
}
