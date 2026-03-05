"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import JSZip from "jszip";
import { Upload, Loader2, Download } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SchemaMarkup } from "@/components/SchemaMarkup";

const FAVICON_SIZES = [
  { name: "favicon.ico", sizes: [16, 32, 48] },
  { name: "favicon-16x16.png", size: 16 },
  { name: "favicon-32x32.png", size: 32 },
  { name: "favicon-48x48.png", size: 48 },
  { name: "favicon-96x96.png", size: 96 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "android-chrome-192x192.png", size: 192 },
  { name: "android-chrome-512x512.png", size: 512 },
];

function drawImageToCanvas(img, size) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, size, size);
  return canvas;
}

function createIco(canvases) {
  const pngDatas = canvases.map((c) => {
    const dataUrl = c.toDataURL("image/png");
    const base64 = dataUrl.split(",")[1];
    return Uint8Array.from(atob(base64), (ch) => ch.charCodeAt(0));
  });

  const numImages = pngDatas.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = numImages * dirEntrySize;

  let offset = headerSize + dirSize;
  const entries = pngDatas.map((png, i) => {
    const size = canvases[i].width;
    const entry = { size, dataOffset: offset, dataLength: png.length };
    offset += png.length;
    return entry;
  });

  const totalSize = offset;
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);

  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, numImages, true);

  entries.forEach((entry, i) => {
    const base = 6 + i * 16;
    view.setUint8(base, entry.size >= 256 ? 0 : entry.size);
    view.setUint8(base + 1, entry.size >= 256 ? 0 : entry.size);
    view.setUint8(base + 2, 0);
    view.setUint8(base + 3, 0);
    view.setUint16(base + 4, 1, true);
    view.setUint16(base + 6, 32, true);
    view.setUint32(base + 8, entry.dataLength, true);
    view.setUint32(base + 12, entry.dataOffset, true);
  });

  let dataOffset = headerSize + dirSize;
  pngDatas.forEach((png) => {
    new Uint8Array(buffer, dataOffset, png.length).set(png);
    dataOffset += png.length;
  });

  return new Uint8Array(buffer);
}

function getWebmanifest() {
  return JSON.stringify(
    {
      name: "",
      short_name: "",
      icons: [
        { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
        { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
      ],
      theme_color: "#ffffff",
      background_color: "#ffffff",
      display: "standalone",
    },
    null,
    2
  );
}

export default function FaviconGeneratorPage() {
  const locale = useLocale();
  const t = useTranslations("tools.faviconGenerator");
  const tCommon = useTranslations("common");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const imgRef = useRef(null);

  const previewUrlRef = useRef(null);
  const processFile = useCallback(
    (file) => {
      if (!file) {
        setImageFile(null);
        if (previewUrlRef.current) {
          URL.revokeObjectURL(previewUrlRef.current);
          previewUrlRef.current = null;
        }
        setPreviewUrl(null);
        setError("");
        return;
      }
      const isImage =
        file.type === "image/png" ||
        file.type === "image/jpeg" ||
        file.type === "image/svg+xml" ||
        /\.(png|jpe?g|svg)$/i.test(file.name);
      if (!isImage) {
        setError(t("errorGeneric"));
        return;
      }
      setError("");
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = URL.createObjectURL(file);
      setImageFile(file);
      setPreviewUrl(previewUrlRef.current);
    },
    [t]
  );

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

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

  const handleGenerate = useCallback(async () => {
    if (!imageFile || !imgRef.current) {
      setError(t("errorGeneric"));
      return;
    }
    setError("");
    setIsGenerating(true);
    try {
      const img = imgRef.current;
      const zip = new JSZip();

      const icoCanvases = [16, 32, 48].map((s) => drawImageToCanvas(img, s));
      const icoBytes = createIco(icoCanvases);
      zip.file("favicon.ico", icoBytes);

      for (const item of FAVICON_SIZES) {
        if (item.sizes) continue;
        const canvas = drawImageToCanvas(img, item.size);
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
        if (blob) zip.file(item.name, blob);
      }

      zip.file("site.webmanifest", getWebmanifest());

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "favicon-package.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError(t("errorGeneric"));
    } finally {
      setIsGenerating(false);
    }
  }, [imageFile, t]);

  const previewSizes = [16, 32, 48, 96, 180, 192, 512];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <SchemaMarkup
        title={t("metaTitle")}
        description={t("metaDescription")}
        slug="favicon-generator"
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
          toolPath="favicon-generator"
        />

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_340px]">
          <section className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("metaTitle")}</h1>
              <p className="mt-1 text-sm text-slate-300">{t("metaDescription")}</p>
            </div>

            {!imageFile ? (
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
                  accept="image/png,image/jpeg,image/svg+xml,.png,.jpg,.jpeg,.svg"
                  className="sr-only"
                  onChange={handleFileChange}
                />
                <Upload size={40} strokeWidth={1.5} className={isDragOver ? "text-sky-400" : "text-sky-500/80"} />
                <p className={`text-center text-sm font-medium ${isDragOver ? "text-sky-200" : "text-slate-300"}`}>{t("dropzone")}</p>
              </label>
            ) : (
              <>
                <p className="text-sm font-medium text-slate-200">{t("preview")}</p>
                <div className="flex flex-wrap items-start gap-6">
                  <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
                    <img
                      ref={imgRef}
                      src={previewUrl}
                      alt=""
                      className="max-h-48 w-auto max-w-full rounded object-contain"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {previewSizes.map((size) => (
                      <div key={size} className="flex flex-col items-center gap-1 rounded border border-slate-700 bg-slate-900/50 p-2">
                        <div className="flex h-16 w-16 items-center justify-center rounded bg-slate-800">
                          <img
                            src={previewUrl}
                            alt=""
                            className="max-h-full max-w-full object-contain"
                            style={{ width: Math.min(size, 64), height: Math.min(size, 64) }}
                            crossOrigin="anonymous"
                          />
                        </div>
                        <span className="text-[10px] text-slate-400">{size}×{size}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-500">{t("filesIncluded")}</p>
                <ul className="list-inside list-disc text-xs text-slate-400">
                  {FAVICON_SIZES.map((f) => (f.sizes ? `favicon.ico (${f.sizes.join(", ")}px)` : f.name)).map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                  <li>site.webmanifest</li>
                </ul>
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={handleGenerate}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-sky-500 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={22} className="animate-spin shrink-0" />
                      <span>{t("generating")}</span>
                    </>
                  ) : (
                    <>
                      <Download size={22} strokeWidth={2} className="shrink-0" />
                      <span>{t("download")}</span>
                    </>
                  )}
                </button>
              </>
            )}

            {error && <p className="text-sm text-rose-400">{error}</p>}
          </section>

          <aside className="space-y-8 lg:max-w-[340px]">
            <EditorialSection namespace="tools.faviconGenerator" />
          </aside>
        </div>

        <div className="mt-10">
          <RelatedTools locale={locale} currentSlug="favicon-generator" />
        </div>

        <div className="mt-10">
          <FaqSection namespace="tools.faviconGenerator" />
        </div>
      </main>
    </div>
  );
}
