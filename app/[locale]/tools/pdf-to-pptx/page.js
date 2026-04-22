"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Upload, Loader2, FileText, Download } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import posthog from "posthog-js";

const RENDER_SCALE = 1.5;

export default function PdfToPptxPage() {
  const locale = useLocale();
  const t = useTranslations("tools.pdfToPptx");
  const tCommon = useTranslations("common");
  const [file, setFile] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = useCallback(
    (selected) => {
      if (!selected) {
        setFile(null);
        setError("");
        return;
      }
      const isPdf =
        selected.type === "application/pdf" ||
        /\.pdf$/i.test(selected.name);
      if (!isPdf) {
        setError(t("errorSelectPdf"));
        setFile(null);
        return;
      }
      setError("");
      setFile(selected);
    },
    [t]
  );

  const handleFileChange = useCallback(
    (e) => processFile(e.target.files?.[0] ?? null),
    [processFile]
  );
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
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      processFile(e.dataTransfer?.files?.[0] ?? null);
    },
    [processFile]
  );

  const handleConvert = useCallback(async () => {
    if (!file) return;
    setError("");
    setIsConverting(true);
    setProgress("");
    try {
      const pdfjsLib = await import("pdfjs-dist");
      const PptxGenJSModule = await import("pptxgenjs");
      const PptxGenJS = PptxGenJSModule.default || PptxGenJSModule;
      if (
        typeof pdfjsLib.GlobalWorkerOptions !== "undefined" &&
        !pdfjsLib.GlobalWorkerOptions.workerSrc
      ) {
        try {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || "4.10.38"}/pdf.worker.min.mjs`;
        } catch {}
      }
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      const pptx = new PptxGenJS();
      pptx.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 in
      const slideW = 13.333;
      const slideH = 7.5;

      for (let i = 1; i <= pdf.numPages; i++) {
        setProgress(
          t("renderingPage", { current: i, total: pdf.numPages }) ||
            `${i}/${pdf.numPages}`
        );
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: RENDER_SCALE });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        const renderTask = page.render({
          canvasContext: ctx,
          viewport,
        });
        await (renderTask.promise || renderTask);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

        // Fit page into slide while preserving aspect ratio
        const pageRatio = viewport.width / viewport.height;
        const slideRatio = slideW / slideH;
        let w;
        let h;
        if (pageRatio >= slideRatio) {
          w = slideW;
          h = slideW / pageRatio;
        } else {
          h = slideH;
          w = slideH * pageRatio;
        }
        const x = (slideW - w) / 2;
        const y = (slideH - h) / 2;

        const slide = pptx.addSlide();
        slide.background = { color: "FFFFFF" };
        slide.addImage({ data: dataUrl, x, y, w, h });
      }

      setProgress(t("savingPptx") || "Saving…");
      const base = file.name.replace(/\.pdf$/i, "") || "presentation";
      await pptx.writeFile({ fileName: `${base}.pptx` });

      posthog.capture("tool_conversion_completed", {
        tool: "pdf-to-pptx",
        file_size_bytes: file.size,
        pages: pdf.numPages,
      });
    } catch (err) {
      console.error("pdf-to-pptx error:", err);
      posthog.captureException(err, { tool: "pdf-to-pptx" });
      posthog.capture("tool_conversion_failed", {
        tool: "pdf-to-pptx",
        error: err?.message,
      });
      setError(t("errorConversion"));
    } finally {
      setIsConverting(false);
      setProgress("");
    }
  }, [file, t]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href={`/${locale}/`}
            prefetch
            className="flex items-center gap-2"
          >
            <img
              src="/fileflip-logo.svg"
              alt={tCommon("siteName")}
              className="h-11 w-auto"
              width={170}
              height={44}
            />
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
          toolPath="pdf-to-pptx"
        />

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_340px]">
          <section className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {t("metaTitle")}
              </h1>
              <p className="mt-1 text-sm text-slate-300">
                {t("metaDescription")}
              </p>
            </div>

            {!file ? (
              <label
                role="button"
                tabIndex={0}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex h-[200px] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 px-4 transition-colors duration-200 ${
                  isDragOver
                    ? "border-orange-500 bg-orange-500/15"
                    : "border-dashed border-orange-500/70 bg-slate-900/50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="sr-only"
                  onChange={handleFileChange}
                />
                <Upload
                  size={40}
                  strokeWidth={1.5}
                  className={
                    isDragOver ? "text-orange-400" : "text-orange-500/80"
                  }
                />
                <p
                  className={`text-center text-sm font-medium ${
                    isDragOver ? "text-orange-200" : "text-slate-300"
                  }`}
                >
                  {t("selectButton")}
                </p>
              </label>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-slate-900/50 p-4">
                  <FileText className="h-8 w-8 text-orange-400" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-100">
                      {file.name}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => processFile(null)}
                    className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-slate-300 hover:bg-white/10"
                  >
                    {tCommon("changeFile")}
                  </button>
                </div>
                {error && <p className="text-sm text-rose-400">{error}</p>}
                <button
                  type="button"
                  onClick={handleConvert}
                  disabled={isConverting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-medium text-slate-950 hover:bg-orange-400 disabled:opacity-60"
                >
                  {isConverting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {progress || t("step2Convert")}
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      {t("step2Convert")}
                    </>
                  )}
                </button>
              </div>
            )}
          </section>

          <aside className="space-y-8 lg:max-w-[340px]">
            <EditorialSection namespace="tools.pdfToPptx" />
          </aside>
        </div>

        <div className="mt-10">
          <RelatedTools locale={locale} currentSlug="pdf-to-pptx" />
        </div>

        <div className="mt-10">
          <FaqSection namespace="tools.pdfToPptx" />
        </div>
      </main>
    </div>
  );
}
