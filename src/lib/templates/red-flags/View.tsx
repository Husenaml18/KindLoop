"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";
import { GROWTH_STAGES, NOTEBOOKS, growthFor, type Notebook } from "./theme";
import type { Flag, RedFlagsContent } from "./schema";

/**
 * My Red Flags (That I'm Working On).
 *
 * The brief's distinction is the whole design: *this person isn't asking me to
 * forgive them, they're showing me they're trying.* Three things enforce it, and
 * they are properties rather than intentions —
 *
 *   - **No flag is ever shown alone.** The habit, the work on it and the win are
 *     one card. There is no screen in this experience where a failing appears
 *     without the effort attached, so it cannot be read as a plea.
 *   - **Nothing asks for a reply.** No buttons that forgive, no reaction, no
 *     read state sent anywhere. The reader's only verbs are "next" and "close".
 *   - **Progress is a plant, not a number.** A fraction invites you to measure
 *     someone. A plant just gets bigger.
 *
 * The ending is deliberately the lightest moment: the flags fold into paper
 * airplanes in a jar, and letting go of them turns them into stars. Growth, not
 * danger — which is also why there is no bright red in the palette.
 */

const HAND = "var(--font-gochi), var(--hw-elegant), cursive";
const MONO = "var(--font-ibm-plex-mono), monospace";
const SERIF = "var(--font-fraunces), serif";

type Stage = "cover" | "chapter" | "promise" | "jar";

export function RedFlagsView({
  content,
  embedded = false,
}: {
  content: RedFlagsContent;
  embedded?: boolean;
}) {
  const book = NOTEBOOKS[content.notebook] ?? NOTEBOOKS.vintage;
  const reduced = useReducedMotion();

  const [stage, setStage] = useState<Stage>("cover");
  const [index, setIndex] = useState(0);
  const [released, setReleased] = useState(false);

  /* A flag with nothing written in it is not shown. Somebody who added three
     cards and filled in two should not be presented as having an empty third. */
  const flags = useMemo(
    () => content.flags.filter((f) => f.title.trim() || f.explain.trim()),
    [content.flags]
  );

  const total = flags.length;
  const flag = stage === "chapter" ? flags[Math.min(index, total - 1)] : null;

  /* Counts the promise page, so the plant only flowers once it is genuinely over. */
  const fraction =
    stage === "cover" ? 0 : stage === "chapter" ? (total ? (index + 1) / (total + 1) : 0.5) : 1;

  const goNext = () => {
    if (stage !== "chapter") return;
    if (index + 1 < total) setIndex(index + 1);
    else setStage("promise");
  };
  const goBack = () => {
    if (stage !== "chapter") return;
    if (index > 0) setIndex(index - 1);
    else setStage("cover");
  };

  const shell: CSSProperties = {
    position: "relative",
    minHeight: embedded ? "100%" : "100dvh",
    background: book.desk,
    color: book.ink,
    fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
    overflow: "hidden",
    isolation: "isolate",
    display: "grid",
    placeItems: "center",
    padding: "clamp(16px, 4vw, 48px)",
  };

  return (
    <div style={shell}>
      <Grain />

      {/* The plant, always in the same corner, never in the way. */}
      {stage !== "cover" && <Plant book={book} fraction={fraction} />}

      <AnimatePresence mode="wait">
        {stage === "cover" && (
          <Cover
            key="cover"
            content={content}
            book={book}
            reduced={Boolean(reduced)}
            empty={total === 0}
            onOpen={() => setStage(total ? "chapter" : "promise")}
          />
        )}

        {stage === "chapter" && flag && (
          <FlagCard
            key={flag.id}
            flag={flag}
            book={book}
            reduced={Boolean(reduced)}
            n={index + 1}
            total={total}
            onNext={goNext}
            onBack={goBack}
          />
        )}

        {stage === "promise" && (
          <PromisePage
            key="promise"
            content={content}
            book={book}
            reduced={Boolean(reduced)}
            onNext={() => setStage("jar")}
            onBack={() => (total ? (setIndex(total - 1), setStage("chapter")) : setStage("cover"))}
          />
        )}

        {stage === "jar" && (
          <Jar
            key="jar"
            content={content}
            book={book}
            reduced={Boolean(reduced)}
            count={Math.max(total, 3)}
            released={released}
            onRelease={() => setReleased(true)}
            onRestart={() => {
              setReleased(false);
              setIndex(0);
              setStage("cover");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The cover                                                           */
/* ------------------------------------------------------------------ */

function Cover({
  content,
  book,
  reduced,
  empty,
  onOpen,
}: {
  content: RedFlagsContent;
  book: Notebook;
  reduced: boolean;
  empty: boolean;
  onOpen: () => void;
}) {
  return (
    <motion.div
      style={{ width: "min(560px, 100%)" }}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 26, rotate: -1.2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: -18, rotate: 1 }}
      transition={{ duration: reduced ? 0.25 : 0.85, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <div
        style={{
          position: "relative",
          borderRadius: "4px 14px 14px 4px",
          background: book.cover,
          border: `1px solid ${book.coverEdge}`,
          boxShadow: "0 40px 70px -34px rgba(0,0,0,.55)",
          padding: "clamp(34px, 6vw, 60px) clamp(26px, 5vw, 48px)",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        {/* the stitched spine */}
        <span
          aria-hidden
          style={{
            position: "absolute",
            insetBlock: 0,
            left: 13,
            width: 2,
            background: "rgba(255,255,255,.16)",
            borderLeft: "1px dashed rgba(255,255,255,.28)",
          }}
        />

        {content.recipient && (
          <p
            className="m-0 mb-4"
            style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".24em", textTransform: "uppercase", color: "rgba(255,255,255,.6)" }}
          >
            For {content.recipient}
          </p>
        )}

        <h1
          className="m-0"
          style={{
            fontFamily: SERIF,
            fontWeight: 500,
            fontSize: "clamp(30px, 5.4vw, 46px)",
            lineHeight: 1.08,
            letterSpacing: "-0.015em",
            color: book.coverInk,
            textWrap: "balance",
          }}
        >
          {content.coverTitle || "My Red Flags 🚩"}
        </h1>

        {content.coverSubtitle && (
          <p className="m-0 mt-3" style={{ fontSize: 15, lineHeight: 1.6, color: "rgba(255,255,255,.72)" }}>
            {content.coverSubtitle}
          </p>
        )}

        {content.coverNote && (
          <motion.p
            className="m-0"
            style={{
              marginTop: 30,
              whiteSpace: "pre-line",
              fontFamily: HAND,
              fontSize: "clamp(18px, 2.8vw, 23px)",
              lineHeight: 1.6,
              color: "rgba(255,255,255,.9)",
            }}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0.1 : 0.7, duration: 0.7 }}
          >
            {content.coverNote}
          </motion.p>
        )}

        <motion.button
          type="button"
          onClick={onOpen}
          style={{
            marginTop: 34,
            height: 48,
            padding: "0 26px",
            borderRadius: 999,
            border: "none",
            background: book.page,
            color: book.ink,
            fontFamily: "inherit",
            fontSize: 14.5,
            cursor: "pointer",
          }}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0.15 : 1.15, duration: 0.6 }}
        >
          {empty ? "Read the promise →" : "Open journal →"}
        </motion.button>
      </div>

      {content.from && (
        <p
          className="m-0 mt-5 text-center"
          style={{ fontFamily: HAND, fontSize: 19, color: book.inkSoft }}
        >
          — {content.from}
        </p>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* One flag                                                            */
/* ------------------------------------------------------------------ */

function FlagCard({
  flag,
  book,
  reduced,
  n,
  total,
  onNext,
  onBack,
}: {
  flag: Flag;
  book: Notebook;
  reduced: boolean;
  n: number;
  total: number;
  onNext: () => void;
  onBack: () => void;
}) {
  const steps = flag.steps.filter((s) => s.text.trim());

  return (
    <motion.article
      style={{ width: "min(680px, 100%)", maxHeight: "100%" }}
      initial={reduced ? { opacity: 0 } : { opacity: 0, x: 34 }}
      animate={{ opacity: 1, x: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, x: -28 }}
      transition={{ duration: reduced ? 0.2 : 0.5, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <Page book={book}>
        <p className="m-0" style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".22em", textTransform: "uppercase", color: book.inkSoft }}>
          Chapter {n} of {total}
        </p>

        {/* ---- 1 · the flag ---- */}
        <h2
          className="m-0 mt-3"
          style={{ fontFamily: SERIF, fontWeight: 500, fontSize: "clamp(23px,3.4vw,32px)", lineHeight: 1.15, color: book.ink }}
        >
          <span aria-hidden style={{ marginRight: 10 }}>🚩</span>
          {flag.title}
        </h2>

        {flag.explain && (
          <p className="m-0 mt-3.5" style={{ fontSize: 15.5, lineHeight: 1.7, color: book.inkSoft, whiteSpace: "pre-line" }}>
            {flag.explain}
          </p>
        )}

        {/* ---- 2 · where it comes from ---- */}
        {flag.origin && (
          <div
            className="mt-6"
            style={{ borderLeft: `2px solid ${book.accent}`, paddingLeft: 15 }}
          >
            <Label book={book}>Where it comes from</Label>
            <p className="m-0 mt-2" style={{ fontFamily: HAND, fontSize: "clamp(17px,2.4vw,21px)", lineHeight: 1.6, color: book.ink, whiteSpace: "pre-line" }}>
              {flag.origin}
            </p>
          </div>
        )}

        {/* ---- 3 · what I'm doing about it ---- */}
        {steps.length > 0 && (
          <div className="mt-7">
            <Label book={book}>What I&rsquo;m doing about it</Label>
            <ul className="m-0 mt-3 flex list-none flex-col gap-2.5 p-0">
              {steps.map((s, i) => (
                <motion.li
                  key={s.id}
                  className="flex items-start gap-2.5"
                  initial={reduced ? { opacity: 0 } : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: reduced ? 0 : 0.18 + i * 0.08, duration: 0.4 }}
                >
                  <Tick on={s.done} book={book} />
                  <span
                    style={{
                      fontSize: 14.5,
                      lineHeight: 1.55,
                      color: s.done ? book.ink : book.inkSoft,
                      /* Unticked is not struck through — it is the part still
                         being worked on, not a failure. */
                      opacity: s.done ? 1 : 0.9,
                    }}
                  >
                    {s.text}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {/* ---- 4 · a small win, on a polaroid ---- */}
        {flag.win && (
          <div className="mt-7 flex justify-center">
            <div
              style={{
                transform: "rotate(-1.6deg)",
                background: "#fffdf7",
                border: `1px solid ${book.pageEdge}`,
                boxShadow: "0 18px 30px -20px rgba(0,0,0,.4)",
                padding: "14px 14px 20px",
                maxWidth: 380,
              }}
            >
              <div
                style={{
                  background: book.growSoft,
                  border: `1px solid ${book.grow}22`,
                  padding: "18px 16px",
                  textAlign: "center",
                }}
              >
                <span aria-hidden style={{ fontSize: 19 }}>🌿</span>
                <p className="m-0 mt-2" style={{ fontSize: 14, lineHeight: 1.6, color: book.ink }}>
                  {flag.win}
                </p>
              </div>
              <p
                className="m-0 mt-3 text-center"
                style={{ fontFamily: HAND, fontSize: 17, color: book.inkSoft }}
              >
                {flag.winWhen || "a small win"}
              </p>
            </div>
          </div>
        )}

        {/* ---- the optional attachment ---- */}
        {flag.attachment.kind !== "none" && flag.attachment.url && (
          <Attached flag={flag} book={book} />
        )}

        {/* ---- 5 · what I need from you ---- */}
        {flag.need && (
          <div
            className="mt-7"
            style={{
              background: book.stickies[1],
              padding: "18px 18px 20px",
              transform: "rotate(.7deg)",
              boxShadow: "0 14px 24px -18px rgba(0,0,0,.5)",
            }}
          >
            <Label book={book}>What I need from you</Label>
            <p className="m-0 mt-2" style={{ fontFamily: HAND, fontSize: "clamp(17px,2.4vw,21px)", lineHeight: 1.6, color: book.ink, whiteSpace: "pre-line" }}>
              {flag.need}
            </p>
          </div>
        )}

        <Nav book={book} onBack={onBack} onNext={onNext} nextLabel={n === total ? "The promise →" : "Next →"} />
      </Page>
    </motion.article>
  );
}

function Attached({ flag, book }: { flag: Flag; book: Notebook }) {
  const { kind, url, caption } = flag.attachment;

  return (
    <div className="mt-7">
      <Label book={book}>{kind === "voice" ? "In my own voice" : kind === "screenshot" ? "Exhibit A" : "A photo"}</Label>
      <div className="mt-3">
        {kind === "voice" ? (
          <audio src={url} controls preload="none" style={{ width: "100%" }} />
        ) : (
          <div
            style={{
              background: "#fffdf7",
              border: `1px solid ${book.pageEdge}`,
              padding: kind === "screenshot" ? 8 : 12,
              boxShadow: "0 16px 28px -22px rgba(0,0,0,.4)",
            }}
          >
            {/* Not next/image: these are runtime uploads with no known dimensions. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={caption || "Attached to this chapter"} style={{ display: "block", width: "100%", borderRadius: 2 }} />
          </div>
        )}
      </div>
      {caption && (
        <p className="m-0 mt-2.5" style={{ fontFamily: HAND, fontSize: 17, color: book.inkSoft }}>
          {caption}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The promise page                                                    */
/* ------------------------------------------------------------------ */

function PromisePage({
  content,
  book,
  reduced,
  onNext,
  onBack,
}: {
  content: RedFlagsContent;
  book: Notebook;
  reduced: boolean;
  onNext: () => void;
  onBack: () => void;
}) {
  const goals = content.goals.filter((g) => g.text.trim());

  return (
    <motion.article
      /* Hinges open from the top edge, like a page being unfolded. */
      style={{ width: "min(640px, 100%)", transformOrigin: "50% 0%" }}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 22, scaleY: 0.94 }}
      animate={{ opacity: 1, y: 0, scaleY: 1 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: -16 }}
      transition={{ duration: reduced ? 0.25 : 0.8, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <Page book={book}>
        <Label book={book}>The promise</Label>

        <h2
          className="m-0 mt-4"
          style={{ fontFamily: HAND, fontSize: "clamp(24px,4vw,34px)", lineHeight: 1.4, color: book.ink, whiteSpace: "pre-line" }}
        >
          {content.promiseTitle}
        </h2>

        {content.promiseNote && (
          <p
            className="m-0 mt-4"
            style={{ fontFamily: HAND, fontSize: "clamp(19px,3vw,25px)", lineHeight: 1.5, color: book.accent, whiteSpace: "pre-line" }}
          >
            {content.promiseNote}
          </p>
        )}

        {goals.length > 0 && (
          <div className="mt-9">
            <Label book={book}>What I&rsquo;m aiming at</Label>
            <ol className="m-0 mt-4 flex list-none flex-col gap-0 p-0">
              {goals.map((g, i) => (
                <motion.li
                  key={g.id}
                  className="relative flex gap-4 pb-6"
                  style={{ paddingLeft: 4 }}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: reduced ? 0 : 0.25 + i * 0.12, duration: 0.5 }}
                >
                  {/* the thread down the timeline */}
                  {i < goals.length - 1 && (
                    <span
                      aria-hidden
                      style={{ position: "absolute", left: 9, top: 16, bottom: 0, width: 1, background: `${book.grow}44` }}
                    />
                  )}
                  <span
                    aria-hidden
                    style={{
                      flex: "none",
                      width: 11,
                      height: 11,
                      marginTop: 5,
                      borderRadius: 999,
                      background: book.page,
                      border: `2px solid ${book.grow}`,
                    }}
                  />
                  <div>
                    {g.when && (
                      <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".16em", textTransform: "uppercase", color: book.grow }}>
                        {g.when}
                      </div>
                    )}
                    <p className="m-0 mt-1" style={{ fontSize: 14.5, lineHeight: 1.6, color: book.ink }}>
                      {g.text}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
        )}

        <Nav book={book} onBack={onBack} onNext={onNext} nextLabel="Let them go →" />
      </Page>
    </motion.article>
  );
}

/* ------------------------------------------------------------------ */
/* The jar                                                             */
/* ------------------------------------------------------------------ */

/**
 * The last screen.
 *
 * Folded paper airplanes in a jar, and letting go of them turns them into stars.
 * The order matters: they are only released once, by the reader, and the closing
 * line arrives after — so the last thing that happens in this experience is
 * somebody else choosing to let it go, not the sender asking them to.
 */
function Jar({
  content,
  book,
  reduced,
  count,
  released,
  onRelease,
  onRestart,
}: {
  content: RedFlagsContent;
  book: Notebook;
  reduced: boolean;
  count: number;
  released: boolean;
  onRelease: () => void;
  onRestart: () => void;
}) {
  /* Deterministic, so the server and the client agree on every position. */
  const planes = useMemo(
    () =>
      Array.from({ length: Math.min(count, 9) }, (_, i) => {
        const r = (n: number) => ((Math.sin((i + 1) * n) + 1) / 2);
        return {
          i,
          x: 16 + r(12.9898) * 68,
          y: 34 + r(78.233) * 52,
          tilt: -26 + r(43.117) * 52,
          rise: 120 + r(11.7) * 190,
          drift: -70 + r(27.3) * 140,
          delay: r(4.11) * 0.5,
        };
      }),
    [count]
  );

  return (
    <motion.div
      className="text-center"
      style={{ width: "min(560px, 100%)" }}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0.25 : 0.7 }}
    >
      <div style={{ position: "relative", height: 320, marginInline: "auto", maxWidth: 300 }}>
        {/*
          Glass, and it has to actually read as glass.

          The first pass was almost invisible — a near-transparent fill with a 13%
          border on a warm desk of nearly the same value. Glass is legible because
          of its *edges* and its highlight, not its body, so the weight went into a
          defined rim, a bright vertical catchlight down the left, and a darker
          pool at the base where the airplanes pile up.
        */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: "36px 30px 0",
            borderRadius: "14px 14px 30px 30px",
            border: `2.5px solid ${book.ink}40`,
            background: `linear-gradient(160deg, rgba(255,255,255,.5), rgba(255,255,255,.16) 38%, ${book.accentSoft} 72%, ${book.ink}18)`,
            boxShadow: `inset 0 -26px 34px -22px ${book.ink}55, inset 2px 0 0 rgba(255,255,255,.5), 0 26px 40px -28px rgba(0,0,0,.55)`,
          }}
        />
        {/* the catchlight down the glass */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 62,
            left: 46,
            width: 9,
            height: 170,
            borderRadius: 999,
            background: "linear-gradient(180deg, rgba(255,255,255,.72), rgba(255,255,255,0))",
          }}
        />
        {/* the lid */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 16,
            left: 46,
            right: 46,
            height: 26,
            borderRadius: 7,
            background: book.cover,
            border: `1px solid ${book.coverEdge}`,
            boxShadow: "inset 0 2px 0 rgba(255,255,255,.22)",
          }}
        />

        {planes.map((p) => (
          <motion.span
            key={p.i}
            aria-hidden
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              fontSize: 26,
              lineHeight: 1,
              /* Folded paper, so they read against the glass rather than sinking
                 into it — and gold once they are stars. */
              color: released ? "#e0b070" : book.ink,
              textShadow: released ? "0 0 14px rgba(224,176,112,.85)" : "0 1px 2px rgba(0,0,0,.25)",
            }}
            initial={false}
            animate={
              released
                ? {
                    opacity: [1, 1, 0.9],
                    y: -p.rise,
                    x: p.drift,
                    rotate: p.tilt + 220,
                    scale: [1, 1.1, 0.55],
                  }
                : { y: 0, x: 0, rotate: p.tilt, opacity: 1, scale: 1 }
            }
            transition={{ duration: reduced ? 0.4 : 2.1, delay: released ? p.delay : 0, ease: [0.16, 0.7, 0.3, 1] }}
          >
            {released ? "✦" : "✈"}
          </motion.span>
        ))}
      </div>

      {!released ? (
        <button
          type="button"
          onClick={onRelease}
          style={{
            marginTop: 4,
            height: 48,
            padding: "0 26px",
            borderRadius: 999,
            border: `1px solid ${book.accent}`,
            background: "transparent",
            color: book.accent,
            fontFamily: "inherit",
            fontSize: 14.5,
            cursor: "pointer",
          }}
        >
          Open the jar
        </button>
      ) : (
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0.2 : 1.5, duration: 0.9 }}
        >
          <p
            className="m-0"
            style={{
              fontFamily: HAND,
              fontSize: "clamp(21px,3.4vw,29px)",
              lineHeight: 1.5,
              color: book.ink,
              whiteSpace: "pre-line",
            }}
          >
            {content.endingNote}
          </p>
          {content.from && (
            <p className="m-0 mt-6" style={{ fontFamily: HAND, fontSize: 20, color: book.accent }}>
              — {content.from}
            </p>
          )}
          <button
            type="button"
            onClick={onRestart}
            style={{
              marginTop: 26,
              background: "transparent",
              border: "none",
              color: book.inkSoft,
              fontFamily: MONO,
              fontSize: 9.5,
              letterSpacing: ".18em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            read it again
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

function Page({ book, children }: { book: Notebook; children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        background: book.page,
        border: `1px solid ${book.pageEdge}`,
        borderRadius: "3px 12px 12px 3px",
        boxShadow: "0 40px 70px -40px rgba(0,0,0,.5)",
        padding: "clamp(26px, 4.4vw, 44px)",
        /* the ruled paper, if this notebook has any */
        backgroundImage: book.rule
          ? `repeating-linear-gradient(180deg, transparent 0 31px, ${book.rule} 31px 32px)`
          : undefined,
        overflow: "hidden",
      }}
    >
      {/* the margin line down the left, the way a real notebook has one */}
      <span
        aria-hidden
        style={{ position: "absolute", insetBlock: 0, left: "clamp(16px, 2.6vw, 26px)", width: 1, background: book.accentSoft }}
      />
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
}

function Label({ book, children }: { book: Notebook; children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: MONO,
        fontSize: 9,
        letterSpacing: ".2em",
        textTransform: "uppercase",
        color: book.inkSoft,
      }}
    >
      {children}
    </span>
  );
}

/** A hand-drawn checkbox. Ticked is green; unticked is simply not ticked yet. */
function Tick({ on, book }: { on: boolean; book: Notebook }) {
  return (
    <span
      aria-hidden
      style={{
        flex: "none",
        width: 17,
        height: 17,
        marginTop: 2,
        borderRadius: 3,
        display: "grid",
        placeItems: "center",
        border: `1.5px solid ${on ? book.grow : book.inkSoft + "66"}`,
        background: on ? book.growSoft : "transparent",
        color: book.grow,
        fontSize: 11,
        lineHeight: 1,
      }}
    >
      {on ? "✓" : ""}
    </span>
  );
}

function Nav({
  book,
  onBack,
  onNext,
  nextLabel,
}: {
  book: Notebook;
  onBack: () => void;
  onNext: () => void;
  nextLabel: string;
}) {
  return (
    <div className="mt-9 flex flex-wrap items-center justify-between gap-3">
      <button
        type="button"
        onClick={onBack}
        style={{
          background: "transparent",
          border: "none",
          color: book.inkSoft,
          fontFamily: MONO,
          fontSize: 9.5,
          letterSpacing: ".18em",
          textTransform: "uppercase",
          cursor: "pointer",
          padding: 0,
        }}
      >
        ← back
      </button>
      <button
        type="button"
        onClick={onNext}
        style={{
          height: 44,
          padding: "0 22px",
          borderRadius: 999,
          border: "none",
          background: book.accent,
          color: "#fff",
          fontFamily: "inherit",
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        {nextLabel}
      </button>
    </div>
  );
}

/** The growth marker. Sits in a corner and is never a number. */
function Plant({ book, fraction }: { book: Notebook; fraction: number }) {
  const stage = growthFor(fraction);
  return (
    <div
      className="pointer-events-none"
      style={{
        position: "absolute",
        left: "clamp(12px, 2.5vw, 26px)",
        bottom: "clamp(12px, 2.5vw, 26px)",
        display: "flex",
        alignItems: "center",
        gap: 9,
        zIndex: 2,
      }}
    >
      <motion.span
        key={stage.glyph}
        aria-hidden
        style={{ fontSize: 26, lineHeight: 1 }}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 16 }}
      >
        {stage.glyph}
      </motion.span>
      <span
        style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: ".18em", textTransform: "uppercase", color: book.inkSoft }}
      >
        {stage.label}
      </span>
      <span className="sr-only">
        {`Progress: ${GROWTH_STAGES.indexOf(stage) + 1} of ${GROWTH_STAGES.length}`}
      </span>
    </div>
  );
}

/** Paper tooth. Enough to stop the flats reading as flat. */
function Grain() {
  return (
    <span
      aria-hidden
      className="pointer-events-none"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        opacity: 0.5,
        backgroundImage:
          "radial-gradient(circle at 18% 26%, rgba(122,92,52,.07) .7px, transparent 1px), " +
          "radial-gradient(circle at 72% 64%, rgba(122,92,52,.055) .6px, transparent .9px)",
        backgroundSize: "39px 43px, 57px 51px",
      }}
    />
  );
}
