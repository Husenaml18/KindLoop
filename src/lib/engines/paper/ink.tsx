"use client";

/**
 * Paper Engine — ink.
 *
 * Handwriting that arrives one word at a time. There are no glyph outlines for
 * arbitrary text, so nothing here pretends to trace strokes: each word *mounts*
 * and is wiped in with a clip-path, which means the end of the flow is the true
 * position of the nib. Shared by every experience that writes.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * The ink engine.
 *
 * Arbitrary text can't be animated as real handwriting strokes — there are no
 * glyph paths to draw. So instead of faking that, this mounts one word at a
 * time and wipes each one in left-to-right with a clip-path, which is what ink
 * actually looks like being laid onto paper. Because words *mount* rather than
 * just un-hiding, the end of the text flow is genuinely the write position, so
 * the nib can sit there truthfully.
 */

/** Deterministic per-word jitter — same every render, so SSR and client agree. */
function seeded(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

interface Token {
  word: string;
  /** Extra dwell after this word — commas breathe, full stops pause. */
  pauseAfter: number;
  /** Every so often the nib leaves a heavier mark. */
  blot: boolean;
  jitterY: number;
  jitterRot: number;
}

function tokenize(text: string, seedPrefix: string): Token[][] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line, li) =>
      line.split(/\s+/).map((word, wi) => {
        const r = seeded(`${seedPrefix}-${li}-${wi}-${word}`);
        const trailing = word.slice(-1);
        const pauseAfter =
          trailing === "." || trailing === "!" || trailing === "?"
            ? 380
            : trailing === "," || trailing === ";" || trailing === ":"
              ? 190
              : trailing === "—"
                ? 260
                : 0;
        return {
          word,
          pauseAfter,
          blot: r > 0.94,
          jitterY: (r - 0.5) * 1.7,
          jitterRot: (seeded(`r${seedPrefix}${li}${wi}`) - 0.5) * 1.5,
        };
      })
    );
}

/**
 * Advances a write cursor through the tokens at a human pace.
 * Returns how many words have been committed to paper so far.
 */
function useWriteCursor(total: number, wordsPerMinute: number, enabled: boolean, pauses: number[]) {
  const reduced = useReducedMotion();
  const [written, setWritten] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled || reduced || total === 0) {
      /* Snap to fully written — scheduled rather than set synchronously, which
         would cascade a second render before paint. */
      timer.current = setTimeout(() => setWritten(enabled || reduced ? total : 0), 0);
      return () => {
        if (timer.current) clearTimeout(timer.current);
      };
    }
    let i = 0;
    const base = 60000 / Math.max(40, wordsPerMinute);

    const step = () => {
      i += 1;
      setWritten(i);
      if (i >= total) return;
      /* Slight per-word variance so the rhythm never sounds mechanical. */
      const jitter = 0.72 + seeded(`t${i}`) * 0.62;
      timer.current = setTimeout(step, base * jitter + (pauses[i - 1] ?? 0));
    };
    /* The pause before the nib touches down doubles as the reset, so nothing
       has to be set synchronously above. */
    timer.current = setTimeout(() => {
      setWritten(0);
      step();
    }, 420);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `pauses` is derived from the same text as `total`
  }, [total, wordsPerMinute, enabled, reduced]);

  return reduced ? total : written;
}

export interface InkStyle {
  family: string;
  size: number;
  lineHeight: number;
  tracking: string;
  hex: string;
  wet: string;
}

/**
 * A block of text that writes itself on. `startAt` lets several blocks share one
 * continuous cursor, so the letter is written in order rather than all at once.
 */
export function Handwritten({
  text,
  ink,
  seed,
  written,
  startAt,
  showNib = false,
  style,
  className = "",
}: {
  text: string;
  ink: InkStyle;
  seed: string;
  /** Global count of words written so far. */
  written: number;
  /** How many words came before this block. */
  startAt: number;
  showNib?: boolean;
  style?: CSSProperties;
  className?: string;
}) {
  const lines = useMemo(() => tokenize(text, seed), [text, seed]);
  /* Word offsets are precomputed: advancing a counter inside the JSX map would
     be a mutation during render. */
  const lineStarts = useMemo(() => {
    const out: number[] = [];
    let at = startAt;
    for (const words of lines) {
      out.push(at);
      at += words.length;
    }
    return out;
  }, [lines, startAt]);
  if (lines.length === 0) return null;

  return (
    <div
      className={className}
      style={{
        fontFamily: ink.family,
        fontSize: ink.size,
        lineHeight: ink.lineHeight,
        letterSpacing: ink.tracking,
        color: ink.hex,
        ...style,
      }}
    >
      {lines.map((words, li) => {
        const lineStart = lineStarts[li];
        const lineEnd = lineStart + words.length;
        /* Skip lines the cursor hasn't reached — keeps the DOM small on long letters. */
        if (written <= lineStart) return null;
        const isCurrentLine = written < lineEnd;

        return (
          <p key={li} className="m-0" style={{ marginBottom: "0.55em" }}>
            {words.map((t, wi) => {
              const index = lineStart + wi;
              if (index >= written) return null;
              const justLanded = index === written - 1;
              return (
                <motion.span
                  key={wi}
                  className="inline-block"
                  initial={{ clipPath: "inset(0 100% -20% 0)", opacity: 0.55 }}
                  animate={{ clipPath: "inset(0 -6% -20% 0)", opacity: 1 }}
                  transition={{ duration: 0.26 + t.word.length * 0.022, ease: [0.35, 0.6, 0.3, 1] }}
                  style={{
                    marginRight: "0.3em",
                    translateY: t.jitterY,
                    rotate: t.jitterRot,
                    /* Fresh ink sits wet and dark for a moment before it dries. */
                    color: justLanded ? ink.wet : ink.hex,
                    fontWeight: t.blot ? 600 : undefined,
                    textShadow: t.blot ? `0 0 1.5px ${ink.wet}` : undefined,
                    transition: "color .9s ease",
                  }}
                >
                  {t.word}
                </motion.span>
              );
            })}
            {showNib && isCurrentLine && <Nib color={ink.wet} />}
          </p>
        );
      })}
    </div>
  );
}

/** The wet tip resting where the next word will go. */
function Nib({ color }: { color: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.span
      aria-hidden
      className="inline-block align-baseline"
      style={{ width: "0.5em", height: "1em", position: "relative" }}
    >
      <motion.span
        className="absolute"
        style={{
          left: 0,
          bottom: "0.1em",
          width: "0.34em",
          height: "0.34em",
          borderRadius: "50% 50% 50% 0",
          background: color,
          transform: "rotate(-45deg)",
        }}
        animate={reduced ? undefined : { opacity: [1, 0.35, 1], scale: [1, 0.86, 1] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.span>
  );
}

/** Counts the words in a block so blocks can share one cursor. */
export function countWords(text: string): number {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .reduce((n, line) => n + line.split(/\s+/).length, 0);
}

/** Collects the per-word pauses for the whole letter, in order. */
export function collectPauses(texts: string[], seedPrefix: string): number[] {
  return texts.flatMap((t, i) => tokenize(t, `${seedPrefix}-${i}`).flat().map((tok) => tok.pauseAfter));
}

export { useWriteCursor };

/** The signature, drawn rather than written — it gets its own flourish. */
export function Signature({
  name,
  ink,
  visible,
  family,
}: {
  name: string;
  ink: InkStyle;
  visible: boolean;
  family: string;
}) {
  const reduced = useReducedMotion();
  const [hover, setHover] = useState(false);
  if (!name) return null;

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <motion.span
        className="block"
        style={{
          fontFamily: family,
          fontSize: ink.size * 1.5,
          lineHeight: 1.2,
          color: ink.hex,
        }}
        initial={reduced ? { opacity: 0 } : { clipPath: "inset(0 100% 0 0)", opacity: 0 }}
        animate={visible ? { clipPath: "inset(0 -8% 0 0)", opacity: 1 } : {}}
        transition={{ duration: 1.9, ease: [0.3, 0.65, 0.3, 1], delay: 0.35 }}
      >
        {name}
      </motion.span>

      {/* the underline flourish the pen leaves as it lifts */}
      <svg
        aria-hidden
        viewBox="0 0 200 20"
        preserveAspectRatio="none"
        className="block w-full"
        style={{ height: 14, marginTop: -2 }}
      >
        <motion.path
          d="M4 13 C 44 5, 82 17, 120 9 S 176 6, 196 12"
          fill="none"
          stroke={ink.hex}
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.7"
          initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
          animate={visible ? { pathLength: 1 } : {}}
          transition={{ duration: 1.4, ease: "easeInOut", delay: 1.9 }}
        />
      </svg>

      {/* ink sparkles on hover */}
      {hover &&
        !reduced &&
        [0, 1, 2, 3].map((i) => (
          <motion.span
            key={i}
            aria-hidden
            className="pointer-events-none absolute rounded-full"
            style={{
              left: `${18 + i * 22}%`,
              top: "40%",
              width: 3,
              height: 3,
              background: ink.wet,
            }}
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 0], y: -18, scale: [0.5, 1.2, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.16 }}
          />
        ))}
    </div>
  );
}
