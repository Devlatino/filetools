"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Copy, Check, RefreshCw } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const CHARS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

function generatePassword(length, options) {
  let charset = "";
  if (options.upper) charset += CHARS.upper;
  if (options.lower) charset += CHARS.lower;
  if (options.numbers) charset += CHARS.numbers;
  if (options.symbols) charset += CHARS.symbols;
  if (!charset) charset = CHARS.lower;

  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((x) => charset[x % charset.length])
    .join("");
}

function getStrength(password) {
  if (!password) return "weak";
  let score = 0;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 2) return "weak";
  if (score <= 3) return "fair";
  if (score <= 5) return "strong";
  return "very-strong";
}

export default function PasswordGeneratorPage() {
  const locale = useLocale();
  const t = useTranslations("tools.passwordGenerator");
  const tCommon = useTranslations("common");

  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    upper: true,
    lower: true,
    numbers: true,
    symbols: false,
  });
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    setPassword(generatePassword(length, options));
  }, [length, options]);

  useEffect(() => {
    generate();
  }, [generate]);

  const handleOptionChange = useCallback(
    (key) => (e) => {
      const next = { ...options, [key]: e.target.checked };
      setOptions(next);
    },
    [options]
  );

  const handleCopy = useCallback(() => {
    if (!password) return;
    navigator.clipboard.writeText(password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [password]);

  const strength = getStrength(password);
  const strengthLabels = {
    weak: t("weak"),
    fair: t("fair"),
    strong: t("strong"),
    "very-strong": t("veryStrong"),
  };
  const strengthColors = {
    weak: "bg-red-500",
    fair: "bg-orange-500",
    strong: "bg-yellow-500",
    "very-strong": "bg-emerald-500",
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
          toolPath="password-generator"
        />

        <div className="mt-6 space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("title")}</h1>
            <p className="mt-1 text-sm text-slate-300">{t("description")}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-6">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">{t("length")}</span>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={8}
                  max={64}
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  className="h-2 flex-1 accent-sky-500"
                />
                <span className="w-10 text-right font-mono text-slate-200">{length}</span>
              </div>
            </label>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.upper}
                  onChange={handleOptionChange("upper")}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-sky-500"
                />
                <span className="text-sm text-slate-200">{t("uppercase")}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.lower}
                  onChange={handleOptionChange("lower")}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-sky-500"
                />
                <span className="text-sm text-slate-200">{t("lowercase")}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.numbers}
                  onChange={handleOptionChange("numbers")}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-sky-500"
                />
                <span className="text-sm text-slate-200">{t("numbers")}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.symbols}
                  onChange={handleOptionChange("symbols")}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-sky-500"
                />
                <span className="text-sm text-slate-200">{t("symbols")}</span>
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={generate}
                className="flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-base font-semibold text-white transition hover:bg-sky-500"
              >
                {t("generate")}
              </button>
              <button
                type="button"
                onClick={generate}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
              >
                <RefreshCw size={18} />
                {t("regenerate")}
              </button>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!password}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-700 disabled:opacity-40"
              >
                {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                {copied ? t("copied") : t("copy")}
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">{t("result")}</label>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-800/60 p-4">
                <code className="flex-1 break-all font-mono text-sm text-slate-200 select-all">
                  {password || "—"}
                </code>
              </div>
              {password && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-400">{t("strength")}:</span>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium`}>
                    <span className={`h-2 w-2 rounded-full ${strengthColors[strength]}`} aria-hidden />
                    {strengthLabels[strength]}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <EditorialSection namespace="tools.passwordGenerator" />

        <div className="mx-auto max-w-6xl px-4 pb-4 sm:px-6 lg:px-8">
          <RelatedTools locale={locale} currentSlug="password-generator" />
          <div className="mt-10">
            <FaqSection namespace="tools.passwordGenerator" />
          </div>
        </div>
      </main>
    </div>
  );
}
