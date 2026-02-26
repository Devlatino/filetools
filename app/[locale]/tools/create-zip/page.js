"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import JSZip from "jszip";
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

export default function CreateZipPage() {
  const locale = useLocale();
  const tCommon = useTranslations("common");
  const t = useTranslations("tools.createZip");
  const [files, setFiles] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const totalSize = useMemo(
    () => files.reduce((acc, f) => acc + (f.file?.size || 0), 0),
    [files]
  );

  const handleFilesChange = useCallback((event) => {
    const list = Array.from(event.target.files || []);
    setError("");
    if (!list.length) return;
    const mapped = list.map((file, index) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      file,
    }));
    setFiles((prev) => [...prev, ...mapped]);
  }, []);

  const handleClear = useCallback(() => {
    setFiles([]);
    setError("");
  }, []);

  const handleCreateZip = useCallback(async () => {
    if (!files.length) {
      setError("Aggiungi almeno un file.");
      return;
    }
    setIsCreating(true);
    setError("");

    try {
      const zip = new JSZip();
      for (const item of files) {
        // eslint-disable-next-line no-await-in-loop
        const buffer = await item.file.arrayBuffer();
        zip.file(item.name, buffer);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fileflip-archive-${files.length}-files.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError("Errore durante la creazione dello ZIP. Riprova.");
    } finally {
      setIsCreating(false);
    }
  }, [files]);

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
          toolPath="create-zip"
        />
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Raggruppa i tuoi file in un unico ZIP.
          </h1>
          <p className="max-w-xl text-sm text-slate-300">
            Aggiungi uno o più file di qualsiasi tipo e scarica un archivio ZIP
            pronto per essere inviato o archiviato.
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-50">
                1. Aggiungi file
              </p>
              <p className="text-xs text-slate-400">
                Puoi selezionare più file insieme, di qualunque tipo.
              </p>
            </div>
            <label className="inline-flex cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-sm hover:bg-sky-400">
              Seleziona file
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFilesChange}
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
            <span>
              {files.length > 0
                ? `${files.length} file · ${formatBytes(totalSize)} totali`
                : "Nessun file aggiunto."}
            </span>
          </div>

          {files.length > 0 && (
            <div className="mt-4 max-h-44 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/70 p-3 text-[11px] text-slate-300">
              {files.map((f) => (
                <p key={f.id}>
                  {f.name} · {formatBytes(f.size)}
                </p>
              ))}
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={!files.length || isCreating}
              onClick={handleCreateZip}
              className="inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-2 text-xs font-semibold text-slate-950 shadow-sm hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreating ? "Creazione ZIP..." : "2. Crea ZIP"}
            </button>
            {files.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center justify-center rounded-full border border-slate-600 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-100 hover:border-rose-400 hover:text-rose-200"
              >
                Svuota elenco
              </button>
            )}
          </div>

          {error && (
            <p className="mt-3 text-xs text-rose-400">{error}</p>
          )}
        </section>
        <RelatedTools locale={locale} currentSlug="create-zip" />
        <FaqSection faqs={getToolFaq("create-zip")} />
      </main>
    </div>
  );
}

