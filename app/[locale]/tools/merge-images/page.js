"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { getToolFaq } from "@/lib/toolFaqs";
import { FaqSection } from "@/components/FaqSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

export default function MergeImagesPage() {
  const locale = useLocale();
  const t = useTranslations("tools.mergeImages");
  const tCommon = useTranslations("common");
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [layout, setLayout] = useState("horizontal");
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");

  const handleFile1 = useCallback((e) => {
    const f = e.target.files?.[0];
    setFile1(f || null);
    setResultUrl("");
    setError("");
  }, []);

  const handleFile2 = useCallback((e) => {
    const f = e.target.files?.[0];
    setFile2(f || null);
    setResultUrl("");
    setError("");
  }, []);

  const handleMerge = useCallback(async () => {
    if (!file1 || !file2) {
      setError("Please select both images.");
      return;
    }
    setError("");
    try {
      const [img1, img2] = await Promise.all([loadImage(file1), loadImage(file2)]);
      const isHorizontal = layout === "horizontal";
      const w1 = img1.width;
      const h1 = img1.height;
      const w2 = img2.width;
      const h2 = img2.height;
      const canvas = document.createElement("canvas");
      if (isHorizontal) {
        canvas.width = w1 + w2;
        canvas.height = Math.max(h1, h2);
      } else {
        canvas.width = Math.max(w1, w2);
        canvas.height = h1 + h2;
      }
      const ctx = canvas.getContext("2d");
      if (isHorizontal) {
        ctx.drawImage(img1, 0, 0);
        ctx.drawImage(img2, w1, 0);
      } else {
        ctx.drawImage(img1, 0, 0);
        ctx.drawImage(img2, 0, h1);
      }
      setResultUrl(canvas.toDataURL("image/png"));
    } catch (err) {
      setError("Could not merge images. Use JPG or PNG.");
      console.error(err);
    }
  }, [file1, file2, layout]);

  const handleDownload = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = "fileflip-merged.png";
    a.click();
  }, [resultUrl]);

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
        <Breadcrumb locale={locale} homeLabel={tCommon("breadcrumbHome")} toolsLabel={tCommon("nav.tools")} toolLabel={t("label")} toolPath="merge-images" />
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("metaTitle")}</h1>
          <p className="max-w-xl text-sm text-slate-300">{t("metaDescription")}</p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-5">
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-50">1. First image</p>
                <p className="text-xs text-slate-400">JPG or PNG</p>
              </div>
              <label className="inline-flex cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400">
                Select
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile1} />
              </label>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-50">2. Second image</p>
                <p className="text-xs text-slate-400">JPG or PNG</p>
              </div>
              <label className="inline-flex cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400">
                Select
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile2} />
              </label>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-slate-50">3. Layout</p>
              <div className="flex gap-3">
                <label className="flex cursor-pointer items-center gap-2">
                  <input type="radio" name="layout" checked={layout === "horizontal"} onChange={() => setLayout("horizontal")} className="accent-sky-500" />
                  <span className="text-sm text-slate-200">Horizontal</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input type="radio" name="layout" checked={layout === "vertical"} onChange={() => setLayout("vertical")} className="accent-sky-500" />
                  <span className="text-sm text-slate-200">Vertical</span>
                </label>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={!file1 || !file2}
                onClick={handleMerge}
                className="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400 disabled:opacity-50"
              >
                Merge
              </button>
              {resultUrl && (
                <button type="button" onClick={handleDownload} className="rounded-full border border-sky-400/50 bg-slate-800 px-4 py-2 text-xs font-semibold text-sky-200 hover:bg-slate-700">
                  Download PNG
                </button>
              )}
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            {resultUrl && (
              <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950/60 p-2">
                <p className="mb-2 text-xs text-slate-400">Preview</p>
                <img src={resultUrl} alt="Merged" className="max-h-64 w-auto rounded-lg object-contain" width={400} height={256} loading="lazy" />
              </div>
            )}
          </div>
        </section>

        <RelatedTools locale={locale} currentSlug="merge-images" />
        <FaqSection faqs={getToolFaq("merge-images")} />
      </main>
    </div>
  );
}
