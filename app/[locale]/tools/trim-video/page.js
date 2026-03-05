"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Upload, Loader2, Check, Download, Scissors } from "lucide-react";
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
          {t("stepIndicatorTrim")}
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

const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const EXT_MAP = { "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov" };

export default function TrimVideoPage() {
  const locale = useLocale();
  const t = useTranslations("tools.trimVideo");
  const tCommon = useTranslations("common");
  const tTool = useTranslations("tool");
  const [videoFile, setVideoFile] = useState(null);
  const [duration, setDuration] = useState(null);
  const [startSec, setStartSec] = useState("");
  const [endSec, setEndSec] = useState("");
  const [resultBlob, setResultBlob] = useState(null);
  const [resultUrl, setResultUrl] = useState("");
  const [isLoadingFfmpeg, setIsLoadingFfmpeg] = useState(false);
  const [ffmpegReady, setFfmpegReady] = useState(false);
  const [isTrimming, setIsTrimming] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
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

  const onVideoLoadedMetadata = useCallback(() => {
    const v = videoRef.current;
    if (v && isFinite(v.duration)) {
      const d = Math.floor(v.duration);
      setDuration(d);
      if (endSec === "" || Number(endSec) > d) setEndSec(String(d));
      if (startSec === "" || Number(startSec) >= d) setStartSec("0");
    }
  }, [endSec, startSec]);

  const processFile = useCallback(
    (file) => {
      if (!file) {
        setVideoFile(null);
        setDuration(null);
        setStartSec("");
        setEndSec("");
        setCurrentStep(1);
        setResultBlob(null);
        setResultUrl((u) => {
          if (u) URL.revokeObjectURL(u);
          return "";
        });
        return;
      }
      const ok = VIDEO_TYPES.includes(file.type) || /\.(mp4|webm|mov)$/i.test(file.name);
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
      setDuration(null);
      setStartSec("");
      setEndSec("");
      setCurrentStep(2);
    },
    [t]
  );

  useEffect(() => {
    if (!videoFile || !videoRef.current) return;
    const url = URL.createObjectURL(videoFile);
    videoRef.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

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

  const handleTrim = useCallback(async () => {
    if (!videoFile) {
      setError(t("errorSelectFirst"));
      return;
    }
    const start = Number(startSec);
    const end = Number(endSec);
    if (!Number.isFinite(start) || start < 0 || !Number.isFinite(end) || end <= start) {
      setError(t("errorInvalidRange"));
      return;
    }
    if (duration != null && end > duration) {
      setError(t("errorInvalidRange"));
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
    setIsTrimming(true);
    setProgress(0);
    const progressHandler = (e) => {
      const p = e?.progress;
      if (typeof p === "number") setProgress(Math.round(Math.min(1, Math.max(0, p)) * 100));
    };
    ffmpeg.on("progress", progressHandler);
    const ext = EXT_MAP[videoFile.type] || (videoFile.name.match(/\.(mp4|webm|mov)$/i)?.[1] ?? "mp4");
    const inputName = `input.${ext}`;
    const outputName = `output.${ext}`;
    try {
      await ffmpeg.writeFile(inputName, await fetchFile(videoFile));
      await ffmpeg.exec(["-i", inputName, "-ss", String(start), "-to", String(end), "-c", "copy", outputName]);
      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data], { type: videoFile.type });
      setResultBlob(blob);
      setResultUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
      setCurrentStep(3);
    } catch (err) {
      setError(t("errorTrimFailed"));
      console.error(err);
    } finally {
      ffmpeg.off("progress", progressHandler);
      setIsTrimming(false);
      setProgress(0);
    }
  }, [videoFile, startSec, endSec, duration, loadFfmpeg, t]);

  const handleDownload = useCallback(() => {
    if (!resultBlob || !resultUrl) return;
    const ext = videoFile?.name?.match(/\.(mp4|webm|mov)$/i)?.[1] ?? "mp4";
    const base = videoFile?.name?.replace(/\.(mp4|webm|mov)$/i, "") || "trimmed";
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `${base}-trimmed.${ext}`;
    a.click();
  }, [resultBlob, resultUrl, videoFile]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <SchemaMarkup
        title={t("metaTitle")}
        description={t("metaDescription")}
        slug="trim-video"
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
        <Breadcrumb locale={locale} homeLabel={tCommon("breadcrumbHome")} toolsLabel={tCommon("nav.tools")} toolLabel={t("label")} toolPath="trim-video" />

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
                  <input ref={fileInputRef} type="file" accept={VIDEO_TYPES.join(",") + ",.mp4,.webm,.mov"} className="sr-only" onChange={handleFileChange} />
                  <Upload size={40} strokeWidth={1.5} className={isDragOver ? "text-sky-400" : "text-sky-500/80"} />
                  <p className={`text-center text-sm font-medium ${isDragOver ? "text-sky-200" : "text-slate-300"}`}>
                    {isDragOver ? t("releaseToUpload") : tTool("dropZone")}
                  </p>
                </label>
              ) : (
                <div className="flex h-[200px] w-full items-center gap-4 rounded-xl border-2 border-dashed border-sky-500/50 bg-slate-900/60 p-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-violet-500/20">
                    <Scissors size={28} className="text-violet-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-100">{videoFile.name}</p>
                    {duration != null && (
                      <p className="mt-1 text-xs text-slate-400">{t("durationLabel", { seconds: duration })}</p>
                    )}
                  </div>
                </div>
              )}

              <video ref={videoRef} className="hidden" onLoadedMetadata={onVideoLoadedMetadata} muted playsInline />

              {videoFile && duration != null && !resultBlob && (
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-400">{t("startLabel")}</label>
                    <input
                      type="number"
                      min={0}
                      max={duration}
                      step={1}
                      value={startSec}
                      onChange={(e) => setStartSec(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-400">{t("endLabel")}</label>
                    <input
                      type="number"
                      min={0}
                      max={duration}
                      step={1}
                      value={endSec}
                      onChange={(e) => setEndSec(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-slate-100"
                    />
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

              {videoFile && !resultBlob && !isLoadingFfmpeg && duration != null && (
                <button
                  type="button"
                  disabled={isTrimming}
                  onClick={handleTrim}
                  className="mt-4 flex w-full items-center justify-center gap-3 rounded-xl bg-sky-500 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isTrimming ? (
                    <>
                      <Loader2 size={22} className="animate-spin shrink-0" />
                      <span>{t("trimmingLabel")} {progress > 0 && `${progress}%`}</span>
                    </>
                  ) : (
                    <>
                      <Scissors size={22} strokeWidth={2} className="shrink-0" />
                      <span>{t("trimButton")}</span>
                    </>
                  )}
                </button>
              )}

              {isTrimming && (
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
            <EditorialSection namespace="tools.trimVideo" />
          </aside>
        </div>

        <div className="mt-10">
          <RelatedTools locale={locale} currentSlug="trim-video" />
        </div>

        <div className="mt-10">
          <FaqSection namespace="tools.trimVideo" />
        </div>
      </main>
    </div>
  );
}
