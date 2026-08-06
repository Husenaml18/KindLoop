"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Gift Engine — scratch foil.
 *
 * A layer of foil you rub off to find what's underneath. It belongs to this
 * engine because it *is* wrapping: the only difference between this and a sheet
 * of tissue paper is how you get it off.
 *
 * Coverage is a coarse grid of cells rather than a real pixel mask on a canvas.
 * A canvas mask would need a hidden 2D context, a composite operation per pointer
 * move and a pixel count to decide when it's done — for the same feeling, and
 * with no keyboard route through it. Cells give a satisfying reveal, cost almost
 * nothing, and can be cleared by pressing Enter.
 *
 * It reports upward when enough is gone; it never hides its own content, so the
 * caller decides what "done" unlocks.
 */
export function ScratchFoil({
  children,
  foil,
  foilSheen,
  label,
  hint,
  onRevealed,
  ratio = "12 / 5",
  cols = 6,
  rows = 4,
  threshold = 0.62,
}: {
  /** What's underneath. */
  children: React.ReactNode;
  foil: string;
  foilSheen: string;
  /** Describes the prize, for anyone who can't see it happen. */
  label: string;
  /** Optional replacement for the "scratch it off · 40%" line. */
  hint?: (state: { done: boolean; percent: number; reduced: boolean }) => string;
  onRevealed?: () => void;
  ratio?: string;
  cols?: number;
  rows?: number;
  threshold?: number;
}) {
  const reduced = useReducedMotion();
  const [cleared, setCleared] = useState<Set<number>>(new Set());
  const wrapRef = useRef<HTMLDivElement>(null);
  const firedRef = useRef(false);

  const total = cols * rows;
  const done = cleared.size >= total * threshold;
  const percent = Math.round((cleared.size / total) * 100);

  const clear = (next: Set<number>) => {
    setCleared(next);
    if (!firedRef.current && next.size >= total * threshold) {
      firedRef.current = true;
      onRevealed?.();
    }
  };

  const scrape = (e: React.PointerEvent) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = Math.floor(((e.clientX - rect.left) / rect.width) * cols);
    const cy = Math.floor(((e.clientY - rect.top) / rect.height) * rows);
    if (cx < 0 || cy < 0 || cx >= cols || cy >= rows) return;
    const key = cy * cols + cx;
    if (cleared.has(key)) return;
    clear(new Set(cleared).add(key));
  };

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div
        ref={wrapRef}
        onPointerMove={scrape}
        onPointerDown={scrape}
        role="button"
        tabIndex={0}
        aria-label={done ? `Revealed: ${label}` : `${label} — scratch to reveal`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            clear(new Set(Array.from({ length: total }, (_, i) => i)));
          }
        }}
        className="relative w-full cursor-pointer overflow-hidden rounded-[6px]"
        style={{ aspectRatio: ratio, background: "rgba(0,0,0,.35)", touchAction: "none" }}
      >
        <span className="absolute inset-0 flex items-center justify-center px-6 text-center">{children}</span>

        {/* the foil, cell by cell */}
        {Array.from({ length: total }).map((_, i) => (
          <motion.span
            key={i}
            aria-hidden
            className="absolute"
            style={{
              left: `${((i % cols) / cols) * 100}%`,
              top: `${(Math.floor(i / cols) / rows) * 100}%`,
              width: `${100 / cols}%`,
              height: `${100 / rows}%`,
              background: `linear-gradient(${135 + (i % 5) * 12}deg, ${foil}, ${foilSheen})`,
            }}
            animate={{ opacity: cleared.has(i) ? 0 : 1, scale: cleared.has(i) ? 0.7 : 1 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          />
        ))}
      </div>

      <span
        style={{
          fontFamily: "var(--font-ibm-plex-mono), monospace",
          fontSize: 9.5,
          letterSpacing: ".16em",
          textTransform: "uppercase",
          opacity: 0.7,
        }}
      >
        {hint
          ? hint({ done, percent, reduced: Boolean(reduced) })
          : done
            ? "there it is"
            : reduced
              ? "press enter to reveal"
              : `scratch it off · ${percent}%`}
      </span>
    </div>
  );
}
