"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Cake, Confetti, Cutout, Decor, Flash, LabelTag, Page, Pattern, Pin, Snapshot, Tape, TornStrip } from "./parts";
import { BLOW_MS, CARD_THEMES } from "./theme";
import type { BirthdayCardContent } from "./schema";

/**
 * Interactive Birthday Card.
 *
 * The brief's rule — *build a birthday card that happens to exist on the web* —
 * decides three things that would otherwise be arbitrary:
 *
 *   - **The card is one object, not a sequence of screens.** The cover, the two
 *     inside pages and the letter all live in one piece of paper; opening rotates
 *     a real panel about a real spine rather than navigating anywhere. The inside
 *     of the cover *is* the left page, which is why the envelope is on its back
 *     face and not underneath it.
 *   - **Blowing the candles takes a breath.** A tap would be a button. Holding
 *     for a moment while the flames lean and shrink is the only part of this that
 *     a screen can borrow from the real thing, so it gets the care.
 *   - **Nothing is gated.** Every stage is reachable without the one before it —
 *     the letter can be skipped, the candles can be tapped out, and reduced
 *     motion gets the same story with none of the movement.
 *
 * Laid out mobile-first: the spread is a genuine two-page card from `md` up, and
 * a vertical stack below it, because a two-page spread on a phone makes both
 * pages too small to touch. Both layouts read the same state, so there is one
 * flow, not two.
 */

const HAND = "var(--font-gochi), var(--hw-elegant), cursive";
const SERIF = "var(--font-fraunces), serif";
const MONO = "var(--font-ibm-plex-mono), monospace";

type Stage = "closed" | "inside" | "final";

export function BirthdayCardView({
  content,
  embedded = false,
}: {
  content: BirthdayCardContent;
  embedded?: boolean;
}) {
  const theme = CARD_THEMES[content.theme] ?? CARD_THEMES.ransom;
  const reduced = Boolean(useReducedMotion());

  const [stage, setStage] = useState<Stage>("closed");
  const [letterOpen, setLetterOpen] = useState(false);
  const [blow, setBlow] = useState(0);
  const [out, setOut] = useState(false);
  const [party, setParty] = useState(false);

  const open = stage !== "closed";

  const blowOut = useCallback(() => {
    setOut(true);
    setBlow(1);
    setParty(true);
  }, []);

  /* The celebration runs, then the last page arrives on its own. Nobody should
     have to press anything to be told happy birthday. */
  useEffect(() => {
    if (!out) return;
    const t = setTimeout(() => setStage("final"), reduced ? 700 : 2200);
    return () => clearTimeout(t);
  }, [out, reduced]);

  const hold = useHold({ done: out, onComplete: blowOut, onProgress: setBlow });
  const wide = useWide();

  return (
    <div
      style={{
        position: "relative",
        minHeight: embedded ? "100%" : "100dvh",
        background: theme.desk,
        color: theme.ink,
        fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
        display: "grid",
        placeItems: "safe center",
        padding: "clamp(14px, 3.5vw, 44px)",
        overflowX: "clip",
        isolation: "isolate",
      }}
    >
      <Confetti theme={theme} play={party} reduced={reduced} />
      <Flash theme={theme} play={party} />

      <AnimatePresence mode="wait">
        {stage === "final" ? (
          <FinalPage key="final" content={content} theme={theme} reduced={reduced} />
        ) : (
          <motion.div
            key="card"
            className="w-full"
            /*
              The frame is spread-width whether the card is open or shut, and only
              the shift changes. Animating the width instead made the closed card
              half of 470px — a 235px postage stamp, when the brief asks for the
              first thing somebody sees to be large and physical. A single panel is
              now the full 500.
            */
            style={{ maxWidth: 1000 }}
            initial={false}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: reduced ? 0.2 : 0.9, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {/*
              One layout at a time, chosen in JS rather than with `hidden md:block`.
              Two trees would mean a whole second card sitting in the DOM — and a
              `display:none` element still runs its animations, so a phone would be
              driving a hidden set of candle flames it can never see. It would also
              put a duplicate of every button in the document.
            */}
            {wide ? (
              <Spread
                content={content}
                theme={theme}
                reduced={reduced}
                open={open}
                onOpen={() => setStage("inside")}
                onLetter={() => setLetterOpen(true)}
                blow={blow}
                out={out}
                hold={hold}
                onTapBlow={blowOut}
              />
            ) : (
              <Stack
                content={content}
                theme={theme}
                reduced={reduced}
                open={open}
                onOpen={() => setStage("inside")}
                onLetter={() => setLetterOpen(true)}
                blow={blow}
                out={out}
                hold={hold}
                onTapBlow={blowOut}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {letterOpen && (
          <Letter key="letter" content={content} theme={theme} reduced={reduced} onClose={() => setLetterOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Is there room for a two-page spread?
 *
 * `useSyncExternalStore` rather than an effect, because it is the one way to read
 * a media query that gives React an explicit *server* snapshot. That snapshot is
 * `false` — mobile-first, so the markup the server sends is the phone layout and
 * a narrow device never swaps after hydration. Doing this with `useState` in an
 * effect would render the desktop card first and visibly reflow on every phone.
 */
const WIDE = "(min-width: 768px)";

function useWide(): boolean {
  return useSyncExternalStore(
    (notify) => {
      const mq = window.matchMedia(WIDE);
      mq.addEventListener("change", notify);
      return () => mq.removeEventListener("change", notify);
    },
    () => window.matchMedia(WIDE).matches,
    () => false
  );
}

/* ------------------------------------------------------------------ */
/* Press and hold                                                      */
/* ------------------------------------------------------------------ */

interface Hold {
  progress: number;
  active: boolean;
  handlers: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerUp: () => void;
    onPointerCancel: () => void;
    onPointerLeave: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    onKeyUp: () => void;
  };
}

/**
 * Hold a pointer (or a key) down for `BLOW_MS`.
 *
 * Two details make this feel like breath rather than a loading bar. Releasing
 * early *decays* rather than snapping to zero, so a stutter in a hold does not
 * throw the progress away and the flames recover the way real ones do. And the
 * key path is included on purpose — the spec asks for keyboard support, and a
 * press-and-hold that only works with a mouse excludes exactly the people the
 * accessible alternative is for.
 *
 * `pointercancel` and `pointerleave` both stop it: on a phone, a scroll gesture
 * fires cancel, and without that the progress bar would keep filling while
 * somebody's finger had already left.
 */
function useHold({
  done,
  onComplete,
  onProgress,
}: {
  done: boolean;
  onComplete: () => void;
  onProgress: (v: number) => void;
}): Hold {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(false);
  const holding = useRef(false);
  const value = useRef(0);
  const raf = useRef(0);
  const last = useRef(0);
  const finished = useRef(false);

  /* The loop must not close over props, or it would need rebuilding mid-hold and
     the frame timing would jump. They are read through a ref that an effect keeps
     current instead. */
  const cb = useRef({ onComplete, onProgress });
  useEffect(() => {
    cb.current = { onComplete, onProgress };
  }, [onComplete, onProgress]);

  /* Named function expression, so the loop schedules itself by its own name
     rather than by the `const` it is being assigned to — which is not in scope
     yet at the point the frame is requested. */
  const loop = useCallback(function step(t: number) {
    const dt = last.current ? t - last.current : 16;
    last.current = t;

    const next = holding.current
      ? value.current + dt / BLOW_MS
      : /* Decay is slower than the fill, so a stutter mid-hold is forgiving. */
        value.current - dt / (BLOW_MS * 1.6);

    value.current = Math.max(0, Math.min(1, next));
    setProgress(value.current);
    cb.current.onProgress(value.current);

    if (value.current >= 1 && !finished.current) {
      finished.current = true;
      holding.current = false;
      setActive(false);
      cancelAnimationFrame(raf.current);
      raf.current = 0;
      cb.current.onComplete();
      return;
    }
    if (!holding.current && value.current <= 0) {
      cancelAnimationFrame(raf.current);
      raf.current = 0;
      last.current = 0;
      return;
    }
    raf.current = requestAnimationFrame(step);
  }, []);

  const start = useCallback(() => {
    if (done || finished.current) return;
    holding.current = true;
    setActive(true);
    if (!raf.current) {
      last.current = 0;
      raf.current = requestAnimationFrame(loop);
    }
  }, [done, loop]);

  const stop = useCallback(() => {
    holding.current = false;
    setActive(false);
    if (!raf.current && value.current > 0) {
      last.current = 0;
      raf.current = requestAnimationFrame(loop);
    }
  }, [loop]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return {
    progress,
    active,
    handlers: {
      onPointerDown: (e) => {
        e.preventDefault();
        (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
        start();
      },
      onPointerUp: stop,
      onPointerCancel: stop,
      onPointerLeave: stop,
      onKeyDown: (e) => {
        if (e.key !== " " && e.key !== "Enter") return;
        e.preventDefault();
        if (e.repeat) return;
        start();
      },
      onKeyUp: stop,
    },
  };
}

/* ------------------------------------------------------------------ */
/* The two layouts                                                     */
/* ------------------------------------------------------------------ */

interface CardProps {
  content: BirthdayCardContent;
  theme: (typeof CARD_THEMES)[keyof typeof CARD_THEMES];
  reduced: boolean;
  open: boolean;
  onOpen: () => void;
  onLetter: () => void;
  blow: number;
  out: boolean;
  hold: Hold;
  onTapBlow: () => void;
}

/**
 * The desktop card: one folded piece of paper.
 *
 * The cover panel sits in the right-hand slot, hinged on its left edge — the
 * spine. Rotating it −180° swings it across to the left slot and reveals the
 * right page beneath, and because the panel is two-sided its *back* becomes the
 * left page. That is exactly how a folded card works, and it is why the envelope
 * lives on the cover's reverse rather than on a separate element underneath it.
 */
function Spread(p: CardProps) {
  const { open, reduced } = p;

  return (
    <div style={{ perspective: 2000 }}>
      <motion.div
        className="relative"
        style={{ transformStyle: "preserve-3d", aspectRatio: "2 / 1.32" }}
        /* Closed, the single panel is centred; open, the spread is. */
        animate={{ x: open ? "0%" : "-25%" }}
        transition={{ duration: reduced ? 0.2 : 0.95, ease: [0.2, 0.8, 0.2, 1] }}
      >
        {/* the right page, revealed as the cover leaves it */}
        <div className="absolute inset-y-0" style={{ left: "50%", width: "50%" }}>
          <CakePage {...p} />
        </div>

        {/* the cover — two-sided, hinged on the spine */}
        <motion.div
          className="absolute inset-y-0"
          style={{
            left: "50%",
            width: "50%",
            transformStyle: "preserve-3d",
            transformOrigin: "left center",
            zIndex: 2,
          }}
          animate={{ rotateY: open ? -180 : 0 }}
          transition={{ duration: reduced ? 0.2 : 1.15, ease: [0.32, 0.72, 0.2, 1] }}
        >
          <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
            <Cover {...p} />
          </div>
          <div
            className="absolute inset-0"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <EnvelopePage {...p} />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

/** The phone card: the same paper, folded the other way. */
function Stack(p: CardProps) {
  const { theme, open, reduced } = p;

  return (
    <div style={{ perspective: 1400 }}>
      <AnimatePresence mode="wait">
        {!open ? (
          <motion.div
            key="cover"
            style={{ transformOrigin: "50% 0%", transformStyle: "preserve-3d", aspectRatio: "1 / 1.3" }}
            exit={reduced ? { opacity: 0 } : { rotateX: -104, opacity: 0 }}
            transition={{ duration: reduced ? 0.2 : 0.8, ease: [0.32, 0.72, 0.2, 1] }}
          >
            <Cover {...p} />
          </motion.div>
        ) : (
          <motion.div
            key="pages"
            className="flex flex-col"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0.2 : 0.7, delay: reduced ? 0 : 0.3 }}
          >
            <div style={{ minHeight: 300 }}>
              <EnvelopePage {...p} />
            </div>
            {/* the fold between the two halves, as a crease rather than a gap */}
            <span
              aria-hidden
              style={{
                height: 2,
                background: `linear-gradient(90deg, transparent, ${theme.pageEdge} 12%, ${theme.pageEdge} 88%, transparent)`,
                boxShadow: `0 1px 3px -1px ${theme.pageEdge}`,
              }}
            />
            <div style={{ minHeight: 380 }}>
              <CakePage {...p} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The front                                                           */
/* ------------------------------------------------------------------ */

function Cover({ content, theme, onOpen, open }: CardProps) {
  return (
    <div
      className="relative flex h-full flex-col items-center justify-center overflow-hidden text-center"
      style={{
        background: theme.board,
        border: `1px solid ${theme.boardEdge}`,
        borderRadius: "3px 8px 8px 3px",
        boxShadow: "0 40px 70px -34px rgba(60,44,24,.7), 0 2px 0 rgba(255,255,255,.35) inset",
        padding: "clamp(20px, 3.4vw, 38px)",
      }}
    >
      <Pattern theme={theme} />
      <Decor kind={content.decor} theme={theme} />

      {content.recipient && (
        <span className="relative">
          <LabelTag theme={theme} tilt={-1.8}>for {content.recipient} ♥</LabelTag>
        </span>
      )}

      <div className="relative mt-4">
        <Cutout text={content.coverHeading || "Happy Birthday"} theme={theme} size={30} />
      </div>

      {content.coverPhotoUrl && (
        <div className="relative mt-6" style={{ width: "min(62%, 230px)" }}>
          <Tape theme={theme} className="left-1/2 -top-3 -translate-x-1/2" tilt={-5} />
          <Snapshot url={content.coverPhotoUrl} theme={theme} tilt={-2} />
        </div>
      )}

      {content.coverMessage && (
        <p
          className="relative m-0 mt-6"
          /* On its own strip of paper. Handwriting straight onto gingham was
             fighting the check for legibility and losing. */
          style={{
            fontFamily: HAND,
            fontSize: "clamp(17px,2.2vw,22px)",
            lineHeight: 1.5,
            color: theme.ink,
            background: "rgba(253,248,236,.92)",
            padding: "8px 16px",
            transform: "rotate(-.8deg)",
            boxShadow: "0 4px 10px -6px rgba(50,36,20,.6)",
          }}
        >
          {content.coverMessage}
        </p>
      )}

      <button
        type="button"
        onClick={onOpen}
        disabled={open}
        className="relative mt-7 cursor-pointer"
        style={{
          height: 50,
          padding: "0 28px",
          borderRadius: 999,
          border: "none",
          background: theme.accent,
          color: "#fff",
          fontFamily: "inherit",
          fontSize: 15,
          boxShadow: "0 12px 24px -12px rgba(60,30,20,.7)",
        }}
      >
        Open your card →
      </button>

      {content.from && (
        <p className="relative m-0 mt-5" style={{ fontFamily: HAND, fontSize: 17, color: theme.inkSoft }}>
          — {content.from}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Left page — the envelope                                            */
/* ------------------------------------------------------------------ */

function EnvelopePage({ content, theme, onLetter, reduced }: CardProps) {
  const hasLetter = Boolean(content.letterBody.trim() || content.letterHeading.trim());

  return (
    <Page
      theme={theme}
      className="h-full items-center justify-center gap-5 p-[clamp(18px,3vw,34px)] text-center"
      style={{ borderRadius: "8px 3px 3px 8px" }}
    >
      <Decor kind={content.decor} theme={theme} count={4} />

      {!hasLetter ? (
        <p className="relative m-0" style={{ fontFamily: HAND, fontSize: 19, color: theme.inkSoft }}>
          {content.coverMessage || "Happy birthday."}
        </p>
      ) : (
        <>
          <motion.button
            type="button"
            onClick={onLetter}
            className="relative cursor-pointer border-0 bg-transparent p-0"
            style={{ width: "min(78%, 260px)" }}
            whileHover={reduced ? undefined : { y: -6, rotate: -1 }}
            whileTap={reduced ? undefined : { scale: 0.97 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            aria-label="Open the letter"
          >
            <EnvelopeArt theme={theme} />
            {/* pinned to the page, the way the reference pins its envelope down */}
            <Pin color={theme.accent} className="left-1/2 -top-2 -translate-x-1/2" />
          </motion.button>

          <p
            className="relative m-0"
            style={{ fontFamily: HAND, fontSize: "clamp(16px,2vw,20px)", lineHeight: 1.5, color: theme.ink }}
          >
            {content.envelopeTeaser}
          </p>

          {/* A printed strip glued on, not a button — this is how a handmade card
              gives instructions, and it is why the experience can tell you what to
              do without looking like software. */}
          <button type="button" onClick={onLetter} className="relative cursor-pointer border-0 bg-transparent p-0">
            <LabelTag theme={theme} tilt={-1.6}>Click letter to open and close</LabelTag>
          </button>
        </>
      )}
    </Page>
  );
}

/** A small paper envelope with a flap and a seal. */
function EnvelopeArt({ theme }: { theme: (typeof CARD_THEMES)[keyof typeof CARD_THEMES] }) {
  return (
    <svg viewBox="0 0 120 80" style={{ width: "100%", display: "block", overflow: "visible" }}>
      <rect x={1} y={1} width={118} height={78} rx={3} fill={theme.page} stroke={theme.pageEdge} />
      {/* the two lower creases */}
      <path d="M1 79 L60 44 L119 79" fill="none" stroke={theme.pageEdge} strokeWidth={0.8} />
      <path d="M1 1 L60 44 L119 1" fill={theme.board} opacity={0.55} stroke={theme.pageEdge} strokeWidth={0.8} />
      {/* the seal */}
      <circle cx={60} cy={41} r={11} fill={theme.accent} />
      <circle cx={60} cy={41} r={11} fill="none" stroke="rgba(0,0,0,.16)" strokeWidth={1.4} />
      <text
        x={60}
        y={46}
        textAnchor="middle"
        style={{ fontSize: 12, fill: theme.page, fontFamily: SERIF }}
      >
        ♥
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Right page — the cake                                               */
/* ------------------------------------------------------------------ */

function CakePage({ content, theme, blow, out, hold, onTapBlow, reduced }: CardProps) {
  const words = ["Blow", "the", "candles"];

  return (
    <Page
      theme={theme}
      className="h-full items-center justify-center gap-3 p-[clamp(18px,3vw,34px)] text-center"
      style={{ borderRadius: "3px 8px 8px 3px" }}
    >
      {/* A band of coloured paper ripped along its lower edge, with the lettering
          stuck over it. One torn edge says "made by hand" more than any texture
          does, because a machine would not have left it. */}
      <TornStrip color={theme.accent} height={132} seed={4.4} />
      <Decor kind={content.decor} theme={theme} count={4} />

      {/* Stacked with real gaps: the tiles are individually tilted, so words set
          tight against each other collide at the corners. */}
      {!out ? (
        <div className="relative flex flex-col items-center gap-2.5">
          {words.map((w, i) => (
            <Cutout key={w} text={w} theme={theme} size={i === 2 ? 23 : 19} />
          ))}
        </div>
      ) : (
        <p
          className="relative m-0"
          style={{ fontFamily: HAND, fontSize: "clamp(20px,2.6vw,26px)", color: theme.accent }}
        >
          Wish made ✦
        </p>
      )}

      {/* `min-h-0` is what lets this actually shrink — a flex child defaults to
          `min-height: auto`, so without it the cake refuses to go below its own
          content size and pushes the controls off the bottom of the page. */}
      <div className="relative w-full min-h-0 flex-1" style={{ maxWidth: 320 }}>
        <Cake
          cake={content.cake}
          frosting={content.frosting}
          candleCount={content.candleCount}
          candleStyle={content.candleStyle}
          candleColors={content.candleColors}
          blow={blow}
          out={out}
          theme={theme}
          reduced={reduced}
        />
      </div>

      {!out && (
        <div className="relative flex w-full flex-col items-center gap-2.5" style={{ maxWidth: 300 }}>
          <button
            type="button"
            {...hold.handlers}
            className="w-full cursor-pointer select-none"
            style={{
              height: 52,
              borderRadius: 999,
              border: "none",
              background: hold.active ? theme.accent : theme.ink,
              color: "#fff",
              fontFamily: "inherit",
              fontSize: 15,
              touchAction: "none",
              transition: "background .2s ease",
            }}
            aria-label="Press and hold to blow out the candles"
          >
            {hold.active ? "Keep going…" : "Hold to blow them out"}
          </button>

          {/* how far through the breath they are */}
          <div
            className="w-full overflow-hidden"
            style={{ height: 5, borderRadius: 999, background: theme.accentSoft }}
            role="progressbar"
            aria-valuenow={Math.round(hold.progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Blowing progress"
          >
            <div
              style={{
                height: "100%",
                width: `${hold.progress * 100}%`,
                background: theme.accent,
                borderRadius: 999,
              }}
            />
          </div>

          {/*
            Always present, never a fallback behind a media query. Press-and-hold
            is hard or impossible with a switch, a head pointer, or a tremor, and
            hiding the alternative until something is "detected" means the people
            who need it are the ones who have to go looking.
          */}
          <button
            type="button"
            onClick={onTapBlow}
            className="cursor-pointer border-0 bg-transparent p-0"
            aria-label="Tap to blow out the candles instead of holding"
          >
            <LabelTag theme={theme} tilt={1.2}>or tap to blow them out</LabelTag>
          </button>
        </div>
      )}
    </Page>
  );
}

/* ------------------------------------------------------------------ */
/* The letter                                                          */
/* ------------------------------------------------------------------ */

/**
 * The letter, full screen.
 *
 * Deliberately not a modal: no rounded card, no dimmed chrome, no close X in a
 * corner. It is a sheet of paper on a desk, with margins, a shadow and a slight
 * tilt, and the way out is a plain line of type at the bottom the way you would
 * put a letter down.
 */
function Letter({
  content,
  theme,
  reduced,
  onClose,
}: {
  content: BirthdayCardContent;
  theme: (typeof CARD_THEMES)[keyof typeof CARD_THEMES];
  reduced: boolean;
  onClose: () => void;
}) {
  /* Escape closes it, the way it closes anything laid over everything else. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[110] overflow-y-auto"
      style={{ background: theme.desk, contain: "paint" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0.2 : 0.5 }}
      role="dialog"
      aria-modal="true"
      aria-label="The letter"
    >
      <div className="grid min-h-full place-items-center p-[clamp(14px,4vw,54px)]">
        <motion.div
          className="w-full"
          style={{ maxWidth: 660 }}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 40, rotate: -1.4, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, rotate: -0.5, scale: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 26, scale: 0.97 }}
          transition={{ duration: reduced ? 0.2 : 0.75, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <div
            style={{
              background: theme.page,
              border: `1px solid ${theme.pageEdge}`,
              boxShadow: "0 50px 90px -46px rgba(50,36,20,.75)",
              padding: "clamp(30px, 6vw, 62px) clamp(24px, 6vw, 66px)",
            }}
          >
            {/* the margin rule a real sheet has */}
            <span
              aria-hidden
              className="pointer-events-none absolute"
              style={{ display: "none" }}
            />

            {content.recipient && (
              <p className="m-0" style={{ ...stampStyle, color: theme.accent }}>
                For {content.recipient}
              </p>
            )}

            {content.letterHeading && (
              <h2
                className="m-0 mt-4"
                style={{
                  fontFamily: SERIF,
                  fontWeight: 500,
                  fontSize: "clamp(24px,4vw,36px)",
                  lineHeight: 1.18,
                  color: theme.ink,
                }}
              >
                {content.letterHeading}
              </h2>
            )}

            {content.letterPhotoUrl && (
              <div className="mt-7" style={{ width: "min(56%, 240px)" }}>
                <Snapshot url={content.letterPhotoUrl} theme={theme} tilt={1.6} />
              </div>
            )}

            {content.letterBody && (
              <p
                className="m-0 mt-7"
                /* Typed, not handwritten. The reference letter is plainly printed
                   out and glued in, and that restraint is what lets the ransom-note
                   noise everywhere else read as deliberate rather than as the whole
                   card shouting. */
                style={{
                  fontFamily: SERIF,
                  fontSize: "clamp(15.5px,2vw,18px)",
                  lineHeight: 1.85,
                  color: theme.ink,
                  whiteSpace: "pre-line",
                }}
              >
                {content.letterBody}
              </p>
            )}

            {(content.letterSignature || content.from) && (
              <p
                className="m-0 mt-9"
                style={{ fontFamily: HAND, fontSize: "clamp(20px,2.8vw,26px)", color: theme.accent }}
              >
                {content.letterSignature || `— ${content.from}`}
              </p>
            )}
          </div>

          <div className="mt-7 text-center">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer"
              style={{
                padding: "12px 26px",
                borderRadius: 999,
                border: `1px solid ${theme.pageEdge}`,
                background: theme.page,
                color: theme.ink,
                fontFamily: "inherit",
                fontSize: 14,
              }}
            >
              Fold it back up
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* After the candles                                                   */
/* ------------------------------------------------------------------ */

function FinalPage({
  content,
  theme,
  reduced,
}: {
  content: BirthdayCardContent;
  theme: (typeof CARD_THEMES)[keyof typeof CARD_THEMES];
  reduced: boolean;
}) {
  return (
    <motion.div
      className="w-full text-center"
      style={{ maxWidth: 620 }}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 26, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: reduced ? 0.25 : 1, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <div style={{ fontSize: 30, lineHeight: 1 }}>✨</div>

      <div className="mt-5 flex justify-center">
        <Cutout text={content.finalHeading || "Make a wish"} theme={theme} size={30} />
      </div>

      {content.finalPhotoUrl && (
        <div className="mx-auto mt-9" style={{ width: "min(72%, 300px)" }}>
          <Snapshot url={content.finalPhotoUrl} theme={theme} tilt={-2} />
        </div>
      )}

      {content.finalMessage && (
        <p
          className="m-0 mt-8"
          style={{
            fontFamily: HAND,
            fontSize: "clamp(19px,2.8vw,25px)",
            lineHeight: 1.7,
            color: theme.ink,
            whiteSpace: "pre-line",
          }}
        >
          {content.finalMessage}
        </p>
      )}

      {content.from && (
        <p className="m-0 mt-8" style={{ fontFamily: HAND, fontSize: 21, color: theme.accent }}>
          — {content.from}
        </p>
      )}

      {content.ctaLabel && content.ctaHref && (
        <a
          href={content.ctaHref}
          className="mt-9 inline-block"
          style={{
            padding: "13px 28px",
            borderRadius: 999,
            background: theme.accent,
            color: "#fff",
            fontSize: 14.5,
            textDecoration: "none",
          }}
        >
          {content.ctaLabel}
        </a>
      )}

      <p className="m-0 mt-9" style={{ fontSize: 22 }}>
        ❤️
      </p>
    </motion.div>
  );
}

const stampStyle = {
  fontFamily: MONO,
  fontSize: 9.5,
  letterSpacing: ".2em",
  textTransform: "uppercase",
} as const;
