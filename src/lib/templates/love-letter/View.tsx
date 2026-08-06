"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ibmPlexMono } from "@/app/fonts";
import { LETTER_FONT_VARS } from "@/app/letterFonts";
import type { LoveLetterContent } from "./schema";
import { LL_FALLBACKS } from "./schema";
import {
  FIBRE,
  HANDS,
  PAPER_COLORS,
  PAPER_STYLES,
  SCENTS,
  SEAL_COLORS,
  inkFor,
} from "./theme";
import {
  Handwritten,
  Signature,
  collectPauses,
  countWords,
  useWriteCursor,
  type InkStyle,
} from "./ink";
import {
  DecorationView,
  Envelope,
  HiddenFold,
  MarginNoteView,
  PhotoMemory,
  ScentParticles,
  VoiceSeal,
} from "./parts";
import { ENVELOPE_OPEN_MS } from "@/lib/engines/envelope";

type Stage = "sealed" | "shimmer" | "cracking" | "breaking" | "opening" | "reading" | "folding" | "closed";

/** Dust in the light. Fixed positions so SSR and client agree. */
const MOTES = [
  { x: 9, y: 84, s: 3, d: 18, delay: 0 },
  { x: 26, y: 93, s: 2, d: 22, delay: 3.1 },
  { x: 44, y: 78, s: 2.5, d: 20, delay: 6.4 },
  { x: 61, y: 90, s: 2, d: 24, delay: 1.7 },
  { x: 78, y: 80, s: 3, d: 19, delay: 4.6 },
  { x: 92, y: 88, s: 2, d: 25, delay: 8.2 },
];

function SunlitRoom({ tint }: { tint: string }) {
  const reduced = useReducedMotion();
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: `linear-gradient(168deg, #efe6d6 0%, #e2d5c0 52%, #d6c7ae 100%)` }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: `linear-gradient(122deg, ${tint}38 0%, ${tint}14 30%, transparent 58%)` }}
        animate={reduced ? undefined : { opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
      />
      {!reduced && (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {MOTES.map((m, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full"
              style={{ left: `${m.x}%`, top: `${m.y}%`, width: m.s, height: m.s, background: "#fff2d8", filter: "blur(.5px)" }}
              animate={{ y: [0, -300], opacity: [0, 0.65, 0], x: [0, i % 2 ? 18 : -15, 0] }}
              transition={{ duration: m.d, repeat: Infinity, delay: m.delay, ease: "linear" }}
            />
          ))}
        </div>
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 78% 74% at 50% 50%, transparent 46%, rgba(80,60,36,.34))" }}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */

export function LoveLetterView({
  content,
  embedded = false,
}: {
  content: LoveLetterContent;
  embedded?: boolean;
}) {
  const reduced = useReducedMotion();
  const paperStyle = PAPER_STYLES[content.paperStyle];
  const paperHex = PAPER_COLORS[content.paperColor].hex;
  const hand = HANDS[content.hand];
  const inkPair = inkFor(content.ink, paperStyle);
  const scent = SCENTS[content.scent];
  const seal = SEAL_COLORS[content.sealColor];

  const [stage, setStage] = useState<Stage>(embedded ? "reading" : "sealed");

  const recipient = content.recipient || LL_FALLBACKS.recipient;
  const greeting = content.greeting || LL_FALLBACKS.greeting;
  const closing = content.closing || LL_FALLBACKS.closing;
  const finalLine = content.finalLine || LL_FALLBACKS.finalLine;

  /* Every stretch of prose, in the order the pen would reach it. Photos and
     folded blocks are placed among them but don't consume writing time. */
  const writtenTexts = useMemo(() => {
    const out: string[] = [greeting];
    content.blocks.forEach((b) => {
      if (b.kind === "photo" || b.kind === "folded") return;
      if (b.text.trim()) out.push(b.text);
    });
    out.push(closing);
    return out;
  }, [greeting, closing, content.blocks]);

  const totalWords = useMemo(() => writtenTexts.reduce((n, t) => n + countWords(t), 0), [writtenTexts]);
  const pauses = useMemo(() => collectPauses(writtenTexts, "ll"), [writtenTexts]);

  const rawWritten = useWriteCursor(totalWords, content.writingSpeed, stage === "reading", pauses);
  /* Watching ink appear is the point, but nobody should be trapped by it. */
  const [skipped, setSkipped] = useState(false);
  const written = skipped ? totalWords : rawWritten;
  const finishedWriting = written >= totalWords;

  /* Once the pen lifts, hold a beat, then let the paper fold itself away. */
  const [showFinal, setShowFinal] = useState(false);
  useEffect(() => {
    if (!finishedWriting || stage !== "reading" || embedded) return;
    const t = setTimeout(() => setShowFinal(true), reduced ? 200 : 1600);
    return () => clearTimeout(t);
  }, [finishedWriting, stage, embedded, reduced]);

  /* The same beats as the landing-page hero: the wax shimmers, a hairline crack
     is drawn, the seal breaks into fragments, the envelope lifts, then the flap
     hinges open and light spills out before the page rises. */
  /**
   * Timers are tracked so they can be cancelled.
   *
   * They used to be fired and forgotten, which had two consequences: they kept
   * running after the view unmounted, and re-opening a folded-away letter jumped
   * straight to the text because the sequence was only ever reachable from the
   * "sealed" stage.
   */
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearBeats = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clearBeats, []);

  const run = (at: [Stage, number][]) => {
    clearBeats();
    timers.current = at.map(([s, ms]) => setTimeout(() => setStage(s), ms));
  };

  const open = () => {
    /* Openable from sealed *and* from folded-away, so the second read is as good
       as the first. */
    if (stage !== "sealed" && stage !== "closed") return;
    if (reduced) {
      setStage("reading");
      return;
    }
    const OPENING_AT = 1500;
    run([
      ["shimmer", 0],
      ["cracking", 520],
      ["breaking", 1020],
      ["opening", OPENING_AT],
      /* Derived, so the flap always finishes turning before the letter takes
         over — see ENVELOPE_OPEN_MS. */
      ["reading", OPENING_AT + ENVELOPE_OPEN_MS],
    ]);
  };

  const foldAway = () => {
    setStage("folding");
    run([["closed", reduced ? 300 : 2600]]);
  };

  const inkStyle: InkStyle = {
    family: hand.family,
    size: 20 * hand.scale,
    lineHeight: hand.lineHeight,
    tracking: hand.tracking,
    hex: inkPair.hex,
    wet: inkPair.wet,
  };

  /* Where each block's prose begins in the global word count. Computed up front
     so nothing is mutated while rendering. */
  const blockStarts = useMemo(() => {
    const map = new Map<string, number>();
    let n = countWords(greeting);
    for (const b of content.blocks) {
      map.set(b.id, n);
      if (b.kind !== "photo" && b.kind !== "folded") n += countWords(b.text);
    }
    return map;
  }, [greeting, content.blocks]);

  return (
    <div
      className={`${LETTER_FONT_VARS} ${ibmPlexMono.variable} relative w-full overflow-hidden`}
      style={{ height: embedded ? "100%" : "100dvh" }}
      aria-label={`A letter for ${recipient}`}
    >
      <SunlitRoom tint={seal.base} />

      <div className="relative z-10 flex h-full w-full items-center justify-center overflow-y-auto px-4 py-8 sm:px-8">
        <AnimatePresence mode="wait">
          {/* ---------- the sealed envelope ---------- */}
          {(stage === "sealed" ||
            stage === "shimmer" ||
            stage === "cracking" ||
            stage === "breaking" ||
            stage === "opening") && (
            <motion.div
              key="envelope"
              className="flex flex-col items-center gap-7"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.6 } }}
              transition={{ duration: 1.3, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <motion.div
                whileHover={stage === "sealed" && !reduced ? { y: -7, rotate: -0.6 } : undefined}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <Envelope
                  envelopeId={content.envelope}
                  sealColor={content.sealColor}
                  sealIcon={content.sealIcon}
                  monogram={content.sealMonogram}
                  recipient={recipient}
                  phase={stage === "sealed" ? "closed" : stage}
                  onOpen={open}
                />
              </motion.div>

              {stage === "sealed" && (
                <motion.span
                  className="text-[10.5px] tracking-[0.26em] uppercase"
                  style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", color: "rgba(80,60,36,.55)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.4, delay: 1.4 }}
                >
                  Break the seal
                </motion.span>
              )}
            </motion.div>
          )}

          {/* ---------- the letter ---------- */}
          {(stage === "reading" || stage === "folding") && (
            <motion.div
              key="letter"
              className="relative w-full"
              style={{ maxWidth: 660, perspective: 1700, transformStyle: "preserve-3d" }}
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
            >
              <motion.article
                className="relative"
                style={{
                  background: paperHex,
                  backgroundImage: paperStyle.overlay === "none" ? undefined : paperStyle.overlay,
                  boxShadow: paperStyle.edge,
                  padding: "clamp(30px,6vw,64px) clamp(26px,6vw,58px)",
                  borderRadius: paperStyle.deckled ? 2 : 3,
                  clipPath: paperStyle.deckled
                    ? "polygon(0.6% 0.4%, 99.4% 0%, 100% 3%, 99.5% 22%, 100% 48%, 99.3% 74%, 100% 97%, 99% 100%, 1.2% 99.6%, 0.4% 96%, 0.8% 70%, 0% 44%, 0.7% 20%, 0.2% 3%)"
                    : undefined,
                  transformOrigin: "center top",
                }}
                /* Unfolds along its crease rather than flying in, and folds
                   back the same way at the end. */
                initial={reduced ? { opacity: 0 } : { opacity: 0, rotateX: -86, scaleY: 0.26 }}
                animate={
                  stage === "folding"
                    ? reduced
                      ? { opacity: 0 }
                      : { rotateX: -86, scaleY: 0.26, opacity: 0 }
                    : { rotateX: 0, scaleY: 1, opacity: 1 }
                }
                transition={{ duration: reduced ? 0.4 : stage === "folding" ? 2 : 1.7, ease: [0.32, 0.02, 0.22, 1] }}
                whileHover={reduced || stage === "folding" ? undefined : { rotateX: 1.1, rotateY: -0.8 }}
              >
                {/* fibre */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{ backgroundImage: FIBRE, opacity: paperStyle.grain * 0.6, mixBlendMode: "multiply" }}
                />
                {/* the crease it arrived folded along */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-1/3 h-px"
                  style={{ background: `${inkPair.hex}14` }}
                />

                {/* decorations the writer laid on the page */}
                {content.decorations.map((d, i) => (
                  <DecorationView key={d.id} decor={d} accent={seal.base} delay={0.4 + i * 0.12} />
                ))}

                {/* notes pencilled into the margins */}
                {content.marginNotes.map((n, i) => (
                  <MarginNoteView
                    key={n.id}
                    text={n.text}
                    y={n.y}
                    side={n.side}
                    handFamily={hand.family}
                    ink={inkPair.hex}
                    delay={1.6 + i * 0.5}
                  />
                ))}

                <div className="relative">
                  {content.dateLine && (
                    <motion.div
                      className="mb-6 text-right"
                      style={{
                        fontFamily: hand.family,
                        fontSize: 15 * hand.scale,
                        color: `${inkPair.hex}99`,
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1.2, delay: 0.3 }}
                    >
                      {content.dateLine}
                    </motion.div>
                  )}

                  {/* greeting */}
                  <Handwritten
                    text={greeting}
                    ink={inkStyle}
                    seed="greeting"
                    written={written}
                    startAt={0}
                    showNib
                    style={{ marginBottom: "1.1em" }}
                  />

                  {/* body, in order */}
                  {content.blocks.map((block) => {
                    const start = blockStarts.get(block.id) ?? 0;

                    if (block.kind === "photo") {
                      /* Photos only appear once the pen has reached them. */
                      if (written < start) return null;
                      return (
                        <PhotoMemory
                          key={block.id}
                          imageUrl={block.imageUrl}
                          caption={block.caption}
                          handFamily={hand.family}
                          ink={inkPair.hex}
                        />
                      );
                    }

                    if (block.kind === "folded") {
                      if (!finishedWriting) return null;
                      return (
                        <HiddenFold
                          key={block.id}
                          label={block.foldLabel}
                          paperColor={paperHex}
                          ink={inkPair.hex}
                          handFamily={hand.family}
                        >
                          <Handwritten
                            text={block.text}
                            ink={inkStyle}
                            seed={block.id}
                            written={Number.MAX_SAFE_INTEGER}
                            startAt={0}
                          />
                        </HiddenFold>
                      );
                    }

                    if (block.kind === "quote") {
                      return (
                        <Handwritten
                          key={block.id}
                          text={block.text}
                          ink={{ ...inkStyle, size: inkStyle.size * 1.22 }}
                          seed={block.id}
                          written={written}
                          startAt={start}
                          showNib
                          className="my-5"
                          style={{
                            paddingLeft: "1.2em",
                            borderLeft: `2px solid ${seal.base}66`,
                            fontStyle: "italic",
                          }}
                        />
                      );
                    }

                    if (block.kind === "highlight") {
                      return (
                        <Handwritten
                          key={block.id}
                          text={block.text}
                          ink={inkStyle}
                          seed={block.id}
                          written={written}
                          startAt={start}
                          showNib
                          className="my-4"
                          style={{
                            /* the line someone went back over with a pencil */
                            background: `linear-gradient(to top, ${seal.base}2e 0 38%, transparent 38%)`,
                            display: "inline-block",
                          }}
                        />
                      );
                    }

                    if (block.kind === "ps") {
                      if (!finishedWriting) return null;
                      return (
                        <motion.div
                          key={block.id}
                          className="mt-8"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 1.2, delay: 1.1 }}
                          style={{
                            fontFamily: hand.family,
                            fontSize: 16 * hand.scale,
                            lineHeight: 1.6,
                            color: `${inkPair.hex}cc`,
                          }}
                        >
                          <span style={{ letterSpacing: ".06em" }}>P.S. </span>
                          {block.text}
                        </motion.div>
                      );
                    }

                    return (
                      <Handwritten
                        key={block.id}
                        text={block.text}
                        ink={inkStyle}
                        seed={block.id}
                        written={written}
                        startAt={start}
                        showNib
                        style={{ marginBottom: "1em" }}
                      />
                    );
                  })}

                  {/* voice note, once the writing is done */}
                  {finishedWriting && content.voiceUrl && (
                    <VoiceSeal
                      url={content.voiceUrl}
                      sealColor={content.sealColor}
                      sealIcon={content.sealIcon}
                      monogram={content.sealMonogram}
                      handFamily={hand.family}
                      ink={inkPair.hex}
                    />
                  )}

                  {/* closing */}
                  <Handwritten
                    text={closing}
                    ink={inkStyle}
                    seed="closing"
                    written={written}
                    startAt={totalWords - countWords(closing)}
                    showNib
                    style={{ marginTop: "1.6em" }}
                  />

                  {/* signature */}
                  <div className="mt-2">
                    <Signature
                      name={content.signature}
                      ink={inkStyle}
                      visible={finishedWriting}
                      family={hand.family}
                    />
                  </div>

                  {/* the line held back for last */}
                  <AnimatePresence>
                    {showFinal && (
                      <motion.div
                        className="mt-10 text-center"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.6, ease: [0.2, 0.8, 0.2, 1] }}
                      >
                        <div
                          style={{
                            fontFamily: hand.family,
                            fontSize: 19 * hand.scale,
                            color: inkPair.hex,
                            lineHeight: 1.5,
                          }}
                        >
                          {finalLine}
                        </div>
                        <motion.button
                          type="button"
                          onClick={foldAway}
                          className="mt-6 cursor-pointer rounded-full px-6 py-2.5 text-[10.5px] tracking-[0.2em] uppercase"
                          style={{
                            fontFamily: "var(--font-ibm-plex-mono), monospace",
                            background: "transparent",
                            border: `1px solid ${inkPair.hex}33`,
                            color: `${inkPair.hex}aa`,
                          }}
                          whileHover={{ borderColor: `${seal.base}`, color: seal.base }}
                        >
                          Fold it back up
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {content.scent !== "none" && <ScentParticles color={scent.color} glyph={scent.glyph} />}
              </motion.article>
            </motion.div>
          )}

          {/* ---------- back in the envelope ---------- */}
          {stage === "closed" && (
            <motion.div
              key="closed"
              className="flex flex-col items-center gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.4 }}
            >
              <div style={{ width: "min(400px, 82vw)" }}>
                <Envelope
                  envelopeId={content.envelope}
                  sealColor={content.sealColor}
                  sealIcon={content.sealIcon}
                  monogram={content.sealMonogram}
                  recipient={recipient}
                  phase="closed"
                  onOpen={open}
                />
              </div>

              <motion.span
                className="block text-[26px] leading-none"
                style={{ color: seal.base, filter: `drop-shadow(0 0 14px ${seal.base}88)` }}
                animate={reduced ? undefined : { scale: [1, 1.22, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              >
                ♥
              </motion.span>

              <button
                type="button"
                onClick={open}
                className="cursor-pointer rounded-full px-6 py-2.5 text-[10.5px] tracking-[0.2em] uppercase"
                style={{
                  fontFamily: "var(--font-ibm-plex-mono), monospace",
                  background: "transparent",
                  border: "1px solid rgba(80,60,36,.28)",
                  color: "rgba(80,60,36,.7)",
                }}
              >
                Read it again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* let someone skip ahead if they'd rather just read it */}
      {stage === "reading" && !finishedWriting && (
        <button
          type="button"
          onClick={() => setSkipped(true)}
          aria-label="Show the whole letter now"
          className="absolute bottom-5 right-5 z-20 cursor-pointer rounded-full px-4 py-2 text-[10px] tracking-[0.18em] uppercase"
          style={{
            fontFamily: "var(--font-ibm-plex-mono), monospace",
            background: "rgba(255,250,240,.75)",
            border: "1px solid rgba(80,60,36,.2)",
            color: "rgba(80,60,36,.62)",
            backdropFilter: "blur(6px)",
          }}
        >
          {`${Math.round((written / Math.max(1, totalWords)) * 100)}% \u00b7 show it all`}
        </button>
      )}
    </div>
  );
}
