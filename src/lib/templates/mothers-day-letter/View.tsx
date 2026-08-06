"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ibmPlexMono } from "@/app/fonts";
import { LETTER_FONT_VARS } from "@/app/letterFonts";
import { DustMotes, Glow, Grain, Sunbeam } from "@/lib/engines/scene/ambient";
import { useNarration } from "@/lib/engines/scene";
import { Handwritten, collectPauses, countWords, useWriteCursor, type InkStyle } from "@/lib/engines/paper/ink";
import { useAmbientSound } from "@/lib/engines/sound";
import { Butterflies, FallingPetal, GrowingGarden } from "./garden";
import {
  Decoration,
  FavouriteMemory,
  LessonCards,
  PhotoLightbox,
  ThankYouNotes,
  TuckedPolaroid,
  VoiceSeal,
} from "./sections";
import {
  MD_FALLBACKS,
  bloomAt,
  gardenSize,
  inkFlow,
  paragraphsOf,
  type MothersDayContent,
  type Polaroid,
} from "./schema";
import {
  ENVELOPE_STYLES,
  GARDEN,
  HANDS,
  INKS,
  MONO_FONT,
  PAPERS,
  PAPER_COLOURS,
  ROOM,
  SEAL_COLOURS,
} from "./theme";

/**
 * Mother's Day Letter — the recipient's experience.
 *
 * Four movements: the table in the morning, the envelope opening, the letter
 * writing itself on, and the letter folding back up.
 *
 * The pacing is the design. Nothing here hurries: the ink arrives a word at a
 * time, the sections appear as she scrolls to them, and the garden takes the whole
 * letter to come into flower. The brief's most important line was that this must
 * never feel like reading a digital page, and the only way to earn that is to
 * refuse to be quick.
 */

type Movement = "table" | "opening" | "letter" | "folding" | "done";

/* ------------------------------------------------------------------ */
/* The wax seal, with her symbol pressed into it                       */
/* ------------------------------------------------------------------ */

function Seal({
  content,
  cracked,
  onClick,
}: {
  content: MothersDayContent;
  cracked: boolean;
  onClick?: () => void;
}) {
  const reduced = useReducedMotion();
  const c = SEAL_COLOURS[content.sealColour];
  const symbol = content.sealSymbol;

  const glyph = () => {
    switch (symbol) {
      case "heart":
        return <path d="M20 31 C 8 22, 9 12, 15 12 C 18 12, 20 15.5, 20 17 C 20 15.5, 22 12, 25 12 C 31 12, 32 22, 20 31 Z" fill="currentColor" />;
      case "flower":
        return (
          <>
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} cx="20" cy="12" rx="3.4" ry="6.2" fill="currentColor" opacity="0.9" transform={`rotate(${a} 20 20)`} />
            ))}
            <circle cx="20" cy="20" r="2.6" fill="currentColor" />
          </>
        );
      case "rose":
        return (
          <>
            <circle cx="20" cy="19" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M20 8 C 28 11, 30 20, 20 28 C 10 20, 12 11, 20 8 Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M20 28 L20 33" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </>
        );
      case "butterfly":
        return (
          <>
            <path d="M20 21 C 13 12, 5 14, 8 21 C 5 28, 13 30, 20 21 Z" fill="currentColor" opacity="0.9" />
            <path d="M20 21 C 27 12, 35 14, 32 21 C 35 28, 27 30, 20 21 Z" fill="currentColor" opacity="0.9" />
            <path d="M20 16 L20 27" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </>
        );
      case "tree":
        return (
          <>
            <path d="M20 33 L20 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M20 22 C 11 20, 9 11, 20 7 C 31 11, 29 20, 20 22 Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M20 26 L14 22 M20 26 L26 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </>
        );
      default:
        return null;
    }
  };

  const letters = symbol === "letterM" ? "M" : symbol === "initial" ? (content.sealInitial || "M").slice(0, 2) : "";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      aria-label={onClick ? "Open the letter" : "The seal"}
      className={`relative flex items-center justify-center rounded-full border-0 ${onClick ? "cursor-pointer" : "cursor-default"}`}
      style={{
        width: 78,
        height: 78,
        background: `radial-gradient(circle at 34% 28%, ${c.light}, ${c.base} 56%, ${c.deep})`,
        boxShadow: `0 10px 22px -8px ${c.deep}cc, inset 0 2px 6px rgba(255,255,255,.42)`,
        color: c.on,
      }}
      whileHover={onClick && !reduced ? { scale: 1.05 } : undefined}
      animate={
        cracked
          ? { scale: [1, 1.07, 1], rotate: [0, -2, 0] }
          : onClick && !reduced
            ? { boxShadow: [`0 10px 22px -8px ${c.deep}cc, 0 0 0 0 ${c.base}77`, `0 10px 22px -8px ${c.deep}cc, 0 0 0 16px ${c.base}00`] }
            : {}
      }
      transition={cracked ? { duration: 0.6 } : { duration: 2.8, repeat: Infinity }}
    >
      {/* the wax's uneven rim */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{ boxShadow: `inset 0 0 0 2px ${c.deep}44`, opacity: 0.7 }}
      />
      {letters ? (
        <span style={{ fontFamily: "var(--hw-calligraphy), cursive", fontSize: 34, lineHeight: 1 }}>{letters}</span>
      ) : (
        <svg viewBox="0 0 40 40" width="44" height="44" aria-hidden>
          {glyph()}
        </svg>
      )}
      {/* the hairline crack, drawn as it gives */}
      {cracked && (
        <motion.span
          aria-hidden
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <svg viewBox="0 0 78 78" className="h-full w-full">
            <motion.path
              d="M39 4 L36 26 L44 38 L34 52 L40 74"
              fill="none"
              stroke={c.deep}
              strokeWidth="1.6"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
            />
          </svg>
        </motion.span>
      )}
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */

export function MothersDayLetterView({
  content,
  embedded = false,
}: {
  content: MothersDayContent;
  embedded?: boolean;
}) {
  const reduced = useReducedMotion();
  const paper = PAPERS[content.paper] ?? PAPERS.softFloral;
  const colour = PAPER_COLOURS[content.paperColour] ?? PAPER_COLOURS.ivory;
  const env = ENVELOPE_STYLES[content.envelope] ?? ENVELOPE_STYLES.floral;
  const hand = HANDS[content.hand] ?? HANDS.elegant;
  const ink = INKS[content.ink] ?? INKS.sepia;
  const seal = SEAL_COLOURS[content.sealColour] ?? SEAL_COLOURS.roseGold;

  const sound = useAmbientSound({ notesEvery: 6400, gain: 0.14 });

  const [movement, setMovement] = useState<Movement>(embedded ? "letter" : "table");
  const [cracked, setCracked] = useState(false);
  const [lightbox, setLightbox] = useState<Polaroid | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearBeats = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clearBeats, []);

  /* ---------- the ink ---------- */

  const flow = useMemo(() => inkFlow(content), [content]);
  const totalWords = useMemo(() => flow.reduce((n, t) => n + countWords(t), 0), [flow]);
  const pauses = useMemo(() => collectPauses(flow, content.paper), [flow, content.paper]);
  const written = useWriteCursor(totalWords, content.writingSpeed, movement === "letter", pauses);
  const finished = written >= totalWords;

  /* Word offsets per block, precomputed — a counter advanced inside the render
     would be a mutation during render. */
  const blockStarts = useMemo(() => {
    const out: number[] = [];
    let at = 0;
    for (const text of flow) {
      out.push(at);
      at += countWords(text);
    }
    return out;
  }, [flow]);

  const inkStyle: InkStyle = {
    family: hand.family,
    size: 20 * hand.scale,
    lineHeight: hand.lineHeight,
    tracking: hand.tracking,
    hex: ink.hex,
    wet: ink.wet,
  };

  /* ---------- the garden grows with the ink ---------- */

  const progress = bloomAt(written, totalWords);
  const garden = gardenSize(content);
  const bloomsOpen = content.garden ? Math.round(garden * progress) : 0;

  /* ---------- opening ---------- */

  const openIt = () => {
    if (movement !== "table") return;
    sound.play("paper");
    if (reduced) {
      setMovement("letter");
      return;
    }
    setMovement("opening");
    setCracked(true);
    clearBeats();
    timers.current = [
      setTimeout(() => sound.note(0), 900),
      setTimeout(() => setMovement("letter"), 3200),
    ];
  };

  const foldAway = () => {
    clearBeats();
    setMovement("folding");
    sound.play("paper");
    timers.current = [setTimeout(() => setMovement("done"), reduced ? 400 : 4200)];
  };

  const readAgain = () => {
    clearBeats();
    setCracked(false);
    setMovement(reduced ? "letter" : "table");
  };

  /* A soft note as the last word lands. */
  const chimed = useRef(false);
  useEffect(() => {
    if (!finished || chimed.current || movement !== "letter" || totalWords === 0) return;
    chimed.current = true;
    const id = setTimeout(() => sound.note(2), 400);
    return () => clearTimeout(id);
  }, [finished, movement, totalWords, sound]);

  /* ---------- the table's narration ---------- */
  const tableLines = useMemo(() => [content.tag || MD_FALLBACKS.tag], [content.tag]);
  const narrated = useNarration(tableLines.length, 1400, 1200);

  const bodyParagraphs = useMemo(() => paragraphsOf(content.body), [content.body]);
  const neverSaid = useMemo(() => paragraphsOf(content.neverSaid), [content.neverSaid]);

  /* Where each part of the flow begins, so the sections can be interleaved. */
  const greetingBlocks = content.greeting.trim() ? 1 : 0;
  const bodyStart = greetingBlocks;
  const neverSaidStart = bodyStart + bodyParagraphs.length;
  const closingStart = neverSaidStart + neverSaid.length;

  const paperFace = (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: paper.pattern(`${GARDEN.bloomA}`, `${GARDEN.leaf}`),
          opacity: paper.strength,
          borderRadius: 2,
        }}
      />
      {paper.fibrous && <Grain opacity={0.05} blend="multiply" />}
      {paper.deckled && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ boxShadow: `inset 0 0 22px ${colour.edge}`, borderRadius: 2 }}
        />
      )}
    </>
  );

  return (
    <div
      className={`${ibmPlexMono.variable} ${LETTER_FONT_VARS} relative w-full overflow-hidden`}
      style={{
        minHeight: embedded ? "100%" : "100dvh",
        background:
          movement === "done"
            ? "#fdfaf2"
            : movement === "table" || movement === "opening"
              ? `radial-gradient(ellipse 76% 56% at 50% 4%, #3a2a18 0%, ${ROOM.dark} 62%, #0d0906 100%)`
              : `radial-gradient(ellipse 80% 60% at 50% 0%, #6b4526 0%, #4a3119 60%, #2c1c0e 100%)`,
        transition: "background 2.4s ease",
      }}
    >
      {/* morning, coming through the window */}
      {movement !== "done" && (
        <>
          <Sunbeam color={ROOM.lightSoft} angle={-14} width="44%" from="8%" />
          <Glow color={movement === "table" ? "rgba(255,226,168,.16)" : "rgba(255,236,190,.2)"} at="46% 12%" size="52% 38%" />
          <DustMotes count={24} color="#fff6e2" seed="md-dust" opacity={0.42} />
          <Butterflies colour={GARDEN.bloomD} seed={content.paper} />
        </>
      )}

      <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-5 py-12 sm:px-8 sm:py-16">
        <AnimatePresence mode="wait">
          {/* ---------- the table ---------- */}
          {(movement === "table" || movement === "opening") && (
            <motion.div
              key="table"
              className="flex w-full flex-col items-center gap-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 1.1 } }}
              transition={{ duration: 2 }}
            >
              {/* the wooden table */}
              <div className="relative w-full" style={{ maxWidth: "min(560px, 100%)" }}>
                {/* the cup of tea, going cold */}
                <motion.span
                  aria-hidden
                  className="absolute"
                  style={{ right: "-2%", bottom: "-6%", width: 92, zIndex: 3 }}
                  animate={reduced ? undefined : { y: [0, -2, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <svg viewBox="0 0 92 80" className="h-full w-full">
                    {/* steam, barely there */}
                    {!reduced &&
                      [30, 44, 58].map((x, i) => (
                        <motion.path
                          key={x}
                          d={`M${x} 26 C ${x - 5} 18, ${x + 5} 12, ${x} 3`}
                          fill="none"
                          stroke="#fff4e0"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          animate={{ opacity: [0, 0.34, 0], y: [4, -6, -14] }}
                          transition={{ duration: 6.5, repeat: Infinity, delay: i * 2.1, ease: "easeOut" }}
                        />
                      ))}
                    <path d="M18 32 H70 V52 a26 26 0 0 1-52 0 Z" fill="#fbf6ec" stroke="rgba(120,90,60,.4)" strokeWidth="1.4" />
                    <path d="M70 36 a12 12 0 0 1 0 16" fill="none" stroke="#fbf6ec" strokeWidth="5" />
                    <ellipse cx="44" cy="33" rx="26" ry="5" fill="#c08a5a" opacity="0.9" />
                    <ellipse cx="44" cy="74" rx="34" ry="5" fill="rgba(0,0,0,.3)" />
                  </svg>
                </motion.span>

                {/* baby's breath in a jar */}
                <span aria-hidden className="absolute" style={{ left: "-4%", bottom: "-4%", width: 74, zIndex: 3 }}>
                  <svg viewBox="0 0 74 96" className="h-full w-full">
                    <path d="M28 52 C 24 40, 22 30, 26 20 M37 52 L37 26 M46 52 C 50 40, 52 32, 48 22" stroke={GARDEN.stem} strokeWidth="1.2" fill="none" strokeLinecap="round" />
                    {[[26, 18], [37, 22], [48, 20], [31, 30], [43, 32], [37, 12], [22, 28], [52, 30]].map(([x, y], i) => (
                      <circle key={i} cx={x} cy={y} r={2 + (i % 2)} fill="#fdfaf2" stroke={GARDEN.leaf} strokeWidth="0.5" />
                    ))}
                    <path d="M22 52 H52 V82 a15 15 0 0 1-30 0 Z" fill="rgba(226,240,236,.42)" stroke="rgba(255,255,255,.5)" strokeWidth="1.2" />
                    <ellipse cx="37" cy="90" rx="22" ry="4" fill="rgba(0,0,0,.3)" />
                  </svg>
                </span>

                {/* knitted fabric under it all */}
                <span
                  aria-hidden
                  className="absolute"
                  style={{
                    left: "-8%",
                    right: "-8%",
                    top: "18%",
                    bottom: "-14%",
                    background: "#c9b8a0",
                    backgroundImage:
                      "repeating-linear-gradient(45deg, rgba(255,255,255,.16) 0 3px, transparent 3px 7px), repeating-linear-gradient(-45deg, rgba(90,70,50,.14) 0 3px, transparent 3px 7px)",
                    borderRadius: 6,
                    transform: "rotate(-1.4deg)",
                  }}
                />

                {/* the envelope */}
                <motion.div
                  className="relative"
                  style={{ zIndex: 2, perspective: 1200 }}
                  whileHover={movement === "table" && !reduced ? { y: -8, rotate: -0.6 } : undefined}
                  transition={{ type: "spring", stiffness: 190, damping: 20 }}
                >
                  <div className="relative" style={{ aspectRatio: "3 / 2", transformStyle: "preserve-3d" }}>
                    {/* body */}
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{
                        background: env.body,
                        border: `1px solid ${env.border}`,
                        borderRadius: 3,
                        boxShadow: "0 30px 58px -24px rgba(30,18,8,.7)",
                        zIndex: 2,
                      }}
                    >
                      <Grain opacity={0.05} blend="multiply" />
                      {/* the tag, tied on */}
                      <span className="absolute inset-x-[16%] top-[54%] text-center">
                        <span style={{ fontFamily: "var(--hw-elegant), cursive", fontSize: "clamp(20px,3.4vw,30px)", color: env.ink }}>
                          {content.tag || MD_FALLBACKS.tag}
                        </span>
                        <span aria-hidden className="mx-auto mt-2 block" style={{ width: "38%", height: 1, background: `${env.ink}44` }} />
                      </span>
                    </div>

                    {/* the flap — hinged, single face, exactly as the engine does it */}
                    <motion.div
                      className="absolute left-0 top-0 w-full"
                      style={{
                        height: "56%",
                        transformOrigin: "50% 0%",
                        transformStyle: "preserve-3d",
                        pointerEvents: "none",
                        zIndex: 6,
                        clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                        background: env.flap,
                        borderTop: `1px solid ${env.border}`,
                        boxShadow: "0 3px 9px rgba(30,20,12,.18)",
                      }}
                      animate={{ rotateX: movement === "opening" ? (reduced ? 0 : -158) : 0 }}
                      transition={{ duration: reduced ? 0.25 : 1.35, ease: [0.22, 0.9, 0.24, 1] }}
                    >
                      <motion.span
                        aria-hidden
                        className="absolute inset-0"
                        style={{ background: `linear-gradient(to bottom, rgba(255,240,210,.2), transparent 40%), ${env.lining}` }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: movement === "opening" ? 1 : 0 }}
                        transition={{ duration: 0.5, delay: movement === "opening" && !reduced ? 0.57 : 0 }}
                      />
                    </motion.div>

                    {/* the ribbon across it, untying itself */}
                    <motion.span
                      aria-hidden
                      className="absolute left-1/2 top-0 h-full"
                      style={{ width: 20, marginLeft: -10, background: `linear-gradient(90deg, ${seal.deep}, ${seal.base} 40%, ${seal.deep})`, zIndex: 7 }}
                      animate={movement === "opening" ? { opacity: 0, y: 30, rotate: -3 } : { opacity: 1, y: 0 }}
                      transition={{ duration: reduced ? 0.2 : 1, ease: "easeInOut" }}
                    />

                    {/* the seal */}
                    <span className="absolute left-1/2 -translate-x-1/2" style={{ top: "44%", zIndex: 8 }}>
                      <AnimatePresence>
                        {movement === "table" && (
                          <motion.span
                            className="block"
                            exit={reduced ? { opacity: 0 } : { scale: 0.5, opacity: 0, y: 14, rotate: -16 }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                          >
                            <Seal content={content} cracked={cracked} onClick={openIt} />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>
                  </div>
                </motion.div>
              </div>

              {movement === "table" && (
                <motion.p
                  className="m-0 text-center"
                  style={{ fontFamily: MONO_FONT, fontSize: 9.5, letterSpacing: ".28em", textTransform: "uppercase", color: ROOM.onWoodSoft }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: narrated > 0 ? 1 : 0 }}
                  transition={{ duration: 1.6 }}
                >
                  press the seal
                </motion.p>
              )}
            </motion.div>
          )}

          {/* ---------- the letter ---------- */}
          {(movement === "letter" || movement === "folding") && (
            <motion.article
              key="letter"
              className="relative w-full"
              style={{
                maxWidth: "min(680px, 100%)",
                background: colour.hex,
                borderRadius: 2,
                boxShadow: `0 40px 90px -36px rgba(30,18,8,.6), inset 0 0 0 1px ${colour.edge}`,
                transformOrigin: "50% 0%",
                transformStyle: "preserve-3d",
              }}
              /* Unfolds out of the envelope, then folds itself back up at the end. */
              initial={reduced ? { opacity: 0 } : { opacity: 0, rotateX: -86, scaleY: 0.24 }}
              animate={
                movement === "folding"
                  ? reduced
                    ? { opacity: 0 }
                    : { rotateX: -84, scaleY: 0.2, opacity: 0, y: -40 }
                  : { opacity: 1, rotateX: 0, scaleY: 1, y: 0 }
              }
              transition={{ duration: reduced ? 0.3 : movement === "folding" ? 2.6 : 1.6, ease: [0.22, 0.9, 0.24, 1] }}
            >
              {paperFace}
              {content.garden && <GrowingGarden count={garden} open={bloomsOpen} seed={content.paper} />}

              {/* everything laid on the page */}
              {content.decorations.map((d) => (
                <Decoration key={d.id} decor={d} ink={ink.hex} />
              ))}

              <div className="relative px-7 py-12 sm:px-14 sm:py-16">
                {/* the date, top right, as you would write it */}
                {content.dateLine && (
                  <div
                    className="mb-8 text-right"
                    style={{ fontFamily: hand.family, fontSize: 16 * hand.scale, color: ink.hex, opacity: 0.7 }}
                  >
                    {content.dateLine}
                  </div>
                )}

                {/* greeting */}
                {greetingBlocks > 0 && (
                  <div className="mb-7">
                    <Handwritten
                      text={content.greeting}
                      ink={{ ...inkStyle, size: 26 * hand.scale }}
                      seed={`g-${content.paper}`}
                      written={written}
                      startAt={blockStarts[0]}
                      className="flex flex-col"
                    />
                  </div>
                )}

                {/* the body, with photographs tucked in */}
                <div className="flex flex-col gap-6">
                  {bodyParagraphs.map((text, i) => {
                    const tucked = content.polaroids.filter((p) => p.afterParagraph === i);
                    return (
                      <div key={i}>
                        <Handwritten
                          text={text}
                          ink={inkStyle}
                          seed={`b-${i}`}
                          written={written}
                          startAt={blockStarts[bodyStart + i]}
                          showNib={written > blockStarts[bodyStart + i] && written <= blockStarts[bodyStart + i] + countWords(text)}
                          className="flex flex-col gap-3"
                        />
                        {tucked.length > 0 && written > blockStarts[bodyStart + i] && (
                          <div className="mt-6 flex flex-wrap items-start justify-center gap-5">
                            {tucked.map((p) => (
                              <TuckedPolaroid key={p.id} polaroid={p} ink={ink.hex} onOpen={() => setLightbox(p)} />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* my favourite memory */}
                {(content.favouriteMemoryPhoto || content.favouriteMemoryStory) && (
                  <div className="mt-14">
                    <FavouriteMemory
                      title={content.favouriteMemoryTitle}
                      photo={content.favouriteMemoryPhoto}
                      story={content.favouriteMemoryStory}
                      hand={hand}
                      ink={ink.hex}
                    />
                  </div>
                )}

                {/* what you taught me */}
                {content.lessons.length > 0 && (
                  <div className="mt-14">
                    <LessonCards lessons={content.lessons} hand={hand} ink={ink.hex} accent={seal.base} />
                  </div>
                )}

                {/* things I've never said */}
                {neverSaid.length > 0 && (
                  <div className="mt-14">
                    <div className="mb-6 text-center">
                      <span style={{ fontFamily: MONO_FONT, fontSize: 9, letterSpacing: ".3em", textTransform: "uppercase", color: ink.hex, opacity: 0.55 }}>
                        things I&apos;ve never said
                      </span>
                    </div>
                    <div className="flex flex-col gap-6">
                      {neverSaid.map((text, i) => (
                        <Handwritten
                          key={i}
                          text={text}
                          ink={inkStyle}
                          seed={`n-${i}`}
                          written={written}
                          startAt={blockStarts[neverSaidStart + i]}
                          className="flex flex-col gap-3"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* thank you */}
                {content.thanks.length > 0 && (
                  <div className="mt-16">
                    <ThankYouNotes notes={content.thanks} hand={hand} ink={ink.hex} accent={seal.base} />
                  </div>
                )}

                {/* her voice */}
                {content.voiceUrl && (
                  <div className="mt-16">
                    <VoiceSeal url={content.voiceUrl} label={content.voiceLabel} colourId={content.sealColour} ink={ink.hex} />
                  </div>
                )}

                {/* closing and signature */}
                {closingStart < flow.length && (
                  <div className="mt-14">
                    <Handwritten
                      text={content.closing || MD_FALLBACKS.closing}
                      ink={inkStyle}
                      seed="c"
                      written={written}
                      startAt={blockStarts[closingStart]}
                      className="flex flex-col"
                    />
                  </div>
                )}

                <AnimatePresence>
                  {finished && (
                    <motion.div
                      className="mt-5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1.6, delay: 0.5 }}
                    >
                      {content.signature && (
                        <div
                          style={{
                            fontFamily: "var(--hw-calligraphy), cursive",
                            fontSize: 34 * hand.scale,
                            lineHeight: 1.2,
                            color: ink.hex,
                          }}
                        >
                          {content.signature}
                        </div>
                      )}

                      {content.postscript && (
                        <p
                          className="m-0 mt-8"
                          style={{ fontFamily: hand.family, fontSize: 16.5 * hand.scale, lineHeight: hand.lineHeight * 0.92, color: ink.hex, opacity: 0.82 }}
                        >
                          P.S. {content.postscript}
                        </p>
                      )}

                      {/* the family photograph, and the last line */}
                      {(content.familyPhoto || content.finalLine) && (
                        <motion.div
                          className="mt-16 flex flex-col items-center gap-6"
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 2.4, delay: 1.4 }}
                        >
                          {content.familyPhoto && (
                            <div
                              style={{
                                width: "min(400px, 88%)",
                                padding: "4%",
                                background: "#fdfaf2",
                                boxShadow: "0 22px 44px -20px rgba(60,40,20,.5)",
                              }}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={content.familyPhoto} alt="All of us" className="block h-auto w-full" />
                            </div>
                          )}
                          <p
                            className="m-0 max-w-md text-center"
                            style={{ fontFamily: hand.family, fontSize: 21 * hand.scale, lineHeight: hand.lineHeight * 0.95, color: ink.hex }}
                          >
                            {content.finalLine || MD_FALLBACKS.finalLine}
                          </p>
                        </motion.div>
                      )}

                      {!embedded && (
                        <div className="mt-14 flex justify-center">
                          <button
                            type="button"
                            onClick={foldAway}
                            className="cursor-pointer rounded-full px-6 py-2.5"
                            style={{
                              fontFamily: MONO_FONT,
                              fontSize: 10,
                              letterSpacing: ".2em",
                              textTransform: "uppercase",
                              background: "transparent",
                              border: `1px solid ${ink.hex}33`,
                              color: `${ink.hex}aa`,
                            }}
                          >
                            Fold it back up
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.article>
          )}

          {/* ---------- folded away ---------- */}
          {movement === "done" && (
            <motion.div
              key="done"
              className="flex flex-col items-center gap-9 py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2.4 }}
            >
              <div className="relative">
                <FallingPetal colour={GARDEN.bloomA} play />
                {/* the envelope, sealed again */}
                <div style={{ width: "min(300px, 76vw)" }}>
                  <div className="relative" style={{ aspectRatio: "3 / 2" }}>
                    <div
                      className="absolute inset-0"
                      style={{ background: env.body, border: `1px solid ${env.border}`, borderRadius: 3, boxShadow: "0 22px 44px -22px rgba(60,40,20,.4)" }}
                    />
                    <span
                      aria-hidden
                      className="absolute left-0 top-0 w-full"
                      style={{ height: "56%", clipPath: "polygon(0 0, 100% 0, 50% 100%)", background: env.flap, borderTop: `1px solid ${env.border}` }}
                    />
                    <span className="absolute left-1/2 -translate-x-1/2" style={{ top: "44%", zIndex: 3 }}>
                      <Seal content={content} cracked={false} />
                    </span>
                  </div>
                </div>
              </div>

              <p className="m-0 text-center" style={{ fontFamily: hand.family, fontSize: 20, color: "#6b5540" }}>
                Keep it somewhere.
              </p>

              <button
                type="button"
                onClick={readAgain}
                className="cursor-pointer rounded-full px-6 py-2.5"
                style={{
                  fontFamily: MONO_FONT,
                  fontSize: 10,
                  letterSpacing: ".2em",
                  textTransform: "uppercase",
                  background: "transparent",
                  border: "1px solid rgba(107,85,64,.3)",
                  color: "rgba(107,85,64,.8)",
                }}
              >
                Read it again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* the ambience control */}
      {content.ambience && movement !== "done" && (
        <button
          type="button"
          onClick={sound.toggle}
          aria-pressed={sound.on}
          className="absolute bottom-5 right-5 z-20 cursor-pointer rounded-full border px-3.5 py-2"
          style={{
            background: "rgba(0,0,0,.26)",
            borderColor: "rgba(255,236,190,.32)",
            color: ROOM.onWoodSoft,
            fontFamily: MONO_FONT,
            fontSize: 9,
            letterSpacing: ".16em",
            textTransform: "uppercase",
          }}
        >
          {!sound.supported ? "no sound here" : sound.on ? "❙❙ morning" : "▶ morning"}
        </button>
      )}

      <PhotoLightbox polaroid={lightbox} onClose={() => setLightbox(null)} hand={hand} ink={ink.hex} />
    </div>
  );
}
