"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Upload, Loader2, Download } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SchemaMarkup } from "@/components/SchemaMarkup";

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default function DxfViewerPage() {
  const locale = useLocale();
  const t = useTranslations("tools");
  const tDxf = (key) => t(`dxfViewer.${key}`);
  const tCommon = useTranslations("common");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const fileInputRef = useRef(null);

  const renderDxf = useCallback(
    async (dxfFile) => {
      setLoading(true);
      setError(null);

      try {
        const text = await dxfFile.text();

        const DxfParser = (await import("dxf-parser")).default;
        const THREE = await import("three");

        const parser = new DxfParser();
        const dxf = parser.parseSync(text);

        if (!dxf || !dxf.entities) {
          throw new Error("Invalid DXF file");
        }

        if (!containerRef.current) {
          setLoading(false);
          return;
        }

        if (rendererRef.current) {
          rendererRef.current.dispose();
          rendererRef.current = null;
        }
        containerRef.current.innerHTML = "";

        const width = containerRef.current.clientWidth || 800;
        const height = 500;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a2e);

        const camera = new THREE.OrthographicCamera(
          -width / 2,
          width / 2,
          height / 2,
          -height / 2,
          0.1,
          10000
        );
        camera.position.z = 1000;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const dxfColors = [
          0xffffff, 0xff0000, 0xffff00, 0x00ff00, 0x00ffff, 0x0000ff, 0xff00ff, 0xffffff, 0x808080, 0xc0c0c0,
        ];

        const getColor = (entity) => {
          if (entity.color !== undefined) {
            return dxfColors[entity.color % dxfColors.length] ?? 0x00bfff;
          }
          return 0x00bfff;
        };

        const entities = dxf.entities || [];
        const allPoints = [];

        entities.forEach((entity) => {
          const color = getColor(entity);
          const material = new THREE.LineBasicMaterial({ color });

          try {
            if (entity.type === "LINE") {
              const verts = entity.vertices || [];
              if (verts.length >= 2) {
                const points = [
                  new THREE.Vector3(verts[0].x, verts[0].y, 0),
                  new THREE.Vector3(verts[1].x, verts[1].y, 0),
                ];
                allPoints.push(...points);
                const geo = new THREE.BufferGeometry().setFromPoints(points);
                scene.add(new THREE.Line(geo, material));
              }
            } else if (entity.type === "LWPOLYLINE" || entity.type === "POLYLINE") {
              const vertices = entity.vertices || [];
              if (vertices.length > 1) {
                const points = vertices.map((v) => {
                  const p = new THREE.Vector3(v.x, v.y, 0);
                  allPoints.push(p);
                  return p;
                });
                if (entity.shape) points.push(points[0]);
                const geo = new THREE.BufferGeometry().setFromPoints(points);
                scene.add(new THREE.Line(geo, material));
              }
            } else if (entity.type === "CIRCLE") {
              const segments = 64;
              const points = [];
              for (let i = 0; i <= segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                const p = new THREE.Vector3(
                  entity.center.x + Math.cos(angle) * entity.radius,
                  entity.center.y + Math.sin(angle) * entity.radius,
                  0
                );
                points.push(p);
                allPoints.push(p);
              }
              const geo = new THREE.BufferGeometry().setFromPoints(points);
              scene.add(new THREE.Line(geo, material));
            } else if (entity.type === "ARC") {
              const segments = 64;
              const startAngle = entity.startAngle != null ? entity.startAngle : 0;
              const endAngle = entity.endAngle != null ? entity.endAngle : Math.PI * 2;
              let angle = startAngle;
              const points = [];
              const step = (endAngle - startAngle) / segments;
              for (let i = 0; i <= segments; i++) {
                const p = new THREE.Vector3(
                  entity.center.x + Math.cos(angle) * entity.radius,
                  entity.center.y + Math.sin(angle) * entity.radius,
                  0
                );
                points.push(p);
                allPoints.push(p);
                angle += step;
              }
              const geo = new THREE.BufferGeometry().setFromPoints(points);
              scene.add(new THREE.Line(geo, material));
            } else if (entity.type === "SPLINE") {
              const ctrlPoints = entity.controlPoints || [];
              if (ctrlPoints.length > 1) {
                const curve = new THREE.CatmullRomCurve3(
                  ctrlPoints.map((p) => new THREE.Vector3(p.x, p.y, 0))
                );
                const points = curve.getPoints(50);
                allPoints.push(...points);
                const geo = new THREE.BufferGeometry().setFromPoints(points);
                scene.add(new THREE.Line(geo, material));
              }
            }
          } catch (_) {}
        });

        if (allPoints.length > 0) {
          const box = new THREE.Box3();
          allPoints.forEach((p) => box.expandByPoint(p));
          const center = new THREE.Vector3();
          box.getCenter(center);
          const size = new THREE.Vector3();
          box.getSize(size);
          const maxDim = Math.max(size.x, size.y) || 1;
          const scale = (Math.min(width, height) / maxDim) * 0.85;
          camera.position.set(center.x, center.y, 1000);
          camera.zoom = scale;
          camera.updateProjectionMatrix();
        }

        const canvas = renderer.domElement;

        const onWheel = (e) => {
          e.preventDefault();
          camera.zoom *= e.deltaY > 0 ? 0.9 : 1.1;
          camera.updateProjectionMatrix();
          renderer.render(scene, camera);
        };

        let isPanning = false;
        let startPan = { x: 0, y: 0 };

        const onMouseDown = (e) => {
          isPanning = true;
          startPan = { x: e.clientX, y: e.clientY };
        };

        const onMouseMove = (e) => {
          if (!isPanning) return;
          const dx = (e.clientX - startPan.x) / camera.zoom;
          const dy = (e.clientY - startPan.y) / camera.zoom;
          camera.position.x -= dx;
          camera.position.y += dy;
          startPan = { x: e.clientX, y: e.clientY };
          renderer.render(scene, camera);
        };

        const onMouseUp = () => {
          isPanning = false;
        };

        canvas.addEventListener("wheel", onWheel, { passive: false });
        canvas.addEventListener("mousedown", onMouseDown);
        canvas.addEventListener("mousemove", onMouseMove);
        canvas.addEventListener("mouseup", onMouseUp);
        canvas.addEventListener("mouseleave", onMouseUp);

        renderer.render(scene, camera);

        setFileInfo({
          name: dxfFile.name,
          size: dxfFile.size,
          entities: entities.length,
        });
      } catch (err) {
        console.error("DXF render error:", err);
        setError(tDxf("errorGeneric"));
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  const processFile = useCallback(
    (f) => {
      if (!f) {
        setFile(null);
        setFileInfo(null);
        setError(null);
        if (rendererRef.current && containerRef.current) {
          try {
            rendererRef.current.dispose();
          } catch (_) {}
          rendererRef.current = null;
          containerRef.current.innerHTML = "";
        }
        return;
      }
      const isDxf = f.name.toLowerCase().endsWith(".dxf");
      if (!isDxf) {
        setError(tDxf("errorGeneric"));
        setFile(null);
        return;
      }
      setFile(f);
      renderDxf(f);
    },
    [t, renderDxf]
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

  const handleDownload = useCallback(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    return () => {
      if (rendererRef.current) {
        try {
          rendererRef.current.dispose();
        } catch (_) {}
        rendererRef.current = null;
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <SchemaMarkup
        title={t("metaTitle")}
        description={t("metaDescription")}
        slug="dxf-viewer"
        locale={locale}
      />
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href={`/${locale}/`} prefetch className="flex items-center gap-2">
            <img src="/fileflip-logo.svg" alt={tCommon("siteName")} className="h-11 w-auto" width={170} height={44} />
            <span className="text-sm text-slate-400">{tDxf("label")}</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumb
          locale={locale}
          homeLabel={tCommon("breadcrumbHome")}
          toolsLabel={tCommon("nav.tools")}
          toolLabel={tDxf("label")}
          toolPath="dxf-viewer"
        />

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_340px]">
          <section className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{tDxf("metaTitle")}</h1>
              <p className="mt-1 text-sm text-slate-300">{tDxf("metaDescription")}</p>
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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".dxf,application/dxf,image/vnd.dxf"
                  className="sr-only"
                  onChange={handleFileChange}
                />
                <Upload size={40} strokeWidth={1.5} className={isDragOver ? "text-sky-400" : "text-sky-500/80"} />
                <p className={`text-center text-sm font-medium ${isDragOver ? "text-sky-200" : "text-slate-300"}`}>{tDxf("dropzone")}</p>
              </label>
            ) : (
              <>
                {loading && (
                  <div className="flex h-[500px] w-full items-center justify-center rounded-xl bg-[#1a1a2e]">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 size={40} className="animate-spin text-sky-400" />
                      <p className="text-sm text-slate-300">{tDxf("loading")}</p>
                    </div>
                  </div>
                )}
                <div
                  ref={containerRef}
                  className="w-full overflow-hidden rounded-xl bg-[#1a1a2e]"
                  style={{ minHeight: 500, height: 500, display: loading ? "none" : "block" }}
                />
                {fileInfo && (
                  <p className="text-xs text-slate-400">
                    {fileInfo.name} · {formatBytes(fileInfo.size)} · {fileInfo.entities} entities
                  </p>
                )}
                {!fileInfo && !loading && (
                  <p className="text-xs text-slate-400">
                    {file.name} · {formatBytes(file.size)}
                  </p>
                )}
                <p className="text-xs text-slate-500">{tDxf("renderNote")}</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
                  >
                    <Download size={18} strokeWidth={2} />
                    {tDxf("download")}
                  </button>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-500">
                    <Upload size={18} strokeWidth={2} />
                    {tDxf("dropzone")}
                    <input
                      type="file"
                      accept=".dxf,application/dxf,image/vnd.dxf"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => processFile(null)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-rose-500 hover:text-rose-200"
                  >
                    {tDxf("newFile")}
                  </button>
                </div>
              </>
            )}

            {error && <p className="text-sm text-rose-400">{error}</p>}
          </section>

          <aside className="space-y-8 lg:max-w-[340px]">
            <EditorialSection namespace="tools.dxfViewer" />
          </aside>
        </div>

        <div className="mt-10">
          <RelatedTools locale={locale} currentSlug="dxf-viewer" />
        </div>

        <div className="mt-10">
          <FaqSection namespace="tools.dxfViewer" />
        </div>
      </main>
    </div>
  );
}
