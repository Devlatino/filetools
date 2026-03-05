"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Upload, Check, Download, Type } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SchemaMarkup } from "@/components/SchemaMarkup";

const ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_TEXT_LEN = 200;
const FONT_SIZE_MIN = 12;
const FONT_SIZE_MAX = 120;
const FONT_SIZE_DEFAULT = 48;
const POSITIONS = ["top", "center", "bottom"];

function wrapText(ctx, text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    const m = ctx.measureText(test);
    if (m.width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

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
          {t("stepIndicatorEdit")}
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

export default function AddTextToImagePage() {
  const locale = useLocale();
  const t = useTranslations("tools.addTextToImage");
  const tCommon = useTranslations("common");
  const tTool = useTranslations("tool");
  const [originalFile, setOriginalFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [resultBlob, setResultBlob] = useState(null);
  const [resultUrl, setResultUrl] = useState("");
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(FONT_SIZE_DEFAULT);
  const [textColor, setTextColor] = useState("#ffffff");
  const [textBgEnabled, setTextBgEnabled] = useState(false);
  const [position, setPosition] = useState("center");
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const previewCanvasRef = useRef(null);

  const step1Status = currentStep >= 2 ? "done" : currentStep === 1 ? "active" : "pending";
  const step2Status = currentStep >= 3 ? "done" : currentStep === 2 ? "active" : "pending";
  const step3Status = currentStep === 3 ? "active" : "pending";

  const drawPreview = useCallback(() => {
    if (!originalUrl || !previewCanvasRef.current) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = previewCanvasRef.current;
      if (!canvas) return;
      const maxW = 400;
      const maxH = 300;
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (w > maxW || h > maxH) {
        const r = Math.min(maxW / w, maxH / h);
        w = Math.round(w * r);
        h = Math.round(h * r);
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      const scale = w / img.naturalWidth;
      const fs = Math.max(12, Math.round(fontSize * scale));
      ctx.font = `bold ${fs}px sans-serif`;
      const lines = text ? wrapText(ctx, text.slice(0, MAX_TEXT_LEN), w - 20) : [];
      if (lines.length) {
        const lineHeight = fs * 1.2;
        const totalH = lines.length * lineHeight;
        let y;
        if (position === "top") y = 20 + fs;
        else if (position === "bottom") y = h - 20 - totalH + fs;
        else y = (h - totalH) / 2 + fs;
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 4;
        ctx.fillStyle = textColor;
        if (textBgEnabled) {
          const padding = 8;
          const bw = w - 20;
          const bh = totalH + padding * 2;
          const by = y - fs - padding;
          ctx.fillStyle = "rgba(0,0,0,0.5)";
          ctx.fillRect(10, by, bw, bh);
          ctx.fillStyle = textColor;
        }
        lines.forEach((line, i) => {
          const x = w / 2;
          ctx.textAlign = "center";
          ctx.fillText(line, x, y + i * lineHeight);
        });
      }
    };
    img.src = originalUrl;
  }, [originalUrl, text, fontSize, textColor, textBgEnabled, position]);

  useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  const processFile = useCallback(
    (file) => {
      if (!file) {
        setOriginalFile(null);
        setOriginalUrl((u) => {
          if (u) URL.revokeObjectURL(u);
          return "";
        });
        setResultBlob(null);
        setResultUrl((u) => {
          if (u) URL.revokeObjectURL(u);
          return "";
        });
        setPreviewUrl("");
        setCurrentStep(1);
        return;
      }
      if (!ACCEPT.split(",").some((x) => file.type === x.trim())) {
        setError(t("errorUnsupportedFormat"));
        setOriginalFile(null);
        setOriginalUrl("");
        return;
      }
      setError("");
      setResultBlob(null);
      setResultUrl((u) => {
        if (u) URL.revokeObjectURL(u);
        return "";
      });
      setOriginalFile(file);
      setOriginalUrl(URL.createObjectURL(file));
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

  const handleExport = useCallback(() => {
    if (!originalFile || !originalUrl) {
      setError(t("errorSelectFirst"));
      return;
    }
    setError("");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const lines = text ? wrapText(ctx, text.slice(0, MAX_TEXT_LEN), canvas.width - 40) : [];
      if (lines.length) {
        ctx.font = `bold ${fontSize}px sans-serif`;
        const lineHeight = fontSize * 1.2;
        const totalH = lines.length * lineHeight;
        let y;
        if (position === "top") y = 40 + fontSize;
        else if (position === "bottom") y = canvas.height - 40 - totalH + fontSize;
        else y = (canvas.height - totalH) / 2 + fontSize;
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 6;
        ctx.fillStyle = textColor;
        if (textBgEnabled) {
          const padding = 12;
          const bw = canvas.width - 40;
          const bh = totalH + padding * 2;
          const by = y - fontSize - padding;
          ctx.fillStyle = "rgba(0,0,0,0.5)";
          ctx.fillRect(20, by, bw, bh);
          ctx.fillStyle = textColor;
        }
        lines.forEach((line, i) => {
          ctx.textAlign = "center";
          ctx.fillText(line, canvas.width / 2, y + i * lineHeight);
        });
      }
      const isPng = originalFile.type === "image/png";
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError(t("errorExportFailed"));
            return;
          }
          setResultBlob(blob);
          setResultUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return URL.createObjectURL(blob);
          });
          setCurrentStep(3);
        },
        isPng ? "image/png" : "image/jpeg",
        0.92
      );
    };
    img.onerror = () => setError(t("errorExportFailed"));
    img.src = originalUrl;
  }, [originalFile, originalUrl, text, fontSize, textColor, textBgEnabled, position, t]);

  const handleDownload = useCallback(() => {
    if (!resultBlob) return;
    const link = document.createElement("a");
    link.href = resultUrl || URL.createObjectURL(resultBlob);
    const base = originalFile?.name?.replace(/\.[^.]+$/, "") || "image";
    const ext = originalFile?.type === "image/png" ? "png" : "jpg";
    link.download = `fileflip-text-${base}.${ext}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, [resultBlob, resultUrl, originalFile]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <SchemaMarkup
        title={t("metaTitle")}
        description={t("metaDescription")}
        slug="add-text-to-image"
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
          toolPath="add-text-to-image"
        />

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_340px]">
          <section className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("metaTitle")}</h1>
              <p className="mt-1 text-sm text-slate-300">{t("metaDescription")}</p>
            </div>

            <StepIndicator step1={step1Status} step2={step2Status} step3={step3Status} t={t} />

            <div className="w-full">
              {!originalFile ? (
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
                    accept={ACCEPT}
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                  <Upload
                    size={40}
                    strokeWidth={1.5}
                    className={isDragOver ? "text-sky-400" : "text-sky-500/80"}
                  />
                  <p className={`text-center text-sm font-medium ${isDragOver ? "text-sky-200" : "text-slate-300"}`}>
                    {isDragOver ? t("releaseToUpload") : tTool("dropZone")}
                  </p>
                </label>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">
                      {t("previewLabel")}
                    </p>
                    <div className="flex justify-center overflow-hidden rounded-lg bg-slate-800">
                      <canvas
                        ref={previewCanvasRef}
                        className="max-h-[320px] w-auto max-w-full"
                        style={{ width: "auto", height: "auto" }}
                      />
                    </div>
                  </div>
                  <div className="space-y-4 rounded-xl border border-white/10 bg-slate-900/60 p-4">
                    <label className="block">
                      <span className="text-sm font-medium text-slate-300">{t("textLabel")}</span>
                      <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT_LEN))}
                        maxLength={MAX_TEXT_LEN}
                        rows={3}
                        className="mt-1 w-full rounded-lg border border-white/20 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
                        placeholder={t("textPlaceholder")}
                      />
                      <span className="text-xs text-slate-500">
                        {text.length}/{MAX_TEXT_LEN}
                      </span>
                    </label>
                    <div className="flex flex-wrap items-center gap-4">
                      <label className="flex items-center gap-2 text-sm text-slate-300">
                        <span>{t("fontSizeLabel")}</span>
                        <input
                          type="range"
                          min={FONT_SIZE_MIN}
                          max={FONT_SIZE_MAX}
                          value={fontSize}
                          onChange={(e) => setFontSize(Number(e.target.value))}
                          className="w-24 accent-sky-500"
                        />
                        <span className="w-10 text-right font-mono text-xs">{fontSize}</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm text-slate-300">
                        <span>{t("textColorLabel")}</span>
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="h-8 w-12 cursor-pointer rounded border border-white/20 bg-slate-800"
                        />
                      </label>
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                        <input
                          type="checkbox"
                          checked={textBgEnabled}
                          onChange={(e) => setTextBgEnabled(e.target.checked)}
                          className="rounded border-slate-500 accent-sky-500"
                        />
                        {t("textBackgroundLabel")}
                      </label>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-300">{t("positionLabel")}</span>
                      <div className="mt-2 flex gap-2">
                        {POSITIONS.map((pos) => (
                          <button
                            key={pos}
                            type="button"
                            onClick={() => setPosition(pos)}
                            className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize transition ${
                              position === pos
                                ? "border-sky-500 bg-sky-500/20 text-sky-200"
                                : "border-white/20 bg-slate-800 text-slate-200 hover:border-sky-500/50"
                            }`}
                          >
                            {t(`position${pos.charAt(0).toUpperCase() + pos.slice(1)}`)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {error && <p className="text-sm text-rose-400">{error}</p>}

            {originalFile && !resultBlob && (
              <button
                type="button"
                onClick={handleExport}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-sky-500 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition hover:bg-sky-400 hover:shadow-sky-400/30"
              >
                <Type size={22} strokeWidth={2} className="shrink-0" />
                {t("applyButton")}
              </button>
            )}

            {resultBlob && (
              <div className="space-y-2">
                <p className="text-sm text-slate-300">{t("step3Description")}</p>
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
            <EditorialSection namespace="tools.addTextToImage" />
          </aside>
        </div>

        <div className="mt-10">
          <RelatedTools locale={locale} currentSlug="add-text-to-image" />
        </div>

        <div className="mt-10">
          <FaqSection namespace="tools.addTextToImage" />
        </div>
      </main>
    </div>
  );
}
