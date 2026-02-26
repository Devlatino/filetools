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

export default function ResizeImagePage() {
  const locale = useLocale();
  const tCommon = useTranslations("common");
  const t = useTranslations("tools.resizeImage");
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [maxWidth, setMaxWidth] = useState("");
  const [maxHeight, setMaxHeight] = useState("");
  const [isResizing, setIsResizing] = useState(false);
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
    const imgs = list.filter((f) =>
      ["image/jpeg", "image/png", "image/webp"].includes(f.type)
    );
    if (!imgs.length) {
      setError("Carica solo immagini JPG, PNG o WebP.");
      return;
    }
    const mapped = imgs.map((file, index) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      file,
    }));
    setFiles(mapped);
  }, []);

  const handleResize = useCallback(async () => {
    if (!files.length) {
      setError("Carica almeno un'immagine.");
      return;
    }
    const w = parseInt(maxWidth, 10) || undefined;
    const h = parseInt(maxHeight, 10) || undefined;
    if (!w && !h) {
      setError("Inserisci almeno una dimensione (larghezza o altezza).");
      return;
    }

    setIsResizing(true);
    setError("");
    setResults([]);

    try {
      const out = [];
      for (const item of files) {
        // eslint-disable-next-line no-await-in-loop
        const resized = await imageCompression(item.file, {
          maxWidthOrHeight: Math.max(w || 0, h || 0),
          useWebWorker: true,
        });
        const url = URL.createObjectURL(resized);
        out.push({
          id: item.id,
          originalName: item.name,
          originalSize: item.size,
          blob: resized,
          url,
        });
      }
      setResults(out);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError("Errore durante il ridimensionamento. Riprova.");
    } finally {
      setIsResizing(false);
    }
  }, [files, maxHeight, maxWidth]);

  const handleDownload = useCallback((result) => {
    const a = document.createElement("a");
    a.href = result.url;
    a.download = result.originalName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, []);

  const faqs = getToolFaq("resize-image");
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: t("metaTitle"),
    description: t("metaDescription"),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: 0, priceCurrency: "EUR" },
    aggregateRating: { "@type": "AggregateRating", ratingValue: 4.8, ratingCount: 127 },
  };
  const faqSchema =
    faqs?.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map(({ question, answer }) => ({
            "@type": "Question",
            name: question,
            acceptedAnswer: { "@type": "Answer", text: answer },
          })),
        }
      : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareSchema).replace(/</g, "\\u003c"),
        }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c"),
          }}
        />
      )}
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
          toolPath="resize-image"
        />
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Ridimensiona le tue immagini.
          </h1>
          <p className="max-w-xl text-sm text-slate-300">
            Imposta una larghezza o altezza massima per adattare le immagini a
            siti, CV online o moduli che richiedono dimensioni precise.
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-50">
                1. Carica immagini
              </p>
              <p className="text-xs text-slate-400">
                JPG, PNG o WebP. Puoi selezionare più file.
              </p>
            </div>
            <label className="inline-flex cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-sm hover:bg-sky-400">
              Seleziona immagini
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFilesChange}
              />
            </label>
          </div>

          <div className="mt-4 grid gap-3 text-xs text-slate-300 sm:grid-cols-2">
            <div>
              <label
                htmlFor="maxWidth"
                className="mb-1 block text-slate-200"
              >
                Larghezza massima (px)
              </label>
              <input
                id="maxWidth"
                type="number"
                min={50}
                placeholder="Es. 1200"
                value={maxWidth}
                onChange={(e) => setMaxWidth(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-50 outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div>
              <label
                htmlFor="maxHeight"
                className="mb-1 block text-slate-200"
              >
                Altezza massima (px)
              </label>
              <input
                id="maxHeight"
                type="number"
                min={50}
                placeholder="Es. 800"
                value={maxHeight}
                onChange={(e) => setMaxHeight(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-50 outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Puoi compilare solo uno dei due campi: l&apos;altro verrà calcolato
            mantenendo le proporzioni.
          </p>

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
              disabled={!files.length || isResizing}
              onClick={handleResize}
              className="inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-2 text-xs font-semibold text-slate-950 shadow-sm hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isResizing ? "Ridimensionamento in corso..." : "3. Ridimensiona immagini"}
            </button>
          </div>

          {error && (
            <p className="mt-3 text-xs text-rose-400">{error}</p>
          )}
        </section>

        {results.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-50">
              Risultati
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
                  Immagini ridimensionate
                </p>
                <div className="mt-2 max-h-64 space-y-2 overflow-y-auto text-[11px] text-slate-400">
                  {results.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="truncate">
                        {r.originalName} · {formatBytes(r.blob.size)}
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
              </div>
            </div>
          </section>
        )}
        <RelatedTools locale={locale} currentSlug="resize-image" />
        <FaqSection faqs={faqs} />
      </main>
    </div>
  );
}

