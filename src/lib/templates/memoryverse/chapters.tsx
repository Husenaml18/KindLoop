"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Chapter } from "./schema";
import { MV, MV_BODY, MV_DISPLAY, MV_HAND, MV_SLATE, GRAIN_URI } from "./theme";

const display: CSSProperties = { fontFamily: MV_DISPLAY };
const body: CSSProperties = { fontFamily: MV_BODY };
const slate: CSSProperties = { fontFamily: MV_SLATE };
const hand: CSSProperties = { fontFamily: MV_HAND };

/* ------------------------------------------------------------------ */
/* Projector ambience — the things that make it a room, not a webpage  */
/* ------------------------------------------------------------------ */

/** 35mm grain, always moving very slightly so it never looks like a texture. */
export function FilmGrain({ opacity = 0.22 }: { opacity?: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-30"
      style={{ backgroundImage: GRAIN_URI, opacity, mixBlendMode: "overlay" }}
      animate={reduced ? undefined : { x: [0, -6, 4, -3, 0], y: [0, 4, -5, 3, 0] }}
      transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
    />
  );
}

/** Lamp falloff towards the edges of the projected rectangle. */
export function ProjectorVignette() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-20"
      style={{
        background:
          "radial-gradient(ellipse 76% 68% at 50% 46%, transparent 42%, rgba(6,4,3,.5) 82%, rgba(6,4,3,.82) 100%)",
      }}
    />
  );
}

/** Dust drifting through the beam. Fixed positions so SSR and client agree. */
const MOTES = [
  { x: 12, y: 78, s: 2.5, d: 15, delay: 0 },
  { x: 26, y: 92, s: 2, d: 19, delay: 2.4 },
  { x: 39, y: 70, s: 3, d: 16, delay: 5.1 },
  { x: 52, y: 88, s: 2, d: 21, delay: 1.2 },
  { x: 64, y: 74, s: 2.5, d: 17, delay: 3.6 },
  { x: 77, y: 90, s: 2, d: 22, delay: 6.2 },
  { x: 88, y: 68, s: 3, d: 18, delay: 4.3 },
  { x: 33, y: 55, s: 2, d: 24, delay: 7.5 },
  { x: 70, y: 50, s: 2, d: 20, delay: 8.8 },
];

export function DustBeam({ density = 1 }: { density?: number }) {
  const reduced = useReducedMotion();
  if (reduced) return null;
  const motes = density < 1 ? MOTES.slice(0, 5) : MOTES;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {motes.map((m, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${m.x}%`,
            top: `${m.y}%`,
            width: m.s,
            height: m.s,
            background: MV.lampHot,
            filter: "blur(.5px)",
          }}
          animate={{ y: [0, -320], opacity: [0, 0.7, 0], x: [0, i % 2 ? 18 : -15, 0] }}
          transition={{ duration: m.d, repeat: Infinity, delay: m.delay, ease: "linear" }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared pieces                                                       */
/* ------------------------------------------------------------------ */

/**
 * A projected slide: slow Ken Burns drift, a blur-up while the file loads, and
 * a sub-pixel "gate weave" — the tiny wobble real film has in the projector gate.
 */
export function Slide({
  src,
  alt,
  index = 0,
  className = "",
}: {
  src: string;
  alt: string;
  index?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [loaded, setLoaded] = useState(false);
  const even = index % 2 === 0;

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0"
        animate={reduced ? undefined : { x: [0, 0.8, -0.6, 0.4, 0], y: [0, -0.6, 0.7, -0.4, 0] }}
        transition={{ duration: 0.55, repeat: Infinity, ease: "linear" }}
      >
        <motion.div
          className="absolute inset-0"
          initial={reduced ? undefined : { scale: even ? 1.05 : 1.18, x: even ? -10 : 12, y: even ? 8 : -10 }}
          animate={reduced ? undefined : { scale: even ? 1.18 : 1.05, x: even ? 12 : -10, y: even ? -10 : 8 }}
          transition={{ duration: 30, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        >
          {src ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={src}
              alt={alt}
              onLoad={() => setLoaded(true)}
              className="h-full w-full object-cover"
              style={{
                filter: loaded ? "blur(0px)" : "blur(26px)",
                transform: loaded ? "scale(1)" : "scale(1.07)",
                transition: "filter 1.3s ease, transform 1.3s ease",
              }}
            />
          ) : (
            <div
              aria-hidden
              className="h-full w-full"
              style={{ background: `linear-gradient(155deg, ${MV.roomLift}, ${MV.void})` }}
            />
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

/** Narration that arrives line by line, the way someone talks you through a slide. */
export function Narration({
  text,
  style,
  className = "",
  delay = 0,
}: {
  text: string;
  style?: CSSProperties;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  const lines = text.split("\n").filter(Boolean);
  if (lines.length === 0) return null;

  return (
    <div className={className} style={style}>
      {lines.map((line, i) => (
        <motion.p
          key={i}
          className="m-0"
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 16, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.3, ease: [0.2, 0.7, 0.2, 1], delay: delay + i * 0.38 }}
        >
          {line}
        </motion.p>
      ))}
    </div>
  );
}

/** Film-slate metadata: chapter number, place, date, emotion. */
export function Slate({
  chapter,
  index,
  total,
}: {
  chapter: Chapter;
  index?: number;
  total?: number;
}) {
  const bits: string[] = [];
  if (typeof index === "number" && typeof total === "number") {
    bits.push(`SLIDE ${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`);
  }
  if (chapter.location) bits.push(chapter.location.toUpperCase());
  if (chapter.date) bits.push(chapter.date.toUpperCase());

  if (bits.length === 0 && !chapter.emotion) return null;

  return (
    <motion.div
      className="flex flex-wrap items-center gap-x-3 gap-y-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.15 }}
    >
      {bits.length > 0 && (
        <span
          className="text-[10.5px] leading-none tracking-[0.2em]"
          style={{ ...slate, color: MV.slate }}
        >
          {bits.join("   ·   ")}
        </span>
      )}
      {chapter.emotion && (
        <span
          className="rounded-sm px-2 py-[5px] text-[10px] leading-none tracking-[0.16em] uppercase"
          style={{ ...slate, background: "rgba(200,102,58,.16)", color: MV.emberSoft }}
        >
          {chapter.emotion}
        </span>
      )}
    </motion.div>
  );
}

function TitleCard({ children, size = "lg" }: { children: React.ReactNode; size?: "lg" | "xl" }) {
  return (
    <motion.h2
      className={`m-0 tracking-[-0.02em] ${
        size === "xl" ? "text-[clamp(32px,5.4vw,72px)] leading-[1.04]" : "text-[clamp(28px,4.2vw,54px)] leading-[1.08]"
      }`}
      style={{ ...display, color: MV.screen }}
      initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 1.4, ease: [0.2, 0.7, 0.2, 1], delay: 0.28 }}
    >
      {children}
    </motion.h2>
  );
}

function Reaction({ chapter }: { chapter: Chapter }) {
  const [lit, setLit] = useState(false);
  if (!chapter.reaction) return null;
  return (
    <motion.button
      type="button"
      onClick={() => setLit((v) => !v)}
      aria-label={lit ? "Undo reaction" : "React to this memory"}
      aria-pressed={lit}
      className="mt-1 inline-flex cursor-pointer items-center gap-2.5 rounded-full px-4 py-2 text-[15px]"
      style={{
        border: `1px solid ${lit ? MV.lamp : "rgba(244,238,227,.18)"}`,
        background: lit ? "rgba(232,178,106,.14)" : "transparent",
        color: MV.screenDim,
      }}
      whileHover={{ scale: 1.05, borderColor: MV.lamp }}
      whileTap={{ scale: 0.95 }}
      animate={lit ? { scale: [1, 1.3, 1] } : { scale: 1 }}
      transition={{ duration: 0.45 }}
    >
      <span>{chapter.reaction}</span>
      <span className="text-[10px] tracking-[0.16em] uppercase" style={slate}>
        {lit ? "felt that" : "tap to feel"}
      </span>
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/* Chapter kinds                                                       */
/* ------------------------------------------------------------------ */

interface KindProps {
  chapter: Chapter;
  index: number;
  total: number;
}

/** The default slide: image fills the wall, narration sits in the dark beside it. */
function PhotoChapter({ chapter, index, total }: KindProps) {
  return (
    <div className="relative h-full w-full">
      <Slide src={chapter.imageUrl} alt={chapter.title || "A memory"} index={index} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(105deg, rgba(8,6,4,.9) 0%, rgba(8,6,4,.68) 34%, rgba(8,6,4,.12) 62%, transparent 100%)",
        }}
      />
      <div className="relative z-20 flex h-full items-end sm:items-center">
        <div className="flex max-w-[560px] flex-col gap-5 px-7 pb-14 sm:px-14 sm:pb-0">
          <Slate chapter={chapter} index={index} total={total} />
          <TitleCard>{chapter.title}</TitleCard>
          <Narration
            text={chapter.description}
            className="flex flex-col gap-4 text-[16.5px] leading-[1.78]"
            style={{ ...body, color: MV.screenDim }}
            delay={0.6}
          />
          <Reaction chapter={chapter} />
        </div>
      </div>
    </div>
  );
}

function VideoChapter({ chapter, index, total }: KindProps) {
  return (
    <div className="relative h-full w-full">
      {chapter.videoUrl ? (
        <video
          src={chapter.videoUrl}
          controls
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
          aria-label={chapter.title || "Memory video"}
        />
      ) : (
        <Slide src={chapter.imageUrl} alt={chapter.title || "A memory"} index={index} />
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{ background: "linear-gradient(to top, rgba(8,6,4,.92), rgba(8,6,4,.15) 52%, transparent)" }}
      />
      <div className="pointer-events-none relative z-20 flex h-full items-end">
        <div className="flex max-w-2xl flex-col gap-4 px-7 pb-16 sm:px-14">
          <Slate chapter={chapter} index={index} total={total} />
          <TitleCard>{chapter.title}</TitleCard>
          <Narration
            text={chapter.description}
            className="flex flex-col gap-3 text-[16px] leading-[1.72]"
            style={{ ...body, color: MV.screenDim }}
            delay={0.6}
          />
        </div>
      </div>
    </div>
  );
}

const WAVE = [
  22, 44, 30, 68, 52, 88, 60, 96, 46, 74, 34, 58, 82, 40, 66, 28, 54, 90, 48, 70, 36, 62, 26, 80, 44, 58, 32, 72, 50, 86,
];

/** Voice memory: the room goes quiet, the photo dims, the waveform is the subject. */
function VoiceChapter({ chapter, index, total }: KindProps) {
  const reduced = useReducedMotion();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  /*
   * Why it will not play, when it will not play.
   *
   * This used to be `.catch(() => setPlaying(false))` — the button simply did
   * nothing, and a broken link was indistinguishable from a working one. Almost
   * every failure here is the same one: the address points at a *page* about the
   * audio rather than the audio, because that is what a share link is. Saying so
   * is the difference between a person fixing it in ten seconds and concluding
   * the feature is broken.
   */
  const [problem, setProblem] = useState<string | null>(null);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) {
      setPlaying((v) => !v); // still animates before a file is attached
      return;
    }
    setProblem(null);
    if (el.paused) {
      void el
        .play()
        .then(() => setPlaying(true))
        .catch(() => {
          setPlaying(false);
          setProblem("This recording won't play. The link may point at a page rather than an audio file.");
        });
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  return (
    <div className="relative h-full w-full">
      <Slide src={chapter.imageUrl} alt="" index={index} />
      <div aria-hidden className="absolute inset-0 z-10" style={{ background: "rgba(8,6,4,.78)" }} />

      <div className="relative z-20 flex h-full items-center justify-center px-7">
        <div className="flex w-full max-w-2xl flex-col items-center gap-8 text-center">
          <Slate chapter={chapter} index={index} total={total} />
          <TitleCard>{chapter.title}</TitleCard>

          <div className="flex w-full items-center gap-4">
            <motion.button
              type="button"
              onClick={toggle}
              aria-label={playing ? "Pause voice memory" : "Play voice memory"}
              className="flex h-16 w-16 flex-none cursor-pointer items-center justify-center rounded-full border-0"
              style={{ background: MV.lamp, color: MV.void }}
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.93 }}
              animate={
                playing || reduced
                  ? {}
                  : { boxShadow: ["0 0 0 0 rgba(232,178,106,.55)", "0 0 0 22px rgba(232,178,106,0)"] }
              }
              transition={playing || reduced ? {} : { duration: 2.4, repeat: Infinity }}
            >
              <span className="text-[19px]">{playing ? "❙❙" : "▶"}</span>
            </motion.button>

            <div className="flex h-20 flex-1 items-center gap-[3px]" aria-hidden>
              {WAVE.map((h, i) => {
                const past = (i / WAVE.length) * 100 <= progress;
                return (
                  <motion.span
                    key={i}
                    className="flex-1 rounded-full"
                    style={{ background: past ? MV.lamp : "rgba(244,238,227,.28)" }}
                    animate={
                      playing && !reduced
                        ? { height: [`${h}%`, `${Math.max(12, 108 - h)}%`, `${h}%`] }
                        : { height: `${h}%` }
                    }
                    transition={
                      playing && !reduced
                        ? { duration: 0.95, repeat: Infinity, ease: "easeInOut", delay: i * 0.028 }
                        : { duration: 0.4 }
                    }
                  />
                );
              })}
            </div>
          </div>

          {chapter.audioLabel && (
            <span className="text-[10.5px] tracking-[0.18em] uppercase" style={{ ...slate, color: MV.slate }}>
              {chapter.audioLabel}
            </span>
          )}
          {problem && (
            <span
              role="status"
              className="rounded-lg px-3.5 py-2 text-[12.5px] leading-[1.5]"
              style={{ background: "rgba(200,102,58,.16)", color: "rgba(244,238,227,.9)" }}
            >
              {problem}
            </span>
          )}
          <Narration
            text={chapter.description}
            className="flex flex-col gap-3 text-[16px] leading-[1.72]"
            style={{ ...body, color: MV.screenDim }}
            delay={0.6}
          />

          {chapter.audioUrl && (
            <audio
              ref={audioRef}
              src={chapter.audioUrl}
              preload="metadata"
              className="sr-only"
              onEnded={() => {
                setPlaying(false);
                setProgress(0);
              }}
              /* Fires when the file itself cannot be loaded — a 404, the wrong
                 content type, a cross-origin refusal. `play()` rejecting does
                 not always cover it, so both paths are handled. */
              onError={() =>
                setProblem("This recording couldn't be loaded. Check the link points straight at an audio file.")
              }
              onTimeUpdate={(e) => {
                const el = e.currentTarget;
                if (el.duration) setProgress((el.currentTime / el.duration) * 100);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/** Quote: the lamp is on but there is no slide in the tray. Just words on the wall. */
function QuoteChapter({ chapter, index, total }: KindProps) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-9 px-7 text-center sm:px-16">
      <motion.span
        aria-hidden
        className="block leading-[0.7]"
        style={{ ...display, color: "rgba(200,102,58,.34)", fontSize: 96 }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        &ldquo;
      </motion.span>
      <motion.blockquote
        className="m-0 max-w-4xl text-[clamp(26px,4.8vw,60px)] leading-[1.2] tracking-[-0.018em]"
        style={{ ...display, color: MV.screen }}
        initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1.8, ease: [0.2, 0.7, 0.2, 1], delay: 0.35 }}
      >
        {chapter.quote || chapter.title}
      </motion.blockquote>
      {chapter.attribution && (
        <motion.footer
          className="text-[11.5px] tracking-[0.22em] uppercase"
          style={{ ...slate, color: MV.slate }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.5 }}
        >
          — {chapter.attribution}
        </motion.footer>
      )}
      <Slate chapter={chapter} index={index} total={total} />
    </div>
  );
}

/** Letter: a real sheet of paper, spotlit on the dark table. The one lit object. */
function LetterChapter({ chapter, index, total }: KindProps) {
  const reduced = useReducedMotion();
  return (
    <div className="relative flex h-full w-full items-center justify-center px-5 py-12 sm:px-10">
      {/* the pool of lamplight the page sits in */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[130%] w-[120%] -translate-x-1/2 -translate-y-1/2"
        style={{
          background: "radial-gradient(ellipse 40% 44% at 50% 50%, rgba(232,178,106,.22), transparent 70%)",
        }}
      />
      <motion.article
        className="relative w-full max-w-xl overflow-hidden rounded-[6px] px-7 py-11 sm:px-14 sm:py-16"
        style={{
          background: `linear-gradient(168deg,${MV.paper},#e2d6bd)`,
          boxShadow: "0 56px 96px -44px rgba(0,0,0,.85)",
          transformOrigin: "top center",
          transformStyle: "preserve-3d",
        }}
        initial={reduced ? { opacity: 0 } : { rotateX: -82, opacity: 0, y: -34 }}
        animate={{ rotateX: 0, opacity: 1, y: 0 }}
        transition={{ duration: 1.7, ease: [0.2, 0.85, 0.2, 1] }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-45"
          style={{ backgroundImage: GRAIN_URI, mixBlendMode: "multiply" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-1/2 h-px"
          style={{ background: "rgba(42,32,21,.11)" }}
        />
        <div className="relative flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="text-[10.5px] tracking-[0.2em]" style={{ ...slate, color: "#8a7454" }}>
              {`SLIDE ${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`}
              {chapter.date ? `   ·   ${chapter.date.toUpperCase()}` : ""}
            </span>
            {chapter.emotion && (
              <span
                className="rounded-sm px-2 py-[5px] text-[10px] leading-none tracking-[0.16em] uppercase"
                style={{ ...slate, background: "rgba(200,102,58,.14)", color: "#a44e26" }}
              >
                {chapter.emotion}
              </span>
            )}
          </div>
          {chapter.title && (
            <h2 className="m-0 text-[25px] leading-tight" style={{ ...display, color: MV.paperInk }}>
              {chapter.title}
            </h2>
          )}
          <Narration
            text={chapter.letterBody || chapter.description}
            className="flex flex-col gap-4 text-[21px] leading-[1.62]"
            style={{ ...hand, color: "#3a2c1c" }}
            delay={0.7}
          />
          {chapter.signature && (
            <motion.p
              className="m-0 self-end text-[25px]"
              style={{ ...hand, color: "#a44e26" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.3, delay: 1.7 }}
            >
              {chapter.signature}
            </motion.p>
          )}
        </div>
      </motion.article>
    </div>
  );
}

/** Timeline: the tray itself, laid out as a lit strip of milestones. */
function TimelineChapter({ chapter, index, total }: KindProps) {
  const reduced = useReducedMotion();
  const items = chapter.milestones.filter((m) => m.label || m.date);

  return (
    <div className="relative flex h-full w-full items-center justify-center px-7 py-14 sm:px-12">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col gap-4">
          <Slate chapter={chapter} index={index} total={total} />
          <TitleCard>{chapter.title}</TitleCard>
        </div>

        <div className="relative mt-10 pl-9">
          <motion.div
            aria-hidden
            className="absolute left-[7px] top-1 w-[2px] origin-top"
            style={{
              bottom: 4,
              background: `linear-gradient(to bottom, ${MV.ember}, ${MV.lamp})`,
              boxShadow: `0 0 12px ${MV.lamp}`,
            }}
            initial={reduced ? { scaleY: 1 } : { scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 1.7, ease: "easeOut", delay: 0.35 }}
          />
          <ol className="m-0 flex list-none flex-col gap-7 p-0">
            {items.map((m, i) => (
              <motion.li
                key={i}
                className="relative"
                initial={reduced ? { opacity: 1 } : { opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, delay: 0.7 + i * 0.24, ease: [0.2, 0.7, 0.2, 1] }}
              >
                <motion.span
                  aria-hidden
                  className="absolute left-[-31px] top-[7px] h-[14px] w-[14px] rounded-full border-2"
                  style={{ borderColor: MV.lamp, background: MV.void, boxShadow: `0 0 10px ${MV.lamp}` }}
                  initial={reduced ? undefined : { scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 320, damping: 17, delay: 0.7 + i * 0.24 }}
                />
                {m.date && (
                  <div className="text-[10.5px] tracking-[0.2em] uppercase" style={{ ...slate, color: MV.slate }}>
                    {m.date}
                  </div>
                )}
                <div className="mt-1.5 text-[19px] leading-snug" style={{ ...display, color: MV.screen }}>
                  {m.label}
                </div>
              </motion.li>
            ))}
          </ol>
        </div>

        <Narration
          text={chapter.description}
          className="mt-9 flex flex-col gap-3 text-[16px] leading-[1.72]"
          style={{ ...body, color: MV.screenDim }}
          delay={1.1}
        />
      </div>
    </div>
  );
}

/** Location: a slide of a map, drawn in lamplight. No external tiles required. */
function LocationChapter({ chapter, index, total }: KindProps) {
  const reduced = useReducedMotion();
  return (
    <div className="relative flex h-full w-full items-center justify-center px-6 py-12 sm:px-12">
      <div className="grid w-full max-w-5xl grid-cols-1 items-center gap-10 lg:grid-cols-2">
        <motion.div
          className="relative aspect-[4/3] overflow-hidden rounded-[10px]"
          style={{ background: MV.roomLift, boxShadow: "0 46px 88px -40px rgba(0,0,0,.9)" }}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: [0.2, 0.7, 0.2, 1] }}
        >
          {chapter.imageUrl ? (
            <Slide src={chapter.imageUrl} alt={chapter.place || "Location"} index={index} />
          ) : (
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background: `repeating-linear-gradient(0deg,transparent 0 28px,rgba(232,178,106,.09) 28px 29px), repeating-linear-gradient(90deg,transparent 0 36px,rgba(232,178,106,.09) 36px 37px), linear-gradient(150deg,${MV.roomLift},${MV.void})`,
              }}
            />
          )}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{ background: "radial-gradient(circle at 62% 40%, rgba(232,178,106,.16) 0%, transparent 46%)" }}
          />
          <svg aria-hidden viewBox="0 0 400 300" className="absolute inset-0 h-full w-full">
            <motion.path
              d="M74 232 C 150 196, 168 128, 254 118"
              fill="none"
              stroke={MV.ember}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="7 9"
              initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2.2, ease: "easeInOut", delay: 0.6 }}
            />
            <circle cx="74" cy="232" r="5" fill={MV.slate} />
          </svg>
          <motion.div
            className="absolute"
            style={{ left: "63.5%", top: "38%" }}
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: -24, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 250, damping: 13, delay: 2.4 }}
          >
            <motion.span
              className="block text-[26px] leading-none"
              style={{ filter: `drop-shadow(0 0 9px ${MV.lamp})` }}
              animate={reduced ? undefined : { y: [0, -6, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 3 }}
            >
              📍
            </motion.span>
          </motion.div>
        </motion.div>

        <div className="flex flex-col gap-5">
          <Slate chapter={chapter} index={index} total={total} />
          <TitleCard>{chapter.title}</TitleCard>
          {(chapter.travelFrom || chapter.place) && (
            <div
              className="flex flex-wrap items-center gap-2.5 text-[11.5px] tracking-[0.16em] uppercase"
              style={{ ...slate, color: MV.slate }}
            >
              {chapter.travelFrom && <span>{chapter.travelFrom}</span>}
              {chapter.travelFrom && chapter.place && <span style={{ color: MV.ember }}>——→</span>}
              {chapter.place && <span style={{ color: MV.screen }}>{chapter.place}</span>}
            </div>
          )}
          <Narration
            text={chapter.description}
            className="flex flex-col gap-4 text-[16.5px] leading-[1.78]"
            style={{ ...body, color: MV.screenDim }}
            delay={0.6}
          />
          <Reaction chapter={chapter} />
        </div>
      </div>
    </div>
  );
}

function useCountdown(target: string) {
  const [left, setLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    if (!target) return;
    const end = new Date(target).getTime();
    if (Number.isNaN(end)) return;

    const tick = () => {
      const diff = Math.max(0, end - Date.now());
      setLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff / 3600000) % 24),
        m: Math.floor((diff / 60000) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return left;
}

/** Countdown: the last slide in the tray is one that hasn't happened yet. */
function CountdownChapter({ chapter, index, total }: KindProps) {
  const left = useCountdown(chapter.targetDate);
  const units = [
    { v: left?.d ?? 0, l: "days" },
    { v: left?.h ?? 0, l: "hours" },
    { v: left?.m ?? 0, l: "mins" },
    { v: left?.s ?? 0, l: "secs" },
  ];

  return (
    <div className="relative h-full w-full">
      <Slide src={chapter.imageUrl} alt="" index={index} />
      <div aria-hidden className="absolute inset-0 z-10" style={{ background: "rgba(8,6,4,.74)" }} />
      <div className="relative z-20 flex h-full items-center justify-center px-7">
        <div className="flex max-w-3xl flex-col items-center gap-9 text-center">
          <Slate chapter={chapter} index={index} total={total} />
          <TitleCard>{chapter.title}</TitleCard>
          <div className="flex flex-wrap items-end justify-center gap-6 sm:gap-9">
            {units.map((u) => (
              <div key={u.l} className="flex flex-col items-center gap-2.5">
                <div
                  className="text-[clamp(34px,6.4vw,68px)] leading-none tabular-nums"
                  style={{ ...display, color: MV.screen, textShadow: `0 0 26px rgba(232,178,106,.4)` }}
                >
                  {String(u.v).padStart(2, "0")}
                </div>
                <div className="text-[10px] tracking-[0.24em] uppercase" style={{ ...slate, color: MV.slate }}>
                  {u.l}
                </div>
              </div>
            ))}
          </div>
          <Narration
            text={chapter.description}
            className="flex flex-col gap-3 text-[16px] leading-[1.72]"
            style={{ ...body, color: MV.screenDim }}
            delay={0.6}
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hidden memories — a slide left in its sleeve                        */
/* ------------------------------------------------------------------ */

export function HiddenGate({ chapter, children }: { chapter: Chapter; children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [holdPct, setHoldPct] = useState(0);
  const [scratchPct, setScratchPct] = useState(0);
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const style = chapter.revealStyle;

  const stopHold = () => {
    if (holdTimer.current) {
      clearInterval(holdTimer.current);
      holdTimer.current = null;
    }
    setHoldPct((p) => (p >= 100 ? p : 0));
  };

  const startHold = () => {
    if (holdTimer.current) return;
    holdTimer.current = setInterval(() => {
      setHoldPct((p) => {
        const next = p + 4;
        if (next >= 100) {
          stopHold();
          setOpen(true);
          return 100;
        }
        return next;
      });
    }, 40);
  };

  useEffect(() => () => stopHold(), []);

  const scratch = () =>
    setScratchPct((p) => {
      const next = Math.min(100, p + 9);
      if (next >= 100) setOpen(true);
      return next;
    });

  const prompt =
    style === "hold"
      ? "Press and hold"
      : style === "envelope"
        ? "Open the sleeve"
        : style === "scratch"
          ? "Scratch to uncover"
          : "Tap to reveal";

  const handlers =
    style === "hold"
      ? {
          onPointerDown: startHold,
          onPointerUp: stopHold,
          onPointerLeave: stopHold,
          onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              startHold();
            }
          },
          onKeyUp: stopHold,
        }
      : style === "scratch"
        ? { onPointerMove: scratch, onClick: scratch }
        : {
            onClick: () => setOpen(true),
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setOpen(true);
              }
            },
          };

  return (
    <div className="relative h-full w-full">
      {children}
      <AnimatePresence>
        {!open && (
          <motion.div
            key="sleeve"
            className="absolute inset-0 z-40"
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  style === "scratch"
                    ? "linear-gradient(140deg,#8c7a5e,#6b5943)"
                    : `linear-gradient(150deg,${MV.roomLift},${MV.void})`,
                opacity: style === "scratch" ? 1 - scratchPct / 100 : 1,
                transition: "opacity .25s linear",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{ backgroundImage: GRAIN_URI, mixBlendMode: "overlay" }}
            />
            <div
              role="button"
              tabIndex={0}
              aria-label={`${prompt} — a hidden memory`}
              className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-6 text-center"
              {...handlers}
            >
              <motion.div
                className="flex flex-col items-center gap-5"
                animate={reduced ? undefined : { y: [0, -8, 0] }}
                transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="text-[40px] leading-none" style={{ filter: `drop-shadow(0 0 16px ${MV.lamp})` }}>
                  {style === "envelope" ? "✉️" : style === "scratch" ? "🪙" : "✦"}
                </span>
                <div className="text-[clamp(22px,3.2vw,36px)]" style={{ ...display, color: MV.screen }}>
                  A slide still in its sleeve
                </div>
                <div className="text-[10.5px] tracking-[0.24em] uppercase" style={{ ...slate, color: MV.lamp }}>
                  {prompt}
                </div>
              </motion.div>

              {style === "hold" && (
                <div className="h-[3px] w-44 overflow-hidden rounded-full" style={{ background: "rgba(244,238,227,.2)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${holdPct}%`, background: MV.lamp, transition: "width .04s linear" }}
                  />
                </div>
              )}
              {style === "scratch" && (
                <div className="text-[10.5px] tracking-[0.18em] uppercase" style={{ ...slate, color: "rgba(244,238,227,.72)" }}>
                  {Math.round(scratchPct)}% uncovered
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function ChapterRenderer(props: KindProps) {
  switch (props.chapter.kind) {
    case "video":
      return <VideoChapter {...props} />;
    case "voice":
      return <VoiceChapter {...props} />;
    case "quote":
      return <QuoteChapter {...props} />;
    case "letter":
      return <LetterChapter {...props} />;
    case "timeline":
      return <TimelineChapter {...props} />;
    case "location":
      return <LocationChapter {...props} />;
    case "countdown":
      return <CountdownChapter {...props} />;
    case "photo":
    default:
      return <PhotoChapter {...props} />;
  }
}
