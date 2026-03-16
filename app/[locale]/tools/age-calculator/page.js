"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { FaqSection } from "@/components/FaqSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  calculateAge,
  getZodiacSign,
  getChineseZodiac,
  getGeneration,
  getNextBirthday,
  formatNumber,
} from "@/lib/ageCalculator";

function todayStr() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

export default function AgeCalculatorPage() {
  const locale = useLocale();
  const t = useTranslations("tools.ageCalculator");
  const tCommon = useTranslations("common");
  const [birthDate, setBirthDate] = useState("");
  const [asOfDate, setAsOfDate] = useState(todayStr());

  const result = useMemo(() => {
    if (!birthDate || !asOfDate) return null;
    const birth = new Date(birthDate);
    const to = new Date(asOfDate);
    if (Number.isNaN(birth.getTime()) || Number.isNaN(to.getTime()) || birth > to) return null;
    return calculateAge(birthDate, asOfDate);
  }, [birthDate, asOfDate]);

  const nextBirthday = useMemo(() => {
    if (!birthDate || !asOfDate) return null;
    const birth = new Date(birthDate);
    const to = new Date(asOfDate);
    if (Number.isNaN(birth.getTime()) || Number.isNaN(to.getTime())) return null;
    return getNextBirthday(birthDate, asOfDate);
  }, [birthDate, asOfDate]);

  const birthWeekday = useMemo(() => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    if (Number.isNaN(birth.getTime())) return null;
    return birth.toLocaleDateString(locale, { weekday: "long" });
  }, [birthDate, locale]);

  const zodiac = useMemo(() => {
    if (!birthDate) return null;
    const [y, m, d] = birthDate.split("-").map(Number);
    return getZodiacSign(m, d);
  }, [birthDate]);

  const chineseZodiac = useMemo(() => {
    if (!birthDate) return null;
    const y = Number(birthDate.slice(0, 4));
    return getChineseZodiac(y);
  }, [birthDate]);

  const generation = useMemo(() => {
    if (!birthDate) return null;
    return getGeneration(Number(birthDate.slice(0, 4)));
  }, [birthDate]);

  const maxDate = todayStr();
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

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumb
          locale={locale}
          homeLabel={tCommon("breadcrumbHome")}
          toolsLabel={tCommon("nav.tools")}
          toolLabel={t("title")}
          toolPath="age-calculator"
        />

        <div className="mt-6">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("title")}</h1>
          <p className="mt-1 text-sm text-slate-300">{t("description")}</p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-300">{t("dateOfBirth")}</span>
            <input
              type="date"
              value={birthDate}
              max={maxDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-800/60 px-4 py-3 text-sm text-slate-100"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-300">{t("calculateAsOf")}</span>
            <input
              type="date"
              value={asOfDate}
              max={maxDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-800/60 px-4 py-3 text-sm text-slate-100"
            />
          </label>
        </div>

        {!birthDate && (
          <p className="mt-4 text-sm text-slate-400">{t("enterDate")}</p>
        )}

        {result && (
          <>
            <div className="mt-8 rounded-2xl border-2 border-sky-500/30 bg-sky-500/10 p-6 text-center">
              <p className="text-lg font-medium text-slate-300">{t("yearsOld")}</p>
              <p className="mt-2 text-2xl font-bold text-sky-200 sm:text-3xl">
                {t("result", {
                  years: result.years,
                  months: result.months,
                  days: result.days,
                })}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {[
                { key: "totalYears", value: result.years },
                { key: "totalMonths", value: formatNumber(result.totalMonths) },
                { key: "totalWeeks", value: formatNumber(result.totalWeeks) },
                { key: "totalDays", value: formatNumber(result.totalDays) },
                { key: "totalHours", value: formatNumber(result.totalHours) },
                { key: "totalMinutes", value: formatNumber(result.totalMinutes) },
              ].map(({ key, value }) => (
                <div
                  key={key}
                  className="rounded-xl border border-white/10 bg-slate-900/60 p-4 text-center"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{t(key)}</p>
                  <p className="mt-1 text-lg font-semibold text-slate-100">{value}</p>
                </div>
              ))}
            </div>

            {nextBirthday && (
              <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <h2 className="text-sm font-semibold text-slate-300">{t("nextBirthday")}</h2>
                <p className="mt-2 text-slate-100">
                  {t("daysUntil", { days: nextBirthday.daysUntil })} ({nextBirthday.weekday}, {nextBirthday.dateStr})
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-4">
              {birthWeekday && (
                <div className="rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3">
                  <span className="text-sm text-slate-400">{t("bornOn", { weekday: birthWeekday })}</span>
                </div>
              )}
              {generation && (
                <div className="rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3">
                  <span className="text-sm text-slate-400">{t("generation")}: </span>
                  <span className="text-sm font-medium text-slate-200">{generation}</span>
                </div>
              )}
              {zodiac && (
                <div className="rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3">
                  <span className="text-sm text-slate-400">{t("zodiac")}: </span>
                  <span className="text-sm font-medium text-slate-200">{zodiac.symbol} {zodiac.name}</span>
                </div>
              )}
              {chineseZodiac && (
                <div className="rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3">
                  <span className="text-sm text-slate-400">{t("chineseZodiac")}: </span>
                  <span className="text-sm font-medium text-slate-200">{chineseZodiac.emoji} {chineseZodiac.animal}</span>
                </div>
              )}
            </div>
          </>
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
          <RelatedTools locale={locale} currentSlug="age-calculator" />
        </div>

        <div className="mt-10">
          <FaqSection namespace="tools.ageCalculator" />
        </div>
      </main>
    </div>
  );
}
