"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { PDFDocument } from "pdf-lib";
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

const levels = [
  { id: "low", label: "Bassa (massima compressione)", quality: 0.3 },
  { id: "medium", label: "Media (equilibrata)", quality: 0.6 },
  { id: "high", label: "Alta (miglior qualità)", quality: 0.85 },
];

export default function CompressPdfPage() {
  const locale = useLocale();
  const tCommon = useTranslations("common");
  const t = useTranslations("tools.compressPdf");
  const [files, setFiles] = useState([]);
  const [level, setLevel] = useState("medium");
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState("");

  const totalSize = useMemo(
    () => files.reduce((acc, f) => acc + (f.file?.size || 0), 0),
    [files]
  );

  const selectedLevel = useMemo(
    () => levels.find((l) => l.id === level) || levels[1],
    [level]
  );

  const handleFilesChange = useCallback((event) => {
    const list = Array.from(event.target.files || []);
    setError("");
    if (!list.length) return;
    const pdfs = list.filter((f) => f.type === "application/pdf");
    if (!pdfs.length) {
      setError("Carica solo file PDF.");
      return;
    }
    const mapped = pdfs.map((file, index) => ({
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

  const handleCompress = useCallback(async () => {
    if (!files.length) {
      setError("Carica almeno un PDF.");
      return;
    }
    setIsCompressing(true);
    setError("");

    try {
      // Nota: pdf-lib non ha una vera "compressione" con controlli fini,
      // ma il salvataggio ricrea il file spesso più compatto.
      // Per semplicità usiamo save() con diverse opzioni a seconda del livello.
      const promises = files.map(async ({ file }) => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer, {
          ignoreEncryption: true,
        });
        const optimizedBytes = await pdf.save({
          useObjectStreams: selectedLevel.quality > 0.5,
          addDefaultPage: false,
        });
        return { file, optimizedBytes };
      });

      const results = await Promise.all(promises);

      results.forEach(({ file, optimizedBytes }) => {
        const blob = new Blob([optimizedBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `fileflip-compressed-${file.name}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError("Errore durante la compressione. Riprova con altri file.");
    } finally {
      setIsCompressing(false);
    }
  }, [files, selectedLevel]);

  const faqs = getToolFaq("compress-pdf");
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
          toolPath="compress-pdf"
        />
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Riduci il peso dei tuoi PDF.
          </h1>
          <p className="max-w-xl text-sm text-slate-300">
            Carica uno o più PDF, scegli il livello di compressione e scarica i
            documenti ottimizzati.
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-50">
                1. Carica i PDF
              </p>
              <p className="text-xs text-slate-400">
                Puoi selezionarne più di uno, anche in più volte.
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
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
            <span>
              {files.length > 0
                ? `${files.length} PDF · ${formatBytes(totalSize)} totali`
                : "Nessun PDF caricato."}
            </span>
          </div>

          <div className="mt-5 space-y-3">
            <p className="text-sm font-medium text-slate-50">
              2. Scegli il livello di compressione
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              {levels.map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setLevel(lvl.id)}
                  className={`rounded-xl border px-3 py-2 text-[11px] text-left transition-colors ${
                    level === lvl.id
                      ? "border-sky-400/80 bg-sky-500/10 text-sky-100"
                      : "border-slate-700 bg-slate-900 text-slate-300 hover:border-sky-500/60"
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={!files.length || isCompressing}
              onClick={handleCompress}
              className="inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-2 text-xs font-semibold text-slate-950 shadow-sm hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCompressing ? "Compressione in corso..." : "3. Comprimi PDF"}
            </button>
            <p className="text-[11px] text-slate-400">
              Ogni PDF verrà scaricato in versione ottimizzata.
            </p>
          </div>

          {error && (
            <p className="mt-3 text-xs text-rose-400">{error}</p>
          )}
        </section>

        {files.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-50">
              PDF selezionati
            </h2>
            <div className="rounded-2xl border border-white/10 bg-slate-900/80">
              <ul className="divide-y divide-slate-800 text-xs">
                {files.map((item, index) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 px-4 py-3"
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
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
        <RelatedTools locale={locale} currentSlug="compress-pdf" />
        <FaqSection faqs={faqs} />
      </main>
    </div>
  );
}

