"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ibmPlexMono } from "@/app/fonts";
import { LETTER_FONT_VARS } from "@/app/letterFonts";
import {
  Curtain,
  LoadingVeil,
  SceneStage,
  useNarration,
  useScene,
  useSettled,
  type Beat,
} from "@/lib/engines/scene";
import { Bloom, Drift, DustMotes, Glow, Grain, Starfield, Sunbeam } from "@/lib/engines/scene/ambient";
import { BOX_MATERIALS, LiddedBox, SoftParticles } from "@/lib/engines/gift";
import { MemoryBlockView } from "@/lib/engines/memory-block";
import type { BlockSkin } from "@/lib/engines/memory-block/schema";
import { PuzzleBoard, type BoardHandle } from "./Board";
import {
  MP_FALLBACKS,
  earnedMilestones,
  nextMilestone,
  puzzleKey,
  type MemoryPuzzleContent,
  type Milestone,
  type Secret,
} from "./schema";
import { BODY_FONT, CUTS, DISPLAY_FONT, HAND_FONT, MONO_FONT, SURFACES } from "./theme";

/**
 * Memory Puzzle — the recipient's experience.
 *
 * Five beats: the table, the box opening, the puzzle, the reveal, the frame on the
 * wall. Everything structural comes from the engines; everything you can *see* is
 * this experience's own. It is deliberately the brightest thing in the catalogue —
 * an afternoon, not an evening.
 */

type BeatId = "table" | "opening" | "solving" | "reveal" | "framed";

const BEATS: readonly Beat<BeatId>[] = [
  { id: "table", hold: 1400 },
  { id: "opening" },
  { id: "solving" },
  { id: "reveal" },
  { id: "framed" },
];

/* ------------------------------------------------------------------ */

/** The air this surface calls for. */
function Air({ surface }: { surface: (typeof SURFACES)[keyof typeof SURFACES] }) {
  return (
    <>
      {surface.beam && <Sunbeam color={`${surface.glow}`} angle={-16} width="42%" from="14%" />}
      {surface.air === "dust" && <DustMotes count={28} color="#fff6e2" seed="mp-dust" opacity={0.4} />}
      {surface.air === "stars" && <Starfield count={22} color="#fff0c8" seed="mp-stars" />}
      {surface.air === "petals" && <Drift count={11} color={surface.accent} seed="mp-petals" glyph="✿" opacity={0.34} speed={26} />}
      {surface.air === "snow" && <Drift count={16} color="#ffffff" seed="mp-snow" opacity={0.32} speed={24} />}
      <Glow color={surface.glow} at="50% 40%" size="66% 48%" />
    </>
  );
}

/** Tiny flowers on the table — drawn, because the brief asked for them by name. */
function TableFlowers({ color, soft }: { color: string; soft: string }) {
  const spots: { left?: string; right?: string; bottom: string; size: number; tilt: number }[] = [
    { left: "6%", bottom: "8%", size: 1, tilt: -8 },
    { left: "13%", bottom: "4%", size: 0.72, tilt: 12 },
    { right: "7%", bottom: "6%", size: 0.88, tilt: 6 },
  ];
  return (
    <>
      {spots.map((s, i) => (
        <span
          key={i}
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            left: s.left,
            right: s.right,
            bottom: s.bottom,
            width: 44 * s.size,
            height: 44 * s.size,
            transform: `rotate(${s.tilt}deg)`,
            opacity: 0.5,
          }}
        >
          <svg viewBox="0 0 40 40" className="h-full w-full">
            <path d="M20 38 L20 22" stroke={soft} strokeWidth="1.6" fill="none" strokeLinecap="round" />
            <path d="M20 30 C 14 28, 11 23, 12 20" stroke={soft} strokeWidth="1.2" fill="none" strokeLinecap="round" />
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} cx="20" cy="13" rx="3.4" ry="6" fill={color} opacity="0.8" transform={`rotate(${a} 20 20)`} />
            ))}
            <circle cx="20" cy="20" r="2.6" fill={soft} />
          </svg>
        </span>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */

export function MemoryPuzzleView({
  content,
  embedded = false,
}: {
  content: MemoryPuzzleContent;
  embedded?: boolean;
}) {
  const reduced = useReducedMotion();
  const surface = SURFACES[content.surface] ?? SURFACES.woodDesk;
  const cut = CUTS[content.cut];
  const scene = useScene<BeatId>(BEATS);
  const settled = useSettled(embedded ? 200 : 1100);

  const [progress, setProgress] = useState<BoardHandle>({ percent: 0, placed: 0, total: content.size * content.size });
  const [boxOpen, setBoxOpen] = useState(false);
  const [shownMilestone, setShownMilestone] = useState<Milestone | null>(null);
  const [collected, setCollected] = useState<Milestone[]>([]);
  const [secret, setSecret] = useState<Secret | null>(null);
  const [music, setMusic] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const lines = content.openingLines.length > 0 ? content.openingLines : [...MP_FALLBACKS.openingLines];
  const narrated = useNarration(lines.length, 1450, scene.beat === "table" ? 600 : 0);

  /* The block skin — how *this* experience draws a memory. */
  const blockSkin: BlockSkin = useMemo(
    () => ({
      ink: surface.ink,
      inkSoft: surface.inkSoft,
      accent: surface.accent,
      accentSoft: surface.accentSoft,
      surface: "#1c1408",
      edge: surface.trayEdge,
      display: DISPLAY_FONT,
      hand: HAND_FONT,
      body: BODY_FONT,
      mono: MONO_FONT,
    }),
    [surface]
  );

  /* ---------- milestones ---------- */

  const earned = useMemo(() => earnedMilestones(content, progress.percent), [content, progress.percent]);
  const upcoming = nextMilestone(content, progress.percent);

  /* A newly-earned milestone interrupts, once. Comparing against what we've
     already collected is what keeps it from firing again on every re-render. */
  useEffect(() => {
    const fresh = earned.find((m) => !collected.some((c) => c.at === m.at));
    if (!fresh) return;
    const id = setTimeout(() => {
      setCollected((c) => [...c, fresh]);
      /* 100% is not a pop-up — it's the reveal, which the board's own callback
         drives. Everything before it interrupts with the reward. */
      if (fresh.at < 100) setShownMilestone(fresh);
    }, 620);
    return () => clearTimeout(id);
  }, [earned, collected]);

  const startMusic = useCallback(() => {
    const el = audioRef.current;
    if (!el || !el.paused) return;
    void el.play().then(() => setMusic(true)).catch(() => setMusic(false));
  }, []);

  const onSolved = useCallback(() => {
    /* Let the last piece settle before anything else happens — the brief asked
       for everything to pause here, and a beat of silence is that pause. */
    setTimeout(() => scene.go("reveal"), 900);
    startMusic();
  }, [scene, startMusic]);

  const onProgress = useCallback((state: BoardHandle) => setProgress(state), []);
  const onSecret = useCallback((s: Secret) => setSecret(s), []);

  /* The finished picture, masked if the cut says so. */
  const finishedMask =
    cut.mask === "heart"
      ? "path('M 50 95 C 5 62, 8 12, 50 30 C 92 12, 95 62, 50 95 Z')"
      : cut.mask === "circle"
        ? "circle(50% at 50% 50%)"
        : undefined;

  return (
    <div className={`${ibmPlexMono.variable} ${LETTER_FONT_VARS} relative w-full`}>
      {!embedded && (
        <LoadingVeil show={!settled} background={surface.bg} color={surface.inkSoft} label="setting the table">
          <motion.span
            aria-hidden
            style={{ width: 52, height: 52, display: "block" }}
            animate={reduced ? undefined : { rotate: [0, 90, 180, 270, 360] }}
            transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg viewBox="0 0 40 40" className="h-full w-full">
              <path
                d="M4 4 H24 C24 10, 30 10, 30 4 H36 V24 C30 24, 30 30, 36 30 V36 H16 C16 30, 10 30, 10 36 H4 Z"
                fill="none"
                stroke={surface.accent}
                strokeWidth="1.6"
              />
            </svg>
          </motion.span>
        </LoadingVeil>
      )}

      <SceneStage background={surface.bg} embedded={embedded} vignette="rgba(0,0,0,.32)">
        <Air surface={surface} />
        <Grain opacity={0.045} />

        <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center px-5 py-12 sm:px-8 sm:py-16">
          {/* ---------- beats ---------- */}
          <Curtain beat={scene.beat} kind={scene.beat === "framed" ? "rise" : "fade"} className="w-full">
            {/* --- the table, and the box --- */}
            {(scene.beat === "table" || scene.beat === "opening") && (
              <div className="flex flex-col items-center gap-9">
                <div className="min-h-[104px] text-center">
                  {lines.map((line, i) => (
                    <motion.p
                      key={i}
                      className="m-0"
                      style={{
                        fontFamily: HAND_FONT,
                        fontSize: "clamp(20px,3.2vw,29px)",
                        lineHeight: 1.5,
                        color: surface.ink,
                      }}
                      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10, filter: "blur(6px)" }}
                      animate={
                        narrated > i
                          ? { opacity: 1, y: 0, filter: "blur(0px)" }
                          : { opacity: 0, y: 10, filter: "blur(6px)" }
                      }
                      transition={{ duration: 1.1, ease: "easeOut" }}
                    >
                      {line}
                    </motion.p>
                  ))}
                </div>

                <LiddedBox
                  open={boxOpen}
                  material={BOX_MATERIALS.walnut}
                  glow={surface.glow.replace(/[\d.]+\)$/, "0.6)")}
                  width="min(400px, 86%)"
                  onOpen={() => {
                    if (boxOpen) return;
                    setBoxOpen(true);
                    /* The pieces float up out of it, then the puzzle begins. */
                    setTimeout(() => scene.go("solving"), reduced ? 400 : 1900);
                  }}
                  lidLabel={
                    <span className="flex flex-col items-center gap-2">
                      <span style={{ fontFamily: DISPLAY_FONT, fontSize: "clamp(18px,2.6vw,25px)", letterSpacing: ".01em" }}>
                        {content.boxLabel || MP_FALLBACKS.boxLabel}
                      </span>
                      <span style={{ fontFamily: MONO_FONT, fontSize: 8.5, letterSpacing: ".26em", textTransform: "uppercase", opacity: 0.7 }}>
                        {boxOpen ? "" : "lift the lid"}
                      </span>
                    </span>
                  }
                >
                  {/* pieces rising out of the box */}
                  <div className="relative h-full w-full">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <motion.span
                        key={i}
                        aria-hidden
                        className="absolute"
                        style={{
                          left: `${12 + i * 14}%`,
                          top: "58%",
                          width: 26,
                          height: 26,
                          background: content.imageUrl ? `url(${content.imageUrl}) ${i * 20}% ${i * 14}%/300% 300%` : surface.accentSoft,
                          borderRadius: 2,
                          boxShadow: "0 6px 12px -4px rgba(0,0,0,.6)",
                        }}
                        animate={
                          boxOpen && !reduced
                            ? { y: [0, -70 - i * 12], opacity: [0, 1, 0.9], rotate: [0, i % 2 ? 24 : -24] }
                            : { opacity: 0 }
                        }
                        transition={{ duration: 1.8, delay: 0.5 + i * 0.11, ease: "easeOut" }}
                      />
                    ))}
                  </div>
                </LiddedBox>

                <TableFlowers color={surface.accent} soft={surface.inkSoft} />

                {!boxOpen && scene.beat === "table" && narrated < lines.length && (
                  <button
                    type="button"
                    onClick={scene.next}
                    className="cursor-pointer border-0 bg-transparent"
                    style={{ fontFamily: MONO_FONT, fontSize: 9, letterSpacing: ".22em", textTransform: "uppercase", color: surface.inkSoft }}
                  >
                    skip ahead
                  </button>
                )}
              </div>
            )}

            {/* --- the puzzle --- */}
            {scene.beat === "solving" && (
              <div className="flex flex-col items-center gap-7">
                <header className="text-center">
                  <div style={{ fontFamily: MONO_FONT, fontSize: 9, letterSpacing: ".3em", textTransform: "uppercase", color: surface.accent }}>
                    {cut.label} · {content.size} × {content.size}
                  </div>
                  {upcoming ? (
                    <p className="m-0 mt-3" style={{ fontFamily: HAND_FONT, fontSize: 20, color: surface.inkSoft }}>
                      Something unlocks at {upcoming.at}%.
                    </p>
                  ) : (
                    <p className="m-0 mt-3" style={{ fontFamily: HAND_FONT, fontSize: 20, color: surface.inkSoft }}>
                      Keep going.
                    </p>
                  )}
                </header>

                {/* how far along, as a thin gilt rule rather than a game bar */}
                <div className="w-full max-w-md">
                  <div className="relative h-[2px] w-full" style={{ background: surface.accentSoft }}>
                    <motion.span
                      className="absolute left-0 top-0 h-full"
                      style={{ background: surface.accent }}
                      animate={{ width: `${progress.percent}%` }}
                      transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
                    />
                    {content.milestones.map((m) => (
                      <span
                        key={m.at}
                        aria-hidden
                        className="absolute top-1/2 rounded-full"
                        style={{
                          left: `${m.at}%`,
                          width: 7,
                          height: 7,
                          transform: "translate(-50%,-50%)",
                          background: progress.percent >= m.at ? surface.accent : surface.tray,
                          border: `1px solid ${surface.accent}`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                <PuzzleBoard
                  content={content}
                  onProgress={onProgress}
                  onSecret={onSecret}
                  onSolved={onSolved}
                  storageKey={embedded ? undefined : puzzleKey(content)}
                />

                {/* what they've earned so far, small and to one side */}
                {collected.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {collected
                      .filter((m) => m.at < 100)
                      .map((m) => (
                        <button
                          key={m.at}
                          type="button"
                          onClick={() => setShownMilestone(m)}
                          className="cursor-pointer rounded-full border bg-transparent px-3 py-1.5"
                          style={{ borderColor: surface.accentSoft, color: surface.inkSoft, fontFamily: MONO_FONT, fontSize: 9, letterSpacing: ".16em", textTransform: "uppercase" }}
                        >
                          {m.at}% · see it again
                        </button>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* --- the reveal --- */}
            {scene.beat === "reveal" && (
              <div className="relative flex flex-col items-center gap-8">
                <Bloom color={surface.glow} play />
                <SoftParticles play color={surface.accent} count={24} seed="mp-reveal" />

                <motion.div
                  className="relative w-full"
                  style={{ maxWidth: "min(560px, 100%)" }}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.8, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  {content.videoUrl ? (
                    <video
                      src={content.videoUrl}
                      controls
                      autoPlay
                      playsInline
                      className="block w-full"
                      style={{ borderRadius: 3, clipPath: finishedMask, background: "#000" }}
                      aria-label={content.imageAlt || "The finished memory"}
                    />
                  ) : (
                    <div
                      className="relative overflow-hidden"
                      style={{ aspectRatio: "1", borderRadius: 3, clipPath: finishedMask, boxShadow: `0 40px 80px -34px rgba(0,0,0,.75)` }}
                    >
                      {content.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={content.imageUrl} alt={content.imageAlt || "The finished memory"} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center" style={{ background: surface.tray, color: surface.inkSoft, fontFamily: BODY_FONT, fontSize: 13 }}>
                          No picture attached yet
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>

                {/* the closing line, handwritten, arriving last */}
                <motion.p
                  className="m-0 max-w-lg text-center"
                  style={{ fontFamily: HAND_FONT, fontSize: "clamp(21px,3.4vw,31px)", lineHeight: 1.45, color: surface.ink }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 2.2, delay: 1.5 }}
                >
                  {content.closingLine || MP_FALLBACKS.closingLine}
                </motion.p>

                {/* the 100% reward, if there is one */}
                {(() => {
                  const final = content.milestones.find((m) => m.at === 100);
                  if (!final) return null;
                  return (
                    <motion.div
                      className="w-full max-w-lg"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 1.4, delay: 2.4 }}
                    >
                      {final.headline && (
                        <p className="m-0 mb-5 text-center" style={{ fontFamily: MONO_FONT, fontSize: 9.5, letterSpacing: ".26em", textTransform: "uppercase", color: surface.accent }}>
                          {final.headline}
                        </p>
                      )}
                      <MemoryBlockView block={final.reward} skin={blockSkin} writeOn />
                    </motion.div>
                  );
                })()}

                <motion.button
                  type="button"
                  onClick={() => scene.go("framed")}
                  className="cursor-pointer rounded-full border-0 px-7 py-3"
                  style={{ background: surface.accent, color: surface.tray.includes("#2") ? "#f6ead6" : "#241a0c", fontFamily: MONO_FONT, fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 3.2 }}
                >
                  Hang it up
                </motion.button>
              </div>
            )}

            {/* --- the frame on the wall --- */}
            {scene.beat === "framed" && (
              <div className="flex flex-col items-center gap-9 py-6">
                {/* the nail */}
                <span aria-hidden className="rounded-full" style={{ width: 7, height: 7, background: surface.accent, boxShadow: `0 0 10px ${surface.accent}` }} />
                <motion.div
                  className="relative"
                  style={{ width: "min(440px, 88%)", transformOrigin: "50% -24px" }}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, rotate: -3, y: -14 }}
                  animate={{ opacity: 1, rotate: [-3, 2, -1, 0.4, 0], y: 0 }}
                  transition={{ duration: reduced ? 0.3 : 3.4, ease: "easeOut" }}
                >
                  {/* the frame */}
                  <div
                    className="relative"
                    style={{
                      padding: "6%",
                      background: "linear-gradient(158deg, #6b4526, #4a2f19)",
                      borderRadius: 3,
                      boxShadow: "0 40px 70px -30px rgba(0,0,0,.8), inset 0 1px 0 rgba(255,236,200,.24)",
                    }}
                  >
                    <div className="relative overflow-hidden" style={{ aspectRatio: "1", background: "#000", boxShadow: "inset 0 0 0 3px rgba(255,246,226,.9)" }}>
                      {content.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={content.imageUrl} alt={content.imageAlt || "The finished memory, framed"} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full" style={{ background: surface.tray }} />
                      )}
                      {/* glass */}
                      <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(128deg, rgba(255,255,255,.16) 0%, transparent 38%)" }} />
                    </div>
                  </div>
                </motion.div>

                <motion.p
                  className="m-0 max-w-md text-center"
                  style={{ fontFamily: HAND_FONT, fontSize: "clamp(20px,3.2vw,28px)", lineHeight: 1.45, color: surface.ink }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.8, delay: 1.2 }}
                >
                  {content.framedCaption || MP_FALLBACKS.framedCaption}
                </motion.p>

                {/* everything they collected on the way */}
                {collected.filter((m) => m.at < 100).length > 0 && (
                  <div className="w-full max-w-lg">
                    <div
                      aria-hidden
                      className="mx-auto mb-6"
                      style={{ width: 100, height: 1, background: `linear-gradient(to right, transparent, ${surface.accent}, transparent)` }}
                    />
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {collected
                        .filter((m) => m.at < 100)
                        .map((m) => (
                          <button
                            key={m.at}
                            type="button"
                            onClick={() => setShownMilestone(m)}
                            className="cursor-pointer rounded-full border bg-transparent px-3.5 py-2"
                            style={{ borderColor: surface.accentSoft, color: surface.inkSoft, fontFamily: MONO_FONT, fontSize: 9, letterSpacing: ".16em", textTransform: "uppercase" }}
                          >
                            {m.reward.title || `${m.at}%`}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {!embedded && (
                  <a
                    href="/templates"
                    className="rounded-full border px-6 py-3 no-underline"
                    style={{ borderColor: surface.accentSoft, color: surface.ink, fontFamily: MONO_FONT, fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase" }}
                  >
                    Frame another memory
                  </a>
                )}
              </div>
            )}
          </Curtain>
        </div>

        {content.musicUrl && (
          <>
            <audio ref={audioRef} src={content.musicUrl} loop preload="none" className="sr-only" />
            <button
              type="button"
              onClick={() => {
                const el = audioRef.current;
                if (!el) return;
                if (el.paused) startMusic();
                else {
                  el.pause();
                  setMusic(false);
                }
              }}
              className="absolute bottom-5 right-5 cursor-pointer rounded-full border px-3.5 py-2"
              style={{ background: "rgba(0,0,0,.24)", borderColor: surface.accentSoft, color: surface.inkSoft, fontFamily: MONO_FONT, fontSize: 9, letterSpacing: ".16em", textTransform: "uppercase" }}
            >
              {music ? "❙❙" : "▶"} music
            </button>
          </>
        )}
      </SceneStage>

      {/* ---------- a milestone unlocking ---------- */}
      <AnimatePresence>
        {shownMilestone && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-5 sm:p-9"
            style={{ background: "rgba(20,12,4,.86)", backdropFilter: "blur(6px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Unlocked at ${shownMilestone.at} percent`}
            /*
             * No dismiss-on-backdrop here, deliberately.
             *
             * This is the one screen in the puzzle somebody earned. It arrives
             * unannounced, mid-drag, with a hand already moving — and a stray
             * click on the surround used to throw away the thing they had just
             * worked for, with no way back to it. It closes on the ✕ or on "back
             * to the puzzle", both of which are a decision rather than a twitch.
             */
          >
            <motion.div
              className="relative my-auto w-full max-w-xl"
              style={{
                background: surface.tray,
                border: `1px solid ${surface.trayEdge}`,
                borderRadius: 5,
                boxShadow: `0 60px 110px -50px #000, 0 0 90px -34px ${surface.glow}`,
                transformOrigin: "50% 0%",
              }}
              /* Paper physics from the Paper Engine's rule: it hinges open. */
              initial={reduced ? { opacity: 0 } : { opacity: 0, rotateX: -84, scaleY: 0.3 }}
              animate={{ opacity: 1, rotateX: 0, scaleY: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, rotateX: -56, scaleY: 0.5 }}
              transition={{ duration: reduced ? 0.25 : 1, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <Grain opacity={0.05} />
              <button
                type="button"
                onClick={() => setShownMilestone(null)}
                aria-label="Close"
                className="absolute right-3.5 top-3.5 z-10 cursor-pointer rounded-full border-0"
                style={{ width: 34, height: 34, background: "rgba(0,0,0,.36)", color: surface.inkSoft, fontSize: 15 }}
              >
                ✕
              </button>
              <div className="px-6 py-11 sm:px-11 sm:py-13">
                <div className="mb-7 text-center">
                  <div style={{ fontFamily: MONO_FONT, fontSize: 9, letterSpacing: ".3em", textTransform: "uppercase", color: surface.accent }}>
                    {shownMilestone.at}% · unlocked
                  </div>
                  {shownMilestone.headline && (
                    <p className="m-0 mt-4" style={{ fontFamily: HAND_FONT, fontSize: "clamp(20px,3.2vw,28px)", lineHeight: 1.4, color: surface.ink }}>
                      {shownMilestone.headline}
                    </p>
                  )}
                </div>
                <MemoryBlockView block={shownMilestone.reward} skin={blockSkin} writeOn showLabel />
              </div>
              <div className="px-6 pb-8 text-center sm:px-11">
                <button
                  type="button"
                  onClick={() => setShownMilestone(null)}
                  className="cursor-pointer rounded-full border bg-transparent px-6 py-2.5"
                  style={{ borderColor: surface.accentSoft, color: surface.ink, fontFamily: MONO_FONT, fontSize: 9.5, letterSpacing: ".18em", textTransform: "uppercase" }}
                >
                  back to the puzzle
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- a secret inside a piece ---------- */}
      <AnimatePresence>
        {secret && (
          <motion.button
            type="button"
            className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center border-0 p-6"
            style={{ background: "rgba(20,12,4,.7)", backdropFilter: "blur(4px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            aria-label="Close"
            onClick={() => setSecret(null)}
          >
            <motion.div
              className="max-w-sm text-center"
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.86, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.7, ease: [0.2, 1.3, 0.4, 1] }}
            >
              <div aria-hidden style={{ fontSize: 30, color: surface.accent, marginBottom: 14 }}>
                {secret.kind === "flower" ? "✿" : secret.kind === "doodle" ? "✎" : secret.kind === "date" ? "📅" : secret.kind === "voice" ? "🎙" : secret.kind === "sparkle" ? "✦" : "❝"}
              </div>
              <p className="m-0" style={{ fontFamily: HAND_FONT, fontSize: "clamp(19px,3vw,27px)", lineHeight: 1.45, color: "#fff8ea" }}>
                {secret.text}
              </p>
              {secret.audioUrl && (
                <audio src={secret.audioUrl} controls className="mx-auto mt-5 block" aria-label="A voice hidden in this piece" />
              )}
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
