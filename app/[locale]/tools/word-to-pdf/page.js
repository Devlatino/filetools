"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import mammoth from "mammoth";
import { Upload, Loader2, FileText } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function WordToPdfPage() {
  const locale = useLocale();
  const t = useTranslations("tools.wordToPdf");
  const tCommon = useTranslations("common");
  const [docxFile, setDocxFile] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = useCallback(
    (file) => {
      if (!file) {
        setDocxFile(null);
        setError("");
        return;
      }
      const isDocx =
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.name.toLowerCase().endsWith(".docx");
      if (!isDocx) {
        setError(t("errorGeneric"));
        setDocxFile(null);
        return;
      }
      setError("");
      setDocxFile(file);
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

  const handleConvert = useCallback(async () => {
    if (!docxFile) {
      setError(t("errorGeneric"));
      return;
    }
    setError("");
    setIsConverting(true);
    try {
      const arrayBuffer = await docxFile.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;

      const printFrame = document.createElement("iframe");
      printFrame.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:210mm;height:297mm";
      document.body.appendChild(printFrame);

      printFrame.contentDocument.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: Arial, sans-serif; font-size: 12pt;
                   line-height: 1.5; color: #000; }
            h1 { font-size: 18pt; } h2 { font-size: 16pt; }
            h3 { font-size: 14pt; }
            table { border-collapse: collapse; width: 100%; }
            td, th { border: 1px solid #ccc; padding: 4px 8px; }
            img { max-width: 100%; }
          </style>
        </head>
        <body>${html}</body>
        </html>
      `);
      printFrame.contentDocument.close();

      printFrame.contentWindow.focus();
      printFrame.contentWindow.print();
      document.body.removeChild(printFrame);
    } catch (err) {
      console.error(err);
      setError(t("errorGeneric"));
    } finally {
      setIsConverting(false);
    }
  }, [docxFile, t]);

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
          toolPath="word-to-pdf"
        />

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_340px]">
          <section className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("metaTitle")}</h1>
              <p className="mt-1 text-sm text-slate-300">{t("metaDescription")}</p>
            </div>

            {!docxFile ? (
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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="sr-only"
                  onChange={handleFileChange}
                />
                <Upload size={40} strokeWidth={1.5} className={isDragOver ? "text-sky-400" : "text-sky-500/80"} />
                <p className={`text-center text-sm font-medium ${isDragOver ? "text-sky-200" : "text-slate-300"}`}>{t("dropzone")}</p>
              </label>
            ) : (
              <div className="flex h-[120px] w-full items-center gap-4 rounded-xl border-2 border-dashed border-sky-500/50 bg-slate-900/60 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-100">{docxFile.name}</p>
                </div>
              </div>
            )}

            {docxFile && (
              <>
                <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                  {t("printNotice")}
                </p>
                <button
                  type="button"
                  disabled={isConverting}
                  onClick={handleConvert}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-sky-500 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isConverting ? (
                    <>
                      <Loader2 size={22} className="animate-spin shrink-0" />
                      <span>{t("converting")}</span>
                    </>
                  ) : (
                    <>
                      <FileText size={22} strokeWidth={2} className="shrink-0" />
                      <span>{t("convert")}</span>
                    </>
                  )}
                </button>
              </>
            )}

            {error && <p className="text-sm text-rose-400">{error}</p>}
          </section>

          <aside className="space-y-8 lg:max-w-[340px]">
            <EditorialSection namespace="tools.wordToPdf" />
          </aside>
        </div>

        <div className="mt-10">
          <RelatedTools locale={locale} currentSlug="word-to-pdf" />
        </div>

        <div className="mt-10">
          <FaqSection namespace="tools.wordToPdf" />
        </div>
      </main>
    </div>
  );
}
