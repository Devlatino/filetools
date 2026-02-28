"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { PDFDocument } from "pdf-lib";
import { FaqSection } from "@/components/FaqSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ToolSteps } from "@/components/ToolSteps";
import { Loader2, Check, Download } from "lucide-react";

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default function MergePdfPage() {
  const locale = useLocale();
  const tCommon = useTranslations("common");
  const t = useTranslations("tools.mergePdf");
  const [items, setItems] = useState([]);
  const [draggingId, setDraggingId] = useState(null);
  const [isMerging, setIsMerging] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [mergeSuccess, setMergeSuccess] = useState(null);

  const totalSize = useMemo(
    () => items.reduce((acc, item) => acc + (item.file?.size || 0), 0),
    [items]
  );

  const handleFilesChange = useCallback((event) => {
    const files = Array.from(event.target.files || []);
    setError("");
    if (!files.length) return;

    const pdfFiles = files.filter((f) => f.type === "application/pdf");
    if (!pdfFiles.length) {
      setError(t("errorPdfOnly"));
      return;
    }

    const mapped = pdfFiles.map((file, index) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      file,
    }));

    setItems((prev) => [...prev, ...mapped]);
  }, [t]);

  useEffect(() => {
    if (items.length >= 2 && currentStep === 1) setCurrentStep(2);
  }, [items.length, currentStep]);

  const handleDragStart = useCallback((id) => {
    setDraggingId(id);
  }, []);

  const handleDragOver = useCallback((event, overId) => {
    event.preventDefault();
    if (!draggingId || draggingId === overId) return;

    setItems((prev) => {
      const draggingIndex = prev.findIndex((i) => i.id === draggingId);
      const overIndex = prev.findIndex((i) => i.id === overId);
      if (draggingIndex === -1 || overIndex === -1) return prev;

      const updated = [...prev];
      const [removed] = updated.splice(draggingIndex, 1);
      updated.splice(overIndex, 0, removed);
      return updated;
    });
  }, [draggingId]);

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
  }, []);

  const handleClear = useCallback(() => {
    setItems([]);
    setError("");
    setCurrentStep(1);
    setMergeSuccess(null);
  }, []);

  const handleMerge = useCallback(async () => {
    if (!items.length) {
      setError(t("errorMinTwo"));
      return;
    }
    if (items.length < 2) {
      setError(t("errorMinTwoAlt"));
      return;
    }

    setIsMerging(true);
    setError("");

    try {
      const mergedPdf = await PDFDocument.create();

      for (const item of items) {
        const arrayBuffer = await item.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(
          pdf,
          pdf.getPageIndices()
        );
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setMergeSuccess({ inputSize: totalSize, outputSize: pdfBytes.length });

      const a = document.createElement("a");
      a.href = url;
      a.download = `fileflip-merged-${items.length}-files.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setCurrentStep(3);
    } catch (err) {
      console.error(err);
      setError(t("errorGeneric"));
    } finally {
      setIsMerging(false);
    }
  }, [items, totalSize, t]);

  const mergeSuccessMessage = useMemo(() => {
    if (!mergeSuccess) return null;
    const { inputSize, outputSize } = mergeSuccess;
    const ratio = inputSize > 0 ? (1 - outputSize / inputSize) * 100 : 0;
    const percent = Math.round(Math.max(0, ratio));
    return tCommon("successSaved", {
      original: formatBytes(inputSize),
      result: formatBytes(outputSize),
      percent,
    });
  }, [mergeSuccess, tCommon]);

  const mergeDownloadSubline = useMemo(() => {
    if (!mergeSuccess) return null;
    const { inputSize, outputSize } = mergeSuccess;
    const ratio = inputSize > 0 ? (1 - outputSize / inputSize) * 100 : 0;
    const percent = Math.round(Math.max(0, ratio));
    return tCommon("downloadSubline", {
      percent,
      result: formatBytes(mergeSuccess.outputSize),
    });
  }, [mergeSuccess, tCommon]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href={`/${locale}/`} prefetch className="flex items-center gap-2">
            <img src="/fileflip-logo.svg" alt={tCommon("siteName")} className="h-9 w-auto" width={140} height={36} />
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
          toolPath="merge-pdf"
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

            <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-6">
          <ToolSteps currentStep={currentStep}>
            <ToolSteps.Step title={t("step1Title")}>
              <p className="text-xs text-slate-400">{t("step1Hint")}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-sm hover:bg-sky-400">
                  {t("addPdfsButton")}
                  <input
                    type="file"
                    multiple
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleFilesChange}
                  />
                </label>
                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="inline-flex items-center justify-center rounded-full border border-slate-600 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-100 hover:border-rose-400 hover:text-rose-200"
                  >
                    {t("clearList")}
                  </button>
                )}
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                {items.length > 0 ? t("pdfsCountTotal", { count: items.length, total: formatBytes(totalSize) }) : t("noPdfsAdded")}
              </p>
            </ToolSteps.Step>
            <ToolSteps.Step title={t("step2Title")}>
              <p className="text-xs text-slate-400">{t("step2Hint")}</p>
              <div className="mt-2 rounded-xl border border-white/10 bg-slate-900/60">
                {items.length === 0 ? (
                  <div className="flex items-center justify-center px-4 py-10 text-xs text-slate-500">
                    {t("pdfsPlaceholder")}
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-800">
                    {items.map((item, index) => (
                      <li
                        key={item.id}
                        draggable
                        onDragStart={() => handleDragStart(item.id)}
                        onDragOver={(e) => handleDragOver(e, item.id)}
                        onDragEnd={handleDragEnd}
                        className={`flex cursor-move items-center justify-between gap-3 px-4 py-3 text-xs transition-colors ${
                          draggingId === item.id ? "bg-sky-500/10" : "hover:bg-slate-800/80"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[11px] text-slate-200">
                            {index + 1}
                          </span>
                          <div className="flex flex-col">
                            <span className="max-w-xs truncate text-slate-100 sm:max-w-sm">{item.name}</span>
                            <span className="text-[11px] text-slate-400">{formatBytes(item.size)}</span>
                          </div>
                        </div>
                        <span className="hidden text-[10px] text-slate-500 sm:inline">{t("dragToMove")}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="mt-3 space-y-2">
                <button
                  type="button"
                  disabled={items.length < 2 || isMerging}
                  onClick={handleMerge}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-500 px-5 py-2 text-xs font-semibold text-slate-950 shadow-sm hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isMerging ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      {tCommon("processingLabel")}
                    </>
                  ) : (
                    t("mergeButton")
                  )}
                </button>
                {isMerging && (
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
                    <div className="h-full w-full animate-[progress-bar_1.2s_ease-in-out_infinite] rounded-full bg-sky-500" style={{ transformOrigin: "left" }} />
                  </div>
                )}
                {mergeSuccessMessage && !isMerging && (
                  <p className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                    <Check size={14} className="shrink-0" />
                    {mergeSuccessMessage}
                  </p>
                )}
              </div>
            </ToolSteps.Step>
            <ToolSteps.Step title={t("step3Title")}>
              <p className="text-xs text-slate-400">
                {t("step3Description")}
              </p>
              {mergeSuccess && (
                <div className="mt-3 animate-download-enter">
                  <button
                    type="button"
                    disabled={isMerging}
                    onClick={handleMerge}
                    className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 hover:shadow-emerald-400/30 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Download size={20} strokeWidth={2} />
                    {t("downloadMergedButton")}
                  </button>
                  {mergeDownloadSubline && (
                    <p className="mt-1.5 text-[11px] text-emerald-200/90">{mergeDownloadSubline}</p>
                  )}
                </div>
              )}
            </ToolSteps.Step>
          </ToolSteps>
          {error && <p className="mt-4 text-xs text-rose-400">{error}</p>}
            </section>
          </section>

          <aside className="space-y-8 lg:max-w-[340px]">
            <EditorialSection namespace="tools.mergePdf" />
            <FaqSection namespace="tools.mergePdf" />
            <RelatedTools locale={locale} currentSlug="merge-pdf" />
          </aside>
        </div>
      </main>
    </div>
  );
}
