"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Copy, Check, Trash2, Upload, AlignLeft, Minimize2 } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SchemaMarkup } from "@/components/SchemaMarkup";

function syntaxHighlight(json) {
  const escaped = json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = "text-orange-400"; // number
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "text-sky-300"; // key
        } else {
          cls = "text-emerald-400"; // string
        }
      } else if (/true|false/.test(match)) {
        cls = "text-rose-400"; // boolean
      } else if (/null/.test(match)) {
        cls = "text-rose-400"; // null
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

function countKeys(obj, count = 0) {
  if (typeof obj !== "object" || obj === null) return count;
  for (const key of Object.keys(obj)) {
    count++;
    count = countKeys(obj[key], count);
  }
  return count;
}

const INDENT_OPTIONS = [
  { label: "2 spaces", value: 2 },
  { label: "4 spaces", value: 4 },
  { label: "Tab", value: "\t" },
];

export default function JsonFormatterPage() {
  const locale = useLocale();
  const t = useTranslations("tools.jsonFormatter");
  const tCommon = useTranslations("common");

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [indent, setIndent] = useState(2);
  const [copied, setCopied] = useState(false);
  const [highlightedHtml, setHighlightedHtml] = useState("");
  const [stats, setStats] = useState(null);
  const fileInputRef = useRef(null);

  const parseAndFormat = useCallback(
    (raw, ind) => {
      if (!raw.trim()) {
        setOutput("");
        setHighlightedHtml("");
        setError("");
        setStats(null);
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        const formatted = JSON.stringify(parsed, null, ind);
        setOutput(formatted);
        setHighlightedHtml(syntaxHighlight(formatted));
        setError("");
        const lines = formatted.split("\n").length;
        const size = new Blob([formatted]).size;
        const keys = typeof parsed === "object" && parsed !== null ? countKeys(parsed) : 0;
        setStats({ lines, size, keys });
      } catch (e) {
        setError(e.message);
        setOutput("");
        setHighlightedHtml("");
        setStats(null);
      }
    },
    []
  );

  const handleInputChange = useCallback(
    (e) => {
      const val = e.target.value;
      setInput(val);
      parseAndFormat(val, indent);
    },
    [indent, parseAndFormat]
  );

  const handleIndentChange = useCallback(
    (val) => {
      const parsed = val === "\t" ? "\t" : Number(val);
      setIndent(parsed);
      parseAndFormat(input, parsed);
    },
    [input, parseAndFormat]
  );

  const handleMinify = useCallback(() => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setInput(minified);
      setOutput(minified);
      setHighlightedHtml(syntaxHighlight(minified));
      setError("");
      setStats({ lines: 1, size: new Blob([minified]).size, keys: typeof parsed === "object" ? countKeys(parsed) : 0 });
    } catch (e) {
      setError(e.message);
    }
  }, [input]);

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
    setHighlightedHtml("");
    setError("");
    setStats(null);
  }, []);

  const handleFileUpload = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target.result;
        setInput(text);
        parseAndFormat(text, indent);
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [indent, parseAndFormat]
  );

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <SchemaMarkup
        title={t("metaTitle")}
        description={t("metaDescription")}
        slug="json-formatter"
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
          toolPath="json-formatter"
        />

        <div className="mt-6 space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("metaTitle")}</h1>
            <p className="mt-1 text-sm text-slate-300">{t("metaDescription")}</p>
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => parseAndFormat(input, indent)}
              className="flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-50"
              disabled={!input.trim()}
            >
              <AlignLeft size={16} />
              Format
            </button>
            <button
              type="button"
              onClick={handleMinify}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700 disabled:opacity-50"
              disabled={!input.trim()}
            >
              <Minimize2 size={16} />
              Minify
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700 disabled:opacity-50"
              disabled={!output}
            >
              {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-400 transition hover:bg-slate-700"
            >
              <Trash2 size={16} />
              Clear
            </button>

            {/* Indent selector */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-slate-400">Indent:</span>
              <select
                value={String(indent)}
                onChange={(e) => handleIndentChange(e.target.value)}
                className="rounded-md border border-white/10 bg-slate-800 px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                {INDENT_OPTIONS.map((opt) => (
                  <option key={String(opt.value)} value={String(opt.value)}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Upload .json */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-400 transition hover:bg-slate-700"
            >
              <Upload size={14} />
              Upload .json
            </button>
            <input ref={fileInputRef} type="file" accept=".json,application/json" className="sr-only" onChange={handleFileUpload} />
          </div>

          {/* Panels */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Input</label>
              <textarea
                value={input}
                onChange={handleInputChange}
                placeholder={t("dropzone")}
                spellCheck={false}
                className="h-[420px] w-full resize-none rounded-xl border border-white/10 bg-slate-900 p-4 font-mono text-sm text-slate-200 placeholder-slate-600 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
                style={{ fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace" }}
              />
              {error && (
                <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-400">
                  {error}
                </p>
              )}
            </div>

            {/* Output */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Output</label>
              {highlightedHtml ? (
                <pre
                  className="h-[420px] w-full overflow-auto rounded-xl border border-white/10 bg-slate-900 p-4 font-mono text-sm leading-relaxed"
                  style={{ fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace" }}
                  dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                />
              ) : (
                <div className="flex h-[420px] w-full items-center justify-center rounded-xl border border-dashed border-white/10 bg-slate-900 text-sm text-slate-600">
                  Formatted output appears here
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="flex flex-wrap gap-4 rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-xs text-slate-400">
              <span>Lines: <strong className="text-slate-200">{stats.lines}</strong></span>
              <span>Size: <strong className="text-slate-200">{formatBytes(stats.size)}</strong></span>
              {stats.keys > 0 && <span>Keys: <strong className="text-slate-200">{stats.keys}</strong></span>}
            </div>
          )}
        </div>
      </main>

      <EditorialSection namespace="tools.jsonFormatter" />

      <div className="mx-auto max-w-6xl px-4 pb-4 sm:px-6 lg:px-8">
        <RelatedTools locale={locale} currentSlug="json-formatter" />
        <div className="mt-10">
          <FaqSection namespace="tools.jsonFormatter" />
        </div>
      </div>
    </div>
  );
}
