"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { PDFDocument, PDFName, PDFString, PDFDict, PDFRawStream, PDFArray } from "@cantoo/pdf-lib";
import { Upload, Loader2, FileText, Check } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SchemaMarkup } from "@/components/SchemaMarkup";

const VERAPDF_URL = "https://demo.verapdf.org";

async function convertToPdfA(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  const now = new Date();
  const isoDate = now.toISOString();

  const xmpMetadata = `<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about=""
        xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/"
        xmlns:dc="http://purl.org/dc/elements/1.1/"
        xmlns:xmp="http://ns.adobe.com/xap/1.0/"
        xmlns:pdf="http://ns.adobe.com/pdf/1.3/">
      <pdfaid:part>1</pdfaid:part>
      <pdfaid:conformance>B</pdfaid:conformance>
      <dc:format>application/pdf</dc:format>
      <xmp:CreateDate>${isoDate}</xmp:CreateDate>
      <xmp:ModifyDate>${isoDate}</xmp:ModifyDate>
      <xmp:MetadataDate>${isoDate}</xmp:MetadataDate>
      <xmp:CreatorTool>FileFlip PDF/A Converter</xmp:CreatorTool>
      <pdf:Producer>FileFlip</pdf:Producer>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`.trim();

  const context = pdfDoc.context;
  const metadataDict = PDFDict.withContext(context);
  metadataDict.set(PDFName.of("Type"), PDFName.of("Metadata"));
  metadataDict.set(PDFName.of("Subtype"), PDFName.of("XML"));
  const contents = new TextEncoder().encode(xmpMetadata);
  const metadataStream = PDFRawStream.of(metadataDict, contents);
  const metadataRef = context.register(metadataStream);
  pdfDoc.catalog.set(PDFName.of("Metadata"), metadataRef);

  const outputIntent = PDFDict.withContext(context);
  outputIntent.set(PDFName.of("Type"), PDFName.of("OutputIntent"));
  outputIntent.set(PDFName.of("S"), PDFName.of("GTS_PDFA1"));
  outputIntent.set(PDFName.of("OutputConditionIdentifier"), PDFString.of("sRGB"));
  outputIntent.set(PDFName.of("Info"), PDFString.of("sRGB IEC61966-2.1"));
  outputIntent.set(PDFName.of("RegistryName"), PDFString.of("http://www.color.org"));
  const outputIntentRef = context.register(outputIntent);
  const outputIntentsArray = new PDFArray(context);
  outputIntentsArray.push(outputIntentRef);
  const outputIntentsRef = context.register(outputIntentsArray);
  pdfDoc.catalog.set(PDFName.of("OutputIntents"), outputIntentsRef);

  pdfDoc.setProducer("FileFlip PDF/A Converter");
  pdfDoc.setCreator("FileFlip");
  pdfDoc.setModificationDate(now);

  pdfDoc.catalog.delete(PDFName.of("JavaScript"));
  pdfDoc.catalog.delete(PDFName.of("JS"));
  pdfDoc.catalog.delete(PDFName.of("AA"));
  pdfDoc.catalog.delete(PDFName.of("OpenAction"));

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name.replace(/\.pdf$/i, "_pdfa.pdf");
  a.click();
  URL.revokeObjectURL(url);
}

export default function PdfToPdfaPage() {
  const locale = useLocale();
  const t = useTranslations("tools.pdfToPdfa");
  const tCommon = useTranslations("common");
  const [file, setFile] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState("");
  const [converted, setConverted] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = useCallback(
    (selectedFile) => {
      if (!selectedFile) {
        setFile(null);
        setConverted(false);
        setError("");
        return;
      }
      if (selectedFile.type !== "application/pdf" && !selectedFile.name.toLowerCase().endsWith(".pdf")) {
        setError(t("errorGeneric"));
        setFile(null);
        return;
      }
      setError("");
      setConverted(false);
      setFile(selectedFile);
    },
    [t]
  );

  const handleFileChange = useCallback((e) => processFile(e.target.files?.[0] ?? null), [processFile]);
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.relatedTarget && e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragOver(false);
  }, []);
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      processFile(e.dataTransfer?.files?.[0] ?? null);
    },
    [processFile]
  );

  const onConvert = useCallback(async () => {
    if (!file) {
      setError(t("errorGeneric"));
      return;
    }
    setError("");
    setIsConverting(true);
    setConverted(false);
    try {
      await convertToPdfA(file);
      setConverted(true);
    } catch (err) {
      console.error(err);
      setError(t("errorGeneric"));
    } finally {
      setIsConverting(false);
    }
  }, [file, t]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <SchemaMarkup
        title={t("metaTitle")}
        description={t("metaDescription")}
        slug="pdf-to-pdfa"
        locale={locale}
      />
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href={`/${locale}/`} prefetch className="flex items-center gap-2">
            <img src="/fileflip-logo.svg" alt={tCommon("siteName")} className="h-11 w-auto" width={170} height={44} />
            <span className="text-sm text-slate-400">{t("title")}</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumb
          locale={locale}
          homeLabel={tCommon("breadcrumbHome")}
          toolsLabel={tCommon("nav.tools")}
          toolLabel={t("title")}
          toolPath="pdf-to-pdfa"
        />

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_340px]">
          <section className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("metaTitle")}</h1>
              <p className="mt-1 text-sm text-slate-300">{t("description")}</p>
            </div>

            {!file ? (
              <label
                role="button"
                tabIndex={0}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex h-[200px] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 px-4 transition-colors duration-200 ${
                  isDragOver ? "border-sky-500 bg-sky-500/15" : "border-dashed border-sky-500/70 bg-slate-900/50"
                }`}
              >
                <Upload className="h-10 w-10 text-sky-400" strokeWidth={1.5} />
                <span className="text-center text-sm text-slate-300">{t("dropzone")}</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-slate-900/50 p-4">
                  <FileText className="h-8 w-8 text-rose-500" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-100">{file.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => processFile(null)}
                    className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-slate-300 hover:bg-white/10"
                  >
                    {tCommon("changeFile")}
                  </button>
                </div>
                <p className="text-xs text-slate-400">PDF/A-1b</p>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <button
                  type="button"
                  onClick={onConvert}
                  disabled={isConverting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 font-medium text-slate-950 hover:bg-sky-400 disabled:opacity-60"
                >
                  {isConverting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {t("converting")}
                    </>
                  ) : (
                    t("convert")
                  )}
                </button>

                {converted && (
                  <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 space-y-3">
                    <h3 className="font-semibold text-slate-100">{t("checklistTitle")}</h3>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                        {t("check1")}
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                        {t("check2")}
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                        {t("check3")}
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                        {t("check4")}
                      </li>
                    </ul>
                    <p className="text-xs text-slate-400 pt-2 border-t border-white/10">
                      {t("disclaimer")}{" "}
                      <a
                        href={VERAPDF_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-400 hover:underline"
                      >
                        veraPDF
                      </a>
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>
          <aside className="space-y-8 lg:max-w-[340px]">
            <EditorialSection namespace="tools.pdfToPdfa" />
          </aside>
        </div>

        <div className="mt-10">
          <RelatedTools locale={locale} currentSlug="pdf-to-pdfa" />
        </div>

        <div className="mt-10">
          <FaqSection namespace="tools.pdfToPdfa" />
        </div>
      </main>
    </div>
  );
}
