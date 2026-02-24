/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo } from "react";

const tools = [
  { href: "/tools/compress-image", label: "Comprimi immagine", short: "Riduci il peso delle tue foto.", icon: "IMG", iconBg: "bg-sky-500" },
  { href: "/tools/merge-pdf", label: "Unisci PDF", short: "Combina più PDF in un unico file.", icon: "PDF", iconBg: "bg-rose-500" },
  { href: "/tools/compress-pdf", label: "Comprimi PDF", short: "Riduci il peso dei documenti PDF.", icon: "PDF", iconBg: "bg-rose-400" },
  { href: "/tools/jpg-to-png", label: "JPG → PNG", short: "Converti immagini JPG in PNG.", icon: "JPG", iconBg: "bg-sky-400" },
  { href: "/tools/png-to-jpg", label: "PNG → JPG", short: "Converti immagini PNG in JPG.", icon: "PNG", iconBg: "bg-indigo-400" },
  { href: "/tools/image-to-webp", label: "Immagine → WebP", short: "Converti in WebP per file più leggeri.", icon: "WBP", iconBg: "bg-emerald-400" },
  { href: "/tools/resize-image", label: "Ridimensiona immagini", short: "Adatta foto a siti, CV e moduli.", icon: "SIZE", iconBg: "bg-indigo-500" },
  { href: "/tools/pdf-to-images", label: "PDF → Immagini", short: "Estrai ogni pagina come PNG.", icon: "PDF", iconBg: "bg-amber-400" },
  { href: "/tools/create-zip", label: "Crea archivio ZIP", short: "Raggruppa più file in un ZIP.", icon: "ZIP", iconBg: "bg-cyan-400" },
  { href: "/tools/extract-zip", label: "Estrai ZIP", short: "Apri e scarica file da un archivio.", icon: "ZIP", iconBg: "bg-cyan-500" },
];

export default function Home() {
  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="#top" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500 text-lg font-bold text-slate-950 shadow-sm">
              F
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-semibold tracking-tight">
                FileFlip
              </span>
              <span className="text-xs text-slate-400">
                Converti e comprimi file
              </span>
            </div>
          </a>

          <nav className="hidden items-center gap-6 text-xs font-medium text-slate-300 sm:flex">
            <a href="#tools" className="hover:text-sky-400">
              Tool
            </a>
            <a href="#come-funziona" className="hover:text-sky-400">
              Come funziona
            </a>
            <a href="#faq" className="hover:text-sky-400">
              FAQ
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main id="top" className="flex-1">
        <section className="relative overflow-hidden border-b border-white/10">
          {/* Wallpaper dinamico a waves */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.20),transparent_55%),radial-gradient(circle_at_bottom,_rgba(37,99,235,0.18),transparent_55%)]" />
          {/* wave orizzontale */}
          <div className="pointer-events-none absolute -left-1/3 top-10 h-64 w-[140%] animate-wave rounded-[999px] bg-gradient-to-r from-sky-500/25 via-cyan-400/15 to-blue-500/25 blur-3xl" />
          {/* wave verticale */}
          <div className="pointer-events-none absolute -right-1/3 bottom-0 h-80 w-[120%] animate-wave-slow rounded-[999px] bg-gradient-to-tr from-indigo-500/25 via-sky-500/10 to-cyan-400/25 blur-3xl" />

          <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <div className="space-y-8 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/25 bg-slate-950/80 px-3 py-1 text-[11px] font-medium text-sky-200 shadow-sm shadow-sky-500/20 backdrop-blur">
                100% gratis • Nessun account • Tutto nel browser
              </div>

              <div className="space-y-4">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                  Strumenti per i tuoi file,
                  <span className="block bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                    pensati per tutti.
                  </span>
                </h1>
                <p className="mx-auto max-w-xl text-sm text-slate-300 sm:text-base">
                  Scegli cosa vuoi fare (es. comprimere una foto), carica il
                  file e scarica il risultato. Niente termini tecnici, solo
                  pulsanti chiari e istruzioni semplici.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-start">
                <a
                  href="#tools"
                  className="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-sm transition-transform transition-colors hover:-translate-y-0.5 hover:bg-sky-400"
                >
                  Scegli un&apos;azione
                </a>
                <a
                  href="#come-funziona"
                  className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-5 py-2 text-xs font-medium text-slate-200 hover:border-sky-400 hover:text-sky-300"
                >
                  Come funziona in 3 passi
                </a>
              </div>

              <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-400 sm:justify-start">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Nessun watermark
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Funziona su PC, tablet e smartphone
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Interfaccia chiara anche per chi non è tecnico
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Come funziona */}
        <section
          id="come-funziona"
          className="border-b border-white/10 bg-slate-950"
        >
          <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:flex-row sm:px-6 lg:px-8">
            <div className="sm:w-1/3">
              <h2 className="text-base font-semibold text-slate-50">
                Come usare FileFlip
              </h2>
              <p className="mt-2 text-xs text-slate-400">
                Una procedura sempre uguale, per ogni tool.
              </p>
            </div>
            <div className="grid flex-1 gap-4 text-sm sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-slate-900 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Passo 1
                </p>
                <p className="mt-2 text-slate-50">Scegli un&apos;azione.</p>
                <p className="mt-1 text-xs text-slate-400">
                  Esempio: &quot;Comprimi immagine&quot; o
                  &quot;Crea archivio ZIP&quot;.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Passo 2
                </p>
                <p className="mt-2 text-slate-50">
                  Premi sul pulsante grande &quot;Carica file&quot;.
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Nessuna impostazione complicata, solo l&apos;essenziale.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Passo 3
                </p>
                <p className="mt-2 text-slate-50">
                  Scarica il nuovo file pronto all&apos;uso.
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Puoi ripetere l&apos;operazione tutte le volte che vuoi.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Griglia tool: ogni card è un link alla pagina del tool */}
        <section id="tools" className="bg-slate-950 py-14 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  Scegli cosa vuoi fare
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Clicca su un riquadro per aprire il tool e iniziare subito.
                </p>
              </div>
              <span className="inline-flex items-center rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs font-medium text-sky-100">
                {tools.length} tool disponibili
              </span>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {tools.map((tool) => (
                <a
                  key={tool.href}
                  href={tool.href}
                  className="group flex flex-col rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-sm transition-colors hover:border-sky-400/70 hover:bg-slate-900"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${tool.iconBg} text-xs font-semibold text-slate-950`}
                    >
                      {tool.icon}
                    </div>
                    <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-[10px] font-medium text-emerald-100">
                      Apri
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold">{tool.label}</h3>
                  <p className="mt-1.5 text-xs text-slate-300">{tool.short}</p>
                  <span className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-slate-100/10 px-3 py-2 text-xs font-semibold text-slate-100 transition-colors group-hover:bg-sky-400 group-hover:text-slate-950">
                    Vai al tool →
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section
          id="faq"
          className="border-t border-white/10 bg-slate-950 py-10 sm:py-12"
        >
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-4 text-lg font-semibold text-slate-50 sm:text-xl">
              Domande frequenti
            </h2>
            <div className="space-y-4 text-sm text-slate-300">
              <div>
                <p className="font-medium text-slate-50">
                  FileFlip è davvero gratuito?
                </p>
                <p className="mt-1">
                  Sì. L&apos;obiettivo è offrire strumenti semplici e gratuiti
                  per l&apos;uso quotidiano, senza costi nascosti.
                </p>
              </div>
              <div>
                <p className="font-medium text-slate-50">
                  Devo creare un account?
                </p>
                <p className="mt-1">
                  No. Usi FileFlip direttamente dal browser, senza registrarti.
                </p>
              </div>
              <div>
                <p className="font-medium text-slate-50">
                  Le funzioni sono già attive?
                </p>
                <p className="mt-1">
                  Sì. Ogni card nella sezione &quot;Tool&quot; porta alla pagina
                  del tool corrispondente, dove puoi usarlo subito.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {year} FileFlip · Un progetto per rendere i file più semplici da
            gestire.
          </p>
          <div className="flex gap-4">
            <button
              type="button"
              className="hover:text-sky-400"
            >
              Privacy
            </button>
            <button
              type="button"
              className="hover:text-sky-400"
            >
              Termini
            </button>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="hover:text-sky-400"
            >
              Torna su
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

