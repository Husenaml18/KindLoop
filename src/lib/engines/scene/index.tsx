"use client";

/**
 * Scene Engine.
 *
 * Every Kindloop experience is a short film: it opens on something, it moves
 * through beats, it ends. This engine owns the *structure* of that — the beat
 * machine, the stage, the curtain between beats, the loading veil — and owns
 * none of the look. An experience supplies its own copy, palette, ambience and
 * timings, which is why two experiences built on this engine can be
 * unrecognisable as relatives.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/* ------------------------------------------------------------------ */
/* Beats                                                               */
/* ------------------------------------------------------------------ */

export interface Beat<K extends string = string> {
  id: K;
  /** How long it holds before advancing itself. Omit for beats that wait on the person. */
  hold?: number;
}

export interface SceneControls<K extends string> {
  /** The beat showing right now. */
  beat: K;
  index: number;
  /** How far through, 0..1 — useful for fading ambience in as a scene settles. */
  progress: number;
  isFirst: boolean;
  isLast: boolean;
  next: () => void;
  go: (id: K) => void;
  /** Jump to the end. Every intro must be skippable. */
  skip: () => void;
  restart: () => void;
}

/**
 * An ordered run of beats that advances itself.
 *
 * Under reduced motion the whole intro collapses to its final beat immediately —
 * people who asked not to be moved should not have to sit through a film to
 * reach the content.
 */
export function useScene<K extends string>(beats: readonly Beat<K>[], opts?: { autostart?: boolean }): SceneControls<K> {
  const reduced = useReducedMotion();
  const autostart = opts?.autostart ?? true;
  const last = Math.max(0, beats.length - 1);
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Reduced motion skips straight to the end, scheduled rather than set during
     render or synchronously in an effect. */
  useEffect(() => {
    if (!reduced || index === last) return;
    const id = setTimeout(() => setIndex(last), 0);
    return () => clearTimeout(id);
  }, [reduced, index, last]);

  useEffect(() => {
    if (reduced || !autostart) return;
    const hold = beats[index]?.hold;
    if (!hold || index >= last) return;
    timer.current = setTimeout(() => setIndex((i) => Math.min(last, i + 1)), hold);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [index, beats, last, reduced, autostart]);

  const next = useCallback(() => setIndex((i) => Math.min(last, i + 1)), [last]);
  const skip = useCallback(() => setIndex(last), [last]);
  const restart = useCallback(() => setIndex(0), []);
  const go = useCallback(
    (id: K) => {
      const at = beats.findIndex((b) => b.id === id);
      if (at >= 0) setIndex(at);
    },
    [beats]
  );

  /* Memoized: consumers put these controls in `useCallback` dependency lists, and
     a fresh object every render would make those callbacks unstable — which in
     turn re-runs any child effect that depends on them, forever. */
  return useMemo(
    () => ({
      beat: beats[index]?.id ?? beats[last]?.id,
      index,
      progress: last === 0 ? 1 : index / last,
      isFirst: index === 0,
      isLast: index >= last,
      next,
      go,
      skip,
      restart,
    }),
    [beats, index, last, next, go, skip, restart]
  );
}

/**
 * Lines of opening narration that arrive one after another and stay.
 * Returns how many are visible.
 */
export function useNarration(count: number, gap = 1500, startAfter = 700): number {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (reduced) {
      const id = setTimeout(() => setShown(count), 0);
      return () => clearTimeout(id);
    }
    const timers = Array.from({ length: count }, (_, i) =>
      setTimeout(() => setShown(i + 1), startAfter + i * gap)
    );
    return () => timers.forEach(clearTimeout);
  }, [count, gap, startAfter, reduced]);

  return shown;
}

/* ------------------------------------------------------------------ */
/* The stage                                                           */
/* ------------------------------------------------------------------ */

export function SceneStage({
  background,
  children,
  embedded = false,
  className = "",
  vignette,
}: {
  background: string;
  children: React.ReactNode;
  /** Fill the container instead of the viewport — editor previews and demo frames. */
  embedded?: boolean;
  className?: string;
  /** Darkening at the edges, so the middle is where the eye goes. */
  vignette?: string;
}) {
  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{ minHeight: embedded ? "100%" : "100dvh", background }}
    >
      {children}
      {vignette && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(ellipse 78% 62% at 50% 46%, transparent 34%, ${vignette})` }}
        />
      )}
    </div>
  );
}

/** A beat swap. Only one beat is mounted at a time, so beats can be expensive. */
export function Curtain({
  beat,
  kind = "fade",
  duration = 0.8,
  children,
  className = "",
}: {
  beat: string;
  kind?: "fade" | "rise" | "unfold" | "iris" | "wipe";
  duration?: number;
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const variants = {
    fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
    rise: {
      initial: { opacity: 0, y: 26 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -18 },
    },
    /* Paper physics: it hinges open rather than sliding in. */
    unfold: {
      initial: { opacity: 0, rotateX: -84, scaleY: 0.3 },
      animate: { opacity: 1, rotateX: 0, scaleY: 1 },
      exit: { opacity: 0, rotateX: -50, scaleY: 0.55 },
    },
    iris: {
      initial: { opacity: 0, clipPath: "circle(0% at 50% 50%)" },
      animate: { opacity: 1, clipPath: "circle(120% at 50% 50%)" },
      exit: { opacity: 0, clipPath: "circle(0% at 50% 50%)" },
    },
    wipe: {
      initial: { opacity: 0, clipPath: "inset(0 100% 0 0)" },
      animate: { opacity: 1, clipPath: "inset(0 0% 0 0)" },
      exit: { opacity: 0, clipPath: "inset(0 0 0 100%)" },
    },
  }[kind];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={beat}
        className={className}
        style={kind === "unfold" ? { transformOrigin: "50% 0%", transformStyle: "preserve-3d" } : undefined}
        initial={reduced ? { opacity: 0 } : variants.initial}
        animate={reduced ? { opacity: 1 } : variants.animate}
        exit={reduced ? { opacity: 0 } : variants.exit}
        transition={{ duration: reduced ? 0.2 : duration, ease: [0.2, 0.8, 0.2, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * The loading screen. Each experience gets its own, because the wait is the
 * first thing anyone sees of it — so the shape is shared and the contents are not.
 */
export function LoadingVeil({
  show,
  background,
  color,
  label,
  children,
}: {
  show: boolean;
  background: string;
  color: string;
  label: string;
  /** The experience's own mark, drawn however it likes. */
  children?: React.ReactNode;
}) {
  const reduced = useReducedMotion();
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-6"
          style={{ background }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
          role="status"
          aria-live="polite"
        >
          {children}
          <motion.span
            style={{
              fontFamily: "var(--font-ibm-plex-mono), monospace",
              fontSize: 9.5,
              letterSpacing: ".3em",
              textTransform: "uppercase",
              color,
            }}
            animate={reduced ? undefined : { opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            {label}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * True once the browser has had a moment to settle — used to hold a loading veil
 * for a beat instead of flashing it. Reads no clock, so it is hydration-safe.
 */
export function useSettled(ms = 900): boolean {
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setSettled(true), ms);
    return () => clearTimeout(id);
  }, [ms]);
  return settled;
}

/** Deterministic 0..1 from a string — never `Math.random()`, which desyncs hydration. */
export function seeded(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i += 1) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

export interface Speck {
  x: number;
  y: number;
  size: number;
  delay: number;
  drift: number;
}

/** A fixed spread of positions from a seed — stars, motes, petals, confetti. */
export function useScatter(count: number, seed: string): Speck[] {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: seeded(`${seed}x${i}`) * 100,
        y: seeded(`${seed}y${i}`) * 100,
        size: 0.6 + seeded(`${seed}s${i}`) * 1.8,
        delay: seeded(`${seed}d${i}`) * 6,
        drift: (seeded(`${seed}r${i}`) - 0.5) * 60,
      })),
    [count, seed]
  );
}
