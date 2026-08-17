"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ibmPlexMono } from "@/app/fonts";
import { LETTER_FONT_VARS } from "@/app/letterFonts";
import {
  FIBRE,
  HANDS,
  PAPER_COLORS,
  PAPER_STYLES,
  SEAL_COLORS,
  inkFor,
} from "../love-letter/theme";
import { Envelope, WaxSeal } from "../love-letter/parts";
import { ENVELOPE_OPEN_MS } from "@/lib/engines/envelope";
import {
  Handwritten,
  Signature,
  collectPauses,
  countWords,
  useWriteCursor,
  type InkStyle,
} from "../love-letter/ink";
import {
  MOODS,
  OW_FALLBACKS,
  RIBBONS,
  WOODS,
  lockState,
  type OpenWhenContent,
  type OpenWhenLetter,
} from "./schema";

type Stage = "closed" | "open" | "reading";
type LetterBeat = "sealed" | "shimmer" | "cracking" | "breaking" | "opening" | "reading" | "folding";

/* ------------------------------------------------------------------ */
/* The box                                                             */
/* ------------------------------------------------------------------ */

function WoodSurface({ woodId, className = "", style }: { woodId: keyof typeof WOODS; className?: string; style?: React.CSSProperties }) {
  const w = WOODS[woodId];
  return (
    <span
      aria-hidden
      className={`absolute inset-0 ${className}`}
      style={{
        background: `
          repeating-linear-gradient(91deg, rgba(0,0,0,.14) 0 1px, transparent 1px 7px),
          repeating-linear-gradient(89deg, rgba(255,255,255,.045) 0 1px, transparent 1px 23px),
          radial-gradient(ellipse 60% 120% at 22% 40%, ${w.light}55, transparent 60%),
          linear-gradient(168deg, ${w.mid}, ${w.dark})`,
        ...style,
      }}
    />
  );
}

function BrassHinge({ woodId }: { woodId: keyof typeof WOODS }) {
  const w = WOODS[woodId];
  return (
    <span
      aria-hidden
      className="relative block h-full w-full rounded-[2px]"
      style={{
        background: `linear-gradient(180deg, ${w.brass}, #8a6a2e 60%, ${w.brass})`,
        boxShadow: "0 1px 3px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,245,214,.5)",
      }}
    >
      {[0.25, 0.75].map((t) => (
        <span
          key={t}
          className="absolute rounded-full"
          style={{
            left: `${t * 100}%`,
            top: "50%",
            width: 3,
            height: 3,
            transform: "translate(-50%,-50%)",
            background: "#6b5220",
            boxShadow: "inset 0 1px 0 rgba(255,245,214,.4)",
          }}
        />
      ))}
    </span>
  );
}

/** One sealed envelope resting in the box. */
function BoxEnvelope({
  letter,
  locked,
  reason,
  onPick,
  index,
  handFamily,
}: {
  letter: OpenWhenLetter;
  locked: boolean;
  reason: string;
  onPick: () => void;
  index: number;
  handFamily: string;
}) {
  const reduced = useReducedMotion();
  const [shaking, setShaking] = useState(0);
  const paper = PAPER_COLORS[letter.paperColor].hex;
  const ribbon = RIBBONS[letter.ribbon].hex;
  const seal = SEAL_COLORS[letter.sealColor];

  const click = () => {
    if (locked) {
      /* Locked letters refuse, gently. */
      setShaking((n) => n + 1);
      return;
    }
    onPick();
  };

  return (
    <motion.button
      type="button"
      onClick={click}
      aria-label={locked ? `${letter.title} — locked. ${reason}` : `${letter.title} — open it`}
      aria-disabled={locked}
      className="relative block w-full cursor-pointer border-0 bg-transparent p-0 text-left"
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 22, rotate: index % 2 ? 1.6 : -1.4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.25 + index * 0.09, ease: [0.2, 0.8, 0.2, 1] }}
      whileHover={reduced ? undefined : { y: locked ? 0 : -8, rotate: 0 }}
    >
      <motion.span
        className="relative block overflow-hidden rounded-[3px]"
        style={{
          aspectRatio: "16 / 10",
          background: `linear-gradient(158deg, ${paper}, ${paper}d8)`,
          boxShadow: "0 14px 26px -14px rgba(10,6,2,.8), inset 0 0 0 1px rgba(90,70,44,.18)",
        }}
        /* the refusal: a short, small shudder — never a slam */
        animate={shaking ? { x: [0, -5, 4, -3, 2, 0], rotate: [0, -0.8, 0.7, -0.4, 0] } : { x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        key={shaking}
      >
        <span aria-hidden className="absolute inset-0 opacity-25" style={{ backgroundImage: FIBRE, mixBlendMode: "multiply" }} />
        {/* the fold lines of the back flap */}
        <span
          aria-hidden
          className="absolute inset-0"
          style={{ background: "linear-gradient(112deg, rgba(0,0,0,.05) 0 49.6%, transparent 49.6%), linear-gradient(248deg, rgba(0,0,0,.05) 0 49.6%, transparent 49.6%)" }}
        />
        {/* the ribbon tied round it — its own colour per letter */}
        <span aria-hidden className="absolute inset-y-0" style={{ left: "17%", width: "9%", background: `linear-gradient(90deg, ${ribbon}dd, ${ribbon}99)` }} />

        {/* the label, handwritten */}
        <span
          className="absolute inset-x-[32%] top-1/2 -translate-y-1/2 block pr-2"
          style={{ fontFamily: handFamily, fontSize: "clamp(12px,1.5vw,17px)", lineHeight: 1.28, color: "#4a3a22" }}
        >
          {letter.title}
        </span>

        {/* the wax seal holding it shut */}
        <span className="absolute" style={{ right: "7%", top: "50%", transform: "translateY(-50%)", width: "17%" }}>
          <span
            aria-hidden
            className="block"
            style={{
              aspectRatio: "1",
              borderRadius: "48% 52% 51% 49% / 50% 48% 52% 50%",
              background: `radial-gradient(circle at 34% 28%, ${seal.light}, ${seal.base} 52%, ${seal.deep})`,
              boxShadow: "inset -1px -2px 4px rgba(0,0,0,.4), 0 2px 5px rgba(0,0,0,.4)",
            }}
          />
        </span>

        {locked && (
          <span aria-hidden className="absolute inset-0" style={{ background: "rgba(24,16,8,.36)" }} />
        )}
      </motion.span>

      {/* why it won't open */}
      {locked && (
        <span
          className="mt-2 flex items-center gap-1.5 px-0.5"
          style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(255,236,203,.6)" }}
        >
          <span aria-hidden>🔒</span>
          {reason}
        </span>
      )}
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/* Unlock prompt                                                       */
/* ------------------------------------------------------------------ */

function UnlockPrompt({
  letter,
  onUnlock,
  onClose,
}: {
  letter: OpenWhenLetter;
  onUnlock: () => void;
  onClose: () => void;
}) {
  const [entry, setEntry] = useState("");
  const [wrong, setWrong] = useState(false);
  const hand = HANDS[letter.hand];

  const attempt = () => {
    if (letter.lock === "password") {
      const ok = entry.trim().toLowerCase() === letter.password.trim().toLowerCase();
      if (ok) onUnlock();
      else {
        setWrong(true);
        window.setTimeout(() => setWrong(false), 900);
      }
      return;
    }
    onUnlock();
  };

  return (
    <motion.div
      className="fixed inset-0 z-[95] flex items-center justify-center p-6"
      style={{ background: "rgba(18,12,6,.8)", backdropFilter: "blur(5px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`Unlock ${letter.title}`}
        className="relative w-full max-w-sm rounded-[4px] p-7"
        style={{ background: PAPER_COLORS[letter.paperColor].hex, boxShadow: "0 40px 80px -34px rgba(0,0,0,.85)" }}
        initial={{ scale: 0.9, opacity: 0, y: 14 }}
        animate={{ scale: 1, opacity: 1, y: 0, x: wrong ? [0, -8, 7, -5, 0] : 0 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ duration: wrong ? 0.45 : 0.5, ease: [0.2, 0.85, 0.2, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <span aria-hidden className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: FIBRE, mixBlendMode: "multiply" }} />
        <div className="relative flex flex-col gap-4">
          <span style={{ fontFamily: hand.family, fontSize: 22, color: "#4a3a22" }}>{letter.title}</span>

          {letter.lock === "mood" && (
            <>
              <span className="text-[13px]" style={{ color: "#7d6b52" }}>
                This one is meant for when you&apos;re <strong>{letter.mood || "ready"}</strong>. Only you know if that&apos;s today.
              </span>
              <div className="flex flex-wrap gap-1.5">
                {MOODS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setEntry(m)}
                    aria-pressed={entry === m}
                    className="cursor-pointer rounded-full px-3 py-1.5 text-[11.5px]"
                    style={{
                      background: entry === m ? "rgba(140,47,60,.14)" : "#fffdf7",
                      border: `1px solid ${entry === m ? "rgba(140,47,60,.5)" : "rgba(90,70,44,.2)"}`,
                      color: entry === m ? "#8c2f3c" : "#7d6b52",
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </>
          )}

          {letter.lock === "password" && (
            <>
              <span className="text-[13px]" style={{ color: "#7d6b52" }}>
                {letter.passwordHint || "They left you a password for this one."}
              </span>
              <input
                type="text"
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && attempt()}
                aria-label="Password"
                autoFocus
                className="w-full rounded-md px-3 py-2.5 text-[14px] outline-none"
                style={{ background: "#fffdf7", border: `1px solid ${wrong ? "#a83c2c" : "rgba(90,70,44,.2)"}`, color: "#3a3026" }}
              />
              {wrong && <span className="text-[12px]" style={{ color: "#a83c2c" }}>Not quite. Try again.</span>}
            </>
          )}

          {letter.lock === "location" && (
            <span className="text-[13px]" style={{ color: "#7d6b52" }}>
              This one is for when you&apos;re at <strong>{letter.place || "the right place"}</strong>. Open it there.
            </span>
          )}

          <div className="mt-1 flex gap-2">
            <button
              type="button"
              onClick={attempt}
              disabled={letter.lock === "mood" ? entry !== (letter.mood || "") : letter.lock === "password" ? !entry.trim() : false}
              className="flex-1 cursor-pointer rounded-full px-4 py-2.5 text-[11.5px] tracking-[0.12em] uppercase disabled:cursor-not-allowed disabled:opacity-40"
              style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", background: "#8c2f3c", border: "1px solid #8c2f3c", color: "#fdf3e6" }}
            >
              {letter.lock === "location" ? "I'm here" : "Open it"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-full px-4 py-2.5 text-[11.5px] tracking-[0.12em] uppercase"
              style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", background: "transparent", border: "1px solid rgba(90,70,44,.24)", color: "#7d6b52" }}
            >
              Not yet
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Reading one letter                                                  */
/* ------------------------------------------------------------------ */

function LetterReader({
  letter,
  onBack,
}: {
  letter: OpenWhenLetter;
  onBack: () => void;
}) {
  const reduced = useReducedMotion();
  const [beat, setBeat] = useState<LetterBeat>("sealed");
  const paperStyle = PAPER_STYLES[letter.paperStyle];
  const paperHex = PAPER_COLORS[letter.paperColor].hex;
  const hand = HANDS[letter.hand];
  const inkPair = inkFor(letter.ink, paperStyle, paperHex);
  const seal = SEAL_COLORS[letter.sealColor];

  const greeting = letter.greeting || OW_FALLBACKS.greeting;
  const closing = letter.closing || OW_FALLBACKS.closing;

  const texts = useMemo(() => [greeting, letter.body, closing].filter((t) => t.trim()), [greeting, letter.body, closing]);
  const total = useMemo(() => texts.reduce((n, t) => n + countWords(t), 0), [texts]);
  const pauses = useMemo(() => collectPauses(texts, letter.id), [texts, letter.id]);

  const written = useWriteCursor(total, 150, beat === "reading", pauses);
  const done = written >= total;

  /* Same beats as the landing-page hero, so opening always feels the same. */
  useEffect(() => {
    if (reduced) {
      const t = setTimeout(() => setBeat("reading"), 0);
      return () => clearTimeout(t);
    }
    const OPENING_AT = 2000;
    const at: [LetterBeat, number][] = [
      ["shimmer", 500],
      ["cracking", 1020],
      ["breaking", 1520],
      ["opening", OPENING_AT],
      /* Derived from the engine so the flap is never cut off mid-turn. */
      ["reading", OPENING_AT + ENVELOPE_OPEN_MS],
    ];
    const timers = at.map(([s, ms]) => setTimeout(() => setBeat(s), ms));
    return () => timers.forEach(clearTimeout);
  }, [reduced]);

  const [showSurprise, setShowSurprise] = useState(false);
  useEffect(() => {
    if (!done || !letter.surprise) return;
    const t = setTimeout(() => setShowSurprise(true), reduced ? 200 : 1500);
    return () => clearTimeout(t);
  }, [done, letter.surprise, reduced]);

  const inkStyle: InkStyle = {
    family: hand.family,
    size: 19 * hand.scale,
    lineHeight: hand.lineHeight,
    tracking: hand.tracking,
    hex: inkPair.hex,
    wet: inkPair.wet,
  };

  const greetWords = countWords(greeting);
  const bodyWords = countWords(letter.body);

  return (
    <motion.div
      className="flex w-full flex-col items-center gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7 }}
    >
      <AnimatePresence mode="wait">
        {beat !== "reading" && beat !== "folding" ? (
          <motion.div key="env" exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.5 } }}>
            <Envelope
              envelopeId="vintage"
              sealColor={letter.sealColor}
              sealIcon={letter.sealIcon}
              monogram=""
              recipient={letter.title}
              phase={beat === "sealed" ? "closed" : (beat as "shimmer" | "cracking" | "breaking" | "opening")}
              /* No handler: here the opening is a cutscene that starts as soon as
                 the letter is taken out of the box. Passing a no-op made the seal
                 render as a button that silently ignored every click. */
            />
          </motion.div>
        ) : (
          <motion.article
            key="page"
            className="relative w-full"
            style={{
              maxWidth: 600,
              background: paperHex,
              backgroundImage: paperStyle.overlay === "none" ? undefined : paperStyle.overlay,
              boxShadow: paperStyle.edge,
              padding: "clamp(28px,5vw,52px) clamp(24px,5vw,46px)",
              borderRadius: paperStyle.deckled ? 2 : 3,
              transformOrigin: "center top",
              perspective: 1700,
            }}
            initial={reduced ? { opacity: 0 } : { opacity: 0, rotateX: -86, scaleY: 0.26 }}
            animate={
              beat === "folding"
                ? reduced
                  ? { opacity: 0 }
                  : { rotateX: -86, scaleY: 0.26, opacity: 0 }
                : { opacity: 1, rotateX: 0, scaleY: 1 }
            }
            transition={{ duration: reduced ? 0.3 : beat === "folding" ? 1.9 : 1.6, ease: [0.32, 0.02, 0.22, 1] }}
          >
            <span aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: FIBRE, opacity: paperStyle.grain * 0.6, mixBlendMode: "multiply" }} />

            <div className="relative">
              <Handwritten text={greeting} ink={inkStyle} seed={`${letter.id}-g`} written={written} startAt={0} showNib style={{ marginBottom: "1em" }} />
              <Handwritten text={letter.body} ink={inkStyle} seed={`${letter.id}-b`} written={written} startAt={greetWords} showNib style={{ marginBottom: "1em" }} />

              {/* the photo tucked in with it */}
              {done && letter.photoUrl && (
                <motion.div
                  className="my-5"
                  style={{ width: "min(190px, 54%)" }}
                  initial={{ opacity: 0, y: 12, rotate: -2.5 }}
                  animate={{ opacity: 1, y: 0, rotate: -2.5 }}
                  transition={{ duration: 0.9, delay: 0.3 }}
                  whileHover={reduced ? undefined : { scale: 1.05, rotate: 0 }}
                >
                  <span className="block" style={{ padding: "6% 6% 15%", background: "#fffdf6", boxShadow: "0 12px 24px -12px rgba(40,26,12,.5)" }}>
                    <span className="block overflow-hidden" style={{ aspectRatio: "1", background: "#dcd2c0" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={letter.photoUrl} alt={letter.photoCaption} className="h-full w-full object-cover" />
                    </span>
                    {letter.photoCaption && (
                      <span className="mt-[6%] block text-center" style={{ fontFamily: hand.family, fontSize: 14, color: inkPair.hex }}>
                        {letter.photoCaption}
                      </span>
                    )}
                  </span>
                </motion.div>
              )}

              {/* their voice, under the seal */}
              {done && letter.voiceUrl && (
                <VoiceRow url={letter.voiceUrl} letter={letter} handFamily={hand.family} ink={inkPair.hex} />
              )}

              <Handwritten text={closing} ink={inkStyle} seed={`${letter.id}-c`} written={written} startAt={greetWords + bodyWords} showNib style={{ marginTop: "1.4em" }} />
              <div className="mt-1">
                <Signature name={letter.signature} ink={inkStyle} visible={done} family={hand.family} />
              </div>

              {/* the tiny surprise, last */}
              <AnimatePresence>
                {showSurprise && (
                  <motion.div
                    className="mt-8 rounded-[3px] p-4"
                    style={{ background: `${seal.base}14`, border: `1px dashed ${seal.base}66` }}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2 }}
                  >
                    <span style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: seal.base }}>
                      One more thing
                    </span>
                    <p className="m-0 mt-2" style={{ fontFamily: hand.family, fontSize: 17 * hand.scale, lineHeight: 1.55, color: inkPair.hex }}>
                      {letter.surprise}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.article>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {done && beat === "reading" && (
          <button
            type="button"
            onClick={() => {
              setBeat("folding");
              window.setTimeout(onBack, reduced ? 200 : 2200);
            }}
            className="cursor-pointer rounded-full px-5 py-2.5 text-[10.5px] tracking-[0.18em] uppercase"
            style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", background: "transparent", border: "1px solid rgba(255,236,203,.28)", color: "rgba(255,236,203,.75)" }}
          >
            Fold it back up
          </button>
        )}
        <button
          type="button"
          onClick={onBack}
          className="cursor-pointer rounded-full px-5 py-2.5 text-[10.5px] tracking-[0.18em] uppercase"
          style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", background: "transparent", border: "1px solid rgba(255,236,203,.2)", color: "rgba(255,236,203,.55)" }}
        >
          ← Back to the box
        </button>
      </div>
    </motion.div>
  );
}

function VoiceRow({
  url,
  letter,
  handFamily,
  ink,
}: {
  url: string;
  letter: OpenWhenLetter;
  handFamily: string;
  ink: string;
}) {
  const [playing, setPlaying] = useState(false);
  const ref = useState<HTMLAudioElement | null>(null);
  const [el, setEl] = ref;

  const toggle = () => {
    if (!el) {
      setPlaying((p) => !p);
      return;
    }
    if (el.paused) void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    else {
      el.pause();
      setPlaying(false);
    }
  };

  return (
    <div className="my-5 flex items-center gap-3.5">
      <WaxSeal
        colorId={letter.sealColor}
        icon={letter.sealIcon}
        monogram=""
        size={54}
        glowOnHover
        playing={playing}
        onClick={toggle}
        ariaLabel={playing ? "Pause the recording" : "Press the seal to hear them"}
      />
      <span style={{ fontFamily: handFamily, fontSize: 15, color: `${ink}c0` }}>
        {playing ? "listening…" : "press the seal to hear me"}
      </span>
      <audio ref={setEl} src={url} preload="none" className="sr-only" onEnded={() => setPlaying(false)} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The whole keepsake box                                              */
/* ------------------------------------------------------------------ */

export function OpenWhenView({
  content,
  embedded = false,
}: {
  content: OpenWhenContent;
  embedded?: boolean;
}) {
  const reduced = useReducedMotion();
  const wood = WOODS[content.wood];
  const [stage, setStage] = useState<Stage>(embedded ? "open" : "closed");
  const [reading, setReading] = useState<string | null>(null);
  const [prompting, setPrompting] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [now, setNow] = useState(0);

  /* Read the clock only on the client, and only once a second — a date-locked
     letter has to be able to become available while they're sitting there. */
  useEffect(() => {
    const tick = () => setNow(Date.now());
    /* First read is scheduled rather than synchronous: it keeps the effect free
       of cascading renders, and `now = 0` simply means "nothing date-unlocked
       yet", which is the safe default for one frame. */
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  const boxTitle = content.boxTitle || OW_FALLBACKS.boxTitle;
  const dedication = content.dedication || OW_FALLBACKS.dedication;
  const current = content.letters.find((l) => l.id === reading) ?? null;
  const promptLetter = content.letters.find((l) => l.id === prompting) ?? null;

  const openedCount = content.letters.filter((l) => unlocked.has(l.id)).length;

  return (
    <div
      className={`${LETTER_FONT_VARS} ${ibmPlexMono.variable} relative w-full overflow-hidden`}
      style={{ height: embedded ? "100%" : "100dvh" }}
      aria-label={`${boxTitle} — a keepsake box of letters`}
    >
      {/* the room the box sits in */}
      <div aria-hidden className="absolute inset-0" style={{ background: `linear-gradient(168deg, #2a1e14, #16100a)` }} />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(ellipse 62% 54% at 50% 34%, ${wood.brass}22, transparent 62%)` }}
        animate={reduced ? undefined : { opacity: [0.75, 1, 0.75] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 flex h-full w-full items-center justify-center overflow-y-auto px-4 py-8 sm:px-8">
        <AnimatePresence mode="wait">
          {/* ---------- the box, shut ---------- */}
          {stage === "closed" && (
            <motion.div
              key="closed"
              className="flex flex-col items-center gap-7"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.6 } }}
              transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <motion.button
                type="button"
                onClick={() => setStage("open")}
                aria-label={`Open ${boxTitle}`}
                className="relative cursor-pointer border-0 bg-transparent p-0"
                style={{ width: "min(520px, 88vw)", aspectRatio: "8 / 5", perspective: 1600 }}
                whileHover={reduced ? undefined : { y: -6 }}
              >
                {/* the box body */}
                <span className="absolute inset-0 overflow-hidden rounded-[6px]" style={{ boxShadow: "0 40px 70px -28px rgba(0,0,0,.9)" }}>
                  <WoodSurface woodId={content.wood} />
                </span>
                {/* the lid */}
                <span
                  className="absolute inset-x-0 top-0 overflow-hidden rounded-t-[6px]"
                  style={{ height: "78%", boxShadow: "0 10px 22px -8px rgba(0,0,0,.8)" }}
                >
                  <WoodSurface woodId={content.wood} />
                  {/* inlay border */}
                  <span aria-hidden className="absolute rounded-[3px]" style={{ inset: "9%", border: `1px solid ${wood.brass}44` }} />
                  {/* engraved brass plate */}
                  <span
                    className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[2px] px-4 py-2"
                    style={{
                      background: `linear-gradient(160deg, ${wood.brass}, #8a6a2e)`,
                      boxShadow: "0 2px 5px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,245,214,.5)",
                      minWidth: "44%",
                    }}
                  >
                    <span style={{ fontFamily: "var(--hw-calligraphy), cursive", fontSize: "clamp(15px,2.4vw,23px)", color: "#3a2a10" }}>
                      {content.plate || boxTitle}
                    </span>
                  </span>
                </span>
                {/* hinges along the back edge */}
                <span aria-hidden className="absolute" style={{ left: "22%", top: "76%", width: "13%", height: "4%" }}>
                  <BrassHinge woodId={content.wood} />
                </span>
                <span aria-hidden className="absolute" style={{ right: "22%", top: "76%", width: "13%", height: "4%" }}>
                  <BrassHinge woodId={content.wood} />
                </span>
                {/* the clasp */}
                <span
                  aria-hidden
                  className="absolute left-1/2 -translate-x-1/2 rounded-[2px]"
                  style={{ bottom: "6%", width: "9%", height: "7%", background: `linear-gradient(180deg, ${wood.brass}, #7d5f28)`, boxShadow: "0 2px 4px rgba(0,0,0,.6)" }}
                />
              </motion.button>

              <div className="text-center">
                <p className="m-0" style={{ fontFamily: "var(--hw-elegant), cursive", fontSize: "clamp(17px,2.6vw,25px)", color: "#ffe8c4" }}>
                  {dedication}
                </p>
                <span className="mt-3 block text-[10px] tracking-[0.24em] uppercase" style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", color: "rgba(255,232,196,.5)" }}>
                  {content.letters.length} letters inside · lift the lid
                </span>
              </div>
            </motion.div>
          )}

          {/* ---------- inside the box ---------- */}
          {stage === "open" && (
            <motion.div
              key="open"
              className="w-full"
              style={{ maxWidth: 940 }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.5 } }}
              transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <div
                className="relative overflow-hidden rounded-[8px] p-5 sm:p-8"
                style={{ boxShadow: "0 44px 80px -30px rgba(0,0,0,.9)" }}
              >
                <WoodSurface woodId={content.wood} />
                {/* felt lining inside the box */}
                <span aria-hidden className="absolute" style={{ inset: 14, borderRadius: 5, background: "#3a2c22", boxShadow: "inset 0 4px 14px rgba(0,0,0,.7)" }} />

                <div className="relative">
                  <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <h2 className="m-0" style={{ fontFamily: "var(--hw-elegant), cursive", fontSize: "clamp(21px,3vw,30px)", color: "#ffe8c4" }}>
                        {boxTitle}
                      </h2>
                      <span className="mt-1 block text-[10px] tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", color: "rgba(255,232,196,.5)" }}>
                        {openedCount} of {content.letters.length} opened
                      </span>
                    </div>
                    {!embedded && (
                      <button
                        type="button"
                        onClick={() => setStage("closed")}
                        className="cursor-pointer rounded-full px-4 py-2 text-[10px] tracking-[0.16em] uppercase"
                        style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", background: "transparent", border: "1px solid rgba(255,232,196,.24)", color: "rgba(255,232,196,.6)" }}
                      >
                        Close the lid
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {content.letters.map((l, i) => {
                      const state = lockState(l, now, unlocked);
                      return (
                        <BoxEnvelope
                          key={l.id}
                          letter={l}
                          index={i}
                          locked={!state.open}
                          reason={state.reason}
                          handFamily={HANDS[l.hand].family}
                          onPick={() => {
                            if (state.open) {
                              setUnlocked((s) => new Set(s).add(l.id));
                              setReading(l.id);
                              setStage("reading");
                            }
                          }}
                        />
                      );
                    })}
                  </div>

                  {content.letters.length === 0 && (
                    <p className="m-0 py-8 text-center" style={{ fontFamily: "var(--hw-elegant), cursive", fontSize: 19, color: "rgba(255,232,196,.7)" }}>
                      The box is empty for now.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ---------- reading one ---------- */}
          {stage === "reading" && current && (
            <LetterReader
              key={current.id}
              letter={current}
              onBack={() => {
                setReading(null);
                setStage("open");
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* the locked-letter prompt */}
      <AnimatePresence>
        {promptLetter && (
          <UnlockPrompt
            letter={promptLetter}
            onClose={() => setPrompting(null)}
            onUnlock={() => {
              setUnlocked((s) => new Set(s).add(promptLetter.id));
              setPrompting(null);
              setReading(promptLetter.id);
              setStage("reading");
            }}
          />
        )}
      </AnimatePresence>

      {/* locked letters that need something from the recipient get a way in */}
      {stage === "open" && (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex flex-wrap justify-center gap-2 px-4">
          {content.letters
            .filter((l) => {
              const s = lockState(l, now, unlocked);
              return !s.open && s.needsInput;
            })
            .map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setPrompting(l.id)}
                className="pointer-events-auto cursor-pointer rounded-full px-4 py-2 text-[10px] tracking-[0.14em] uppercase"
                style={{
                  fontFamily: "var(--font-ibm-plex-mono), monospace",
                  background: "rgba(28,18,8,.7)",
                  border: `1px solid ${RIBBONS[l.ribbon].hex}66`,
                  color: "rgba(255,232,196,.8)",
                  backdropFilter: "blur(6px)",
                }}
              >
                🔑 {l.title}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
