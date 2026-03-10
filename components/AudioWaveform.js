"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export default function AudioWaveform({
  audioBuffer,
  currentTime,
  duration,
  trimStart,
  trimEnd,
  onSeek,
  onTrimChange,
  mode,
  isPlaying,
}) {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(null);

  useEffect(() => {
    if (!audioBuffer || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    const data = audioBuffer.getChannelData(0);
    const step = Math.ceil(data.length / W);
    const amp = H / 2;

    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, W, H);

    if (mode === "trim" && trimStart !== undefined) {
      const x1 = (trimStart / duration) * W;
      const x2 = (trimEnd / duration) * W;
      ctx.fillStyle = "rgba(99, 102, 241, 0.15)";
      ctx.fillRect(x1, 0, x2 - x1, H);
    }

    for (let i = 0; i < W; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const datum = data[i * step + j] || 0;
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }

      const t = (i / W) * duration;
      let color = "#6366f1";
      if (mode === "trim") {
        if (t < trimStart || t > trimEnd) {
          color = "#334155";
        } else {
          color = "#818cf8";
        }
      } else {
        const playedFraction = currentTime / duration;
        color = i / W < playedFraction ? "#6366f1" : "#334155";
      }

      ctx.fillStyle = color;
      ctx.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
    }

    const playX = (currentTime / duration) * W;
    ctx.fillStyle = "#f1f5f9";
    ctx.fillRect(playX - 1, 0, 2, H);

    if (mode === "trim") {
      const x1 = (trimStart / duration) * W;
      const x2 = (trimEnd / duration) * W;

      ctx.fillStyle = "#6366f1";
      ctx.fillRect(x1 - 2, 0, 4, H);
      ctx.beginPath();
      ctx.moveTo(x1 - 2, 0);
      ctx.lineTo(x1 + 10, 0);
      ctx.lineTo(x1 - 2, 16);
      ctx.fillStyle = "#6366f1";
      ctx.fill();

      ctx.fillStyle = "#6366f1";
      ctx.fillRect(x2 - 2, 0, 4, H);
      ctx.beginPath();
      ctx.moveTo(x2 + 2, 0);
      ctx.lineTo(x2 - 10, 0);
      ctx.lineTo(x2 + 2, 16);
      ctx.fillStyle = "#6366f1";
      ctx.fill();

      ctx.fillStyle = "#f1f5f9";
      ctx.font = "11px monospace";
      ctx.fillText(formatTime(trimStart), x1 + 4, 28);
      ctx.fillText(formatTime(trimEnd), Math.max(0, x2 - 52), 28);
    }
  }, [audioBuffer, currentTime, duration, trimStart, trimEnd, mode, isPlaying]);

  const getTimeFromX = useCallback(
    (clientX) => {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      return (x / rect.width) * duration;
    },
    [duration]
  );

  const getHandleAt = useCallback(
    (clientX) => {
      if (mode !== "trim") return "seek";
      const time = getTimeFromX(clientX);
      const threshold = duration * 0.02;
      if (Math.abs(time - trimStart) < threshold) return "trimStart";
      if (Math.abs(time - trimEnd) < threshold) return "trimEnd";
      if (time > trimStart && time < trimEnd) return "trimRegion";
      return "seek";
    },
    [mode, trimStart, trimEnd, duration, getTimeFromX]
  );

  const handleMouseDown = useCallback(
    (e) => {
      const handle = getHandleAt(e.clientX);
      setIsDragging(handle);
      if (handle === "seek") {
        onSeek?.(getTimeFromX(e.clientX));
      }
    },
    [getHandleAt, getTimeFromX, onSeek]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const time = getTimeFromX(e.clientX);

      if (isDragging === "seek") {
        onSeek?.(time);
      } else if (isDragging === "trimStart") {
        onTrimChange?.({
          start: Math.max(0, Math.min(time, trimEnd - 0.5)),
          end: trimEnd,
        });
      } else if (isDragging === "trimEnd") {
        onTrimChange?.({
          start: trimStart,
          end: Math.min(duration, Math.max(time, trimStart + 0.5)),
        });
      }
    },
    [isDragging, getTimeFromX, onSeek, onTrimChange, trimStart, trimEnd, duration]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  const getCursor = useCallback(
    (e) => {
      if (!canvasRef.current) return;
      const handle = getHandleAt(e.clientX);
      const cursors = {
        trimStart: "ew-resize",
        trimEnd: "ew-resize",
        trimRegion: "grab",
        seek: "pointer",
      };
      canvasRef.current.style.cursor = cursors[handle] || "pointer";
    },
    [getHandleAt]
  );

  const handleTouchStart = (e) => handleMouseDown(e.touches[0]);
  const handleTouchMove = (e) => {
    e.preventDefault();
    handleMouseMove(e.touches[0]);
  };
  const handleTouchEnd = handleMouseUp;

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg"
      style={{ background: "#0f172a" }}
    >
      <canvas
        ref={canvasRef}
        width={800}
        height={120}
        className="w-full"
        style={{ display: "block", height: "120px" }}
        onMouseDown={handleMouseDown}
        onMouseMove={(e) => {
          handleMouseMove(e);
          getCursor(e);
        }}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
      <div
        className="flex justify-between px-2 py-1"
        style={{ background: "#0f172a" }}
      >
        <span
          style={{
            color: "#94a3b8",
            fontSize: "11px",
            fontFamily: "monospace",
          }}
        >
          {formatTime(currentTime)}
        </span>
        <span
          style={{
            color: "#94a3b8",
            fontSize: "11px",
            fontFamily: "monospace",
          }}
        >
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00.0";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${m}:${s.toString().padStart(2, "0")}.${ms}`;
}
