"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Upload } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { parseSTL } from "@/lib/stlParser";
import { useThreeViewer } from "@/lib/useThreeViewer";

export default function StlViewerPage() {
  const locale = useLocale();
  const t = useTranslations("tools.stlViewer");
  const tCommon = useTranslations("common");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({ numTriangles: 0, dimensions: null });
  const [geometryVersion, setGeometryVersion] = useState(0);
  const containerRef = useRef(null);
  const geometryRef = useRef(null);
  const boundsRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  useThreeViewer(containerRef, geometryRef, boundsRef, geometryVersion);

  const loadFile = useCallback((fileItem) => {
    if (!fileItem || !fileItem.name.toLowerCase().endsWith(".stl")) {
      setError(t("error"));
      setFile(null);
      geometryRef.current = null;
      boundsRef.current = null;
      setStats({ numTriangles: 0, dimensions: null });
      return;
    }
    setError("");
    setLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = parseSTL(reader.result);
        geometryRef.current = { positions: data.positions, normals: data.normals };
        boundsRef.current = data.bounds;
        const [[minX, minY, minZ], [maxX, maxY, maxZ]] = [data.bounds.min, data.bounds.max];
        const dimStr = `${(maxX - minX).toFixed(1)} × ${(maxY - minY).toFixed(1)} × ${(maxZ - minZ).toFixed(1)}`;
        setStats({ numTriangles: data.numTriangles, dimensions: dimStr });
        setFile(fileItem);
        setGeometryVersion((v) => v + 1);
      } catch (err) {
        setError(t("error"));
        setFile(null);
        geometryRef.current = null;
        boundsRef.current = null;
        setStats({ numTriangles: 0, dimensions: null });
      }
      setLoading(false);
    };
    reader.onerror = () => {
      setError(t("error"));
      setLoading(false);
    };
    reader.readAsArrayBuffer(fileItem);
  }, [t]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    loadFile(e.dataTransfer?.files?.[0]);
  }, [loadFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) setIsDragOver(false);
  }, []);

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
        <Breadcrumb locale={locale} homeLabel={tCommon("breadcrumbHome")} toolsLabel={tCommon("nav.tools")} toolLabel={t("label")} toolPath="stl-viewer" />

        <div className="mt-6">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("metaTitle")}</h1>
          <p className="mt-1 text-sm text-slate-300">{t("metaDescription")}</p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="space-y-4">
            {!file ? (
              <label
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 transition-colors ${
                  isDragOver ? "border-sky-500 bg-sky-500/10" : "border-slate-600 bg-slate-900/50"
                }`}
              >
                <input ref={fileInputRef} type="file" accept=".stl" className="sr-only" onChange={(e) => loadFile(e.target.files?.[0])} />
                <Upload size={40} className="text-slate-400" />
                <p className="text-center text-sm text-slate-300">{t("dropzone")}</p>
              </label>
            ) : (
              <div ref={containerRef} className="aspect-video w-full overflow-hidden rounded-xl bg-[#1a1a2e]" style={{ minHeight: 320 }} />
            )}
            {loading && <p className="text-sm text-sky-400">{t("loading")}</p>}
            {error && <p className="text-sm text-rose-400">{error}</p>}
            {file && stats.numTriangles > 0 && (
              <div className="flex flex-wrap gap-4 rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm">
                <span className="text-slate-300"><strong className="text-slate-200">{t("triangles")}:</strong> {stats.numTriangles.toLocaleString()}</span>
                {stats.dimensions && (
                  <span className="text-slate-300"><strong className="text-slate-200">{t("dimensions")}:</strong> {stats.dimensions}</span>
                )}
              </div>
            )}
          </section>
          <aside className="space-y-6">
            <EditorialSection namespace="tools.stlViewer" />
          </aside>
        </div>

        <div className="mt-10">
          <RelatedTools locale={locale} currentSlug="stl-viewer" />
        </div>
        <div className="mt-10">
          <FaqSection namespace="tools.stlViewer" />
        </div>
      </main>
    </div>
  );
}
