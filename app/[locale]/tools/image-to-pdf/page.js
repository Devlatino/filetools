"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { PDFDocument } from "pdf-lib";
import { Upload, Loader2, Check, Download, FilePlus } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

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
  const [items, setItems] = useState([]);
  const [draggingId, setDraggingId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (items.length > 0 && currentStep === 1) setCurrentStep(2);
  }, [items.length, currentStep]);

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
      const mapped = imageFiles.map((file, index) => ({
        id: `${file.name}-${file.size}-${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
        file,
      }));
      setItems((prev) => [...prev, ...mapped]);
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
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      processFiles(e.dataTransfer?.files);
    },
    [processFiles]
  );

  const handleReorderDragStart = useCallback((id) => setDraggingId(id), []);
  const handleReorderDragOver = useCallback((e, overId) => {
    e.preventDefault();
    if (!draggingId || draggingId === overId) return;
    setItems((prev) => {
      const i = prev.findIndex((x) => x.id === draggingId);
      const j = prev.findIndex((x) => x.id === overId);
      if (i === -1 || j === -1) return prev;
      const next = [...prev];
      const [removed] = next.splice(i, 1);
      next.splice(j, 0, removed);
      return next;
    });
  }, [draggingId]);
  const handleReorderDragEnd = useCallback(() => setDraggingId(null), []);

  const handleClear = useCallback(() => {
    setItems([]);
    setError("");
    setCurrentStep(1);
  }, []);

  const handleRemove = useCallback((id) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const handleCreatePdf = useCallback(async () => {
    if (!items.length) {
      setError(t("errorSelectFirst"));
      return;
    }
    setError("");
    setIsCreating(true);
    try {
      const pdfDoc = await PDFDocument.create();
      for (const item of items) {
        const bytes = await item.file.arrayBuffer();
        const uint8 = new Uint8Array(bytes);
        const isPng = item.file.type === "image/png";
        const image = isPng ? await pdfDoc.embedPng(uint8) : await pdfDoc.embedJpg(uint8);
        const page = pdfDoc.addPage({ width: image.width, height: image.height });
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
      }
      const pdfBytes = await pdfDoc.save();
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
  }, [items, t]);

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
              {items.length === 0 ? (
                <label
                  role="button"
                  tabIndex={0}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
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
                    className="hidden"
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
                      {t("addImagesButton")}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                        multiple
                        className="hidden"
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
                    {t("imagesCount", { count: items.length, total: formatBytes(items.reduce((a, i) => a + i.file.size, 0)) })}
                  </p>
                  <ul className="max-h-[280px] space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-slate-900/60 p-2">
                    {items.map((item, index) => (
                      <li
                        key={item.id}
                        draggable
                        onDragStart={() => handleReorderDragStart(item.id)}
                        onDragOver={(e) => handleReorderDragOver(e, item.id)}
                        onDragEnd={handleReorderDragEnd}
                        className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs ${
                          draggingId === item.id ? "bg-sky-500/10" : "bg-slate-800/80"
                        }`}
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-700 text-slate-200">
                          {index + 1}
                        </span>
                        <span className="min-w-0 truncate text-slate-100">{item.name}</span>
                        <span className="shrink-0 text-slate-400">{formatBytes(item.file.size)}</span>
                        <button
                          type="button"
                          onClick={() => handleRemove(item.id)}
                          className="shrink-0 text-slate-400 hover:text-rose-400"
                          aria-label={t("removeImage")}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {error && <p className="text-sm text-rose-400">{error}</p>}

            {items.length > 0 && (
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
