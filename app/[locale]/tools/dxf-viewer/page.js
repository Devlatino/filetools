"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Upload, Loader2, Download } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default function DxfViewerPage() {
  const locale = useLocale();
  const t = useTranslations("tools.dxfViewer");
  const tCommon = useTranslations("common");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const fileInputRef = useRef(null);

  const processFile = useCallback(
    async (f) => {
      if (!f) {
        setFile(null);
        setError(null);
        if (viewerRef.current && containerRef.current) {
          try {
            if (viewerRef.current.renderer?.domElement?.parentNode) {
              viewerRef.current.renderer.domElement.parentNode.removeChild(viewerRef.current.renderer.domElement);
            }
          } catch (_) {}
          viewerRef.current = null;
          containerRef.current.innerHTML = "";
        }
        return;
      }
      const isDxf = f.name.toLowerCase().endsWith(".dxf");
      if (!isDxf) {
        setError(t("errorGeneric"));
        setFile(null);
        return;
      }
      setError(null);
      setLoading(true);
      setFile(f);
      try {
        const text = await f.text();
        const DxfParser = (await import("dxf-parser")).default;
        const { Viewer } = await import("three-dxf");

        const parser = new DxfParser();
        const dxf = parser.parseSync(text);

        if (!dxf || !dxf.entities?.length) {
          setError(t("errorGeneric"));
          setLoading(false);
          return;
        }

        if (!containerRef.current) {
          setLoading(false);
          return;
        }

        containerRef.current.innerHTML = "";
        const width = containerRef.current.clientWidth || 800;
        const height = 500;

        const viewer = new Viewer(dxf, containerRef.current, width, height);
        if (viewer.renderer) {
          viewer.renderer.setClearColor(0x1a1a2e, 1);
        }
        viewerRef.current = viewer;
      } catch (err) {
        console.error("dxf-viewer error:", err);
        setError(t("errorGeneric"));
      } finally {
        setLoading(false);
      }
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

  const handleDownload = useCallback(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  }, [file]);

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
          toolPath="dxf-viewer"
        />

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_340px]">
          <section className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("metaTitle")}</h1>
              <p className="mt-1 text-sm text-slate-300">{t("metaDescription")}</p>
            </div>

            {!file ? (
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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".dxf,application/dxf,image/vnd.dxf"
                  className="sr-only"
                  onChange={handleFileChange}
                />
                <Upload size={40} strokeWidth={1.5} className={isDragOver ? "text-sky-400" : "text-sky-500/80"} />
                <p className={`text-center text-sm font-medium ${isDragOver ? "text-sky-200" : "text-slate-300"}`}>{t("dropzone")}</p>
              </label>
            ) : (
              <>
                {loading && (
                  <div className="flex h-[500px] w-full items-center justify-center rounded-xl bg-[#1a1a2e]">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 size={40} className="animate-spin text-sky-400" />
                      <p className="text-sm text-slate-300">{t("loading")}</p>
                    </div>
                  </div>
                )}
                <div
                  ref={containerRef}
                  className="w-full overflow-hidden rounded-xl bg-[#1a1a2e]"
                  style={{ height: 500, display: loading ? "none" : "block" }}
                />
                <p className="text-xs text-slate-400">
                  {file.name} · {formatBytes(file.size)}
                </p>
                <p className="text-xs text-slate-500">{t("renderNote")}</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
                  >
                    <Download size={18} strokeWidth={2} />
                    {t("download")}
                  </button>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-500">
                    <Upload size={18} strokeWidth={2} />
                    {t("dropzone")}
                    <input
                      type="file"
                      accept=".dxf,application/dxf,image/vnd.dxf"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </>
            )}

            {error && <p className="text-sm text-rose-400">{error}</p>}
          </section>

          <aside className="space-y-8 lg:max-w-[340px]">
            <EditorialSection namespace="tools.dxfViewer" />
          </aside>
        </div>

        <div className="mt-10">
          <RelatedTools locale={locale} currentSlug="dxf-viewer" />
        </div>

        <div className="mt-10">
          <FaqSection namespace="tools.dxfViewer" />
        </div>
      </main>
    </div>
  );
}
