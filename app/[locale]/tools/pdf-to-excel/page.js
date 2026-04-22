"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Upload, Loader2, FileSpreadsheet, Download } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import posthog from "posthog-js";

/**
 * Group pdfjs text items into rows by Y position and split rows into
 * columns by detecting gaps in X position. Returns an array of arrays (rows of cells).
 */
function itemsToTable(items) {
  if (!items || items.length === 0) return [];
  const rowMap = new Map();
  for (const it of items) {
    const str = it.str || "";
    if (!str.trim()) continue;
    const y = Math.round((it.transform?.[5] ?? 0) * 2) / 2; // 0.5 precision
    const x = it.transform?.[4] ?? 0;
    const width = it.width ?? 0;
    if (!rowMap.has(y)) rowMap.set(y, []);
    rowMap.get(y).push({ x, xEnd: x + width, str });
  }
  const keys = [...rowMap.keys()].sort((a, b) => b - a);
  const rows = [];
  for (const k of keys) {
    const items = rowMap.get(k).sort((a, b) => a.x - b.x);
    // Merge items with gap > threshold into separate cells
    const cells = [];
    let currentCell = "";
    let prevEnd = null;
    for (const item of items) {
      const gap = prevEnd === null ? 0 : item.x - prevEnd;
      if (gap > 8 && currentCell) {
        cells.push(currentCell.trim());
        currentCell = item.str;
      } else {
        currentCell += item.str;
      }
      prevEnd = item.xEnd;
    }
    if (currentCell.trim()) cells.push(currentCell.trim());
    if (cells.length) rows.push(cells);
  }
  return rows;
}

export default function PdfToExcelPage() {
  const locale = useLocale();
  const t = useTranslations("tools.pdfToExcel");
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
        setError(t("errorGeneric"));
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
    setProgress(t("loading"));
    try {
      const pdfjsLib = await import("pdfjs-dist");
      const XLSX = await import("xlsx");
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

      const workbook = XLSX.utils.book_new();
      for (let i = 1; i <= pdf.numPages; i++) {
        setProgress(t("extractingPage", { current: i, total: pdf.numPages }));
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const rows = itemsToTable(textContent.items || []);
        const aoa = rows.length ? rows : [[""]];
        const ws = XLSX.utils.aoa_to_sheet(aoa);
        XLSX.utils.book_append_sheet(workbook, ws, `Page ${i}`);
      }

      setProgress(t("buildingXlsx"));
      const arrayBufferOut = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([arrayBufferOut], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const base = file.name.replace(/\.pdf$/i, "") || "document";
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${base}.xlsx`;
      a.click();
      URL.revokeObjectURL(a.href);

      posthog.capture("tool_conversion_completed", {
        tool: "pdf-to-excel",
        file_size_bytes: file.size,
        pages: pdf.numPages,
      });
    } catch (err) {
      console.error("pdf-to-excel error:", err);
      posthog.captureException(err, { tool: "pdf-to-excel" });
      posthog.capture("tool_conversion_failed", {
        tool: "pdf-to-excel",
        error: err?.message,
      });
      setError(t("errorGeneric"));
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
          toolPath="pdf-to-excel"
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
                    ? "border-emerald-500 bg-emerald-500/15"
                    : "border-dashed border-emerald-500/70 bg-slate-900/50"
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
                    isDragOver
                      ? "text-emerald-400"
                      : "text-emerald-500/80"
                  }
                />
                <p
                  className={`text-center text-sm font-medium ${
                    isDragOver ? "text-emerald-200" : "text-slate-300"
                  }`}
                >
                  {t("dropzone")}
                </p>
              </label>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-slate-900/50 p-4">
                  <FileSpreadsheet className="h-8 w-8 text-emerald-400" />
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
                <p className="text-xs text-slate-400">{t("sheetsNote")}</p>
                {error && <p className="text-sm text-rose-400">{error}</p>}
                <button
                  type="button"
                  onClick={handleConvert}
                  disabled={isConverting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 font-medium text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
                >
                  {isConverting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {progress || t("converting")}
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      {t("convert")}
                    </>
                  )}
                </button>
              </div>
            )}
          </section>

          <aside className="space-y-8 lg:max-w-[340px]">
            <EditorialSection namespace="tools.pdfToExcel" />
          </aside>
        </div>

        <div className="mt-10">
          <RelatedTools locale={locale} currentSlug="pdf-to-excel" />
        </div>

        <div className="mt-10">
          <FaqSection namespace="tools.pdfToExcel" />
        </div>
      </main>
    </div>
  );
}
