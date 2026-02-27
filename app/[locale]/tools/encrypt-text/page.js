"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import CryptoJS from "crypto-js";
import { getToolFaq } from "@/lib/toolFaqs";
import { FaqSection } from "@/components/FaqSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";

export default function EncryptTextPage() {
  const locale = useLocale();
  const t = useTranslations("tools.encryptText");
  const tCommon = useTranslations("common");
  const [plainText, setPlainText] = useState("");
  const [password, setPassword] = useState("");
  const [encrypted, setEncrypted] = useState("");
  const [decryptInput, setDecryptInput] = useState("");
  const [decryptPassword, setDecryptPassword] = useState("");
  const [decrypted, setDecrypted] = useState("");
  const [error, setError] = useState("");

  const handleEncrypt = useCallback(() => {
    setError("");
    if (!plainText.trim() || !password) {
      setError("Enter text and password.");
      return;
    }
    try {
      const out = CryptoJS.AES.encrypt(plainText, password).toString();
      setEncrypted(out);
    } catch (err) {
      setError("Encryption failed.");
    }
  }, [plainText, password]);

  const handleDecrypt = useCallback(() => {
    setError("");
    setDecrypted("");
    if (!decryptInput.trim() || !decryptPassword) {
      setError("Enter encrypted text and password.");
      return;
    }
    try {
      const bytes = CryptoJS.AES.decrypt(decryptInput, decryptPassword);
      const str = bytes.toString(CryptoJS.enc.Utf8);
      if (!str) setError("Wrong password or invalid data.");
      else setDecrypted(str);
    } catch (err) {
      setError("Decryption failed.");
    }
  }, [decryptInput, decryptPassword]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href={`/${locale}/`} prefetch className="flex items-center gap-2">
            <img src="/fileflip-logo.svg" alt={tCommon("siteName")} className="h-9 w-auto" width={140} height={36} />
            <span className="text-sm text-slate-400">{t("label")}</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto flex max-w-4xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumb locale={locale} homeLabel={tCommon("breadcrumbHome")} toolsLabel={tCommon("nav.tools")} toolLabel={t("label")} toolPath="encrypt-text" />
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("metaTitle")}</h1>
          <p className="max-w-xl text-sm text-slate-300">{t("metaDescription")}</p>
          <p className="text-xs text-slate-400">Password is never sent to any server. Everything runs in your browser (AES-256).</p>
        </section>
        <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-100">Encrypt</h2>
          <textarea value={plainText} onChange={(e) => setPlainText(e.target.value)} placeholder="Text to encrypt…" className="min-h-[100px] w-full rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-200 placeholder:text-slate-500" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 p-2 text-sm text-slate-200 placeholder:text-slate-500" />
          <button type="button" onClick={handleEncrypt} className="mt-2 rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400">Encrypt</button>
          {encrypted && (
            <div className="mt-3">
              <p className="text-xs text-slate-400">Encrypted (copy and share):</p>
              <textarea readOnly value={encrypted} className="mt-1 min-h-[80px] w-full rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-xs text-slate-300" />
              <button type="button" onClick={() => navigator.clipboard.writeText(encrypted)} className="mt-1 rounded-full border border-sky-400/50 px-3 py-1 text-xs text-sky-200 hover:bg-slate-800">Copy</button>
            </div>
          )}
        </section>
        <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-100">Decrypt</h2>
          <textarea value={decryptInput} onChange={(e) => setDecryptInput(e.target.value)} placeholder="Paste encrypted text…" className="min-h-[80px] w-full rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-200 placeholder:text-slate-500" />
          <input type="password" value={decryptPassword} onChange={(e) => setDecryptPassword(e.target.value)} placeholder="Password" className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 p-2 text-sm text-slate-200 placeholder:text-slate-500" />
          <button type="button" onClick={handleDecrypt} className="mt-2 rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400">Decrypt</button>
          {decrypted && <pre className="mt-3 whitespace-pre-wrap rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-200">{decrypted}</pre>}
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        </section>
        <RelatedTools locale={locale} currentSlug="encrypt-text" />
        <FaqSection faqs={getToolFaq("encrypt-text")} />
      </main>
    </div>
  );
}
