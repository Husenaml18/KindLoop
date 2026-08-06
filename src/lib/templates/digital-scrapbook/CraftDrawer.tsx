"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ItemKind } from "./schema";
import type { PageTheme } from "./theme";

/**
 * The supply drawer.
 *
 * Deliberately not a toolbar: you pull open a wooden drawer, see the supplies
 * lying in felt-lined compartments, and drag one onto the page. Picking a piece
 * should feel like reaching for real tape, not clicking an icon.
 */

interface Supply {
  kind: ItemKind;
  label: string;
  glyph: string;
  /** Optional colour the piece is created with, so a drawer can hold 3 tapes. */
  color?: string;
}

interface Compartment {
  id: string;
  label: string;
  supplies: Supply[];
}

const COMPARTMENTS: Compartment[] = [
  {
    id: "tapes",
    label: "Washi tape",
    supplies: [
      { kind: "tape", label: "Kraft tape", glyph: "🎀", color: "rgba(206,168,116,.66)" },
      { kind: "tape", label: "Sage tape", glyph: "🎀", color: "rgba(160,186,120,.6)" },
      { kind: "tape", label: "Rose tape", glyph: "🎀", color: "rgba(226,158,168,.62)" },
      { kind: "ribbon", label: "Ribbon", glyph: "🎗" },
    ],
  },
  {
    id: "garden",
    label: "Pressed garden",
    supplies: [
      { kind: "flower", label: "Pressed flower", glyph: "🌸" },
      { kind: "flower", label: "Blue flower", glyph: "🌷", color: "#7b93b8" },
      { kind: "leaf", label: "Pressed leaf", glyph: "🍃" },
    ],
  },
  {
    id: "fasteners",
    label: "Fasteners",
    supplies: [
      { kind: "clip", label: "Paper clip", glyph: "📎" },
      { kind: "pin", label: "Push pin", glyph: "🧷" },
      { kind: "pin", label: "Blue pin", glyph: "🧷", color: "#42618c" },
    ],
  },
  {
    id: "paper",
    label: "Paper & tags",
    supplies: [
      { kind: "scrap", label: "Torn scrap", glyph: "📜" },
      { kind: "tag", label: "Gift tag", glyph: "🏷" },
      { kind: "sticky", label: "Sticky note", glyph: "🗒" },
      { kind: "stamp", label: "Vintage stamp", glyph: "🔖" },
    ],
  },
  {
    id: "pens",
    label: "Pens & doodles",
    supplies: [
      { kind: "doodle", label: "Doodle", glyph: "✎" },
      { kind: "note", label: "Handwriting", glyph: "✍" },
      { kind: "star", label: "Tiny star", glyph: "✦" },
      { kind: "stain", label: "Coffee ring", glyph: "☕" },
    ],
  },
];

const WOOD = "linear-gradient(168deg, #6f4d2e, #4d3320 72%)";
const FELT = "#3f4a3a";

export function CraftDrawer({
  theme,
  disabled,
  onPickUp,
}: {
  theme: PageTheme;
  disabled: boolean;
  /** Fired when a supply is lifted out — the editor tracks it to the drop point. */
  onPickUp: (kind: ItemKind, color: string | undefined, e: React.PointerEvent) => void;
}) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(true);

  const labelStyle: CSSProperties = {
    fontFamily: "var(--font-ibm-plex-mono), monospace",
    fontSize: 8.5,
    letterSpacing: ".18em",
    textTransform: "uppercase",
    color: "rgba(255,236,203,.5)",
  };

  return (
    <div className="relative select-none">
      {/* the drawer front you grab */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="craft-drawer-tray"
        className="relative w-full cursor-pointer overflow-hidden rounded-t-lg border-0 px-3 py-3"
        style={{ background: WOOD, boxShadow: "inset 0 1px 0 rgba(255,224,180,.18)" }}
      >
        <span
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "repeating-linear-gradient(93deg, rgba(0,0,0,.12) 0 2px, transparent 2px 17px)",
          }}
        />
        <span className="relative flex items-center justify-between gap-3">
          <span style={{ fontFamily: theme.handFont, fontSize: 15, color: "#ffe8c4" }}>
            Craft drawer
          </span>
          {/* brass pull */}
          <span
            aria-hidden
            className="rounded-full"
            style={{
              width: 44,
              height: 9,
              background: "linear-gradient(180deg,#e2b872,#8a6329)",
              boxShadow: "0 2px 4px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,245,214,.6)",
            }}
          />
        </span>
      </button>

      {/* the tray sliding out */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="craft-drawer-tray"
            initial={reduced ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reduced ? 0.15 : 0.5, ease: [0.22, 0.85, 0.24, 1] }}
            className="overflow-hidden rounded-b-lg"
            style={{ background: WOOD, boxShadow: "0 18px 30px -18px rgba(0,0,0,.7)" }}
          >
            <div className="flex flex-col gap-2.5 p-2.5">
              {COMPARTMENTS.map((c) => (
                <div
                  key={c.id}
                  className="rounded-md p-2"
                  style={{
                    background: FELT,
                    boxShadow: "inset 0 2px 6px rgba(0,0,0,.55)",
                  }}
                >
                  <span className="mb-1.5 block" style={labelStyle}>
                    {c.label}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {c.supplies.map((s, i) => (
                      <motion.button
                        key={`${c.id}-${i}`}
                        type="button"
                        disabled={disabled}
                        title={`${s.label} — drag onto the page`}
                        aria-label={`${s.label}. Drag onto the page, or press Enter to drop it in the middle.`}
                        onPointerDown={(e) => {
                          if (disabled) return;
                          onPickUp(s.kind, s.color, e);
                        }}
                        onKeyDown={(e) => {
                          if (disabled) return;
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onPickUp(s.kind, s.color, e as unknown as React.PointerEvent);
                          }
                        }}
                        className="flex cursor-grab items-center gap-1.5 rounded px-2 py-1.5 text-[10px] disabled:cursor-not-allowed disabled:opacity-40"
                        style={{
                          background: "rgba(255,236,203,.1)",
                          border: "1px solid rgba(255,236,203,.16)",
                          color: "rgba(255,236,203,.82)",
                          fontFamily: "var(--font-space-grotesk), sans-serif",
                        }}
                        whileHover={reduced || disabled ? undefined : { y: -2, rotate: i % 2 ? 2.5 : -2.5 }}
                        whileTap={{ scale: 0.94 }}
                      >
                        <span className="text-[13px]" style={s.color ? { color: s.color } : undefined}>
                          {s.glyph}
                        </span>
                        {s.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
              <p
                className="m-0 px-1 pb-0.5 text-[10px]"
                style={{ color: "rgba(255,236,203,.45)", fontFamily: "var(--font-space-grotesk), sans-serif" }}
              >
                Drag a supply onto the page, or press Enter to drop it in the middle.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** The supply following the cursor between drawer and page. */
export function DragGhost({
  glyph,
  x,
  y,
}: {
  glyph: string;
  x: number;
  y: number;
}) {
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none fixed z-[200] text-[26px]"
      style={{ left: x, top: y, translateX: "-50%", translateY: "-50%" }}
      initial={{ scale: 0.6, opacity: 0, rotate: -12 }}
      animate={{ scale: 1.15, opacity: 1, rotate: 6 }}
      transition={{ type: "spring", stiffness: 380, damping: 24 }}
    >
      <span style={{ filter: "drop-shadow(0 6px 10px rgba(20,12,4,.6))" }}>{glyph}</span>
    </motion.span>
  );
}
