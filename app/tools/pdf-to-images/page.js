"use client";

import { useCallback, useState } from "react";
import JSZip from "jszip";

// pdfjs-dist viene caricato dinamicamente lato client per evitare errori di build su Vercel
let pdfjsLib = null;
async function getPdfJs() {
  if (pdfjsLib) return pdfjsLib;
  const mod = await import("pdfjs-dist");
  pdfjsLib = mod.default || mod;
  const version = pdfjsLib.version || "4.0.379";
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`;
  return pdfjsLib;
}

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default function PdfToImagesPage() {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfName, setPdfName] = useState("");
  const [pages, setPages] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState("");

  const handlePdfChange = useCallback((event) => {
    const file = event.target.files?.[0];
    setError("");
    setPages([]);
    if (!file) {
      setPdfFile(null);
      setPdfName("");
      return;
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Seleziona un file PDF.");
      return;
    }
    setPdfFile(file);
    setPdfName(file.name);
  }, []);

  const handleConvert = useCallback(async () => {
    if (!pdfFile) {
      setError("Carica prima un PDF.");
      return;
    }
    setIsConverting(true);
    setError("");
    setPages([]);

    try {
      const lib = await getPdfJs();
      const data = await pdfFile.arrayBuffer();
      const pdf = await lib.getDocument({ data }).promise;
      const pageCount = pdf.numPages;
      const out = [];

      for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
        // eslint-disable-next-line no-await-in-loop
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // eslint-disable-next-line no-await-in-loop
        await page.render({ canvasContext: context, viewport }).promise;

        // eslint-disable-next-line no-await-in-loop
        const blob = await new Promise((resolve) =>
          canvas.toBlob(
            (b) => resolve(b),
            "image/png",
            0.92
          )
        );
        const url = URL.createObjectURL(blob);
        out.push({
          index: pageNumber,
          width: Math.round(viewport.width),
          height: Math.round(viewport.height),
          blob,
          url,
        });
      }

      setPages(out);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError("Errore durante la conversione. Riprova con un altro PDF.");
    } finally {
      setIsConverting(false);
    }
  }, [pdfFile]);

  const handleDownloadPage = useCallback((page) => {
    const a = document.createElement("a");
    a.href = page.url;
    const base = pdfName.replace(/\.pdf$/i, "") || "pagina";
    a.download = `${base}-pagina-${page.index}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [pdfName]);

  const handleDownloadAllZip = useCallback(async () => {
    if (!pages.length) return;
    const zip = new JSZip();
    const base = pdfName.replace(/\.pdf$/i, "") || "pdf";

    pages.forEach((p) => {
      zip.file(`${base}-pagina-${p.index}.png`, p.blob);
    });

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${base}-pagine.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [pages, pdfName]);

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
                PDF → Immagini
              </span>
            </div>
          </a>
        </div>
      </header>

      <main className="mx-auto flex max-w-4xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Trasforma ogni pagina PDF in un&apos;immagine.
          </h1>
          <p className="max-w-xl text-sm text-slate-300">
            Carica un PDF, converti le pagine in immagini PNG e scaricale
            singolarmente o tutte insieme in un archivio ZIP.
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-50">
                1. Carica un PDF
              </p>
              <p className="text-xs text-slate-400">
                Scegli un file PDF non troppo pesante per una conversione più
                veloce.
              </p>
            </div>
            <label className="inline-flex cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-sm hover:bg-sky-400">
              Seleziona PDF
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handlePdfChange}
              />
            </label>
          </div>

          {pdfFile && (
            <div className="mt-3 text-[11px] text-slate-300">
              Selezionato:{" "}
              <span className="font-semibold">{pdfName}</span> ·{" "}
              {formatBytes(pdfFile.size)}
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={!pdfFile || isConverting}
              onClick={handleConvert}
              className="inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-2 text-xs font-semibold text-slate-950 shadow-sm hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isConverting
                ? "Conversione in corso..."
                : "2. Converti pagine in immagini"}
            </button>
            {pages.length > 0 && (
              <button
                type="button"
                onClick={handleDownloadAllZip}
                className="inline-flex items-center justify-center rounded-full border border-slate-600 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-100 hover:border-sky-400 hover:text-sky-200"
              >
                Scarica tutte le pagine in ZIP
              </button>
            )}
          </div>

          {error && (
            <p className="mt-3 text-xs text-rose-400">{error}</p>
          )}
        </section>

        {pages.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-50">
              3. Pagine convertite
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {pages.map((p) => (
                <div
                  key={p.index}
                  className="rounded-2xl border border-white/10 bg-slate-900/80 p-3"
                >
                  <div className="flex items-center justify-between text-xs text-slate-200">
                    <span className="font-medium">Pagina {p.index}</span>
                    <span className="text-[11px] text-slate-400">
                      {p.width}×{p.height}px
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-center rounded-lg border border-slate-800 bg-slate-950/60 px-2 py-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.url}
                      alt={`Pagina ${p.index}`}
                      className="max-h-48 w-auto rounded-md object-contain"
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{formatBytes(p.blob.size)}</span>
                    <button
                      type="button"
                      onClick={() => handleDownloadPage(p)}
                      className="rounded-full border border-slate-600 px-2 py-1 text-[11px] text-slate-100 hover:border-sky-400 hover:text-sky-200"
                    >
                      Scarica PNG
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

