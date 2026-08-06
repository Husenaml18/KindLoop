"use client";

/**
 * Scene Engine — ambience.
 *
 * The air in the room. None of these draw attention to themselves; they exist so
 * a scene is never perfectly still, which is the difference between a screen and
 * a place. Every layer takes its colour from the caller, so the same dust that
 * hangs in a sunbeam over a wooden desk becomes snow on a midnight wall.
 *
 * All of them are `pointer-events-none`, `aria-hidden`, and vanish entirely under
 * reduced motion.
 */

import { motion, useReducedMotion } from "framer-motion";
import { useScatter } from "./index";

const LAYER = "pointer-events-none absolute inset-0 overflow-hidden";

/** Slow, warm specks turning over in a shaft of light. */
export function DustMotes({
  count = 26,
  color = "#fff6e2",
  seed = "dust",
  opacity = 0.42,
}: {
  count?: number;
  color?: string;
  seed?: string;
  opacity?: number;
}) {
  const reduced = useReducedMotion();
  const specks = useScatter(count, seed);
  if (reduced) return null;
  return (
    <div aria-hidden className={LAYER}>
      {specks.map((s, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size * 2.4, height: s.size * 2.4, background: color, opacity }}
          animate={{
            y: [0, -26 - s.size * 8, 0],
            x: [0, s.drift, 0],
            opacity: [opacity * 0.3, opacity, opacity * 0.3],
          }}
          transition={{ duration: 14 + s.delay * 2.4, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/** Stars that breathe. `dim` pulls them back when something in front needs attention. */
export function Starfield({
  count = 24,
  color = "#fff0c8",
  seed = "stars",
  dim = false,
}: {
  count?: number;
  color?: string;
  seed?: string;
  dim?: boolean;
}) {
  const reduced = useReducedMotion();
  const specks = useScatter(count, seed);
  return (
    <div aria-hidden className={LAYER}>
      {specks.map((s, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{ left: `${s.x}%`, top: `${s.y * 0.68}%`, width: s.size * 1.8, height: s.size * 1.8, background: color }}
          animate={reduced ? { opacity: dim ? 0.12 : 0.42 } : { opacity: dim ? [0.05, 0.16, 0.05] : [0.2, 0.74, 0.2] }}
          transition={{ duration: 3.4 + s.delay, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/** Anything that falls: snow, petals, ash, confetti at rest. */
export function Drift({
  count = 14,
  color = "#ffffff",
  seed = "drift",
  glyph,
  opacity = 0.3,
  speed = 22,
}: {
  count?: number;
  color?: string;
  seed?: string;
  /** A character instead of a dot — "❄", "🌸", "✦". */
  glyph?: string;
  opacity?: number;
  speed?: number;
}) {
  const reduced = useReducedMotion();
  const specks = useScatter(count, seed);
  if (reduced) return null;
  return (
    <div aria-hidden className={LAYER}>
      {specks.map((s, i) => (
        <motion.span
          key={i}
          className="absolute"
          style={
            glyph
              ? { left: `${s.x}%`, fontSize: 8 + s.size * 5, color, opacity, lineHeight: 1 }
              : { left: `${s.x}%`, width: s.size * 2, height: s.size * 2, borderRadius: "50%", background: color, opacity }
          }
          initial={{ top: "-6%" }}
          animate={{ top: "106%", x: [0, s.drift, 0], rotate: glyph ? [0, s.drift * 4] : 0 }}
          transition={{
            duration: speed + s.delay * 3,
            repeat: Infinity,
            delay: s.delay * 2,
            ease: "linear",
            x: { duration: 9 + s.delay, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          {glyph}
        </motion.span>
      ))}
    </div>
  );
}

/** Fireflies — the same idea as dust, but they wander and blink. */
export function Fireflies({ count = 9, color = "#ffe9a8", seed = "flies" }: { count?: number; color?: string; seed?: string }) {
  const reduced = useReducedMotion();
  const specks = useScatter(count, seed);
  if (reduced) return null;
  return (
    <div aria-hidden className={LAYER}>
      {specks.map((s, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: 4 + s.size,
            height: 4 + s.size,
            background: color,
            boxShadow: `0 0 ${8 + s.size * 5}px ${color}`,
          }}
          animate={{
            x: [0, s.drift, -s.drift * 0.6, 0],
            y: [0, -s.drift * 0.8, s.drift * 0.5, 0],
            opacity: [0, 0.9, 0.15, 0.8, 0],
          }}
          transition={{ duration: 11 + s.delay * 2, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/**
 * A shaft of light across the scene. This is what makes a wooden desk read as
 * *afternoon* rather than as a brown rectangle.
 */
export function Sunbeam({
  color = "rgba(255,236,190,.22)",
  angle = -18,
  width = "46%",
  from = "18%",
}: {
  color?: string;
  angle?: number;
  width?: string;
  from?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <div aria-hidden className={LAYER}>
      <motion.span
        className="absolute -top-1/4 h-[150%]"
        style={{
          left: from,
          width,
          background: `linear-gradient(to bottom, ${color}, transparent 78%)`,
          transform: `rotate(${angle}deg)`,
          filter: "blur(22px)",
        }}
        animate={reduced ? undefined : { opacity: [0.72, 1, 0.72] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/** Warmth pooling under whatever the scene is about. */
export function Glow({ color, at = "50% 45%", size = "62% 46%" }: { color: string; at?: string; size?: string }) {
  return (
    <div
      aria-hidden
      className={LAYER}
      style={{ background: `radial-gradient(ellipse ${size} at ${at}, ${color}, transparent 70%)` }}
    />
  );
}

/**
 * A single bloom of light, for the moment something is finally revealed.
 * Plays once and stays — the reveal should not pulse at you.
 */
export function Bloom({ color, play }: { color: string; play: boolean }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      className={LAYER}
      style={{ background: `radial-gradient(circle at 50% 50%, ${color}, transparent 62%)` }}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={play ? { opacity: reduced ? 0.5 : [0, 1, 0.55], scale: 1.1 } : { opacity: 0, scale: 0.7 }}
      transition={{ duration: reduced ? 0.3 : 2.6, ease: "easeOut" }}
    />
  );
}

/** Paper grain, film grain, canvas weave. Cheap, and it does a lot. */
export const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/></filter><rect width='160' height='160' filter='url(%23g)' opacity='.34'/></svg>\")";

export function Grain({ opacity = 0.05, blend = "overlay" }: { opacity?: number; blend?: string }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ backgroundImage: GRAIN, opacity, mixBlendMode: blend as React.CSSProperties["mixBlendMode"] }}
    />
  );
}
