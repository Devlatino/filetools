"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import Papa from "papaparse";
import JSZip from "jszip";
import { getToolFaq } from "@/lib/toolFaqs";
import { FaqSection } from "@/components/FaqSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";

export default function CsvToolsPage() {
  const locale = useLocale();
  const t = useTranslations("tools.csvTools");
  const tCommon = useTranslations("common");
  const [tab, setTab] = useState("merge");
  const [mergeFiles, setMergeFiles] = useState([]);
  const [mergePreview, setMergePreview] = useState(null);
  const [splitFile, setSplitFile] = useState(null);
  const [splitRows, setSplitRows] = useState(1000);
  const [splitPreview, setSplitPreview] = useState(null);
  const [error, setError] = useState("");

  const handleMergeFiles = useCallback((e) => {
    const list = Array.from(e.target.files || []);
    setError("");
    setMergePreview(null);
    if (list.length < 2) {
      setError(t("errorMergeMinFiles"));
      setMergeFiles([]);
      return;
    }
    setMergeFiles(list);
    Papa.parse(list[0], {
      header: true,
      preview: 5,
      complete: (r) => setMergePreview({ headers: r.meta.fields || [], preview: r.data, rowCount: 0 }),
    });
  }, []);

  const handleMerge = useCallback(async () => {
    if (mergeFiles.length < 2) return;
    setError("");
    try {
      const allRows = [];
      let headers = null;
      for (let i = 0; i < mergeFiles.length; i++) {
        const result = await new Promise((res) => Papa.parse(mergeFiles[i], { header: true, complete: res }));
        if (result.errors?.length) throw new Error("Parse error");
        const rows = result.data.filter((r) => Object.keys(r).some((k) => r[k] != null && String(r[k]).trim() !== ""));
        if (i === 0) headers = result.meta.fields || Object.keys(rows[0] || {});
        rows.forEach((row) => allRows.push(row));
      }
      const csv = Papa.unparse(allRows, { columns: headers });
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "merged.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(t("errorMergeFailed"));
    }
  }, [mergeFiles]);

  const handleSplitFile = useCallback((e) => {
    const f = e.target.files?.[0];
    setError("");
    setSplitPreview(null);
    if (!f) {
      setSplitFile(null);
      return;
    }
    setSplitFile(f);
    Papa.parse(f, {
      header: true,
      preview: 10,
      complete: (r) => setSplitPreview({ headers: r.meta.fields || [], preview: r.data, total: r.data.length + (r.meta.fields ? 1 : 0) }),
    });
  }, []);

  const handleSplit = useCallback(async () => {
    if (!splitFile || splitRows < 1) return;
    setError("");
    try {
      const result = await new Promise((res) => Papa.parse(splitFile, { header: true, complete: res }));
      if (result.errors?.length) throw new Error("Parse error");
      const rows = result.data;
      const headers = result.meta.fields || (rows[0] ? Object.keys(rows[0]) : []);
      const zip = new JSZip();
      for (let i = 0; i < rows.length; i += splitRows) {
        const chunk = rows.slice(i, i + splitRows);
        const csv = Papa.unparse(chunk, { columns: headers });
        zip.file(`part-${Math.floor(i / splitRows) + 1}.csv`, csv);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "csv-split.zip";
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (err) {
      setError(t("errorSplitFailed"));
    }
  }, [splitFile, splitRows]);

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
        <Breadcrumb locale={locale} homeLabel={tCommon("breadcrumbHome")} toolsLabel={tCommon("nav.tools")} toolLabel={t("label")} toolPath="csv-tools" />
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("metaTitle")}</h1>
          <p className="max-w-xl text-sm text-slate-300">{t("metaDescription")}</p>
        </section>
        <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-5">
          <div className="flex gap-2 border-b border-slate-700 pb-2">
            <button type="button" onClick={() => setTab("merge")} className={`rounded-full px-4 py-2 text-xs font-semibold ${tab === "merge" ? "bg-sky-500 text-slate-950" : "text-slate-400 hover:text-slate-200"}`}>{t("mergeTitle")}</button>
            <button type="button" onClick={() => setTab("split")} className={`rounded-full px-4 py-2 text-xs font-semibold ${tab === "split" ? "bg-sky-500 text-slate-950" : "text-slate-400 hover:text-slate-200"}`}>{t("splitTitle")}</button>
          </div>
          {tab === "merge" && (
            <>
              <p className="mt-3 text-sm text-slate-300">{t("mergeDesc")}</p>
              <label className="mt-2 inline-flex cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400">
                {t("selectCsvFiles")}
                <input type="file" multiple accept=".csv,text/csv" className="hidden" onChange={handleMergeFiles} />
              </label>
              {mergePreview && (
                <div className="mt-3 rounded-lg border border-slate-700 bg-slate-950/60 p-3">
                  <p className="text-xs text-slate-400">{t("previewFirstFile")} {mergePreview.headers.join(", ")}</p>
                  <p className="text-xs text-slate-500">{mergeFiles.length} file(s) selected.</p>
                  <button type="button" onClick={handleMerge} className="mt-2 rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400">{t("mergeAndDownload")}</button>
                </div>
              )}
            </>
          )}
          {tab === "split" && (
            <>
              <p className="mt-3 text-sm text-slate-300">{t("splitDesc")}</p>
              <label className="mt-2 inline-flex cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400">
                {t("selectCsv")}
                <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleSplitFile} />
              </label>
              {splitFile && (
                <div className="mt-3 space-y-2">
                  <label className="block text-xs text-slate-400">{t("rowsPerFile")}</label>
                  <input type="number" min={1} value={splitRows} onChange={(e) => setSplitRows(Number(e.target.value))} className="w-28 rounded border border-slate-700 bg-slate-950/60 px-2 py-1 text-sm text-slate-200" />
                  {splitPreview && <p className="text-xs text-slate-500">{t("previewLabel")} {splitPreview.headers.join(", ")}</p>}
                  <button type="button" onClick={handleSplit} className="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400">{t("splitAndDownload")}</button>
                </div>
              )}
            </>
          )}
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        </section>
        <RelatedTools locale={locale} currentSlug="csv-tools" />
        <FaqSection namespace="tools.csvTools" faqs={getToolFaq("csv-tools")} />
      </main>
    </div>
  );
}
