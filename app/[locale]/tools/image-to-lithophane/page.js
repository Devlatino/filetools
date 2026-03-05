"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Upload, Download } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { imageToLithophaneGeometry, lithophaneGeometryToSTLBinary } from "@/lib/lithophane";
import { useThreeViewer } from "@/lib/useThreeViewer";

const DEFAULT_WIDTH = 100;
const DEFAULT_MIN_THICKNESS = 0.8;
const DEFAULT_MAX_THICKNESS = 3.0;
const DEFAULT_RESOLUTION = 100;

export default function ImageToLithophanePage() {
  const locale = useLocale();
  const t = useTranslations("tools.lithophane");
  const tCommon = useTranslations("common");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [widthMm, setWidthMm] = useState(DEFAULT_WIDTH);
  const [minThickness, setMinThickness] = useState(DEFAULT_MIN_THICKNESS);
  const [maxThickness, setMaxThickness] = useState(DEFAULT_MAX_THICKNESS);
  const [resolution, setResolution] = useState(DEFAULT_RESOLUTION);
  const [progress, setProgress] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [stlBlob, setStlBlob] = useState(null);
  const [error, setError] = useState("");
  const [geometryVersion, setGeometryVersion] = useState(0);
  const containerRef = useRef(null);
  const geometryRef = useRef(null);
  const boundsRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  useThreeViewer(containerRef, geometryRef, boundsRef, geometryVersion);

  const loadImage = useCallback((fileItem) => {
    if (!fileItem || !/\.(jpe?g|png|webp)$/i.test(fileItem.name)) {
      setError(t("error"));
      setImageFile(null);
      setImagePreviewUrl("");
      return;
    }
    setError("");
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImagePreviewUrl(URL.createObjectURL(fileItem));
    setImageFile(fileItem);
    setStlBlob(null);
    geometryRef.current = null;
    boundsRef.current = null;
  }, [t, imagePreviewUrl]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    loadImage(e.dataTransfer?.files?.[0]);
  }, [loadImage]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) setIsDragOver(false);
  }, []);

  const generate = useCallback(() => {
    if (!imageFile) return;
    setGenerating(true);
    setProgress(0);
    setError("");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const geom = imageToLithophaneGeometry(
          imageData,
          { widthMm, minThickness, maxThickness, resolution },
          (p) => setProgress(p)
        );
        geometryRef.current = { positions: geom.positions, normals: geom.normals };
        boundsRef.current = geom.bounds;
        setGeometryVersion((v) => v + 1);
        const buffer = lithophaneGeometryToSTLBinary(geom.positions, geom.normals);
        setStlBlob(new Blob([buffer], { type: "application/octet-stream" }));
      } catch (err) {
        setError(t("error"));
      }
      setGenerating(false);
    };
    img.onerror = () => {
      setError(t("error"));
      setGenerating(false);
    };
    img.src = imagePreviewUrl;
  }, [imageFile, imagePreviewUrl, widthMm, minThickness, maxThickness, resolution, t]);

  const downloadStl = useCallback(() => {
    if (!stlBlob || !imageFile) return;
    const base = imageFile.name.replace(/\.(jpe?g|png|webp)$/i, "");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(stlBlob);
    a.download = `${base}.stl`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [stlBlob, imageFile]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <SchemaMarkup
        title={t("metaTitle")}
        description={t("metaDescription")}
        slug="image-to-lithophane"
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
        <Breadcrumb locale={locale} homeLabel={tCommon("breadcrumbHome")} toolsLabel={tCommon("nav.tools")} toolLabel={t("label")} toolPath="image-to-lithophane" />

        <div className="mt-6">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("metaTitle")}</h1>
          <p className="mt-1 text-sm text-slate-300">{t("metaDescription")}</p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="space-y-4">
            {!imageFile ? (
              <label
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 transition-colors ${
                  isDragOver ? "border-sky-500 bg-sky-500/10" : "border-slate-600 bg-slate-900/50"
                }`}
              >
                <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => loadImage(e.target.files?.[0])} />
                <Upload size={40} className="text-slate-400" />
                <p className="text-center text-sm text-slate-300">{t("dropzone")}</p>
              </label>
            ) : (
              <>
                <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
                  <p className="mb-2 text-xs font-medium text-slate-400">{t("width")}</p>
                  <input
                    type="number"
                    min={10}
                    max={300}
                    step={1}
                    value={widthMm}
                    onChange={(e) => setWidthMm(Number(e.target.value) || DEFAULT_WIDTH)}
                    className="mb-4 w-full rounded-lg border border-white/20 bg-slate-800 px-3 py-2 text-slate-100"
                  />
                  <p className="mb-2 text-xs font-medium text-slate-400">{t("minThickness")}</p>
                  <input
                    type="number"
                    min={0.2}
                    max={5}
                    step={0.1}
                    value={minThickness}
                    onChange={(e) => setMinThickness(Number(e.target.value) || DEFAULT_MIN_THICKNESS)}
                    className="mb-4 w-full rounded-lg border border-white/20 bg-slate-800 px-3 py-2 text-slate-100"
                  />
                  <p className="mb-2 text-xs font-medium text-slate-400">{t("maxThickness")}</p>
                  <input
                    type="number"
                    min={0.5}
                    max={10}
                    step={0.1}
                    value={maxThickness}
                    onChange={(e) => setMaxThickness(Number(e.target.value) || DEFAULT_MAX_THICKNESS)}
                    className="mb-4 w-full rounded-lg border border-white/20 bg-slate-800 px-3 py-2 text-slate-100"
                  />
                  <p className="mb-2 text-xs font-medium text-slate-400">{t("resolution")}</p>
                  <input
                    type="number"
                    min={20}
                    max={200}
                    step={5}
                    value={resolution}
                    onChange={(e) => setResolution(Number(e.target.value) || DEFAULT_RESOLUTION)}
                    className="mb-4 w-full rounded-lg border border-white/20 bg-slate-800 px-3 py-2 text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={generate}
                    disabled={generating}
                    className="w-full rounded-xl bg-sky-600 px-4 py-3 font-medium text-white transition hover:bg-sky-500 disabled:opacity-50"
                  >
                    {generating ? t("generating") : t("generate")}
                  </button>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <p className="mb-1 text-xs text-slate-400">Preview</p>
                    <img src={imagePreviewUrl} alt="" className="max-h-48 w-auto rounded-lg border border-white/10 object-contain" />
                  </div>
                </div>
                {generating && (
                  <div className="w-full rounded-full bg-slate-700">
                    <div className="h-2 rounded-full bg-sky-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                )}
                {stlBlob && (
                  <>
                    <div ref={containerRef} className="aspect-video w-full overflow-hidden rounded-xl bg-[#1a1a2e]" style={{ minHeight: 320 }} />
                    <p className="mt-2 text-sm text-slate-400">{t("tip")}</p>
                    <button
                      type="button"
                      onClick={downloadStl}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 font-medium text-white transition hover:bg-sky-500"
                    >
                      <Download size={20} />
                      {t("download")}
                    </button>
                  </>
                )}
              </>
            )}
            {error && <p className="text-sm text-rose-400">{error}</p>}
          </section>
          <aside className="space-y-6">
            <EditorialSection namespace="tools.lithophane" />
          </aside>
        </div>

        <div className="mt-10">
          <RelatedTools locale={locale} currentSlug="image-to-lithophane" />
        </div>
        <div className="mt-10">
          <FaqSection namespace="tools.lithophane" />
        </div>
      </main>
    </div>
  );
}
