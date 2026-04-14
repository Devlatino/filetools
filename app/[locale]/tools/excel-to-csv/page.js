"use client";

import React, { useState, useRef } from "react";
import Head from "next/head";
import { useTranslations } from "next-intl";
import { FileText, Download, UploadCloud, RefreshCw } from "lucide-react";
import ToolLayout from "@/components/ToolLayout";

export default function ExcelToCsvTool() {
  const t = useTranslations();
  const tTool = useTranslations("tools.excelToCsv");

  const [file, setFile] = useState(null);
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

  const processFile = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);

    try {
      const { read, write } = await import("xlsx");
      const arrayBuffer = await file.arrayBuffer();

      const workbook = read(arrayBuffer, { type: "buffer" });
      const firstSheetName = workbook.SheetNames[0];
      
      const csvData = write(workbook, { bookType: "csv", type: "string", sheet: firstSheetName });
      
      // Add UTF-8 BOM so Excel opens CSV without encoding issues automatically
      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csvData], { type: "text/csv;charset=utf-8;" });

      let outName = file.name.replace(/\.[^/.]+$/, "") + ".csv";

      setResultUrl(URL.createObjectURL(blob));
      setResultName(outName);
    } catch (err) {
      console.error(err);
      setError(tTool("errorFailed"));
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResultUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <ToolLayout
      title={tTool("label")}
      description={tTool("short")}
      editorialTitle={tTool("editorialTitle")}
      editorialBody={tTool("editorialBody")}
      faqs={[
        { q: tTool("faq1Q"), a: tTool("faq1A") },
        { q: tTool("faq2Q"), a: tTool("faq2A") }
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

        {!resultUrl && (
          <div className="space-y-6">
            {!file ? (
              <div
                className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 hover:border-emerald-300 transition-colors cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud className="w-12 h-12 text-slate-300 group-hover:text-emerald-500 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">
                  {tTool("uploadText")}
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-center text-sm gap-4">
                <div className="flex items-center gap-3 w-full overflow-hidden">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg shrink-0">
                     <FileText className="w-5 h-5" />
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

            {file && (
              <div className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
                    {error}
                  </div>
                )}
                <button
                  onClick={processFile}
                  disabled={processing}
                  className={`w-full py-3 px-4 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all ${
                    processing
                      ? "bg-slate-300 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-0.5"
                  }`}
                >
                  {processing && <RefreshCw className="w-5 h-5 animate-spin" />}
                  {processing ? tTool("processingBtn") : tTool("convertBtn")}
                </button>
              </div>
            )}
          </div>
        )}

        {resultUrl && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Download className="w-8 h-8" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">
                {tTool("successTitle")}
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                {tTool("successMessage")} <br />
                <span className="font-mono bg-slate-100 px-2 py-1 rounded text-xs mt-2 inline-block text-slate-600">
                  {resultName}
                </span>
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <a
                  href={resultUrl}
                  download={resultName}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
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
