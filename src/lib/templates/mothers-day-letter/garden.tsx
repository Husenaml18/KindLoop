"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { GARDEN } from "./theme";

/**
 * The Growing Garden.
 *
 * Watercolour flowers and vines that bloom up the margins of the letter as it is
 * read. At the start the stationery is nearly bare; by the last paragraph the
 * border is in full flower — one bloom for every thank-you, lesson and photograph
 * in the letter, so what ends up growing round the page is literally made of what
 * she gave them.
 *
 * It has to stay out of the way, so: nothing here is ever in front of the words,
 * every stem draws itself slowly rather than popping in, and the whole thing is a
 * still, open border under reduced motion rather than a sequence.
 */

interface Sprig {
  /** Which side it grows from. */
  side: "left" | "right";
  /** Where along the page, as a percentage. */
  at: number;
  /** How far into the margin it reaches, 0..1. */
  reach: number;
  /** Bloom colour, from the garden palette. */
  bloom: string;
  /** Number of flowers on this stem. */
  flowers: number;
  /** Lean, degrees. */
  lean: number;
  /** How big. */
  scale: number;
}

/** Deterministic — the same letter must grow the same garden every time. */
function seeded(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i += 1) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

function layOutGarden(count: number, seed: string): Sprig[] {
  const blooms = [GARDEN.bloomA, GARDEN.bloomB, GARDEN.bloomC, GARDEN.bloomD];
  return Array.from({ length: count }, (_, i) => {
    const r = (k: string) => seeded(`${seed}-${k}-${i}`);
    /* Alternating sides, walking down the page, so the border fills evenly rather
       than clustering wherever the hash happens to land. */
    const side: Sprig["side"] = i % 2 === 0 ? "left" : "right";
    const band = Math.floor(i / 2);
    const bands = Math.max(1, Math.ceil(count / 2));
    return {
      side,
      at: 6 + (band / bands) * 84 + r("y") * 8,
      reach: 0.55 + r("r") * 0.45,
      bloom: blooms[Math.floor(r("b") * blooms.length) % blooms.length],
      flowers: 1 + Math.floor(r("f") * 3),
      lean: (r("l") - 0.5) * 26,
      scale: 0.72 + r("s") * 0.5,
    };
  });
}

/** One stem, with leaves and a flower or three at the top. */
function Stem({ sprig, index, open, delay }: { sprig: Sprig; index: number; open: boolean; delay: number }) {
  const reduced = useReducedMotion();
  const mirror = sprig.side === "right";

  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute"
      style={{
        [sprig.side]: "-2%",
        top: `${sprig.at}%`,
        width: `${34 * sprig.reach * sprig.scale}%`,
        transformOrigin: mirror ? "100% 100%" : "0% 100%",
        transform: `scaleX(${mirror ? -1 : 1}) rotate(${sprig.lean * (mirror ? -1 : 1)}deg)`,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: open ? 1 : 0 }}
      transition={{ duration: reduced ? 0.3 : 1.6, delay: reduced ? 0 : delay }}
    >
      <svg viewBox="0 0 100 60" className="h-auto w-full" style={{ overflow: "visible" }}>
        {/* the vine */}
        <motion.path
          d="M0 58 C 22 54, 38 42, 52 30 C 62 21, 74 14, 88 10"
          fill="none"
          stroke={GARDEN.stem}
          strokeWidth="1.6"
          strokeLinecap="round"
          initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
          animate={{ pathLength: open ? 1 : 0 }}
          transition={{ duration: reduced ? 0.3 : 2.4, delay: reduced ? 0 : delay, ease: "easeInOut" }}
        />
        {/* leaves along it */}
        {[0.28, 0.52, 0.74].map((t, li) => (
          <motion.ellipse
            key={t}
            cx={12 + t * 66}
            cy={54 - t * 40}
            rx="7"
            ry="3.4"
            fill={GARDEN.leaf}
            opacity="0.75"
            transform={`rotate(${-28 - li * 12} ${12 + t * 66} ${54 - t * 40})`}
            initial={reduced ? { scale: 1 } : { scale: 0 }}
            animate={{ scale: open ? 1 : 0 }}
            transition={{
              duration: reduced ? 0.3 : 0.9,
              delay: reduced ? 0 : delay + 0.7 + li * 0.22,
              ease: [0.2, 1.5, 0.4, 1],
            }}
            style={{ originX: `${12 + t * 66}px`, originY: `${54 - t * 40}px` }}
          />
        ))}
        {/* the flowers */}
        {Array.from({ length: sprig.flowers }).map((_, fi) => {
          const cx = 88 - fi * 15;
          const cy = 10 + fi * 11;
          return (
            <motion.g
              key={fi}
              initial={reduced ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
              animate={{ scale: open ? 1 : 0, opacity: open ? 1 : 0 }}
              transition={{
                duration: reduced ? 0.3 : 1.1,
                delay: reduced ? 0 : delay + 1.4 + fi * 0.28,
                ease: [0.2, 1.4, 0.4, 1],
              }}
              style={{ originX: `${cx}px`, originY: `${cy}px` }}
            >
              {/* petals, washed rather than outlined */}
              {[0, 72, 144, 216, 288].map((a) => (
                <ellipse
                  key={a}
                  cx={cx}
                  cy={cy - 5}
                  rx="3.4"
                  ry="5.6"
                  fill={sprig.bloom}
                  opacity="0.72"
                  transform={`rotate(${a + index * 7} ${cx} ${cy})`}
                />
              ))}
              <circle cx={cx} cy={cy} r="2.4" fill={GARDEN.centre} />
            </motion.g>
          );
        })}
      </svg>
    </motion.span>
  );
}

/**
 * The border. `progress` is how far through the letter they've read, 0..1; blooms
 * open in order as it climbs.
 */
export function GrowingGarden({
  count,
  open,
  seed,
}: {
  /** How many sprigs the finished border has. */
  count: number;
  /** How many of them are open. */
  open: number;
  seed: string;
}) {
  const sprigs = useMemo(() => layOutGarden(count, seed), [count, seed]);

  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 overflow-visible">
      {sprigs.map((s, i) => (
        <Stem key={i} sprig={s} index={i} open={i < open} delay={(i % 3) * 0.18} />
      ))}
    </span>
  );
}

/**
 * A petal coming loose at the very end. One, not a shower — the brief asked for a
 * single petal, and a single petal is sadder and better than confetti.
 */
export function FallingPetal({ colour, play }: { colour: string; play: boolean }) {
  const reduced = useReducedMotion();
  if (reduced || !play) return null;
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute"
      style={{ left: "52%", top: "12%", width: 14, height: 20 }}
      initial={{ opacity: 0, y: 0, rotate: 0 }}
      animate={{ opacity: [0, 1, 1, 0], y: 320, x: [0, 26, -14, 18], rotate: [0, 140, 260, 380] }}
      transition={{ duration: 6.5, ease: [0.4, 0, 0.6, 1], times: [0, 0.1, 0.8, 1] }}
    >
      <svg viewBox="0 0 14 20" className="h-full w-full">
        <path d="M7 0 C 13 6, 13 14, 7 20 C 1 14, 1 6, 7 0 Z" fill={colour} opacity="0.8" />
      </svg>
    </motion.span>
  );
}

/**
 * Butterflies that cross now and then. Rare on purpose: the brief said tiny
 * butterflies *occasionally*, and anything more often becomes a screensaver.
 */
export function Butterflies({ colour, seed }: { colour: string; seed: string }) {
  const reduced = useReducedMotion();
  const paths = useMemo(
    () =>
      Array.from({ length: 2 }, (_, i) => ({
        top: 18 + seeded(`${seed}bt${i}`) * 52,
        delay: 8 + i * 27,
        duration: 22 + seeded(`${seed}bd${i}`) * 12,
      })),
    [seed]
  );
  if (reduced) return null;

  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {paths.map((p, i) => (
        <motion.span
          key={i}
          className="absolute"
          style={{ top: `${p.top}%`, left: "-6%", width: 18, color: colour }}
          animate={{ left: "106%", y: [0, -34, 12, -22, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, repeatDelay: 34, delay: p.delay, ease: "linear" }}
        >
          <motion.svg
            viewBox="0 0 20 14"
            className="h-full w-full"
            animate={{ scaleX: [1, 0.42, 1] }}
            transition={{ duration: 0.42, repeat: Infinity, ease: "easeInOut" }}
          >
            <path d="M10 7 C 5 1, 0 2, 2 7 C 0 12, 5 13, 10 7 Z" fill="currentColor" opacity="0.62" />
            <path d="M10 7 C 15 1, 20 2, 18 7 C 20 12, 15 13, 10 7 Z" fill="currentColor" opacity="0.62" />
            <path d="M10 5 L10 10" stroke="currentColor" strokeWidth="1.1" opacity="0.8" />
          </motion.svg>
        </motion.span>
      ))}
    </span>
  );
}
