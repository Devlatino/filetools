"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Download } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SchemaMarkup } from "@/components/SchemaMarkup";

const MAX_LENGTH = 500;
const SIZE_OPTIONS = [128, 256, 512];
const DEFAULT_SIZE = 256;
const DEFAULT_FG = "#000000";
const DEFAULT_BG = "#ffffff";

export default function QrCodeGeneratorPage() {
  const locale = useLocale();
  const t = useTranslations("tools.qrCodeGenerator");
  const tCommon = useTranslations("common");
  const [text, setText] = useState("");
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [fgColor, setFgColor] = useState(DEFAULT_FG);
  const [bgColor, setBgColor] = useState(DEFAULT_BG);
  const [showTextBelow, setShowTextBelow] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const value = text.trim() || " ";
    let cancelled = false;
    import("qrcode").then((QRCode) => {
      if (cancelled || !canvasRef.current) return;
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 1,
        color: { dark: fgColor, light: bgColor },
      }).catch((err) => console.error(err));
    });
    return () => { cancelled = true; };
  }, [text, size, fgColor, bgColor]);

  const handleDownload = useCallback(() => {
    if (!canvasRef.current) return;
    const a = document.createElement("a");
    a.href = canvasRef.current.toDataURL("image/png");
    a.download = "qrcode.png";
    a.click();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <SchemaMarkup
        title={t("metaTitle")}
        description={t("metaDescription")}
        slug="qr-code-generator"
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
        <Breadcrumb locale={locale} homeLabel={tCommon("breadcrumbHome")} toolsLabel={tCommon("nav.tools")} toolLabel={t("label")} toolPath="qr-code-generator" />

        <div className="mt-6">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("metaTitle")}</h1>
          <p className="mt-1 text-sm text-slate-300">{t("metaDescription")}</p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <section className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-300">{t("inputLabel")}</span>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
                placeholder={t("inputPlaceholder")}
                rows={5}
                className="w-full rounded-xl border border-white/10 bg-slate-800/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500"
              />
              <span className="mt-1 block text-xs text-slate-500">{t("charCount", { current: text.length, max: MAX_LENGTH })}</span>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-300">{t("sizeLabel")}</span>
                <select
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-slate-100"
                >
                  {SIZE_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s} px</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-300">{t("colorFgLabel")}</span>
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="h-9 w-14 cursor-pointer rounded border border-white/10 bg-slate-800"
                />
                <span className="text-xs text-slate-500">{fgColor}</span>
              </label>
              <label className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-300">{t("colorBgLabel")}</span>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-9 w-14 cursor-pointer rounded border border-white/10 bg-slate-800"
                />
                <span className="text-xs text-slate-500">{bgColor}</span>
              </label>
            </div>
          </section>

          <section className="flex flex-col items-center justify-start rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            <span className="mb-3 block text-sm font-medium text-slate-300">{t("previewLabel")}</span>
            <div className="flex flex-col items-center">
              <canvas
                ref={canvasRef}
                width={size}
                height={size}
                className="max-w-full rounded-lg border border-white/10 bg-white"
                style={{ width: Math.min(size, 280), height: Math.min(size, 280) }}
                aria-hidden
              />
              {showTextBelow && text.trim() && (
                <p className="mt-3 max-w-[280px] break-all text-center text-xs text-slate-400">{text.trim()}</p>
              )}
              <label className="mt-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showTextBelow}
                  onChange={(e) => setShowTextBelow(e.target.checked)}
                  className="rounded border-white/20 bg-slate-800 text-sky-500"
                />
                <span className="text-sm text-slate-300">{t("showTextBelow")}</span>
              </label>
              <button
                type="button"
                onClick={handleDownload}
                className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-base font-semibold text-white transition hover:bg-emerald-500"
              >
                <Download size={20} strokeWidth={2} />
                {t("downloadButton")}
              </button>
            </div>
          </section>
        </div>

        <div className="mt-10">
          <EditorialSection namespace="tools.qrCodeGenerator" />
        </div>

        <div className="mt-10">
          <RelatedTools locale={locale} currentSlug="qr-code-generator" />
        </div>

        <div className="mt-10">
          <FaqSection namespace="tools.qrCodeGenerator" />
        </div>
      </main>
    </div>
  );
}
