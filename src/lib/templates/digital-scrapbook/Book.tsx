"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { DigitalScrapbookContent, ScrapItem, Spread } from "./schema";
import { getTheme, PAPER_GRAIN, type PageTheme } from "./theme";
import { OpenedItem, ScrapItemView } from "./items";

/* ------------------------------------------------------------------ */
/* One sheet of paper                                                  */
/* ------------------------------------------------------------------ */

/**
 * A page renders the *whole* spread canvas but clips to its own half, so an
 * item can straddle the gutter exactly like a photo taped across two pages in
 * a real book.
 */
function PageFace({
  spread,
  theme,
  side,
  onActivate,
  animateItems,
  single,
}: {
  spread: Spread | null;
  theme: PageTheme;
  side: "left" | "right";
  onActivate?: (item: ScrapItem) => void;
  animateItems?: boolean;
  single?: boolean;
}) {
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        background: `linear-gradient(${side === "left" ? "95deg" : "265deg"}, ${theme.paperEdge}, ${theme.paper} 12%)`,
      }}
    >
      {/* paper fibre */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: PAPER_GRAIN, opacity: 0.34, mixBlendMode: "multiply" }}
      />
      {/* the shadow the spine casts onto the sheet */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0"
        style={{
          [side === "left" ? "right" : "left"]: 0,
          width: "13%",
          background: `linear-gradient(to ${side === "left" ? "right" : "left"}, transparent, rgba(74,50,26,.2))`,
        }}
      />

      {/* the spread canvas, offset so this half shows its own portion */}
      {spread && (
        <div
          className="absolute inset-y-0"
          style={
            single
              ? { left: 0, width: "100%" }
              : side === "left"
                ? { left: 0, width: "200%" }
                : { left: "-100%", width: "200%" }
          }
        >
          {spread.items.map((item, i) => (
            <ScrapItemView
              key={item.id}
              item={item}
              theme={theme}
              onActivate={onActivate}
              settleDelay={animateItems ? 0.28 + i * 0.055 : 0}
            />
          ))}
        </div>
      )}

      {spread?.tab && (
        <span
          aria-hidden
          className="absolute"
          style={{
            [side === "left" ? "left" : "right"]: "4%",
            top: "3%",
            fontFamily: theme.titleFont,
            fontSize: "clamp(7px,.75vw,11px)",
            letterSpacing: ".2em",
            textTransform: "uppercase",
            color: theme.inkSoft,
            opacity: 0.7,
          }}
        >
          {spread.tab}
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The book                                                            */
/* ------------------------------------------------------------------ */

export function Book({
  content,
  onReachedEnd,
  compact = false,
}: {
  content: DigitalScrapbookContent;
  onReachedEnd?: () => void;
  compact?: boolean;
}) {
  const reduced = useReducedMotion();
  const spreads = content.spreads;
  const total = spreads.length;

  const [index, setIndex] = useState(0);
  /** The leaf mid-flight: which spread it came from and which way it's going. */
  const [turning, setTurning] = useState<{ from: number; dir: 1 | -1 } | null>(null);
  const [opened, setOpened] = useState<ScrapItem | null>(null);
  const [isNarrow, setIsNarrow] = useState(false);
  const busy = useRef(false);
  const turnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (turnTimer.current) clearTimeout(turnTimer.current);
    },
    []
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 820px)");
    const apply = () => setIsNarrow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const turn = useCallback(
    (dir: 1 | -1) => {
      if (busy.current) return;
      const next = index + dir;
      if (next < 0) return;
      if (next >= total) {
        onReachedEnd?.();
        return;
      }
      busy.current = true;
      if (reduced) {
        setIndex(next);
        busy.current = false;
        return;
      }
      setTurning({ from: index, dir });
      setIndex(next);
      /* Matches the leaf transition below, and is tracked so that unmounting
         mid-turn doesn't leave a timer running against a dead component. */
      if (turnTimer.current) clearTimeout(turnTimer.current);
      turnTimer.current = setTimeout(() => {
        setTurning(null);
        busy.current = false;
      }, 1100);
    },
    [index, total, reduced, onReachedEnd]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (opened) {
        if (e.key === "Escape") setOpened(null);
        return;
      }
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        turn(1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        turn(-1);
      } else if (e.key === "Home") {
        setIndex(0);
      } else if (e.key === "End") {
        setIndex(Math.max(0, total - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [turn, total, opened]);

  const current = spreads[index] ?? null;
  const themeFor = (s: Spread | null) => getTheme(s?.theme ?? content.theme);
  const theme = themeFor(current);

  /* On a phone the book shows one page at a time. */
  const showSingle = isNarrow;

  /* The faces of the leaf in flight. Turning forward, the leaf's front is the
     page we're leaving and its back is the page arriving underneath. */
  /* The faces of the leaf in flight. Turning forward, the leaf's front is the
     page we're leaving and its back is the page arriving underneath. Safe to
     resolve to null when the turn ends: the leaf now exits instantly, so it is
     removed in the same commit rather than lingering with nothing to show. */
  const leafFront = turning ? (turning.dir === 1 ? spreads[turning.from] : spreads[turning.from - 1]) : null;
  const leafBack = turning ? (turning.dir === 1 ? spreads[turning.from + 1] : spreads[turning.from]) : null;

  return (
    <div className="relative flex w-full flex-col items-center gap-4">
      {/* the book body */}
      <div
        className="relative w-full"
        style={{
          maxWidth: compact ? 980 : 1120,
          aspectRatio: showSingle ? "3 / 4" : "3 / 2",
          perspective: 2200,
        }}
      >
        {/* the stack of sheets underneath, so the book has thickness */}
        {[5, 3.5, 2].map((offset, i) => (
          <span
            key={offset}
            aria-hidden
            className="absolute rounded-[3px]"
            style={{
              inset: `${-offset}px ${-offset}px ${-offset - 1}px`,
              background: i === 0 ? theme.paperEdge : theme.paper,
              opacity: 0.55 - i * 0.12,
              boxShadow: "0 24px 44px -24px rgba(40,26,12,.6)",
            }}
          />
        ))}

        <div
          className="relative h-full w-full overflow-hidden rounded-[3px]"
          style={{ boxShadow: "0 40px 70px -34px rgba(30,18,8,.7)", transformStyle: "preserve-3d" }}
        >
          {showSingle ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={current?.id ?? index}
                className="absolute inset-0"
                initial={reduced ? { opacity: 0 } : { opacity: 0, rotateY: 22, x: 40 }}
                animate={{ opacity: 1, rotateY: 0, x: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, rotateY: -22, x: -40 }}
                transition={{ duration: reduced ? 0.2 : 0.62, ease: [0.25, 0.8, 0.25, 1] }}
                style={{ transformOrigin: "left center" }}
              >
                <PageFace spread={current} theme={theme} side="right" onActivate={setOpened} animateItems single />
              </motion.div>
            </AnimatePresence>
          ) : (
            <>
              {/* the two resting pages */}
              <div className="absolute inset-y-0 left-0 w-1/2">
                <PageFace spread={current} theme={theme} side="left" onActivate={setOpened} animateItems />
              </div>
              <div className="absolute inset-y-0 right-0 w-1/2">
                <PageFace spread={current} theme={theme} side="right" onActivate={setOpened} animateItems />
              </div>

              {/* the leaf in flight, hinged on the spine */}
              <AnimatePresence>
                {turning && (
                  <motion.div
                    key={`leaf-${turning.from}-${turning.dir}`}
                    className="absolute inset-y-0"
                    style={{
                      [turning.dir === 1 ? "right" : "left"]: 0,
                      width: "50%",
                      transformStyle: "preserve-3d",
                      transformOrigin: turning.dir === 1 ? "left center" : "right center",
                      zIndex: 50,
                    }}
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: turning.dir === 1 ? -178 : 178 }}
                    /*
                     * Gone at once, not faded.
                     *
                     * `exit` shared the 1.1s transition below, so when the turn
                     * finished the leaf spent another *whole second* fading out
                     * on top of the page that had already arrived — the flicker
                     * where the old page seems to come back before the new one
                     * settles. The sheet underneath is already showing the new
                     * spread by then, so there is nothing to reveal gently: the
                     * leaf has finished its job and should stop existing.
                     */
                    exit={{ opacity: 0, transition: { duration: 0 } }}
                    transition={{ duration: 1.1, ease: [0.42, 0.03, 0.24, 1] }}
                  >
                    {/* front of the leaf */}
                    <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
                      <PageFace
                        spread={leafFront}
                        theme={themeFor(leafFront)}
                        side={turning.dir === 1 ? "right" : "left"}
                      />
                      {/* light sweeping across the flexing sheet */}
                      <motion.span
                        aria-hidden
                        className="pointer-events-none absolute inset-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.5, 0] }}
                        transition={{ duration: 1.1, ease: "easeInOut" }}
                        style={{
                          background:
                            turning.dir === 1
                              ? "linear-gradient(to left, rgba(255,240,210,.6), transparent 55%)"
                              : "linear-gradient(to right, rgba(255,240,210,.6), transparent 55%)",
                        }}
                      />
                    </div>
                    {/* back of the leaf */}
                    <div
                      className="absolute inset-0"
                      style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                    >
                      <PageFace
                        spread={leafBack}
                        theme={themeFor(leafBack)}
                        side={turning.dir === 1 ? "left" : "right"}
                      />
                      <motion.span
                        aria-hidden
                        className="pointer-events-none absolute inset-0"
                        initial={{ opacity: 0.55 }}
                        animate={{ opacity: 0 }}
                        transition={{ duration: 1.1, ease: "easeInOut" }}
                        style={{ background: "rgba(58,40,22,.5)" }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* the page revealed beneath, plus the moving shadow the leaf drops */}
              {turning && (
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 z-[45]"
                  style={{ [turning.dir === 1 ? "left" : "right"]: "50%", width: "50%" }}
                  initial={{ opacity: 0.42 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 1.1, ease: "easeOut" }}
                >
                  <span
                    className="absolute inset-0"
                    style={{
                      background:
                        turning.dir === 1
                          ? "linear-gradient(to right, rgba(40,26,12,.55), transparent 60%)"
                          : "linear-gradient(to left, rgba(40,26,12,.55), transparent 60%)",
                    }}
                  />
                </motion.span>
              )}

              {/* the spine */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-1/2 z-[46] -translate-x-1/2"
                style={{
                  width: "2.4%",
                  background:
                    "linear-gradient(to right, rgba(58,40,22,.26), rgba(58,40,22,.05) 40%, rgba(58,40,22,.05) 60%, rgba(58,40,22,.26))",
                }}
              />
            </>
          )}

          {/*
            The corner you lift to turn the page.

            This was a flat triangle that rotated sixteen degrees — a shape
            spinning in the plane of the page, which reads as a graphic moving
            rather than paper lifting. Real paper hinges along the diagonal and
            comes *off* the sheet toward you, so this does that: a perspective on
            the container, and the flap rotated about the (1,-1,0) axis through
            the corner itself.

            Three things sell it beyond the rotation. The underside is its own
            face in a warmer, darker stock, revealed as the corner comes over.
            The shadow it casts onto the page grows and softens as it lifts,
            which is what gives the corner height. And the whole peel gets
            larger, because a corner curling toward you covers more of the page.
          */}
          {!reduced && !showSingle && index < total - 1 && (
            <motion.button
              type="button"
              onClick={() => turn(1)}
              aria-label="Turn the page"
              className="absolute bottom-0 right-0 z-[47] cursor-pointer border-0 bg-transparent p-0"
              style={{ width: "14%", aspectRatio: "1", perspective: 620 }}
              initial="rest"
              whileHover="lift"
              whileFocus="lift"
              animate="rest"
              variants={{ rest: {}, lift: {} }}
            >
              {/* the shadow the lifted corner drops onto the page below it */}
              <motion.span
                aria-hidden
                className="absolute bottom-0 right-0"
                style={{
                  width: "100%",
                  height: "100%",
                  clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
                  background: "rgba(58,40,22,.34)",
                  filter: "blur(7px)",
                  transformOrigin: "100% 100%",
                }}
                variants={{
                  rest: { opacity: 0, scale: 0.6, x: 0, y: 0 },
                  lift: { opacity: 0.5, scale: 0.86, x: -7, y: -7 },
                }}
                transition={{ type: "spring", stiffness: 180, damping: 22 }}
              />

              {/* the flap itself, hinged on the corner's diagonal */}
              <motion.span
                aria-hidden
                className="absolute bottom-0 right-0 h-full w-full"
                style={{
                  transformOrigin: "100% 100%",
                  transformStyle: "preserve-3d",
                }}
                /* A diagonal hinge, expressed as the two axes Framer animates.
                   Lifting the bottom edge and the right edge together is the
                   same motion as folding about the corner's diagonal, and it
                   composes without a transform string that would fight the
                   spring. */
                variants={{
                  rest: { rotateX: -4, rotateY: 4, scale: 0.62 },
                  lift: { rotateX: -72, rotateY: 72, scale: 1 },
                }}
                transition={{ type: "spring", stiffness: 150, damping: 19, mass: 0.7 }}
              >
                {/* the face that is the page, seen until it folds over */}
                <span
                  className="absolute inset-0"
                  style={{
                    clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
                    background: `linear-gradient(315deg, ${theme.paperEdge} 0%, ${theme.paper} 62%)`,
                    backfaceVisibility: "hidden",
                  }}
                />
                {/* the underside, which is what you actually see once it curls */}
                <span
                  className="absolute inset-0"
                  style={{
                    clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
                    background: `linear-gradient(135deg, ${theme.paper} 0%, ${theme.paperEdge} 78%)`,
                    transform: "rotateY(180deg)",
                    backfaceVisibility: "hidden",
                    boxShadow: "inset 2px 2px 6px rgba(58,40,22,.18)",
                  }}
                />
              </motion.span>
            </motion.button>
          )}
        </div>

        {/* an item opened out of the page */}
        <AnimatePresence>
          {opened && <OpenedItem item={opened} theme={theme} onClose={() => setOpened(null)} />}
        </AnimatePresence>
      </div>

      {/* the book's own controls, styled like paper tabs rather than app buttons */}
      <div className="flex w-full max-w-[1120px] items-center justify-between gap-4 px-1">
        <button
          type="button"
          onClick={() => turn(-1)}
          disabled={index === 0}
          className="cursor-pointer rounded-full px-4 py-2 text-[11.5px] disabled:cursor-not-allowed disabled:opacity-35"
          style={{
            fontFamily: theme.titleFont,
            letterSpacing: ".1em",
            background: "rgba(253,246,230,.9)",
            border: `1px solid ${theme.accent}44`,
            color: theme.ink,
          }}
        >
          ← back
        </button>

        <div className="flex items-center gap-1.5" role="tablist" aria-label="Pages">
          {spreads.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Page ${i + 1}${s.tab ? `: ${s.tab}` : ""}`}
              onClick={() => !busy.current && setIndex(i)}
              className="cursor-pointer rounded-full border-0 p-0"
              style={{
                width: i === index ? 22 : 7,
                height: 7,
                background: i === index ? theme.accent : "rgba(253,246,230,.75)",
                transition: "width .3s ease, background .3s ease",
              }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => turn(1)}
          className="cursor-pointer rounded-full px-4 py-2 text-[11.5px]"
          style={{
            fontFamily: theme.titleFont,
            letterSpacing: ".1em",
            background: theme.accent,
            border: `1px solid ${theme.accent}`,
            color: "#fffdf4",
          }}
        >
          {index === total - 1 ? "the end →" : "next →"}
        </button>
      </div>
    </div>
  );
}
