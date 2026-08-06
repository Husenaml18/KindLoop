"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";
import { CHAPTERS, MOODS, type ChapterId } from "./theme";
import { Character, Doodle, Motes, PaperPlane, Pin, Sheet, Sticky, Teddy } from "./parts";
import type { WinYouBackContent } from "./schema";

/**
 * Operation: Win You Back.
 *
 * The one rule everything else follows: **the recipient is never pressured**.
 * Concretely, and these are testable properties rather than good intentions —
 *
 *   - nothing is gated. Every chapter can be skipped, the whole thing can be
 *     jumped past, and the last page is reachable from the first;
 *   - nothing is counted. There is no "seen" state sent anywhere, no read receipt,
 *     and no way for the sender to learn what was opened;
 *   - the reply is opt-in three times over: the sender chooses whether to offer it,
 *     the buttons say plainly what pressing one does, and "I need more time" is
 *     first in the row rather than last.
 *
 * The tone is the other half of the brief and it lives mostly in restraint: the
 * jokes are on the sender, the animation stops entirely at the letter, and the
 * ending refuses to ask for anything.
 */

const wobble = "var(--hw-elegant), 'Bradley Hand', 'Segoe Script', cursive";

export function WinYouBackView({
  content,
  embedded = false,
}: {
  content: WinYouBackContent;
  embedded?: boolean;
}) {
  const mood = MOODS[content.mood] ?? MOODS.rose;
  const reduced = useReducedMotion();

  /* `-1` is the doorstep. `CHAPTERS.length` is the ending. */
  const [step, setStep] = useState(-1);
  const [smiled, setSmiled] = useState(false);

  const chapters = useMemo(
    () => CHAPTERS.filter((c) => hasSomethingToSay(c.id, content)),
    [content]
  );

  const atEnd = step >= chapters.length;
  const chapter = step >= 0 && !atEnd ? chapters[step] : null;

  const shell: CSSProperties = {
    position: "relative",
    minHeight: embedded ? "100%" : "100dvh",
    background: mood.bg,
    color: mood.ink,
    fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
    overflow: "hidden",
    isolation: "isolate",
  };

  return (
    <div style={shell}>
      <Motes colour={mood.accent} />

      {/* The asides drift round the edges the whole way through — the sender
          undercutting themselves, never the recipient. */}
      {step >= 0 && !atEnd && <Asides content={content} mood={mood} />}

      <AnimatePresence mode="wait">
        {step === -1 && (
          <motion.div key="door" {...fade(reduced)} style={pageStyle}>
            <Doorstep content={content} mood={mood} onBegin={() => setStep(0)} />
          </motion.div>
        )}

        {chapter && (
          <motion.div key={chapter.id} {...fade(reduced)} style={pageStyle}>
            <ChapterFrame
              index={step}
              total={chapters.length}
              title={chapter.title}
              heading={chapter.heading}
              mood={mood}
              onBack={() => setStep((s) => s - 1)}
              onNext={() => setStep((s) => s + 1)}
              onSkip={() => setStep(chapters.length)}
            >
              {chapter.id === "oops" && <Oops content={content} mood={mood} />}
              {chapter.id === "replay" && <Replay content={content} mood={mood} />}
              {chapter.id === "shouldve" && <Shouldve content={content} mood={mood} />}
              {chapter.id === "miss" && <Missed content={content} mood={mood} />}
              {chapter.id === "promise" && <Promises content={content} mood={mood} />}
              {chapter.id === "letter" && (
                <TheLetter
                  content={content}
                  mood={mood}
                  smiled={smiled}
                  onSmile={() => setSmiled(true)}
                />
              )}
            </ChapterFrame>
          </motion.div>
        )}

        {atEnd && (
          <motion.div key="end" {...fade(reduced)} style={pageStyle}>
            <Ending
              content={content}
              mood={mood}
              onAgain={() => setStep(-1)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {content.cuteEnabled && content.cute.length > 0 && step >= 0 && (
        <EmergencyCute content={content} mood={mood} />
      )}
    </div>
  );
}

const pageStyle: CSSProperties = {
  position: "relative",
  zIndex: 2,
  minHeight: "inherit",
  display: "flex",
  flexDirection: "column",
};

function fade(reduced: boolean | null) {
  return {
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: reduced ? { opacity: 0 } : { opacity: 0, y: -12 },
    transition: { duration: reduced ? 0.2 : 0.5, ease: [0.2, 0.8, 0.2, 1] as const },
  };
}

/** A chapter with nothing in it is not shown at all, rather than shown empty. */
function hasSomethingToSay(id: ChapterId, c: WinYouBackContent): boolean {
  switch (id) {
    case "oops":
      return Boolean(c.oopsLine || c.oopsAdmission);
    case "replay":
      return c.panels.length > 0 || Boolean(c.replayIntro);
    case "shouldve":
      return c.regrets.length > 0;
    case "miss":
      return c.keepsakes.length > 0;
    case "promise":
      return c.promises.length > 0;
    case "letter":
      return Boolean(c.letter);
  }
}

/* ------------------------------------------------------------------ */
/* The doorstep                                                        */
/* ------------------------------------------------------------------ */

/**
 * A heart in two halves that finds itself, and two lines with a real pause
 * between them.
 *
 * The pause is the point. "I think I broke something…" landing at the same moment
 * as "…and I want to fix it" is one sentence; two seconds apart, it is somebody
 * working up to it.
 */
function Doorstep({
  content,
  mood,
  onBegin,
}: {
  content: WinYouBackContent;
  mood: typeof MOODS.rose;
  onBegin: () => void;
}) {
  const reduced = useReducedMotion();
  const t = (d: number) => ({ duration: reduced ? 0.2 : 0.8, delay: reduced ? 0 : d, ease: [0.2, 0.8, 0.2, 1] as const });

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div style={{ position: "relative", width: 120, height: 120 }}>
        <svg viewBox="0 0 120 120" width={120} height={120} aria-hidden>
          {/* Two halves, apart, then together, then beating. */}
          <motion.path
            d="M60 100 C 24 74, 12 54, 22 40 C 31 27, 47 30, 60 46 L60 100 Z"
            fill={mood.accent}
            initial={reduced ? { x: 0, rotate: 0 } : { x: -16, rotate: -12 }}
            animate={{ x: 0, rotate: 0 }}
            transition={t(0.3)}
          />
          <motion.path
            d="M60 100 C 96 74, 108 54, 98 40 C 89 27, 73 30, 60 46 L60 100 Z"
            fill={mood.accent}
            initial={reduced ? { x: 0, rotate: 0 } : { x: 16, rotate: 12 }}
            animate={{ x: 0, rotate: 0 }}
            transition={t(0.3)}
          />
          {/* the crack, which fades once the halves meet */}
          <motion.path
            d="M60 46 L 55 60 L 64 70 L 58 82 L 60 100"
            stroke={mood.paper}
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.2 : 1, delay: reduced ? 0 : 1.3 }}
          />
        </svg>
      </div>

      <motion.p
        className="m-0"
        style={{ marginTop: 30, fontFamily: wobble, fontSize: "clamp(21px,3.2vw,28px)", color: mood.ink }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={t(1.6)}
      >
        {content.openingBroke}
      </motion.p>

      <motion.p
        className="m-0"
        style={{ marginTop: 12, fontFamily: wobble, fontSize: "clamp(21px,3.2vw,28px)", color: mood.accent }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        /* The authored pause. */
        transition={t(3.2)}
      >
        {content.openingFix}
      </motion.p>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={t(4.4)} className="mt-10">
        {content.to && (
          <p className="m-0 mb-4" style={{ fontSize: 13.5, color: mood.inkSoft }}>
            For {content.to}
            {content.from ? `, from ${content.from}` : ""}
          </p>
        )}
        <button type="button" onClick={onBegin} style={primary(mood)}>
          Begin
        </button>
        <p className="m-0 mt-4" style={{ fontSize: 12, color: mood.inkSoft, opacity: 0.85 }}>
          You can leave at any point. Nothing here is counted.
        </p>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The chapter frame                                                   */
/* ------------------------------------------------------------------ */

/**
 * The reusable chapter engine.
 *
 * Every chapter gets the same rail, the same heading, and — crucially — the same
 * three ways out: back, on, and out entirely. "Skip to the end" is on every single
 * screen on purpose. An experience that only lets you leave by finishing it is
 * pressure wearing a nice font.
 */
function ChapterFrame({
  index,
  total,
  title,
  heading,
  mood,
  children,
  onBack,
  onNext,
  onSkip,
}: {
  index: number;
  total: number;
  title: string;
  heading: string;
  mood: typeof MOODS.rose;
  children: React.ReactNode;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col px-5 py-8 sm:px-8">
      <div style={{ width: "100%", maxWidth: 880, margin: "0 auto", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* the rail */}
        <div className="flex items-center gap-2">
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              aria-hidden
              style={{
                height: 3,
                flex: 1,
                borderRadius: 2,
                background: i <= index ? mood.accent : mood.accentSoft,
                transition: "background-color .4s ease",
              }}
            />
          ))}
        </div>

        <p
          className="m-0 mt-5"
          style={{
            fontFamily: "var(--font-ibm-plex-mono), monospace",
            fontSize: 9.5,
            letterSpacing: ".2em",
            textTransform: "uppercase",
            color: mood.inkSoft,
          }}
        >
          Chapter {index + 1} — {title}
        </p>
        <h2
          className="m-0 mt-2"
          style={{
            fontFamily: "var(--font-fraunces), serif",
            fontWeight: 500,
            fontSize: "clamp(28px,4vw,42px)",
            lineHeight: 1.1,
            letterSpacing: "-0.014em",
            color: mood.ink,
          }}
        >
          {heading}
        </h2>

        <div className="mt-8 flex-1">{children}</div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={index === 0 ? onSkip : onBack}
            style={quiet(mood)}
          >
            {index === 0 ? "Skip to the end" : "← Back"}
          </button>
          <div className="flex items-center gap-3">
            {index > 0 && (
              <button type="button" onClick={onSkip} style={quiet(mood)}>
                Skip to the end
              </button>
            )}
            <button type="button" onClick={onNext} style={primary(mood)}>
              {index === total - 1 ? "Almost done" : "Keep going"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Chapter 1 — Oops                                                    */
/* ------------------------------------------------------------------ */

function Oops({ content, mood }: { content: WinYouBackContent; mood: typeof MOODS.rose }) {
  const reduced = useReducedMotion();

  return (
    <div className="flex flex-col items-center text-center">
      {/* Walks in, trips, drops the heart. One keyframe track, three beats. */}
      <div style={{ position: "relative", height: 130, width: "100%", maxWidth: 420 }}>
        <motion.div
          style={{ position: "absolute", left: 0, bottom: 0 }}
          initial={reduced ? { x: 150 } : { x: -110 }}
          animate={reduced ? { x: 150 } : { x: [-110, 150, 168, 160], rotate: [0, 0, 26, 14] }}
          transition={{ duration: reduced ? 0 : 3.1, times: [0, 0.62, 0.76, 1], ease: "easeOut" }}
        >
          <Character id={content.character} mood={mood} face="sheepish" size={104} />
        </motion.div>

        <motion.div
          style={{ position: "absolute", left: 0, bottom: 14 }}
          initial={{ opacity: 0, x: 190 }}
          animate={reduced ? { opacity: 1, x: 250 } : { opacity: [0, 1, 1], x: [190, 250, 258], y: [0, -34, 0], rotate: [0, 40, 96] }}
          transition={{ duration: reduced ? 0 : 1.6, delay: reduced ? 0 : 2.1, ease: "easeOut" }}
        >
          <Doodle id="heart" colour={mood.accent} size={26} />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduced ? 0 : 3.4, duration: 0.6 }}
        className="w-full"
      >
        <Sheet mood={mood} tilt={-0.6} style={{ maxWidth: 560, margin: "0 auto", padding: "26px 26px 28px" }}>
          <p className="m-0" style={{ fontFamily: wobble, fontSize: "clamp(20px,2.6vw,26px)", color: mood.ink }}>
            {content.oopsLine || "I know. Not my finest moment."}
          </p>
          {content.oopsAdmission && (
            <p className="m-0 mt-4" style={{ fontSize: 15.5, lineHeight: 1.7, color: mood.inkSoft }}>
              {content.oopsAdmission}
            </p>
          )}
        </Sheet>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Chapter 2 — the replay                                              */
/* ------------------------------------------------------------------ */

function Replay({ content, mood }: { content: WinYouBackContent; mood: typeof MOODS.rose }) {
  const reduced = useReducedMotion();

  return (
    <div>
      {content.replayIntro && (
        <p className="m-0 mb-7" style={{ maxWidth: 560, fontSize: 16, lineHeight: 1.7, color: mood.inkSoft }}>
          {content.replayIntro}
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {content.panels.map((p, i) => (
          <motion.div
            key={p.id}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20, rotate: i % 2 ? 1.4 : -1.4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : i * 0.14, duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <Sheet mood={mood} tilt={i % 2 ? 0.7 : -0.9} style={{ padding: 16, height: "100%" }}>
              {/* the frame the doodle lives in */}
              <div
                style={{
                  position: "relative",
                  borderRadius: 8,
                  background: mood.accentSoft,
                  aspectRatio: "4 / 3",
                  display: "grid",
                  placeItems: "center",
                  overflow: "hidden",
                }}
              >
                <span style={{ opacity: 0.9 }}>
                  <Doodle id={p.doodle} colour={mood.accent} size={54} />
                </span>
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: 8,
                    top: 8,
                    fontFamily: "var(--font-ibm-plex-mono), monospace",
                    fontSize: 9,
                    letterSpacing: ".14em",
                    color: mood.inkSoft,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                {p.bubble && (
                  <span
                    style={{
                      position: "absolute",
                      right: 10,
                      bottom: 10,
                      maxWidth: "78%",
                      padding: "8px 12px",
                      borderRadius: "12px 12px 12px 3px",
                      background: mood.paper,
                      border: `1px solid ${mood.paperEdge}`,
                      fontFamily: wobble,
                      fontSize: 14,
                      lineHeight: 1.35,
                      color: mood.ink,
                    }}
                  >
                    {p.bubble}
                  </span>
                )}
              </div>

              {p.caption && (
                <p className="m-0 mt-3" style={{ fontSize: 13.5, lineHeight: 1.55, color: mood.inkSoft }}>
                  {p.caption}
                </p>
              )}
            </Sheet>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Chapter 3 — I should've                                             */
/* ------------------------------------------------------------------ */

/**
 * Five admissions, opened one at a time.
 *
 * Several open at once is a defence: a wall of explanation delivered whether or
 * not anybody asked for it. One at a time makes each one something the recipient
 * chose to hear.
 */
function Shouldve({ content, mood }: { content: WinYouBackContent; mood: typeof MOODS.rose }) {
  const [open, setOpen] = useState<string | null>(null);
  const reduced = useReducedMotion();

  return (
    <div>
      {content.regretIntro && (
        <p className="m-0 mb-7" style={{ maxWidth: 560, fontSize: 16, lineHeight: 1.7, color: mood.inkSoft }}>
          {content.regretIntro}
        </p>
      )}

      <div className="flex flex-wrap gap-2.5">
        {content.regrets.map((r) => {
          const on = open === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setOpen(on ? null : r.id)}
              aria-expanded={on}
              style={{
                padding: "11px 18px",
                borderRadius: 999,
                border: `1px solid ${on ? mood.accent : mood.paperEdge}`,
                background: on ? mood.accent : mood.paper,
                color: on ? "#fff" : mood.ink,
                fontFamily: wobble,
                fontSize: 17,
                cursor: "pointer",
                transition: "background-color .2s ease, color .2s ease, border-color .2s ease",
              }}
            >
              {r.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {open && (
          <motion.div
            key={open}
            initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, height: "auto" }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: reduced ? 0.15 : 0.4, ease: [0.2, 0.8, 0.2, 1] }}
            style={{ overflow: "hidden" }}
          >
            <Sheet mood={mood} tilt={-0.5} style={{ marginTop: 22, padding: "24px 26px", maxWidth: 620 }}>
              <p className="m-0" style={{ fontFamily: wobble, fontSize: 19, lineHeight: 1.6, color: mood.ink }}>
                {content.regrets.find((r) => r.id === open)?.body}
              </p>
            </Sheet>
          </motion.div>
        )}
      </AnimatePresence>

      {!open && (
        <p className="m-0 mt-6" style={{ fontSize: 13, color: mood.inkSoft, opacity: 0.8 }}>
          Open the ones you want to. Ignore the rest — that&apos;s allowed.
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Chapter 4 — the corkboard                                           */
/* ------------------------------------------------------------------ */

function Missed({ content, mood }: { content: WinYouBackContent; mood: typeof MOODS.rose }) {
  const reduced = useReducedMotion();
  const pins = [mood.accent, "#e0a04a", "#6aa9d8", "#7cb98d"];

  return (
    <div>
      {content.missIntro && (
        <p className="m-0 mb-7" style={{ maxWidth: 560, fontSize: 16, lineHeight: 1.7, color: mood.inkSoft }}>
          {content.missIntro}
        </p>
      )}

      <div
        style={{
          borderRadius: 14,
          padding: "26px 20px 30px",
          background:
            "repeating-linear-gradient(96deg, rgba(150,110,70,.09) 0 2px, transparent 2px 9px), " +
            "repeating-linear-gradient(6deg, rgba(150,110,70,.07) 0 2px, transparent 2px 11px), #d9b98e",
          boxShadow: "inset 0 2px 10px rgba(90,60,30,.24)",
        }}
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {content.keepsakes.map((k, i) => (
            <motion.div
              key={k.id}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: -14, rotate: k.tilt }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduced ? 0 : i * 0.09, type: "spring", stiffness: 170, damping: 16 }}
              style={{ position: "relative", paddingTop: 10 }}
            >
              <span style={{ position: "absolute", left: "50%", top: 0, transform: "translateX(-50%)", zIndex: 2 }}>
                <Pin colour={pins[i % pins.length]} />
              </span>

              <Sheet mood={mood} tilt={k.tilt} style={{ padding: 9, height: "100%" }}>
                {k.kind === "photo" && (
                  <div
                    style={{
                      aspectRatio: "1",
                      borderRadius: 3,
                      background: k.url ? `center/cover url(${k.url})` : mood.accentSoft,
                    }}
                  />
                )}

                {k.kind === "voice" && (
                  <div style={{ padding: "10px 4px 6px" }}>
                    {k.url ? (
                      <audio src={k.url} controls preload="none" style={{ width: "100%", height: 34 }} />
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 3, justifyContent: "center", height: 34 }}>
                        {[6, 12, 8, 16, 10, 14, 7].map((h, n) => (
                          <span key={n} style={{ width: 3, height: h, borderRadius: 2, background: mood.accent, opacity: 0.6 }} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {(k.kind === "ticket" || k.kind === "song" || k.kind === "note") && (
                  <div
                    style={{
                      aspectRatio: k.kind === "note" ? "1" : "5 / 3",
                      borderRadius: 3,
                      background: k.kind === "note" ? mood.stickies[i % 3] : mood.accentSoft,
                      display: "grid",
                      placeItems: "center",
                      padding: 10,
                      textAlign: "center",
                    }}
                  >
                    {k.kind === "note" ? (
                      <span style={{ fontFamily: wobble, fontSize: 15, lineHeight: 1.35, color: mood.ink }}>
                        {k.caption}
                      </span>
                    ) : (
                      <Doodle id={k.kind === "song" ? "sparkle" : "plane"} colour={mood.accent} size={30} />
                    )}
                  </div>
                )}

                {k.kind !== "note" && k.caption && (
                  <p className="m-0 mt-2 px-1" style={{ fontFamily: wobble, fontSize: 14, lineHeight: 1.3, color: mood.ink }}>
                    {k.caption}
                  </p>
                )}
                {k.detail && (
                  <p className="m-0 px-1 pb-1" style={{ fontSize: 11, color: mood.inkSoft }}>
                    {k.detail}
                  </p>
                )}
              </Sheet>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Chapter 5 — promises                                                */
/* ------------------------------------------------------------------ */

/**
 * Cards that turn over.
 *
 * The front is the promise, which is easy to say. The back is what it means on an
 * ordinary Tuesday, which is the part that costs something — so it takes an
 * action to see it, and the card stays turned once it is.
 */
function Promises({ content, mood }: { content: WinYouBackContent; mood: typeof MOODS.rose }) {
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const reduced = useReducedMotion();

  return (
    <div>
      {content.promiseIntro && (
        <p className="m-0 mb-7" style={{ maxWidth: 560, fontSize: 16, lineHeight: 1.7, color: mood.inkSoft }}>
          {content.promiseIntro}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {content.promises.map((p, i) => {
          const on = flipped.has(p.id);
          return (
            <motion.button
              key={p.id}
              type="button"
              onClick={() =>
                setFlipped((s) => {
                  const next = new Set(s);
                  if (next.has(p.id)) next.delete(p.id);
                  else next.add(p.id);
                  return next;
                })
              }
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduced ? 0 : i * 0.08, duration: 0.5 }}
              aria-pressed={on}
              style={{
                position: "relative",
                minHeight: 148,
                border: "none",
                background: "transparent",
                padding: 0,
                cursor: "pointer",
                perspective: 900,
                textAlign: "left",
              }}
            >
              <motion.span
                animate={{ rotateY: on ? 180 : 0 }}
                transition={{ duration: reduced ? 0 : 0.55, ease: [0.2, 0.8, 0.2, 1] }}
                style={{
                  display: "block",
                  position: "relative",
                  height: "100%",
                  minHeight: 148,
                  transformStyle: "preserve-3d",
                }}
              >
                <span style={{ ...cardFace(mood), background: mood.paper }}>
                  <Doodle id={p.doodle} colour={mood.accent} size={22} />
                  <span style={{ marginTop: 10, fontFamily: wobble, fontSize: 19, lineHeight: 1.4, color: mood.ink }}>
                    {p.text}
                  </span>
                  {p.detail && (
                    <span
                      style={{
                        marginTop: "auto",
                        fontFamily: "var(--font-ibm-plex-mono), monospace",
                        fontSize: 8.5,
                        letterSpacing: ".14em",
                        textTransform: "uppercase",
                        color: mood.inkSoft,
                      }}
                    >
                      Turn it over
                    </span>
                  )}
                </span>

                <span
                  style={{
                    ...cardFace(mood),
                    background: mood.accentSoft,
                    transform: "rotateY(180deg)",
                  }}
                >
                  <span style={{ fontSize: 14.5, lineHeight: 1.65, color: mood.ink }}>{p.detail}</span>
                </span>
              </motion.span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function cardFace(mood: typeof MOODS.rose): CSSProperties {
  return {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    padding: "18px 18px 16px",
    borderRadius: 12,
    border: `1px solid ${mood.paperEdge}`,
    boxShadow: "0 16px 34px -24px rgba(60,40,40,.5)",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
  };
}

/* ------------------------------------------------------------------ */
/* Chapter 6 — the letter                                              */
/* ------------------------------------------------------------------ */

/**
 * The plain part.
 *
 * Sealed until it is opened, and then completely still: no typing effect, no
 * fade-in per line, no ambience. Everything before this earned attention with
 * charm; this asks for it with nothing but the words, which is the only way the
 * words get to be the point.
 */
function TheLetter({
  content,
  mood,
  smiled,
  onSmile,
}: {
  content: WinYouBackContent;
  mood: typeof MOODS.rose;
  smiled: boolean;
  onSmile: () => void;
}) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  return (
    <div className="flex flex-col items-center">
      {!open ? (
        <motion.button
          type="button"
          onClick={() => setOpen(true)}
          whileHover={reduced ? undefined : { y: -5 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          style={{ border: "none", background: "transparent", cursor: "pointer", padding: 0 }}
          aria-label="Open the letter"
        >
          <div style={{ position: "relative", width: 260, height: 172 }}>
            <span style={{ position: "absolute", inset: 0, borderRadius: 8, background: mood.paper, border: `1px solid ${mood.paperEdge}`, boxShadow: "0 22px 44px -26px rgba(60,40,40,.6)" }} />
            <span
              style={{
                position: "absolute",
                inset: 0,
                borderTop: `88px solid ${mood.stickies[0]}`,
                borderLeft: "130px solid transparent",
                borderRight: "130px solid transparent",
                borderRadius: "8px 8px 0 0",
              }}
            />
            <motion.span
              style={{
                position: "absolute",
                left: "50%",
                top: 78,
                transform: "translate(-50%,-50%)",
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: mood.accent,
                display: "grid",
                placeItems: "center",
                boxShadow: "0 8px 18px -8px rgba(90,40,50,.7)",
              }}
              animate={reduced ? undefined : { rotate: [-3, 3, -3] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Doodle id="heart" colour="#fff" size={22} />
            </motion.span>
          </div>
          <p
            className="m-0 mt-4"
            style={{
              fontFamily: "var(--font-ibm-plex-mono), monospace",
              fontSize: 9.5,
              letterSpacing: ".18em",
              textTransform: "uppercase",
              color: mood.inkSoft,
            }}
          >
            Open when you&apos;re ready
          </p>
        </motion.button>
      ) : (
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <Sheet mood={mood} tilt={0} style={{ maxWidth: 620, margin: "0 auto", padding: "34px 30px 32px" }}>
            {content.to && (
              <p className="m-0 mb-4" style={{ fontFamily: wobble, fontSize: 20, color: mood.ink }}>
                {content.to},
              </p>
            )}
            {content.letter.split(/\n{2,}/).map((para, i) => (
              <p
                key={i}
                className="m-0"
                style={{ marginTop: i === 0 ? 0 : 16, fontSize: 16, lineHeight: 1.8, color: mood.ink }}
              >
                {para}
              </p>
            ))}
            {content.letterSignoff && (
              <p className="m-0 mt-7" style={{ fontFamily: wobble, fontSize: 21, color: mood.accent }}>
                {content.letterSignoff}
              </p>
            )}
          </Sheet>

          {content.rating && <RateIt mood={mood} character={content.character} />}

          <div className="mt-8 text-center">
            {smiled ? (
              <p className="m-0" style={{ fontFamily: wobble, fontSize: 20, color: mood.accent }}>
                Counted. Thank you.
              </p>
            ) : (
              <button type="button" onClick={onSmile} style={quiet(mood)}>
                If you&apos;re smiling even a little — I&apos;ll count that as progress
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

/**
 * "Rate my apology."
 *
 * A joke that only works because it is powerless: the number goes nowhere, and the
 * only thing that changes is the little creature's face. If it reported a score
 * back it would stop being funny and start being a demand.
 */
function RateIt({ mood, character }: { mood: typeof MOODS.rose; character: WinYouBackContent["character"] }) {
  const [stars, setStars] = useState(3);
  const face = stars >= 5 ? "happy" : stars >= 4 ? "hopeful" : stars >= 2 ? "sheepish" : "sorry";

  return (
    <div
      className="mx-auto mt-8 flex flex-col items-center rounded-2xl px-6 py-6"
      style={{ maxWidth: 420, background: mood.paper, border: `1px solid ${mood.paperEdge}` }}
    >
      <p
        className="m-0"
        style={{
          fontFamily: "var(--font-ibm-plex-mono), monospace",
          fontSize: 9.5,
          letterSpacing: ".18em",
          textTransform: "uppercase",
          color: mood.inkSoft,
        }}
      >
        Rate my apology
      </p>

      <motion.div key={face} animate={{ y: [6, 0] }} transition={{ type: "spring", stiffness: 300, damping: 14 }} className="mt-2">
        <Character id={character} mood={mood} face={face} size={78} />
      </motion.div>

      <div className="mt-1" style={{ fontSize: 20, letterSpacing: 3 }} aria-hidden>
        {"★".repeat(stars)}
        <span style={{ opacity: 0.25 }}>{"★".repeat(5 - stars)}</span>
      </div>

      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={stars}
        onChange={(e) => setStars(Number(e.target.value))}
        aria-label="Rate my apology, one to five"
        className="mt-3 w-full cursor-pointer"
        style={{ accentColor: mood.accent }}
      />
      <p className="m-0 mt-2" style={{ fontSize: 11.5, color: mood.inkSoft, textAlign: "center" }}>
        This goes nowhere. Nobody is told. It just changes their face.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The ending                                                          */
/* ------------------------------------------------------------------ */

function Ending({
  content,
  mood,
  onAgain,
}: {
  content: WinYouBackContent;
  mood: typeof MOODS.rose;
  onAgain: () => void;
}) {
  const reduced = useReducedMotion();
  const [replied, setReplied] = useState<string | null>(null);

  const replies = [
    { key: "time", emoji: "💛", label: "I need more time", subject: "I need a bit more time" },
    { key: "forgive", emoji: "😊", label: "I forgive you", subject: "Okay. I forgive you" },
    { key: "talk", emoji: "☕️", label: "Let's talk", subject: "Let's talk" },
  ];

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, x: -30, y: 20 }}
        animate={reduced ? { opacity: 1 } : { opacity: [0, 1, 1, 0], x: [-30, 60, 260, 460], y: [20, -30, -60, -140], rotate: [0, -8, -14, -22] }}
        transition={{ duration: reduced ? 0.4 : 5.2, times: [0, 0.2, 0.7, 1], ease: "easeInOut" }}
        style={{ position: "absolute", left: "12%", top: "22%", pointerEvents: "none" }}
      >
        <PaperPlane colour={mood.accent} size={44} />
      </motion.div>

      <motion.p
        className="m-0"
        style={{
          maxWidth: 520,
          fontFamily: wobble,
          fontSize: "clamp(22px,3.4vw,30px)",
          lineHeight: 1.5,
          color: mood.ink,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: reduced ? 0 : 0.4 }}
      >
        {content.closingLine}
      </motion.p>

      {content.from && (
        <p className="m-0 mt-5" style={{ fontFamily: wobble, fontSize: 20, color: mood.accent }}>
          — {content.from}
        </p>
      )}

      {content.replyEnabled && (
        <motion.div
          className="mt-12 w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: reduced ? 0 : 1.4 }}
        >
          <p
            className="m-0"
            style={{
              fontFamily: "var(--font-ibm-plex-mono), monospace",
              fontSize: 9.5,
              letterSpacing: ".18em",
              textTransform: "uppercase",
              color: mood.inkSoft,
            }}
          >
            Only if you want to
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
            {replies.map((r) =>
              content.replyTo ? (
                <a
                  key={r.key}
                  href={`mailto:${encodeURIComponent(content.replyTo)}?subject=${encodeURIComponent(r.subject)}`}
                  style={replyStyle(mood)}
                >
                  <span aria-hidden>{r.emoji}</span> {r.label}
                </a>
              ) : (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setReplied(r.key)}
                  style={replyStyle(mood)}
                >
                  <span aria-hidden>{r.emoji}</span> {r.label}
                </button>
              )
            )}
          </div>

          {/*
           * Said plainly rather than faked.
           *
           * With no address to reply to, pressing one of these cannot send
           * anything — and a button that pretends to have delivered a feeling
           * somebody has not actually expressed is the exact manipulation this
           * experience is supposed to be the opposite of.
           */}
          <p className="m-0 mt-4" style={{ fontSize: 12.5, lineHeight: 1.6, color: mood.inkSoft, opacity: 0.9 }}>
            {content.replyTo
              ? "These open your own mail app. Nothing is sent until you send it."
              : replied
                ? "Nothing was sent — this page has no way to reach them. But you know what you pressed, and they're one message away."
                : "These don't send anything from here."}
          </p>
        </motion.div>
      )}

      <button type="button" onClick={onAgain} style={{ ...quiet(mood), marginTop: 40 }}>
        Read it again
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Trimmings                                                           */
/* ------------------------------------------------------------------ */

/** The sender's own footnotes, drifting where they cannot cover the words. */
function Asides({ content, mood }: { content: WinYouBackContent; mood: typeof MOODS.rose }) {
  const reduced = useReducedMotion();
  if (content.asides.length === 0) return null;

  /* Fixed spots down the two margins, so they never land on a paragraph. */
  const spots = [
    { left: "2%", top: "24%" },
    { right: "2%", top: "38%" },
    { left: "3%", top: "62%" },
    { right: "3%", top: "72%" },
  ];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[1] hidden lg:block">
      {content.asides.slice(0, 4).map((a, i) => (
        <motion.div
          key={a.id}
          style={{ position: "absolute", maxWidth: 168, ...spots[i % spots.length] }}
          initial={{ opacity: 0, y: 10 }}
          animate={reduced ? { opacity: 0.85, y: 0 } : { opacity: 0.9, y: [0, -7, 0] }}
          transition={
            reduced
              ? { duration: 0.4, delay: 0.6 + i * 0.3 }
              : { y: { duration: 5 + i, repeat: Infinity, ease: "easeInOut" }, opacity: { duration: 0.8, delay: 0.6 + i * 0.3 } }
          }
        >
          <Sticky colour={mood.stickies[i % 3]} tilt={i % 2 ? 2.4 : -2.8} style={{ padding: "12px 13px" }}>
            <span style={{ fontFamily: wobble, fontSize: 14, lineHeight: 1.35, color: "#5a4436" }}>{a.text}</span>
          </Sticky>
        </motion.div>
      ))}
    </div>
  );
}

/** The teddy in the corner, and what is behind it. */
function EmergencyCute({ content, mood }: { content: WinYouBackContent; mood: typeof MOODS.rose }) {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const reduced = useReducedMotion();
  const items = content.cute;
  const item = items[i % items.length];
  const wrap = useRef<HTMLDivElement>(null);

  return (
    <div ref={wrap} style={{ position: "absolute", right: 16, bottom: 16, zIndex: 6 }}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 240, damping: 22 }}
            style={{ position: "absolute", right: 0, bottom: 58, width: "min(290px, 78vw)" }}
          >
            <Sheet mood={mood} tilt={-0.8} style={{ padding: 16 }}>
              {item.kind === "image" && item.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.url} alt="" style={{ width: "100%", borderRadius: 8, display: "block" }} />
              )}
              {item.kind === "voice" && item.url && (
                <audio src={item.url} controls preload="none" style={{ width: "100%" }} />
              )}
              {item.text && (
                <p className="m-0" style={{ marginTop: item.url ? 10 : 0, fontFamily: wobble, fontSize: 17, lineHeight: 1.45, color: mood.ink }}>
                  {item.text}
                </p>
              )}

              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => setI((n) => n + 1)}
                  style={{ ...quiet(mood), marginTop: 12, width: "100%", fontSize: 12.5 }}
                >
                  Another one
                </button>
              )}
            </Sheet>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        whileHover={reduced ? undefined : { y: -3, rotate: -6 }}
        aria-expanded={open}
        aria-label={content.cuteLabel}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 14px 8px 8px",
          borderRadius: 999,
          border: `1px solid ${mood.paperEdge}`,
          background: mood.paper,
          color: mood.ink,
          fontSize: 12.5,
          cursor: "pointer",
          boxShadow: "0 12px 26px -18px rgba(60,40,40,.6)",
        }}
      >
        <Teddy mood={mood} size={30} />
        {content.cuteLabel}
      </motion.button>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function primary(mood: typeof MOODS.rose): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 46,
    padding: "0 26px",
    borderRadius: 999,
    border: "none",
    background: mood.accent,
    color: "#fff",
    fontFamily: "inherit",
    fontSize: 14.5,
    fontWeight: 500,
    cursor: "pointer",
    boxShadow: "0 14px 28px -16px rgba(80,40,50,.8)",
  };
}

function quiet(mood: typeof MOODS.rose): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 42,
    padding: "0 18px",
    borderRadius: 999,
    border: `1px solid ${mood.paperEdge}`,
    background: "transparent",
    color: mood.inkSoft,
    fontFamily: "inherit",
    fontSize: 13,
    cursor: "pointer",
  };
}

function replyStyle(mood: typeof MOODS.rose): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    height: 46,
    padding: "0 20px",
    borderRadius: 999,
    border: `1px solid ${mood.paperEdge}`,
    background: mood.paper,
    color: mood.ink,
    fontSize: 14,
    textDecoration: "none",
    cursor: "pointer",
  };
}
