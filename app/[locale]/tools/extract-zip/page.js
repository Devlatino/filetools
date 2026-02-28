"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import JSZip from "jszip";
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

export default function ExtractZipPage() {
  const tCommon = useTranslations("common");
  const t = useTranslations("tools.extractZip");
  const [zipInfo, setZipInfo] = useState(null);
  const [entries, setEntries] = useState([]);
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState("");

  const handleZipChange = useCallback(async (event) => {
    const file = event.target.files?.[0];
    setError("");
    setZipInfo(null);
    setEntries([]);

    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".zip")) {
      setError("Seleziona un file ZIP.");
      return;
    }

    setIsReading(true);
    try {
      const data = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(data);
      const list = [];
      zip.forEach((relativePath, entry) => {
        list.push({
          path: relativePath,
          dir: entry.dir,
          size: entry._data.uncompressedSize || 0,
        });
      });
      setZipInfo({
        name: file.name,
        size: file.size,
        zipInstance: zip,
      });
      setEntries(list.sort((a, b) => a.path.localeCompare(b.path)));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError("Errore durante la lettura dello ZIP. Riprova.");
    } finally {
      setIsReading(false);
    }
  }, []);

  const handleDownloadEntry = useCallback(async (entryPath) => {
    if (!zipInfo?.zipInstance) return;
    const entry = zipInfo.zipInstance.file(entryPath);
    if (!entry) return;
    const blob = await entry.async("blob");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = entryPath.split("/").pop() || "file";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [zipInfo]);

  const handleDownloadAll = useCallback(async () => {
    if (!zipInfo?.zipInstance) return;
    const blob = await zipInfo.zipInstance.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = zipInfo.name || "archivio.zip";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [zipInfo]);

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
          toolPath="extract-zip"
        />
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Esplora e scarica i file da un archivio ZIP.
          </h1>
          <p className="max-w-xl text-sm text-slate-300">
            Carica un archivio ZIP per vedere l&apos;elenco dei file contenuti e
            scaricarli singolarmente o tutti insieme.
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-50">
                1. Carica archivio ZIP
              </p>
              <p className="text-xs text-slate-400">
                Vedrai subito i file contenuti, con nome e dimensione.
              </p>
            </div>
            <label className="inline-flex cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-sm hover:bg-sky-400">
              Seleziona ZIP
              <input
                type="file"
                accept=".zip,application/zip"
                className="hidden"
                onChange={handleZipChange}
              />
            </label>
          </div>

          {zipInfo && (
            <div className="mt-4 text-[11px] text-slate-300">
              Archivio:{" "}
              <span className="font-semibold">{zipInfo.name}</span> ·{" "}
              {formatBytes(zipInfo.size)}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
            <button
              type="button"
              disabled={!zipInfo || !entries.length}
              onClick={handleDownloadAll}
              className="inline-flex items-center justify-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-sm hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Scarica tutto come ZIP
            </button>
            {isReading && (
              <span>Analisi archivio in corso...</span>
            )}
          </div>

          {error && (
            <p className="mt-3 text-xs text-rose-400">{error}</p>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-50">
            2. File contenuti nello ZIP
          </h2>
          <div className="rounded-2xl border border-white/10 bg-slate-900/80">
            {(!zipInfo || !entries.length) && !isReading ? (
              <div className="flex items-center justify-center px-4 py-10 text-xs text-slate-500">
                Carica uno ZIP per vedere i file contenuti.
              </div>
            ) : (
              <ul className="max-h-80 divide-y divide-slate-800 overflow-y-auto text-xs">
                {entries.map((e) => (
                  <li
                    key={e.path}
                    className="flex items-center justify-between gap-3 px-4 py-2"
                  >
                    <div className="flex flex-col">
                      <span className="max-w-xs truncate text-slate-100 sm:max-w-sm">
                        {e.path}
                      </span>
                      {!e.dir && (
                        <span className="text-[11px] text-slate-400">
                          {formatBytes(e.size)}
                        </span>
                      )}
                    </div>
                    {!e.dir && (
                      <button
                        type="button"
                        onClick={() => handleDownloadEntry(e.path)}
                        className="whitespace-nowrap rounded-full border border-slate-600 px-2 py-1 text-[11px] text-slate-100 hover:border-sky-400 hover:text-sky-200"
                      >
                        Scarica
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
        <RelatedTools locale={locale} currentSlug="extract-zip" />
        <FaqSection faqs={getToolFaq("extract-zip")} />
      </main>
    </div>
  );
}

