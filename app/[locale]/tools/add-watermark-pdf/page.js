"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { PDFDocument, StandardFonts, rgb, degrees } from "@cantoo/pdf-lib";
import { Upload, Loader2, Check, Download, Stamp } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

const POSITION_CENTER = "center";
const POSITION_DIAGONAL = "diagonal";
const POSITION_BOTTOM = "bottom";

function StepIndicator({ step1, step2, step3, t }) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold sm:h-8 sm:w-8 ${
            step1 === "done"
              ? "bg-emerald-500 text-slate-950"
              : step1 === "active"
                ? "bg-sky-500 text-slate-950"
                : "bg-slate-700 text-slate-400"
          }`}
        >
          {step1 === "done" ? <Check size={14} strokeWidth={2.5} /> : "1"}
        </span>
        <span
          className={`text-xs font-medium sm:text-sm ${
            step1 === "active" ? "text-sky-300" : step1 === "done" ? "text-emerald-300" : "text-slate-500"
          }`}
        >
          {t("stepIndicatorUpload")}
        </span>
      </div>
      <div className="h-px w-4 bg-slate-600 sm:w-8" aria-hidden />
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold sm:h-8 sm:w-8 ${
            step2 === "done"
              ? "bg-emerald-500 text-slate-950"
              : step2 === "active"
                ? "bg-sky-500 text-slate-950"
                : "bg-slate-700 text-slate-400"
          }`}
        >
          {step2 === "done" ? <Check size={14} strokeWidth={2.5} /> : "2"}
        </span>
        <span
          className={`text-xs font-medium sm:text-sm ${
            step2 === "active" ? "text-sky-300" : step2 === "done" ? "text-emerald-300" : "text-slate-500"
          }`}
        >
          {t("stepIndicatorAdd")}
        </span>
      </div>
      <div className="h-px w-4 bg-slate-600 sm:w-8" aria-hidden />
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold sm:h-8 sm:w-8 ${
            step3 === "done"
              ? "bg-emerald-500 text-slate-950"
              : step3 === "active"
                ? "bg-sky-500 text-slate-950"
                : "bg-slate-700 text-slate-400"
          }`}
        >
          {step3 === "done" ? <Check size={14} strokeWidth={2.5} /> : "3"}
        </span>
        <span
          className={`text-xs font-medium sm:text-sm ${
            step3 === "active" ? "text-sky-300" : step3 === "done" ? "text-emerald-300" : "text-slate-500"
          }`}
        >
          {t("stepIndicatorDownload")}
        </span>
      </div>
    </div>
  );
}

export default function AddWatermarkPdfPage() {
  const locale = useLocale();
  const t = useTranslations("tools.addWatermarkPdf");
  const tCommon = useTranslations("common");
  const tTool = useTranslations("tool");
  const [pdfFile, setPdfFile] = useState(null);
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [opacityPercent, setOpacityPercent] = useState(30);
  const [position, setPosition] = useState(POSITION_CENTER);
  const [resultBlob, setResultBlob] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
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

  const handleFileChange = useCallback(
    (e) => {
      processFile(e.target.files?.[0] ?? null);
    },
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

  const handleAddWatermark = useCallback(async () => {
    if (!pdfFile) {
      setError(t("errorSelectFirst"));
      return;
    }
    const text = (watermarkText || "CONFIDENTIAL").trim() || "CONFIDENTIAL";
    setError("");
    setIsProcessing(true);
    setResultBlob(null);
    try {
      const bytes = await pdfFile.arrayBuffer();
      const uint8 = new Uint8Array(bytes);
      const pdfDoc = await PDFDocument.load(uint8);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = 48;
      const gray = 0.2 + (opacityPercent / 100) * 0.6;
      const color = rgb(gray, gray, gray);
      const pages = pdfDoc.getPages();

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const textHeight = fontSize;

        let x, y, rotate;
        if (position === POSITION_CENTER) {
          x = (width - textWidth) / 2;
          y = height / 2 - textHeight / 2;
          rotate = degrees(0);
        } else if (position === POSITION_DIAGONAL) {
          x = (width - textWidth) / 2;
          y = height / 2 - textHeight / 2;
          rotate = degrees(45);
        } else {
          x = 30;
          y = 30;
          rotate = degrees(0);
        }

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color,
          rotate,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      setResultBlob(blob);
      setCurrentStep(3);
    } catch (err) {
      setError(t("errorWatermarkFailed"));
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }, [pdfFile, watermarkText, opacityPercent, position, t]);

  const handleDownload = useCallback(() => {
    if (!resultBlob) return;
    const base = pdfFile?.name?.replace(/\.pdf$/i, "") || "document";
    const a = document.createElement("a");
    a.href = URL.createObjectURL(resultBlob);
    a.download = `${base}-watermarked.pdf`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [resultBlob, pdfFile]);

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
          toolPath="add-watermark-pdf"
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
                    isDragOver
                      ? "border-rose-500 bg-rose-500/15"
                      : "border-dashed border-rose-500/70 bg-slate-900/50"
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
                    className={isDragOver ? "text-rose-400" : "text-rose-500/80"}
                  />
                  <p className={`text-center text-sm font-medium ${isDragOver ? "text-rose-200" : "text-slate-300"}`}>
                    {isDragOver ? t("releaseToUpload") : tTool("dropZone")}
                  </p>
                </label>
              ) : (
                <div className="flex h-[200px] w-full items-center gap-4 rounded-xl border-2 border-dashed border-rose-500/50 bg-slate-900/60 p-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-rose-500/20">
                    <Stamp size={28} className="text-rose-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-100">{pdfFile.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{formatBytes(pdfFile.size)}</p>
                  </div>
                </div>
              )}
            </div>

            {pdfFile && !resultBlob && (
              <div className="space-y-4 rounded-xl border border-white/10 bg-slate-900/60 p-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-300">{t("watermarkTextLabel")}</label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="CONFIDENTIAL"
                    className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-rose-500/50 focus:outline-none focus:ring-1 focus:ring-rose-500/50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-300">
                    {t("opacityLabel")} ({opacityPercent}%)
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={opacityPercent}
                    onChange={(e) => setOpacityPercent(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-rose-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-300">{t("positionLabel")}</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: POSITION_CENTER, labelKey: "positionCenter" },
                      { value: POSITION_DIAGONAL, labelKey: "positionDiagonal" },
                      { value: POSITION_BOTTOM, labelKey: "positionBottom" },
                    ].map(({ value, labelKey }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setPosition(value)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                          position === value
                            ? "bg-rose-500 text-slate-950"
                            : "border border-white/10 bg-slate-800 text-slate-300 hover:bg-slate-700"
                        }`}
                      >
                        {t(labelKey)}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleAddWatermark}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-rose-500 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-rose-500/25 transition hover:bg-rose-400 hover:shadow-rose-400/30 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={22} className="animate-spin shrink-0" />
                      <span>{t("addingLabel")}</span>
                    </>
                  ) : (
                    <>
                      <Stamp size={22} strokeWidth={2} className="shrink-0" />
                      <span>{t("addWatermarkButton")}</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {error && <p className="text-sm text-rose-400">{error}</p>}

            {resultBlob && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-emerald-500 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 hover:shadow-emerald-400/30"
                >
                  <Download size={22} strokeWidth={2} className="shrink-0" />
                  {t("downloadButton")}
                </button>
              </div>
            )}
          </section>

          <aside className="space-y-8 lg:max-w-[340px]">
            <EditorialSection namespace="tools.addWatermarkPdf" />
          </aside>
        </div>

        <div className="mt-10">
          <RelatedTools locale={locale} currentSlug="add-watermark-pdf" />
        </div>

        <div className="mt-10">
          <FaqSection namespace="tools.addWatermarkPdf" />
        </div>
      </main>
    </div>
  );
}
