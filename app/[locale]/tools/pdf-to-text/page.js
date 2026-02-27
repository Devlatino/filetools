"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { getToolFaq } from "@/lib/toolFaqs";
import { FaqSection } from "@/components/FaqSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";

let pdfjsLib = null;
async function getPdfJs() {
  if (pdfjsLib) return pdfjsLib;
  const mod = await import("pdfjs-dist");
  pdfjsLib = mod.default || mod;
  const version = pdfjsLib.version || "4.0.379";
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`;
  return pdfjsLib;
}

export default function PdfToTextPage() {
  const locale = useLocale();
  const t = useTranslations("tools.pdfToText");
  const tCommon = useTranslations("common");
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = useCallback((e) => {
    const f = e.target.files?.[0];
    setError("");
    setText("");
    if (!f) {
      setFile(null);
      return;
    }
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a PDF file.");
      setFile(null);
      return;
    }
    setFile(f);
  }, []);

  const handleExtract = useCallback(async () => {
    if (!file) return;
    setError("");
    setIsExtracting(true);
    setText("");
    try {
      const lib = await getPdfJs();
      const data = await file.arrayBuffer();
      const pdf = await lib.getDocument({ data }).promise;
      const numPages = pdf.numPages;
      const parts = [];
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => item.str || "").join(" ");
        parts.push(pageText);
      }
      setText(parts.join("\n\n"));
    } catch (err) {
      setError("Could not extract text. Try another PDF.");
      console.error(err);
    } finally {
      setIsExtracting(false);
    }
  }, [file]);

  const handleCopy = useCallback(() => {
    if (!text) return;
    navigator.clipboard.writeText(text);
  }, [text]);

  const handleDownload = useCallback(() => {
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(file?.name || "document").replace(/\.pdf$/i, "")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [text, file]);

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
        <Breadcrumb locale={locale} homeLabel={tCommon("breadcrumbHome")} toolsLabel={tCommon("nav.tools")} toolLabel={t("label")} toolPath="pdf-to-text" />
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("metaTitle")}</h1>
          <p className="max-w-xl text-sm text-slate-300">{t("metaDescription")}</p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-5">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-50">1. Upload PDF</p>
                <p className="text-xs text-slate-400">Text will be extracted from all pages</p>
              </div>
              <label className="inline-flex cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400">
                Select PDF
                <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={!file || isExtracting}
                onClick={handleExtract}
                className="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400 disabled:opacity-50"
              >
                {isExtracting ? "Extracting…" : "Extract text"}
              </button>
              {text && (
                <>
                  <button type="button" onClick={handleCopy} className="rounded-full border border-sky-400/50 bg-slate-800 px-4 py-2 text-xs font-semibold text-sky-200 hover:bg-slate-700">
                    Copy
                  </button>
                  <button type="button" onClick={handleDownload} className="rounded-full border border-sky-400/50 bg-slate-800 px-4 py-2 text-xs font-semibold text-sky-200 hover:bg-slate-700">
                    Download .txt
                  </button>
                </>
              )}
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            {text && (
              <textarea
                readOnly
                value={text}
                className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-200 min-h-[200px] font-mono"
                rows={12}
              />
            )}
          </div>
        </section>

        <RelatedTools locale={locale} currentSlug="pdf-to-text" />
        <FaqSection faqs={getToolFaq("pdf-to-text")} />
      </main>
    </div>
  );
}
