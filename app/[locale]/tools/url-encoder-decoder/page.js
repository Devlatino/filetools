"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Copy, Check, Trash2, ArrowDownUp, Download } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

function encode(text) {
  try {
    return { result: encodeURIComponent(text), error: null };
  } catch (e) {
    return { result: null, error: "Encoding error" };
  }
}

function decode(text) {
  try {
    return { result: decodeURIComponent(text), error: null };
  } catch (e) {
    return { result: null, error: "Invalid encoded string — check for malformed %XX sequences" };
  }
}

function parseUrl(urlStr) {
  try {
    const u = new URL(urlStr);
    const params = {};
    u.searchParams.forEach((v, k) => {
      params[k] = v;
    });
    return {
      valid: true,
      protocol: u.protocol,
      host: u.host,
      hostname: u.hostname,
      port: u.port,
      pathname: u.pathname,
      search: u.search,
      params,
      hash: u.hash,
      origin: u.origin,
    };
  } catch (e) {
    return { valid: false, error: "Invalid URL" };
  }
}

export default function UrlEncoderDecoderPage() {
  const locale = useLocale();
  const t = useTranslations("tools.urlEncoderDecoder");
  const tCommon = useTranslations("common");

  const [mode, setMode] = useState("encode");
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const output = (() => {
    if (!input.trim()) return { text: "", error: null, parsed: null };
    if (mode === "encode") {
      const { result, error } = encode(input);
      return { text: result || "", error, parsed: null };
    }
    if (mode === "decode") {
      const { result, error } = decode(input);
      return { text: result || "", error, parsed: null };
    }
    const parsed = parseUrl(input);
    if (!parsed.valid) return { text: "", error: parsed.error, parsed: null };
    return { text: "", error: null, parsed };
  })();

  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
  }, []);

  const handleCopy = useCallback(() => {
    const toCopy = output.parsed ? output.parsed.origin + output.parsed.pathname + output.parsed.search + output.parsed.hash : output.text;
    if (!toCopy) return;
    navigator.clipboard.writeText(toCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [output]);

  const handleSwap = useCallback(() => {
    if (mode === "encode" || mode === "decode") {
      setInput(output.text);
    }
  }, [mode, output.text]);

  const handleClear = useCallback(() => {
    setInput("");
  }, []);

  const handleDownload = useCallback(() => {
    const content = output.parsed
      ? JSON.stringify(output.parsed, null, 2)
      : output.text;
    if (!content) return;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "url-encoder-decoder-output.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  const placeholder =
    mode === "encode"
      ? t("inputPlaceholder")
      : mode === "decode"
        ? t("encodedPlaceholder")
        : t("urlPlaceholder");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href={`/${locale === "en" ? "" : locale}/`} prefetch className="flex items-center gap-2">
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
          toolPath="url-encoder-decoder"
        />

        <div className="mt-6">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("title")}</h1>
          <p className="mt-1 text-sm text-slate-300">{t("description")}</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {["encode", "decode", "parse"].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                mode === m ? "bg-sky-500 text-slate-950" : "border border-white/10 bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {t(m)}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!output.text && !output.parsed}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700 disabled:opacity-40"
          >
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            {copied ? t("copied") : t("copy")}
          </button>
          {(mode === "encode" || mode === "decode") && (
            <button
              type="button"
              onClick={handleSwap}
              disabled={!output.text}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-400 transition hover:bg-slate-700 disabled:opacity-40"
            >
              <ArrowDownUp size={16} />
              {t("swap")}
            </button>
          )}
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-400 transition hover:bg-slate-700"
          >
            <Trash2 size={16} />
            {t("clear")}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!output.text && !output.parsed}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-400 transition hover:bg-slate-700 disabled:opacity-40"
          >
            <Download size={16} />
            {t("download")}
          </button>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              {mode === "parse" ? "URL" : "Input"}
            </label>
            <textarea
              value={input}
              onChange={handleInputChange}
              placeholder={placeholder}
              spellCheck={false}
              className="min-h-[200px] w-full resize-none rounded-xl border border-white/10 bg-slate-900 p-4 font-mono text-sm text-slate-200 placeholder-slate-600 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
            />
            <p className="text-xs text-slate-500">
              {input.length} {t("characters")}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Output</label>
            {mode === "parse" && output.parsed ? (
              <div className="min-h-[200px] rounded-xl border border-white/10 bg-slate-900/50 p-4">
                <table className="w-full text-sm text-slate-200">
                  <tbody>
                    <tr><td className="py-1 font-medium text-slate-400 w-28">{t("protocol")}</td><td>{output.parsed.protocol}</td></tr>
                    <tr><td className="py-1 font-medium text-slate-400">{t("host")}</td><td>{output.parsed.host}</td></tr>
                    <tr><td className="py-1 font-medium text-slate-400">{t("port")}</td><td>{output.parsed.port || "—"}</td></tr>
                    <tr><td className="py-1 font-medium text-slate-400">{t("pathname")}</td><td className="break-all">{output.parsed.pathname}</td></tr>
                    <tr><td className="py-1 font-medium text-slate-400">{t("origin")}</td><td className="break-all">{output.parsed.origin}</td></tr>
                    <tr><td className="py-1 font-medium text-slate-400">{t("hash")}</td><td>{output.parsed.hash || "—"}</td></tr>
                  </tbody>
                </table>
                <p className="mt-3 text-xs font-medium text-slate-400">{t("queryParams")}</p>
                {Object.keys(output.parsed.params).length === 0 ? (
                  <p className="mt-1 text-sm text-slate-500">{t("noParams")}</p>
                ) : (
                  <table className="mt-1 w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-400">
                        <th className="py-1 pr-2">{t("key")}</th>
                        <th>{t("value")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(output.parsed.params).map(([k, v]) => (
                        <tr key={k} className="text-slate-200">
                          <td className="break-all py-1 pr-2 font-mono">{k}</td>
                          <td className="break-all font-mono">{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ) : (
              <textarea
                value={output.text}
                readOnly
                placeholder={mode === "encode" ? t("encodedPlaceholder") : t("decodedPlaceholder")}
                spellCheck={false}
                className="min-h-[200px] w-full resize-none rounded-xl border border-white/10 bg-slate-900/50 p-4 font-mono text-sm text-slate-200 placeholder-slate-600 focus:outline-none"
              />
            )}
            {output.text && <p className="text-xs text-slate-500">{output.text.length} {t("characters")}</p>}
          </div>
        </div>

        {output.error && (
          <p className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
            {mode === "parse" ? t("invalidUrl") : t("invalidEncoding")}
          </p>
        )}

        <div className="mt-8 rounded-xl border border-white/10 bg-slate-900/40 p-4">
          <h2 className="mb-2 text-sm font-semibold text-slate-50">{t("howToUse")}</h2>
          <ul className="list-inside list-disc space-y-1 text-sm text-slate-300">
            <li>{t("step1")}</li>
            <li>{t("step2")}</li>
            <li>{t("step3")}</li>
          </ul>
        </div>
      </main>

      <div className="mx-auto max-w-6xl px-4 pb-4 sm:px-6 lg:px-8">
        <RelatedTools locale={locale} currentSlug="url-encoder-decoder" />
        <div className="mt-10">
          <FaqSection namespace="tools.urlEncoderDecoder" />
        </div>
      </div>
    </div>
  );
}
