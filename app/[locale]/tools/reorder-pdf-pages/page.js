"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { PDFDocument } from "@cantoo/pdf-lib";
import { Upload, Loader2, Download } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const THUMB_SCALE = 0.3;

async function renderPageThumbnail(pdfDoc, pageIndex, scale = THUMB_SCALE) {
  const page = await pdfDoc.getPage(pageIndex + 1);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const renderTask = page.render({
    canvasContext: canvas.getContext("2d"),
    viewport,
  });
  await (renderTask.promise || renderTask);
  return canvas.toDataURL();
}

async function reorderPages(file, newOrder) {
  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer);
  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(srcDoc, newOrder);
  copiedPages.forEach((page) => newDoc.addPage(page));
  return await newDoc.save();
}

export default function ReorderPdfPage() {
  const locale = useLocale();
  const t = useTranslations("tools.reorderPdf");
  const tCommon = useTranslations("common");
  const [pdfFile, setPdfFile] = useState(null);
  const [thumbnails, setThumbnails] = useState([]);
  const [order, setOrder] = useState([]);
  const [thumbProgress, setThumbProgress] = useState(0);
  const [isLoadingThumbs, setIsLoadingThumbs] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const dragIndexRef = useRef(null);

  const processFile = useCallback(
    async (file) => {
      if (!file) {
        setPdfFile(null);
        setThumbnails([]);
        setOrder([]);
        return;
      }
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      if (!isPdf) {
        setError(t("errorGeneric"));
        return;
      }
      setError("");
      setPdfFile(file);
      setIsLoadingThumbs(true);
      setThumbProgress(0);
      try {
        const pdfjsLib = await import("pdfjs-dist");
        if (typeof pdfjsLib.GlobalWorkerOptions !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
          try {
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || "4.10.38"}/pdf.worker.min.mjs`;
          } catch {
            // worker optional
          }
        }
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;
        const thumbs = [];
        for (let i = 0; i < numPages; i++) {
          setThumbProgress(Math.round(((i + 1) / numPages) * 100));
          const dataUrl = await renderPageThumbnail(pdf, i, THUMB_SCALE);
          thumbs.push({ dataUrl, pageIndex: i });
        }
        setThumbnails(thumbs);
        setOrder(thumbs.map((t) => t.pageIndex));
      } catch (err) {
        console.error(err);
        setError(t("errorGeneric"));
        setPdfFile(null);
      } finally {
        setIsLoadingThumbs(false);
        setThumbProgress(0);
      }
    },
    [t]
  );

  const handleFileChange = useCallback((e) => processFile(e.target.files?.[0] ?? null), [processFile]);
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

  const handleDragStart = useCallback((index) => {
    dragIndexRef.current = index;
  }, []);
  const handlePreviewDragOver = useCallback((e) => e.preventDefault(), []);
  const handleDropOnCard = useCallback((e, dropIndex) => {
    e.preventDefault();
    const from = dragIndexRef.current;
    if (from == null || from === dropIndex) return;
    setOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(dropIndex, 0, moved);
      return next;
    });
    dragIndexRef.current = null;
  }, []);

  const removePage = useCallback((pageIndexInOrder) => {
    setOrder((prev) => prev.filter((_, i) => i !== pageIndexInOrder));
  }, []);

  const displayItems = order.map((originalIndex) => thumbnails[originalIndex]).filter(Boolean);

  const handleApply = useCallback(async () => {
    if (!pdfFile || order.length === 0) {
      setError(t("errorGeneric"));
      return;
    }
    setError("");
    setIsApplying(true);
    try {
      const pdfBytes = await reorderPages(pdfFile, order);
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const baseName = pdfFile.name.replace(/\.pdf$/i, "");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${baseName}_reordered.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError(t("errorGeneric"));
    } finally {
      setIsApplying(false);
    }
  }, [pdfFile, order, t]);

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
          toolPath="reorder-pdf-pages"
        />

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_340px]">
          <section className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("metaTitle")}</h1>
              <p className="mt-1 text-sm text-slate-300">{t("metaDescription")}</p>
            </div>

            {!pdfFile ? (
              <label
                role="button"
                tabIndex={0}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex h-[200px] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 px-4 transition-colors duration-200 ${
                  isDragOver ? "border-sky-500 bg-sky-500/15" : "border-dashed border-sky-500/70 bg-slate-900/50"
                }`}
              >
                <input ref={fileInputRef} type="file" accept="application/pdf,.pdf" className="sr-only" onChange={handleFileChange} />
                <Upload size={40} strokeWidth={1.5} className={isDragOver ? "text-sky-400" : "text-sky-500/80"} />
                <p className={`text-center text-sm font-medium ${isDragOver ? "text-sky-200" : "text-slate-300"}`}>{t("dropzone")}</p>
              </label>
            ) : isLoadingThumbs ? (
              <div className="space-y-2">
                <p className="text-sm text-slate-300">{t("loading")}</p>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-sky-500 transition-all duration-300" style={{ width: `${thumbProgress}%` }} />
                </div>
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-500">{t("dragHint")}</p>
                <div
                  className="grid gap-3 py-2"
                  style={{ gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" }}
                >
                  {displayItems.map((item, index) => (
                    <div
                      key={item.pageIndex}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={handlePreviewDragOver}
                      onDrop={(e) => handleDropOnCard(e, index)}
                      className="relative cursor-grab overflow-hidden rounded-lg border-2 border-slate-700 bg-[#1a1a2e] transition-colors hover:border-slate-600"
                    >
                      <div className="absolute left-1.5 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[11px] font-medium text-white">
                        {index + 1}
                      </div>
                      <button
                        type="button"
                        onClick={() => removePage(index)}
                        className="absolute right-1.5 top-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-rose-500/80 text-xs leading-none text-white hover:bg-rose-500"
                        aria-label={t("removePage")}
                      >
                        ×
                      </button>
                      <img
                        src={item.dataUrl}
                        alt=""
                        className="block w-full bg-[#111] object-contain"
                        style={{ aspectRatio: "3/4" }}
                        draggable={false}
                      />
                    </div>
                  ))}
                </div>
                {order.length > 0 && (
                  <button
                    type="button"
                    disabled={isApplying}
                    onClick={handleApply}
                    className="flex w-full items-center justify-center gap-3 rounded-xl bg-sky-500 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isApplying ? (
                      <>
                        <Loader2 size={22} className="animate-spin shrink-0" />
                        <span>{t("applying")}</span>
                      </>
                    ) : (
                      <>
                        <Download size={22} strokeWidth={2} className="shrink-0" />
                        <span>{t("apply")}</span>
                      </>
                    )}
                  </button>
                )}
              </>
            )}

            {error && <p className="text-sm text-rose-400">{error}</p>}
          </section>

          <aside className="space-y-8 lg:max-w-[340px]">
            <EditorialSection namespace="tools.reorderPdf" />
          </aside>
        </div>

        <div className="mt-10">
          <RelatedTools locale={locale} currentSlug="reorder-pdf-pages" />
        </div>

        <div className="mt-10">
          <FaqSection namespace="tools.reorderPdf" />
        </div>
      </main>
    </div>
  );
}
