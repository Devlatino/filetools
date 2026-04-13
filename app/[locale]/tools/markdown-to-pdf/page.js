"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Download, Loader2 } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const DEFAULT_MARKDOWN = `# Hello World
## Introduction
This is **bold** and *italic* text.
- Item 1
- Item 2
[Link](https://fileflip.org)
`;

const PAGE_SIZES = {
  a4: { w: 210, h: 297 },
  letter: { w: 215.9, h: 279.4 },
};

const MARGINS_MM = {
  narrow: 12,
  normal: 20,
  wide: 30,
};

export default function MarkdownToPdfPage() {
  const locale = useLocale();
  const t = useTranslations("tools.markdownToPdf");
  const tCommon = useTranslations("common");
  const [markdown, setMarkdown] = useState("");
  const [htmlPreview, setHtmlPreview] = useState("");
  const [pageSize, setPageSize] = useState("a4");
  const [margins, setMargins] = useState("normal");
  const [isConverting, setIsConverting] = useState(false);
  const previewRef = useRef(null);
  const hiddenRef = useRef(null);

  const renderMarkdown = useCallback(async (text) => {
    const { marked } = await import("marked");
    const DOMPurify = (await import("dompurify")).default;
    const raw = await marked.parse(text || "");
    const sanitized = DOMPurify.sanitize(typeof raw === "string" ? raw : "");
    setHtmlPreview(sanitized);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => renderMarkdown(markdown), 300);
    return () => clearTimeout(t);
  }, [markdown, renderMarkdown]);

  const handleDownloadPdf = useCallback(async () => {
    if (!hiddenRef.current || !htmlPreview) return;
    setIsConverting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;
      const size = PAGE_SIZES[pageSize] || PAGE_SIZES.a4;
      const marginMm = MARGINS_MM[margins] ?? 20;

      const canvas = await html2canvas(hiddenRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgW = size.w - 2 * marginMm;
      const imgH = (canvas.height * imgW) / canvas.width;
      const doc = new jsPDF({
        orientation: imgH > size.h ? "portrait" : "portrait",
        unit: "mm",
        format: [size.w, size.h],
      });

      let heightLeft = imgH;
      let position = marginMm;
      let page = 1;

      doc.addImage(canvas.toDataURL("image/png"), "PNG", marginMm, position, imgW, imgH);
      heightLeft -= size.h - 2 * marginMm;

      while (heightLeft > 0) {
        doc.addPage();
        position = -((page - 1) * (size.h - 2 * marginMm)) + marginMm;
        doc.addImage(canvas.toDataURL("image/png"), "PNG", marginMm, position, imgW, imgH);
        heightLeft -= size.h - 2 * marginMm;
        page++;
      }

      doc.save("document.pdf");
    } catch (err) {
      console.error(err);
    } finally {
      setIsConverting(false);
    }
  }, [htmlPreview, pageSize, margins]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href={`/${locale === "en" ? "" : locale}/`} prefetch className="flex items-center gap-2">
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
          toolPath="markdown-to-pdf"
        />

        <div className="mt-6 space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("title")}</h1>
          <p className="text-sm text-slate-300">{t("description")}</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-400">{t("pageSize")}</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value)}
              className="rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-slate-100"
            >
              <option value="a4">A4</option>
              <option value="letter">Letter</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-400">{t("margins")}</span>
            <select
              value={margins}
              onChange={(e) => setMargins(e.target.value)}
              className="rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-slate-100"
            >
              <option value="narrow">{t("narrow")}</option>
              <option value="normal">{t("normal")}</option>
              <option value="wide">{t("wide")}</option>
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={!htmlPreview || isConverting}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-base font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
            >
              {isConverting ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Download size={20} />
              )}
              {isConverting ? t("converting") : t("convert")}
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">{t("inputLabel")}</label>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder={t("placeholder")}
              spellCheck={false}
              className="min-h-[400px] w-full resize-y rounded-xl border border-white/10 bg-slate-900 p-4 font-mono text-sm text-slate-200 placeholder-slate-600 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
              style={{ fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace" }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{t("previewLabel")}</span>
            <div
              ref={previewRef}
              className="min-h-[400px] rounded-xl border border-white/10 bg-white p-6 text-slate-800 overflow-auto"
              style={{
                fontFamily: "Georgia, serif",
                lineHeight: 1.6,
              }}
            >
              <div
                className="prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: htmlPreview || "<p class='text-slate-400'>Preview appears here…</p>" }}
                style={{
                  fontFamily: "Georgia, serif",
                  lineHeight: 1.6,
                }}
              />
            </div>
          </div>
        </div>

        {/* Hidden div for PDF capture - same content with print styles */}
        <div
          ref={hiddenRef}
          aria-hidden
          className="fixed -left-[9999px] top-0 w-[210mm] max-w-[210mm] overflow-hidden bg-white p-6 text-black"
          style={{
            fontFamily: "Georgia, serif",
            lineHeight: 1.6,
            fontSize: "11pt",
          }}
        >
          <div
            className="markdown-pdf-content"
            dangerouslySetInnerHTML={{ __html: htmlPreview }}
            style={{
              fontFamily: "Georgia, serif",
              lineHeight: 1.6,
            }}
          />
        </div>

        <style jsx global>{`
          .markdown-pdf-content h1 { font-size: 2em; margin: 0.67em 0; }
          .markdown-pdf-content h2 { font-size: 1.5em; margin: 0.75em 0; }
          .markdown-pdf-content h3 { font-size: 1.2em; margin: 0.83em 0; }
          .markdown-pdf-content code, .markdown-pdf-content pre { font-family: monospace; background: #f1f5f9; padding: 0.2em 0.4em; border-radius: 4px; }
          .markdown-pdf-content pre { padding: 12px; overflow: auto; }
          .markdown-pdf-content blockquote { border-left: 4px solid #94a3b8; margin: 1em 0; padding-left: 1em; color: #475569; }
          .prose h1 { font-size: 2em; margin: 0.67em 0; }
          .prose h2 { font-size: 1.5em; margin: 0.75em 0; }
          .prose h3 { font-size: 1.2em; margin: 0.83em 0; }
          .prose code, .prose pre { font-family: monospace; background: #f1f5f9; padding: 0.2em 0.4em; border-radius: 4px; color: #0f172a; }
          .prose pre { padding: 12px; overflow: auto; }
          .prose blockquote { border-left: 4px solid #94a3b8; margin: 1em 0; padding-left: 1em; color: #475569; }
        `}</style>

        <EditorialSection namespace="tools.markdownToPdf" />

        <div className="mx-auto max-w-6xl px-4 pb-4 sm:px-6 lg:px-8">
          <RelatedTools locale={locale} currentSlug="markdown-to-pdf" />
          <div className="mt-10">
            <FaqSection namespace="tools.markdownToPdf" />
          </div>
        </div>
      </main>
    </div>
  );
}
