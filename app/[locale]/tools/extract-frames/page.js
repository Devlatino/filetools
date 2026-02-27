"use client";

import { useCallback, useState, useRef } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import JSZip from "jszip";
import { getToolFaq } from "@/lib/toolFaqs";
import { FaqSection } from "@/components/FaqSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";

export default function ExtractFramesPage() {
  const locale = useLocale();
  const t = useTranslations("tools.extractFrames");
  const tCommon = useTranslations("common");
  const [file, setFile] = useState(null);
  const [duration, setDuration] = useState(0);
  const [mode, setMode] = useState("count");
  const [frameCount, setFrameCount] = useState(10);
  const [intervalSec, setIntervalSec] = useState(2);
  const [frames, setFrames] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const videoRef = useRef(null);

  const handleFile = useCallback((e) => {
    const f = e.target.files?.[0];
    setError("");
    setFrames([]);
    setDuration(0);
    if (!f) {
      setFile(null);
      return;
    }
    if (!f.type.startsWith("video/")) {
      setError(t("errorSelectVideo"));
      setFile(null);
      return;
    }
    setFile(f);
    const url = URL.createObjectURL(f);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => {
      setDuration(v.duration);
      URL.revokeObjectURL(url);
    };
    v.onerror = () => {
      setError(t("errorLoadVideo"));
      URL.revokeObjectURL(url);
    };
    v.src = url;
  }, []);

  const handleExtract = useCallback(async () => {
    if (!file || !videoRef.current) return;
    setError("");
    setFrames([]);
    setIsProcessing(true);
    const video = videoRef.current;
    video.src = URL.createObjectURL(file);
    await new Promise((res, rej) => {
      video.onloadedmetadata = res;
      video.onerror = rej;
    });
    const dur = video.duration;
    let times = [];
    if (mode === "count") {
      for (let i = 0; i < frameCount; i++) times.push((dur * (i + 1)) / (frameCount + 1));
    } else {
      for (let t = 0; t < dur; t += intervalSec) times.push(t);
    }
    const out = [];
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    for (let i = 0; i < times.length; i++) {
      setProgress(Math.round(((i + 1) / times.length) * 100));
      await new Promise((res) => {
        video.onseeked = () => {
          video.onseeked = null;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) out.push({ index: i + 1, time: times[i], blob, url: URL.createObjectURL(blob) });
            res();
          }, "image/jpeg", 0.9);
        };
        video.currentTime = times[i];
      });
    }
    setFrames(out);
    setIsProcessing(false);
    setProgress(0);
  }, [file, mode, frameCount, intervalSec]);

  const handleDownloadZip = useCallback(async () => {
    if (!frames.length) return;
    const zip = new JSZip();
    frames.forEach((f) => zip.file(`frame-${f.index}.jpg`, f.blob));
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "frames.zip";
    a.click();
    URL.revokeObjectURL(a.href);
  }, [frames]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href={`/${locale}/`} prefetch className="flex items-center gap-2">
            <img src="/fileflip-logo.svg" alt={tCommon("siteName")} className="h-9 w-auto" width={140} height={36} />
            <span className="text-sm text-slate-400">{t("label")}</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto flex max-w-4xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumb locale={locale} homeLabel={tCommon("breadcrumbHome")} toolsLabel={tCommon("nav.tools")} toolLabel={t("label")} toolPath="extract-frames" />
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("metaTitle")}</h1>
          <p className="max-w-xl text-sm text-slate-300">{t("metaDescription")}</p>
        </section>
        <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-5">
          <video ref={videoRef} className="hidden" muted playsInline />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-slate-50">{t("step1")}</p>
            <label className="inline-flex cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400">
              {t("selectButton")}
              <input type="file" accept="video/*" className="hidden" onChange={handleFile} />
            </label>
          </div>
          {file && (
            <>
              <p className="mt-2 text-xs text-slate-400">Duration: {duration > 0 ? `${duration.toFixed(1)} s` : "…"}</p>
              <div className="mt-3 flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input type="radio" checked={mode === "count"} onChange={() => setMode("count")} />
                  {t("frameCount")}
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input type="radio" checked={mode === "interval"} onChange={() => setMode("interval")} />
                  {t("intervalSeconds")}
                </label>
              </div>
              {mode === "count" ? (
                <input type="number" min={1} max={60} value={frameCount} onChange={(e) => setFrameCount(Number(e.target.value))} className="mt-2 w-24 rounded border border-slate-700 bg-slate-950/60 px-2 py-1 text-sm text-slate-200" />
              ) : (
                <input type="number" min={0.5} step={0.5} value={intervalSec} onChange={(e) => setIntervalSec(Number(e.target.value))} className="mt-2 w-24 rounded border border-slate-700 bg-slate-950/60 px-2 py-1 text-sm text-slate-200" />
              )}
              <button type="button" disabled={isProcessing || duration <= 0} onClick={handleExtract} className="mt-3 rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400 disabled:opacity-50">
                {isProcessing ? t("extracting") : t("step2Extract")}
              </button>
              {isProcessing && (
                <div className="mt-2 w-full rounded-full bg-slate-700">
                  <div className="h-2 rounded-full bg-sky-500 transition-all" style={{ width: `${progress}%` }} />
                </div>
              )}
            </>
          )}
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
          {frames.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-slate-100">Frames ({frames.length})</p>
              <div className="grid max-h-80 gap-2 overflow-auto sm:grid-cols-3 md:grid-cols-4">
                {frames.map((f) => (
                  <div key={f.index} className="flex flex-col items-center gap-1">
                    <img src={f.url} alt={`Frame ${f.index}`} className="h-20 w-full rounded border border-slate-700 object-cover" />
                    <a href={f.url} download={`frame-${f.index}.jpg`} className="text-xs text-sky-300 hover:underline">{tCommon("download")}</a>
                  </div>
                ))}
              </div>
              <button type="button" onClick={handleDownloadZip} className="mt-3 rounded-full border border-sky-400/50 bg-slate-800 px-4 py-2 text-xs font-semibold text-sky-200 hover:bg-slate-700">
                {t("downloadAllZip")}
              </button>
            </div>
          )}
        </section>
        <RelatedTools locale={locale} currentSlug="extract-frames" />
        <FaqSection namespace="tools.extractFrames" faqs={getToolFaq("extract-frames")} />
      </main>
    </div>
  );
}
