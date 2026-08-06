"use client";

/**
 * Paper Engine — surfaces.
 *
 * Sheets, folds, creases and torn edges. The important one is `Fold`: paper in
 * Kindloop hinges, it never slides or flies. That single rule is why a letter
 * unfolding, a calendar door opening and a puzzle note lifting all feel like the
 * same material.
 */

import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { FIBRE } from "./stock";

/** A sheet of paper. Texture, ageing and a soft cast shadow. */
export function Sheet({
  color,
  children,
  className = "",
  style,
  aged = 0,
  fibre = true,
  radius = 2,
  lift = 1,
}: {
  color: string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** 0..1 — how much the edges have browned. */
  aged?: number;
  fibre?: boolean;
  radius?: number;
  /** 0..2 — how far off the surface it sits. */
  lift?: number;
}) {
  return (
    <div
      className={`relative ${className}`}
      style={{
        background: color,
        borderRadius: radius,
        boxShadow: `0 ${10 * lift}px ${30 * lift}px -${12 * lift}px rgba(28,20,12,${0.28 * lift}), 0 1px 0 rgba(255,255,255,.4) inset`,
        ...style,
      }}
    >
      {fibre && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: FIBRE, opacity: 0.5, borderRadius: radius }}
        />
      )}
      {aged > 0 && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            borderRadius: radius,
            background: `radial-gradient(ellipse 120% 100% at 50% 50%, transparent 52%, rgba(122,84,42,${0.3 * aged}))`,
          }}
        />
      )}
      {children}
    </div>
  );
}

/**
 * Paper opening.
 *
 * It hinges from one edge — never a translate. An earlier version slid the sheet
 * in from below and it read as a piece flying out of a torn envelope, which was
 * the single worst thing anyone said about the product. So: `rotateX` from a
 * flattened `scaleY`, hinged at the named edge, and nothing else.
 */
export function Fold({
  open,
  from = "top",
  children,
  duration = 1,
  className = "",
  style,
}: {
  open: boolean;
  from?: "top" | "bottom" | "left" | "right";
  children: ReactNode;
  duration?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const reduced = useReducedMotion();
  const vertical = from === "top" || from === "bottom";
  const origin = from === "top" ? "50% 0%" : from === "bottom" ? "50% 100%" : from === "left" ? "0% 50%" : "100% 50%";
  const sign = from === "top" || from === "left" ? -1 : 1;

  const shut = vertical
    ? { rotateX: sign * 86, scaleY: 0.26, opacity: 0 }
    : { rotateY: sign * 86, scaleX: 0.26, opacity: 0 };
  const flat = vertical ? { rotateX: 0, scaleY: 1, opacity: 1 } : { rotateY: 0, scaleX: 1, opacity: 1 };

  return (
    <motion.div
      className={className}
      style={{ transformOrigin: origin, transformStyle: "preserve-3d", ...style }}
      initial={reduced ? { opacity: 0 } : shut}
      animate={reduced ? { opacity: open ? 1 : 0 } : open ? flat : shut}
      transition={{ duration: reduced ? 0.2 : duration, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * A hinged flap — an envelope's, a card's, a calendar door's.
 *
 * It stops at −150° rather than −180° and drops behind the body partway through,
 * with a lit lining and a cast shadow, so it reads as folded back against the
 * paper instead of a severed piece rotating in space.
 */
export function Flap({
  open,
  children,
  lining,
  duration = 1.05,
  className = "",
  style,
}: {
  open: boolean;
  children?: ReactNode;
  /** The inside face, which catches light as it turns over. */
  lining?: string;
  duration?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      style={{ transformOrigin: "50% 0%", transformStyle: "preserve-3d", ...style }}
      animate={
        open
          ? { rotateX: -150, zIndex: [3, 3, 0, 0] }
          : { rotateX: 0, zIndex: 3 }
      }
      transition={{
        duration: reduced ? 0.2 : duration,
        ease: [0.34, 0.03, 0.22, 1],
        /* The z-index swap lands at 0.42s — the moment the flap passes the
           vertical and should start going *behind* the paper. */
        zIndex: { duration: reduced ? 0.2 : duration, times: [0, 0.4, 0.42, 1] },
      }}
    >
      {lining && (
        <span
          aria-hidden
          className="absolute inset-0"
          style={{ background: lining, backfaceVisibility: "hidden", transform: "rotateX(180deg)" }}
        />
      )}
      {children}
    </motion.div>
  );
}

/** A crease that runs across a sheet, where it was folded to fit an envelope. */
export function Crease({ at = "50%", horizontal = true, strength = 0.1 }: { at?: string; horizontal?: boolean; strength?: number }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute"
      style={
        horizontal
          ? { left: 0, right: 0, top: at, height: 1, background: `rgba(90,64,34,${strength})`, boxShadow: `0 1px 2px rgba(255,255,255,.5)` }
          : { top: 0, bottom: 0, left: at, width: 1, background: `rgba(90,64,34,${strength})`, boxShadow: `1px 0 2px rgba(255,255,255,.5)` }
      }
    />
  );
}

/** A deckled or torn edge, drawn rather than imaged so it scales. */
export function TornEdge({
  side = "bottom",
  color,
  height = 9,
  seed = "tear",
}: {
  side?: "top" | "bottom";
  color: string;
  height?: number;
  seed?: string;
}) {
  /* Deterministic teeth — a random edge would differ between server and client. */
  const teeth = 22;
  const points = Array.from({ length: teeth + 1 }, (_, i) => {
    let h = 2166136261;
    const key = `${seed}${i}`;
    for (let k = 0; k < key.length; k += 1) {
      h ^= key.charCodeAt(k);
      h = Math.imul(h, 16777619);
    }
    const j = ((h >>> 0) % 1000) / 1000;
    return `${(i / teeth) * 100},${side === "bottom" ? 100 - j * 62 : j * 62}`;
  }).join(" ");

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute left-0 w-full"
      style={{ [side]: -1, height } as CSSProperties}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <polygon points={side === "bottom" ? `0,100 ${points} 100,100` : `0,0 ${points} 100,0`} fill={color} />
    </svg>
  );
}
