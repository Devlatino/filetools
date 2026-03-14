"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Copy, Check, Trash2 } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  rgbToCmyk,
  cmykToRgb,
  getContrastRatio,
  generateHarmonics,
  generateShades,
  parseHex,
  parseRgb,
  parseHsl,
  parseCmyk,
} from "@/lib/colorUtils";

const DEFAULT_HEX = "#3b82f6";

function CopyButton({ onCopy, copied, label }) {
  const t = useTranslations("tools.colorPicker");
  return (
    <button
      type="button"
      onClick={onCopy}
      className="flex items-center gap-1 rounded border border-white/10 bg-slate-800 px-2 py-1 text-xs text-slate-300 transition hover:bg-slate-700"
      title={t("clickToCopy")}
    >
      {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
      {copied ? t("copied") : label}
    </button>
  );
}

export default function ColorPickerPage() {
  const locale = useLocale();
  const t = useTranslations("tools.colorPicker");
  const tCommon = useTranslations("common");

  const [hex, setHex] = useState(DEFAULT_HEX);
  const [rgbInput, setRgbInput] = useState("59, 130, 246");
  const [hslInput, setHslInput] = useState("217, 91%, 60%");
  const [cmykInput, setCmykInput] = useState("76, 47, 0, 4");
  const [history, setHistory] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);
  const cmyk = rgbToCmyk(rgb);
  const contrast = getContrastRatio(hex);
  const harmonics = generateHarmonics(hex);
  const shades = generateShades(hex);

  const setColorFromHex = useCallback((newHex) => {
    setHex(newHex);
    const r = hexToRgb(newHex);
    setRgbInput(`${r.r}, ${r.g}, ${r.b}`);
    const h = rgbToHsl(r);
    setHslInput(`${h.h}, ${h.s}%, ${h.l}%`);
    const c = rgbToCmyk(r);
    setCmykInput(`${c.c}, ${c.m}, ${c.y}, ${c.k}`);
    setHistory((prev) => {
      const next = [newHex, ...prev.filter((x) => x !== newHex)].slice(0, 10);
      return next;
    });
  }, []);

  const handleHexChange = (e) => {
    const v = e.target.value.trim();
    if (v.startsWith("#")) setHex(v);
    const parsed = parseHex(v);
    if (parsed) setColorFromHex(parsed);
  };

  const handleRgbChange = (e) => {
    setRgbInput(e.target.value);
    const parsed = parseRgb(e.target.value);
    if (parsed) setColorFromHex(rgbToHex(parsed));
  };

  const handleHslChange = (e) => {
    setHslInput(e.target.value);
    const parsed = parseHsl(e.target.value);
    if (parsed) setColorFromHex(rgbToHex(hslToRgb(parsed)));
  };

  const handleCmykChange = (e) => {
    setCmykInput(e.target.value);
    const parsed = parseCmyk(e.target.value);
    if (parsed) setColorFromHex(rgbToHex(cmykToRgb(parsed)));
  };

  const handleNativeColorChange = (e) => setColorFromHex(e.target.value);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  };

  const formats = [
    { id: "hex", label: "HEX", value: hex },
    { id: "rgb", label: "RGB", value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { id: "rgba", label: "RGBA", value: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)` },
    { id: "hsl", label: "HSL", value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { id: "hsla", label: "HSLA", value: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 1)` },
    {
      id: "cmyk",
      label: "CMYK",
      value: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
    },
    {
      id: "css",
      label: t("cssVariable"),
      value: `--color-primary: ${hex}`,
    },
  ];

  const aaNormal = 4.5;
  const aaLarge = 3;
  const aaaNormal = 7;
  const aaaLarge = 4.5;
  const whitePassAA = contrast.onWhite >= aaNormal;
  const whitePassAAA = contrast.onWhite >= aaaNormal;
  const blackPassAA = contrast.onBlack >= aaNormal;
  const blackPassAAA = contrast.onBlack >= aaaNormal;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href={`/${locale === "en" ? "" : locale}/`} prefetch className="flex items-center gap-2">
            <img src="/fileflip-logo.svg" alt={tCommon("siteName")} className="h-11 w-auto" width={170} height={44} />
            <span className="text-sm text-slate-400">{t("title")}</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumb
          locale={locale}
          homeLabel={tCommon("breadcrumbHome")}
          toolsLabel={tCommon("nav.tools")}
          toolLabel={t("title")}
          toolPath="color-picker"
        />

        <div className="mt-6">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("title")}</h1>
          <p className="mt-1 text-sm text-slate-300">{t("description")}</p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Left: Picker + inputs + preview */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-start gap-4">
              <input
                type="color"
                value={hex}
                onChange={handleNativeColorChange}
                className="h-14 w-14 cursor-pointer rounded-xl border border-white/20 bg-transparent"
              />
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-slate-400">{t("hexCode")}</label>
                  <input
                    type="text"
                    value={hex}
                    onChange={handleHexChange}
                    className="mt-0.5 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 font-mono text-sm text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400">{t("rgbCode")}</label>
                  <input
                    type="text"
                    value={rgbInput}
                    onChange={handleRgbChange}
                    placeholder="r, g, b"
                    className="mt-0.5 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 font-mono text-sm text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400">{t("hslCode")}</label>
                  <input
                    type="text"
                    value={hslInput}
                    onChange={handleHslChange}
                    placeholder="h, s%, l%"
                    className="mt-0.5 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 font-mono text-sm text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400">{t("cmykCode")}</label>
                  <input
                    type="text"
                    value={cmykInput}
                    onChange={handleCmykChange}
                    placeholder="c, m, y, k"
                    className="mt-0.5 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 font-mono text-sm text-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div>
              <p className="mb-2 text-xs font-medium text-slate-400">{t("preview")}</p>
              <div className="flex flex-wrap gap-4">
                <div
                  className="flex min-h-[120px] min-w-[120px] flex-col items-center justify-center rounded-xl border border-white/10"
                  style={{ backgroundColor: hex }}
                >
                  <span className="px-2 py-1 text-sm font-medium text-white" style={{ backgroundColor: hex }}>
                    {t("onWhite")} {contrast.onWhite.toFixed(1)}:1
                  </span>
                  <span className="mt-1 text-xs">
                    {whitePassAAA ? `${t("wcagAAA")} ${t("pass")}` : whitePassAA ? `${t("wcagAA")} ${t("pass")}` : `${t("wcagAA")} ${t("fail")}`}
                  </span>
                  <span className="mt-1 px-2 py-1 text-sm font-medium text-black" style={{ backgroundColor: hex }}>
                    {t("onBlack")} {contrast.onBlack.toFixed(1)}:1
                  </span>
                  <span className="mt-1 text-xs">
                    {blackPassAAA ? `${t("wcagAAA")} ${t("pass")}` : blackPassAA ? `${t("wcagAA")} ${t("pass")}` : `${t("wcagAA")} ${t("fail")}`}
                  </span>
                </div>
              </div>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">{t("history")}</span>
                  <button
                    type="button"
                    onClick={() => setHistory([])}
                    className="flex items-center gap-1 rounded border border-white/10 bg-slate-800 px-2 py-1 text-xs text-slate-400 hover:bg-slate-700"
                  >
                    <Trash2 size={12} />
                    {t("clearHistory")}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {history.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setColorFromHex(h)}
                      className="h-8 w-8 rounded-lg border border-white/20 shadow transition hover:scale-110"
                      style={{ backgroundColor: h }}
                      title={h}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Copyable formats + harmonies + shades */}
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-medium text-slate-400">{t("contrastRatio")}</p>
              <div className="space-y-2 rounded-xl border border-white/10 bg-slate-900/60 p-3">
                {formats.map(({ id, label, value }) => (
                  <div key={id} className="flex flex-wrap items-center justify-between gap-2">
                    <code className="break-all font-mono text-sm text-slate-300">{value}</code>
                    <CopyButton
                      label={t("copy")}
                      copied={copiedId === id}
                      onCopy={() => copyToClipboard(value, id)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-slate-400">{t("colorHarmonies")}</p>
              <div className="space-y-3 rounded-xl border border-white/10 bg-slate-900/60 p-3">
                {[
                  { key: "complementary", label: t("complementary"), colors: harmonics.complementary },
                  { key: "analogous", label: t("analogous"), colors: harmonics.analogous },
                  { key: "triadic", label: t("triadic"), colors: harmonics.triadic },
                  { key: "splitComplementary", label: t("splitComplementary"), colors: harmonics.splitComplementary },
                  { key: "tetradic", label: t("tetradic"), colors: harmonics.tetradic },
                ].map(({ key, label, colors }) => (
                  <div key={key}>
                    <p className="mb-1 text-xs text-slate-500">{label}</p>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((c) => (
                        <div key={c} className="group relative">
                          <button
                            type="button"
                            onClick={() => setColorFromHex(c)}
                            className="h-9 w-9 rounded-lg border border-white/20 shadow transition hover:scale-110"
                            style={{ backgroundColor: c }}
                          />
                          <span className="pointer-events-none absolute left-0 top-full z-10 mt-1 hidden rounded bg-slate-800 px-2 py-1 text-xs font-mono text-slate-200 group-hover:block">
                            {c}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(c, `harm-${c}`);
                            }}
                            className="absolute -right-1 -top-1 rounded bg-slate-700 p-0.5 opacity-0 transition group-hover:opacity-100"
                          >
                            <Copy size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-slate-400">{t("tintsShades")}</p>
              <div className="flex flex-wrap gap-2 rounded-xl border border-white/10 bg-slate-900/60 p-3">
                {shades.map((s, i) => (
                  <div key={s} className="group relative">
                    <button
                      type="button"
                      onClick={() => setColorFromHex(s)}
                      className="h-8 w-10 rounded border border-white/20 transition hover:scale-105"
                      style={{ backgroundColor: s }}
                    />
                    <span className="pointer-events-none absolute left-0 top-full z-10 mt-1 hidden rounded bg-slate-800 px-2 py-1 text-xs font-mono group-hover:block">
                      {(i + 1) * 10}% — {s}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-white/10 bg-slate-900/40 p-4">
          <h2 className="mb-2 text-sm font-semibold text-slate-50">{t("howToUse")}</h2>
          <ul className="list-inside list-disc space-y-1 text-sm text-slate-300">
            <li>{t("step1")}</li>
            <li>{t("step2")}</li>
            <li>{t("step3")}</li>
          </ul>
        </div>
      </main>

      <EditorialSection namespace="tools.colorPicker" />

      <div className="mx-auto max-w-6xl px-4 pb-4 sm:px-6 lg:px-8">
        <RelatedTools locale={locale} currentSlug="color-picker" />
        <div className="mt-10">
          <FaqSection namespace="tools.colorPicker" />
        </div>
      </div>
    </div>
  );
}
