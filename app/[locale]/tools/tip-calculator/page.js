"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { FaqSection } from "@/components/FaqSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const TIP_PRESETS = [10, 15, 18, 20, 25];
const QUALITY = [
  { key: "poor", pct: 10, emoji: "😞" },
  { key: "fair", pct: 15, emoji: "🙂" },
  { key: "good", pct: 18, emoji: "😊" },
  { key: "great", pct: 20, emoji: "😁" },
  { key: "excellent", pct: 25, emoji: "🤩" },
];
const CURRENCIES = [
  { id: "USD", symbol: "$" },
  { id: "EUR", symbol: "€" },
  { id: "GBP", symbol: "£" },
  { id: "JPY", symbol: "¥" },
  { id: "CAD", symbol: "C$" },
  { id: "AUD", symbol: "A$" },
  { id: "CHF", symbol: "Fr" },
  { id: "INR", symbol: "₹" },
];

export default function TipCalculatorPage() {
  const locale = useLocale();
  const t = useTranslations("tools.tipCalculator");
  const tCommon = useTranslations("common");
  const [billAmount, setBillAmount] = useState("");
  const [tipPercent, setTipPercent] = useState(18);
  const [customTip, setCustomTip] = useState(false);
  const [numPeople, setNumPeople] = useState(1);
  const [currency, setCurrency] = useState("USD");

  const bill = parseFloat(billAmount) || 0;
  const tipPct = customTip ? Math.min(50, Math.max(0, tipPercent)) : tipPercent;
  const people = Math.min(99, Math.max(1, numPeople));

  const result = useMemo(() => {
    const tipAmount = (bill * tipPct) / 100;
    const totalBill = bill + tipAmount;
    const perPerson = totalBill / people;
    const tipPerPerson = tipAmount / people;
    return {
      tipAmount: tipAmount.toFixed(2),
      totalBill: totalBill.toFixed(2),
      perPerson: perPerson.toFixed(2),
      tipPerPerson: tipPerPerson.toFixed(2),
    };
  }, [bill, tipPct, people]);

  const symbol = CURRENCIES.find((c) => c.id === currency)?.symbol ?? "$";
  const basePath = locale === "en" ? "" : `/${locale}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href={basePath ? `/${basePath}/` : "/"} prefetch className="flex items-center gap-2">
            <img src="/fileflip-logo.svg" alt={tCommon("siteName")} className="h-11 w-auto" width={170} height={44} />
            <span className="text-sm text-slate-400">{t("title")}</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <Breadcrumb
          locale={locale}
          homeLabel={tCommon("breadcrumbHome")}
          toolsLabel={tCommon("nav.tools")}
          toolLabel={t("title")}
          toolPath="tip-calculator"
        />

        <div className="mt-6">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("title")}</h1>
          <p className="mt-1 text-sm text-slate-300">{t("description")}</p>
        </div>

        <div className="mt-6 flex justify-end">
          <label className="flex items-center gap-2 text-sm text-slate-400">
            {t("currency")}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="rounded-lg border border-white/10 bg-slate-800 px-2 py-1.5 text-slate-200"
            >
              {CURRENCIES.map((c) => (
                <option key={c.id} value={c.id}>{c.id} ({c.symbol})</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 space-y-6">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-300">{t("billAmount")}</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={billAmount}
              onChange={(e) => setBillAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-white/10 bg-slate-800/60 px-4 py-4 text-2xl text-slate-100 placeholder:text-slate-500"
            />
          </label>

          <div>
            <span className="mb-2 block text-sm font-medium text-slate-300">{t("tipPercentage")}</span>
            <div className="flex flex-wrap gap-2">
              {TIP_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => { setTipPercent(p); setCustomTip(false); }}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                    !customTip && tipPercent === p
                      ? "border-sky-500 bg-sky-500/20 text-sky-200"
                      : "border-white/10 bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {p}%
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCustomTip(true)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                  customTip ? "border-sky-500 bg-sky-500/20 text-sky-200" : "border-white/10 bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {t("custom")}
              </button>
            </div>
            {customTip && (
              <div className="mt-3 flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={tipPercent}
                  onChange={(e) => setTipPercent(Number(e.target.value))}
                  className="flex-1 accent-sky-500"
                />
                <span className="w-12 text-right text-sm font-medium text-slate-300">{tipPercent}%</span>
              </div>
            )}
          </div>

          <div>
            <span className="mb-2 block text-sm font-medium text-slate-300">{t("serviceQuality")}</span>
            <div className="flex flex-wrap gap-2">
              {QUALITY.map(({ key, pct, emoji }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => { setTipPercent(pct); setCustomTip(false); }}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    !customTip && tipPercent === pct
                      ? "border-emerald-500 bg-emerald-500/20 text-emerald-200"
                      : "border-white/10 bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {t(key)} {emoji} {pct}%
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-2 block text-sm font-medium text-slate-300">{t("numberOfPeople")}</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setNumPeople((n) => Math.max(1, n - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-slate-800 text-xl text-slate-300 hover:bg-slate-700"
              >
                −
              </button>
              <span className="min-w-[2rem] text-center text-lg font-medium text-slate-100">{people}</span>
              <button
                type="button"
                onClick={() => setNumPeople((n) => Math.min(99, n + 1))}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-slate-800 text-xl text-slate-300 hover:bg-slate-700"
              >
                +
              </button>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <div className="flex justify-between text-slate-200">
              <span>{t("tipAmount")}</span>
              <span className="font-semibold text-emerald-400">{symbol}{result.tipAmount}</span>
            </div>
            <div className="flex justify-between text-slate-200">
              <span>{t("totalBill")}</span>
              <span className="font-semibold text-sky-300">{symbol}{result.totalBill}</span>
            </div>
            {people > 1 && (
              <>
                <div className="flex justify-between text-slate-300">
                  <span>{t("perPerson")}</span>
                  <span className="font-medium">{symbol}{result.perPerson}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>{t("tipPerPerson")}</span>
                  <span className="font-medium">{symbol}{result.tipPerPerson}</span>
                </div>
              </>
            )}
          </div>

          {people > 1 && (
            <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
              <h3 className="mb-2 text-sm font-semibold text-slate-300">{t("splitTable", { n: people })}</h3>
              <ul className="space-y-1 text-sm text-slate-400">
                {Array.from({ length: people }, (_, i) => (
                  <li key={i}>
                    {t("person")} {i + 1}: {symbol}{result.perPerson}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {!billAmount && (
          <p className="mt-4 text-sm text-slate-400">{t("enterBill")}</p>
        )}

        <section className="mt-10 rounded-2xl border border-white/10 bg-slate-900/40 p-4 sm:p-6">
          <h2 className="mb-3 text-lg font-semibold text-slate-50">{t("howToUse")}</h2>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-300">
            <li>{t("step1")}</li>
            <li>{t("step2")}</li>
            <li>{t("step3")}</li>
          </ol>
        </section>

        <div className="mt-10">
          <RelatedTools locale={locale} currentSlug="tip-calculator" />
        </div>

        <div className="mt-10">
          <FaqSection namespace="tools.tipCalculator" />
        </div>
      </main>
    </div>
  );
}
