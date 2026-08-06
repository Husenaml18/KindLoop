"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Choosing the square.
 *
 * A puzzle board is square and always will be, so a landscape photograph has to
 * lose something. Until now the board simply *stretched* whatever it was given —
 * a 3:2 picture came out squashed, with text and faces visibly wrong — and the
 * creator had no way to know which part would be used.
 *
 * So: pick the square yourself. Drag to move, pinch or slide to zoom, and what you
 * see is exactly what gets cut up. The output is a real square file, which also
 * means the board never has to distort anything again.
 */

const OUT = 1400;

export function SquareCropper({
  file,
  onCancel,
  onDone,
}: {
  file: File;
  onCancel: () => void;
  /** A genuinely square file, ready to upload. */
  onDone: (square: File) => void;
}) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  /* Measured, not read from the ref during render — the layout has to be
     derivable from state or React can't be sure the view matches it. */
  const [frame, setFrame] = useState(320);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w > 0) setFrame(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    const el = new Image();
    el.onload = () => setImg(el);
    el.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  /* Clamp so the square can never show empty space at the edges. */
  const clamp = (next: { x: number; y: number }, z: number) => {
    if (!img) return next;
    const short = Math.min(img.width, img.height);
    const scale = (frame / short) * z;
    const w = img.width * scale;
    const h = img.height * scale;
    const maxX = Math.max(0, (w - frame) / 2);
    const maxY = Math.max(0, (h - frame) / 2);
    return {
      x: Math.max(-maxX, Math.min(maxX, next.x)),
      y: Math.max(-maxY, Math.min(maxY, next.y)),
    };
  };

  /* Zooming out can leave the square hanging off the edge of the picture, so the
     offset is pulled back in at the moment it changes rather than afterwards. */
  const setZoomClamped = (z: number) => {
    setZoom(z);
    setOffset((o) => clamp(o, z));
  };

  const cut = () => {
    if (!img) return;
    setBusy(true);
    try {
      const short = Math.min(img.width, img.height);
      const scale = (frame / short) * zoom;

      /* Turn what's on screen back into source-image coordinates. */
      const srcSize = frame / scale;
      const cx = img.width / 2 - offset.x / scale;
      const cy = img.height / 2 - offset.y / scale;

      const canvas = document.createElement("canvas");
      canvas.width = OUT;
      canvas.height = OUT;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, cx - srcSize / 2, cy - srcSize / 2, srcSize, srcSize, 0, 0, OUT, OUT);

      canvas.toBlob(
        (blob) => {
          setBusy(false);
          if (!blob) return;
          const name = file.name.replace(/\.[^.]+$/, "") + "-square.jpg";
          onDone(new File([blob], name, { type: "image/jpeg", lastModified: file.lastModified }));
        },
        "image/jpeg",
        0.9
      );
    } catch {
      setBusy(false);
    }
  };

  const short = img ? Math.min(img.width, img.height) : 1;
  const scale = img ? (frame / short) * zoom : 1;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-5"
      style={{ background: "rgba(30,20,10,.72)", backdropFilter: "blur(6px)" }}
      role="dialog"
      aria-modal="true"
      aria-label="Choose the square for your puzzle"
    >
      <div
        className="w-full max-w-md rounded-2xl p-6"
        style={{ background: "var(--paper)", border: "1px solid rgba(58,42,24,.18)" }}
      >
        <h2
          className="m-0"
          style={{ fontFamily: "var(--font-fraunces), serif", fontWeight: 500, fontSize: 21, color: "var(--ink)" }}
        >
          Which square?
        </h2>
        <p className="m-0 mt-1.5" style={{ fontSize: 13, lineHeight: 1.6, color: "var(--ink-muted)" }}>
          The puzzle is square, so pick the part that matters. Drag to move it, and
          zoom if you want to come in closer.
        </p>

        <div
          ref={frameRef}
          className="relative mt-5 w-full cursor-grab overflow-hidden rounded-lg active:cursor-grabbing"
          style={{ aspectRatio: "1", background: "#2c2016", touchAction: "none" }}
          onPointerDown={(e) => {
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
            drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
          }}
          onPointerMove={(e) => {
            const d = drag.current;
            if (!d) return;
            setOffset(clamp({ x: d.ox + (e.clientX - d.x), y: d.oy + (e.clientY - d.y) }, zoom));
          }}
          onPointerUp={() => {
            drag.current = null;
          }}
        >
          {img && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={img.src}
              alt=""
              draggable={false}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: img.width * scale,
                height: img.height * scale,
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                maxWidth: "none",
              }}
            />
          )}

          {/* the thirds, so it can be composed rather than guessed at */}
          <span aria-hidden className="pointer-events-none absolute inset-0">
            {[33.33, 66.66].map((p) => (
              <span key={`v${p}`} className="absolute top-0 h-full" style={{ left: `${p}%`, width: 1, background: "rgba(255,255,255,.28)" }} />
            ))}
            {[33.33, 66.66].map((p) => (
              <span key={`h${p}`} className="absolute left-0 w-full" style={{ top: `${p}%`, height: 1, background: "rgba(255,255,255,.28)" }} />
            ))}
            <span className="absolute inset-0" style={{ boxShadow: "inset 0 0 0 2px rgba(255,255,255,.6)" }} />
          </span>
        </div>

        <label className="mt-4 block">
          <span
            style={{
              fontFamily: "var(--font-ibm-plex-mono), monospace",
              fontSize: 9,
              letterSpacing: ".16em",
              textTransform: "uppercase",
              color: "var(--label-on-paper)",
            }}
          >
            Zoom
          </span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoomClamped(Number(e.target.value))}
            className="mt-1.5 w-full cursor-pointer"
            style={{ accentColor: "var(--rust)" }}
            aria-label="Zoom"
          />
        </label>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={cut}
            disabled={!img || busy}
            className="cursor-pointer rounded-full border-0 px-6 py-2.5 text-[13.5px] font-medium disabled:opacity-50"
            style={{ background: "var(--brass)", color: "var(--on-dark)" }}
          >
            {busy ? "Cutting…" : "Use this square"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-full border bg-transparent px-5 py-2.5 text-[13.5px]"
            style={{ borderColor: "rgba(58,42,24,.24)", color: "var(--ink-muted)" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
