"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import PptxGenJS from "pptxgenjs";
import { getToolFaq } from "@/lib/toolFaqs";
import { FaqSection } from "@/components/FaqSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

let pdfjsLib = null;
async function getPdfJs() {
  if (pdfjsLib) return pdfjsLib;
  const mod = await import("pdfjs-dist");
  pdfjsLib = mod.default || mod;
  const v = pdfjsLib.version || "4.0.379";
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${v}/pdf.worker.min.mjs`;
  return pdfjsLib;
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

export default function PdfToPptxPage() {
  const locale = useLocale();
  const t = useTranslations("tools.pdfToPptx");
  const tCommon = useTranslations("common");
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState("");

  const handleFile = useCallback((e) => {
    const f = e.target.files?.[0];
    setError("");
    if (!f) {
      setFile(null);
      return;
    }
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      setError(t("errorSelectPdf"));
      setFile(null);
      return;
    }
    setFile(f);
  }, []);

  const handleConvert = useCallback(async () => {
    if (!file) return;
    setError("");
    setIsConverting(true);
    try {
      const lib = await getPdfJs();
      const data = await file.arrayBuffer();
      const pdf = await lib.getDocument({ data }).promise;
      const numPages = pdf.numPages;
      const pptx = new PptxGenJS();
      const scale = 1.2;

      for (let n = 1; n <= numPages; n++) {
        setProgress(Math.round((n / numPages) * 100));
        const page = await pdf.getPage(n);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: ctx, viewport }).promise;
        const blob = await new Promise((res) => canvas.toBlob((b) => res(b), "image/png", 0.92));
        const b64 = await blobToBase64(blob);
        const slide = pptx.addSlide();
        slide.addImage({
          data: b64,
          x: 0,
          y: 0,
          w: 10,
          h: (10 * viewport.height) / viewport.width,
        });
      }
      setProgress(100);
      const out = await pptx.write({ outputType: "blob" });
      const url = URL.createObjectURL(out);
      const a = document.createElement("a");
      a.href = url;
      a.download = (file.name.replace(/\.pdf$/i, "") || "slides") + ".pptx";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(t("errorConversion"));
      console.error(err);
    } finally {
      setIsConverting(false);
      setProgress(0);
    }
  }, [file]);

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
        <Breadcrumb locale={locale} homeLabel={tCommon("breadcrumbHome")} toolsLabel={tCommon("nav.tools")} toolLabel={t("label")} toolPath="pdf-to-pptx" />
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("metaTitle")}</h1>
          <p className="max-w-xl text-sm text-slate-300">{t("metaDescription")}</p>
        </section>
        <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-slate-50">{t("step1")}</p>
            <label className="inline-flex cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400">
              {t("selectButton")}
              <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={handleFile} />
            </label>
          </div>
          {file && (
            <>
              <p className="mt-2 text-xs text-slate-400">{file.name}</p>
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
        </section>
        <RelatedTools locale={locale} currentSlug="pdf-to-pptx" />
        <FaqSection namespace="tools.pdfToPptx" faqs={getToolFaq("pdf-to-pptx")} />
      </main>
    </div>
  );
}
