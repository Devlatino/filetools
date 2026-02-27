"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import JSZip from "jszip";
import { getToolFaq } from "@/lib/toolFaqs";
import { FaqSection } from "@/components/FaqSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";

const SIZES = [16, 32, 48, 180];

function resizeToBlob(img, size) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, size, size);
    canvas.toBlob((blob) => resolve(blob), "image/png", 0.9);
  });
}

export default function FaviconGeneratorPage() {
  const locale = useLocale();
  const t = useTranslations("tools.faviconGenerator");
  const tCommon = useTranslations("common");
  const [file, setFile] = useState(null);
  const [objectUrl, setObjectUrl] = useState("");
  const [blobs, setBlobs] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = useCallback((e) => {
    const f = e.target.files?.[0];
    setError("");
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setObjectUrl("");
    setBlobs(null);
    if (!f) {
      setFile(null);
      return;
    }
    if (!["image/jpeg", "image/png"].includes(f.type)) {
      setError("Use PNG or JPG.");
      setFile(null);
      return;
    }
    setFile(f);
    setObjectUrl(URL.createObjectURL(f));
  }, [objectUrl]);

  const handleGenerate = useCallback(async () => {
    if (!objectUrl) return;
    setError("");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = async () => {
      const results = await Promise.all(SIZES.map((s) => resizeToBlob(img, s)));
      setBlobs(SIZES.map((size, i) => ({ size, blob: results[i] })));
    };
    img.onerror = () => setError("Could not load image.");
    img.src = objectUrl;
  }, [objectUrl]);

  const handleDownloadOne = useCallback((size, blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `favicon-${size}x${size}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleDownloadZip = useCallback(async () => {
    if (!blobs) return;
    const zip = new JSZip();
    blobs.forEach(({ size, blob }) => zip.file(`favicon-${size}x${size}.png`, blob));
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = "favicons.zip";
    a.click();
    URL.revokeObjectURL(url);
  }, [blobs]);

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
        <Breadcrumb locale={locale} homeLabel={tCommon("breadcrumbHome")} toolsLabel={tCommon("nav.tools")} toolLabel={t("label")} toolPath="favicon-generator" />
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("metaTitle")}</h1>
          <p className="max-w-xl text-sm text-slate-300">{t("metaDescription")}</p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-5">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-50">1. Upload image</p>
                <p className="text-xs text-slate-400">PNG or JPG (square works best)</p>
              </div>
              <label className="inline-flex cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400">
                Select image
                <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
            {file && (
              <>
                <button type="button" onClick={handleGenerate} className="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400">
                  Generate favicons
                </button>
                {blobs && (
                  <>
                    <button type="button" onClick={handleDownloadZip} className="ml-3 rounded-full border border-sky-400/50 bg-slate-800 px-4 py-2 text-xs font-semibold text-sky-200 hover:bg-slate-700">
                      Download all as ZIP
                    </button>
                    <div className="mt-4 flex flex-wrap gap-4">
                      {blobs.map(({ size, blob }) => (
                        <div key={size} className="flex flex-col items-center gap-2">
                          <img src={URL.createObjectURL(blob)} alt={`${size}x${size}`} className="rounded border border-slate-700" width={size} height={size} />
                          <button type="button" onClick={() => handleDownloadOne(size, blob)} className="text-xs text-sky-400 hover:text-sky-300">
                            {size}×{size}
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>
        </section>

        <RelatedTools locale={locale} currentSlug="favicon-generator" />
        <FaqSection faqs={getToolFaq("favicon-generator")} />
      </main>
    </div>
  );
}
