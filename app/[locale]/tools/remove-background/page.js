"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { removeBackground } from "@imgly/background-removal";
import { getToolFaq } from "@/lib/toolFaqs";
import { FaqSection } from "@/components/FaqSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function RemoveBackgroundPage() {
  const locale = useLocale();
  const t = useTranslations("tools.removeBackground");
  const tCommon = useTranslations("common");
  const [file, setFile] = useState(null);
  const [resultUrl, setResultUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = useCallback((e) => {
    const f = e.target.files?.[0];
    setError("");
    setResultUrl("");
    if (!f) {
      setFile(null);
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      setError("Use JPG, PNG or WebP.");
      setFile(null);
      return;
    }
    setFile(f);
  }, []);

  const handleRemove = useCallback(async () => {
    if (!file) return;
    setError("");
    setIsProcessing(true);
    setResultUrl("");
    try {
      const blob = await removeBackground(file, { progress: () => {} });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (err) {
      setError("Processing failed. Try another image.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }, [file]);

  const handleDownload = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `${(file?.name || "image").replace(/\.[^.]+$/, "")}-nobg.png`;
    a.click();
  }, [resultUrl, file]);

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
        <Breadcrumb
          locale={locale}
          homeLabel={tCommon("breadcrumbHome")}
          toolsLabel={tCommon("nav.tools")}
          toolLabel={t("label")}
          toolPath="remove-background"
        />
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("metaTitle")}
          </h1>
          <p className="max-w-xl text-sm text-slate-300">{t("metaDescription")}</p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-5">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-50">1. Upload image</p>
                <p className="text-xs text-slate-400">JPG, PNG or WebP</p>
              </div>
              <label className="inline-flex cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-sm hover:bg-sky-400">
                Select image
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={!file || isProcessing}
                onClick={handleRemove}
                className="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-sm hover:bg-sky-400 disabled:opacity-50"
              >
                {isProcessing ? "Processing…" : "Remove background"}
              </button>
              {resultUrl && (
                <button
                  type="button"
                  onClick={handleDownload}
                  className="rounded-full border border-sky-400/50 bg-slate-800 px-4 py-2 text-xs font-semibold text-sky-200 hover:bg-slate-700"
                >
                  Download PNG
                </button>
              )}
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            {resultUrl && (
              <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950/60 p-2">
                <p className="mb-2 text-xs text-slate-400">Result (transparent background)</p>
                <div className="flex items-center justify-center rounded-lg bg-[repeating-conic-gradient(#333_0%_25%,#222_0%_50%)] bg-[length:12px_12px] p-4">
                  <img
                    src={resultUrl}
                    alt="No background"
                    className="max-h-64 w-auto object-contain"
                    width={400}
                    height={256}
                    loading="lazy"
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        <RelatedTools locale={locale} currentSlug="remove-background" />
        <FaqSection faqs={getToolFaq("remove-background")} />
      </main>
    </div>
  );
}
