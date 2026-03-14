"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Copy, Check, Trash2, Upload } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { md5, md5Binary } from "@/lib/md5";

const ALGOS = [
  { id: "md5", name: "MD5", cryptoName: null },
  { id: "sha1", name: "SHA-1", cryptoName: "SHA-1" },
  { id: "sha256", name: "SHA-256", cryptoName: "SHA-256" },
  { id: "sha384", name: "SHA-384", cryptoName: "SHA-384" },
  { id: "sha512", name: "SHA-512", cryptoName: "SHA-512" },
];

async function hashBuffer(buffer, algorithm) {
  const hashBuffer = await crypto.subtle.digest(algorithm, buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return typeof btoa !== "undefined" ? btoa(binary) : Buffer.from(bytes).toString("base64");
}

async function shaBufferToBase64(buffer, algorithm) {
  const hashBuffer = await crypto.subtle.digest(algorithm, buffer);
  return bufferToBase64(hashBuffer);
}

export default function HashGeneratorPage() {
  const locale = useLocale();
  const t = useTranslations("tools.hashGenerator");
  const tCommon = useTranslations("common");

  const [tab, setTab] = useState("text");
  const [input, setInput] = useState("");
  const [hmacMode, setHmacMode] = useState(false);
  const [hmacKey, setHmacKey] = useState("");
  const [format, setFormat] = useState("lowercase");
  const [hashes, setHashes] = useState({});
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [fileHashes, setFileHashes] = useState({});
  const [fileLoading, setFileLoading] = useState(false);
  const [compareValue, setCompareValue] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const fileInputRef = useRef(null);
  const debounceRef = useRef(null);

  const formatHash = (raw) => {
    if (format === "uppercase") return raw.toUpperCase();
    if (format === "base64") return null;
    return raw.toLowerCase();
  };

  const computeHashes = useCallback(
    async (inputData, isFile = false) => {
      let buffer;
      let textForMd5;
      if (isFile && inputData instanceof ArrayBuffer) {
        buffer = inputData;
        const bytes = new Uint8Array(buffer);
        textForMd5 = String.fromCharCode.apply(null, bytes);
      } else {
        const str = typeof inputData === "string" ? inputData : "";
        textForMd5 = str;
        const encoder = new TextEncoder();
        buffer = encoder.encode(str).buffer;
      }

      const out = {};
      try {
        out.md5 = isFile ? md5Binary(textForMd5) : md5(textForMd5 || "");
      } catch (e) {
        out.md5 = "";
      }

      if (typeof crypto !== "undefined" && crypto.subtle) {
        try {
          if (hmacMode && hmacKey.trim()) {
            const key = await crypto.subtle.importKey(
              "raw",
              new TextEncoder().encode(hmacKey),
              { name: "HMAC", hash: "SHA-256" },
              false,
              ["sign"]
            );
            const sig = await crypto.subtle.sign("HMAC", key, buffer);
            const sigArray = Array.from(new Uint8Array(sig));
            out.sha256 = sigArray.map((b) => b.toString(16).padStart(2, "0")).join("");
            out.sha1 = "";
            out.sha384 = "";
            out.sha512 = "";
          } else {
            const [sha1, sha256, sha384, sha512] = await Promise.all([
              hashBuffer(buffer, "SHA-1"),
              hashBuffer(buffer, "SHA-256"),
              hashBuffer(buffer, "SHA-384"),
              hashBuffer(buffer, "SHA-512"),
            ]);
            out.sha1 = sha1;
            out.sha256 = sha256;
            out.sha384 = sha384;
            out.sha512 = sha512;
          }
        } catch (e) {
          out.sha1 = out.sha256 = out.sha384 = out.sha512 = "";
        }
      } else {
        out.sha1 = out.sha256 = out.sha384 = out.sha512 = "";
      }
      if (isFile) setFileHashes(out);
      else setHashes(out);
    },
    [hmacMode, hmacKey]
  );

  useEffect(() => {
    if (tab !== "text") return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!input.trim()) {
      setHashes({});
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => {
      computeHashes(input).finally(() => setLoading(false));
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [input, tab, computeHashes]);

  const onFileSelect = useCallback(
    (fileList) => {
      const f = fileList?.[0];
      if (!f) return;
      setFile(f);
      setFileLoading(true);
      const reader = new FileReader();
      reader.onload = () => {
        computeHashes(reader.result, true).finally(() => setFileLoading(false));
      };
      reader.readAsArrayBuffer(f);
    },
    [computeHashes]
  );

  const handleCopy = (value, id) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  };

  const displayHash = (raw) => {
    if (format === "base64" && raw) {
      try {
        const bytes = new Uint8Array(raw.match(/.{1,2}/g).map((b) => parseInt(b, 16)));
        return bufferToBase64(bytes.buffer);
      } catch {
        return raw;
      }
    }
    return formatHash(raw) || raw;
  };

  const currentHashes = tab === "file" ? fileHashes : hashes;
  const compareNorm = compareValue.trim().toLowerCase().replace(/\s/g, "");

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
          toolPath="hash-generator"
        />

        <div className="mt-6">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("title")}</h1>
          <p className="mt-1 text-sm text-slate-300">{t("description")}</p>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={() => setTab("text")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === "text" ? "bg-sky-500 text-slate-950" : "border border-white/10 bg-slate-800 text-slate-400"}`}
          >
            {t("textTab")}
          </button>
          <button
            type="button"
            onClick={() => setTab("file")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === "file" ? "bg-sky-500 text-slate-950" : "border border-white/10 bg-slate-800 text-slate-400"}`}
          >
            {t("fileTab")}
          </button>
        </div>

        {tab === "text" && (
          <>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("inputPlaceholder")}
              className="mt-4 min-h-[120px] w-full resize-none rounded-xl border border-white/10 bg-slate-900 p-4 font-mono text-sm text-slate-200 placeholder-slate-600 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
            />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setInput("")}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-800 px-4 py-2 text-sm text-slate-400 hover:bg-slate-700"
              >
                <Trash2 size={16} />
                {t("clear")}
              </button>
              <span className="text-xs text-slate-500">{t("outputFormat")}</span>
              {["lowercase", "uppercase", "base64"].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${format === f ? "bg-sky-500 text-slate-950" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
                >
                  {t(f)}
                </button>
              ))}
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-400">
                <input
                  type="checkbox"
                  checked={hmacMode}
                  onChange={(e) => setHmacMode(e.target.checked)}
                  className="rounded border-slate-600 bg-slate-800 accent-sky-500"
                />
                {t("hmacMode")}
              </label>
              {hmacMode && (
                <input
                  type="text"
                  value={hmacKey}
                  onChange={(e) => setHmacKey(e.target.value)}
                  placeholder={t("hmacKeyPlaceholder")}
                  className="rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-500"
                />
              )}
            </div>
          </>
        )}

        {tab === "file" && (
          <div className="mt-4">
            <input
              ref={fileInputRef}
              type="file"
              className="sr-only"
              onChange={(e) => onFileSelect(e.target.files)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-slate-900/60 py-12 text-slate-400 transition hover:border-sky-500/50 hover:bg-slate-900/80"
            >
              <Upload size={32} className="mb-2" />
              <span>{t("dragDrop")}</span>
            </button>
            {file && (
              <p className="mt-2 text-sm text-slate-400">
                {t("fileName")}: {file.name} · {t("fileSize")}: {(file.size / 1024).toFixed(1)} KB
              </p>
            )}
            <p className="mt-1 text-xs text-slate-500">{t("fileProcessed")}</p>
          </div>
        )}

        <div className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-slate-900/60">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-slate-400">
                <th className="p-3 font-medium">{t("algorithm")}</th>
                <th className="p-3 font-medium">{t("hashValue")}</th>
                <th className="w-12 p-3"></th>
                {(compareNorm && tab === "text") || (compareNorm && tab === "file") ? (
                  <th className="p-3 font-medium">{t("compareHash")}</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {ALGOS.map((algo) => {
                const raw = currentHashes[algo.id];
                const display = raw ? displayHash(raw) : tab === "file" && fileLoading ? t("computing") : loading && tab === "text" ? t("computing") : "—";
                const norm = (raw || "").toLowerCase().replace(/\s/g, "");
                const match = compareNorm && norm && norm === compareNorm;
                const noMatch = compareNorm && norm && norm !== compareNorm;
                return (
                  <tr key={algo.id} className="border-b border-white/5">
                    <td className="p-3 font-medium text-slate-200">{algo.name}</td>
                    <td className="max-w-md truncate p-3 font-mono text-slate-300" title={display}>
                      {display}
                    </td>
                    <td className="p-3">
                      {raw && (
                        <button
                          type="button"
                          onClick={() => handleCopy(display, algo.id)}
                          className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                        >
                          {copiedId === algo.id ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                        </button>
                      )}
                    </td>
                    {compareNorm && (
                      <td className="p-3">
                        {match && <span className="text-emerald-400">{t("match")}</span>}
                        {noMatch && <span className="text-rose-400">{t("noMatch")}</span>}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <label className="block text-xs font-medium text-slate-400">{t("compareHash")}</label>
          <input
            type="text"
            value={compareValue}
            onChange={(e) => setCompareValue(e.target.value)}
            placeholder={t("comparePlaceholder")}
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 font-mono text-sm text-slate-200 placeholder-slate-500"
          />
        </div>

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
        <RelatedTools locale={locale} currentSlug="hash-generator" />
        <div className="mt-10">
          <FaqSection namespace="tools.hashGenerator" />
        </div>
      </div>
    </div>
  );
}
