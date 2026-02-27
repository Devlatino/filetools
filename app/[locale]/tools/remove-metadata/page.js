"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import exifr from "exifr";
import { getToolFaq } from "@/lib/toolFaqs";
import { FaqSection } from "@/components/FaqSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";

export default function RemoveMetadataPage() {
  const locale = useLocale();
  const t = useTranslations("tools.removeMetadata");
  const tCommon = useTranslations("common");
  const [file, setFile] = useState(null);
  const [meta, setMeta] = useState(null);
  const [resultUrl, setResultUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleFile = useCallback((e) => {
    const f = e.target.files?.[0];
    setError("");
    setMeta(null);
    setResultUrl("");
    if (!f) {
      setFile(null);
      return;
    }
    if (!["image/jpeg", "image/png"].includes(f.type)) {
      setError("Use JPG or PNG only.");
      setFile(null);
      return;
    }
    setFile(f);
    exifr
      .parse(f)
      .then((data) => setMeta(data || {}))
      .catch(() => setMeta({}));
  }, []);

  const handleStrip = useCallback(() => {
    if (!file) return;
    setError("");
    setIsProcessing(true);
    setResultUrl("");
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) setResultUrl(URL.createObjectURL(blob));
          setIsProcessing(false);
        },
        file.type,
        0.92
      );
    };
    img.onerror = () => {
      setError("Failed to load image.");
      setIsProcessing(false);
    };
    img.src = URL.createObjectURL(file);
  }, [file]);

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
        <Breadcrumb locale={locale} homeLabel={tCommon("breadcrumbHome")} toolsLabel={tCommon("nav.tools")} toolLabel={t("label")} toolPath="remove-metadata" />
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("metaTitle")}</h1>
          <p className="max-w-xl text-sm text-slate-300">{t("metaDescription")}</p>
        </section>
        <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-slate-50">1. Upload JPG or PNG</p>
            <label className="inline-flex cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400">
              Select image
              <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleFile} />
            </label>
          </div>
          {file && (
            <>
              {meta && Object.keys(meta).length > 0 && (
                <div className="mt-4 rounded-lg border border-slate-700 bg-slate-950/60 p-3">
                  <p className="mb-2 text-xs font-medium text-slate-300">Metadata found (will be removed)</p>
                  <pre className="max-h-40 overflow-auto text-[11px] text-slate-400">{JSON.stringify(meta, null, 2)}</pre>
                </div>
              )}
              {meta && Object.keys(meta).length === 0 && <p className="mt-2 text-xs text-slate-500">No EXIF metadata detected.</p>}
              <button type="button" disabled={isProcessing} onClick={handleStrip} className="mt-3 rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400 disabled:opacity-50">
                {isProcessing ? "Processing…" : "2. Remove metadata &amp; download"}
              </button>
              {resultUrl && (
                <a href={resultUrl} download={(file.name || "image").replace(/\.[^.]+$/, "") + (file.type === "image/png" ? ".png" : ".jpg")} className="mt-3 inline-block rounded-full border border-sky-400/50 bg-slate-800 px-4 py-2 text-xs font-semibold text-sky-200 hover:bg-slate-700">
                  Download clean image
                </a>
              )}
            </>
          )}
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        </section>
        <RelatedTools locale={locale} currentSlug="remove-metadata" />
        <FaqSection faqs={getToolFaq("remove-metadata")} />
      </main>
    </div>
  );
}
