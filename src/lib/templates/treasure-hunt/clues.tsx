"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Handwritten, countWords, useWriteCursor, type InkStyle } from "@/lib/engines/paper/ink";
import { ENVELOPE_OPEN_MS, Envelope, type EnvelopePhase } from "@/lib/engines/envelope";
import { AudioBlock } from "@/lib/engines/memory-block";
import type { BlockSkin } from "@/lib/engines/memory-block/schema";
import { answerAccepted, choicesFor, normaliseCode, type Stop } from "./schema";
import { BODY_FONT, DISPLAY_FONT, HAND_FONT, MONO_FONT, type MapStyle } from "./theme";

/**
 * The twelve things a stop can ask of somebody.
 *
 * Every one of them obeys the same three rules, which come straight from the
 * brief's most important line — *they should never feel like they're solving a
 * difficult puzzle*:
 *
 * 1. A wrong answer is never punished. It says something kind and waits.
 * 2. A nudge is available immediately, on request.
 * 3. After a while, the clue offers to simply let them through. Nobody who was
 *    sent an adventure ends up locked out of it.
 */

const NUDGE_AFTER = 14_000;
const LET_THROUGH_AFTER = 34_000;

/** Kind things to say when the answer isn't right. Never "wrong". */
const MISSES = [
  "Not quite — but you're thinking about the right day.",
  "Close. Have another go.",
  "Not that one. It's earlier than you think.",
  "No, but I like that you thought so.",
];

function useTimedHelp() {
  const [nudgeReady, setNudgeReady] = useState(false);
  const [escapeReady, setEscapeReady] = useState(false);
  useEffect(() => {
    const a = setTimeout(() => setNudgeReady(true), NUDGE_AFTER);
    const b = setTimeout(() => setEscapeReady(true), LET_THROUGH_AFTER);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, []);
  return { nudgeReady, escapeReady };
}

function HelpRow({
  stop,
  style,
  nudgeReady,
  escapeReady,
  onSolve,
}: {
  stop: Stop;
  style: MapStyle;
  nudgeReady: boolean;
  escapeReady: boolean;
  onSolve: () => void;
}) {
  const [showNudge, setShowNudge] = useState(false);
  const nudge = stop.clue.nudge.trim();

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="flex items-center gap-4">
        {nudge && nudgeReady && !showNudge && (
          <button
            type="button"
            onClick={() => setShowNudge(true)}
            className="cursor-pointer border-0 bg-transparent"
            style={{ fontFamily: MONO_FONT, fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: style.gilt }}
          >
            a hint?
          </button>
        )}
        {escapeReady && (
          <button
            type="button"
            onClick={onSolve}
            className="cursor-pointer border-0 bg-transparent"
            style={{ fontFamily: MONO_FONT, fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: style.inkSoft }}
          >
            let me through
          </button>
        )}
      </div>
      <AnimatePresence>
        {showNudge && nudge && (
          <motion.p
            className="m-0 max-w-sm text-center"
            style={{ fontFamily: HAND_FONT, fontSize: 17, color: style.gilt }}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {nudge}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/** A single text answer, checked forgivingly. */
function AskBox({
  stop,
  style,
  placeholder,
  onSolve,
}: {
  stop: Stop;
  style: MapStyle;
  placeholder: string;
  onSolve: () => void;
}) {
  const [given, setGiven] = useState("");
  const [misses, setMisses] = useState(0);
  const [shake, setShake] = useState(0);

  const submit = () => {
    if (answerAccepted(given, stop.clue.answer)) {
      onSolve();
      return;
    }
    setMisses((n) => n + 1);
    setShake((n) => n + 1);
  };

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <motion.form
        className="flex w-full max-w-sm gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        key={shake}
        animate={shake > 0 ? { x: [0, -7, 7, -4, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <input
          type="text"
          value={given}
          onChange={(e) => setGiven(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="flex-1 rounded-md px-3 py-2.5 text-[14px] outline-none"
          style={{
            background: style.dark ? "rgba(255,255,255,.07)" : "rgba(255,255,255,.5)",
            border: `1px solid ${style.giltSoft}`,
            color: style.ink,
            fontFamily: BODY_FONT,
          }}
        />
        <button
          type="submit"
          className="cursor-pointer rounded-md border-0 px-4"
          style={{ background: style.gilt, color: style.dark ? "#12101f" : "#f6ecd8", fontFamily: MONO_FONT, fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase" }}
        >
          say it
        </button>
      </motion.form>

      {misses > 0 && (
        <p className="m-0 text-center" style={{ fontFamily: HAND_FONT, fontSize: 17, color: style.inkSoft }} role="status">
          {MISSES[(misses - 1) % MISSES.length]}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Individual clues                                                    */
/* ------------------------------------------------------------------ */

/** The photograph sharpens with each attempt, so guessing is never wasted. */
function PhotoClue({ stop, style, onSolve }: { stop: Stop; style: MapStyle; onSolve: () => void }) {
  const [tries, setTries] = useState(0);
  const blur = Math.max(0, 16 - tries * 4);

  return (
    <div className="flex flex-col items-center gap-5">
      <motion.div
        className="overflow-hidden"
        style={{ width: "min(380px, 92%)", background: "#ddd4c2", padding: "3%", boxShadow: "0 22px 44px -20px rgba(0,0,0,.6)" }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <span className="block overflow-hidden" style={{ aspectRatio: "4 / 3" }}>
          {stop.clue.imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={stop.clue.imageUrl}
              alt="A photograph, out of focus until you place it"
              className="h-full w-full object-cover"
              style={{ filter: `blur(${blur}px)`, transition: "filter 900ms ease-out" }}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center" style={{ background: "#c8bca4", fontFamily: BODY_FONT, fontSize: 12, color: "#5a4a32" }}>
              No photograph attached
            </span>
          )}
        </span>
      </motion.div>

      <p className="m-0" style={{ fontFamily: MONO_FONT, fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: style.inkSoft }}>
        {blur > 0 ? "it clears as you get closer" : "there it is"}
      </p>

      <AskBoxWithTries stop={stop} style={style} placeholder="Where was this?" onSolve={onSolve} onMiss={() => setTries((n) => n + 1)} />
    </div>
  );
}

/** As `AskBox`, but tells the caller about each miss so the photo can sharpen. */
function AskBoxWithTries({
  stop,
  style,
  placeholder,
  onSolve,
  onMiss,
}: {
  stop: Stop;
  style: MapStyle;
  placeholder: string;
  onSolve: () => void;
  onMiss: () => void;
}) {
  const [given, setGiven] = useState("");
  const [misses, setMisses] = useState(0);

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <form
        className="flex w-full max-w-sm gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (answerAccepted(given, stop.clue.answer)) {
            onSolve();
            return;
          }
          setMisses((n) => n + 1);
          onMiss();
        }}
      >
        <input
          type="text"
          value={given}
          onChange={(e) => setGiven(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="flex-1 rounded-md px-3 py-2.5 text-[14px] outline-none"
          style={{
            background: style.dark ? "rgba(255,255,255,.07)" : "rgba(255,255,255,.5)",
            border: `1px solid ${style.giltSoft}`,
            color: style.ink,
            fontFamily: BODY_FONT,
          }}
        />
        <button
          type="submit"
          className="cursor-pointer rounded-md border-0 px-4"
          style={{ background: style.gilt, color: style.dark ? "#12101f" : "#f6ecd8", fontFamily: MONO_FONT, fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase" }}
        >
          say it
        </button>
      </form>
      {misses > 0 && (
        <p className="m-0 text-center" style={{ fontFamily: HAND_FONT, fontSize: 17, color: style.inkSoft }} role="status">
          {MISSES[(misses - 1) % MISSES.length]}
        </p>
      )}
    </div>
  );
}

/** Four places. Wrong ones fade rather than buzz. */
function LocationClue({ stop, style, onSolve }: { stop: Stop; style: MapStyle; onSolve: () => void }) {
  const choices = useMemo(() => choicesFor(stop), [stop]);
  const [ruledOut, setRuledOut] = useState<string[]>([]);

  if (choices.length === 0) {
    return (
      <p className="m-0" style={{ fontFamily: BODY_FONT, fontSize: 13, color: style.inkSoft }}>
        No places to choose from yet.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5">
      {choices.map((choice) => {
        const out = ruledOut.includes(choice);
        return (
          <motion.button
            key={choice}
            type="button"
            disabled={out}
            onClick={() => {
              if (answerAccepted(choice, stop.clue.answer)) onSolve();
              else setRuledOut((r) => [...r, choice]);
            }}
            className={`rounded-full px-5 py-2.5 ${out ? "cursor-default" : "cursor-pointer"}`}
            style={{
              background: style.dark ? "rgba(255,255,255,.06)" : "rgba(255,255,255,.42)",
              border: `1px solid ${style.giltSoft}`,
              color: style.ink,
              fontFamily: DISPLAY_FONT,
              fontSize: 17,
            }}
            animate={out ? { opacity: 0.28, scale: 0.96, textDecoration: "line-through" } : { opacity: 1, scale: 1 }}
            whileHover={out ? undefined : { scale: 1.05 }}
          >
            {choice}
          </motion.button>
        );
      })}
    </div>
  );
}

/** A sealed letter: wax cracks, envelope opens, ink writes itself on. */
function LetterClue({ stop, style, onSolve }: { stop: Stop; style: MapStyle; onSolve: () => void }) {
  const [phase, setPhase] = useState<EnvelopePhase>("closed");
  const [opening, setOpening] = useState(false);
  const [reading, setReading] = useState(false);
  const text = stop.clue.prompt || "…";
  const total = countWords(text);
  const written = useWriteCursor(total, 180, reading, []);
  const reduced = useReducedMotion();

  const ink: InkStyle = {
    family: HAND_FONT,
    size: 21,
    lineHeight: 1.8,
    tracking: "0",
    hex: style.ink,
    wet: style.gilt,
  };

  /* The wax-breaking beats, from the envelope engine's own sequence. Driven by an
     effect rather than from the click handler so the timers are cleaned up if the
     stop changes underneath it. */
  useEffect(() => {
    if (!opening) return;
    const OPENING_AT = 2100;
    const steps: [EnvelopePhase, number][] = reduced
      ? [["empty", 200]]
      : [
          ["shimmer", 0],
          ["cracking", 700],
          ["breaking", 1500],
          ["opening", OPENING_AT],
        ];
    const timers = steps.map(([next, at]) => setTimeout(() => setPhase(next), at));
    /* Derived from the engine so the flap finishes turning before the page of
       handwriting replaces it. */
    const read = setTimeout(() => setReading(true), reduced ? 260 : OPENING_AT + ENVELOPE_OPEN_MS);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(read);
    };
  }, [opening, reduced]);

  /* Once the last word has landed, the way onward appears. */
  const finished = !reading || written >= total;

  return (
    <div className="flex w-full flex-col items-center gap-6">
      {!reading ? (
        <div style={{ width: "min(400px, 92%)" }}>
          <Envelope
            envelopeId="vintage"
            sealColor="gold"
            sealIcon="initials"
            monogram=""
            recipient={stop.clue.place}
            phase={phase}
            onOpen={() => setOpening(true)}
          />
        </div>
      ) : (
        <motion.div
          className="w-full"
          style={{ maxWidth: "min(560px, 96%)", transformOrigin: "50% 0%" }}
          initial={reduced ? { opacity: 0 } : { opacity: 0, rotateX: -84, scaleY: 0.28 }}
          animate={{ opacity: 1, rotateX: 0, scaleY: 1 }}
          transition={{ duration: reduced ? 0.25 : 1.1, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <Handwritten text={text} ink={ink} seed={stop.id} written={written} startAt={0} showNib className="flex flex-col gap-3" />
        </motion.div>
      )}

      {reading && finished && (
        <motion.button
          type="button"
          onClick={onSolve}
          className="cursor-pointer rounded-full border-0 px-6 py-3"
          style={{ background: style.gilt, color: style.dark ? "#12101f" : "#f6ecd8", fontFamily: MONO_FONT, fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          onward
        </motion.button>
      )}
    </div>
  );
}

/** Three tiles, in the wrong order. Tap two to swap them. */
function PuzzleClue({ stop, style, onSolve }: { stop: Stop; style: MapStyle; onSolve: () => void }) {
  /* A fixed wrong start, derived from the id — never random. */
  const start = useMemo(() => {
    let h = 2166136261;
    for (let i = 0; i < stop.id.length; i += 1) {
      h ^= stop.id.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    const orders = [[1, 2, 0], [2, 0, 1], [1, 0, 2], [2, 1, 0]];
    return orders[(h >>> 0) % orders.length];
  }, [stop.id]);

  const [order, setOrder] = useState<number[]>(start);
  const [picked, setPicked] = useState<number | null>(null);
  const done = order.every((v, i) => v === i);
  const firedRef = useRef(false);

  useEffect(() => {
    if (!done || firedRef.current) return;
    firedRef.current = true;
    const id = setTimeout(onSolve, 900);
    return () => clearTimeout(id);
  }, [done, onSolve]);

  const tap = (slot: number) => {
    if (done) return;
    if (picked === null) {
      setPicked(slot);
      return;
    }
    if (picked === slot) {
      setPicked(null);
      return;
    }
    setOrder((o) => {
      const next = [...o];
      [next[picked], next[slot]] = [next[slot], next[picked]];
      return next;
    });
    setPicked(null);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2.5">
        {order.map((piece, slot) => (
          <motion.button
            key={slot}
            type="button"
            onClick={() => tap(slot)}
            aria-label={`Tile ${piece + 1}, position ${slot + 1}${picked === slot ? ", picked up" : ""}`}
            className="cursor-pointer overflow-hidden border-0 p-0"
            style={{
              width: 84,
              height: 84,
              borderRadius: 3,
              border: `1px solid ${picked === slot ? style.gilt : style.giltSoft}`,
              background: stop.clue.imageUrl
                ? `url(${stop.clue.imageUrl}) ${piece * 50}% 50% / 300% 100%`
                : style.giltSoft,
            }}
            animate={{ y: picked === slot ? -9 : 0, scale: picked === slot ? 1.05 : 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
          >
            {!stop.clue.imageUrl && (
              <span style={{ fontFamily: DISPLAY_FONT, fontSize: 27, color: style.ink }}>{piece + 1}</span>
            )}
          </motion.button>
        ))}
      </div>
      <span style={{ fontFamily: MONO_FONT, fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: style.inkSoft }} role="status">
        {done ? "that's it" : picked === null ? "tap two to swap them" : "now tap where it goes"}
      </span>
    </div>
  );
}

/** A drawer that has to be pulled. Dragged, or opened with Enter. */
function DrawerClue({ style, onSolve }: { style: MapStyle; onSolve: () => void }) {
  const reduced = useReducedMotion();
  const [pull, setPull] = useState(0);
  const [open, setOpen] = useState(false);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(onSolve, 1100);
    return () => clearTimeout(id);
  }, [open, onSolve]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: "min(320px, 90%)", aspectRatio: "3 / 2" }}>
        {/* the carcass */}
        <div
          className="absolute inset-0 overflow-hidden rounded-[4px]"
          style={{ background: "linear-gradient(168deg, #4a2f19, #33200f)", boxShadow: "inset 0 8px 24px rgba(0,0,0,.7)" }}
        >
          <motion.span
            aria-hidden
            className="absolute inset-0"
            style={{ background: `radial-gradient(ellipse at 50% 70%, ${style.glow}, transparent 70%)` }}
            animate={{ opacity: open ? 1 : pull / 180 }}
            transition={{ duration: 0.6 }}
          />
        </div>

        {/* the drawer front */}
        <motion.button
          type="button"
          aria-label={open ? "The drawer is open" : "Pull the drawer open"}
          onPointerDown={(e) => {
            if (open) return;
            startRef.current = e.clientY;
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (open || startRef.current === null) return;
            const dy = Math.max(0, e.clientY - startRef.current);
            setPull(Math.min(120, dy));
            if (dy > 84) setOpen(true);
          }}
          onPointerUp={() => {
            startRef.current = null;
            if (!open) setPull(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setPull(120);
              setOpen(true);
            }
          }}
          className={`absolute inset-x-0 bottom-0 border-0 p-0 ${open ? "cursor-default" : "cursor-grab active:cursor-grabbing"}`}
          style={{
            height: "72%",
            background: "linear-gradient(178deg, #7d5230, #5a3a1f)",
            border: "1px solid #33200f",
            borderRadius: 4,
            touchAction: "none",
          }}
          animate={{ y: open ? 118 : pull }}
          transition={{ type: reduced ? "tween" : "spring", stiffness: 240, damping: 26 }}
        >
          {/* the handle */}
          <span
            aria-hidden
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ width: 62, height: 9, background: `linear-gradient(90deg, #8a6a2c, #d8b46e, #8a6a2c)` }}
          />
        </motion.button>
      </div>
      <span style={{ fontFamily: MONO_FONT, fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: style.inkSoft }} role="status">
        {open ? "there's something in here" : "pull it open"}
      </span>
    </div>
  );
}

/**
 * Where the dials start.
 *
 * Never on the answer. A creator who picks the combination lock and leaves the
 * code at its default of "000" would otherwise ship a lock that springs open on
 * its own before anyone touches it — the dials all start at zero too. So the
 * start is derived from the code and nudged off it.
 */
function startingDials(target: string): number[] {
  const want = target.split("").map((d) => Number(d) || 0);
  const start = want.map((d) => (d + 5) % 10);
  /* Cannot coincide with the answer: +5 on every wheel can only land back on it
     if all three moved 5, which the modulo makes impossible for a 3-digit code. */
  return start.join("") === target ? want.map((d) => (d + 3) % 10) : start;
}

/** Three dials and a date that matters. */
function CombinationClue({ stop, style, onSolve }: { stop: Stop; style: MapStyle; onSolve: () => void }) {
  const target = normaliseCode(stop.clue.code);
  const [dials, setDials] = useState(() => startingDials(target));
  const open = dials.join("") === target;

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(onSolve, 1000);
    return () => clearTimeout(id);
  }, [open, onSolve]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2.5">
        {dials.map((n, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={() => setDials((d) => d.map((v, idx) => (idx === i ? (v + 1) % 10 : v)))}
              aria-label={`Dial ${i + 1} up`}
              className="cursor-pointer border-0 bg-transparent px-2 text-[11px]"
              style={{ color: style.inkSoft }}
            >
              ▲
            </button>
            <div
              className="flex items-center justify-center overflow-hidden rounded-[4px]"
              style={{
                width: 48,
                height: 62,
                background: open ? style.gilt : style.dark ? "rgba(255,255,255,.07)" : "rgba(74,52,24,.14)",
                border: `1px solid ${style.giltSoft}`,
                boxShadow: "inset 0 3px 9px rgba(0,0,0,.3)",
              }}
            >
              <motion.span
                key={n}
                style={{ fontFamily: MONO_FONT, fontSize: 27, color: open ? (style.dark ? "#12101f" : "#f6ecd8") : style.ink, fontVariantNumeric: "tabular-nums" }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {n}
              </motion.span>
            </div>
            <button
              type="button"
              onClick={() => setDials((d) => d.map((v, idx) => (idx === i ? (v + 9) % 10 : v)))}
              aria-label={`Dial ${i + 1} down`}
              className="cursor-pointer border-0 bg-transparent px-2 text-[11px]"
              style={{ color: style.inkSoft }}
            >
              ▼
            </button>
          </div>
        ))}
      </div>
      <span style={{ fontFamily: MONO_FONT, fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: style.inkSoft }} role="status">
        {open ? "it gives" : "a date that matters"}
      </span>
    </div>
  );
}

/** Candles, lit left to right. Out of order, they all go out and you start again. */
function CandlesClue({ style, onSolve }: { style: MapStyle; onSolve: () => void }) {
  const reduced = useReducedMotion();
  const COUNT = 5;
  const [lit, setLit] = useState<number[]>([]);
  const done = lit.length === COUNT;

  useEffect(() => {
    if (!done) return;
    const id = setTimeout(onSolve, 1200);
    return () => clearTimeout(id);
  }, [done, onSolve]);

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-end gap-4">
        {Array.from({ length: COUNT }).map((_, i) => {
          const isLit = lit.includes(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                if (isLit || done) return;
                /* Left to right. A wrong one puts them all out — gently. */
                if (i === lit.length) setLit((l) => [...l, i]);
                else setLit([]);
              }}
              aria-label={`Candle ${i + 1}${isLit ? ", lit" : ""}`}
              className="cursor-pointer border-0 bg-transparent p-0"
              style={{ width: 26 }}
            >
              {/* flame */}
              <span className="relative block" style={{ height: 30 }}>
                <AnimatePresence>
                  {isLit && (
                    <motion.span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2"
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.3 }}
                    >
                      <motion.svg
                        viewBox="0 0 14 22"
                        width="14"
                        height="22"
                        animate={reduced ? {} : { scaleY: [1, 1.18, 0.95, 1.1, 1] }}
                        transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <path d="M7 21 C 2 16, 3 8, 7 1 C 11 8, 12 16, 7 21 Z" fill={style.glow} />
                      </motion.svg>
                      <span
                        aria-hidden
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                        style={{ width: 44, height: 44, background: `radial-gradient(circle, ${style.glow}, transparent 62%)`, filter: "blur(6px)", opacity: 0.6 }}
                      />
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
              {/* wick and body */}
              <span className="mx-auto block" style={{ width: 1.5, height: 5, background: style.ink, opacity: 0.7 }} />
              <span
                className="mx-auto block rounded-[2px]"
                style={{
                  width: 16,
                  height: 44 + (i % 2) * 8,
                  background: `linear-gradient(178deg, #f6ecd8, #d8c8a8)`,
                  boxShadow: "inset -2px 0 4px rgba(0,0,0,.16)",
                }}
              />
            </button>
          );
        })}
      </div>
      <span style={{ fontFamily: MONO_FONT, fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: style.inkSoft }} role="status">
        {done ? "all lit" : lit.length === 0 ? "left to right" : `${lit.length} of ${COUNT}`}
      </span>
    </div>
  );
}

/** Stars, joined in order. Same forgiveness: a wrong star simply doesn't take. */
function ConstellationClue({ style, onSolve }: { style: MapStyle; onSolve: () => void }) {
  const reduced = useReducedMotion();
  /* A small, recognisable shape rather than a random field. */
  const STARS = [
    { x: 18, y: 66 },
    { x: 32, y: 32 },
    { x: 50, y: 52 },
    { x: 68, y: 22 },
    { x: 84, y: 58 },
  ];
  const [joined, setJoined] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const done = joined.length === STARS.length;

  useEffect(() => {
    if (!done) return;
    const id = setTimeout(onSolve, 1300);
    return () => clearTimeout(id);
  }, [done, onSolve]);

  useEffect(() => {
    if (wrong === null) return;
    const id = setTimeout(() => setWrong(null), 600);
    return () => clearTimeout(id);
  }, [wrong]);

  const line = joined.map((i) => `${STARS[i].x},${STARS[i].y}`).join(" ");

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative w-full overflow-hidden rounded-[4px]"
        style={{
          maxWidth: "min(440px, 94%)",
          aspectRatio: "2 / 1",
          background: "radial-gradient(ellipse at 50% 20%, #22244a, #0e102a)",
          border: `1px solid ${style.giltSoft}`,
        }}
      >
        <svg viewBox="0 0 100 80" className="absolute inset-0 h-full w-full">
          {/* the joins */}
          {joined.length > 1 && (
            <motion.polyline
              points={line}
              fill="none"
              stroke={style.gilt}
              strokeWidth="1"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5 }}
            />
          )}
          {/* faint field behind, so it looks like sky */}
          {[[8, 14], [26, 8], [44, 16], [62, 10], [78, 18], [92, 12], [14, 40], [88, 44], [38, 72], [72, 74]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="0.6" fill="#eee6cc" opacity="0.4" />
          ))}
        </svg>

        {STARS.map((s, i) => {
          const on = joined.includes(i);
          return (
            <motion.button
              key={i}
              type="button"
              onClick={() => {
                if (on || done) return;
                if (i === joined.length) setJoined((j) => [...j, i]);
                else setWrong(i);
              }}
              aria-label={`Star ${i + 1}${on ? ", joined" : ""}`}
              className="absolute cursor-pointer border-0 bg-transparent p-0"
              style={{ left: `${s.x}%`, top: `${(s.y / 80) * 100}%`, width: 26, height: 26, transform: "translate(-50%,-50%)" }}
              animate={wrong === i && !reduced ? { x: [0, -4, 4, 0] } : {}}
              whileHover={on || reduced ? undefined : { scale: 1.3 }}
            >
              <motion.svg
                viewBox="0 0 26 26"
                className="h-full w-full"
                animate={reduced ? {} : { opacity: on ? 1 : [0.55, 1, 0.55] }}
                transition={{ duration: 3 + i * 0.6, repeat: Infinity }}
              >
                <path
                  d="M13 3 L15.2 10 L22 11 L16.6 15.2 L18.4 22 L13 18.2 L7.6 22 L9.4 15.2 L4 11 L10.8 10 Z"
                  fill={on ? style.gilt : "#eee6cc"}
                />
              </motion.svg>
            </motion.button>
          );
        })}
      </div>
      <span style={{ fontFamily: MONO_FONT, fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: style.inkSoft }} role="status">
        {done ? "there it is" : wrong !== null ? "not that one yet" : "join them in order"}
      </span>
    </div>
  );
}

/**
 * A key hidden on the page. Deliberately findable: it glints every few seconds, and
 * the glint gets more insistent the longer it takes — "search the page" must not
 * become "hunt the pixel".
 */
function KeyClue({ stop, style, onSolve }: { stop: Stop; style: MapStyle; onSolve: () => void }) {
  const reduced = useReducedMotion();
  const [waited, setWaited] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setWaited((n) => n + 1), 5000);
    return () => clearInterval(id);
  }, []);

  /* Its spot comes from the stop id, so it isn't in the same place every time. */
  let h = 2166136261;
  for (let i = 0; i < stop.id.length; i += 1) {
    h ^= stop.id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const spots = [
    { left: "8%", top: "22%" },
    { right: "11%", top: "34%" },
    { left: "16%", bottom: "18%" },
    { right: "18%", bottom: "24%" },
    { left: "46%", top: "12%" },
  ];
  const spot = spots[(h >>> 0) % spots.length];
  const obvious = Math.min(1, waited / 5);

  return (
    <div className="relative w-full" style={{ minHeight: 240 }}>
      <p
        className="m-0 pt-10 text-center"
        style={{ fontFamily: HAND_FONT, fontSize: 20, color: style.inkSoft }}
      >
        {waited < 3 ? "It's on this page somewhere." : "It's glinting, look."}
      </p>

      <motion.button
        type="button"
        onClick={onSolve}
        aria-label="The hidden key"
        className="absolute cursor-pointer border-0 bg-transparent p-0"
        style={{ ...spot, width: 46 + obvious * 14, height: 20 + obvious * 6 }}
        animate={
          reduced
            ? { opacity: 1 }
            : { opacity: [0.4 + obvious * 0.5, 1, 0.4 + obvious * 0.5], rotate: [-8, -4, -8] }
        }
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.2 }}
      >
        <svg viewBox="0 0 60 24" className="h-full w-full" style={{ filter: `drop-shadow(0 0 ${4 + obvious * 8}px ${style.glow})` }}>
          <circle cx="11" cy="12" r="8.4" fill="none" stroke={style.gilt} strokeWidth="3.4" />
          <path d="M19 12 H54" stroke={style.gilt} strokeWidth="3.4" strokeLinecap="round" />
          <path d="M46 12 V19 M52 12 V17" stroke={style.gilt} strokeWidth="3.4" strokeLinecap="round" />
        </svg>
      </motion.button>
    </div>
  );
}

/* ------------------------------------------------------------------ */

/** The clue at this stop, whatever it is. */
export function ClueView({
  stop,
  style,
  blockSkin,
  onSolve,
}: {
  stop: Stop;
  style: MapStyle;
  blockSkin: BlockSkin;
  onSolve: () => void;
}) {
  const { nudgeReady, escapeReady } = useTimedHelp();
  const kind = stop.clue.kind;
  const prompt = stop.clue.prompt.trim();

  return (
    <div className="flex w-full flex-col items-center gap-7">
      {/* the clue, read before anything happens — except letters, which *are* the prompt */}
      {prompt && kind !== "letter" && (
        <motion.p
          className="m-0 max-w-lg text-center"
          style={{ fontFamily: HAND_FONT, fontSize: "clamp(19px,3vw,26px)", lineHeight: 1.45, color: style.ink }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          {prompt}
        </motion.p>
      )}

      {kind === "photo" && <PhotoClue stop={stop} style={style} onSolve={onSolve} />}
      {kind === "location" && <LocationClue stop={stop} style={style} onSolve={onSolve} />}
      {kind === "letter" && <LetterClue stop={stop} style={style} onSolve={onSolve} />}
      {kind === "puzzle" && <PuzzleClue stop={stop} style={style} onSolve={onSolve} />}
      {kind === "drawer" && <DrawerClue style={style} onSolve={onSolve} />}
      {kind === "combination" && <CombinationClue stop={stop} style={style} onSolve={onSolve} />}
      {kind === "candles" && <CandlesClue style={style} onSolve={onSolve} />}
      {kind === "constellation" && <ConstellationClue style={style} onSolve={onSolve} />}
      {kind === "key" && <KeyClue stop={stop} style={style} onSolve={onSolve} />}
      {kind === "riddle" && <AskBox stop={stop} style={style} placeholder="Your answer" onSolve={onSolve} />}

      {kind === "voice" && (
        <div className="flex w-full flex-col items-center gap-6">
          <div style={{ width: "min(400px, 92%)" }}>
            <AudioBlock url={stop.clue.audioUrl} skin={blockSkin} label="Play it" />
          </div>
          <AskBox stop={stop} style={style} placeholder="Where were we?" onSolve={onSolve} />
        </div>
      )}

      {kind === "video" && (
        <div className="flex flex-col items-center gap-6">
          <div className="overflow-hidden rounded-[3px]" style={{ width: "min(520px, 94%)", background: "#000", boxShadow: "0 24px 48px -22px rgba(0,0,0,.7)" }}>
            {stop.clue.videoUrl ? (
              <video src={stop.clue.videoUrl} controls playsInline preload="metadata" className="block w-full" aria-label="A clip" />
            ) : (
              <div className="flex items-center justify-center" style={{ aspectRatio: "16/9", color: style.inkSoft, fontFamily: BODY_FONT, fontSize: 13 }}>
                No clip attached yet
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onSolve}
            className="cursor-pointer rounded-full border-0 px-6 py-3"
            style={{ background: style.gilt, color: style.dark ? "#12101f" : "#f6ecd8", fontFamily: MONO_FONT, fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase" }}
          >
            onward
          </button>
        </div>
      )}

      {/* Nobody gets stuck. */}
      <HelpRow stop={stop} style={style} nudgeReady={nudgeReady} escapeReady={escapeReady} onSolve={onSolve} />
    </div>
  );
}
