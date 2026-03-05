"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Upload, Loader2 } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SchemaMarkup } from "@/components/SchemaMarkup";

export default function WordToPdfPage() {
  const locale = useLocale();
  const t = useTranslations("tools.wordToPdf");
  const tCommon = useTranslations("common");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleConvert = useCallback(
    async (docxFile) => {
      setLoading(true);
      setError(null);
      let container = null;

      try {
        setProgress(t("converting"));

        const { renderAsync } = await import("docx-preview");
        const { default: html2canvas } = await import("html2canvas");
        const { jsPDF } = await import("jspdf");

        const arrayBuffer = await docxFile.arrayBuffer();

        container = document.createElement("div");
        container.style.cssText = `
          position: fixed;
          top: -99999px;
          left: -99999px;
          width: 794px;
          background: white;
          font-family: serif;
          z-index: -1;
        `;
        document.body.appendChild(container);

        await renderAsync(arrayBuffer, container, null, {
          className: "docx-preview",
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          ignoreFonts: false,
          breakPages: true,
          ignoreLastRenderedPageBreak: true,
          experimental: false,
          trimXmlDeclaration: true,
          useBase64URL: true,
          useMathMLPolyfill: false,
          renderHeaders: true,
          renderFooters: true,
          renderFootnotes: true,
          renderEndnotes: true,
          debug: false,
        });

        setProgress("Capturing pages...");

        const pages = container.querySelectorAll(".docx-wrapper section");

        if (!pages || pages.length === 0) {
          const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            logging: false,
            width: 794,
          });

          const imgData = canvas.toDataURL("image/jpeg", 0.95);
          const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
          });

          const pdfW = pdf.internal.pageSize.getWidth();
          const pdfH = pdf.internal.pageSize.getHeight();
          const ratio = canvas.height / canvas.width;
          const imgH = pdfW * ratio;

          if (imgH <= pdfH) {
            pdf.addImage(imgData, "JPEG", 0, 0, pdfW, imgH);
          } else {
            let position = 0;
            while (position < imgH) {
              pdf.addImage(imgData, "JPEG", 0, -position, pdfW, imgH);
              position += pdfH;
              if (position < imgH) pdf.addPage();
            }
          }

          pdf.save(docxFile.name.replace(/\.docx?$/i, ".pdf"));
          return;
        }

        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        const pdfW = pdf.internal.pageSize.getWidth();
        const pdfH = pdf.internal.pageSize.getHeight();

        for (let i = 0; i < pages.length; i++) {
          setProgress(`Converting page ${i + 1} of ${pages.length}...`);

          const page = pages[i];

          const canvas = await html2canvas(page, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            logging: false,
            width: page.scrollWidth,
            height: page.scrollHeight,
          });

          const imgData = canvas.toDataURL("image/jpeg", 0.92);
          const canvasRatio = canvas.height / canvas.width;
          const imgW = pdfW;
          let imgH = pdfW * canvasRatio;
          const yOffset = imgH < pdfH ? (pdfH - imgH) / 2 : 0;

          if (i > 0) pdf.addPage();
          pdf.addImage(imgData, "JPEG", 0, yOffset, imgW, imgH);
        }

        setProgress("Saving PDF...");
        pdf.save(docxFile.name.replace(/\.docx?$/i, ".pdf"));
      } catch (err) {
        console.error("word-to-pdf error:", err);
        setError(t("errorGeneric"));
      } finally {
        if (container && container.parentNode) {
          document.body.removeChild(container);
        }
        setLoading(false);
        setProgress("");
      }
    },
    [t]
  );

  const processFile = useCallback(
    (f) => {
      if (!f) {
        setFile(null);
        setError(null);
        return;
      }
      const isDocx =
        f.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        /\.docx?$/i.test(f.name);
      if (!isDocx) {
        setError(t("errorGeneric"));
        setFile(null);
        return;
      }
      setError(null);
      setFile(f);
      handleConvert(f);
    },
    [t, handleConvert]
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

  const handleNewFile = useCallback(() => {
    setFile(null);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <SchemaMarkup
        title={t("metaTitle")}
        description={t("metaDescription")}
        slug="word-to-pdf"
        locale={locale}
      />
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

            {!loading && (
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
                  accept=".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="sr-only"
                  onChange={handleFileChange}
                />
                <Upload size={40} strokeWidth={1.5} className={isDragOver ? "text-sky-400" : "text-sky-500/80"} />
                <p className={`text-center text-sm font-medium ${isDragOver ? "text-sky-200" : "text-slate-300"}`}>
                  {t("dropzone")}
                </p>
              </label>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-sky-500/30 bg-slate-900/50 py-12">
                <Loader2 size={40} className="animate-spin text-sky-400" />
                <p className="mt-4 font-medium text-slate-200">{progress || t("converting")}</p>
                <p className="mt-2 text-sm text-slate-400">{t("convertingNote")}</p>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            )}

            {!loading && file && !error && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleNewFile}
                  className="rounded-xl border border-slate-600 bg-slate-800 px-6 py-2.5 text-sm font-medium text-slate-200 transition hover:border-sky-500 hover:text-sky-200"
                >
                  {t("convertAnother")}
                </button>
              </div>
            )}
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
