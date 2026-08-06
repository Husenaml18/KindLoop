"use client";

/**
 * Envelope Engine — the opening.
 *
 * One canonical envelope, opened the way the landing-page hero opens one:
 * the wax shimmers, a crack is drawn across it, five fragments spin away, the
 * envelope lifts, and the flap folds back to −150° while dropping behind the
 * body — so it reads as *hinged paper*, never as a severed piece flying off.
 * Getting this wrong was the single most-reported flaw in the experience, so it
 * lives in exactly one place now and every experience shares the fix.
 */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FIBRE } from "@/lib/engines/paper/stock";
import {
  ENVELOPES,
  SEAL_COLORS,
  type EnvelopeId,
  type SealColorId,
  type SealIconId,
} from "./stock";

/* ------------------------------------------------------------------ */
/* Wax seal                                                            */
/* ------------------------------------------------------------------ */

function SealGlyph({ icon, monogram, color }: { icon: SealIconId; monogram: string; color: string }) {
  const stroke = { fill: "none", stroke: color, strokeWidth: 2.2, strokeLinecap: "round" as const };
  switch (icon) {
    case "heart":
      return (
        <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden>
          <path d="M20 31 C 8 22, 9 12, 15 12 C 18 12, 20 15.5, 20 17 C 20 15.5, 22 12, 25 12 C 31 12, 32 22, 20 31 Z" fill={color} />
        </svg>
      );
    case "rose":
      return (
        <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden>
          <circle cx="20" cy="18" r="4" {...stroke} />
          <path d="M20 8 C 28 10, 30 20, 20 28 C 10 20, 12 10, 20 8 Z" {...stroke} />
          <path d="M20 28 L20 34" {...stroke} />
        </svg>
      );
    case "infinity":
      return (
        <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden>
          <path d="M12 20 C 12 14, 20 14, 20 20 C 20 26, 28 26, 28 20 C 28 14, 20 14, 20 20 C 20 26, 12 26, 12 20 Z" {...stroke} />
        </svg>
      );
    case "star":
      return (
        <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden>
          <path d="M20 8 L23.4 16.6 L32.5 17.2 L25.6 23.1 L27.8 32 L20 27.1 L12.2 32 L14.4 23.1 L7.5 17.2 L16.6 16.6 Z" fill={color} />
        </svg>
      );
    case "flower":
      return (
        <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="20" cy="12" rx="4.4" ry="7.6" fill={color} transform={`rotate(${a} 20 20)`} />
          ))}
          <circle cx="20" cy="20" r="3.2" fill={color} opacity="0.55" />
        </svg>
      );
    case "tree":
      return (
        <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden>
          <path d="M20 32 L20 20" {...stroke} />
          <path d="M20 20 C 12 18, 10 10, 20 7 C 30 10, 28 18, 20 20 Z" {...stroke} />
          <path d="M20 25 L14 21 M20 25 L26 21" {...stroke} />
        </svg>
      );
    case "initials":
    case "monogram":
    default:
      return (
        <span
          style={{
            fontFamily: "var(--hw-calligraphy), cursive",
            fontSize: "1.35em",
            lineHeight: 1,
            color,
            letterSpacing: ".02em",
          }}
        >
          {(monogram || "❦").slice(0, 3)}
        </span>
      );
  }
}

/**
 * The wax seal. Used twice: holding the envelope shut, and — when a voice note
 * exists — pressed onto the page as the thing you click to hear them.
 */
export function WaxSeal({
  colorId,
  icon,
  monogram,
  size = 78,
  cracked = false,
  glowOnHover = false,
  onClick,
  ariaLabel,
  playing = false,
  shimmer = false,
}: {
  colorId: SealColorId;
  icon: SealIconId;
  monogram: string;
  size?: number;
  cracked?: boolean;
  glowOnHover?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
  playing?: boolean;
  /** The light sweeping across the wax just before it gives. */
  shimmer?: boolean;
}) {
  const reduced = useReducedMotion();
  const c = SEAL_COLORS[colorId];
  const interactive = Boolean(onClick);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={!interactive}
      aria-label={ariaLabel}
      className="relative rounded-full border-0 p-0"
      style={{
        width: size,
        height: size,
        cursor: interactive ? "pointer" : "default",
        background: `radial-gradient(circle at 34% 28%, ${c.light}, ${c.base} 52%, ${c.deep} 100%)`,
        boxShadow: `inset -2px -3px 7px rgba(0,0,0,.42), inset 2px 3px 6px rgba(255,255,255,.28), 0 5px 13px rgba(30,18,8,.45)`,
        /* wax spreads unevenly where it was pressed */
        borderRadius: "48% 52% 51% 49% / 50% 48% 52% 50%",
      }}
      whileHover={glowOnHover && !reduced ? { scale: 1.05, boxShadow: `inset -2px -3px 7px rgba(0,0,0,.42), 0 0 26px ${c.base}` } : undefined}
      whileTap={interactive ? { scale: 0.95 } : undefined}
      animate={
        playing && !reduced
          ? { boxShadow: [`0 0 0 0 ${c.base}88`, `0 0 0 18px ${c.base}00`] }
          : undefined
      }
      transition={playing ? { duration: 1.8, repeat: Infinity } : { duration: 0.3 }}
    >
      <span className="absolute inset-[22%] flex items-center justify-center">
        <SealGlyph icon={icon} monogram={monogram} color={c.on} />
      </span>

      {/* light travelling over the wax, the tell that it's about to break */}
      <span aria-hidden className="absolute inset-0 overflow-hidden" style={{ borderRadius: "inherit" }}>
        <motion.span
          className="absolute inset-0"
          style={{
            background: "linear-gradient(72deg, transparent 38%, rgba(255,245,214,.7) 50%, transparent 62%)",
          }}
          animate={shimmer && !reduced ? { x: ["-130%", "130%"] } : { x: "-130%" }}
          transition={shimmer && !reduced ? { duration: 1.05, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
        />
      </span>

      {/* the crack that appears as it gives way */}
      <AnimatePresence>
        {cracked && (
          <motion.svg
            viewBox="0 0 80 80"
            className="absolute inset-0 h-full w-full"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.path
              d="M22 24 L38 40 L31 54 L54 62"
              fill="none"
              stroke="rgba(0,0,0,.6)"
              strokeWidth="2.4"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/* Envelope                                                            */
/* ------------------------------------------------------------------ */

/** Mirrors the landing-page hero's opening beats. */
export type EnvelopePhase = "closed" | "shimmer" | "cracking" | "breaking" | "opening" | "empty";

/**
 * How long the flap takes to hinge over, in ms, and how long to leave it there
 * before moving on.
 *
 * Exported because every caller needs to know. All three of them used to switch
 * away from the envelope ~1.4s after reaching `opening`, while the flap took 1.5s
 * to turn — so the turn was always cut off partway and the envelope faded out
 * mid-swing. It read as an envelope that never quite opened, which is exactly
 * what it was. Deriving the caller's next beat from these constants keeps the two
 * from drifting apart again.
 */
export const ENVELOPE_FLAP_MS = 1350;
/** A beat to see the light before the letter takes over. */
export const ENVELOPE_SETTLE_MS = 420;
/** From `opening` to "the envelope has finished doing its thing". */
export const ENVELOPE_OPEN_MS = ENVELOPE_FLAP_MS + ENVELOPE_SETTLE_MS;

/** Wax fragments that spin away as the seal gives. */
const FRAGMENTS = [
  { x: -30, y: 14, r: -52, s: 8 },
  { x: 26, y: 20, r: 66, s: 7 },
  { x: -16, y: 34, r: 26, s: 6 },
  { x: 34, y: -8, r: -34, s: 6.5 },
  { x: 3, y: 38, r: 84, s: 5 },
];

export function Envelope({
  envelopeId,
  sealColor,
  sealIcon,
  monogram,
  recipient,
  phase,
  onOpen,
}: {
  envelopeId: EnvelopeId;
  sealColor: SealColorId;
  sealIcon: SealIconId;
  monogram: string;
  recipient: string;
  phase: EnvelopePhase;
  /**
   * Omit when the opening is a cutscene the caller drives on a timer rather than
   * something the person clicks. Without it the seal is not a button and the
   * envelope has no hit area, so nothing on screen claims to be interactive when
   * it isn't — which is exactly what Open When was doing with a no-op handler.
   */
  onOpen?: () => void;
}) {
  const reduced = useReducedMotion();
  const e = ENVELOPES[envelopeId];
  const c = SEAL_COLORS[sealColor];
  const open = phase === "opening" || phase === "empty";
  /* The seal is gone from the moment it breaks — before the flap even moves. */
  const sealGone = phase === "breaking" || open;
  const lifted = sealGone;

  return (
    <div className="relative" style={{ width: "min(520px, 88vw)", aspectRatio: "3 / 2", perspective: 1400 }}>
      {/* warm light escaping once the flap is up */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute rounded-full"
        style={{
          inset: "-32%",
          filter: "blur(30px)",
          background: `radial-gradient(circle, ${c.base}5c, ${c.light}22 46%, transparent 72%)`,
        }}
        animate={{ opacity: open ? 1 : 0, scale: open ? 1 : 0.65 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      />
      {/* the shaft rising out of the mouth */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          left: "50%",
          bottom: "42%",
          width: "62%",
          height: "150%",
          marginLeft: "-31%",
          transformOrigin: "50% 100%",
          filter: "blur(16px)",
          clipPath: "polygon(38% 100%, 62% 100%, 96% 0%, 4% 0%)",
          background: `linear-gradient(to top, ${c.base}55, transparent 78%)`,
        }}
        animate={{ opacity: open ? 0.5 : 0, scaleY: open ? 1 : 0.4 }}
        transition={{ duration: 1.6, ease: "easeOut" }}
      />

      {/* body */}
      <motion.div
        className="absolute inset-0 overflow-hidden rounded-[4px]"
        style={{ background: e.body, border: `1px solid ${e.border}`, boxShadow: "0 30px 60px -26px rgba(40,26,12,.6)", zIndex: 2 }}
        animate={reduced ? undefined : { y: lifted ? -7 : 0 }}
        transition={{ duration: 1.1, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <span aria-hidden className="absolute inset-0 opacity-30" style={{ backgroundImage: FIBRE, mixBlendMode: "multiply" }} />
        {/* the two folded side panels */}
        <span
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `linear-gradient(112deg, rgba(0,0,0,.055) 0 49.6%, transparent 49.6%), linear-gradient(248deg, rgba(0,0,0,.055) 0 49.6%, transparent 49.6%)`,
          }}
        />
        {/* the name, written on the front */}
        <div className="absolute inset-x-[14%] top-[54%] text-center">
          <div
            style={{
              fontFamily: "var(--hw-elegant), cursive",
              fontSize: "clamp(19px,3.4vw,30px)",
              color: e.addressInk,
              lineHeight: 1.2,
            }}
          >
            {recipient}
          </div>
          <div
            aria-hidden
            className="mx-auto mt-2"
            style={{ width: "42%", height: 1, background: `${e.addressInk}44` }}
          />
        </div>
      </motion.div>

      {/*
        The flap, hinged along its top edge.

        Structurally identical to the landing-page hero's, which is the version
        that reads correctly, and deliberately simpler than what was here before.
        The earlier one had two faces flipped against each other with
        `backface-visibility`, plus an *animated* z-index meant to drop the flap
        behind the body as it passed upright. Both were mistakes: the clip-path on
        the child faces flattened them out of the parent's 3D context, so the
        turn-over never resolved cleanly, and a z-index animated with a zero
        duration lands at an unpredictable frame — between them the flap read as a
        loose triangle rather than hinged paper.

        So: one element, the clip-path on the *same* element that carries the
        rotation, a static stacking order, and the underside painted as a tint
        that fades in as the paper turns over.
      */}
      <motion.div
        className="absolute left-0 top-0 w-full"
        style={{
          height: "56%",
          transformOrigin: "50% 0%",
          transformStyle: "preserve-3d",
          pointerEvents: "none",
          /* Above the body always, as in the hero. The cast shadow below, and the
             fact that the flap swings up and away, are what sell the depth. */
          zIndex: 6,
          clipPath: "polygon(0 0, 100% 0, 50% 100%)",
          background: e.flap,
          borderTop: `1px solid ${e.border}`,
          boxShadow: "0 3px 9px rgba(30,20,12,.18)",
        }}
        animate={{ rotateX: open ? (reduced ? 0 : -158) : 0 }}
        transition={{ duration: reduced ? 0.25 : ENVELOPE_FLAP_MS / 1000, ease: [0.22, 0.9, 0.24, 1] }}
      >
        {/* the underside, catching the light as it turns over */}
        <motion.span
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, rgba(255,240,210,.2), transparent 40%), ${e.lining}`,
            boxShadow: "inset 0 2px 10px rgba(0,0,0,.45)",
          }}
          initial={{ opacity: 0 }}
          /* Held back until the paper has passed upright, so you never see the
             lining while the outside face is still toward you. */
          animate={{ opacity: open ? 1 : 0 }}
          transition={{ duration: reduced ? 0.2 : 0.5, delay: open && !reduced ? ENVELOPE_FLAP_MS * 0.42 / 1000 : 0 }}
        />
      </motion.div>

      {/* the shadow the standing flap casts back onto the envelope */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{
          height: "30%",
          zIndex: 3,
          background: "linear-gradient(to bottom, rgba(30,18,8,.4), transparent)",
        }}
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: 1.2, delay: open ? 0.5 : 0 }}
      />

      {/* seal, holding it shut */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{ top: "48%", zIndex: 8 }}
      >
        <AnimatePresence>
          {!sealGone && (
            <motion.div
              key="seal"
              exit={reduced ? { opacity: 0 } : { scale: 0.5, opacity: 0, y: 12, rotate: -18 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <WaxSeal
                colorId={sealColor}
                icon={sealIcon}
                monogram={monogram}
                size={82}
                shimmer={phase === "shimmer" || phase === "cracking"}
                cracked={phase === "cracking"}
                glowOnHover
                onClick={phase === "closed" && onOpen ? onOpen : undefined}
                ariaLabel="Open the letter"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* wax breaking apart */}
        {!reduced &&
          FRAGMENTS.map((f, i) => (
            <motion.span
              key={i}
              aria-hidden
              className="absolute rounded-[1.5px]"
              style={{
                left: "50%",
                top: "50%",
                width: f.s,
                height: f.s * 0.82,
                marginLeft: -f.s / 2,
                background: `linear-gradient(140deg, ${c.light}, ${c.deep})`,
              }}
              initial={false}
              /* Visible only while in flight. Both branches used to end at
                 opacity 0, which meant the wax never actually broke apart on
                 screen — the whole flourish was invisible. */
              animate={
                sealGone
                  ? { x: f.x, y: f.y, rotate: f.r, opacity: [1, 1, 0] }
                  : { x: 0, y: 0, rotate: 0, opacity: 0 }
              }
              transition={{
                duration: 1.5,
                ease: "easeOut",
                delay: i * 0.045,
                opacity: { duration: 1.5, times: [0, 0.55, 1], delay: i * 0.045 },
              }}
            />
          ))}
      </div>

      {/* the whole envelope is a hit area, so you needn't find the seal exactly */}
      {phase === "closed" && onOpen && (
        <button
          type="button"
          onClick={onOpen}
          aria-label={`Open the letter for ${recipient || "you"}`}
          className="absolute inset-0 cursor-pointer border-0 bg-transparent"
          style={{ zIndex: 7 }}
        />
      )}
    </div>
  );
}
