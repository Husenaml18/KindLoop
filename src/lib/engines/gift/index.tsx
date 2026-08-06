"use client";

/**
 * Gift Engine.
 *
 * Boxes, wrapping, ribbons, lids and the moment a thing is revealed. Anything in
 * Kindloop that is *contained* draws on this: the keepsake box a puzzle comes out
 * of, the advent calendar's gift-box doors, the nested reveal boxes.
 *
 * The rule this engine enforces: a reveal is light and stillness, not confetti.
 * Confetti says "you won". These experiences are not games, so the default
 * celebration is a bloom of warmth and slow particles rising — `Confetti` exists
 * for the one or two places where being loud is the point.
 *
 * The materials themselves live in `./stock`, which has no client directive so
 * server-evaluated schemas can read them; they are re-exported here.
 */

import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { useScatter } from "../scene";
import type { BoxMaterial } from "./stock";

export * from "./stock";

/* ------------------------------------------------------------------ */
/* The box                                                             */
/* ------------------------------------------------------------------ */

/**
 * A lidded box. The lid lifts, tilts and rises out of frame; light comes up out
 * of the inside as it goes.
 */
export function LiddedBox({
  open,
  material,
  glow,
  width = "min(440px, 88%)",
  ratio = "4 / 3",
  lidLabel,
  children,
  onOpen,
}: {
  open: boolean;
  material: BoxMaterial;
  /** The colour of the light inside. */
  glow: string;
  width?: string;
  ratio?: string;
  /** Engraved or printed on the lid. */
  lidLabel?: ReactNode;
  /** What's inside, revealed as the lid goes. */
  children?: ReactNode;
  onOpen?: () => void;
}) {
  const reduced = useReducedMotion();

  return (
    <div className="relative mx-auto" style={{ width, perspective: 1100 }}>
      <div className="relative" style={{ aspectRatio: ratio, transformStyle: "preserve-3d" }}>
        {/* the inside */}
        <div
          className="absolute inset-0 overflow-hidden rounded-[5px]"
          style={{ background: material.inner, boxShadow: `inset 0 12px 34px rgba(0,0,0,.6)` }}
        >
          <motion.span
            aria-hidden
            className="absolute inset-0"
            style={{ background: `radial-gradient(ellipse 74% 60% at 50% 62%, ${glow}, transparent 72%)` }}
            animate={{ opacity: open ? 1 : 0 }}
            transition={{ duration: 1.4, delay: open ? 0.35 : 0 }}
          />
          <motion.div
            className="absolute inset-0 flex items-center justify-center p-5"
            animate={{ opacity: open ? 1 : 0, scale: open ? 1 : 0.94 }}
            transition={{ duration: 0.9, delay: open ? 0.55 : 0 }}
          >
            {children}
          </motion.div>
        </div>

        {/* the lid */}
        <motion.button
          type="button"
          onClick={onOpen}
          aria-label={open ? "The box is open" : "Open the box"}
          aria-expanded={open}
          className="absolute inset-0 cursor-pointer overflow-hidden rounded-[5px] border-0 p-0"
          style={{
            background: material.face,
            boxShadow: `0 22px 44px -18px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.14)`,
            border: `1px solid ${material.edge}`,
            transformOrigin: "50% 100%",
            transformStyle: "preserve-3d",
          }}
          animate={
            open
              ? { y: "-72%", rotateX: reduced ? 0 : 26, opacity: 0 }
              : { y: 0, rotateX: 0, opacity: 1 }
          }
          transition={{ duration: reduced ? 0.25 : 1.5, ease: [0.3, 0.05, 0.2, 1] }}
          whileHover={open || reduced ? undefined : { y: -6 }}
        >
          {lidLabel && (
            <span className="absolute inset-0 flex items-center justify-center px-6 text-center" style={{ color: material.on }}>
              {lidLabel}
            </span>
          )}
        </motion.button>
      </div>
    </div>
  );
}

/**
 * A ribbon crossing a box, with a bow that unties. The bow's loops shrink and the
 * tails fall away — the box can't open until this is done, so it's the first
 * thing anyone touches.
 */
export function Ribbon({
  untied,
  color,
  sheen,
  onUntie,
  width = 26,
}: {
  untied: boolean;
  color: string;
  sheen: string;
  onUntie?: () => void;
  width?: number;
}) {
  const reduced = useReducedMotion();
  const band: CSSProperties = {
    background: `linear-gradient(90deg, ${color}, ${sheen} 40%, ${color})`,
    boxShadow: "0 2px 6px rgba(0,0,0,.35)",
  };

  return (
    <div aria-hidden={!onUntie} className="pointer-events-none absolute inset-0 z-10">
      {/* vertical band */}
      <motion.span
        className="absolute top-0 h-full"
        style={{ left: `calc(50% - ${width / 2}px)`, width, ...band }}
        animate={untied ? { opacity: 0, y: 30, rotate: -4 } : { opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: reduced ? 0.2 : 1.1, ease: "easeInOut", delay: untied ? 0.32 : 0 }}
      />
      {/* horizontal band */}
      <motion.span
        className="absolute left-0 w-full"
        style={{ top: `calc(46% - ${width / 2}px)`, height: width, ...band }}
        animate={untied ? { opacity: 0, x: 26, rotate: 3 } : { opacity: 1, x: 0, rotate: 0 }}
        transition={{ duration: reduced ? 0.2 : 1.1, ease: "easeInOut", delay: untied ? 0.4 : 0 }}
      />
      {/* the bow */}
      <motion.button
        type="button"
        onClick={onUntie}
        disabled={untied || !onUntie}
        aria-label="Pull the ribbon"
        className={`absolute ${onUntie && !untied ? "pointer-events-auto cursor-pointer" : ""} border-0 bg-transparent p-0`}
        style={{ left: "50%", top: "46%", transform: "translate(-50%,-50%)", width: width * 3.4, height: width * 2.2 }}
        animate={untied ? { opacity: 0, scale: 0.5, rotate: -14 } : { opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: reduced ? 0.2 : 0.7, ease: "easeIn" }}
        whileHover={untied || reduced ? undefined : { scale: 1.07 }}
      >
        <svg viewBox="0 0 100 64" className="h-full w-full">
          <path d="M50 32 C 32 10, 6 14, 10 32 C 6 50, 32 54, 50 32 Z" fill={color} stroke={sheen} strokeWidth="1.4" />
          <path d="M50 32 C 68 10, 94 14, 90 32 C 94 50, 68 54, 50 32 Z" fill={color} stroke={sheen} strokeWidth="1.4" />
          <path d="M50 32 L38 62 M50 32 L62 62" stroke={color} strokeWidth="7" strokeLinecap="round" />
          <circle cx="50" cy="32" r="7.5" fill={sheen} />
        </svg>
      </motion.button>
    </div>
  );
}

/**
 * The celebration. Not confetti — slow particles rising through warm light, which
 * is what a moment someone prepared for you should feel like.
 */
export function SoftParticles({
  play,
  color,
  count = 22,
  seed = "reveal",
}: {
  play: boolean;
  color: string;
  count?: number;
  seed?: string;
}) {
  const reduced = useReducedMotion();
  const specks = useScatter(count, seed);
  if (reduced || !play) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {specks.map((s, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{ left: `${s.x}%`, bottom: "-4%", width: s.size * 2.6, height: s.size * 2.6, background: color }}
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, 0.85, 0], y: -260 - s.size * 60, x: s.drift }}
          transition={{ duration: 5.5 + s.delay, delay: s.delay * 0.5, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

/**
 * Confetti, for the one or two experiences where it genuinely belongs (a birthday
 * that is *supposed* to be loud). Kept out of the default reveal on purpose.
 */
export function Confetti({ play, colors, count = 40, seed = "confetti" }: { play: boolean; colors: string[]; count?: number; seed?: string }) {
  const reduced = useReducedMotion();
  const specks = useScatter(count, seed);
  if (reduced || !play) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {specks.map((s, i) => (
        <motion.span
          key={i}
          className="absolute"
          style={{
            left: `${s.x}%`,
            top: "-5%",
            width: 4 + s.size * 3,
            height: 8 + s.size * 5,
            background: colors[i % colors.length],
            borderRadius: 1,
          }}
          initial={{ opacity: 1, y: 0, rotate: 0 }}
          animate={{ opacity: [1, 1, 0], y: "108vh", rotate: s.drift * 12, x: s.drift }}
          transition={{ duration: 3.4 + s.delay * 0.8, delay: s.delay * 0.3, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

/** A gift tag on a string, for the note that comes attached rather than inside. */
export function GiftTag({
  children,
  color = "#e8dcc0",
  ink = "#3a3026",
  rotate = -6,
}: {
  children: ReactNode;
  color?: string;
  ink?: string;
  rotate?: number;
}) {
  return (
    <div className="relative inline-block" style={{ transform: `rotate(${rotate}deg)` }}>
      <div
        className="relative px-5 py-3.5"
        style={{
          background: color,
          color: ink,
          borderRadius: 3,
          clipPath: "polygon(14% 0, 100% 0, 100% 100%, 14% 100%, 0 50%)",
          boxShadow: "0 8px 18px -8px rgba(0,0,0,.5)",
        }}
      >
        {children}
      </div>
      <span
        aria-hidden
        className="absolute rounded-full"
        style={{ left: "7%", top: "50%", width: 5, height: 5, transform: "translateY(-50%)", background: "rgba(0,0,0,.35)" }}
      />
    </div>
  );
}
