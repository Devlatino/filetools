"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Upload, Loader2, Check, Download, ListVideo, ChevronUp, ChevronDown, X } from "lucide-react";
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
          {t("stepIndicatorMerge")}
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

const VIDEO_ACCEPT = "video/mp4,.mp4";

export default function MergeVideosPage() {
  const locale = useLocale();
  const t = useTranslations("tools.mergeVideos");
  const tCommon = useTranslations("common");
  const tTool = useTranslations("tool");
  const [files, setFiles] = useState([]);
  const [durations, setDurations] = useState({});
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

  const totalDuration = files.reduce((acc, f) => acc + (durations[f.name] ?? 0), 0);

  useEffect(() => {
    if (files.length === 0) {
      setDurations({});
      return;
    }
    const urls = files.map((f) => URL.createObjectURL(f));
    const done = {};
    files.forEach((f, idx) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = urls[idx];
      video.onloadedmetadata = () => {
        const d = Number.isFinite(video.duration) ? Math.floor(video.duration) : 0;
        done[f.name] = d;
        setDurations((prev) => ({ ...prev, [f.name]: d }));
      };
    });
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

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

  const addFiles = useCallback(
    (newFiles) => {
      const mp4 = Array.from(newFiles).filter((f) => f.type === "video/mp4" || /\.mp4$/i.test(f.name));
      if (mp4.length === 0 && newFiles.length > 0) {
        setError(t("errorMp4Only"));
        return;
      }
      setError("");
      setResultBlob(null);
      setResultUrl((u) => {
        if (u) URL.revokeObjectURL(u);
        return "";
      });
      setFiles((prev) => [...prev, ...mp4]);
      setCurrentStep(2);
    },
    [t]
  );

  const removeFile = useCallback((index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setResultBlob(null);
    setResultUrl((u) => {
      if (u) URL.revokeObjectURL(u);
      return "";
    });
  }, []);

  const moveUp = useCallback((index) => {
    if (index <= 0) return;
    setFiles((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }, []);

  const moveDown = useCallback((index) => {
    setFiles((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }, []);

  const handleFileChange = useCallback(
    (e) => {
      const list = e.target.files;
      if (list?.length) addFiles(list);
      e.target.value = "";
    },
    [addFiles]
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
      if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const handleMerge = useCallback(async () => {
    if (files.length < 2) {
      setError(t("errorMinTwo"));
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
    const n = files.length;
    try {
      const inputNames = files.map((_, i) => `input${i}.mp4`);
      for (let i = 0; i < n; i++) {
        await ffmpeg.writeFile(inputNames[i], await fetchFile(files[i]));
      }
      const inputs = inputNames.flatMap((name) => ["-i", name]);
      const concatInputs = Array.from({ length: n }, (_, i) => `[${i}:v][${i}:a]`).join("");
      const filter = `${concatInputs}concat=n=${n}:v=1:a=1[v][a]`;
      await ffmpeg.exec([...inputs, "-filter_complex", filter, "-map", "[v]", "-map", "[a]", "output.mp4"]);
      const data = await ffmpeg.readFile("output.mp4");
      const blob = new Blob([data], { type: "video/mp4" });
      setResultBlob(blob);
      setResultUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
      setCurrentStep(3);
    } catch (err) {
      setError(t("errorMergeFailed"));
      console.error(err);
    } finally {
      ffmpeg.off("progress", progressHandler);
      setIsProcessing(false);
      setProgress(0);
    }
  }, [files, loadFfmpeg, t]);

  const handleDownload = useCallback(() => {
    if (!resultBlob || !resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = "merged-videos.mp4";
    a.click();
  }, [resultBlob, resultUrl]);

  const canMerge = files.length >= 2 && !resultBlob && !isLoadingFfmpeg;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <SchemaMarkup
        title={t("metaTitle")}
        description={t("metaDescription")}
        slug="merge-videos"
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
        <Breadcrumb locale={locale} homeLabel={tCommon("breadcrumbHome")} toolsLabel={tCommon("nav.tools")} toolLabel={t("label")} toolPath="merge-videos" />

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_340px]">
          <section className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("metaTitle")}</h1>
              <p className="mt-1 text-sm text-slate-300">{t("metaDescription")}</p>
            </div>

            <StepIndicator step1={step1Status} step2={step2Status} step3={step3Status} t={t} />

            <div className="w-full space-y-4">
              <label
                role="button"
                tabIndex={0}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex min-h-[120px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 px-4 py-6 transition-colors ${
                  isDragOver ? "border-sky-500 bg-sky-500/15" : "border-dashed border-sky-500/70 bg-slate-900/50"
                }`}
              >
                <input ref={fileInputRef} type="file" accept={VIDEO_ACCEPT} multiple className="sr-only" onChange={handleFileChange} />
                <Upload size={28} className={isDragOver ? "text-sky-400" : "text-sky-500/80"} />
                <p className="text-center text-sm font-medium text-slate-300">{t("uploadPrompt")}</p>
              </label>

              {files.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-400">
                    {t("clipsCount", { count: files.length })}
                    {totalDuration > 0 && ` · ${t("totalDurationLabel", { seconds: Math.floor(totalDuration) })}`}
                  </p>
                  <ul className="space-y-2">
                    {files.map((file, index) => (
                      <li
                        key={`${file.name}-${index}`}
                        className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/60 px-3 py-2"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-violet-500/20 text-xs font-medium text-violet-300">
                          {index + 1}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm text-slate-200">{file.name}</span>
                        {durations[file.name] != null && (
                          <span className="text-xs text-slate-400">{t("durationSec", { seconds: durations[file.name] })}</span>
                        )}
                        <div className="flex shrink-0 items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => moveUp(index)}
                            disabled={index === 0}
                            className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-slate-200 disabled:opacity-40"
                            aria-label={t("moveUp")}
                          >
                            <ChevronUp size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveDown(index)}
                            disabled={index === files.length - 1}
                            className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-slate-200 disabled:opacity-40"
                            aria-label={t("moveDown")}
                          >
                            <ChevronDown size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="rounded p-1 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400"
                            aria-label={t("remove")}
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {isLoadingFfmpeg && (
                <div className="flex items-center gap-3 rounded-xl border border-sky-500/30 bg-slate-900/60 px-4 py-3">
                  <Loader2 size={22} className="animate-spin shrink-0 text-sky-400" />
                  <p className="text-sm text-slate-300">{t("loadingFfmpeg")}</p>
                </div>
              )}

              {error && <p className="text-sm text-rose-400">{error}</p>}

              {canMerge && (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleMerge}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-sky-500 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={22} className="animate-spin shrink-0" />
                      <span>{t("mergingLabel")} {progress > 0 && `${progress}%`}</span>
                    </>
                  ) : (
                    <>
                      <ListVideo size={22} strokeWidth={2} className="shrink-0" />
                      <span>{t("mergeButton")}</span>
                    </>
                  )}
                </button>
              )}

              {isProcessing && (
                <div className="space-y-2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
                    <div className="h-full rounded-full bg-sky-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                  {progress > 0 && <p className="text-center text-xs text-slate-400">{t("progressLabel", { percent: progress })}</p>}
                </div>
              )}

              {resultBlob && resultUrl && (
                <div className="space-y-3">
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
            <EditorialSection namespace="tools.mergeVideos" />
          </aside>
        </div>

        <div className="mt-10">
          <RelatedTools locale={locale} currentSlug="merge-videos" />
        </div>

        <div className="mt-10">
          <FaqSection namespace="tools.mergeVideos" />
        </div>
      </main>
    </div>
  );
}
