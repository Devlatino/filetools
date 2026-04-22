"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Upload, Loader2, FileText, Download } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import posthog from "posthog-js";

function xmlEscape(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildParagraph(text, { pageBreakBefore = false } = {}) {
  const safe = xmlEscape(text);
  const brk = pageBreakBefore ? '<w:r><w:br w:type="page"/></w:r>' : "";
  return `<w:p>${brk}<w:r><w:t xml:space="preserve">${safe}</w:t></w:r></w:p>`;
}

async function buildDocx(pages) {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const docRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`;

  const body = pages
    .map((pageLines, pageIndex) => {
      const paras = pageLines.length
        ? pageLines
            .map((line, li) =>
              buildParagraph(line, { pageBreakBefore: pageIndex > 0 && li === 0 })
            )
            .join("")
        : buildParagraph("", { pageBreakBefore: pageIndex > 0 });
      return paras;
    })
    .join("");

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${body}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  zip.file("[Content_Types].xml", contentTypes);
  zip.folder("_rels").file(".rels", rootRels);
  const wordFolder = zip.folder("word");
  wordFolder.file("document.xml", documentXml);
  wordFolder.folder("_rels").file("document.xml.rels", docRels);

  return await zip.generateAsync({
    type: "blob",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

function groupItemsIntoLines(items) {
  // pdfjs items have transform[5] (y) and str; group by y, then sort by x
  const rows = new Map();
  for (const it of items) {
    const str = it.str || "";
    if (!str && !it.hasEOL) continue;
    const y = Math.round((it.transform?.[5] ?? 0) * 10) / 10;
    const x = it.transform?.[4] ?? 0;
    const key = y;
    if (!rows.has(key)) rows.set(key, []);
    rows.get(key).push({ x, str, eol: !!it.hasEOL });
  }
  // Sort rows top-to-bottom (higher y first), then items left-to-right
  const sortedKeys = [...rows.keys()].sort((a, b) => b - a);
  const lines = [];
  for (const k of sortedKeys) {
    const row = rows.get(k).sort((a, b) => a.x - b.x);
    const text = row.map((r) => r.str).join("").trim();
    if (text.length) lines.push(text);
  }
  return lines;
}

export default function PdfToWordPage() {
  const locale = useLocale();
  const t = useTranslations("tools.pdfToWord");
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
      const pages = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        setProgress(t("extractingPage", { current: i, total: pdf.numPages }));
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const lines = groupItemsIntoLines(textContent.items || []);
        pages.push(lines);
      }

      setProgress(t("buildingDocx"));
      const blob = await buildDocx(pages);
      const base = file.name.replace(/\.pdf$/i, "") || "document";
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${base}.docx`;
      a.click();
      URL.revokeObjectURL(a.href);

      posthog.capture("tool_conversion_completed", {
        tool: "pdf-to-word",
        file_size_bytes: file.size,
        pages: pdf.numPages,
      });
    } catch (err) {
      console.error("pdf-to-word error:", err);
      posthog.captureException(err, { tool: "pdf-to-word" });
      posthog.capture("tool_conversion_failed", {
        tool: "pdf-to-word",
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
          toolPath="pdf-to-word"
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
                    ? "border-sky-500 bg-sky-500/15"
                    : "border-dashed border-sky-500/70 bg-slate-900/50"
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
                    isDragOver ? "text-sky-400" : "text-sky-500/80"
                  }
                />
                <p
                  className={`text-center text-sm font-medium ${
                    isDragOver ? "text-sky-200" : "text-slate-300"
                  }`}
                >
                  {t("dropzone")}
                </p>
              </label>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-slate-900/50 p-4">
                  <FileText className="h-8 w-8 text-sky-400" />
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
                <p className="text-xs text-slate-400">{t("textOnlyNote")}</p>
                {error && <p className="text-sm text-rose-400">{error}</p>}
                <button
                  type="button"
                  onClick={handleConvert}
                  disabled={isConverting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 font-medium text-slate-950 hover:bg-sky-400 disabled:opacity-60"
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
            <EditorialSection namespace="tools.pdfToWord" />
          </aside>
        </div>

        <div className="mt-10">
          <RelatedTools locale={locale} currentSlug="pdf-to-word" />
        </div>

        <div className="mt-10">
          <FaqSection namespace="tools.pdfToWord" />
        </div>
      </main>
    </div>
  );
}
