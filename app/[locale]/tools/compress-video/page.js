"use client";

import { useCallback, useState, useRef } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { getToolFaq } from "@/lib/toolFaqs";
import { FaqSection } from "@/components/FaqSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function CompressVideoPage() {
  const locale = useLocale();
  const t = useTranslations("tools.compressVideo");
  const tCommon = useTranslations("common");
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const ffmpegRef = useRef({ loaded: false, ffmpeg: null });

  const handleFileChange = useCallback((e) => {
    const f = e.target.files?.[0];
    setError("");
    setResultUrl("");
    setProgress(0);
    if (!f) {
      setFile(null);
      return;
    }
    if (!f.type?.includes("mp4") && !f.name.toLowerCase().endsWith(".mp4")) {
      setError("Please select an MP4 file.");
      setFile(null);
      return;
    }
    setFile(f);
  }, []);

  const loadFfmpeg = useCallback(async () => {
    if (ffmpegRef.current.loaded && ffmpegRef.current.ffmpeg) return ffmpegRef.current.ffmpeg;
    const ffmpeg = new FFmpeg();
    ffmpeg.on("progress", ({ progress: p }) => setProgress(Math.round(p * 100)));
    const baseURL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";
    await ffmpeg.load({
      coreURL: await toBlobURL(baseURL + "/ffmpeg-core.js", "text/javascript"),
      wasmURL: await toBlobURL(baseURL + "/ffmpeg-core.wasm", "application/wasm"),
    });
    ffmpegRef.current = { loaded: true, ffmpeg };
    return ffmpeg;
  }, []);

  const handleCompress = useCallback(async () => {
    if (!file) return;
    setError("");
    setResultUrl("");
    setProgress(0);
    setIsLoading(true);
    try {
      const ffmpeg = await loadFfmpeg();
      setIsLoading(false);
      setIsProcessing(true);
      const data = new Uint8Array(await file.arrayBuffer());
      await ffmpeg.writeFile("input.mp4", data);
      await ffmpeg.exec(["-i", "input.mp4", "-crf", "28", "-preset", "medium", "output.mp4"]);
      const out = await ffmpeg.readFile("output.mp4");
      const blob = new Blob([out.buffer], { type: "video/mp4" });
      setResultUrl(URL.createObjectURL(blob));
      await ffmpeg.deleteFile("input.mp4");
      await ffmpeg.deleteFile("output.mp4");
    } catch (err) {
      setError("Compression failed. Try a shorter or smaller video.");
      console.error(err);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, [file, loadFfmpeg]);

  const handleDownload = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = "fileflip-compressed-" + (file?.name || "video.mp4");
    a.click();
  }, [resultUrl, file]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href={"/" + locale + "/"} prefetch className="flex items-center gap-2">
            <img src="/fileflip-logo.svg" alt={tCommon("siteName")} className="h-9 w-auto" width={140} height={36} />
            <span className="text-sm text-slate-400">{t("label")}</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto flex max-w-4xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumb locale={locale} homeLabel={tCommon("breadcrumbHome")} toolsLabel={tCommon("nav.tools")} toolLabel={t("label")} toolPath="compress-video" />
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("metaTitle")}</h1>
          <p className="max-w-xl text-sm text-slate-300">{t("metaDescription")}</p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-5">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-50">1. Upload MP4</p>
                <p className="text-xs text-slate-400">Video will be compressed in the browser</p>
              </div>
              <label className="inline-flex cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400">
                Select video
                <input type="file" accept="video/mp4,.mp4" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
            {file && (
              <>
                <button
                  type="button"
                  disabled={isLoading || isProcessing}
                  onClick={handleCompress}
                  className="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400 disabled:opacity-50"
                >
                  {isLoading ? "Loading FFmpeg…" : isProcessing ? "Compressing…" : "Compress"}
                </button>
                {(isLoading || isProcessing) && (
                  <div className="w-full rounded-full bg-slate-700">
                    <div className="h-2 rounded-full bg-sky-500 transition-all" style={{ width: progress + "%" }} />
                  </div>
                )}
                {resultUrl && (
                  <button type="button" onClick={handleDownload} className="rounded-full border border-sky-400/50 bg-slate-800 px-4 py-2 text-xs font-semibold text-sky-200 hover:bg-slate-700">
                    Download compressed
                  </button>
                )}
              </>
            )}
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>
        </section>

        <RelatedTools locale={locale} currentSlug="compress-video" />
        <FaqSection faqs={getToolFaq("compress-video")} />
      </main>
    </div>
  );
}
