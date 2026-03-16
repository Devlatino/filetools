"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Download, Copy, Check } from "lucide-react";
import QRCode from "qrcode";
import { FaqSection } from "@/components/FaqSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const CONTENT_TYPES = ["url", "text", "email", "phone", "sms", "wifi"];
const PREVIEW_SIZE = 256;
const SIZE_MIN = 128;
const SIZE_MAX = 512;
const SIZE_DEFAULT = 256;
const MARGIN_DEFAULT = 2;
const EC_LEVELS = [
  { key: "L", pct: "7%" },
  { key: "M", pct: "15%" },
  { key: "Q", pct: "25%" },
  { key: "H", pct: "30%" },
];
const WIFI_TYPES = ["WPA", "WEP", "nopass"];

function normalizePhone(v) {
  return (v || "").replace(/\D/g, "").trim();
}

export default function QrCodeGeneratorPage() {
  const locale = useLocale();
  const t = useTranslations("tools.qrCodeGenerator");
  const tCommon = useTranslations("common");
  const canvasRef = useRef(null);

  const [type, setType] = useState("url");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [phone, setPhone] = useState("");
  const [smsBody, setSmsBody] = useState("");
  const [ssid, setSsid] = useState("");
  const [wifiPass, setWifiPass] = useState("");
  const [wifiType, setWifiType] = useState("WPA");

  const [size, setSize] = useState(SIZE_DEFAULT);
  const [ecLevel, setEcLevel] = useState("M");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [margin, setMargin] = useState(MARGIN_DEFAULT);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const buildContent = useCallback(() => {
    switch (type) {
      case "url":
        return (url || "").trim();
      case "text":
        return (text || "").trim();
      case "email":
        if (!(email || "").trim()) return "";
        const s = encodeURIComponent((subject || "").trim());
        const b = encodeURIComponent((body || "").trim());
        return `mailto:${(email || "").trim()}${s || b ? `?${s ? `subject=${s}` : ""}${b ? (s ? "&" : "") + `body=${b}` : ""}` : ""}`;
      case "phone": {
        const p = normalizePhone(phone);
        return p ? `tel:${p}` : "";
      }
      case "sms": {
        const p = normalizePhone(phone);
        if (!p) return "";
        const sms = (smsBody || "").trim();
        return sms ? `sms:${p}?body=${encodeURIComponent(sms)}` : `sms:${p}`;
      }
      case "wifi": {
        const sid = (ssid || "").trim();
        if (!sid) return "";
        const enc = wifiType === "nopass" ? "nopass" : wifiType;
        return `WIFI:T:${enc};S:${encodeURIComponent(sid)};P:${encodeURIComponent((wifiPass || "").trim())};;`;
      }
      default:
        return "";
    }
  }, [type, url, text, email, subject, body, phone, smsBody, ssid, wifiPass, wifiType]);

  const content = buildContent();
  const hasContent = content.length > 0;

  useEffect(() => {
    if (!canvasRef.current) return;
    const value = hasContent ? content : " ";
    QRCode.toCanvas(canvasRef.current, value, {
      width: PREVIEW_SIZE,
      margin: Number(margin) || 0,
      color: { dark: fgColor, light: bgColor },
      errorCorrectionLevel: ecLevel,
    }).catch((err) => console.error(err));
  }, [content, hasContent, fgColor, bgColor, ecLevel, margin]);

  const downloadPng = useCallback(async () => {
    if (!hasContent) return;
    const canvas = document.createElement("canvas");
    await QRCode.toCanvas(canvas, content, {
      width: size,
      margin: Number(margin) || 0,
      color: { dark: fgColor, light: bgColor },
      errorCorrectionLevel: ecLevel,
    });
    const link = document.createElement("a");
    link.download = "fileflip-qrcode.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [content, hasContent, size, margin, fgColor, bgColor, ecLevel]);

  const downloadSvg = useCallback(async () => {
    if (!hasContent) return;
    const svgString = await QRCode.toString(content, {
      type: "svg",
      width: size,
      margin: Number(margin) || 0,
      color: { dark: fgColor, light: bgColor },
      errorCorrectionLevel: ecLevel,
    });
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const urlObj = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "fileflip-qrcode.svg";
    link.href = urlObj;
    link.click();
    URL.revokeObjectURL(urlObj);
  }, [content, hasContent, size, margin, fgColor, bgColor, ecLevel]);

  const copyImage = useCallback(async () => {
    if (!hasContent) return;
    const canvas = document.createElement("canvas");
    await QRCode.toCanvas(canvas, content, {
      width: size,
      margin: Number(margin) || 0,
      color: { dark: fgColor, light: bgColor },
      errorCorrectionLevel: ecLevel,
    });
    canvas.toBlob(
      async (blob) => {
        try {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (e) {
          console.error("Copy failed", e);
        }
      },
      "image/png"
    );
  }, [content, hasContent, size, margin, fgColor, bgColor, ecLevel]);

  const basePath = locale === "en" ? "" : `/${locale}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href={basePath ? `/${basePath}/` : "/"} prefetch className="flex items-center gap-2">
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
          toolPath="qr-code-generator"
        />

        <div className="mt-6">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("title")}</h1>
          <p className="mt-1 text-sm text-slate-300">{t("description")}</p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[55%_1fr]">
          <section className="space-y-4">
            <div>
              <span className="mb-2 block text-sm font-medium text-slate-300">{t("contentType")}</span>
              <div className="flex flex-wrap gap-1">
                {CONTENT_TYPES.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setType(key)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                      type === key
                        ? "border-sky-500 bg-sky-500/20 text-sky-200"
                        : "border-white/10 bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {t(`type${key.charAt(0).toUpperCase() + key.slice(1)}`)}
                  </button>
                ))}
              </div>
            </div>

            {type === "url" && (
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-300">URL</span>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={t("urlPlaceholder")}
                  className="w-full rounded-xl border border-white/10 bg-slate-800/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500"
                />
              </label>
            )}
            {type === "text" && (
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-300">{t("typeText")}</span>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={t("textPlaceholder")}
                  rows={4}
                  className="w-full rounded-xl border border-white/10 bg-slate-800/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500"
                />
              </label>
            )}
            {type === "email" && (
              <div className="space-y-3">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-300">Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("emailPlaceholder")}
                    className="w-full rounded-xl border border-white/10 bg-slate-800/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-300">{t("emailSubject")}</span>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-800/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-300">{t("emailBody")}</span>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-white/10 bg-slate-800/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500"
                  />
                </label>
              </div>
            )}
            {type === "phone" && (
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-300">{t("typePhone")}</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("phonePlaceholder")}
                  className="w-full rounded-xl border border-white/10 bg-slate-800/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500"
                />
              </label>
            )}
            {type === "sms" && (
              <div className="space-y-3">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-300">{t("typePhone")}</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t("phonePlaceholder")}
                    className="w-full rounded-xl border border-white/10 bg-slate-800/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-300">{t("smsMessage")}</span>
                  <textarea
                    value={smsBody}
                    onChange={(e) => setSmsBody(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-white/10 bg-slate-800/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500"
                  />
                </label>
              </div>
            )}
            {type === "wifi" && (
              <div className="space-y-3">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-300">{t("wifiSsid")}</span>
                  <input
                    type="text"
                    value={ssid}
                    onChange={(e) => setSsid(e.target.value)}
                    placeholder="MyNetwork"
                    className="w-full rounded-xl border border-white/10 bg-slate-800/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-300">{t("wifiPassword")}</span>
                  <input
                    type="text"
                    value={wifiPass}
                    onChange={(e) => setWifiPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/10 bg-slate-800/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-300">{t("wifiSecurity")}</span>
                  <select
                    value={wifiType}
                    onChange={(e) => setWifiType(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-slate-100"
                  >
                    <option value="WPA">WPA</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">{t("wifiNone")}</option>
                  </select>
                </label>
              </div>
            )}

            {!hasContent && (
              <p className="text-sm text-amber-400/90">{t("emptyContent")}</p>
            )}

            <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
              <button
                type="button"
                onClick={() => setCustomizeOpen((o) => !o)}
                className="flex w-full items-center justify-between text-sm font-medium text-slate-300"
              >
                {t("customize")}
                <span className="text-slate-500">{customizeOpen ? "▼" : "▶"}</span>
              </button>
              {customizeOpen && (
                <div className="mt-4 space-y-4">
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-400">{t("size")}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={SIZE_MIN}
                        max={SIZE_MAX}
                        value={size}
                        onChange={(e) => setSize(Number(e.target.value))}
                        className="flex-1 accent-sky-500"
                      />
                      <span className="w-14 text-right text-sm text-slate-400">{size} px</span>
                    </div>
                  </label>
                  <div>
                    <span className="mb-1 block text-xs font-medium text-slate-400">{t("errorLevel")}</span>
                    <div className="flex gap-2">
                      {EC_LEVELS.map(({ key, pct }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setEcLevel(key)}
                          className={`rounded border px-2 py-1 text-xs font-medium ${
                            ecLevel === key
                              ? "border-sky-500 bg-sky-500/20 text-sky-200"
                              : "border-white/10 bg-slate-800 text-slate-400"
                          }`}
                        >
                          {key} ({pct})
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-400">{t("fgColor")}</span>
                      <input
                        type="color"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="h-8 w-12 cursor-pointer rounded border border-white/10 bg-slate-800"
                      />
                    </label>
                    <label className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-400">{t("bgColor")}</span>
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="h-8 w-12 cursor-pointer rounded border border-white/10 bg-slate-800"
                      />
                    </label>
                  </div>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-400">{t("margin")}</span>
                    <input
                      type="range"
                      min={0}
                      max={4}
                      value={margin}
                      onChange={(e) => setMargin(Number(e.target.value))}
                      className="w-full accent-sky-500"
                    />
                  </label>
                </div>
              )}
            </div>
          </section>

          <section className="flex flex-col items-center justify-start rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            <span className="mb-3 block text-sm font-medium text-slate-300">{t("preview")}</span>
            <div className="flex flex-col items-center">
              <canvas
                ref={canvasRef}
                width={PREVIEW_SIZE}
                height={PREVIEW_SIZE}
                className="rounded-lg border border-white/10 bg-white"
                style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE, maxWidth: "100%" }}
                aria-hidden
              />
              <p className="mt-2 text-xs text-slate-500">{size} × {size} px</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={downloadPng}
                  disabled={!hasContent}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                >
                  <Download size={18} strokeWidth={2} />
                  {t("downloadPng")}
                </button>
                <button
                  type="button"
                  onClick={downloadSvg}
                  disabled={!hasContent}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-700 disabled:opacity-50"
                >
                  {t("downloadSvg")}
                </button>
                <button
                  type="button"
                  onClick={copyImage}
                  disabled={!hasContent}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-700 disabled:opacity-50"
                >
                  {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                  {copied ? t("copied") : t("copyImage")}
                </button>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-10 rounded-2xl border border-white/10 bg-slate-900/40 p-4 sm:p-6">
          <h2 className="mb-3 text-lg font-semibold text-slate-50">{t("howToUse")}</h2>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-300">
            <li>{t("step1")}</li>
            <li>{t("step2")}</li>
            <li>{t("step3")}</li>
          </ol>
        </section>

        <div className="mt-10">
          <RelatedTools locale={locale} currentSlug="qr-code-generator" />
        </div>

        <div className="mt-10">
          <FaqSection namespace="tools.qrCodeGenerator" />
        </div>
      </main>
    </div>
  );
}
