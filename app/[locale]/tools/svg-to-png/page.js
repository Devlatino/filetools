"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { getToolFaq } from "@/lib/toolFaqs";
import { FaqSection } from "@/components/FaqSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";

export default function SvgToPngPage() {
  const locale = useLocale();
  const t = useTranslations("tools.svgToPng");
  const tCommon = useTranslations("common");
  const [file, setFile] = useState(null);
  const [objectUrl, setObjectUrl] = useState("");
  const [width, setWidth] = useState(800);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = useCallback((e) => {
    const f = e.target.files?.[0];
    setError("");
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setObjectUrl("");
    setPreviewUrl("");
    if (!f) {
      setFile(null);
      return;
    }
    if (!f.type?.includes("svg")) {
      setError("Please select an SVG file.");
      setFile(null);
      return;
    }
    setFile(f);
    setObjectUrl(URL.createObjectURL(f));
  }, [objectUrl]);

  const drawPreview = useCallback(() => {
    if (!objectUrl || !width) return;
    setError("");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const scale = width / img.width;
      const height = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      setPreviewUrl(canvas.toDataURL("image/png"));
    };
    img.onerror = () => setError("Could not load SVG.");
    img.src = objectUrl;
  }, [objectUrl, width]);

  const handleDownload = useCallback(() => {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `${(file?.name || "image").replace(/\.svg$/i, "")}.png`;
    a.click();
  }, [previewUrl, file]);

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
          toolPath="svg-to-png"
        />
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("metaTitle")}
          </h1>
          <p className="max-w-xl text-sm text-slate-300">{t("metaDescription")}</p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-5">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-50">1. Upload SVG</p>
                <p className="text-xs text-slate-400">Single SVG file</p>
              </div>
              <label className="inline-flex cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-sm hover:bg-sky-400">
                Select SVG
                <input
                  type="file"
                  accept="image/svg+xml,.svg"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            {file && (
              <>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <label className="text-sm font-medium text-slate-50">
                    2. Output width (px)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={4000}
                    value={width}
                    onChange={(e) => setWidth(Math.max(1, parseInt(e.target.value, 10) || 800))}
                    className="w-28 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100"
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={drawPreview}
                    className="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400"
                  >
                    Generate preview
                  </button>
                  {previewUrl && (
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="rounded-full border border-sky-400/50 bg-slate-800 px-4 py-2 text-xs font-semibold text-sky-200 hover:bg-slate-700"
                    >
                      Download PNG
                    </button>
                  )}
                </div>
              </>
            )}
            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}
            {previewUrl && (
              <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950/60 p-2">
                <p className="mb-2 text-xs text-slate-400">Preview</p>
                <img
                  src={previewUrl}
                  alt="PNG preview"
                  className="max-h-64 w-auto rounded-lg object-contain"
                  width={width}
                  height={200}
                  loading="lazy"
                />
              </div>
            )}
          </div>
        </section>

        <RelatedTools locale={locale} currentSlug="svg-to-png" />
        <FaqSection faqs={getToolFaq("svg-to-png")} />
      </main>
    </div>
  );
}
