"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import * as QRCode from "qrcode";
import { getToolFaq } from "@/lib/toolFaqs";
import { FaqSection } from "@/components/FaqSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";

export default function QrGeneratorPage() {
  const locale = useLocale();
  const t = useTranslations("tools.qrGenerator");
  const tCommon = useTranslations("common");
  const [text, setText] = useState("");
  const [size, setSize] = useState(256);
  const [colorDark, setColorDark] = useState("#000000");
  const [colorLight, setColorLight] = useState("#ffffff");
  const [dataUrl, setDataUrl] = useState("");
  const [error, setError] = useState("");

  const options = { width: size, margin: 2, color: { dark: colorDark, light: colorLight } };

  useEffect(() => {
    if (!text.trim()) {
      setDataUrl("");
      return;
    }
    setError("");
    QRCode.toDataURL(text, options)
      .then(setDataUrl)
      .catch((err) => {
        setError(t("errorGenerate"));
        setDataUrl("");
      });
  }, [text, size, colorDark, colorLight]);

  const presets = {
    url: "https://example.com",
    email: "mailto:hello@example.com",
    phone: "tel:+390123456789",
    wifi: "WIFI:T:WPA;S:MyNetwork;P:password;;",
  };

  const handleDownloadPng = useCallback(() => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "qrcode.png";
    a.click();
  }, [dataUrl]);

  const handleDownloadSvg = useCallback(async () => {
    if (!text.trim()) return;
    try {
      const svg = await QRCode.toString(text, { type: "svg", width: size, margin: 2, color: { dark: colorDark, light: colorLight } });
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "qrcode.svg";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(t("errorSvg"));
    }
  }, [text, size, colorDark, colorLight]);

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
        <Breadcrumb locale={locale} homeLabel={tCommon("breadcrumbHome")} toolsLabel={tCommon("nav.tools")} toolLabel={t("label")} toolPath="qr-generator" />
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("metaTitle")}</h1>
          <p className="max-w-xl text-sm text-slate-300">{t("metaDescription")}</p>
        </section>
        <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-5">
          <label className="block text-xs font-medium text-slate-300">Content (URL or text)</label>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="https://… or any text" className="mt-1 min-h-[80px] w-full rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-200 placeholder:text-slate-500" />
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(presets).map(([key, value]) => (
              <button key={key} type="button" onClick={() => setText(value)} className="rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-300 hover:bg-slate-800 capitalize">{key}</button>
            ))}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs text-slate-400">Size (px)</label>
              <input type="number" min={64} max={512} value={size} onChange={(e) => setSize(Number(e.target.value))} className="mt-1 w-full rounded border border-slate-700 bg-slate-950/60 px-2 py-1 text-sm text-slate-200" />
            </div>
            <div>
              <label className="block text-xs text-slate-400">QR color</label>
              <input type="text" value={colorDark} onChange={(e) => setColorDark(e.target.value)} placeholder="#000000" className="mt-1 w-full rounded border border-slate-700 bg-slate-950/60 px-2 py-1 text-sm text-slate-200" />
            </div>
            <div>
              <label className="block text-xs text-slate-400">Background</label>
              <input type="text" value={colorLight} onChange={(e) => setColorLight(e.target.value)} placeholder="#ffffff" className="mt-1 w-full rounded border border-slate-700 bg-slate-950/60 px-2 py-1 text-sm text-slate-200" />
            </div>
          </div>
          {dataUrl && (
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <img src={dataUrl} alt="QR code" className="rounded-lg border border-slate-700 bg-white object-contain" width={size} height={size} />
              <div className="flex gap-2">
                <button type="button" onClick={handleDownloadPng} className="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400">{t("downloadPng")}</button>
                <button type="button" onClick={handleDownloadSvg} className="rounded-full border border-sky-400/50 px-4 py-2 text-xs font-semibold text-sky-200 hover:bg-slate-800">{t("downloadSvg")}</button>
              </div>
            </div>
          )}
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        </section>
        <RelatedTools locale={locale} currentSlug="qr-generator" />
        <FaqSection namespace="tools.qrGenerator" faqs={getToolFaq("qr-generator")} />
      </main>
    </div>
  );
}
