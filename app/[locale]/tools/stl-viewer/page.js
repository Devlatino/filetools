"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Upload } from "lucide-react";
import { FaqSection } from "@/components/FaqSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedTools } from "@/components/RelatedTools";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
function parseSTL(buffer) {
  const geometry = new THREE.BufferGeometry();

  const headerBytes = new Uint8Array(buffer, 0, 80);
  const header = String.fromCharCode(...headerBytes);
  const isASCII = header.includes("solid") && !isBinarySTL(buffer);

  function isBinarySTL(buf) {
    const numTriangles = new DataView(buf).getUint32(80, true);
    const expectedSize = 84 + numTriangles * 50;
    return buf.byteLength === expectedSize;
  }

  const positions = [];

  if (isASCII) {
    const text = new TextDecoder().decode(buffer);
    const lines = text.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("vertex")) {
        const parts = trimmed.split(/\s+/);
        positions.push(
          parseFloat(parts[1]),
          parseFloat(parts[2]),
          parseFloat(parts[3])
        );
      }
    }
  } else {
    const view = new DataView(buffer);
    const numTriangles = view.getUint32(80, true);
    let offset = 84;
    for (let i = 0; i < numTriangles; i++) {
      offset += 12; // skip normal
      for (let j = 0; j < 3; j++) {
        positions.push(
          view.getFloat32(offset, true),
          view.getFloat32(offset + 4, true),
          view.getFloat32(offset + 8, true)
        );
        offset += 12;
      }
      offset += 2; // attribute byte count
    }
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.computeVertexNormals();
  return geometry;
}

export default function StlViewerPage() {
  const locale = useLocale();
  const t = useTranslations("tools.stlViewer");
  const tCommon = useTranslations("common");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({ numTriangles: 0, dimensions: null });
  const [isDragOver, setIsDragOver] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const animIdRef = useRef(null);

  useEffect(() => {
    if (!file || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 10000);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.autoRotate = false;

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(1, 2, 3);
    scene.add(dirLight);

    let cancelled = false;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (cancelled) return;
      const buffer = e.target?.result;
      if (!buffer) return;
      try {
        const geometry = parseSTL(buffer);

        geometry.computeBoundingBox();
        const box = geometry.boundingBox;
        const center = new THREE.Vector3();
        box.getCenter(center);
        geometry.translate(-center.x, -center.y, -center.z);

        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        camera.position.set(0, 0, maxDim * 2);
        camera.near = maxDim * 0.001;
        camera.far = maxDim * 100;
        camera.updateProjectionMatrix();

        const material = new THREE.MeshStandardMaterial({ color: 0xa0b4c8 });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        console.log("mesh added, triangles:", geometry.attributes.position.count / 3);
        console.log("camera position:", camera.position);
        console.log("bounding box:", box);

        const numTriangles = geometry.attributes.position.count / 3;
        const dimStr = `${size.x.toFixed(1)} × ${size.y.toFixed(1)} × ${size.z.toFixed(1)}`;
        setStats({ numTriangles, dimensions: dimStr });

        const animate = () => {
          animIdRef.current = requestAnimationFrame(animate);
          controls.update();
          renderer.render(scene, camera);
        };
        animate();
      } catch (err) {
        if (!cancelled) setError(t("error"));
      }
      if (!cancelled) setLoading(false);
    };
    reader.onerror = () => {
      if (!cancelled) {
        setError(t("error"));
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);

    const onResize = () => {
      if (!canvas.parentElement) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
      animIdRef.current = null;
      controls.dispose();
      renderer.dispose();
    };
  }, [file, t]);

  const loadFile = useCallback((fileItem) => {
    if (!fileItem || !fileItem.name.toLowerCase().endsWith(".stl")) {
      setError(t("error"));
      setFile(null);
      setStats({ numTriangles: 0, dimensions: null });
      return;
    }
    setError("");
    setLoading(true);
    setStats({ numTriangles: 0, dimensions: null });
    setFile(fileItem);
  }, [t]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    loadFile(e.dataTransfer?.files?.[0]);
  }, [loadFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) setIsDragOver(false);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
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
        <Breadcrumb locale={locale} homeLabel={tCommon("breadcrumbHome")} toolsLabel={tCommon("nav.tools")} toolLabel={t("label")} toolPath="stl-viewer" />

        <div className="mt-6">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("metaTitle")}</h1>
          <p className="mt-1 text-sm text-slate-300">{t("metaDescription")}</p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="space-y-4">
            {!file ? (
              <label
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 transition-colors ${
                  isDragOver ? "border-sky-500 bg-sky-500/10" : "border-slate-600 bg-slate-900/50"
                }`}
              >
                <input ref={fileInputRef} type="file" accept=".stl" className="sr-only" onChange={(e) => loadFile(e.target.files?.[0])} />
                <Upload size={40} className="text-slate-400" />
                <p className="text-center text-sm text-slate-300">{t("dropzone")}</p>
              </label>
            ) : (
              <>
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={500}
                  style={{ width: "100%", height: "500px", display: "block" }}
                  className="rounded-xl bg-[#1a1a2e]"
                />
              </>
            )}
            {loading && <p className="text-sm text-sky-400">{t("loading")}</p>}
            {error && <p className="text-sm text-rose-400">{error}</p>}
            {file && stats.numTriangles > 0 && (
              <div className="flex flex-wrap gap-4 rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm">
                <span className="text-slate-300"><strong className="text-slate-200">{t("triangles")}:</strong> {stats.numTriangles.toLocaleString()}</span>
                {stats.dimensions && (
                  <span className="text-slate-300"><strong className="text-slate-200">{t("dimensions")}:</strong> {stats.dimensions}</span>
                )}
              </div>
            )}
          </section>
          <aside className="space-y-6">
            <EditorialSection namespace="tools.stlViewer" />
          </aside>
        </div>

        <div className="mt-10">
          <RelatedTools locale={locale} currentSlug="stl-viewer" />
        </div>
        <div className="mt-10">
          <FaqSection namespace="tools.stlViewer" />
        </div>
      </main>
    </div>
  );
}
