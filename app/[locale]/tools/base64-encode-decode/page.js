"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Copy, Check, Trash2, Upload, ArrowLeftRight, Download } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SchemaMarkup } from "@/components/SchemaMarkup";

function encodeText(text) {
  try {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    let binary = "";
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return { result: btoa(binary), error: null };
  } catch (e) {
    return { result: null, error: e.message };
  }
}

function decodeText(base64) {
  try {
    const clean = base64.replace(/^data:.*?;base64,/, "");
    const binary = atob(clean);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return { result: new TextDecoder().decode(bytes), error: null };
  } catch (e) {
    return { result: null, error: e.message };
  }
}

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function Base64EncoderDecoderPage() {
  const locale = useLocale();
  const t = useTranslations("tools.base64EncodeDecode");
  const tCommon = useTranslations("common");

  const [mode, setMode] = useState("encode"); // "encode" | "decode"
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [includeDataUri, setIncludeDataUri] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [decodedMime, setDecodedMime] = useState("");
  const fileInputRef = useRef(null);

  const handleProcess = useCallback(
    (raw, currentMode, dataUri) => {
      if (!raw.trim()) {
        setOutput("");
        setError("");
        return;
      }
      if (currentMode === "encode") {
        const { result, error: err } = encodeText(raw);
        if (err) {
          setError(err);
          setOutput("");
        } else {
          setError("");
          setOutput(dataUri ? `data:text/plain;base64,${result}` : result);
        }
      } else {
        const { result, error: err } = decodeText(raw);
        if (err) {
          setError(err);
          setOutput("");
        } else {
          setError("");
          setOutput(result);
        }
      }
    },
    []
  );

  const handleInputChange = useCallback(
    (e) => {
      const val = e.target.value;
      setInput(val);
      setUploadedFile(null);
      handleProcess(val, mode, includeDataUri);
    },
    [mode, includeDataUri, handleProcess]
  );

  const handleModeToggle = useCallback(() => {
    const newMode = mode === "encode" ? "decode" : "encode";
    setMode(newMode);
    setInput("");
    setOutput("");
    setError("");
    setUploadedFile(null);
    setDecodedMime("");
  }, [mode]);

  const handleDataUriToggle = useCallback(
    (checked) => {
      setIncludeDataUri(checked);
      handleProcess(input, mode, checked);
    },
    [input, mode, handleProcess]
  );

  const handleFileUpload = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target.result;
        const b64 = dataUrl.split(",")[1];
        setUploadedFile({ name: file.name, size: file.size, mime: file.type });
        setInput(b64);
        setOutput(includeDataUri ? dataUrl : b64);
        setError("");
        setDecodedMime(file.type);
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    [includeDataUri]
  );

  const handleCopy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [output]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setError("");
    setUploadedFile(null);
    setDecodedMime("");
  }, []);

  const handleDownloadDecoded = useCallback(() => {
    if (!output || mode !== "decode") return;
    try {
      const clean = input.replace(/^data:.*?;base64,/, "");
      const binary = atob(clean);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: decodedMime || "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "decoded-file";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message);
    }
  }, [input, output, mode, decodedMime]);

  const inputSize = input ? new Blob([input]).size : 0;
  const outputSize = output ? new Blob([output]).size : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <SchemaMarkup
        title={t("metaTitle")}
        description={t("metaDescription")}
        slug="base64-encode-decode"
        locale={locale}
      />
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href={`/${locale}/`} prefetch className="flex items-center gap-2">
            <img src="/fileflip-logo.svg" alt={tCommon("siteName")} className="h-11 w-auto" width={170} height={44} />
            <span className="text-sm text-slate-400">{t("label")}</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumb
          locale={locale}
          homeLabel={tCommon("breadcrumbHome")}
          toolsLabel={tCommon("nav.tools")}
          toolLabel={t("label")}
          toolPath="base64-encode-decode"
        />

        <div className="mt-6 space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("metaTitle")}</h1>
            <p className="mt-1 text-sm text-slate-300">{t("metaDescription")}</p>
          </div>

          {/* Mode toggle */}
          <div className="flex items-center justify-center">
            <div className="inline-flex rounded-xl border border-white/10 bg-slate-900 p-1">
              <button
                type="button"
                onClick={() => mode !== "encode" && handleModeToggle()}
                className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition ${
                  mode === "encode"
                    ? "bg-sky-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Encode
              </button>
              <button
                type="button"
                onClick={() => mode !== "decode" && handleModeToggle()}
                className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition ${
                  mode === "decode"
                    ? "bg-sky-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Decode
              </button>
            </div>
            <button
              type="button"
              onClick={handleModeToggle}
              className="ml-3 flex items-center gap-1 rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-xs text-slate-400 transition hover:bg-slate-700"
            >
              <ArrowLeftRight size={14} />
              Switch
            </button>
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!output}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700 disabled:opacity-40"
            >
              {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              {copied ? "Copied!" : "Copy Output"}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-400 transition hover:bg-slate-700"
            >
              <Trash2 size={16} />
              Clear
            </button>
            {mode === "encode" && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-slate-700"
              >
                <Upload size={16} />
                Upload File
              </button>
            )}
            {mode === "decode" && output && (
              <button
                type="button"
                onClick={handleDownloadDecoded}
                className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 transition hover:bg-emerald-500/20"
              >
                <Download size={16} />
                Download Decoded File
              </button>
            )}
            <input ref={fileInputRef} type="file" className="sr-only" onChange={handleFileUpload} />

            {mode === "encode" && (
              <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm text-slate-400">
                <input
                  type="checkbox"
                  checked={includeDataUri}
                  onChange={(e) => handleDataUriToggle(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-sky-500"
                />
                Include Data URI prefix
              </label>
            )}
          </div>

          {uploadedFile && (
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm">
              <span className="text-slate-400">File:</span>
              <span className="font-medium text-slate-200">{uploadedFile.name}</span>
              <span className="text-slate-500">({formatBytes(uploadedFile.size)})</span>
            </div>
          )}

          {/* Panels */}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                {mode === "encode" ? "Plain Text / File" : "Base64 Input"}
              </label>
              <textarea
                value={input}
                onChange={handleInputChange}
                placeholder={t("dropzone")}
                spellCheck={false}
                className="h-[380px] w-full resize-none rounded-xl border border-white/10 bg-slate-900 p-4 font-mono text-sm text-slate-200 placeholder-slate-600 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
                style={{ fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace" }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                {mode === "encode" ? "Base64 Output" : "Decoded Text"}
              </label>
              <textarea
                value={output}
                readOnly
                placeholder="Output appears here..."
                spellCheck={false}
                className="h-[380px] w-full resize-none rounded-xl border border-white/10 bg-slate-900/50 p-4 font-mono text-sm text-slate-200 placeholder-slate-600 focus:outline-none"
                style={{ fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace" }}
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
              {error}
            </p>
          )}

          {/* Stats */}
          {(inputSize > 0 || outputSize > 0) && (
            <div className="flex flex-wrap gap-4 rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-xs text-slate-400">
              <span>Input: <strong className="text-slate-200">{formatBytes(inputSize)}</strong></span>
              <span>Output: <strong className="text-slate-200">{formatBytes(outputSize)}</strong></span>
              {inputSize > 0 && outputSize > 0 && (
                <span>
                  Ratio:{" "}
                  <strong className="text-slate-200">
                    {Math.round((outputSize / inputSize) * 100)}%
                  </strong>
                </span>
              )}
            </div>
          )}
        </div>
      </main>

      <EditorialSection namespace="tools.base64EncodeDecode" />

      <div className="mx-auto max-w-6xl px-4 pb-4 sm:px-6 lg:px-8">
        <RelatedTools locale={locale} currentSlug="base64-encode-decode" />
        <div className="mt-10">
          <FaqSection namespace="tools.base64EncodeDecode" />
        </div>
      </div>
    </div>
  );
}
