"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Upload, Loader2, Check, Download, Crop } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SchemaMarkup } from "@/components/SchemaMarkup";

const MIN_CROP = 20;
const ACCEPT = "image/jpeg,image/png,image/webp";

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
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
          {t("stepIndicatorCrop")}
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

export default function CropImagePage() {
  const locale = useLocale();
  const t = useTranslations("tools.cropImage");
  const tCommon = useTranslations("common");
  const tTool = useTranslations("tool");
  const [originalFile, setOriginalFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [imgNatural, setImgNatural] = useState({ w: 0, h: 0 });
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [dragging, setDragging] = useState(null);
  const [resultBlob, setResultBlob] = useState(null);
  const [resultUrl, setResultUrl] = useState("");
  const [isCropping, setIsCropping] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const imgRef = useRef(null);
  const overlayRef = useRef(null);

  const step1Status = currentStep >= 2 ? "done" : currentStep === 1 ? "active" : "pending";
  const step2Status = currentStep >= 3 ? "done" : currentStep === 2 ? "active" : "pending";
  const step3Status = currentStep === 3 ? "active" : "pending";

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
        setDisplaySize({ w: 0, h: 0 });
        setCrop({ x: 0, y: 0, w: 0, h: 0 });
        setCurrentStep(1);
        return;
      }
      const ok = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
      if (!ok) {
        setError(t("errorImageOnly"));
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
      setImgNatural({ w: 0, h: 0 });
      setDisplaySize({ w: 0, h: 0 });
      setCrop({ x: 0, y: 0, w: 0, h: 0 });
      setCurrentStep(2);
    },
    [t]
  );

  useEffect(() => {
    if (!imgRef.current || !originalUrl || imgNatural.w === 0) return;
    const rect = imgRef.current.getBoundingClientRect();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    setDisplaySize({ w, h });
    setCrop({ x: 0, y: 0, w, h });
  }, [originalUrl, imgNatural.w, imgNatural.h]);

  const onImageLoad = useCallback(() => {
    if (!imgRef.current) return;
    setImgNatural({ w: imgRef.current.naturalWidth, h: imgRef.current.naturalHeight });
  }, []);

  const getOverlayRect = useCallback(() => {
    if (!overlayRef.current) return null;
    return overlayRef.current.getBoundingClientRect();
  }, []);

  const clampCrop = useCallback((c, dw, dh) => {
    let { x, y, w, h } = c;
    if (w < MIN_CROP) w = MIN_CROP;
    if (h < MIN_CROP) h = MIN_CROP;
    if (x < 0) x = 0;
    if (y < 0) y = 0;
    if (x + w > dw) {
      w = dw - x;
      if (w < MIN_CROP) {
        w = MIN_CROP;
        x = dw - MIN_CROP;
      }
    }
    if (y + h > dh) {
      h = dh - y;
      if (h < MIN_CROP) {
        h = MIN_CROP;
        y = dh - MIN_CROP;
      }
    }
    return { x, y, w, h };
  }, []);

  const handleMouseDown = useCallback(
    (e, handle) => {
      e.preventDefault();
      const rect = getOverlayRect();
      if (!rect) return;
      setDragging({
        handle,
        startX: e.clientX,
        startY: e.clientY,
        startCrop: { ...crop },
        overlayW: rect.width,
        overlayH: rect.height,
      });
    },
    [crop, getOverlayRect]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!dragging) return;
      const dx = e.clientX - dragging.startX;
      const dy = e.clientY - dragging.startY;
      const { handle, startCrop, overlayW, overlayH } = dragging;
      let { x, y, w, h } = startCrop;
      switch (handle) {
        case "nw":
          x += dx;
          y += dy;
          w -= dx;
          h -= dy;
          break;
        case "n":
          y += dy;
          h -= dy;
          break;
        case "ne":
          y += dy;
          w += dx;
          h -= dy;
          break;
        case "e":
          w += dx;
          break;
        case "se":
          w += dx;
          h += dy;
          break;
        case "s":
          h += dy;
          break;
        case "sw":
          x += dx;
          w -= dx;
          h += dy;
          break;
        case "w":
          x += dx;
          w -= dx;
          break;
        default:
          return;
      }
      setCrop(clampCrop({ x, y, w, h }, overlayW, overlayH));
    },
    [dragging, clampCrop]
  );

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  useEffect(() => {
    if (!dragging) return;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, handleMouseMove, handleMouseUp]);

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

  const handleCrop = useCallback(async () => {
    if (!originalUrl || !originalFile || displaySize.w <= 0 || displaySize.h <= 0) {
      setError(t("errorSelectFirst"));
      return;
    }
    setError("");
    setIsCropping(true);
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = originalUrl;
      });
      const nw = img.naturalWidth;
      const nh = img.naturalHeight;
      const scaleX = nw / displaySize.w;
      const scaleY = nh / displaySize.h;
      const sx = Math.max(0, Math.round(crop.x * scaleX));
      const sy = Math.max(0, Math.round(crop.y * scaleY));
      const sw = Math.min(nw - sx, Math.round(crop.w * scaleX));
      const sh = Math.min(nh - sy, Math.round(crop.h * scaleY));
      if (sw <= 0 || sh <= 0) {
        setError(t("errorConversionFailed"));
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError(t("errorConversionFailed"));
            return;
          }
          setResultBlob(blob);
          setResultUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return URL.createObjectURL(blob);
          });
          setCurrentStep(3);
        },
        "image/png"
      );
    } catch (err) {
      setError(t("errorConversionFailed"));
      console.error(err);
    } finally {
      setIsCropping(false);
    }
  }, [originalUrl, originalFile, displaySize, crop, t]);

  const cropPxW = displaySize.w > 0 && imgNatural.w > 0
    ? Math.round(crop.w * (imgNatural.w / displaySize.w))
    : 0;
  const cropPxH = displaySize.h > 0 && imgNatural.h > 0
    ? Math.round(crop.h * (imgNatural.h / displaySize.h))
    : 0;

  const handleDownload = useCallback(() => {
    if (!resultBlob || !resultUrl) return;
    const base = originalFile?.name?.replace(/\.[^.]+$/i, "") || "image";
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `${base}-cropped.png`;
    a.click();
  }, [resultBlob, resultUrl, originalFile]);

  const handleReset = useCallback(() => {
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
    setDisplaySize({ w: 0, h: 0 });
    setCrop({ x: 0, y: 0, w: 0, h: 0 });
    setCurrentStep(1);
    setError("");
  }, []);

  const handlePos = (pos) => {
    const { x, y, w, h } = crop;
    const HANDLE_SIZE = 12;
    const hs = HANDLE_SIZE / 2;
    switch (pos) {
      case "nw":
        return { left: x - hs, top: y - hs };
      case "n":
        return { left: x + w / 2 - hs, top: y - hs };
      case "ne":
        return { left: x + w - hs, top: y - hs };
      case "e":
        return { left: x + w - hs, top: y + h / 2 - hs };
      case "se":
        return { left: x + w - hs, top: y + h - hs };
      case "s":
        return { left: x + w / 2 - hs, top: y + h - hs };
      case "sw":
        return { left: x - hs, top: y + h - hs };
      case "w":
        return { left: x - hs, top: y + h / 2 - hs };
      default:
        return { left: 0, top: 0 };
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <SchemaMarkup
        title={t("metaTitle")}
        description={t("metaDescription")}
        slug="crop-image"
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
          toolPath="crop-image"
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
                <>
                  <div className="flex max-h-[400px] w-full justify-center overflow-hidden rounded-xl bg-slate-900">
                    <div className="relative inline-block max-h-[400px] max-w-full">
                      <img
                        ref={imgRef}
                        src={originalUrl}
                        alt=""
                        className="block max-h-[400px] w-auto max-w-full object-contain"
                        onLoad={onImageLoad}
                        draggable={false}
                        style={{ userSelect: "none" }}
                      />
                      {displaySize.w > 0 && displaySize.h > 0 && (
                        <div
                          ref={overlayRef}
                          className="absolute inset-0 cursor-crosshair"
                          style={{ touchAction: "none" }}
                        >
                          {/* dark overlay outside crop */}
                          <div
                            className="absolute bg-black/50"
                            style={{
                              inset: 0,
                              clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${crop.x}px ${crop.y}px, ${crop.x}px ${crop.y + crop.h}px, ${crop.x + crop.w}px ${crop.y + crop.h}px, ${crop.x + crop.w}px ${crop.y}px, ${crop.x}px ${crop.y}px)`,
                            }}
                          />
                          <div
                            className="absolute border-2 border-dashed border-white border-white/80"
                            style={{
                              left: crop.x,
                              top: crop.y,
                              width: crop.w,
                              height: crop.h,
                            }}
                          />
                          {["nw", "n", "ne", "e", "se", "s", "sw", "w"].map((pos) => (
                            <div
                              key={pos}
                              role="button"
                              tabIndex={0}
                              className="absolute h-3 w-3 rounded-full border-2 border-white bg-sky-500 cursor-grab active:cursor-grabbing"
                              style={{
                                ...handlePos(pos),
                                width: 12,
                                height: 12,
                              }}
                              onMouseDown={(e) => handleMouseDown(e, pos)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                }
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {cropPxW > 0 && cropPxH > 0 && (
                    <p className="text-center text-sm text-slate-400">
                      {t("dimensionsLabel", { width: cropPxW, height: cropPxH })}
                    </p>
                  )}
                </>
              )}
            </div>

            {error && <p className="text-sm text-rose-400">{error}</p>}

            {originalFile && displaySize.w > 0 && !resultBlob && (
              <button
                type="button"
                disabled={isCropping}
                onClick={handleCrop}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-sky-500 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition hover:bg-sky-400 hover:shadow-sky-400/30 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isCropping ? (
                  <>
                    <Loader2 size={22} className="animate-spin shrink-0" />
                    <span>{t("croppingLabel")}</span>
                  </>
                ) : (
                  <>
                    <Crop size={22} strokeWidth={2} className="shrink-0" />
                    <span>{t("cropButton")}</span>
                  </>
                )}
              </button>
            )}

            {resultBlob && resultUrl && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-300">{t("step3Description")}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-base font-semibold text-white transition hover:bg-emerald-500"
                  >
                    <Download size={20} strokeWidth={2} />
                    {t("downloadButton")}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-xl border border-white/20 bg-slate-800 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
                  >
                    {tCommon("reset")}
                  </button>
                </div>
              </div>
            )}
          </section>

          <aside className="space-y-8 lg:max-w-[340px]">
            <EditorialSection namespace="tools.cropImage" />
          </aside>
        </div>

        <div className="mt-10">
          <RelatedTools locale={locale} currentSlug="crop-image" />
        </div>

        <div className="mt-10">
          <FaqSection namespace="tools.cropImage" />
        </div>
      </main>
    </div>
  );
}
