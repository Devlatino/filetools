"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { marked } from "marked";
import { getToolFaq } from "@/lib/toolFaqs";
import { FaqSection } from "@/components/FaqSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function MarkdownToHtmlPage() {
  const locale = useLocale();
  const t = useTranslations("tools.markdownToHtml");
  const tCommon = useTranslations("common");
  const [md, setMd] = useState("");
  const [html, setHtml] = useState("");
  const previewRef = useRef(null);

  useEffect(() => {
    if (!md) {
      setHtml("");
      return;
    }
    const p = marked.parse(md);
    if (typeof p?.then === "function") p.then((h) => setHtml(h || ""));
    else setHtml(p || "");
  }, [md]);

  useEffect(() => {
    if (!previewRef.current || !html) return;
    const codeBlocks = previewRef.current.querySelectorAll("pre code");
    if (codeBlocks.length && typeof window !== "undefined" && window.hljs) {
      codeBlocks.forEach((el) => window.hljs.highlightElement(el));
    }
  }, [html]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    import("highlight.js").then((mod) => {
      window.hljs = mod.default;
    });
  }, []);

  const fullPageHtml = useMemo(
    () => `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Page</title><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css"></head><body><div class="content">${html}</div><script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script><script>hljs.highlightAll();</script></body></html>`,
    [html]
  );

  const handleDownload = () => {
    const blob = new Blob([fullPageHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "page.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(html);
  };

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
        <Breadcrumb locale={locale} homeLabel={tCommon("breadcrumbHome")} toolsLabel={tCommon("nav.tools")} toolLabel={t("label")} toolPath="markdown-to-html" />
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("metaTitle")}</h1>
          <p className="max-w-xl text-sm text-slate-300">{t("metaDescription")}</p>
        </section>
        <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-300">Markdown</label>
              <textarea value={md} onChange={(e) => setMd(e.target.value)} placeholder="# Hello\n**bold** and *italic*…" className="mt-1 min-h-[300px] w-full rounded-lg border border-slate-700 bg-slate-950/60 p-3 font-mono text-sm text-slate-200 placeholder:text-slate-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300">{t("previewHtml")}</label>
              <div ref={previewRef} className="prose prose-invert mt-1 min-h-[300px] rounded-lg border border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-200" dangerouslySetInnerHTML={{ __html: html || "<p class=\"text-slate-500\">Rendered output appears here.</p>" }} />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button type="button" onClick={handleDownload} className="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400">{t("downloadFullPage")}</button>
            <button type="button" onClick={handleCopyContent} className="rounded-full border border-sky-400/50 px-4 py-2 text-xs font-semibold text-sky-200 hover:bg-slate-800">{t("copyContentHtml")}</button>
          </div>
        </section>
        <RelatedTools locale={locale} currentSlug="markdown-to-html" />
        <FaqSection namespace="tools.markdownToHtml" faqs={getToolFaq("markdown-to-html")} />
      </main>
    </div>
  );
}
