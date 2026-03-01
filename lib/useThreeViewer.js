"use client";

import { useCallback, useEffect, useRef } from "react";

export const THREE_CDN = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
export const VIEWER_BG = 0x1a1a2e;
export const VIEWER_MESH_COLOR = 0xa0b4c8;

/**
 * Hook: init Three.js from CDN, scene/camera/renderer, then when geometryVersion > 0
 * apply geometry from geometryRef/boundsRef (positions, normals, bounds), center and scale to ~80%,
 * and attach orbit (rotate/zoom/pan).
 */
export function useThreeViewer(containerRef, geometryRef, boundsRef, geometryVersion) {
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const meshRef = useRef(null);
  const rafRef = useRef(null);
  const orbitRef = useRef({ isRotating: false, isPanning: false, lastX: 0, lastY: 0, theta: 0, phi: 0, dist: 100, target: [0, 0, 0] });

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof window === "undefined") return;

    let THREE = window.THREE;
    if (!THREE) {
      const script = document.createElement("script");
      script.src = THREE_CDN;
      script.async = true;
      script.onload = () => {
        window.THREE = window.THREE || window.THREE;
        init();
      };
      document.head.appendChild(script);
      return () => {};
    }
    init();

    function init() {
      const T = window.THREE;
      if (!T || !container) return;

      const width = container.clientWidth;
      const height = container.clientHeight;
      const scene = new T.Scene();
      scene.background = new T.Color(VIEWER_BG);
      const camera = new T.PerspectiveCamera(50, width / height, 0.1, 10000);
      camera.position.set(0, 0, 100);
      const renderer = new T.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      scene.add(new T.AmbientLight(0xffffff, 0.6));
      const dir = new T.DirectionalLight(0xffffff, 0.8);
      dir.position.set(50, 50, 50);
      scene.add(dir);

      sceneRef.current = scene;
      cameraRef.current = camera;
      rendererRef.current = renderer;

      function animate() {
        rafRef.current = requestAnimationFrame(animate);
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      }
      animate();

      const onResize = () => {
        if (!container || !cameraRef.current || !rendererRef.current) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(w, h);
      };
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        renderer.dispose();
        if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      };
    }
  }, [containerRef]);

  useEffect(() => {
    const geometry = geometryRef.current;
    const bounds = boundsRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const orbit = orbitRef.current;
    if (!geometry || !bounds || !scene || !camera || !window.THREE) return;

    const T = window.THREE;
    if (meshRef.current) {
      scene.remove(meshRef.current);
      meshRef.current.geometry.dispose();
      meshRef.current.material.dispose();
    }

    const pos = new T.BufferAttribute(geometry.positions, 3);
    const norm = new T.BufferAttribute(geometry.normals, 3);
    const geom = new T.BufferGeometry();
    geom.setAttribute("position", pos);
    geom.setAttribute("normal", norm);
    const mat = new T.MeshStandardMaterial({ color: VIEWER_MESH_COLOR });
    const mesh = new T.Mesh(geom, mat);
    scene.add(mesh);
    meshRef.current = mesh;

    const [[minX, minY, minZ], [maxX, maxY, maxZ]] = [bounds.min, bounds.max];
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const cz = (minZ + maxZ) / 2;
    mesh.position.set(-cx, -cy, -cz);

    const sizeX = maxX - minX || 1;
    const sizeY = maxY - minY || 1;
    const sizeZ = maxZ - minZ || 1;
    const maxSize = Math.max(sizeX, sizeY, sizeZ);
    const container = containerRef.current;
    const fov = (camera.fov * Math.PI) / 180;
    const fit = Math.max(container.clientWidth, container.clientHeight) * 0.8;
    const dist = (fit / 2) / Math.tan(fov / 2);
    const scale = dist / (maxSize / 2);
    mesh.scale.setScalar(scale);

    orbit.target = [0, 0, 0];
    orbit.theta = 0;
    orbit.phi = Math.PI / 4;
    orbit.dist = dist * 1.2;
    camera.position.set(
      orbit.dist * Math.sin(orbit.phi) * Math.cos(orbit.theta),
      orbit.dist * Math.cos(orbit.phi),
      orbit.dist * Math.sin(orbit.phi) * Math.sin(orbit.theta)
    );
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [geometryVersion]);

  const attachOrbit = useCallback(() => {
    const container = containerRef.current;
    const camera = cameraRef.current;
    const orbit = orbitRef.current;
    if (!container || !camera) return () => {};

    const onMouseDown = (e) => {
      if (e.button === 0) orbit.isRotating = true;
      if (e.button === 2) orbit.isPanning = true;
      orbit.lastX = e.clientX;
      orbit.lastY = e.clientY;
    };
    const onMouseMove = (e) => {
      const dx = e.clientX - orbit.lastX;
      const dy = e.clientY - orbit.lastY;
      orbit.lastX = e.clientX;
      orbit.lastY = e.clientY;
      if (orbit.isRotating) {
        orbit.theta -= dx * 0.005;
        orbit.phi += dy * 0.005;
        orbit.phi = Math.max(0.01, Math.min(Math.PI - 0.01, orbit.phi));
        const x = orbit.target[0] + orbit.dist * Math.sin(orbit.phi) * Math.cos(orbit.theta);
        const y = orbit.target[1] + orbit.dist * Math.cos(orbit.phi);
        const z = orbit.target[2] + orbit.dist * Math.sin(orbit.phi) * Math.sin(orbit.theta);
        camera.position.set(x, y, z);
        camera.lookAt(orbit.target[0], orbit.target[1], orbit.target[2]);
      }
      if (orbit.isPanning && window.THREE) {
        const T = window.THREE;
        const forward = new T.Vector3(orbit.target[0], orbit.target[1], orbit.target[2]).sub(camera.position).normalize();
        const up = new T.Vector3(0, 1, 0);
        const rightVec = new T.Vector3().crossVectors(forward, up).normalize();
        const upVec = new T.Vector3().crossVectors(rightVec, forward).normalize();
        const shiftX = 0.1 * (-dx * rightVec.x + dy * upVec.x);
        const shiftY = 0.1 * (-dx * rightVec.y + dy * upVec.y);
        const shiftZ = 0.1 * (-dx * rightVec.z + dy * upVec.z);
        orbit.target[0] += shiftX;
        orbit.target[1] += shiftY;
        orbit.target[2] += shiftZ;
        camera.position.x += shiftX;
        camera.position.y += shiftY;
        camera.position.z += shiftZ;
        camera.lookAt(orbit.target[0], orbit.target[1], orbit.target[2]);
      }
    };
    const onMouseUp = () => {
      orbit.isRotating = false;
      orbit.isPanning = false;
    };
    const onWheel = (e) => {
      e.preventDefault();
      orbit.dist *= e.deltaY > 0 ? 1.1 : 1 / 1.1;
      orbit.dist = Math.max(10, Math.min(10000, orbit.dist));
      const x = orbit.target[0] + orbit.dist * Math.sin(orbit.phi) * Math.cos(orbit.theta);
      const y = orbit.target[1] + orbit.dist * Math.cos(orbit.phi);
      const z = orbit.target[2] + orbit.dist * Math.sin(orbit.phi) * Math.sin(orbit.theta);
      camera.position.set(x, y, z);
      camera.lookAt(orbit.target[0], orbit.target[1], orbit.target[2]);
    };
    const onContextMenu = (e) => e.preventDefault();

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    container.addEventListener("wheel", onWheel, { passive: false });
    container.addEventListener("contextmenu", onContextMenu);
    return () => {
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("contextmenu", onContextMenu);
    };
  }, []);

  useEffect(() => {
    if (!geometryRef.current || !geometryVersion) return;
    const cleanup = attachOrbit();
    return () => cleanup?.();
  }, [attachOrbit, geometryVersion]);

  return { sceneRef, cameraRef, rendererRef };
}
