"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Upload, Loader2, Check, Download, AudioLines } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import AudioWaveform from "@/components/AudioWaveform";

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
          {t("stepIndicatorReplace")}
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
const AUDIO_ACCEPT = "audio/mpeg,audio/wav,audio/aac,audio/mp4,.mp3,.wav,.aac,.m4a";

function getVideoExt(file) {
  return (file?.name?.match(/\.(mp4|webm|mov)$/i)?.[1] ?? "mp4").toLowerCase();
}

export default function AddAudioToVideoPage() {
  const locale = useLocale();
  const t = useTranslations("tools.addAudioToVideo");
  const tCommon = useTranslations("common");
  const tTool = useTranslations("tool");
  const [videoFile, setVideoFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [resultBlob, setResultBlob] = useState(null);
  const [resultUrl, setResultUrl] = useState("");
  const [isLoadingFfmpeg, setIsLoadingFfmpeg] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [videoDragOver, setVideoDragOver] = useState(false);
  const [audioDragOver, setAudioDragOver] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const ffmpegRef = useRef(null);
  const audioCtxRef = useRef(null);
  const sourceRef = useRef(null);
  const startTimeRef = useRef(0);
  const animFrameRef = useRef(null);

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

  const setVideo = useCallback((file) => {
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
      return;
    }
    setError("");
    setResultBlob(null);
    setResultUrl((u) => {
      if (u) URL.revokeObjectURL(u);
      return "";
    });
    setVideoFile(file);
    if (audioFile) setCurrentStep(2);
  }, [t, audioFile]);

  const setAudio = useCallback((file) => {
    if (!file) {
      setAudioFile(null);
      setAudioBuffer(null);
      setCurrentTime(0);
      setCurrentStep(1);
      setResultBlob(null);
      setResultUrl((u) => {
        if (u) URL.revokeObjectURL(u);
        return "";
      });
      return;
    }
    const ok = /\.(mp3|wav|aac|m4a)$/i.test(file.name) || ["audio/mpeg", "audio/wav", "audio/aac", "audio/mp4"].includes(file.type);
    if (!ok) {
      setError(t("errorAudioOnly"));
      return;
    }
    setError("");
    setResultBlob(null);
    setResultUrl((u) => {
      if (u) URL.revokeObjectURL(u);
      return "";
    });
    setAudioFile(file);
    if (videoFile) setCurrentStep(2);
  }, [t, videoFile]);

  useEffect(() => {
    if (!audioFile) return;
    let cancelled = false;
    (async () => {
      try {
        const arrayBuffer = await audioFile.arrayBuffer();
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioCtxRef.current = audioCtx;
        const buffer = await audioCtx.decodeAudioData(arrayBuffer);
        if (!cancelled) {
          setAudioBuffer(buffer);
          setCurrentTime(0);
        }
      } catch (err) {
        if (!cancelled) console.error("Audio decode failed:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [audioFile]);

  const playAudio = useCallback(
    (seekTime) => {
      if (!audioBuffer) return;
      const audioCtx = audioCtxRef.current;
      if (!audioCtx) return;
      sourceRef.current?.stop();
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      const offset = seekTime !== undefined ? seekTime : currentTime;
      source.start(0, offset);
      sourceRef.current = source;
      startTimeRef.current = audioCtx.currentTime - offset;
      setIsPlaying(true);
      const animate = () => {
        const t = audioCtx.currentTime - startTimeRef.current;
        setCurrentTime(Math.min(t, audioBuffer.duration));
        if (t < audioBuffer.duration) {
          animFrameRef.current = requestAnimationFrame(animate);
        } else {
          setIsPlaying(false);
          setCurrentTime(0);
        }
      };
      animFrameRef.current = requestAnimationFrame(animate);
      source.onended = () => setIsPlaying(false);
    },
    [audioBuffer, currentTime]
  );

  const stopAudio = useCallback(() => {
    sourceRef.current?.stop();
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setIsPlaying(false);
  }, []);

  const handleSeek = useCallback(
    (time) => {
      setCurrentTime(time);
      if (isPlaying) {
        stopAudio();
        setTimeout(() => playAudio(time), 50);
      }
    },
    [isPlaying, stopAudio, playAudio]
  );

  const handleVideoChange = useCallback((e) => setVideo(e.target.files?.[0] ?? null), [setVideo]);
  const handleAudioChange = useCallback((e) => setAudio(e.target.files?.[0] ?? null), [setAudio]);

  const handleVideoDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setVideoDragOver(false);
    setVideo(e.dataTransfer?.files?.[0] ?? null);
  }, [setVideo]);
  const handleAudioDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setAudioDragOver(false);
    setAudio(e.dataTransfer?.files?.[0] ?? null);
  }, [setAudio]);

  const handleReplaceAudio = useCallback(async () => {
    if (!videoFile || !audioFile) {
      setError(t("errorSelectBoth"));
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
    const videoExt = getVideoExt(videoFile);
    const inputVideo = `input_video.${videoExt}`;
    const audioExt = audioFile.name.match(/\.(mp3|wav|aac|m4a)$/i)?.[1]?.toLowerCase() ?? "mp3";
    const inputAudio = `input_audio.${audioExt}`;
    const outputName = "output.mp4";
    try {
      await ffmpeg.writeFile(inputVideo, await fetchFile(videoFile));
      await ffmpeg.writeFile(inputAudio, await fetchFile(audioFile));
      await ffmpeg.exec([
        "-i", inputVideo,
        "-i", inputAudio,
        "-map", "0:v:0",
        "-map", "1:a:0",
        "-c:v", "copy",
        "-c:a", "aac",
        "-shortest",
        outputName,
      ]);
      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data], { type: "video/mp4" });
      setResultBlob(blob);
      setResultUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
      setCurrentStep(3);
    } catch (err) {
      setError(t("errorReplaceFailed"));
      console.error(err);
    } finally {
      ffmpeg.off("progress", progressHandler);
      setIsProcessing(false);
      setProgress(0);
    }
  }, [videoFile, audioFile, loadFfmpeg, t]);

  const handleDownload = useCallback(() => {
    if (!resultBlob || !resultUrl) return;
    const base = videoFile?.name?.replace(/\.(mp4|webm|mov)$/i, "") || "video-with-audio";
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `${base}-with-audio.mp4`;
    a.click();
  }, [resultBlob, resultUrl, videoFile]);

  const canProcess = videoFile && audioFile && !resultBlob && !isLoadingFfmpeg;

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
        <Breadcrumb locale={locale} homeLabel={tCommon("breadcrumbHome")} toolsLabel={tCommon("nav.tools")} toolLabel={t("label")} toolPath="add-audio-to-video" />

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_340px]">
          <section className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("metaTitle")}</h1>
              <p className="mt-1 text-sm text-slate-300">{t("metaDescription")}</p>
            </div>

            <StepIndicator step1={step1Status} step2={step2Status} step3={step3Status} t={t} />

            <div className="w-full space-y-4">
              <div>
                <p className="mb-2 text-xs font-medium text-slate-400">{t("videoZoneLabel")}</p>
                {!videoFile ? (
                  <label
                    role="button"
                    tabIndex={0}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setVideoDragOver(true); }}
                    onDragLeave={(e) => { e.preventDefault(); if (!e.currentTarget.contains(e.relatedTarget)) setVideoDragOver(false); }}
                    onDrop={handleVideoDrop}
                    className={`flex h-[120px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 px-4 transition-colors ${
                      videoDragOver ? "border-sky-500 bg-sky-500/15" : "border-dashed border-sky-500/70 bg-slate-900/50"
                    }`}
                  >
                    <input ref={videoInputRef} type="file" accept={VIDEO_ACCEPT} className="sr-only" onChange={handleVideoChange} />
                    <Upload size={28} className={videoDragOver ? "text-sky-400" : "text-sky-500/80"} />
                    <p className="text-center text-sm font-medium text-slate-300">{t("videoZonePlaceholder")}</p>
                  </label>
                ) : (
                  <div className="flex h-[72px] w-full items-center gap-3 rounded-xl border border-sky-500/40 bg-slate-900/60 px-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/20">
                      <AudioLines size={20} className="text-violet-400" />
                    </div>
                    <p className="truncate text-sm font-medium text-slate-100">{videoFile.name}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="mb-2 text-xs font-medium text-slate-400">{t("audioZoneLabel")}</p>
                {!audioFile ? (
                  <label
                    role="button"
                    tabIndex={0}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setAudioDragOver(true); }}
                    onDragLeave={(e) => { e.preventDefault(); if (!e.currentTarget.contains(e.relatedTarget)) setAudioDragOver(false); }}
                    onDrop={handleAudioDrop}
                    className={`flex h-[120px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 px-4 transition-colors ${
                      audioDragOver ? "border-sky-500 bg-sky-500/15" : "border-dashed border-sky-500/70 bg-slate-900/50"
                    }`}
                  >
                    <input ref={audioInputRef} type="file" accept={AUDIO_ACCEPT} className="sr-only" onChange={handleAudioChange} />
                    <Upload size={28} className={audioDragOver ? "text-sky-400" : "text-sky-500/80"} />
                    <p className="text-center text-sm font-medium text-slate-300">{t("audioZonePlaceholder")}</p>
                  </label>
                ) : (
                  <div className="flex h-[72px] w-full items-center gap-3 rounded-xl border border-sky-500/40 bg-slate-900/60 px-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pink-500/20">
                      <AudioLines size={20} className="text-pink-400" />
                    </div>
                    <p className="truncate text-sm font-medium text-slate-100">{audioFile.name}</p>
                  </div>
                )}
                {audioBuffer && audioFile && (
                  <div className="mt-3 space-y-3">
                    <AudioWaveform
                      audioBuffer={audioBuffer}
                      currentTime={currentTime}
                      duration={audioBuffer.duration}
                      onSeek={handleSeek}
                      mode="playback"
                      isPlaying={isPlaying}
                    />
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={isPlaying ? stopAudio : () => playAudio()}
                        className="rounded-lg border border-white/10 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-700"
                      >
                        {isPlaying ? "⏸ Pause" : "▶ Play"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          stopAudio();
                          setCurrentTime(0);
                        }}
                        className="rounded-lg border border-white/10 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-700"
                      >
                        ⏹ Stop
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {isLoadingFfmpeg && (
                <div className="flex items-center gap-3 rounded-xl border border-sky-500/30 bg-slate-900/60 px-4 py-3">
                  <Loader2 size={22} className="animate-spin shrink-0 text-sky-400" />
                  <p className="text-sm text-slate-300">{t("loadingFfmpeg")}</p>
                </div>
              )}

              {error && <p className="text-sm text-rose-400">{error}</p>}

              {canProcess && (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleReplaceAudio}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-sky-500 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={22} className="animate-spin shrink-0" />
                      <span>{t("processingLabel")} {progress > 0 && `${progress}%`}</span>
                    </>
                  ) : (
                    <>
                      <AudioLines size={22} strokeWidth={2} className="shrink-0" />
                      <span>{t("replaceAudioButton")}</span>
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
            <EditorialSection namespace="tools.addAudioToVideo" />
          </aside>
        </div>

        <div className="mt-10">
          <RelatedTools locale={locale} currentSlug="add-audio-to-video" />
        </div>

        <div className="mt-10">
          <FaqSection namespace="tools.addAudioToVideo" />
        </div>
      </main>
    </div>
  );
}
