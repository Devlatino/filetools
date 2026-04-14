"use client";

import React, { useState, useRef } from "react";
import Head from "next/head";
import { useTranslations } from "next-intl";
import { Lock, Unlock, Download, UploadCloud, RefreshCw, Key } from "lucide-react";
import ToolLayout from "@/components/ToolLayout";

export default function EncryptFileTool() {
  const t = useTranslations();
  const tTool = useTranslations("tools.encryptFile");

  const [mode, setMode] = useState("encrypt"); // "encrypt" or "decrypt"
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState(null);
  const [resultName, setResultName] = useState("");
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResultUrl(null);
      setError(null);
    }
  };

  const deriveKey = async (passwordKey, salt, keyUsage) => {
    return await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      passwordKey,
      { name: "AES-GCM", length: 256 },
      false,
      keyUsage
    );
  };

  const getPasswordKey = async (password) => {
    const enc = new TextEncoder();
    return await crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );
  };

  const handleEncrypt = async () => {
    if (!file || !password) return;
    setProcessing(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));

      const passwordKey = await getPasswordKey(password);
      const aesKey = await deriveKey(passwordKey, salt, ["encrypt"]);

      const encryptedContent = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        aesKey,
        buffer
      );

      // Construct final file: [salt(16)] + [iv(12)] + [encryptedContent]
      const finalBuffer = new Uint8Array(16 + 12 + encryptedContent.byteLength);
      finalBuffer.set(salt, 0);
      finalBuffer.set(iv, 16);
      finalBuffer.set(new Uint8Array(encryptedContent), 16 + 12);

      const blob = new Blob([finalBuffer], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultName(file.name + ".enc");
    } catch (err) {
      console.error(err);
      setError(tTool("errorEncryptFailed"));
    } finally {
      setProcessing(false);
    }
  };

  const handleDecrypt = async () => {
    if (!file || !password) return;
    setProcessing(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      if (arrayBuffer.byteLength < 28) {
        throw new Error("File too small");
      }

      const salt = new Uint8Array(arrayBuffer, 0, 16);
      const iv = new Uint8Array(arrayBuffer, 16, 12);
      const encryptedData = new Uint8Array(arrayBuffer, 28);

      const passwordKey = await getPasswordKey(password);
      const aesKey = await deriveKey(passwordKey, salt, ["decrypt"]);

      const decryptedContent = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv },
        aesKey,
        encryptedData
      );

      const blob = new Blob([decryptedContent], { type: "application/octet-stream" });
      // Restore original extension if possible
      let outName = file.name;
      if (outName.endsWith(".enc")) {
        outName = outName.slice(0, -4);
      } else {
        outName = "decrypted-" + outName;
      }

      setResultUrl(URL.createObjectURL(blob));
      setResultName(outName);
    } catch (err) {
      console.error(err);
      setError(tTool("errorDecryptFailed"));
    } finally {
      setProcessing(false);
    }
  };

  const processFile = () => {
    if (mode === "encrypt") {
      handleEncrypt();
    } else {
      handleDecrypt();
    }
  };

  const reset = () => {
    setFile(null);
    setPassword("");
    setResultUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // -----------------------------------------------------
  // RENDER
  // -----------------------------------------------------
  return (
    <ToolLayout
      title={tTool("label")}
      description={tTool("short")}
      editorialTitle={tTool("editorialTitle")}
      editorialBody={tTool("editorialBody")}
      faqs={[
        { q: tTool("faq1Q"), a: tTool("faq1A") },
        { q: tTool("faq2Q"), a: tTool("faq2A") },
        { q: tTool("faq3Q"), a: tTool("faq3A") }
      ]}
    >
      <Head>
        <title>{tTool("metaTitle")}</title>
        <meta name="description" content={tTool("metaDescription")} />
      </Head>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 max-w-2xl mx-auto mb-12">
        <h2 className="text-xl font-semibold text-slate-800 mb-6 text-center">
          {tTool("toolHeader")}
        </h2>

        {/* Mode Selector */}
        {!resultUrl && (
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6 max-w-sm mx-auto">
            <button
              onClick={() => { setMode("encrypt"); setError(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                mode === "encrypt" ? "bg-white text-blue-600 shadow" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Lock className="w-4 h-4" />
              {tTool("modeEncrypt")}
            </button>
            <button
              onClick={() => { setMode("decrypt"); setError(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                mode === "decrypt" ? "bg-white text-emerald-600 shadow" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Unlock className="w-4 h-4" />
              {tTool("modeDecrypt")}
            </button>
          </div>
        )}

        {!resultUrl && (
          <div className="space-y-6">
            {/* File Upload Phase */}
            {!file ? (
              <div
                className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 hover:border-blue-300 transition-colors cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud className="w-12 h-12 text-slate-300 group-hover:text-blue-500 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">
                  {t("tool.upload")}
                </p>
                <input
                  type="file"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-center text-sm gap-4">
                <div className="flex items-center gap-3 w-full overflow-hidden">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                     {mode === 'encrypt' ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5"/>}
                  </div>
                  <div className="truncate text-slate-700 font-medium">{file.name}</div>
                </div>
                <button
                  onClick={reset}
                  className="text-slate-500 hover:text-slate-800 whitespace-nowrap"
                >
                  {t("tool.changeFile")}
                </button>
              </div>
            )}

            {/* Password input & Action */}
            {file && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {tTool("passwordLabel")}
                  </label>
                  <div className="relative">
                    <Key className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={tTool("passwordPlaceholder")}
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {mode === "encrypt" ? tTool("encryptWarning") : tTool("decryptWarning")}
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
                    {error}
                  </div>
                )}

                <button
                  onClick={processFile}
                  disabled={processing || !password}
                  className={`w-full py-3 px-4 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all ${
                    processing || !password
                      ? "bg-slate-300 cursor-not-allowed"
                      : mode === "encrypt" 
                        ? "bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5"
                        : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-0.5"
                  }`}
                >
                  {processing && <RefreshCw className="w-5 h-5 animate-spin" />}
                  {processing ? tTool("processingBtn") : (mode === "encrypt" ? tTool("encryptBtn") : tTool("decryptBtn"))}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Result UI */}
        {resultUrl && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <Download className="w-8 h-8" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">
                {tTool("successTitle")}
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                {mode === "encrypt" ? tTool("successEncryptMessage") : tTool("successDecryptMessage")} <br />
                <span className="font-mono bg-slate-100 px-2 py-1 rounded text-xs mt-2 inline-block text-slate-600">
                  {resultName}
                </span>
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <a
                  href={resultUrl}
                  download={resultName}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  {tTool("downloadResult")}
                </a>
                <button
                  onClick={reset}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all flex items-center justify-center"
                >
                  {tTool("processAnother")}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </ToolLayout>
  );
}
