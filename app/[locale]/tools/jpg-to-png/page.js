"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import imageCompression from "browser-image-compression";
import { getToolFaq } from "@/lib/toolFaqs";
import { FaqSection } from "@/components/FaqSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default function JpgToPngPage() {
  const locale = useLocale();
  const tCommon = useTranslations("common");
  const t = useTranslations("tools.jpgToPng");
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
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
    const jpgs = list.filter(
      (f) => f.type === "image/jpeg" || f.name.toLowerCase().endsWith(".jpg")
    );
    if (!jpgs.length) {
      setError("Carica solo immagini JPG.");
      return;
    }
    const mapped = jpgs.map((file, index) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      file,
    }));
    setFiles(mapped);
  }, []);

  const handleConvert = useCallback(async () => {
    if (!files.length) {
      setError("Carica almeno un JPG.");
      return;
    }
    setIsConverting(true);
    setError("");
    setResults([]);

    try {
      const out = [];
      // conversione a PNG via canvas usata internamente
      // browser-image-compression converte se specifichiamo fileType
      // ma per essere espliciti usiamo la funzione direttamente.
      // Qui usiamo semplicemente imageCompression con solo ricompressione minima.
      // Per ogni file creiamo un Blob PNG e un URL per anteprima/download.
      for (const item of files) {
        // eslint-disable-next-line no-await-in-loop
        const compressed = await imageCompression(item.file, {
          fileType: "image/png",
          initialQuality: 0.9,
        });
        const url = URL.createObjectURL(compressed);
        out.push({
          id: item.id,
          originalName: item.name,
          originalSize: item.size,
          blob: compressed,
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
  }, [files]);

  const handleDownload = useCallback((result) => {
    const a = document.createElement("a");
    const base =
      result.originalName.replace(/\.jpe?g$/i, "") || "immagine";
    a.href = result.url;
    a.download = `${base}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href={`/${locale}/`} prefetch className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500 text-lg font-bold text-slate-950 shadow-sm">
              F
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight sm:text-base">
                {tCommon("siteName")}
              </span>
              <span className="text-[11px] text-slate-400">
                {t("label")}
              </span>
            </div>
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-4xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumb
          locale={locale}
          homeLabel={tCommon("breadcrumbHome")}
          toolsLabel={tCommon("nav.tools")}
          toolLabel={t("label")}
          toolPath="jpg-to-png"
        />
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Converti JPG in PNG.
          </h1>
          <p className="max-w-xl text-sm text-slate-300">
            Carica le tue foto in formato JPG e scaricale in formato PNG,
            mantenendo una buona qualità.
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-50">
                1. Carica immagini JPG
              </p>
              <p className="text-xs text-slate-400">
                Puoi selezionare più immagini insieme.
              </p>
            </div>
            <label className="inline-flex cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-sm hover:bg-sky-400">
              Seleziona JPG
              <input
                type="file"
                multiple
                accept="image/jpeg"
                className="hidden"
                onChange={handleFilesChange}
              />
            </label>
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
              {isConverting ? "Conversione in corso..." : "2. Converti in PNG"}
            </button>
            <p className="text-[11px] text-slate-400">
              Ogni immagine JPG verrà salvata come PNG separato.
            </p>
          </div>

          {error && (
            <p className="mt-3 text-xs text-rose-400">{error}</p>
          )}
        </section>

        {files.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-50">
              Anteprima immagini
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
                  PNG convertiti
                </p>
                {results.length === 0 ? (
                  <p className="mt-2 text-[11px] text-slate-500">
                    Dopo la conversione potrai scaricare i PNG da qui.
                  </p>
                ) : (
                  <div className="mt-2 max-h-64 space-y-2 overflow-y-auto text-[11px] text-slate-400">
                    {results.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between gap-2"
                      >
                        <span className="truncate">
                          {r.originalName.replace(/\.jpe?g$/i, "")}.png ·{" "}
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
        <RelatedTools locale={locale} currentSlug="jpg-to-png" />
        <FaqSection faqs={getToolFaq("jpg-to-png")} />
      </main>
    </div>
  );
}

