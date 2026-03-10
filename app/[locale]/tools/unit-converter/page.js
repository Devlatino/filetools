"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeftRight } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const LENGTH_UNITS = [
  { key: "mm", label: "mm" },
  { key: "cm", label: "cm" },
  { key: "m", label: "m" },
  { key: "km", label: "km" },
  { key: "inch", label: "in" },
  { key: "foot", label: "ft" },
  { key: "yard", label: "yd" },
  { key: "mile", label: "mi" },
  { key: "nautical mile", label: "nmi" },
];

const LENGTH_TO_M = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  km: 1000,
  inch: 0.0254,
  foot: 0.3048,
  yard: 0.9144,
  mile: 1609.344,
  "nautical mile": 1852,
};

const WEIGHT_UNITS = [
  { key: "mg", label: "mg" },
  { key: "g", label: "g" },
  { key: "kg", label: "kg" },
  { key: "ton", label: "ton" },
  { key: "ounce", label: "oz" },
  { key: "pound", label: "lb" },
  { key: "stone", label: "st" },
];

const WEIGHT_TO_G = {
  mg: 0.001,
  g: 1,
  kg: 1000,
  ton: 1e6,
  ounce: 28.3495,
  pound: 453.592,
  stone: 6350.29,
};

const TEMP_UNITS = [
  { key: "celsius", label: "°C" },
  { key: "fahrenheit", label: "°F" },
  { key: "kelvin", label: "K" },
];

const AREA_UNITS = [
  { key: "mm2", label: "mm²" },
  { key: "cm2", label: "cm²" },
  { key: "m2", label: "m²" },
  { key: "km2", label: "km²" },
  { key: "hectare", label: "ha" },
  { key: "acre", label: "acre" },
  { key: "ft2", label: "ft²" },
  { key: "yd2", label: "yd²" },
  { key: "mile2", label: "mi²" },
];

const AREA_TO_M2 = {
  mm2: 1e-6,
  cm2: 1e-4,
  m2: 1,
  km2: 1e6,
  hectare: 1e4,
  acre: 4046.86,
  ft2: 0.092903,
  yd2: 0.836127,
  mile2: 2589988.11,
};

const VOLUME_UNITS = [
  { key: "ml", label: "ml" },
  { key: "cl", label: "cl" },
  { key: "dl", label: "dl" },
  { key: "L", label: "L" },
  { key: "m3", label: "m³" },
  { key: "tsp", label: "tsp" },
  { key: "tbsp", label: "tbsp" },
  { key: "fl oz", label: "fl oz" },
  { key: "cup", label: "cup" },
  { key: "pint", label: "pt" },
  { key: "quart", label: "qt" },
  { key: "gallon", label: "gal" },
];

const VOLUME_TO_L = {
  ml: 0.001,
  cl: 0.01,
  dl: 0.1,
  L: 1,
  m3: 1000,
  tsp: 0.00492892,
  tbsp: 0.0147868,
  "fl oz": 0.0295735,
  cup: 0.236588,
  pint: 0.473176,
  quart: 0.946353,
  gallon: 3.78541,
};

const SPEED_UNITS = [
  { key: "m/s", label: "m/s" },
  { key: "km/h", label: "km/h" },
  { key: "mph", label: "mph" },
  { key: "knot", label: "knot" },
  { key: "ft/s", label: "ft/s" },
];

const SPEED_TO_MS = {
  "m/s": 1,
  "km/h": 1 / 3.6,
  mph: 0.44704,
  knot: 0.514444,
  "ft/s": 0.3048,
};

const DATA_UNITS = [
  { key: "bit", label: "bit" },
  { key: "byte", label: "byte" },
  { key: "KB", label: "KB" },
  { key: "MB", label: "MB" },
  { key: "GB", label: "GB" },
  { key: "TB", label: "TB" },
  { key: "PB", label: "PB" },
];

const DATA_TO_BYTE = {
  bit: 0.125,
  byte: 1,
  KB: 1000,
  MB: 1e6,
  GB: 1e9,
  TB: 1e12,
  PB: 1e15,
};

function convertTemperature(value, from, to) {
  const valid = ["celsius", "fahrenheit", "kelvin"];
  if (!valid.includes(from) || !valid.includes(to)) return null;
  let celsius;
  if (from === "celsius") celsius = value;
  else if (from === "fahrenheit") celsius = ((value - 32) * 5) / 9;
  else if (from === "kelvin") celsius = value - 273.15;
  else return value;

  if (to === "celsius") return celsius;
  if (to === "fahrenheit") return (celsius * 9) / 5 + 32;
  if (to === "kelvin") return celsius + 273.15;
  return celsius;
}

function toSignificant(value, sig = 6) {
  if (value === 0 || !Number.isFinite(value)) return "0";
  const v = Math.abs(value);
  const order = Math.floor(Math.log10(v));
  const scale = Math.pow(10, sig - 1 - order);
  const rounded = Math.round(value * scale) / scale;
  return String(Number(rounded));
}

const CATEGORIES = [
  { id: "length", icon: "📏" },
  { id: "weight", icon: "⚖️" },
  { id: "temperature", icon: "🌡️" },
  { id: "area", icon: "📐" },
  { id: "volume", icon: "💧" },
  { id: "speed", icon: "⚡" },
  { id: "data", icon: "💾" },
];

function getUnits(cat) {
  if (cat === "length") return LENGTH_UNITS;
  if (cat === "weight") return WEIGHT_UNITS;
  if (cat === "temperature") return TEMP_UNITS;
  if (cat === "area") return AREA_UNITS;
  if (cat === "volume") return VOLUME_UNITS;
  if (cat === "speed") return SPEED_UNITS;
  if (cat === "data") return DATA_UNITS;
  return LENGTH_UNITS;
}

function convert(cat, value, from, to) {
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  if (cat === "temperature") return convertTemperature(num, from, to);
  let toBase, fromBase;
  if (cat === "length") {
    toBase = LENGTH_TO_M;
    fromBase = LENGTH_TO_M;
  } else if (cat === "weight") {
    toBase = WEIGHT_TO_G;
    fromBase = WEIGHT_TO_G;
  } else if (cat === "area") {
    toBase = AREA_TO_M2;
    fromBase = AREA_TO_M2;
  } else if (cat === "volume") {
    toBase = VOLUME_TO_L;
    fromBase = VOLUME_TO_L;
  } else if (cat === "speed") {
    toBase = SPEED_TO_MS;
    fromBase = SPEED_TO_MS;
  } else if (cat === "data") {
    toBase = DATA_TO_BYTE;
    fromBase = DATA_TO_BYTE;
  } else return null;
  const baseVal = num * (fromBase[from] ?? 1);
  return baseVal / (toBase[to] ?? 1);
}

export default function UnitConverterPage() {
  const locale = useLocale();
  const t = useTranslations("tools.unitConverter");
  const tCommon = useTranslations("common");

  const [category, setCategory] = useState("length");
  const [fromUnit, setFromUnit] = useState("m");
  const [toUnit, setToUnit] = useState("km");
  const [inputValue, setInputValue] = useState("1");

  const units = useMemo(() => getUnits(category), [category]);

  useEffect(() => {
    const first = units[0]?.key;
    const second = units[1]?.key;
    if (first) setFromUnit(first);
    if (second) setToUnit(second);
  }, [category]);

  const result = useMemo(() => {
    const val = convert(category, inputValue, fromUnit, toUnit);
    return val == null ? null : toSignificant(val);
  }, [category, inputValue, fromUnit, toUnit]);

  const formulaText = useMemo(() => {
    if (category === "temperature") {
      return "°F = (°C × 9/5) + 32  |  K = °C + 273.15";
    }
    const getToBase = () => {
      if (category === "length") return LENGTH_TO_M;
      if (category === "weight") return WEIGHT_TO_G;
      if (category === "area") return AREA_TO_M2;
      if (category === "volume") return VOLUME_TO_L;
      if (category === "speed") return SPEED_TO_MS;
      if (category === "data") return DATA_TO_BYTE;
      return {};
    };
    const toBase = getToBase();
    const fromVal = toBase[fromUnit];
    const toVal = toBase[toUnit];
    if (fromVal == null || toVal == null) return "";
    const oneInTo = fromVal / toVal;
    return `1 ${fromUnit} = ${toSignificant(oneInTo)} ${toUnit}`;
  }, [category, fromUnit, toUnit]);

  const equivalences = useMemo(() => {
    const num = Number(inputValue);
    if (!Number.isFinite(num) || category === "temperature") return [];
    const getToBase = () => {
      if (category === "length") return LENGTH_TO_M;
      if (category === "weight") return WEIGHT_TO_G;
      if (category === "area") return AREA_TO_M2;
      if (category === "volume") return VOLUME_TO_L;
      if (category === "speed") return SPEED_TO_MS;
      if (category === "data") return DATA_TO_BYTE;
      return {};
    };
    const toBase = getToBase();
    const baseVal = num * (toBase[fromUnit] ?? 0);
    return units.slice(0, 7).map(({ key, label }) => ({
      key,
      label,
      value: toSignificant(baseVal / (toBase[key] ?? 1)),
    }));
  }, [category, inputValue, fromUnit, units]);

  const handleSwap = useCallback(() => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  }, [fromUnit, toUnit]);

  const categoryLabels = {
    length: t("length"),
    weight: t("weight"),
    temperature: t("temperature"),
    area: t("area"),
    volume: t("volume"),
    speed: t("speed"),
    data: t("data"),
  };

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
          toolPath="unit-converter"
        />

        <div className="mt-6 space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("title")}</h1>
          <p className="text-sm text-slate-300">{t("description")}</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 border-b border-white/10 pb-4">
          {CATEGORIES.map(({ id, icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setCategory(id)}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                category === id ? "bg-sky-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {icon} {categoryLabels[id]}
            </button>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-400">{t("from")}</span>
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-3 text-base text-slate-100"
              >
                {units.map((u) => (
                  <option key={u.key} value={u.key}>{u.label}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-400">Value</span>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                step="any"
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-3 text-base text-slate-100"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-400">{t("to")}</span>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-3 text-base text-slate-100"
              >
                {units.map((u) => (
                  <option key={u.key} value={u.key}>{u.label}</option>
                ))}
              </select>
            </label>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleSwap}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-800 px-4 py-3 text-slate-200 transition hover:bg-slate-700"
                title={t("swap")}
              >
                <ArrowLeftRight size={20} />
                {t("swap")}
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-sky-500/10 border border-sky-500/20 px-4 py-4">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{t("result")}</span>
            <p className="mt-1 text-2xl font-semibold text-sky-300">{result ?? "—"}</p>
          </div>

          {formulaText && (
            <p className="text-xs text-slate-400">
              <span className="font-medium text-slate-500">{t("formula")}:</span> {formulaText}
            </p>
          )}

          {equivalences.length > 0 && (
            <div className="flex flex-wrap gap-3 text-sm">
              {equivalences.map(({ key, value }) => (
                <span key={key} className="rounded bg-slate-800 px-2 py-1 text-slate-300">
                  {inputValue} {fromUnit} = {value} {key}
                </span>
              ))}
            </div>
          )}
        </div>

        <EditorialSection namespace="tools.unitConverter" />

        <div className="mx-auto max-w-6xl px-4 pb-4 sm:px-6 lg:px-8">
          <RelatedTools locale={locale} currentSlug="unit-converter" />
          <div className="mt-10">
            <FaqSection namespace="tools.unitConverter" />
          </div>
        </div>
      </main>
    </div>
  );
}
