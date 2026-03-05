"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Upload, Loader2, FileSpreadsheet } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SchemaMarkup } from "@/components/SchemaMarkup";

async function handleConvert(file) {
  const XLSX = await import("xlsx");
  const { jsPDF } = await import("jspdf");
  await import("jspdf-autotable");

  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  let isFirstSheet = true;

  workbook.SheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

    if (data.length === 0) return;

    if (!isFirstSheet) doc.addPage();
    isFirstSheet = false;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(sheetName, 14, 12);

    const headers = data[0].map((h) => String(h));
    const rows = data.slice(1).map((row) => headers.map((_, i) => String(row[i] ?? "")));

    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 16,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 14, right: 14 },
    });
  });

  doc.save(file.name.replace(/\.(xlsx|xls)$/i, ".pdf"));
}

export default function ExcelToPdfPage() {
  const locale = useLocale();
  const t = useTranslations("tools.excelToPdf");
  const tCommon = useTranslations("common");
  const [file, setFile] = useState(null);
  const [sheetCount, setSheetCount] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = useCallback(
    (selectedFile) => {
      if (!selectedFile) {
        setFile(null);
        setSheetCount(0);
        setError("");
        return;
      }
      const isExcel =
        selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        selectedFile.type === "application/vnd.ms-excel" ||
        /\.(xlsx|xls)$/i.test(selectedFile.name);
      if (!isExcel) {
        setError(t("errorGeneric"));
        setFile(null);
        setSheetCount(0);
        return;
      }
      setError("");
      setFile(selectedFile);
      selectedFile.arrayBuffer().then(async (buf) => {
        try {
          const XLSX = await import("xlsx");
          const wb = XLSX.read(buf, { type: "array" });
          setSheetCount(wb.SheetNames.length);
        } catch {
          setSheetCount(0);
        }
      }).catch(() => setSheetCount(0));
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

  const onConvert = useCallback(async () => {
    if (!file) {
      setError(t("errorGeneric"));
      return;
    }
    setError("");
    setIsConverting(true);
    try {
      await handleConvert(file);
    } catch (err) {
      console.error(err);
      setError(t("errorGeneric"));
    } finally {
      setIsConverting(false);
    }
  }, [file, t]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <SchemaMarkup
        title={t("metaTitle")}
        description={t("metaDescription")}
        slug="excel-to-pdf"
        locale={locale}
      />
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href={`/${locale}/`} prefetch className="flex items-center gap-2">
            <img src="/fileflip-logo.svg" alt={tCommon("siteName")} className="h-11 w-auto" width={170} height={44} />
            <span className="text-sm text-slate-400">{t("title")}</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumb
          locale={locale}
          homeLabel={tCommon("breadcrumbHome")}
          toolsLabel={tCommon("nav.tools")}
          toolLabel={t("title")}
          toolPath="excel-to-pdf"
        />

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_340px]">
          <section className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("metaTitle")}</h1>
              <p className="mt-1 text-sm text-slate-300">{t("description")}</p>
            </div>

            {!file ? (
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
                <Upload className="h-10 w-10 text-sky-400" strokeWidth={1.5} />
                <span className="text-center text-sm text-slate-300">{t("dropzone")}</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-slate-900/50 p-4">
                  <FileSpreadsheet className="h-8 w-8 text-emerald-500" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-100">{file.name}</p>
                    <p className="text-sm text-slate-400">
                      {sheetCount > 0 ? `${sheetCount} ${sheetCount === 1 ? "sheet" : "sheets"}` : "—"}
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
                {error && <p className="text-sm text-red-400">{error}</p>}
                <button
                  type="button"
                  onClick={onConvert}
                  disabled={isConverting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 font-medium text-slate-950 hover:bg-sky-400 disabled:opacity-60"
                >
                  {isConverting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {t("converting")}
                    </>
                  ) : (
                    t("convert")
                  )}
                </button>
              </div>
            )}
          </section>
          <aside className="space-y-8 lg:max-w-[340px]">
            <EditorialSection namespace="tools.excelToPdf" />
          </aside>
        </div>

        <div className="mt-10">
          <RelatedTools locale={locale} currentSlug="excel-to-pdf" />
        </div>

        <div className="mt-10">
          <FaqSection namespace="tools.excelToPdf" />
        </div>
      </main>
    </div>
  );
}
