"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { getToolFaq } from "@/lib/toolFaqs";
import { FaqSection } from "@/components/FaqSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join("");
}
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) h = s = 0;
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      default: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}
function getDominantColors(imageData, n) {
  const bins = {};
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 16) {
    const r = Math.floor(data[i] / 16) * 16, g = Math.floor(data[i + 1] / 16) * 16, b = Math.floor(data[i + 2] / 16) * 16;
    const key = r + "," + g + "," + b;
    if (!bins[key]) bins[key] = { r: 0, g: 0, b: 0, count: 0 };
    bins[key].r += data[i]; bins[key].g += data[i + 1]; bins[key].b += data[i + 2]; bins[key].count++;
  }
  return Object.entries(bins)
    .map(([, v]) => ({ r: v.r / v.count, g: v.g / v.count, b: v.b / v.count, count: v.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n)
    .map(({ r, g, b }) => {
      const hex = rgbToHex(r, g, b);
      const [h, s, l] = rgbToHsl(r, g, b);
      return { r: Math.round(r), g: Math.round(g), b: Math.round(b), hex, hsl: "hsl(" + h + "," + s + "%," + l + "%)" };
    });
}

export default function ColorPalettePage() {
  const locale = useLocale();
  const t = useTranslations("tools.colorPalette");
  const tCommon = useTranslations("common");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [colors, setColors] = useState([]);
  const [error, setError] = useState("");

  const handleFile = useCallback((e) => {
    const f = e.target.files?.[0];
    setError("");
    setColors([]);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    if (!f) { setFile(null); return; }
    if (!f.type.startsWith("image/")) { setError("Select an image."); setFile(null); return; }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }, [previewUrl]);

  const handleExtract = useCallback(() => {
    if (!file || !previewUrl) return;
    setError("");
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const max = 200;
      let w = img.naturalWidth, h = img.naturalHeight;
      if (w > max || h > max) { if (w > h) { h = (h * max) / w; w = max; } else { w = (w * max) / h; h = max; } }
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      setColors(getDominantColors(ctx.getImageData(0, 0, w, h), 6));
    };
    img.onerror = () => setError("Failed to load image.");
    img.src = previewUrl;
  }, [file, previewUrl]);

  const copyHex = useCallback((hex) => { navigator.clipboard.writeText(hex); }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href={`/${locale}/`} prefetch className="flex items-center gap-2">
            <img src="/fileflip-logo.svg" alt={tCommon("siteName")} className="h-9 w-auto" width={140} height={36} />
            <span className="text-sm text-slate-400">{t("label")}</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto flex max-w-4xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumb locale={locale} homeLabel={tCommon("breadcrumbHome")} toolsLabel={tCommon("nav.tools")} toolLabel={t("label")} toolPath="color-palette" />
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("metaTitle")}</h1>
          <p className="max-w-xl text-sm text-slate-300">{t("metaDescription")}</p>
        </section>
        <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-slate-50">1. Upload image</p>
            <label className="inline-flex cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400">
              Select image
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </label>
          </div>
          {previewUrl && (
            <>
              <div className="mt-4 flex items-center gap-4">
                <img src={previewUrl} alt="Preview" className="max-h-40 rounded-lg border border-slate-700 object-contain" />
                <button type="button" onClick={handleExtract} className="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400">
                  2. Extract palette
                </button>
              </div>
              {colors.length > 0 && (
                <div className="mt-4 space-y-3">
                  <p className="text-xs font-medium text-slate-100">6 dominant colors (click HEX to copy)</p>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((c, i) => (
                      <button key={i} type="button" onClick={() => copyHex(c.hex)} className="flex flex-col items-center rounded-lg border border-slate-700 overflow-hidden" title="Click to copy HEX">
                        <div className="h-14 w-20" style={{ backgroundColor: c.hex }} />
                        <span className="w-20 truncate p-1 text-[10px] text-slate-300">{c.hex}</span>
                        <span className="w-20 truncate px-1 pb-1 text-[10px] text-slate-500">rgb({c.r},{c.g},{c.b})</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex h-10 rounded-lg overflow-hidden border border-slate-700">
                    {colors.map((c, i) => (
                      <div key={i} className="flex-1" style={{ backgroundColor: c.hex }} title={c.hex} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        </section>
        <RelatedTools locale={locale} currentSlug="color-palette" />
        <FaqSection faqs={getToolFaq("color-palette")} />
      </main>
    </div>
  );
}
