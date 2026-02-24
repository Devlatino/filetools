"use client";

import { useCallback, useMemo, useState } from "react";
import { PDFDocument } from "pdf-lib";

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default function MergePdfPage() {
  const [items, setItems] = useState([]);
  const [draggingId, setDraggingId] = useState(null);
  const [isMerging, setIsMerging] = useState(false);
  const [error, setError] = useState("");

  const totalSize = useMemo(
    () => items.reduce((acc, item) => acc + (item.file?.size || 0), 0),
    [items]
  );

  const handleFilesChange = useCallback((event) => {
    const files = Array.from(event.target.files || []);
    setError("");
    if (!files.length) return;

    const pdfFiles = files.filter((f) => f.type === "application/pdf");
    if (!pdfFiles.length) {
      setError("Carica solo file PDF.");
      return;
    }

    const mapped = pdfFiles.map((file, index) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      file,
    }));

    setItems((prev) => [...prev, ...mapped]);
  }, []);

  const handleDragStart = useCallback((id) => {
    setDraggingId(id);
  }, []);

  const handleDragOver = useCallback((event, overId) => {
    event.preventDefault();
    if (!draggingId || draggingId === overId) return;

    setItems((prev) => {
      const draggingIndex = prev.findIndex((i) => i.id === draggingId);
      const overIndex = prev.findIndex((i) => i.id === overId);
      if (draggingIndex === -1 || overIndex === -1) return prev;

      const updated = [...prev];
      const [removed] = updated.splice(draggingIndex, 1);
      updated.splice(overIndex, 0, removed);
      return updated;
    });
  }, [draggingId]);

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
  }, []);

  const handleClear = useCallback(() => {
    setItems([]);
    setError("");
  }, []);

  const handleMerge = useCallback(async () => {
    if (!items.length) {
      setError("Carica almeno due PDF da unire.");
      return;
    }
    if (items.length < 2) {
      setError("Servono almeno due PDF per l'unione.");
      return;
    }

    setIsMerging(true);
    setError("");

    try {
      const mergedPdf = await PDFDocument.create();

      for (const item of items) {
        // eslint-disable-next-line no-await-in-loop
        const arrayBuffer = await item.file.arrayBuffer();
        // eslint-disable-next-line no-await-in-loop
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(
          pdf,
          pdf.getPageIndices()
        );
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `fileflip-merged-${items.length}-files.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError("Qualcosa è andato storto durante l'unione. Riprova.");
    } finally {
      setIsMerging(false);
    }
  }, [items]);

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
                Unisci PDF
              </span>
            </div>
          </a>
        </div>
      </header>

      <main className="mx-auto flex max-w-4xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Unisci più PDF in un unico file.
          </h1>
          <p className="max-w-xl text-sm text-slate-300">
            Carica i PDF, mettili nell&apos;ordine che preferisci trascinando
            le righe, quindi clicca &quot;Unisci PDF&quot; per scaricare il
            documento finale.
          </p>
        </section>

        {/* Upload & azioni */}
        <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-50">
                1. Carica i tuoi PDF
              </p>
              <p className="text-xs text-slate-400">
                Puoi selezionare più file insieme o aggiungerli in più volte.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-sm hover:bg-sky-400">
                Aggiungi PDF
                <input
                  type="file"
                  multiple
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFilesChange}
                />
              </label>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center justify-center rounded-full border border-slate-600 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-100 hover:border-rose-400 hover:text-rose-200"
                >
                  Svuota elenco
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
            <span>
              {items.length > 0
                ? `${items.length} PDF selezionati · ${formatBytes(totalSize)} totali`
                : "Nessun PDF aggiunto."}
            </span>
            <span>Trascina le righe per cambiare l&apos;ordine.</span>
          </div>

          {error && (
            <p className="mt-3 text-xs text-rose-400">{error}</p>
          )}
        </section>

        {/* Lista PDF con drag & drop */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-50">
            2. Riordina i PDF
          </h2>
          <div className="rounded-2xl border border-white/10 bg-slate-900/80">
            {items.length === 0 ? (
              <div className="flex items-center justify-center px-4 py-10 text-xs text-slate-500">
                I tuoi PDF compariranno qui dopo il caricamento.
              </div>
            ) : (
              <ul className="divide-y divide-slate-800">
                {items.map((item, index) => (
                  <li
                    key={item.id}
                    draggable
                    onDragStart={() => handleDragStart(item.id)}
                    onDragOver={(e) => handleDragOver(e, item.id)}
                    onDragEnd={handleDragEnd}
                    className={`flex cursor-move items-center justify-between gap-3 px-4 py-3 text-xs transition-colors ${
                      draggingId === item.id
                        ? "bg-sky-500/10"
                        : "hover:bg-slate-800/80"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[11px] text-slate-200">
                        {index + 1}
                      </span>
                      <div className="flex flex-col">
                        <span className="max-w-xs truncate text-slate-100 sm:max-w-sm">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {formatBytes(item.size)}
                        </span>
                      </div>
                    </div>
                    <span className="hidden text-[10px] text-slate-500 sm:inline">
                      Trascina per spostare
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Unione */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-50">
            3. Unisci e scarica
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={items.length < 2 || isMerging}
              onClick={handleMerge}
              className="inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-2 text-xs font-semibold text-slate-950 shadow-sm hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isMerging ? "Unione in corso..." : "Unisci PDF"}
            </button>
            <p className="text-[11px] text-slate-400">
              Il nuovo PDF conterrà tutte le pagine, nell&apos;ordine impostato
              qui sopra.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

