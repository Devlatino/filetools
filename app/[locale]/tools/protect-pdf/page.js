"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Upload, Loader2, Check, Download, Lock } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

function StepIndicator({ step1, step2, step3, t }) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold sm:h-8 sm:w-8 ${
            step1 === "done" ? "bg-emerald-500 text-slate-950" : step1 === "active" ? "bg-sky-500 text-slate-950" : "bg-slate-700 text-slate-400"
          }`}
        >
          {step1 === "done" ? <Check size={14} strokeWidth={2.5} /> : "1"}
        </span>
        <span className={`text-xs font-medium sm:text-sm ${step1 === "active" ? "text-sky-300" : step1 === "done" ? "text-emerald-300" : "text-slate-500"}`}>
          {t("stepIndicatorUpload")}
        </span>
      </div>
      <div className="h-px w-4 bg-slate-600 sm:w-8" aria-hidden />
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold sm:h-8 sm:w-8 ${
            step2 === "done" ? "bg-emerald-500 text-slate-950" : step2 === "active" ? "bg-sky-500 text-slate-950" : "bg-slate-700 text-slate-400"
          }`}
        >
          {step2 === "done" ? <Check size={14} strokeWidth={2.5} /> : "2"}
        </span>
        <span className={`text-xs font-medium sm:text-sm ${step2 === "active" ? "text-sky-300" : step2 === "done" ? "text-emerald-300" : "text-slate-500"}`}>
          {t("stepIndicatorProtect")}
        </span>
      </div>
      <div className="h-px w-4 bg-slate-600 sm:w-8" aria-hidden />
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold sm:h-8 sm:w-8 ${
            step3 === "done" ? "bg-emerald-500 text-slate-950" : step3 === "active" ? "bg-sky-500 text-slate-950" : "bg-slate-700 text-slate-400"
          }`}
        >
          {step3 === "done" ? <Check size={14} strokeWidth={2.5} /> : "3"}
        </span>
        <span className={`text-xs font-medium sm:text-sm ${step3 === "active" ? "text-sky-300" : step3 === "done" ? "text-emerald-300" : "text-slate-500"}`}>
          {t("stepIndicatorDownload")}
        </span>
      </div>
    </div>
  );
}

export default function ProtectPdfPage() {
  const locale = useLocale();
  const t = useTranslations("tools.protectPdf");
  const tCommon = useTranslations("common");
  const [pdfFile, setPdfFile] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [allowPrint, setAllowPrint] = useState(true);
  const [resultBlob, setResultBlob] = useState(null);
  const [isProtecting, setIsProtecting] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const step1Status = currentStep >= 2 ? "done" : currentStep === 1 ? "active" : "pending";
  const step2Status = currentStep >= 3 ? "done" : currentStep === 2 ? "active" : "pending";
  const step3Status = currentStep === 3 ? "active" : "pending";

  const processFile = useCallback(
    (file) => {
      if (!file) {
        setPdfFile(null);
        setResultBlob(null);
        setCurrentStep(1);
        return;
      }
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      if (!isPdf) {
        setError(t("errorPdfOnly"));
        setPdfFile(null);
        return;
      }
      setError("");
      setResultBlob(null);
      setPdfFile(file);
      setCurrentStep(2);
    },
    [t]
  );

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

  const handleProtect = useCallback(async () => {
    if (!pdfFile) {
      setError(t("errorSelectFirst"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("errorMismatch"));
      return;
    }
    if (!password.trim()) {
      setError(t("errorMismatch"));
      return;
    }
    setError("");
    setIsProtecting(true);
    try {
      const formData = new FormData();
      formData.append("file", pdfFile);
      formData.append("password", password);
      formData.append("allowPrint", allowPrint.toString());

      const response = await fetch("/api/protect-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to protect PDF");
      }

      const blob = await response.blob();
      setResultBlob(blob);
      setCurrentStep(3);
    } catch (err) {
      console.error("Tool error:", err);
      setError(t("errorGeneric"));
    } finally {
      setIsProtecting(false);
    }
  }, [pdfFile, password, confirmPassword, allowPrint, t]);

  const handleDownload = useCallback(() => {
    if (!resultBlob || !pdfFile) return;
    const baseName = pdfFile.name.replace(/\.pdf$/i, "");
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${baseName}_protected.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [resultBlob, pdfFile]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
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
          toolPath="protect-pdf"
        />

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_340px]">
          <section className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("metaTitle")}</h1>
              <p className="mt-1 text-sm text-slate-300">{t("metaDescription")}</p>
            </div>

            <StepIndicator step1={step1Status} step2={step2Status} step3={step3Status} t={t} />

            <div className="w-full">
              {!pdfFile ? (
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
                  <input ref={fileInputRef} type="file" accept="application/pdf,.pdf" className="sr-only" onChange={handleFileChange} />
                  <Upload size={40} strokeWidth={1.5} className={isDragOver ? "text-sky-400" : "text-sky-500/80"} />
                  <p className={`text-center text-sm font-medium ${isDragOver ? "text-sky-200" : "text-slate-300"}`}>{t("dropzone")}</p>
                </label>
              ) : (
                <div className="flex h-[120px] w-full items-center gap-4 rounded-xl border-2 border-dashed border-sky-500/50 bg-slate-900/60 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-100">{pdfFile.name}</p>
                  </div>
                </div>
              )}
            </div>

            {pdfFile && !resultBlob && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="protect-password" className="block text-sm font-medium text-slate-200">
                    {t("password")}
                  </label>
                  <input
                    id="protect-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/20 bg-slate-800 px-4 py-3 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label htmlFor="protect-confirm" className="block text-sm font-medium text-slate-200">
                    {t("confirmPassword")}
                  </label>
                  <input
                    id="protect-confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/20 bg-slate-800 px-4 py-3 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={allowPrint}
                    onChange={(e) => setAllowPrint(e.target.checked)}
                    className="rounded border-slate-500 accent-sky-500"
                  />
                  {t("allowPrint")}
                </label>
              </div>
            )}

            {error && <p className="text-sm text-rose-400">{error}</p>}

            {pdfFile && !resultBlob && (
              <button
                type="button"
                disabled={isProtecting}
                onClick={handleProtect}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-sky-500 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition hover:bg-sky-400 hover:shadow-sky-400/30 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isProtecting ? (
                  <>
                    <Loader2 size={22} className="animate-spin shrink-0" />
                    <span>{t("protecting")}</span>
                  </>
                ) : (
                  <>
                    <Lock size={22} strokeWidth={2} className="shrink-0" />
                    <span>{t("protect")}</span>
                  </>
                )}
              </button>
            )}

            {resultBlob && (
              <div className="space-y-2">
                <p className="text-sm text-emerald-300">{t("step3Description")}</p>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-emerald-500 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 hover:shadow-emerald-400/30"
                >
                  <Download size={22} strokeWidth={2} className="shrink-0" />
                  {t("download")}
                </button>
              </div>
            )}
          </section>

          <aside className="space-y-8 lg:max-w-[340px]">
            <EditorialSection namespace="tools.protectPdf" />
          </aside>
        </div>

        <div className="mt-10">
          <RelatedTools locale={locale} currentSlug="protect-pdf" />
        </div>

        <div className="mt-10">
          <FaqSection namespace="tools.protectPdf" />
        </div>
      </main>
    </div>
  );
}
