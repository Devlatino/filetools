"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import imageCompression from "browser-image-compression";
import { getToolFaq } from "@/lib/toolFaqs";
import { FaqSection } from "@/components/FaqSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default function PngToJpgPage() {
  const locale = useLocale();
  const tCommon = useTranslations("common");
  const t = useTranslations("tools.pngToJpg");
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [quality, setQuality] = useState(80);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState("");

  const totalSize = useMemo(
    () => files.reduce((acc, f) => acc + (f.file?.size || 0), 0),
    [files]
  );

  const handleFilesChange = useCallback((event) => {
    const list = Array.from(event.target.files || []);
    setError("");
    setResults([]);
    if (!list.length) return;
    const pngs = list.filter(
      (f) => f.type === "image/png" || f.name.toLowerCase().endsWith(".png")
    );
    if (!pngs.length) {
      setError("Carica solo immagini PNG.");
      return;
    }
    const mapped = pngs.map((file, index) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      file,
    }));
    setFiles(mapped);
  }, []);

  const handleConvert = useCallback(async () => {
    if (!files.length) {
      setError("Carica almeno un PNG.");
      return;
    }
    setIsConverting(true);
    setError("");
    setResults([]);

    try {
      const out = [];
      for (const item of files) {
        // eslint-disable-next-line no-await-in-loop
        const jpgBlob = await imageCompression(item.file, {
          fileType: "image/jpeg",
          initialQuality: Math.min(Math.max(quality / 100, 0.1), 1),
        });
        const url = URL.createObjectURL(jpgBlob);
        out.push({
          id: item.id,
          originalName: item.name,
          originalSize: item.size,
          blob: jpgBlob,
          url,
        });
      }
      setResults(out);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError("Errore durante la conversione. Riprova.");
    } finally {
      setIsConverting(false);
    }
  }, [files, quality]);

  const handleDownload = useCallback((result) => {
    const a = document.createElement("a");
    const base = result.originalName.replace(/\.png$/i, "") || "immagine";
    a.href = result.url;
    a.download = `${base}.jpg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, []);

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
          toolPath="png-to-jpg"
        />
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Converti PNG in JPG.
          </h1>
          <p className="max-w-xl text-sm text-slate-300">
            Trasforma le immagini PNG in JPG, scegliendo il livello di qualità
            per bilanciare peso e resa visiva.
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-50">
                1. Carica immagini PNG
              </p>
              <p className="text-xs text-slate-400">
                Puoi selezionare più immagini insieme.
              </p>
            </div>
            <label className="inline-flex cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-sm hover:bg-sky-400">
              Seleziona PNG
              <input
                type="file"
                multiple
                accept="image/png"
                className="hidden"
                onChange={handleFilesChange}
              />
            </label>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-medium">2. Scegli la qualità JPG</span>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-200">
                {quality} / 100
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full accent-sky-500"
            />
            <p className="text-[11px] text-slate-400">
              Valori più bassi riducono il peso ma possono introdurre artefatti.
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
            <span>
              {files.length > 0
                ? `${files.length} immagini · ${formatBytes(totalSize)} totali`
                : "Nessuna immagine caricata."}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={!files.length || isConverting}
              onClick={handleConvert}
              className="inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-2 text-xs font-semibold text-slate-950 shadow-sm hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isConverting ? "Conversione in corso..." : "3. Converti in JPG"}
            </button>
          </div>

          {error && (
            <p className="mt-3 text-xs text-rose-400">{error}</p>
          )}
        </section>

        {files.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-50">
              Anteprima risultati
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-3">
                <p className="text-xs font-medium text-slate-100">Originali</p>
                <div className="mt-2 max-h-64 space-y-1 overflow-y-auto text-[11px] text-slate-400">
                  {files.map((f) => (
                    <p key={f.id}>
                      {f.name} · {formatBytes(f.size)}
                    </p>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-3">
                <p className="text-xs font-medium text-slate-100">
                  JPG convertiti
                </p>
                {results.length === 0 ? (
                  <p className="mt-2 text-[11px] text-slate-500">
                    Dopo la conversione potrai scaricare i JPG da qui.
                  </p>
                ) : (
                  <div className="mt-2 max-h-64 space-y-2 overflow-y-auto text-[11px] text-slate-400">
                    {results.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between gap-2"
                      >
                        <span className="truncate">
                          {r.originalName.replace(/\.png$/i, "")}.jpg ·{" "}
                          {formatBytes(r.blob.size)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDownload(r)}
                          className="whitespace-nowrap rounded-full border border-slate-600 px-2 py-1 text-[11px] text-slate-100 hover:border-sky-400 hover:text-sky-200"
                        >
                          Scarica
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
        <RelatedTools locale={locale} currentSlug="png-to-jpg" />
        <FaqSection faqs={getToolFaq("png-to-jpg")} />
      </main>
    </div>
  );
}

