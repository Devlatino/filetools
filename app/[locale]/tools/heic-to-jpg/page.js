"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import heic2any from "heic2any";
import JSZip from "jszip";
import { getToolFaq } from "@/lib/toolFaqs";
import { FaqSection } from "@/components/FaqSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${["B", "KB", "MB", "GB"][i]}`;
}

export default function HeicToJpgPage() {
  const locale = useLocale();
  const t = useTranslations("tools.heicToJpg");
  const tCommon = useTranslations("common");
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = useCallback((e) => {
    const list = Array.from(e.target.files || []);
    setError("");
    setResults([]);
    if (!list.length) return;
    const heics = list.filter((f) => f.type?.includes("heic") || /\.heic$/i.test(f.name));
    if (!heics.length) {
      setError(t("errorHeicOnly"));
      return;
    }
    setFiles(heics.map((file) => ({ id: file.name + file.size, name: file.name, file })));
  }, []);

  const handleConvert = useCallback(async () => {
    if (!files.length) return;
    setError("");
    setResults([]);
    setIsConverting(true);
    const out = [];
    const total = files.length;
    try {
      for (let i = 0; i < files.length; i++) {
        setProgress(Math.round(((i + 1) / total) * 100));
        const blob = await heic2any({
          blob: files[i].file,
          toType: "image/jpeg",
          quality: 0.9,
        });
        const b = Array.isArray(blob) ? blob[0] : blob;
        const url = URL.createObjectURL(b);
        out.push({
          id: files[i].id,
          originalName: files[i].name,
          blob: b,
          url,
        });
      }
      setResults(out);
    } catch (err) {
      setError(t("errorConversionFailed"));
      console.error(err);
    } finally {
      setIsConverting(false);
      setProgress(0);
    }
  }, [files]);

  const handleDownload = useCallback((r) => {
    const a = document.createElement("a");
    a.href = r.url;
    a.download = (r.originalName.replace(/\.heic$/i, "") || "image") + ".jpg";
    a.click();
  }, []);

  const handleDownloadZip = useCallback(async () => {
    if (!results.length) return;
    const zip = new JSZip();
    results.forEach((r) => {
      zip.file((r.originalName.replace(/\.heic$/i, "") || "image") + ".jpg", r.blob);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "heic-to-jpg.zip";
    a.click();
    URL.revokeObjectURL(a.href);
  }, [results]);

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
        <Breadcrumb locale={locale} homeLabel={tCommon("breadcrumbHome")} toolsLabel={tCommon("nav.tools")} toolLabel={t("label")} toolPath="heic-to-jpg" />
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("metaTitle")}</h1>
          <p className="max-w-xl text-sm text-slate-300">{t("metaDescription")}</p>
        </section>
        <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-slate-50">{t("step1")}</p>
            <label className="inline-flex cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400">
              {t("selectButton")}
              <input type="file" multiple accept="image/heic,image/heif,.heic,.heif" className="hidden" onChange={handleFiles} />
            </label>
          </div>
          {files.length > 0 && (
            <>
              <p className="mt-2 text-xs text-slate-400">{files.length} file(s) · {formatBytes(files.reduce((a, f) => a + f.file.size, 0))}</p>
              <button type="button" disabled={isConverting} onClick={handleConvert} className="mt-3 rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400 disabled:opacity-50">
                {isConverting ? tCommon("converting") : t("step2Convert")}
              </button>
              {isConverting && (
                <div className="mt-2 w-full rounded-full bg-slate-700">
                  <div className="h-2 rounded-full bg-sky-500 transition-all" style={{ width: `${progress}%` }} />
                </div>
              )}
            </>
          )}
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
          {results.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-slate-100">{t("previewDownload")}</p>
              <div className="flex flex-wrap gap-2">
                {results.map((r) => (
                  <div key={r.id} className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950/60 p-2">
                    <img src={r.url} alt="" className="h-12 w-12 rounded object-cover" />
                    <span className="max-w-[120px] truncate text-xs text-slate-300">{(r.originalName.replace(/\.heic$/i, "") || "image") + ".jpg"}</span>
                    <button type="button" onClick={() => handleDownload(r)} className="rounded-full bg-sky-500/20 px-2 py-1 text-xs text-sky-200 hover:bg-sky-500/30">{tCommon("download")}</button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={handleDownloadZip} className="rounded-full border border-sky-400/50 bg-slate-800 px-4 py-2 text-xs font-semibold text-sky-200 hover:bg-slate-700">
                {t("downloadAllZip")}
              </button>
            </div>
          )}
        </section>
        <RelatedTools locale={locale} currentSlug="heic-to-jpg" />
        <FaqSection namespace="tools.heicToJpg" faqs={getToolFaq("heic-to-jpg")} />
      </main>
    </div>
  );
}
