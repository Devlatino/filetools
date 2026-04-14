"use client";

import React, { useState } from "react";
import Head from "next/head";
import { useTranslations } from "next-intl";
import { Database, Copy, Check, Download, RefreshCw } from "lucide-react";
import ToolLayout from "@/components/ToolLayout";

export default function SqlFormatterTool() {
  const t = useTranslations();
  const tTool = useTranslations("tools.sqlFormatter");

  const [inputSql, setInputSql] = useState("");
  const [outputSql, setOutputSql] = useState("");
  const [dialect, setDialect] = useState("sql");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const formatSql = async () => {
    if (!inputSql.trim()) return;
    
    setProcessing(true);
    setError(null);
    setCopied(false);

    try {
      // Dynamic import
      const { format } = await import("sql-formatter");
      
      const formatted = format(inputSql, {
        language: dialect,
        uppercase: true,
        linesBetweenQueries: 2
      });
      
      setOutputSql(formatted);
    } catch (err) {
      console.error(err);
      setError(tTool("errorGeneric"));
      setOutputSql("");
    } finally {
      setProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!outputSql) return;
    navigator.clipboard.writeText(outputSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clear = () => {
    setInputSql("");
    setOutputSql("");
    setError(null);
  };

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

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 max-w-4xl mx-auto mb-12">
        <h2 className="text-xl font-semibold text-slate-800 mb-6 text-center flex items-center justify-center gap-2">
          <Database className="w-6 h-6 text-blue-500" />
          {tTool("title")}
        </h2>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input View */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">
                  {tTool("dropzone")}
                </label>
                <select
                  value={dialect}
                  onChange={(e) => setDialect(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded focus:ring focus:ring-blue-100 focus:border-blue-300 outline-none px-2 py-1"
                >
                  <option value="sql">Standard SQL</option>
                  <option value="postgresql">PostgreSQL</option>
                  <option value="mysql">MySQL</option>
                  <option value="mariadb">MariaDB</option>
                  <option value="sqlite">SQLite</option>
                </select>
              </div>
              <textarea
                value={inputSql}
                onChange={(e) => {
                  setInputSql(e.target.value);
                  setError(null);
                }}
                placeholder="SELECT * FROM table JOIN other ON table.id = other.id WHERE table.col = 'val'"
                className="w-full h-80 p-4 font-mono text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none uppercase resize-y transition-all bg-slate-50"
              />
            </div>

            {/* Output View */}
            <div className="space-y-2 relative">
              <label className="block text-sm font-medium text-slate-700">
                Result
              </label>
              <textarea
                readOnly
                value={outputSql}
                placeholder="Formatted output will appear here..."
                className={`w-full h-80 p-4 font-mono text-sm border border-slate-300 rounded-xl outline-none resize-y transition-all ${
                  error ? "bg-red-50 text-red-500" : "bg-slate-900 text-green-400"
                }`}
              />
              {outputSql && !error && (
                <button
                  onClick={handleCopy}
                  className="absolute top-10 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1 text-xs"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={formatSql}
              disabled={processing || !inputSql.trim()}
              className={`flex-1 py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                processing || !inputSql.trim()
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5"
              }`}
            >
              {processing && <RefreshCw className="w-5 h-5 animate-spin" />}
              {processing ? tTool("converting") : tTool("convert")}
            </button>
            <button
              onClick={clear}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
