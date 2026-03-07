"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Upload, Loader2, Copy, Check, Download, FileText, ShieldCheck } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const OCR_LANGUAGES = [
  { code: "eng", label: "English" },
  { code: "ita", label: "Italiano" },
  { code: "spa", label: "Español" },
  { code: "fra", label: "Français" },
  { code: "deu", label: "Deutsch" },
  { code: "por", label: "Português" },
  { code: "chi_sim", label: "中文简体" },
  { code: "hin", label: "हिन्दी" },
  { code: "ara", label: "العربية" },
  { code: "jpn", label: "Japanese" },
  { code: "kor", label: "Korean" },
  { code: "rus", label: "Russian" },
  { code: "nld", label: "Dutch" },
  { code: "pol", label: "Polish" },
  { code: "tur", label: "Turkish" },
];

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/bmp", "image/tiff", "image/webp"];
const ACCEPTED_EXT = [".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif", ".webp"];

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function ImageToTextPage() {
  const locale = useLocale();
  const t = useTranslations("tools.imageToText");
  const tCommon = useTranslations("common");

  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [ocrLang, setOcrLang] = useState("eng");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ status: "", pct: 0 });
  const [resultText, setResultText] = useState("");
  const [confidence, setConfidence] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = useCallback((file) => {
    if (!file) return;
    const ext = file.name.toLowerCase();
    const validExt = ACCEPTED_EXT.some((e) => ext.endsWith(e));
    const validType = ACCEPTED_TYPES.includes(file.type) || file.type === "";
    if (!validExt && !validType) {
      setError(t("errorGeneric"));
      return;
    }
    setError("");
    setResultText("");
    setConfidence(null);
    setProgress({ status: "", pct: 0 });
    setImageFile(file);
    setImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }, [t]);

  const handleFileChange = useCallback((e) => {
    processFile(e.target.files?.[0] ?? null);
  }, [processFile]);

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

  const handleExtract = useCallback(async () => {
    if (!imageFile) return;
    setError("");
    setResultText("");
    setConfidence(null);
    setIsProcessing(true);
    setProgress({ status: "Initializing...", pct: 0 });

    let worker;
    try {
      const { createWorker } = await import("tesseract.js");
      worker = await createWorker(ocrLang, 1, {
        logger: (m) => {
          if (m.progress !== undefined) {
            const statusMap = {
              "loading tesseract core": "Loading engine...",
              "initializing tesseract": "Initializing...",
              "loading language traineddata": "Loading language data...",
              "initializing api": "Initializing API...",
              "recognizing text": "Recognizing text...",
            };
            setProgress({
              status: statusMap[m.status] || m.status || "Processing...",
              pct: Math.round(m.progress * 100),
            });
          }
        },
      });

      const { data } = await worker.recognize(imageFile);
      setResultText(data.text.trim());
      setConfidence(Math.round(data.confidence));
      setProgress({ status: "Done", pct: 100 });
    } catch (e) {
      setError(t("errorGeneric"));
      console.error(e);
    } finally {
      if (worker) {
        try { await worker.terminate(); } catch {}
      }
      setIsProcessing(false);
    }
  }, [imageFile, ocrLang, t]);

  const handleCopy = useCallback(() => {
    if (!resultText) return;
    navigator.clipboard.writeText(resultText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [resultText]);

  const handleDownload = useCallback(() => {
    if (!resultText) return;
    const blob = new Blob([resultText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fileflip-ocr-${imageFile?.name?.replace(/\.[^.]+$/, "") || "output"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [resultText, imageFile]);

  const handleReset = useCallback(() => {
    setImageFile(null);
    setImageUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return ""; });
    setResultText("");
    setConfidence(null);
    setError("");
    setProgress({ status: "", pct: 0 });
  }, []);

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
          toolPath="image-to-text"
        />

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_320px]">
          <section className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("metaTitle")}</h1>
              <p className="mt-1 text-sm text-slate-300">{t("metaDescription")}</p>
            </div>

            {/* Privacy notice */}
            <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-300">
              <ShieldCheck size={18} className="mt-0.5 shrink-0" />
              <span>All text recognition happens in your browser. Your images are never uploaded to any server.</span>
            </div>

            {/* Language selector */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-slate-300">OCR Language:</label>
              <select
                value={ocrLang}
                onChange={(e) => setOcrLang(e.target.value)}
                className="rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:outline-none"
              >
                {OCR_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Dropzone */}
            {!imageFile ? (
              <label
                role="button"
                tabIndex={0}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex h-[220px] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 px-4 transition-colors duration-200 ${
                  isDragOver
                    ? "border-sky-500 bg-sky-500/15"
                    : "border-dashed border-sky-500/70 bg-slate-900/50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_EXT.join(",")}
                  className="sr-only"
                  onChange={handleFileChange}
                />
                <Upload size={40} strokeWidth={1.5} className={isDragOver ? "text-sky-400" : "text-sky-500/80"} />
                <p className={`text-center text-sm font-medium ${isDragOver ? "text-sky-200" : "text-slate-300"}`}>
                  {isDragOver ? "Release to upload" : t("dropzone")}
                </p>
                <p className="text-xs text-slate-500">JPG, PNG, BMP, TIFF, WebP</p>
              </label>
            ) : (
              <div className="space-y-4">
                {/* Image preview */}
                <div className="flex items-start gap-4 rounded-xl border border-white/10 bg-slate-900/60 p-4">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="max-h-[180px] w-auto max-w-[280px] rounded-lg object-contain"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-100">{imageFile.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{formatBytes(imageFile.size)}</p>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="mt-3 text-xs text-slate-500 underline hover:text-slate-300"
                    >
                      Remove image
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{progress.status}</span>
                      <span>{progress.pct}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-sky-500 transition-all duration-300"
                        style={{ width: `${progress.pct}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Extract button */}
                {!isProcessing && !resultText && (
                  <button
                    type="button"
                    onClick={handleExtract}
                    className="flex w-full items-center justify-center gap-3 rounded-xl bg-sky-500 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition hover:bg-sky-400"
                  >
                    <FileText size={22} strokeWidth={2} />
                    {t("convert")}
                  </button>
                )}

                {isProcessing && (
                  <div className="flex w-full items-center justify-center gap-3 rounded-xl bg-sky-500/20 py-4 text-base font-semibold text-sky-300">
                    <Loader2 size={22} className="animate-spin" />
                    {t("converting")}
                  </div>
                )}
              </div>
            )}

            {error && (
              <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
                {error}
              </p>
            )}

            {/* Result */}
            {resultText && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-sm font-semibold text-slate-200">Extracted Text</h2>
                    {confidence !== null && (
                      <span className="rounded-full border border-white/10 bg-slate-800 px-2.5 py-0.5 text-xs text-slate-400">
                        Confidence: {confidence}%
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700"
                    >
                      {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700"
                    >
                      <Download size={13} />
                      Download .txt
                    </button>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-slate-700"
                    >
                      New image
                    </button>
                  </div>
                </div>
                <textarea
                  value={resultText}
                  readOnly
                  className="min-h-[200px] w-full resize-y rounded-xl border border-white/10 bg-slate-900 p-4 font-mono text-sm text-slate-200 focus:outline-none"
                  style={{ fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace" }}
                />
              </div>
            )}
          </section>

          <aside className="space-y-8 lg:max-w-[320px]">
            <EditorialSection namespace="tools.imageToText" />
          </aside>
        </div>

        <div className="mt-10">
          <RelatedTools locale={locale} currentSlug="image-to-text" />
        </div>
        <div className="mt-10">
          <FaqSection namespace="tools.imageToText" />
        </div>
      </main>
    </div>
  );
}
