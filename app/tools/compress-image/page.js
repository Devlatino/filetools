"use client";

import { useCallback, useMemo, useState } from "react";
import imageCompression from "browser-image-compression";

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default function CompressImagePage() {
  const [originalFile, setOriginalFile] = useState(null);
  const [compressedFile, setCompressedFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [compressedUrl, setCompressedUrl] = useState("");
  const [quality, setQuality] = useState(70); // 1-100
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState("");

  const qualityLabel = useMemo(
    () => `${quality} / 100`,
    [quality]
  );

  const handleFileChange = useCallback((event) => {
    const file = event.target.files?.[0];
    setError("");
    setCompressedFile(null);
    setCompressedUrl("");

    if (!file) {
      setOriginalFile(null);
      setOriginalUrl("");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Formato non supportato. Usa JPG, PNG o WebP.");
      setOriginalFile(null);
      setOriginalUrl("");
      return;
    }

    setOriginalFile(file);
    const url = URL.createObjectURL(file);
    setOriginalUrl(url);
  }, []);

  const handleCompress = useCallback(async () => {
    if (!originalFile) {
      setError("Seleziona prima un'immagine da comprimere.");
      return;
    }

    setError("");
    setIsCompressing(true);

    try {
      const options = {
        maxSizeMB: originalFile.size / (1024 * 1024), // non limitiamo dimensione massima, solo qualità
        maxWidthOrHeight: 5000,
        useWebWorker: true,
        initialQuality: Math.min(Math.max(quality / 100, 0.01), 1),
      };

      const compressed = await imageCompression(originalFile, options);
      setCompressedFile(compressed);

      if (compressedUrl) {
        URL.revokeObjectURL(compressedUrl);
      }
      const url = URL.createObjectURL(compressed);
      setCompressedUrl(url);
    } catch (err) {
      setError("Errore durante la compressione. Riprova con un'altra immagine.");
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setIsCompressing(false);
    }
  }, [compressedUrl, originalFile, quality]);

  const handleDownload = useCallback(() => {
    if (!compressedFile) return;
    const link = document.createElement("a");
    const url = compressedUrl || URL.createObjectURL(compressedFile);
    link.href = url;
    link.download = `fileflip-compressed-${originalFile?.name || "image"}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, [compressedFile, compressedUrl, originalFile]);

  const reductionText = useMemo(() => {
    if (!originalFile || !compressedFile) return "";
    const diff = originalFile.size - compressedFile.size;
    const ratio = (1 - compressedFile.size / originalFile.size) * 100;
    if (diff <= 0) return "Il file compresso ha una dimensione simile all'originale.";
    return `Hai risparmiato circa ${formatBytes(diff)} (~${ratio.toFixed(1)}% in meno).`;
  }, [compressedFile, originalFile]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500 text-lg font-bold text-slate-950 shadow-sm">
              F
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight sm:text-base">
                FileFlip
              </span>
              <span className="text-[11px] text-slate-400">
                Comprimi immagine
              </span>
            </div>
          </a>
        </div>
      </header>

      <main className="mx-auto flex max-w-4xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Comprimi le tue immagini in modo semplice.
          </h1>
          <p className="max-w-xl text-sm text-slate-300">
            Carica una foto (JPG, PNG o WebP), scegli la qualità e confronta
            il peso prima/dopo prima di scaricare il risultato.
          </p>
        </section>

        {/* Upload + qualità */}
        <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-5">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-50">
                  1. Carica un&apos;immagine
                </p>
                <p className="text-xs text-slate-400">
                  Formati supportati: JPG, PNG, WebP.
                </p>
              </div>
              <label className="inline-flex cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-sm hover:bg-sky-400">
                Seleziona immagine
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-medium">2. Scegli la qualità</span>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-200">
                  {qualityLabel}
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
                Valori più bassi = file più leggero ma qualità inferiore. Prova
                60-80 per un buon compromesso.
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={!originalFile || isCompressing}
                onClick={handleCompress}
                className="inline-flex items-center justify-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-sm hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCompressing ? "Compressione in corso..." : "3. Comprimi immagine"}
              </button>
              <button
                type="button"
                disabled={!compressedFile}
                onClick={handleDownload}
                className="inline-flex items-center justify-center rounded-full border border-slate-600 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-100 hover:border-sky-400 hover:text-sky-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Scarica immagine compressa
              </button>
            </div>

            {error && (
              <p className="mt-2 text-xs text-rose-400">
                {error}
              </p>
            )}
          </div>
        </section>

        {/* Anteprima prima/dopo */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-50">
            Anteprima prima / dopo
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3">
              <p className="text-xs font-medium text-slate-100">
                Originale
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                {originalFile
                  ? `${originalFile.name} · ${formatBytes(originalFile.size)}`
                  : "Carica un'immagine per vedere l'anteprima."}
              </p>
              <div className="mt-3 flex items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950/60 px-2 py-4">
                {originalUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={originalUrl}
                    alt="Anteprima originale"
                    className="max-h-64 w-auto rounded-md object-contain"
                  />
                ) : (
                  <span className="text-[11px] text-slate-500">
                    Nessuna immagine caricata.
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3">
              <p className="text-xs font-medium text-slate-100">
                Compressa
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                {compressedFile
                  ? `${compressedFile.name || originalFile?.name || "Immagine"} · ${formatBytes(
                      compressedFile.size
                    )}`
                  : "Dopo la compressione vedrai qui il risultato."}
              </p>
              <div className="mt-3 flex items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950/60 px-2 py-4">
                {compressedUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={compressedUrl}
                    alt="Anteprima compressa"
                    className="max-h-64 w-auto rounded-md object-contain"
                  />
                ) : (
                  <span className="text-[11px] text-slate-500">
                    Ancora nessuna immagine compressa.
                  </span>
                )}
              </div>
              {reductionText && (
                <p className="mt-2 text-[11px] text-emerald-300">
                  {reductionText}
                </p>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

