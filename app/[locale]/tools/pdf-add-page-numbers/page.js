"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { PDFDocument, rgb, StandardFonts } from "@cantoo/pdf-lib";
import { Upload, Loader2, Check, Download, Hash } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const POSITIONS = ["bottomCenter", "bottomRight", "bottomLeft", "topCenter"];
const FORMATS = ["plain", "pageN", "nOfN", "pageNOfN"];

function hexToRgb(hex) {
  const h = hex.replace(/^#/, "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return rgb(r, g, b);
}

function formatPageNumber(pageNum, total, formatKey, t) {
  switch (formatKey) {
    case "plain":
      return String(pageNum);
    case "pageN":
      return t("formatPageN", { n: pageNum });
    case "nOfN":
      return `${pageNum} / ${total}`;
    case "pageNOfN":
      return t("formatPageNOfN", { n: pageNum, total });
    default:
      return String(pageNum);
  }
}

function getX(position, width, textWidth) {
  switch (position) {
    case "bottomLeft":
    case "topLeft":
      return 24;
    case "bottomRight":
    case "topRight":
      return width - textWidth - 24;
    case "bottomCenter":
    case "topCenter":
    default:
      return (width - textWidth) / 2;
  }
}

function getY(position, height) {
  const margin = 24;
  switch (position) {
    case "topCenter":
    case "topLeft":
    case "topRight":
      return height - margin;
    case "bottomCenter":
    case "bottomLeft":
    case "bottomRight":
    default:
      return margin;
  }
}

function StepIndicator({ step1, step2, step3, t }) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold sm:h-8 sm:w-8 ${
            step1 === "done" ? "bg-emerald-500 text-slate-950" : step1 === "active" ? "bg-sky-500 text-slate-950" : "bg-slate-700 text-slate-400"
          }`}
        >
          {step1 === "done" ? <Check size={14} strokeWidth={2.5} /> : "1"}
        </span>
        <span className={`text-xs font-medium sm:text-sm ${step1 === "active" ? "text-sky-300" : step1 === "done" ? "text-emerald-300" : "text-slate-500"}`}>
          {t("stepIndicatorUpload")}
        </span>
      </div>
      <div className="h-px w-4 bg-slate-600 sm:w-8" aria-hidden />
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold sm:h-8 sm:w-8 ${
            step2 === "done" ? "bg-emerald-500 text-slate-950" : step2 === "active" ? "bg-sky-500 text-slate-950" : "bg-slate-700 text-slate-400"
          }`}
        >
          {step2 === "done" ? <Check size={14} strokeWidth={2.5} /> : "2"}
        </span>
        <span className={`text-xs font-medium sm:text-sm ${step2 === "active" ? "text-sky-300" : step2 === "done" ? "text-emerald-300" : "text-slate-500"}`}>
          {t("stepIndicatorApply")}
        </span>
      </div>
      <div className="h-px w-4 bg-slate-600 sm:w-8" aria-hidden />
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold sm:h-8 sm:w-8 ${
            step3 === "done" ? "bg-emerald-500 text-slate-950" : step3 === "active" ? "bg-sky-500 text-slate-950" : "bg-slate-700 text-slate-400"
          }`}
        >
          {step3 === "done" ? <Check size={14} strokeWidth={2.5} /> : "3"}
        </span>
        <span className={`text-xs font-medium sm:text-sm ${step3 === "active" ? "text-sky-300" : step3 === "done" ? "text-emerald-300" : "text-slate-500"}`}>
          {t("stepIndicatorDownload")}
        </span>
      </div>
    </div>
  );
}

export default function PdfAddPageNumbersPage() {
  const locale = useLocale();
  const t = useTranslations("tools.pdfPageNumbers");
  const tCommon = useTranslations("common");
  const [pdfFile, setPdfFile] = useState(null);
  const [position, setPosition] = useState("bottomCenter");
  const [startNumber, setStartNumber] = useState(1);
  const [format, setFormat] = useState("plain");
  const [fontSize, setFontSize] = useState(12);
  const [color, setColor] = useState("#000000");
  const [resultBlob, setResultBlob] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const step1Status = currentStep >= 2 ? "done" : currentStep === 1 ? "active" : "pending";
  const step2Status = currentStep >= 3 ? "done" : currentStep === 2 ? "active" : "pending";
  const step3Status = currentStep === 3 ? "active" : "pending";

  const processFile = useCallback(
    (file) => {
      if (!file) {
        setPdfFile(null);
        setResultBlob(null);
        setCurrentStep(1);
        return;
      }
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      if (!isPdf) {
        setError(t("errorPdfOnly"));
        setPdfFile(null);
        return;
      }
      setError("");
      setResultBlob(null);
      setPdfFile(file);
      setCurrentStep(2);
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

  const handleApply = useCallback(async () => {
    if (!pdfFile) {
      setError(t("errorSelectFirst"));
      return;
    }
    setError("");
    setIsApplying(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();
      const total = pages.length;
      const rgbColor = hexToRgb(color);

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        const pageNum = startNumber + i;
        const text = formatPageNumber(pageNum, total, format, t);
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const x = getX(position, width, textWidth);
        const y = getY(position, height);
        page.drawText(text, { x, y, size: fontSize, font, color: rgbColor });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      setResultBlob(blob);
      setCurrentStep(3);
    } catch (err) {
      console.error("Tool error:", err);
      setError(t("errorGeneric"));
    } finally {
      setIsApplying(false);
    }
  }, [pdfFile, position, startNumber, format, fontSize, color, t]);

  const handleDownload = useCallback(() => {
    if (!resultBlob || !pdfFile) return;
    const baseName = pdfFile.name.replace(/\.pdf$/i, "");
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${baseName}_numbered.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [resultBlob, pdfFile]);

  const positionOptions = [
    { value: "bottomCenter", key: "positionBottomCenter" },
    { value: "bottomRight", key: "positionBottomRight" },
    { value: "bottomLeft", key: "positionBottomLeft" },
    { value: "topCenter", key: "positionTopCenter" },
  ];
  const formatOptions = [
    { value: "plain", key: "formatPlain" },
    { value: "pageN", key: "formatPageN" },
    { value: "nOfN", key: "formatNOfN" },
    { value: "pageNOfN", key: "formatPageNOfN" },
  ];

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
          toolPath="pdf-add-page-numbers"
        />

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_340px]">
          <section className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("metaTitle")}</h1>
              <p className="mt-1 text-sm text-slate-300">{t("metaDescription")}</p>
            </div>

            <StepIndicator step1={step1Status} step2={step2Status} step3={step3Status} t={t} />

            <div className="w-full">
              {!pdfFile ? (
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
                  <input ref={fileInputRef} type="file" accept="application/pdf,.pdf" className="sr-only" onChange={handleFileChange} />
                  <Upload size={40} strokeWidth={1.5} className={isDragOver ? "text-sky-400" : "text-sky-500/80"} />
                  <p className={`text-center text-sm font-medium ${isDragOver ? "text-sky-200" : "text-slate-300"}`}>{t("dropzone")}</p>
                </label>
              ) : (
                <div className="flex h-[120px] w-full items-center gap-4 rounded-xl border-2 border-dashed border-sky-500/50 bg-slate-900/60 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-100">{pdfFile.name}</p>
                  </div>
                </div>
              )}
            </div>

            {pdfFile && !resultBlob && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200">{t("position")}</label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/20 bg-slate-800 px-4 py-3 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    {positionOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {t(opt.key)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="start-number" className="block text-sm font-medium text-slate-200">
                    {t("startNumber")}
                  </label>
                  <input
                    id="start-number"
                    type="number"
                    min={1}
                    value={startNumber}
                    onChange={(e) => setStartNumber(parseInt(e.target.value, 10) || 1)}
                    className="mt-1 w-full rounded-xl border border-white/20 bg-slate-800 px-4 py-3 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200">{t("format")}</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/20 bg-slate-800 px-4 py-3 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    {formatOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {t(opt.key)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="font-size" className="block text-sm font-medium text-slate-200">
                    {t("fontSize")}
                  </label>
                  <input
                    id="font-size"
                    type="number"
                    min={6}
                    max={72}
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value, 10) || 12)}
                    className="mt-1 w-full rounded-xl border border-white/20 bg-slate-800 px-4 py-3 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label htmlFor="color-picker" className="block text-sm font-medium text-slate-200">
                    {t("color")}
                  </label>
                  <div className="mt-1 flex items-center gap-3">
                    <input
                      id="color-picker"
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="h-10 w-14 cursor-pointer rounded border border-white/20 bg-slate-800"
                    />
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-24 rounded-xl border border-white/20 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {error && <p className="text-sm text-rose-400">{error}</p>}

            {pdfFile && !resultBlob && (
              <button
                type="button"
                disabled={isApplying}
                onClick={handleApply}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-sky-500 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition hover:bg-sky-400 hover:shadow-sky-400/30 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isApplying ? (
                  <>
                    <Loader2 size={22} className="animate-spin shrink-0" />
                    <span>{t("applying")}</span>
                  </>
                ) : (
                  <>
                    <Hash size={22} strokeWidth={2} className="shrink-0" />
                    <span>{t("apply")}</span>
                  </>
                )}
              </button>
            )}

            {resultBlob && (
              <div className="space-y-2">
                <p className="text-sm text-emerald-300">{t("step3Description")}</p>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-emerald-500 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 hover:shadow-emerald-400/30"
                >
                  <Download size={22} strokeWidth={2} className="shrink-0" />
                  {t("download")}
                </button>
              </div>
            )}
          </section>

          <aside className="space-y-8 lg:max-w-[340px]">
            <EditorialSection namespace="tools.pdfPageNumbers" />
          </aside>
        </div>

        <div className="mt-10">
          <RelatedTools locale={locale} currentSlug="pdf-add-page-numbers" />
        </div>

        <div className="mt-10">
          <FaqSection namespace="tools.pdfPageNumbers" />
        </div>
      </main>
    </div>
  );
}
