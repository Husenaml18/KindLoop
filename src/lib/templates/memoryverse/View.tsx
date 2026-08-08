"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { fraunces, spaceGrotesk, ibmPlexMono, gochiHand } from "@/app/fonts";
import type { MemoryverseContent, Chapter } from "./schema";
import { MEMORYVERSE_FALLBACKS } from "./schema";
import { MV, MV_BODY, MV_DISPLAY, MV_SLATE } from "./theme";
import { ChapterRenderer, HiddenGate, FilmGrain, ProjectorVignette, DustBeam, Slide } from "./chapters";

const display: CSSProperties = { fontFamily: MV_DISPLAY };
const body: CSSProperties = { fontFamily: MV_BODY };
const slate: CSSProperties = { fontFamily: MV_SLATE };

type Stage = "warmup" | "intro" | "cover" | "chapters" | "final";

/** Roughly how long a slide takes to take in, for the "time left" readout. */
const SECONDS_PER_CHAPTER = 15;

/* ------------------------------------------------------------------ */
/* Loading screen — the projector lamp coming up to temperature        */
/* ------------------------------------------------------------------ */

function ProjectorWarmup({ onDone, skip }: { onDone: () => void; skip: boolean }) {
  useEffect(() => {
    const t = setTimeout(onDone, skip ? 0 : 1700);
    return () => clearTimeout(t);
  }, [onDone, skip]);

  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-7"
      style={{ background: MV.void }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.1, ease: "easeInOut" }}
    >
      <motion.div
        className="relative h-16 w-16 rounded-full"
        style={{ background: MV.lamp }}
        initial={{ opacity: 0.08, scale: 0.85 }}
        animate={{ opacity: [0.08, 0.5, 0.3, 0.95, 0.7, 1], scale: [0.85, 1, 0.95, 1.05, 1, 1] }}
        transition={{ duration: 1.6, ease: "easeInOut" }}
      >
        <motion.div
          className="absolute -inset-10 rounded-full"
          style={{ background: `radial-gradient(circle, ${MV.lamp}55, transparent 70%)`, filter: "blur(14px)" }}
          animate={{ opacity: [0, 0.4, 0.25, 0.9, 1] }}
          transition={{ duration: 1.6, ease: "easeInOut" }}
        />
      </motion.div>
      <motion.span
        className="text-[10.5px] tracking-[0.34em] uppercase"
        style={{ ...slate, color: MV.slate }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.6] }}
        transition={{ duration: 1.6 }}
      >
        Warming up
      </motion.span>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Intro — words on a dark wall before any slide is loaded             */
/* ------------------------------------------------------------------ */

function IntroSequence({ lines, onDone }: { lines: string[]; onDone: () => void }) {
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduced) {
      const t = setTimeout(onDone, 400);
      return () => clearTimeout(t);
    }
    if (i >= lines.length) {
      const t = setTimeout(onDone, 700);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setI((v) => v + 1), 3100);
    return () => clearTimeout(t);
  }, [i, lines.length, onDone, reduced]);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center px-8" style={{ background: MV.void }}>
      <DustBeam density={0.5} />
      <AnimatePresence mode="wait">
        {i < lines.length && (
          <motion.p
            key={i}
            className="m-0 max-w-3xl text-center text-[clamp(24px,4.2vw,50px)] leading-[1.24] tracking-[-0.015em]"
            style={{ ...display, color: MV.screen }}
            initial={{ opacity: 0, filter: "blur(14px)", y: 10 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            exit={{ opacity: 0, filter: "blur(14px)", y: -8 }}
            transition={{ duration: 1.5, ease: [0.2, 0.7, 0.2, 1] }}
          >
            {lines[i]}
          </motion.p>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={onDone}
        className="absolute bottom-9 right-9 cursor-pointer rounded-full border-0 bg-transparent px-3 py-2 text-[10.5px] tracking-[0.2em] uppercase"
        style={{ ...slate, color: MV.slate }}
      >
        Skip
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Cover                                                               */
/* ------------------------------------------------------------------ */

function CoverPage({
  content,
  onBegin,
  chapterCount,
}: {
  content: MemoryverseContent;
  onBegin: () => void;
  chapterCount: number;
}) {
  const title = content.title || MEMORYVERSE_FALLBACKS.title;
  const mins = Math.max(1, Math.round((chapterCount * SECONDS_PER_CHAPTER) / 60));

  return (
    <motion.div
      className="absolute inset-0 z-30"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.6, ease: "easeInOut" }}
    >
      <Slide src={content.coverUrl} alt="" index={0} />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(8,6,4,.95) 0%, rgba(8,6,4,.62) 42%, rgba(8,6,4,.5) 100%)",
        }}
      />
      <DustBeam />

      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-7 px-7 text-center">
        {content.createdOn && (
          <motion.span
            className="text-[10.5px] tracking-[0.32em] uppercase"
            style={{ ...slate, color: MV.slate }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.4, delay: 0.5 }}
          >
            {content.createdOn}
          </motion.span>
        )}

        <motion.h1
          className="m-0 max-w-4xl text-[clamp(42px,8.4vw,116px)] leading-[0.98] tracking-[-0.03em]"
          style={{ ...display, color: MV.screen }}
          initial={{ opacity: 0, y: 26, filter: "blur(16px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.9, ease: [0.2, 0.7, 0.2, 1], delay: 0.2 }}
        >
          {title}
        </motion.h1>

        {content.subtitle && (
          <motion.p
            className="m-0 text-[15.5px] tracking-[0.02em]"
            style={{ ...body, color: MV.screenDim }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.95 }}
          >
            {content.subtitle}
          </motion.p>
        )}

        <motion.button
          type="button"
          onClick={onBegin}
          className="group relative mt-4 cursor-pointer overflow-hidden rounded-full px-9 py-4 text-[14px] tracking-[0.14em] uppercase"
          style={{
            ...slate,
            background: "transparent",
            border: `1px solid rgba(232,178,106,.45)`,
            color: MV.screen,
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{
            opacity: 1,
            y: 0,
            boxShadow: [
              "0 0 22px -6px rgba(232,178,106,.25)",
              "0 0 40px -4px rgba(232,178,106,.5)",
              "0 0 22px -6px rgba(232,178,106,.25)",
            ],
          }}
          transition={{
            opacity: { duration: 1.2, delay: 1.3 },
            y: { duration: 1.2, delay: 1.3 },
            boxShadow: { duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 1.3 },
          }}
          whileHover={{ borderColor: MV.lamp, backgroundColor: "rgba(232,178,106,.12)", scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Begin journey
        </motion.button>

        <motion.span
          className="text-[10px] tracking-[0.2em] uppercase"
          style={{ ...slate, color: MV.slate }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.8 }}
        >
          {chapterCount} {chapterCount === 1 ? "slide" : "slides"} · about {mins} min
        </motion.span>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Final                                                               */
/* ------------------------------------------------------------------ */

function FinalPage({ content, onReplay }: { content: MemoryverseContent; onReplay: () => void }) {
  const reduced = useReducedMotion();
  const [timedBeat, setTimedBeat] = useState(0);
  /* Reduced motion skips straight to the resolved ending — derived, not synced. */
  const beat = reduced ? 2 : timedBeat;

  useEffect(() => {
    if (reduced) return;
    const t1 = setTimeout(() => setTimedBeat(1), 3200);
    const t2 = setTimeout(() => setTimedBeat(2), 6200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [reduced]);

  const line1 = content.closingTitle || MEMORYVERSE_FALLBACKS.closingTitle;
  const line2 = content.closingSubtitle || MEMORYVERSE_FALLBACKS.closingSubtitle;
  const cta = content.closingCta || MEMORYVERSE_FALLBACKS.closingCta;

  return (
    <motion.div
      className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-8 px-8 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.8 }}
      /* the room slowly warms as the tray empties */
      style={{ background: `radial-gradient(ellipse 90% 70% at 50% 60%, #1d1409 0%, ${MV.void} 68%)` }}
    >
      <DustBeam />

      <AnimatePresence mode="wait">
        {beat === 0 && (
          <motion.p
            key="l1"
            className="m-0 max-w-3xl text-[clamp(26px,4.6vw,56px)] leading-[1.2] tracking-[-0.018em]"
            style={{ ...display, color: MV.screen }}
            initial={{ opacity: 0, filter: "blur(14px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(14px)" }}
            transition={{ duration: 1.6, ease: [0.2, 0.7, 0.2, 1] }}
          >
            {line1}
          </motion.p>
        )}
        {beat === 1 && (
          <motion.p
            key="l2"
            className="m-0 max-w-3xl text-[clamp(22px,3.6vw,42px)] leading-[1.28]"
            style={{ ...display, color: MV.screenDim }}
            initial={{ opacity: 0, filter: "blur(14px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(14px)" }}
            transition={{ duration: 1.6, ease: [0.2, 0.7, 0.2, 1] }}
          >
            {line2}
          </motion.p>
        )}
        {beat === 2 && (
          <motion.div
            key="end"
            className="flex flex-col items-center gap-9"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
          >
            <motion.span
              className="block text-[38px] leading-none"
              style={{ filter: `drop-shadow(0 0 22px ${MV.ember})` }}
              animate={reduced ? undefined : { scale: [1, 1.16, 1] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            >
              ♥
            </motion.span>
            <p
              className="m-0 max-w-2xl text-[clamp(22px,3.4vw,40px)] leading-[1.26]"
              style={{ ...display, color: MV.screen }}
            >
              {line2}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <motion.a
                href={content.closingHref || "#"}
                className="cursor-pointer rounded-full px-8 py-4 text-[13.5px] tracking-[0.14em] uppercase"
                style={{ ...slate, background: MV.lamp, color: MV.void, textDecoration: "none" }}
                whileHover={{ scale: 1.04, boxShadow: `0 0 34px -6px ${MV.lamp}` }}
                whileTap={{ scale: 0.97 }}
              >
                {cta}
              </motion.a>
              <button
                type="button"
                onClick={onReplay}
                className="cursor-pointer rounded-full px-7 py-4 text-[13.5px] tracking-[0.14em] uppercase"
                style={{
                  ...slate,
                  background: "transparent",
                  border: "1px solid rgba(244,238,227,.24)",
                  color: MV.screenDim,
                }}
              >
                Watch again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Navigation — the carousel remote                                    */
/* ------------------------------------------------------------------ */

function CarouselControls({
  index,
  total,
  onPrev,
  onNext,
  onJump,
  chapters,
}: {
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onJump: (i: number) => void;
  chapters: Chapter[];
}) {
  const [trayOpen, setTrayOpen] = useState(false);
  const remaining = Math.max(0, total - index - 1);
  const minsLeft = Math.max(1, Math.round((remaining * SECONDS_PER_CHAPTER) / 60));

  const btn: CSSProperties = {
    ...slate,
    background: "rgba(10,8,6,.62)",
    border: "1px solid rgba(244,238,227,.16)",
    color: MV.screenDim,
    backdropFilter: "blur(10px)",
  };

  return (
    <>
      {/* slide tray */}
      <AnimatePresence>
        {trayOpen && (
          <motion.div
            className="absolute inset-x-0 bottom-24 z-40 px-5"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 22 }}
            transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div
              className="mx-auto flex max-w-3xl flex-wrap justify-center gap-2 rounded-2xl p-4"
              style={{ background: "rgba(10,8,6,.85)", border: "1px solid rgba(244,238,227,.12)", backdropFilter: "blur(14px)" }}
            >
              {chapters.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    onJump(i);
                    setTrayOpen(false);
                  }}
                  aria-current={i === index}
                  className="cursor-pointer rounded-lg px-3 py-2 text-left text-[11.5px] leading-tight"
                  style={{
                    ...body,
                    maxWidth: 170,
                    background: i === index ? "rgba(232,178,106,.18)" : "transparent",
                    border: `1px solid ${i === index ? MV.lamp : "rgba(244,238,227,.14)"}`,
                    color: i === index ? MV.screen : MV.screenDim,
                  }}
                >
                  <span className="block text-[9px] tracking-[0.16em]" style={{ ...slate, color: MV.slate }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="line-clamp-2 block">
                    {c.hidden ? "Hidden slide" : c.title || "Untitled"}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* remote */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex flex-col items-center gap-3 px-5 pb-6">
        {/* tray progress */}
        <div className="pointer-events-auto flex w-full max-w-md items-center gap-3">
          <span className="text-[10px] tracking-[0.16em] tabular-nums" style={{ ...slate, color: MV.slate }}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="flex h-[3px] flex-1 gap-[3px]">
            {chapters.map((c, i) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onJump(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="h-full flex-1 cursor-pointer rounded-full border-0 p-0"
                style={{ background: i <= index ? MV.lamp : "rgba(244,238,227,.2)" }}
              />
            ))}
          </div>
          <span className="text-[10px] tracking-[0.16em] tabular-nums" style={{ ...slate, color: MV.slate }}>
            {String(total).padStart(2, "0")}
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-2.5">
          <button
            type="button"
            onClick={onPrev}
            disabled={index === 0}
            aria-label="Previous slide"
            className="cursor-pointer rounded-full px-5 py-2.5 text-[11px] tracking-[0.16em] uppercase disabled:cursor-not-allowed disabled:opacity-35"
            style={btn}
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={() => setTrayOpen((v) => !v)}
            aria-expanded={trayOpen}
            aria-label="Jump to a slide"
            className="cursor-pointer rounded-full px-5 py-2.5 text-[11px] tracking-[0.16em] uppercase"
            style={btn}
          >
            Tray
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label={index === total - 1 ? "Finish" : "Next slide"}
            className="cursor-pointer rounded-full px-5 py-2.5 text-[11px] tracking-[0.16em] uppercase"
            style={{ ...btn, background: "rgba(232,178,106,.9)", color: MV.void, borderColor: "transparent" }}
          >
            {index === total - 1 ? "Finish" : "Next →"}
          </button>
        </div>

        <span className="text-[9.5px] tracking-[0.18em] uppercase" style={{ ...slate, color: MV.slate }}>
          {remaining === 0 ? "last slide" : `about ${minsLeft} min left`}
        </span>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* The projector lamp that follows your cursor                         */
/* ------------------------------------------------------------------ */

function LampCursor({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !active || reduced) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let raf = 0;
    let shown = false;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!shown) {
        shown = true;
        el.style.opacity = "1";
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const tick = () => {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      el.style.transform = `translate3d(${x - 190}px, ${y - 190}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [active, reduced]);

  if (!active) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[25] h-[380px] w-[380px] rounded-full opacity-0"
      style={{
        background: `radial-gradient(circle, rgba(232,178,106,.14) 0%, rgba(232,178,106,.05) 42%, transparent 70%)`,
        mixBlendMode: "screen",
        transition: "opacity .6s ease",
        willChange: "transform",
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* The whole experience                                                */
/* ------------------------------------------------------------------ */

const ENTER = {
  fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
  rise: {
    initial: { opacity: 0, y: 46, scale: 1.02 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -34, scale: 0.99 },
  },
  drift: {
    initial: { opacity: 0, x: 54, filter: "blur(10px)" },
    animate: { opacity: 1, x: 0, filter: "blur(0px)" },
    exit: { opacity: 0, x: -44, filter: "blur(10px)" },
  },
} as const;

export function MemoryverseView({
  content,
  /** The editor passes this so its preview starts on the slide being edited. */
  previewIndex,
  embedded = false,
}: {
  content: MemoryverseContent;
  previewIndex?: number;
  embedded?: boolean;
}) {
  const reduced = useReducedMotion();
  const chapters = content.chapters;
  const total = chapters.length;

  /**
   * When the editor passes `previewIndex` it wants the preview to open straight
   * on that slide — so it seeds initial state rather than being synced in an
   * effect. The editor remounts this component (via `key`) when the selected
   * slide changes, which is what makes seeding sufficient, and leaves the
   * recipient free to navigate away from it afterwards.
   */
  const [stage, setStage] = useState<Stage>(() =>
    typeof previewIndex === "number" ? (total > 0 ? "chapters" : "cover") : "warmup"
  );
  const [index, setIndex] = useState(() =>
    typeof previewIndex === "number" ? Math.max(0, Math.min(previewIndex, Math.max(0, total - 1))) : 0
  );
  const [musicOn, setMusicOn] = useState(false);
  const musicRef = useRef<HTMLAudioElement>(null);
  const lastNav = useRef(0);

  const introLines = useMemo(
    () => (content.introLines.length > 0 ? content.introLines : [...MEMORYVERSE_FALLBACKS.introLines]),
    [content.introLines]
  );

  const goNext = useCallback(() => {
    const now = Date.now();
    if (now - lastNav.current < 450) return;
    lastNav.current = now;
    setIndex((i) => {
      if (i >= total - 1) {
        setStage("final");
        return i;
      }
      return i + 1;
    });
  }, [total]);

  const goPrev = useCallback(() => {
    const now = Date.now();
    if (now - lastNav.current < 450) return;
    lastNav.current = now;
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  /*
   * Keyboard, wheel — only while slides are on screen, and only when this owns
   * the viewport.
   *
   * These are bound to `window`, which is right when the projector *is* the page
   * and wrong the moment it is one section of something longer: a scroll
   * anywhere on a Personalized Website would advance slides down here, out of sight.
   * Embedded, the on-screen arrows and the chapter tray are the way through, and
   * the page scrolls like a page.
   */
  useEffect(() => {
    if (stage !== "chapters" || embedded) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "Home") {
        setIndex(0);
      } else if (e.key === "End") {
        setIndex(Math.max(0, total - 1));
      }
    };

    let wheelLock = 0;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 18) return;
      const now = Date.now();
      if (now - wheelLock < 620) return;
      wheelLock = now;
      if (e.deltaY > 0) goNext();
      else goPrev();
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onWheel);
    };
  }, [stage, embedded, goNext, goPrev, total]);

  const beginJourney = () => {
    if (content.musicUrl && musicRef.current) {
      void musicRef.current
        .play()
        .then(() => setMusicOn(true))
        .catch(() => setMusicOn(false));
    }
    setStage(total > 0 ? "chapters" : "final");
  };

  const toggleMusic = () => {
    const el = musicRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play().then(() => setMusicOn(true)).catch(() => undefined);
    } else {
      el.pause();
      setMusicOn(false);
    }
  };

  const current = chapters[index];
  const variants = ENTER[reduced ? "fade" : (current?.transition ?? "rise")];

  return (
    <div
      className={`${fraunces.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable} ${gochiHand.variable} relative w-full overflow-hidden`}
      style={{
        background: MV.void,
        color: MV.screen,
        ...body,
        height: embedded ? "100%" : "100dvh",
      }}
      aria-label="A Memoryverse"
    >
      {/* Ambient layers that belong to the room, not to any one slide. */}
      <ProjectorVignette />
      <FilmGrain opacity={embedded ? 0.14 : 0.2} />
      <LampCursor active={!embedded && stage === "chapters"} />

      {content.musicUrl && (
        <audio ref={musicRef} src={content.musicUrl} loop preload="none" className="sr-only" />
      )}

      <AnimatePresence>
        {stage === "warmup" && (
          <ProjectorWarmup key="warmup" skip={Boolean(reduced || embedded)} onDone={() => setStage("intro")} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stage === "intro" && (
          <IntroSequence key="intro" lines={introLines} onDone={() => setStage("cover")} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stage === "cover" && (
          <CoverPage key="cover" content={content} onBegin={beginJourney} chapterCount={total} />
        )}
      </AnimatePresence>

      {/* Slides. mode="wait" is what gives the dip to black between them —
          the outgoing slide finishes leaving before the next one arrives. */}
      {stage === "chapters" && current && (
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              className="absolute inset-0 z-10"
              initial={variants.initial}
              animate={variants.animate}
              exit={variants.exit}
              transition={{ duration: reduced ? 0.25 : 1.05, ease: [0.3, 0.75, 0.25, 1] }}
              drag={reduced ? false : "x"}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.14}
              onDragEnd={(_, info) => {
                if (info.offset.x < -90) goNext();
                else if (info.offset.x > 90) goPrev();
              }}
            >
              {current.hidden ? (
                <HiddenGate chapter={current}>
                  <ChapterRenderer chapter={current} index={index} total={total} />
                </HiddenGate>
              ) : (
                <ChapterRenderer chapter={current} index={index} total={total} />
              )}
            </motion.div>
          </AnimatePresence>

          <CarouselControls
            index={index}
            total={total}
            chapters={chapters}
            onPrev={goPrev}
            onNext={goNext}
            onJump={setIndex}
          />

          {content.musicUrl && (
            <button
              type="button"
              onClick={toggleMusic}
              aria-label={musicOn ? "Turn music off" : "Turn music on"}
              className="absolute right-5 top-5 z-40 cursor-pointer rounded-full px-4 py-2.5 text-[10px] tracking-[0.18em] uppercase"
              style={{
                ...slate,
                background: "rgba(10,8,6,.6)",
                border: "1px solid rgba(244,238,227,.16)",
                color: musicOn ? MV.lamp : MV.slate,
                backdropFilter: "blur(10px)",
              }}
            >
              {musicOn ? "♪ on" : "♪ off"}
            </button>
          )}
        </>
      )}

      {stage === "chapters" && !current && (
        <div className="absolute inset-0 z-10 flex items-center justify-center px-8 text-center">
          <p className="m-0 text-[19px]" style={{ ...body, color: MV.screenDim }}>
            This story has no slides in the tray yet.
          </p>
        </div>
      )}

      <AnimatePresence>
        {stage === "final" && (
          <FinalPage
            key="final"
            content={content}
            onReplay={() => {
              setIndex(0);
              setStage(total > 0 ? "chapters" : "cover");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
