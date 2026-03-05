"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import {
  PDFDocument,
  PDFName,
  PDFString,
  PDFHeader,
} from "@cantoo/pdf-lib";
import { Upload, Loader2, FileText, Check } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SchemaMarkup } from "@/components/SchemaMarkup";

const VERAPDF_URL = "https://demo.verapdf.org";

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** XMP packet for PDF/A-1b: pdfaid part=1, conformance=B. Synced with Info dict. Padded to 4096 bytes. */
function buildXmpPacket(opts) {
  const {
    isoCreation,
    isoMod,
    creatorTool,
    producer,
    titleXml = "",
    creatorXml = "",
  } = opts;
  const xmpContent = `<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about=""
        xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/">
      <pdfaid:part>1</pdfaid:part>
      <pdfaid:conformance>B</pdfaid:conformance>
    </rdf:Description>
    <rdf:Description rdf:about=""
        xmlns:xmp="http://ns.adobe.com/xap/1.0/">
      <xmp:CreateDate>${isoCreation}</xmp:CreateDate>
      <xmp:ModifyDate>${isoMod}</xmp:ModifyDate>
      <xmp:MetadataDate>${isoMod}</xmp:MetadataDate>
      <xmp:CreatorTool>${escapeXml(creatorTool)}</xmp:CreatorTool>
    </rdf:Description>
    <rdf:Description rdf:about=""
        xmlns:pdf="http://ns.adobe.com/pdf/1.3/">
      <pdf:Producer>${escapeXml(producer)}</pdf:Producer>
    </rdf:Description>
    <rdf:Description rdf:about=""
        xmlns:dc="http://purl.org/dc/elements/1.1/">
      <dc:format>application/pdf</dc:format>
      ${titleXml}
      ${creatorXml}
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>`;
  const endTag = "\n<?xpacket end=\"w\"?>";
  const targetLength = 4096;
  const newlineAfterContent = "\n";
  const paddingNeeded = Math.max(
    0,
    targetLength - xmpContent.length - newlineAfterContent.length - endTag.length
  );
  const padding = " ".repeat(paddingNeeded);
  const xmpFull = xmpContent + newlineAfterContent + padding + endTag;
  return new TextEncoder().encode(xmpFull);
}

/** Fetch sRGB ICC profile from static file in /public (see postinstall/build). */
async function getIccBytesFromPublic() {
  const res = await fetch("/srgb.icc");
  if (!res.ok) throw new Error("ICC profile not found in /public/srgb.icc");
  const buf = await res.arrayBuffer();
  return new Uint8Array(buf);
}

async function convertToPdfA(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  const context = pdfDoc.context;

  // FIX 1 — Sync Info dictionary with XMP (must be identical)
  const existingTitle = pdfDoc.getTitle() || "";
  const existingAuthor = pdfDoc.getAuthor() || "";
  const existingCreator = pdfDoc.getCreator() || "";
  const existingCreationDate = pdfDoc.getCreationDate();
  const creationDate = existingCreationDate || new Date();
  const modDate = new Date();
  // ISO 8601 without milliseconds — veraPDF 6.7.3 test 8: ModDate and xmp:ModifyDate must match
  const isoCreation = creationDate.toISOString().replace(/\.\d{3}Z$/, "Z");
  const isoMod = modDate.toISOString().replace(/\.\d{3}Z$/, "Z");
  const creatorTool = existingCreator || "FileFlip PDF/A Converter";
  const producer = "FileFlip PDF/A Converter";

  pdfDoc.setProducer(producer);
  pdfDoc.setCreator(creatorTool);
  pdfDoc.setModificationDate(modDate);
  if (existingTitle) pdfDoc.setTitle(existingTitle);
  if (existingAuthor) pdfDoc.setAuthor(existingAuthor);

  context.header = PDFHeader.forVersion(1, 4);

  const titleXml = existingTitle
    ? `<dc:title><rdf:Alt><rdf:li xml:lang="x-default">${escapeXml(existingTitle)}</rdf:li></rdf:Alt></dc:title>`
    : "";
  const creatorXml = existingAuthor
    ? `<dc:creator><rdf:Seq><rdf:li>${escapeXml(existingAuthor)}</rdf:li></rdf:Seq></dc:creator>`
    : "";

  const xmpBytes = buildXmpPacket({
    isoCreation,
    isoMod,
    creatorTool,
    producer,
    titleXml,
    creatorXml,
  });
  const metadataStream = context.stream(xmpBytes, {
    Type: "Metadata",
    Subtype: "XML",
    Length: xmpBytes.length,
  });
  const metadataRef = context.register(metadataStream);
  pdfDoc.catalog.set(PDFName.of("Metadata"), metadataRef);

  // FIX 2 — OutputIntent with sRGB ICC from /public/srgb.icc
  const iccBytes = await getIccBytesFromPublic();
  const iccStream = context.stream(iccBytes, {
    N: 3,
    Alternate: PDFName.of("DeviceRGB"),
    Length: iccBytes.length,
  });
  const iccRef = context.register(iccStream);
  const outputIntent = context.obj({
    Type: PDFName.of("OutputIntent"),
    S: PDFName.of("GTS_PDFA1"),
    OutputConditionIdentifier: PDFString.of("sRGB IEC61966-2.1"),
    Info: PDFString.of("sRGB IEC61966-2.1"),
    RegistryName: PDFString.of("http://www.color.org"),
    DestOutputProfile: iccRef,
  });
  const outputIntentRef = context.register(outputIntent);
  pdfDoc.catalog.set(
    PDFName.of("OutputIntents"),
    context.obj([outputIntentRef])
  );

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
  const [mode, setMode] = useState("standard");
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [converted, setConverted] = useState(false);
  const [checklist, setChecklist] = useState(null);
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

  const convertFlatten = useCallback(
    async (targetFile) => {
      setProgress(
        t("renderingPage")
          .replace("{current}", "0")
          .replace("{total}", "...")
      );
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const { jsPDF } = await import("jspdf");
      const {
        PDFDocument,
        PDFName,
        PDFString,
      } = await import("@cantoo/pdf-lib");
      const arrayBuffer = await targetFile.arrayBuffer();

      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
        cMapPacked: true,
      });
      const pdfDocument = await loadingTask.promise;
      const numPages = pdfDocument.numPages;

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        compress: true,
      });

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        setProgress(
          t("renderingPage")
            .replace("{current}", String(pageNum))
            .replace("{total}", String(numPages))
        );
        const page = await pdfDocument.getPage(pageNum);
        const origViewport = page.getViewport({ scale: 1.0 });
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page
          .render({
            canvasContext: ctx,
            viewport,
            background: "white",
          })
          .promise;
        const imgData = canvas.toDataURL("image/jpeg", 0.92);
        const pdfW = origViewport.width;
        const pdfH = origViewport.height;
        if (pageNum === 1) {
          doc.internal.pageSize.width = pdfW;
          doc.internal.pageSize.height = pdfH;
          doc.addImage(imgData, "JPEG", 0, 0, pdfW, pdfH);
        } else {
          doc.addPage([pdfW, pdfH]);
          doc.addImage(imgData, "JPEG", 0, 0, pdfW, pdfH);
        }
        canvas.width = 0;
        canvas.height = 0;
      }

      setProgress(t("converting"));
      const jsPdfBytes = doc.output("arraybuffer");
      const pdfDoc = await PDFDocument.load(jsPdfBytes);
      const context = pdfDoc.context;
      const modDate = new Date();
      const isoDate = modDate.toISOString().replace(/\.\d{3}Z$/, "Z");
      const xmpContent = `<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about=""
        xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/">
      <pdfaid:part>1</pdfaid:part>
      <pdfaid:conformance>B</pdfaid:conformance>
    </rdf:Description>
    <rdf:Description rdf:about=""
        xmlns:xmp="http://ns.adobe.com/xap/1.0/">
      <xmp:CreateDate>${isoDate}</xmp:CreateDate>
      <xmp:ModifyDate>${isoDate}</xmp:ModifyDate>
      <xmp:MetadataDate>${isoDate}</xmp:MetadataDate>
      <xmp:CreatorTool>FileFlip PDF/A Converter</xmp:CreatorTool>
    </rdf:Description>
    <rdf:Description rdf:about=""
        xmlns:pdf="http://ns.adobe.com/pdf/1.3/">
      <pdf:Producer>FileFlip PDF/A Converter</pdf:Producer>
    </rdf:Description>
    <rdf:Description rdf:about=""
        xmlns:dc="http://purl.org/dc/elements/1.1/">
      <dc:format>application/pdf</dc:format>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;
      const encoder = new TextEncoder();
      const xmpBytes = encoder.encode(xmpContent);
      const metadataStream = context.stream(xmpBytes, {
        Type: PDFName.of("Metadata"),
        Subtype: PDFName.of("XML"),
        Length: xmpBytes.length,
      });
      const metadataRef = context.register(metadataStream);
      pdfDoc.catalog.set(PDFName.of("Metadata"), metadataRef);

      const iccResponse = await fetch("/srgb.icc");
      if (!iccResponse.ok)
        throw new Error("ICC profile not found in /public/srgb.icc");
      const iccBuffer = await iccResponse.arrayBuffer();
      const iccBytes = new Uint8Array(iccBuffer);
      const iccStream = context.stream(iccBytes, {
        N: 3,
        Alternate: PDFName.of("DeviceRGB"),
        Length: iccBytes.length,
      });
      const iccRef = context.register(iccStream);
      const outputIntent = context.obj({
        Type: PDFName.of("OutputIntent"),
        S: PDFName.of("GTS_PDFA1"),
        OutputConditionIdentifier: PDFString.of("sRGB IEC61966-2.1"),
        Info: PDFString.of("sRGB IEC61966-2.1"),
        RegistryName: PDFString.of("http://www.color.org"),
        DestOutputProfile: iccRef,
      });
      const outputIntentRef = context.register(outputIntent);
      pdfDoc.catalog.set(
        PDFName.of("OutputIntents"),
        context.obj([outputIntentRef])
      );
      pdfDoc.setProducer("FileFlip PDF/A Converter");
      pdfDoc.setCreator("FileFlip PDF/A Converter");
      pdfDoc.setModificationDate(modDate);
      pdfDoc.setCreationDate(modDate);
      pdfDoc.catalog.delete(PDFName.of("JavaScript"));
      pdfDoc.catalog.delete(PDFName.of("JS"));
      pdfDoc.catalog.delete(PDFName.of("AA"));
      pdfDoc.catalog.delete(PDFName.of("OpenAction"));

      setProgress(t("converting"));
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = targetFile.name.replace(/\.pdf$/i, "_pdfa.pdf");
      a.click();
      URL.revokeObjectURL(url);
      setChecklist({
        xmp: true,
        icc: true,
        javascript: true,
        identifier: true,
        flattened: true,
      });
    },
    [t]
  );

  const onConvert = useCallback(async () => {
    if (!file) {
      setError(t("errorGeneric"));
      return;
    }
    setError("");
    setIsConverting(true);
    setConverted(false);
    setChecklist(null);
    setProgress("");
    try {
      if (mode === "flatten") {
        await convertFlatten(file);
      } else {
        await convertToPdfA(file);
        setChecklist({
          xmp: true,
          icc: true,
          javascript: true,
          identifier: true,
          datesSynced: true,
        });
      }
      setConverted(true);
    } catch (err) {
      console.error(err);
      setError(t("errorGeneric"));
    } finally {
      setIsConverting(false);
      setProgress("");
    }
  }, [file, mode, convertFlatten, t]);

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

            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode("standard");
                  setConverted(false);
                  setChecklist(null);
                }}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  mode === "standard"
                    ? "border-sky-500 bg-sky-500/15"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="font-semibold text-sm mb-1 text-slate-100">{t("modeStandardTitle")}</div>
                <div className="text-xs text-slate-400">{t("modeStandardDesc")}</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("flatten");
                  setConverted(false);
                  setChecklist(null);
                }}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  mode === "flatten"
                    ? "border-sky-500 bg-sky-500/15"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="font-semibold text-sm mb-1 text-slate-100">{t("modeFlattenTitle")}</div>
                <div className="text-xs text-slate-400">{t("modeFlattenDesc")}</div>
              </button>
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
                      {progress || t("converting")}
                    </>
                  ) : (
                    t("convert")
                  )}
                </button>

                {converted && mode === "standard" && checklist && (
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
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                        {t("check5")}
                      </li>
                      <li className="flex items-start gap-2 text-amber-200/90">
                        <span className="mt-0.5 shrink-0 text-amber-400" aria-hidden>⚠</span>
                        <span>{t("checkWarning")}</span>
                      </li>
                    </ul>
                    <p className="text-xs text-slate-400 pt-2 border-t border-white/10">
                      ⚠️ {t("disclaimerStandard")}
                    </p>
                  </div>
                )}

                {converted && mode === "flatten" && checklist && (
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
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                        {t("checkFlattened")}
                      </li>
                    </ul>
                    <p className="text-xs text-slate-400 pt-2 border-t border-white/10">
                      ⚠️ {t("disclaimerFlatten")}{" "}
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
