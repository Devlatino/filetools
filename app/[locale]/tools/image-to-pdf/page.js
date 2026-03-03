"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { PDFDocument, degrees } from "pdf-lib";
import { Upload, Loader2, Check, FilePlus } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const convertImagesToPdf = async (pages) => {
  const pdfDoc = await PDFDocument.create();

  for (const pageItem of pages) {
    const { file, rotation } = pageItem;
    const { width, height, dataUrl } = await new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
          dataUrl: objectUrl,
        });
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = objectUrl;
    });
    URL.revokeObjectURL(dataUrl);

    const arrayBuffer = await file.arrayBuffer();
    let embeddedImage;
    if (file.type === "image/png") {
      embeddedImage = await pdfDoc.embedPng(arrayBuffer);
    } else {
      embeddedImage = await pdfDoc.embedJpg(arrayBuffer);
    }

    const isRotated90or270 = rotation === 90 || rotation === 270;
    const pageWidth = isRotated90or270 ? height : width;
    const pageHeight = isRotated90or270 ? width : height;

    const pdfPage = pdfDoc.addPage([pageWidth, pageHeight]);

    if (rotation === 90) {
      pdfPage.drawImage(embeddedImage, {
        x: pageWidth,
        y: 0,
        width: pageHeight,
        height: pageWidth,
        rotate: degrees(90),
      });
    } else if (rotation === 180) {
      pdfPage.drawImage(embeddedImage, {
        x: pageWidth,
        y: pageHeight,
        width: pageWidth,
        height: pageHeight,
        rotate: degrees(180),
      });
    } else if (rotation === 270) {
      pdfPage.drawImage(embeddedImage, {
        x: 0,
        y: pageWidth,
        width: pageHeight,
        height: pageWidth,
        rotate: degrees(270),
      });
    } else {
      pdfPage.drawImage(embeddedImage, {
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
      });
    }
  }

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function StepIndicator({ step1, step2, step3, t }) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold sm:h-8 sm:w-8 ${
            step1 === "done"
              ? "bg-emerald-500 text-slate-950"
              : step1 === "active"
                ? "bg-sky-500 text-slate-950"
                : "bg-slate-700 text-slate-400"
          }`}
        >
          {step1 === "done" ? <Check size={14} strokeWidth={2.5} /> : "1"}
        </span>
        <span
          className={`text-xs font-medium sm:text-sm ${
            step1 === "active" ? "text-sky-300" : step1 === "done" ? "text-emerald-300" : "text-slate-500"
          }`}
        >
          {t("stepIndicatorUpload")}
        </span>
      </div>
      <div className="h-px w-4 bg-slate-600 sm:w-8" aria-hidden />
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold sm:h-8 sm:w-8 ${
            step2 === "done"
              ? "bg-emerald-500 text-slate-950"
              : step2 === "active"
                ? "bg-sky-500 text-slate-950"
                : "bg-slate-700 text-slate-400"
          }`}
        >
          {step2 === "done" ? <Check size={14} strokeWidth={2.5} /> : "2"}
        </span>
        <span
          className={`text-xs font-medium sm:text-sm ${
            step2 === "active" ? "text-sky-300" : step2 === "done" ? "text-emerald-300" : "text-slate-500"
          }`}
        >
          {t("stepIndicatorCreate")}
        </span>
      </div>
      <div className="h-px w-4 bg-slate-600 sm:w-8" aria-hidden />
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold sm:h-8 sm:w-8 ${
            step3 === "done"
              ? "bg-emerald-500 text-slate-950"
              : step3 === "active"
                ? "bg-sky-500 text-slate-950"
                : "bg-slate-700 text-slate-400"
          }`}
        >
          {step3 === "done" ? <Check size={14} strokeWidth={2.5} /> : "3"}
        </span>
        <span
          className={`text-xs font-medium sm:text-sm ${
            step3 === "active" ? "text-sky-300" : step3 === "done" ? "text-emerald-300" : "text-slate-500"
          }`}
        >
          {t("stepIndicatorDownload")}
        </span>
      </div>
    </div>
  );
}

export default function ImageToPdfPage() {
  const locale = useLocale();
  const t = useTranslations("tools.imageToPdf");
  const tCommon = useTranslations("common");
  const tTool = useTranslations("tool");
  const [pages, setPages] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const dragIndex = useRef(null);
  const pagesRef = useRef(pages);
  pagesRef.current = pages;

  useEffect(() => {
    if (pages.length > 0 && currentStep === 1) setCurrentStep(2);
  }, [pages.length, currentStep]);

  useEffect(() => {
    return () => pagesRef.current.forEach((p) => URL.revokeObjectURL(p.previewUrl));
  }, []);

  const processFiles = useCallback(
    (files) => {
      if (!files?.length) return;
      const imageFiles = Array.from(files).filter(
        (f) => f.type === "image/jpeg" || f.type === "image/png" || /\.(jpe?g|png)$/i.test(f.name)
      );
      if (!imageFiles.length) {
        setError(t("errorImageOnly"));
        return;
      }
      setError("");
      const newPages = imageFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        rotation: 0,
      }));
      setPages((prev) => [...prev, ...newPages]);
    },
    [t]
  );

  const handleFileChange = useCallback(
    (e) => {
      processFiles(e.target.files);
      e.target.value = "";
    },
    [processFiles]
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

  const handleDragStart = useCallback((index) => {
    dragIndex.current = index;
  }, []);

  const handlePreviewDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e, index) => {
    e.preventDefault();
    if (dragIndex.current === null || dragIndex.current === index) return;
    setPages((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(dragIndex.current, 1);
      updated.splice(index, 0, moved);
      dragIndex.current = null;
      return updated;
    });
  }, []);

  const rotatePage = useCallback((id, deg) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, rotation: (p.rotation + deg + 360) % 360 } : p
      )
    );
  }, []);

  const removePage = useCallback((id) => {
    setPages((prev) => {
      const page = prev.find((p) => p.id === id);
      if (page) URL.revokeObjectURL(page.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const handleClear = useCallback(() => {
    setPages((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      return [];
    });
    setError("");
    setCurrentStep(1);
  }, []);

  const handleDropZoneDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      processFiles(e.dataTransfer?.files);
    },
    [processFiles]
  );

  const handleCreatePdf = useCallback(async () => {
    if (!pages.length) {
      setError(t("errorSelectFirst"));
      return;
    }
    setError("");
    setIsCreating(true);
    try {
      const pdfBytes = await convertImagesToPdf(pages);
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = t("downloadFilename");
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setCurrentStep(3);
    } catch (err) {
      console.error(err);
      setError(t("errorCreationFailed"));
    } finally {
      setIsCreating(false);
    }
  }, [pages, t]);

  const step1Status = currentStep >= 2 ? "done" : currentStep === 1 ? "active" : "pending";
  const step2Status = currentStep >= 3 ? "done" : currentStep === 2 ? "active" : "pending";
  const step3Status = currentStep === 3 ? "active" : "pending";

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
          toolPath="image-to-pdf"
        />

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_340px]">
          <section className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("metaTitle")}</h1>
              <p className="mt-1 text-sm text-slate-300">{t("metaDescription")}</p>
            </div>

            <StepIndicator step1={step1Status} step2={step2Status} step3={step3Status} t={t} />

            <div className="w-full">
              {pages.length === 0 ? (
                <label
                  role="button"
                  tabIndex={0}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDropZoneDrop}
                  className={`flex h-[200px] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 px-4 transition-colors duration-200 ${
                    isDragOver
                      ? "border-sky-500 bg-sky-500/15"
                      : "border-dashed border-sky-500/70 bg-slate-900/50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                    multiple
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                  <Upload
                    size={40}
                    strokeWidth={1.5}
                    className={isDragOver ? "text-sky-400" : "text-sky-500/80"}
                  />
                  <p className={`text-center text-sm font-medium ${isDragOver ? "text-sky-200" : "text-slate-300"}`}>
                    {isDragOver ? t("releaseToUpload") : tTool("dropZone")}
                  </p>
                </label>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-sm hover:bg-sky-400">
                      {t("addMore")}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                        multiple
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleClear}
                      className="inline-flex items-center rounded-full border border-slate-600 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-100 hover:border-rose-400 hover:text-rose-200"
                    >
                      {t("clearList")}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400">
                    {t("pageCount", { count: pages.length })}
                    {pages.length > 0 && ` · ${formatBytes(pages.reduce((a, p) => a + p.file.size, 0))}`}
                  </p>
                  <p className="text-xs text-slate-500">{t("reorderHint")}</p>
                  <div
                    className="grid gap-3 py-2"
                    style={{
                      gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                    }}
                  >
                    {pages.map((page, index) => (
                      <div
                        key={page.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={handlePreviewDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        className="relative cursor-grab overflow-hidden rounded-lg border-2 border-slate-700 bg-[#1a1a2e] transition-colors hover:border-slate-600"
                      >
                        <div className="absolute left-1.5 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[11px] font-medium text-white">
                          {index + 1}
                        </div>
                        <button
                          type="button"
                          onClick={() => removePage(page.id)}
                          className="absolute right-1.5 top-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-rose-500/80 text-xs leading-none text-white hover:bg-rose-500"
                          aria-label={t("removePage")}
                        >
                          ×
                        </button>
                        <img
                          src={page.previewUrl}
                          alt={page.file.name}
                          className="block w-full bg-[#111] object-contain transition-transform duration-200"
                          style={{
                            aspectRatio: "3/4",
                            transform: `rotate(${page.rotation}deg)`,
                          }}
                          draggable={false}
                        />
                        <div className="flex justify-center gap-2 bg-[#111] p-1.5">
                          <button
                            type="button"
                            onClick={() => rotatePage(page.id, -90)}
                            title={t("rotateLeft")}
                            className="rounded border-none bg-slate-700 px-2 py-1 text-sm text-white transition hover:bg-slate-600"
                          >
                            ↺
                          </button>
                          <button
                            type="button"
                            onClick={() => rotatePage(page.id, 90)}
                            title={t("rotateRight")}
                            className="rounded border-none bg-slate-700 px-2 py-1 text-sm text-white transition hover:bg-slate-600"
                          >
                            ↻
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && <p className="text-sm text-rose-400">{error}</p>}

            {pages.length > 0 && (
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={isCreating}
                  onClick={handleCreatePdf}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-sky-500 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isCreating ? (
                    <>
                      <Loader2 size={22} className="animate-spin shrink-0" />
                      <span>{t("creatingLabel")}</span>
                    </>
                  ) : (
                    <>
                      <FilePlus size={22} strokeWidth={2} className="shrink-0" />
                      <span>{t("createPdfButton")}</span>
                    </>
                  )}
                </button>
                {currentStep === 3 && (
                  <p className="text-center text-sm text-emerald-300">{t("step3Description")}</p>
                )}
              </div>
            )}
          </section>

          <aside className="space-y-8 lg:max-w-[340px]">
            <EditorialSection namespace="tools.imageToPdf" />
          </aside>
        </div>

        <div className="mt-10">
          <RelatedTools locale={locale} currentSlug="image-to-pdf" />
        </div>

        <div className="mt-10">
          <FaqSection namespace="tools.imageToPdf" />
        </div>
      </main>
    </div>
  );
}
