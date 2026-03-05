"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import Papa from "papaparse";
import { Upload, Loader2, FileSpreadsheet } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const SEPARATORS = { comma: ",", semicolon: ";", tab: "\t" };

async function convertCsvToPdf(file, options = {}) {
  const { jsPDF } = await import("jspdf");
  await import("jspdf-autotable");

  const text = await file.text();
  const separator = options.separator ?? ",";

  const result = Papa.parse(text, {
    delimiter: separator,
    header: false,
    skipEmptyLines: true,
  });

  if (!result.data || result.data.length === 0) {
    throw new Error("Empty or invalid CSV file");
  }

  const headers = result.data[0].map((h) => String(h));
  const rows = result.data.slice(1).map((row) => headers.map((_, i) => String(row[i] ?? "")));

  const doc = new jsPDF({
    orientation: options.orientation || "landscape",
    unit: "mm",
    format: "a4",
  });

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(file.name.replace(/\.csv$/i, ""), 14, 12);

  doc.autoTable({
    head: [headers],
    body: rows,
    startY: 18,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: {
      fillColor: [39, 174, 96],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 14, right: 14 },
  });

  doc.save(file.name.replace(/\.csv$/i, ".pdf"));
}

export default function CsvToPdfPage() {
  const locale = useLocale();
  const t = useTranslations("tools.csvToPdf");
  const tCommon = useTranslations("common");
  const [file, setFile] = useState(null);
  const [parsed, setParsed] = useState({ data: [], rows: 0, cols: 0 });
  const [separator, setSeparator] = useState("comma");
  const [orientation, setOrientation] = useState("landscape");
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState("");
  const [convertedStats, setConvertedStats] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = useCallback(
    (selectedFile) => {
      if (!selectedFile) {
        setFile(null);
        setParsed({ data: [], rows: 0, cols: 0 });
        setError("");
        setConvertedStats(null);
        return;
      }
      if (
        selectedFile.type !== "text/csv" &&
        selectedFile.type !== "application/csv" &&
        !selectedFile.name.toLowerCase().endsWith(".csv")
      ) {
        setError(t("errorGeneric"));
        setFile(null);
        return;
      }
      setError("");
      setConvertedStats(null);
      setFile(selectedFile);
      selectedFile.text().then((text) => {
        const sep = SEPARATORS[separator] || ",";
        const result = Papa.parse(text, { delimiter: sep, header: false, skipEmptyLines: true });
        const data = result.data || [];
        const rows = Math.max(0, data.length - 1);
        const cols = data[0] ? data[0].length : 0;
        setParsed({ data, rows, cols });
      }).catch(() => setParsed({ data: [], rows: 0, cols: 0 }));
    },
    [t, separator]
  );

  const previewRows = useMemo(() => parsed.data.slice(0, 3), [parsed.data]);

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

  const onSeparatorChange = useCallback((e) => {
    const v = e.target.value;
    setSeparator(v);
    if (file) {
      file.text().then((text) => {
        const sep = SEPARATORS[v] || ",";
        const result = Papa.parse(text, { delimiter: sep, header: false, skipEmptyLines: true });
        const data = result.data || [];
        setParsed({
          data,
          rows: Math.max(0, data.length - 1),
          cols: data[0] ? data[0].length : 0,
        });
      });
    }
  }, [file]);

  const onConvert = useCallback(async () => {
    if (!file) {
      setError(t("errorGeneric"));
      return;
    }
    if (parsed.rows === 0 && parsed.data.length <= 1) {
      setError(t("errorEmpty"));
      return;
    }
    setError("");
    setIsConverting(true);
    setConvertedStats(null);
    try {
      await convertCsvToPdf(file, {
        separator: SEPARATORS[separator] || ",",
        orientation,
      });
      setConvertedStats({ rows: parsed.rows, cols: parsed.cols });
    } catch (err) {
      console.error(err);
      setError(err.message && err.message.includes("Empty") ? t("errorEmpty") : t("errorGeneric"));
    } finally {
      setIsConverting(false);
    }
  }, [file, parsed, separator, orientation, t]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
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
          toolPath="csv-to-pdf"
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
                  accept=".csv,text/csv"
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
                      {parsed.rows} rows × {parsed.cols} columns
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

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-300">{t("separator")}</label>
                    <select
                      value={separator}
                      onChange={onSeparatorChange}
                      className="w-full rounded-lg border border-white/20 bg-slate-900 px-3 py-2 text-slate-100"
                    >
                      <option value="comma">{t("separatorComma")}</option>
                      <option value="semicolon">{t("separatorSemicolon")}</option>
                      <option value="tab">{t("separatorTab")}</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-300">{t("orientation")}</label>
                    <select
                      value={orientation}
                      onChange={(e) => setOrientation(e.target.value)}
                      className="w-full rounded-lg border border-white/20 bg-slate-900 px-3 py-2 text-slate-100"
                    >
                      <option value="landscape">{t("landscape")}</option>
                      <option value="portrait">{t("portrait")}</option>
                    </select>
                  </div>
                </div>

                {previewRows.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-slate-300">{t("previewLabel")}</p>
                    <div className="overflow-x-auto rounded-lg border border-white/10 bg-slate-900/50 p-3">
                      <table className="min-w-full text-xs text-slate-300">
                        <tbody>
                          {previewRows.map((row, i) => (
                            <tr key={i}>
                              {row.map((cell, j) => (
                                <td key={j} className="border border-white/10 px-2 py-1">
                                  {String(cell)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

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

                {convertedStats && (
                  <p className="text-sm text-slate-400">
                    {convertedStats.rows} rows × {convertedStats.cols} columns converted.
                  </p>
                )}
              </div>
            )}
          </section>
          <aside className="space-y-6">
            <FaqSection namespace="tools.csvToPdf" />
            <RelatedTools locale={locale} currentSlug="csv-to-pdf" />
          </aside>
        </div>
      </main>
    </div>
  );
}
