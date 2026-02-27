"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import imageCompression from "browser-image-compression";
import { getToolFaq } from "@/lib/toolFaqs";
import { FaqSection } from "@/components/FaqSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";

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

  const qualityLabel = useMemo(() => `${quality} / 100`, [quality]);

  const handleFileChange = useCallback((event) => {
    const file = event.target.files?.[0];
    setError("");
    setCompressedFile(null);
    setCompressedUrl("");
    if (!file) {
      setOriginalFile(null);
      setOriginalUrl("");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Unsupported format. Use JPG, PNG or WebP.");
      setOriginalFile(null);
      setOriginalUrl("");
      return;
    }
    setOriginalFile(file);
    setOriginalUrl(URL.createObjectURL(file));
  }, []);

  const handleCompress = useCallback(async () => {
    if (!originalFile) {
      setError("Select an image to compress first.");
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
    } catch (err) {
      setError("Compression failed. Try another image.");
      console.error(err);
    } finally {
      setIsCompressing(false);
    }
  }, [compressedUrl, originalFile, quality]);

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
    if (diff <= 0) return "Compressed size is similar to original.";
    return `Saved about ${formatBytes(diff)} (~${ratio.toFixed(1)}% less).`;
  }, [compressedFile, originalFile]);

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

        <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-5">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-50">
                  1. Upload an image
                </p>
                <p className="text-xs text-slate-400">
                  Supported: JPG, PNG, WebP.
                </p>
              </div>
              <label className="inline-flex cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-sm hover:bg-sky-400">
                Select image
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-medium">2. Choose quality</span>
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
                Lower = smaller file, lower quality. Try 60–80 for a good balance.
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={!originalFile || isCompressing}
                onClick={handleCompress}
                className="inline-flex items-center justify-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-sm hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCompressing ? "Compressing…" : "3. Compress image"}
              </button>
              <button
                type="button"
                disabled={!compressedFile}
                onClick={handleDownload}
                className="inline-flex items-center justify-center rounded-full border border-slate-600 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-100 hover:border-sky-400 hover:text-sky-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Download compressed image
              </button>
            </div>

            {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-50">
            Before / After preview
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3">
              <p className="text-xs font-medium text-slate-100">Original</p>
              <p className="mt-1 text-[11px] text-slate-400">
                {originalFile
                  ? `${originalFile.name} · ${formatBytes(originalFile.size)}`
                  : "Upload an image to see preview."}
              </p>
              <div className="mt-3 flex items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950/60 px-2 py-4">
                {originalUrl ? (
                  <img
                    src={originalUrl}
                    alt="Original"
                    width={400}
                    height={256}
                    loading="lazy"
                    className="max-h-64 w-auto rounded-md object-contain"
                  />
                ) : (
                  <span className="text-[11px] text-slate-500">
                    No image loaded.
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3">
              <p className="text-xs font-medium text-slate-100">Compressed</p>
              <p className="mt-1 text-[11px] text-slate-400">
                {compressedFile
                  ? `${compressedFile.name || originalFile?.name || "Image"} · ${formatBytes(compressedFile.size)}`
                  : "Result will appear here after compression."}
              </p>
              <div className="mt-3 flex items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950/60 px-2 py-4">
                {compressedUrl ? (
                  <img
                    src={compressedUrl}
                    alt="Compressed"
                    width={400}
                    height={256}
                    loading="lazy"
                    className="max-h-64 w-auto rounded-md object-contain"
                  />
                ) : (
                  <span className="text-[11px] text-slate-500">
                    No compressed image yet.
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
        <RelatedTools locale={locale} currentSlug="compress-image" />
        <FaqSection faqs={getToolFaq("compress-image")} />
      </main>
    </div>
  );
}
