"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Upload, Loader2, Presentation, Download } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import posthog from "posthog-js";

const EMU_PER_INCH = 914400;

/** Parse integer attribute, returning fallback if missing. */
function intAttr(el, name, fallback = 0) {
  const v = el?.getAttribute?.(name);
  if (v == null) return fallback;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Extract text runs from a slide XML document, preserving <a:p> paragraphs
 * and <a:br> line breaks. Returns an array of text blocks with approximate
 * positioning (in EMUs) if available on parent <p:sp>.
 */
function extractSlideBlocks(xmlDoc) {
  const blocks = [];
  const shapes = xmlDoc.getElementsByTagName("p:sp");
  for (let i = 0; i < shapes.length; i++) {
    const sp = shapes[i];
    const xfrm = sp.getElementsByTagName("a:xfrm")[0];
    const off = xfrm?.getElementsByTagName("a:off")[0];
    const ext = xfrm?.getElementsByTagName("a:ext")[0];
    const x = intAttr(off, "x", 0);
    const y = intAttr(off, "y", 0);
    const cx = intAttr(ext, "cx", 0);
    const cy = intAttr(ext, "cy", 0);

    const paragraphs = sp.getElementsByTagName("a:p");
    const lines = [];
    for (let p = 0; p < paragraphs.length; p++) {
      const para = paragraphs[p];
      let line = "";
      // iterate children in order to preserve a:br vs a:r vs a:fld
      for (const child of para.childNodes) {
        if (child.nodeType !== 1) continue;
        const tag = child.nodeName;
        if (tag === "a:r" || tag === "a:fld") {
          const tEl = child.getElementsByTagName("a:t")[0];
          if (tEl) line += tEl.textContent || "";
        } else if (tag === "a:br") {
          lines.push(line);
          line = "";
        }
      }
      lines.push(line);
    }
    const nonEmpty = lines.filter((l) => l.trim().length > 0);
    if (nonEmpty.length) {
      blocks.push({ x, y, cx, cy, lines: nonEmpty });
    }
  }
  // Sort blocks top-to-bottom by y
  blocks.sort((a, b) => a.y - b.y);
  return blocks;
}

function parseSlideSize(presentationXml) {
  // <p:sldSz cx="9144000" cy="6858000" type="screen4x3"/>
  const match = presentationXml.match(/<p:sldSz[^>]*cx="(\d+)"[^>]*cy="(\d+)"/);
  if (match) {
    return { cx: parseInt(match[1], 10), cy: parseInt(match[2], 10) };
  }
  // default 10" x 7.5" widescreen fallback
  return { cx: 9144000, cy: 6858000 };
}

export default function PowerpointToPdfPage() {
  const locale = useLocale();
  const t = useTranslations("tools.powerpointToPdf");
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
      const isPptx =
        selected.type ===
          "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
        /\.pptx$/i.test(selected.name);
      if (!isPptx) {
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
      const { default: JSZip } = await import("jszip");
      const { jsPDF } = await import("jspdf");

      const zip = await JSZip.loadAsync(await file.arrayBuffer());

      const presentationFile = zip.file("ppt/presentation.xml");
      if (!presentationFile) throw new Error("Invalid PPTX: no presentation.xml");
      const presentationXml = await presentationFile.async("string");
      const { cx: slideCxEmu, cy: slideCyEmu } = parseSlideSize(presentationXml);
      const slideWInches = slideCxEmu / EMU_PER_INCH;
      const slideHInches = slideCyEmu / EMU_PER_INCH;

      // Gather slide files in numeric order
      const slideFiles = Object.keys(zip.files)
        .filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))
        .sort((a, b) => {
          const na = parseInt(a.match(/slide(\d+)\.xml$/)[1], 10);
          const nb = parseInt(b.match(/slide(\d+)\.xml$/)[1], 10);
          return na - nb;
        });

      if (slideFiles.length === 0) throw new Error("No slides found");

      const parser = new DOMParser();
      const pdf = new jsPDF({
        orientation: slideWInches >= slideHInches ? "landscape" : "portrait",
        unit: "in",
        format: [slideWInches, slideHInches],
      });

      const marginX = 0.5;
      const marginY = 0.5;
      const contentW = slideWInches - marginX * 2;

      for (let i = 0; i < slideFiles.length; i++) {
        setProgress(
          t("renderingSlide", { current: i + 1, total: slideFiles.length })
        );
        const slideXml = await zip.file(slideFiles[i]).async("string");
        const xmlDoc = parser.parseFromString(slideXml, "application/xml");
        const blocks = extractSlideBlocks(xmlDoc);

        if (i > 0) pdf.addPage([slideWInches, slideHInches]);

        pdf.setFont("helvetica", "normal");

        // Find slide title: first block at topmost y with non-empty text
        const [title, ...rest] = blocks;

        let cursorY = marginY;
        if (title) {
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(22);
          const lines = pdf.splitTextToSize(title.lines.join(" "), contentW);
          pdf.text(lines, marginX, cursorY + 0.3);
          cursorY += 0.3 + lines.length * 0.35 + 0.2;
        }

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(12);
        for (const block of rest) {
          for (const rawLine of block.lines) {
            const lines = pdf.splitTextToSize(rawLine, contentW);
            for (const ln of lines) {
              if (cursorY > slideHInches - marginY) break;
              pdf.text(ln, marginX, cursorY + 0.2);
              cursorY += 0.22;
            }
            cursorY += 0.05;
          }
          cursorY += 0.1;
        }
      }

      setProgress(t("savingPdf"));
      const base = file.name.replace(/\.pptx?$/i, "") || "presentation";
      pdf.save(`${base}.pdf`);

      posthog.capture("tool_conversion_completed", {
        tool: "powerpoint-to-pdf",
        file_size_bytes: file.size,
        slides: slideFiles.length,
      });
    } catch (err) {
      console.error("powerpoint-to-pdf error:", err);
      posthog.captureException(err, { tool: "powerpoint-to-pdf" });
      posthog.capture("tool_conversion_failed", {
        tool: "powerpoint-to-pdf",
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
          toolPath="powerpoint-to-pdf"
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
                    ? "border-orange-500 bg-orange-500/15"
                    : "border-dashed border-orange-500/70 bg-slate-900/50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                  className="sr-only"
                  onChange={handleFileChange}
                />
                <Upload
                  size={40}
                  strokeWidth={1.5}
                  className={
                    isDragOver ? "text-orange-400" : "text-orange-500/80"
                  }
                />
                <p
                  className={`text-center text-sm font-medium ${
                    isDragOver ? "text-orange-200" : "text-slate-300"
                  }`}
                >
                  {t("dropzone")}
                </p>
              </label>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-slate-900/50 p-4">
                  <Presentation className="h-8 w-8 text-orange-400" />
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
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-medium text-slate-950 hover:bg-orange-400 disabled:opacity-60"
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
            <EditorialSection namespace="tools.powerpointToPdf" />
          </aside>
        </div>

        <div className="mt-10">
          <RelatedTools locale={locale} currentSlug="powerpoint-to-pdf" />
        </div>

        <div className="mt-10">
          <FaqSection namespace="tools.powerpointToPdf" />
        </div>
      </main>
    </div>
  );
}
