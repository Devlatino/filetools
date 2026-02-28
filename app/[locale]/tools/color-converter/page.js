"use client";

import { useCallback, useState, useMemo } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { getToolFaq } from "@/lib/toolFaqs";
import { FaqSection } from "@/components/FaqSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

function hexToRgb(hex) {
  const n = hex.replace(/^#/, "");
  if (n.length !== 3 && n.length !== 6) return null;
  const r = n.length === 3 ? parseInt(n[0] + n[0], 16) : parseInt(n.slice(0, 2), 16);
  const g = n.length === 3 ? parseInt(n[1] + n[1], 16) : parseInt(n.slice(2, 4), 16);
  const b = n.length === 3 ? parseInt(n[2] + n[2], 16) : parseInt(n.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
  return { r, g, b };
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function hue2rgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0")).join("");
}

export default function ColorConverterPage() {
  const locale = useLocale();
  const t = useTranslations("tools.colorConverter");
  const tCommon = useTranslations("common");

  const [r, setR] = useState(59);
  const [g, setG] = useState(130);
  const [b, setB] = useState(246);

  const hexVal = useMemo(() => rgbToHex(r, g, b), [r, g, b]);
  const hslVal = useMemo(() => {
    const hl = rgbToHsl(r, g, b);
    return `${hl.h}, ${hl.s}%, ${hl.l}%`;
  }, [r, g, b]);
  const rgbVal = useMemo(() => `${r}, ${g}, ${b}`, [r, g, b]);

  const applyHex = useCallback((v) => {
    const parsed = hexToRgb(v);
    if (parsed) {
      setR(parsed.r);
      setG(parsed.g);
      setB(parsed.b);
    }
  }, []);
  const applyRgb = useCallback((v) => {
    const m = v.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (m) {
      setR(Math.max(0, Math.min(255, parseInt(m[1], 10))));
      setG(Math.max(0, Math.min(255, parseInt(m[2], 10))));
      setB(Math.max(0, Math.min(255, parseInt(m[3], 10))));
    }
  }, []);
  const applyHsl = useCallback((v) => {
    const m = v.match(/(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?/);
    if (m) {
      const { r: rr, g: gg, b: bb } = hslToRgb(parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10));
      setR(rr);
      setG(gg);
      setB(bb);
    }
  }, []);

  const previewBg = hexVal;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href={`/${locale}/`} prefetch className="flex items-center gap-2">
            <img src="/fileflip-logo.svg" alt={tCommon("siteName")} className="h-9 w-auto" width={140} height={36} />
            <span className="text-sm text-slate-400">{t("label")}</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto flex max-w-4xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumb locale={locale} homeLabel={tCommon("breadcrumbHome")} toolsLabel={tCommon("nav.tools")} toolLabel={t("label")} toolPath="color-converter" />
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("metaTitle")}</h1>
          <p className="max-w-xl text-sm text-slate-300">{t("metaDescription")}</p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-5">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-50">HEX</label>
              <input
                type="text"
                value={hexVal}
                onChange={(e) => applyHex(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 font-mono text-sm text-slate-100"
                placeholder="#3b82f6"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-50">RGB</label>
              <input
                type="text"
                value={rgbVal}
                onChange={(e) => applyRgb(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 font-mono text-sm text-slate-100"
                placeholder="59, 130, 246"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-50">HSL</label>
              <input
                type="text"
                value={hslVal}
                onChange={(e) => applyHsl(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 font-mono text-sm text-slate-100"
                placeholder="217, 91%, 60%"
              />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-slate-50">Preview</p>
              <div className="h-24 w-full rounded-xl border border-slate-700" style={{ backgroundColor: previewBg }} />
            </div>
          </div>
        </section>

        <RelatedTools locale={locale} currentSlug="color-converter" />
        <FaqSection faqs={getToolFaq("color-converter")} />
      </main>
    </div>
  );
}
