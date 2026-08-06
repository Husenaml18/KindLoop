"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useClock } from "@/lib/engines/unlock/clock";
import { ibmPlexMono } from "@/app/fonts";
import { LETTER_FONT_VARS } from "@/app/letterFonts";
import { Door, type DoorState } from "./doors";
import { MontageCard, Surprise } from "./surprises";
import {
  CD_FALLBACKS,
  encouragement,
  openedCount,
  remainingUntil,
  unlockAt,
  type CountdownContent,
} from "./schema";
import { BODY_FONT, GILT_GRAIN, HAND_FONT, MONO_FONT, NUMERAL_FONT, SKINS } from "./theme";

/* ------------------------------------------------------------------ */
/* The night sky the calendar hangs in                                 */
/* ------------------------------------------------------------------ */

/** Fixed, not random — the same sky must render on the server and the client. */
const STARS = [
  [6, 12, 1.6, 3.1], [14, 31, 1.1, 1.4], [21, 7, 2.0, 4.6], [28, 22, 1.3, 2.2],
  [34, 44, 1.0, 5.2], [41, 9, 1.7, 3.7], [47, 33, 1.2, 1.9], [53, 17, 2.1, 4.1],
  [59, 39, 1.1, 2.7], [66, 6, 1.5, 5.6], [72, 26, 1.9, 1.2], [78, 14, 1.2, 3.4],
  [84, 37, 1.6, 4.8], [91, 20, 1.1, 2.4], [96, 8, 1.8, 5.9], [3, 41, 1.3, 1.7],
  [11, 52, 1.0, 4.3], [25, 58, 1.4, 2.9], [38, 63, 1.1, 5.4], [50, 55, 1.7, 1.5],
  [63, 61, 1.2, 3.9], [75, 52, 1.5, 2.1], [88, 57, 1.0, 4.9], [95, 45, 1.4, 3.3],
] as const;

function NightSky({ color, dim }: { color: string; dim: boolean }) {
  const reduced = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {STARS.map(([x, y, r, delay], i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{ left: `${x}%`, top: `${y}%`, width: r * 2, height: r * 2, background: color }}
          animate={
            reduced
              ? { opacity: dim ? 0.12 : 0.42 }
              : { opacity: dim ? [0.05, 0.14, 0.05] : [0.2, 0.72, 0.2] }
          }
          transition={{ duration: 3.6 + (i % 5) * 0.9, repeat: Infinity, delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/** Slow drift of snow / motes, so the wall is never quite still. */
const MOTES = [4, 13, 22, 29, 37, 45, 52, 61, 68, 76, 83, 91] as const;

function Motes({ color }: { color: string }) {
  const reduced = useReducedMotion();
  if (reduced) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {MOTES.map((x, i) => (
        <motion.span
          key={x}
          className="absolute rounded-full"
          style={{ left: `${x}%`, width: 2 + (i % 3), height: 2 + (i % 3), background: color, opacity: 0.3 }}
          initial={{ top: "-4%" }}
          animate={{ top: "104%", x: [0, i % 2 ? 26 : -26, 0] }}
          transition={{
            duration: 22 + (i % 4) * 7,
            repeat: Infinity,
            delay: i * 1.7,
            ease: "linear",
            x: { duration: 11 + (i % 3) * 3, repeat: Infinity, ease: "easeInOut" },
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The live countdown                                                  */
/* ------------------------------------------------------------------ */

function Ticker({ target, now, skin }: { target: number; now: number; skin: (typeof SKINS)[keyof typeof SKINS] }) {
  const r = remainingUntil(target, now);
  const cells: [number, string][] = [
    [r.days, r.days === 1 ? "day" : "days"],
    [r.hours, "hrs"],
    [r.mins, "min"],
    [r.secs, "sec"],
  ];
  return (
    <div className="flex items-end justify-center gap-3 sm:gap-5" role="timer" aria-live="off">
      {cells.map(([n, label], i) => (
        <div key={label} className="flex items-end gap-3 sm:gap-5">
          <div className="flex flex-col items-center">
            <div
              style={{
                fontFamily: NUMERAL_FONT,
                fontSize: "clamp(28px,5vw,54px)",
                lineHeight: 1,
                color: skin.gold,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {String(n).padStart(2, "0")}
            </div>
            <div
              className="mt-1.5"
              style={{ fontFamily: MONO_FONT, fontSize: 8.5, letterSpacing: ".22em", textTransform: "uppercase", color: skin.inkSoft }}
            >
              {label}
            </div>
          </div>
          {i < cells.length - 1 && (
            <span aria-hidden style={{ fontFamily: NUMERAL_FONT, fontSize: "clamp(20px,3.4vw,34px)", color: skin.goldSoft, lineHeight: 1.35 }}>
              ·
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function CountdownGiftView({
  content,
  embedded = false,
}: {
  content: CountdownContent;
  embedded?: boolean;
}) {
  const skin = SKINS[content.skin] ?? SKINS.midnight;
  const reduced = useReducedMotion();

  /* The Unlock Engine's clock: 0 until it has been read on the client, so the
     server and the browser never disagree about which doors are open. */
  const now = useClock();

  const days = content.days;
  /** In a preview or demo frame there is no waiting — show the whole calendar. */
  const opened = embedded ? days.length : now === 0 ? 0 : openedCount(content, now);

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [seen, setSeen] = useState<Set<number>>(new Set());
  const [nudge, setNudge] = useState<{ text: string; at: number } | null>(null);
  const [finale, setFinale] = useState(false);
  const [music, setMusic] = useState(false);

  /* Whichever door is next. When they're all open, this is the finale instead. */
  const nextIndex = opened < days.length ? opened : -1;
  const nextUnlock = nextIndex >= 0 ? unlockAt(content, nextIndex) : 0;
  const hasSchedule = content.startDate.trim().length > 0;
  const allOpen = days.length > 0 && opened >= days.length;

  /* Midnight arriving while they're watching deserves an announcement. */
  const [justUnlocked, setJustUnlocked] = useState<number | null>(null);
  const prevOpened = useRef<number | null>(null);
  useEffect(() => {
    if (now === 0 || embedded) return;
    const before = prevOpened.current;
    prevOpened.current = opened;
    if (before === null || opened <= before) return;
    setJustUnlocked(opened - 1);
    const id = setTimeout(() => setJustUnlocked(null), 6200);
    return () => clearTimeout(id);
  }, [opened, now, embedded]);

  /* The encouragement fades on its own — it's a reassurance, not a dialog. */
  useEffect(() => {
    if (!nudge) return;
    const id = setTimeout(() => setNudge(null), 3000);
    return () => clearTimeout(id);
  }, [nudge]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const openDay = (i: number) => {
    setOpenIndex(i);
    setSeen((s) => (s.has(i) ? s : new Set(s).add(i)));
    /* "Music begins" — but only once a door has actually been opened, and only
       because a person clicked. Autoplay without a gesture is both rude and
       blocked by every browser. */
    if (content.musicUrl && audioRef.current && audioRef.current.paused) {
      void audioRef.current.play().then(() => setMusic(true)).catch(() => setMusic(false));
    }
  };

  const stateOf = (i: number): DoorState =>
    i >= opened ? "locked" : seen.has(i) ? "opened" : "ready";

  const daysAwayOf = (i: number) => {
    if (!hasSchedule || now === 0) return 0;
    return Math.max(0, Math.ceil((unlockAt(content, i) - now) / 86_400_000));
  };

  /* Grid columns that stay square and readable from 3 doors to 31. */
  const cols = useMemo(() => {
    const n = days.length;
    if (n <= 4) return n || 1;
    if (n <= 9) return 3;
    if (n <= 16) return 4;
    if (n <= 25) return 5;
    return 6;
  }, [days.length]);

  const openedDays = days.slice(0, opened);
  const active = openIndex !== null ? days[openIndex] : null;

  return (
    <div
      className={`${ibmPlexMono.variable} ${LETTER_FONT_VARS} relative w-full overflow-hidden`}
      style={{ minHeight: embedded ? "100%" : "100dvh", background: skin.bg }}
    >
      <NightSky color={skin.star} dim={openIndex !== null || finale} />
      <Motes color={skin.star} />

      {/* the calendar's own light, pooling behind the board */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(ellipse 62% 44% at 50% 40%, ${skin.glow}18, transparent 70%)` }}
      />

      <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center px-5 py-12 sm:px-8 sm:py-16">
        {/* ---------- the board ---------- */}
        <motion.div
          className="relative w-full"
          style={{
            background: skin.board,
            border: `1px solid ${skin.boardEdge}`,
            borderRadius: 6,
            boxShadow: `0 60px 110px -50px rgba(0,0,0,.9), 0 0 0 8px rgba(0,0,0,.22)`,
          }}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 26, rotateX: 6 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {/* gilt grain over the whole board */}
          <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[6px]" style={{ backgroundImage: GILT_GRAIN, opacity: 0.05, mixBlendMode: "overlay" }} />
          {/* the nail it hangs from */}
          <span
            aria-hidden
            className="absolute left-1/2 -translate-x-1/2 rounded-full"
            style={{ top: -13, width: 9, height: 9, background: skin.gold, boxShadow: `0 0 12px ${skin.glow}88` }}
          />

          <div className="px-5 py-9 sm:px-10 sm:py-12">
            {/* ---------- header ---------- */}
            <header className="text-center">
              {content.occasion && (
                <div style={{ fontFamily: MONO_FONT, fontSize: 9.5, letterSpacing: ".3em", textTransform: "uppercase", color: skin.gold }}>
                  counting down to {content.occasion}
                </div>
              )}
              <h1
                className="m-0 mt-4"
                style={{ fontFamily: NUMERAL_FONT, fontSize: "clamp(30px,5.6vw,58px)", lineHeight: 1.06, color: skin.ink, letterSpacing: "-0.015em" }}
              >
                {content.title || CD_FALLBACKS.title}
              </h1>
              {(content.dedication || CD_FALLBACKS.dedication) && (
                <p className="m-0 mx-auto mt-4 max-w-md" style={{ fontFamily: HAND_FONT, fontSize: 20, lineHeight: 1.5, color: skin.inkSoft }}>
                  {content.dedication || CD_FALLBACKS.dedication}
                </p>
              )}
              <div
                aria-hidden
                className="mx-auto mt-7"
                style={{ width: 116, height: 1, background: `linear-gradient(to right, transparent, ${skin.gold}, transparent)` }}
              />
            </header>

            {/* ---------- the countdown to whatever is next ---------- */}
            {hasSchedule && !embedded && now > 0 && (
              <div className="mt-9">
                {nextIndex >= 0 ? (
                  <>
                    <Ticker target={nextUnlock} now={now} skin={skin} />
                    <div
                      className="mt-4 text-center"
                      style={{ fontFamily: MONO_FONT, fontSize: 9.5, letterSpacing: ".2em", textTransform: "uppercase", color: skin.inkSoft }}
                    >
                      until day {nextIndex + 1}
                    </div>
                  </>
                ) : (
                  <div className="text-center" style={{ fontFamily: HAND_FONT, fontSize: 22, color: skin.gold }}>
                    Every door is open.
                  </div>
                )}
              </div>
            )}

            {/* ---------- the doors ---------- */}
            {days.length === 0 ? (
              <p className="mt-10 text-center" style={{ fontFamily: BODY_FONT, fontSize: 13.5, color: skin.inkSoft }}>
                No days yet. Add the first one.
              </p>
            ) : (
              <div
                className="mt-10 grid gap-2.5 sm:gap-3.5"
                style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
              >
                {days.map((day, i) => (
                  <Door
                    key={day.id}
                    index={i}
                    day={day}
                    skin={skin}
                    doorStyle={content.doorStyle}
                    state={stateOf(i)}
                    daysAway={daysAwayOf(i)}
                    onOpen={() => openDay(i)}
                    onNudge={(away) => setNudge({ text: encouragement(Number(away) || 0), at: i })}
                  />
                ))}
              </div>
            )}

            {/* ---------- the gentle refusal ---------- */}
            <div className="mt-6 flex min-h-[26px] items-center justify-center">
              <AnimatePresence mode="wait">
                {nudge && (
                  <motion.p
                    key={`${nudge.at}-${nudge.text}`}
                    className="m-0 text-center"
                    style={{ fontFamily: HAND_FONT, fontSize: 20, color: skin.gold }}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.4 }}
                  >
                    {nudge.text}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* ---------- the finale, only once they've earned it ---------- */}
            {allOpen && (
              <motion.div
                className="mt-9 flex flex-col items-center gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.3 }}
              >
                <button
                  type="button"
                  onClick={() => setFinale(true)}
                  className="cursor-pointer rounded-full border-0 px-7 py-3"
                  style={{ background: skin.gold, color: "#20180a", fontFamily: MONO_FONT, fontSize: 10.5, letterSpacing: ".2em", textTransform: "uppercase" }}
                >
                  See all of it at once
                </button>
                <span style={{ fontFamily: BODY_FONT, fontSize: 12, color: skin.inkSoft }}>
                  {days.length} {days.length === 1 ? "day" : "days"}, start to finish
                </span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {content.musicUrl && (
          <>
            <audio ref={audioRef} src={content.musicUrl} loop preload="none" className="sr-only" />
            <button
              type="button"
              onClick={() => {
                const el = audioRef.current;
                if (!el) return;
                if (el.paused) void el.play().then(() => setMusic(true)).catch(() => setMusic(false));
                else {
                  el.pause();
                  setMusic(false);
                }
              }}
              className="mt-7 cursor-pointer rounded-full border px-4 py-2"
              style={{ background: "transparent", borderColor: skin.goldSoft, color: skin.inkSoft, fontFamily: MONO_FONT, fontSize: 9.5, letterSpacing: ".18em", textTransform: "uppercase" }}
            >
              {music ? "❙❙ music" : "▶ music"}
            </button>
          </>
        )}
      </div>

      {/* ---------- midnight ---------- */}
      <AnimatePresence>
        {justUnlocked !== null && (
          <motion.div
            className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-5 pt-7"
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div
              className="flex items-center gap-3 rounded-full px-6 py-3"
              style={{ background: "rgba(0,0,0,.62)", border: `1px solid ${skin.gold}`, backdropFilter: "blur(10px)" }}
            >
              <motion.span
                aria-hidden
                style={{ color: skin.gold, fontSize: 15 }}
                animate={reduced ? undefined : { rotate: [0, 22, -22, 0], scale: [1, 1.24, 1] }}
                transition={{ duration: 2.4, repeat: Infinity }}
              >
                ✦
              </motion.span>
              <span role="status" style={{ fontFamily: HAND_FONT, fontSize: 20, color: skin.ink }}>
                Day {justUnlocked + 1} just unlocked.
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- what was behind the door ---------- */}
      <AnimatePresence>
        {active && openIndex !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-5 sm:p-9"
            style={{ background: "rgba(6,4,12,.9)", backdropFilter: "blur(7px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Day ${openIndex + 1}`}
            onClick={() => setOpenIndex(null)}
          >
            <motion.div
              className="relative my-auto w-full max-w-2xl"
              style={{
                background: skin.board,
                border: `1px solid ${skin.boardEdge}`,
                borderRadius: 6,
                boxShadow: `0 60px 120px -50px #000, 0 0 90px -30px ${skin.glow}44`,
                transformOrigin: "50% 0%",
              }}
              /* The paper unfolds rather than flying in — same physics as the
                 letter templates, so the whole platform feels made of paper. */
              initial={reduced ? { opacity: 0 } : { opacity: 0, rotateX: -84, scaleY: 0.3 }}
              animate={{ opacity: 1, rotateX: 0, scaleY: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, rotateX: -60, scaleY: 0.5 }}
              transition={{ duration: reduced ? 0.25 : 1, ease: [0.2, 0.8, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[6px]" style={{ backgroundImage: GILT_GRAIN, opacity: 0.05, mixBlendMode: "overlay" }} />
              <button
                type="button"
                onClick={() => setOpenIndex(null)}
                aria-label="Close"
                className="absolute right-3.5 top-3.5 z-10 cursor-pointer rounded-full border-0"
                style={{ width: 34, height: 34, background: "rgba(0,0,0,.4)", color: skin.inkSoft, fontSize: 15 }}
              >
                ✕
              </button>
              <div className="px-6 py-11 sm:px-11 sm:py-14">
                <Surprise day={active} skin={skin} dayNumber={openIndex + 1} />
              </div>

              {/* walk back and forth through what's already open */}
              <div className="flex items-center justify-between gap-3 px-6 pb-7 sm:px-11">
                <button
                  type="button"
                  onClick={() => openIndex > 0 && openDay(openIndex - 1)}
                  disabled={openIndex === 0}
                  className="cursor-pointer rounded-full border bg-transparent px-4 py-2 disabled:cursor-default disabled:opacity-30"
                  style={{ borderColor: skin.goldSoft, color: skin.inkSoft, fontFamily: MONO_FONT, fontSize: 9.5, letterSpacing: ".16em", textTransform: "uppercase" }}
                >
                  ← earlier
                </button>
                <span style={{ fontFamily: MONO_FONT, fontSize: 9.5, letterSpacing: ".18em", color: skin.inkSoft }}>
                  {openIndex + 1} / {days.length}
                </span>
                <button
                  type="button"
                  onClick={() => openIndex + 1 < opened && openDay(openIndex + 1)}
                  disabled={openIndex + 1 >= opened}
                  className="cursor-pointer rounded-full border bg-transparent px-4 py-2 disabled:cursor-default disabled:opacity-30"
                  style={{ borderColor: skin.goldSoft, color: skin.inkSoft, fontFamily: MONO_FONT, fontSize: 9.5, letterSpacing: ".16em", textTransform: "uppercase" }}
                >
                  later →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- the ending montage ---------- */}
      <AnimatePresence>
        {finale && (
          <motion.div
            className="fixed inset-0 z-[60] overflow-y-auto"
            style={{ background: skin.bg }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            role="dialog"
            aria-modal="true"
            aria-label="The whole countdown"
          >
            <NightSky color={skin.star} dim={false} />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ background: `radial-gradient(ellipse 70% 50% at 50% 24%, ${skin.glow}22, transparent 68%)` }}
            />
            <div className="relative mx-auto max-w-3xl px-6 py-16 sm:py-24">
              <button
                type="button"
                onClick={() => setFinale(false)}
                aria-label="Close"
                className="absolute right-5 top-6 cursor-pointer rounded-full border-0"
                style={{ width: 36, height: 36, background: "rgba(0,0,0,.4)", color: skin.inkSoft, fontSize: 16 }}
              >
                ✕
              </button>

              <motion.h2
                className="m-0 text-center"
                style={{ fontFamily: NUMERAL_FONT, fontSize: "clamp(27px,5vw,52px)", lineHeight: 1.1, color: skin.ink }}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18, filter: "blur(9px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1.5 }}
              >
                {content.finaleTitle || CD_FALLBACKS.finaleTitle}
              </motion.h2>
              <motion.p
                className="m-0 mx-auto mt-5 max-w-lg text-center"
                style={{ fontFamily: HAND_FONT, fontSize: 21, lineHeight: 1.55, color: skin.inkSoft }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.5 }}
              >
                {content.finaleNote || CD_FALLBACKS.finaleNote}
              </motion.p>

              <div className="mt-12 grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4">
                {openedDays.map((day, i) => (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => {
                      setFinale(false);
                      openDay(i);
                    }}
                    className="cursor-pointer border-0 bg-transparent p-0"
                    aria-label={`Open day ${i + 1} again`}
                  >
                    <MontageCard day={day} index={i} skin={skin} />
                  </button>
                ))}
              </div>

              <motion.div
                aria-hidden
                className="mx-auto mt-14"
                style={{ width: 116, height: 1, background: `linear-gradient(to right, transparent, ${skin.gold}, transparent)` }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.4, delay: 0.9 + openedDays.length * 0.11 }}
              />
              <p className="mt-7 text-center" style={{ fontFamily: MONO_FONT, fontSize: 9.5, letterSpacing: ".26em", textTransform: "uppercase", color: skin.inkSoft }}>
                made with kindloop
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
