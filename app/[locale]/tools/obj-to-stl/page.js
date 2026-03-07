"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Upload, Download } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { parseOBJ, objToBufferGeometry, buildSTLBinary, getBoundsFromPositions } from "@/lib/objParser";
import { useThreeViewer } from "@/lib/useThreeViewer";

export default function ObjToStlPage() {
  const locale = useLocale();
  const t = useTranslations("tools.objToStl");
  const tCommon = useTranslations("common");
  const [file, setFile] = useState(null);
  const [stlBlob, setStlBlob] = useState(null);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState("");
  const [geometryVersion, setGeometryVersion] = useState(0);
  const containerRef = useRef(null);
  const geometryRef = useRef(null);
  const boundsRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  useThreeViewer(containerRef, geometryRef, boundsRef, geometryVersion);

  const processFile = useCallback((fileItem) => {
    if (!fileItem || !fileItem.name.toLowerCase().endsWith(".obj")) {
      setError(t("error"));
      setFile(null);
      setStlBlob(null);
      geometryRef.current = null;
      boundsRef.current = null;
      return;
    }
    setError("");
    setConverting(true);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = typeof reader.result === "string" ? reader.result : new TextDecoder("utf-8").decode(reader.result);
        const parsed = parseOBJ(text);
        if (!parsed.vertices.length || !parsed.faces.length) throw new Error("No geometry");
        const { positions, normals, numTriangles } = objToBufferGeometry(parsed);
        const bounds = getBoundsFromPositions(positions);
        geometryRef.current = { positions, normals };
        boundsRef.current = bounds;
        setGeometryVersion((v) => v + 1);
        const buffer = buildSTLBinary(parsed);
        setStlBlob(new Blob([buffer], { type: "application/octet-stream" }));
        setFile(fileItem);
      } catch (err) {
        setError(t("error"));
        setFile(null);
        setStlBlob(null);
        geometryRef.current = null;
        boundsRef.current = null;
      }
      setConverting(false);
    };
    reader.onerror = () => {
      setError(t("error"));
      setConverting(false);
    };
    reader.readAsText(fileItem, "utf-8");
  }, [t]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    processFile(e.dataTransfer?.files?.[0]);
  }, [processFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) setIsDragOver(false);
  }, []);

  const downloadStl = useCallback(() => {
    if (!stlBlob || !file) return;
    const base = file.name.replace(/\.obj$/i, "");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(stlBlob);
    a.download = `${base}.stl`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [stlBlob, file]);

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
        <Breadcrumb locale={locale} homeLabel={tCommon("breadcrumbHome")} toolsLabel={tCommon("nav.tools")} toolLabel={t("label")} toolPath="obj-to-stl" />

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
                <input ref={fileInputRef} type="file" accept=".obj" className="sr-only" onChange={(e) => processFile(e.target.files?.[0])} />
                <Upload size={40} className="text-slate-400" />
                <p className="text-center text-sm text-slate-300">{t("dropzone")}</p>
              </label>
            ) : (
              <>
                <div ref={containerRef} className="aspect-video w-full overflow-hidden rounded-xl bg-[#1a1a2e]" style={{ minHeight: 320 }} />
                {stlBlob && (
                  <button
                    type="button"
                    onClick={downloadStl}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 font-medium text-white transition hover:bg-sky-500"
                  >
                    <Download size={20} />
                    {t("download")}
                  </button>
                )}
              </>
            )}
            {converting && <p className="text-sm text-sky-400">{t("converting")}</p>}
            {error && <p className="text-sm text-rose-400">{error}</p>}
          </section>
          <aside className="space-y-6">
            <EditorialSection namespace="tools.objToStl" />
          </aside>
        </div>

        <div className="mt-10">
          <RelatedTools locale={locale} currentSlug="obj-to-stl" />
        </div>
        <div className="mt-10">
          <FaqSection namespace="tools.objToStl" />
        </div>
      </main>
    </div>
  );
}
