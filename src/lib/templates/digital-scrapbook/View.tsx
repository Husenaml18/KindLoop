"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { fraunces, spaceGrotesk, ibmPlexMono, gochiHand } from "@/app/fonts";
import type { DigitalScrapbookContent } from "./schema";
import { DS_FALLBACKS } from "./schema";
import { getTheme, PAPER_GRAIN } from "./theme";
import { Book } from "./Book";

type Stage = "desk" | "opening" | "book" | "closing";

/* Fixed motes so server and client markup match. */
const DUST = [
  { x: 10, y: 82, s: 3, d: 17, delay: 0 },
  { x: 24, y: 94, s: 2, d: 21, delay: 2.6 },
  { x: 38, y: 74, s: 2.5, d: 19, delay: 5.2 },
  { x: 52, y: 90, s: 2, d: 23, delay: 1.4 },
  { x: 66, y: 78, s: 3, d: 18, delay: 3.9 },
  { x: 79, y: 92, s: 2, d: 24, delay: 6.6 },
  { x: 90, y: 72, s: 2.5, d: 20, delay: 2.1 },
  { x: 31, y: 60, s: 2, d: 26, delay: 8.1 },
  { x: 71, y: 56, s: 2, d: 22, delay: 4.7 },
];

function SunlitDesk({ deskColor, accent }: { deskColor: string; accent: string }) {
  const reduced = useReducedMotion();
  return (
    <>
      {/* wood */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `
            repeating-linear-gradient(92deg, rgba(0,0,0,.05) 0 3px, transparent 3px 26px),
            repeating-linear-gradient(90deg, rgba(255,255,255,.035) 0 1px, transparent 1px 60px),
            linear-gradient(160deg, ${deskColor}, #3d2a1a)`,
        }}
      />
      {/* afternoon light falling across the desk */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(118deg, ${accent}42 0%, ${accent}18 26%, transparent 52%)`,
        }}
        animate={reduced ? undefined : { opacity: [0.82, 1, 0.82] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* the window's edge, blown out */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 70% 60% at 18% 8%, rgba(255,232,190,.42), transparent 60%)" }}
      />
      {/* dust in the beam */}
      {!reduced && (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {DUST.map((p, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.s,
                height: p.s,
                background: "#ffeccb",
                filter: "blur(.5px)",
              }}
              animate={{ y: [0, -260], opacity: [0, 0.7, 0], x: [0, i % 2 ? 16 : -13, 0] }}
              transition={{ duration: p.d, repeat: Infinity, delay: p.delay, ease: "linear" }}
            />
          ))}
        </div>
      )}
      {/* vignette so the desk falls off at the edges */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 80% 76% at 50% 52%, transparent 44%, rgba(24,14,6,.62))" }}
      />
    </>
  );
}

/** Coffee cup, pressed flowers — the things sitting beside the book. */
function DeskProps({ accent }: { accent: string }) {
  const reduced = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden sm:block">
      {/* coffee cup, top-right */}
      <motion.div
        className="absolute"
        style={{ right: "7%", top: "9%", width: 92 }}
        animate={reduced ? undefined : { y: [0, -3, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className="relative rounded-b-[46%] rounded-t-[8%]"
          style={{
            aspectRatio: "1 / .85",
            background: "linear-gradient(150deg,#f3ece0,#cfc3ac)",
            boxShadow: "0 16px 30px -14px rgba(20,12,4,.75)",
          }}
        >
          <div
            className="absolute inset-x-[10%] top-[8%] rounded-[50%]"
            style={{ height: "26%", background: "linear-gradient(160deg,#5b3a22,#331f10)" }}
          />
        </div>
        <div
          className="absolute rounded-full"
          style={{ right: "-14%", top: "24%", width: "30%", aspectRatio: "1", border: "7px solid #e4d8c4" }}
        />
      </motion.div>

      {/* pressed flowers, bottom-left */}
      {[
        { left: "5%", bottom: "13%", size: 44, rot: -14, delay: 0 },
        { left: "12%", bottom: "7%", size: 32, rot: 22, delay: 1.6 },
      ].map((f) => (
        <motion.svg
          key={f.left}
          viewBox="0 0 60 60"
          className="absolute"
          style={{ left: f.left, bottom: f.bottom, width: f.size, transform: `rotate(${f.rot}deg)` }}
          animate={reduced ? undefined : { rotate: [f.rot, f.rot + 4, f.rot] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: f.delay }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <ellipse
              key={i}
              cx="30"
              cy="17"
              rx="7"
              ry="13"
              fill={accent}
              opacity="0.5"
              transform={`rotate(${i * 60} 30 30)`}
            />
          ))}
          <circle cx="30" cy="30" r="5" fill="#f6e2b0" opacity="0.8" />
        </motion.svg>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The closed book, with its ribbon                                    */
/* ------------------------------------------------------------------ */

function ClosedBook({
  content,
  stage,
  onOpen,
}: {
  content: DigitalScrapbookContent;
  stage: Stage;
  onOpen: () => void;
}) {
  const reduced = useReducedMotion();
  const t = getTheme(content.theme);
  const opening = stage === "opening";
  const title = content.title || DS_FALLBACKS.title;

  return (
    <div
      className="relative"
      style={{ width: "min(420px, 78vw)", aspectRatio: "3 / 4", perspective: 1800 }}
    >
      {/* page block visible under the cover */}
      <div
        aria-hidden
        className="absolute rounded-[3px]"
        style={{
          inset: "1.5% -1.5% -1.5% 2%",
          background: `repeating-linear-gradient(to right, ${t.paper} 0 2px, ${t.paperEdge} 2px 3px)`,
          boxShadow: "0 30px 54px -26px rgba(20,12,4,.8)",
        }}
      />

      {/* the hardcover, hinged on its spine */}
      <motion.button
        type="button"
        onClick={onOpen}
        aria-label={`Open ${title}`}
        className="absolute inset-0 cursor-pointer border-0 p-0"
        style={{ transformOrigin: "left center", transformStyle: "preserve-3d", background: "transparent" }}
        animate={opening ? { rotateY: reduced ? 0 : -168 } : { rotateY: 0 }}
        transition={{ duration: reduced ? 0.3 : 1.9, ease: [0.36, 0.02, 0.22, 1] }}
        whileHover={opening || reduced ? undefined : { rotateY: -7 }}
      >
        <div
          className="relative h-full w-full overflow-hidden rounded-[4px]"
          style={{
            background: `linear-gradient(145deg, ${t.desk}, #3b2818 70%)`,
            boxShadow: "0 34px 60px -26px rgba(14,8,3,.85), inset 0 0 0 1px rgba(255,225,180,.12)",
            backfaceVisibility: "hidden",
          }}
        >
          {/* bookcloth weave */}
          <span
            aria-hidden
            className="absolute inset-0 opacity-[.5]"
            style={{
              background:
                "repeating-linear-gradient(0deg, rgba(0,0,0,.16) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(0,0,0,.16) 0 1px, transparent 1px 3px)",
            }}
          />
          <span
            aria-hidden
            className="absolute inset-0 opacity-30"
            style={{ backgroundImage: PAPER_GRAIN, mixBlendMode: "overlay" }}
          />
          {/* blind-embossed border */}
          <span
            aria-hidden
            className="absolute rounded-[2px]"
            style={{
              inset: "5%",
              border: `1px solid ${t.deskAccent}3a`,
              boxShadow: `inset 0 1px 0 rgba(0,0,0,.3), 0 1px 0 ${t.deskAccent}22`,
            }}
          />

          {content.coverImageUrl && (
            <span
              aria-hidden
              className="absolute overflow-hidden"
              style={{ inset: "13% 12% 34%", boxShadow: "0 8px 18px -8px rgba(0,0,0,.7)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={content.coverImageUrl} alt="" className="h-full w-full object-cover" />
            </span>
          )}

          <div
            className="absolute inset-x-[11%] text-center"
            style={{ bottom: content.coverImageUrl ? "20%" : "38%" }}
          >
            <div
              style={{
                fontFamily: t.titleFont,
                fontSize: "clamp(20px,4.4vw,34px)",
                lineHeight: 1.12,
                color: t.deskAccent,
                textShadow: "0 1px 0 rgba(0,0,0,.55)",
                letterSpacing: ".01em",
              }}
            >
              {title}
            </div>
            {content.subtitle && (
              <div
                className="mt-2"
                style={{ fontFamily: t.handFont, fontSize: "clamp(12px,2vw,17px)", color: "rgba(255,236,203,.72)" }}
              >
                {content.subtitle}
              </div>
            )}
          </div>

          {/* wax seal */}
          <span
            aria-hidden
            className="absolute rounded-full"
            style={{
              left: "50%",
              bottom: "11%",
              width: "17%",
              aspectRatio: "1",
              transform: "translateX(-50%)",
              background: `radial-gradient(circle at 34% 30%, #d78a5e, ${t.accent} 58%, #6d3418)`,
              boxShadow: "inset -2px -3px 6px rgba(50,20,4,.6), 0 4px 9px rgba(0,0,0,.5)",
            }}
          />

          {/* name tag, tied on */}
          {content.nameTag && (
            <span
              className="absolute flex items-center justify-center rounded-[3px]"
              style={{
                right: "7%",
                top: "8%",
                width: "31%",
                aspectRatio: "5 / 2",
                background: "#f0e2c4",
                transform: "rotate(6deg)",
                boxShadow: "0 5px 12px -5px rgba(0,0,0,.6)",
                fontFamily: t.handFont,
                fontSize: "clamp(9px,1.5vw,13px)",
                color: t.ink,
              }}
            >
              {content.nameTag}
            </span>
          )}

          {/* a tiny pressed flower on the board */}
          <svg
            aria-hidden
            viewBox="0 0 60 60"
            className="absolute"
            style={{ left: "9%", top: "10%", width: "13%", transform: "rotate(-18deg)" }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <ellipse key={i} cx="30" cy="17" rx="7" ry="13" fill={t.deskAccent} opacity="0.42" transform={`rotate(${i * 60} 30 30)`} />
            ))}
            <circle cx="30" cy="30" r="5" fill="#f6e2b0" opacity="0.62" />
          </svg>
        </div>
      </motion.button>

      {/* bookmark ribbon — slides out of the book before the cover lifts */}
      <motion.span
        aria-hidden
        className="absolute origin-top"
        style={{
          right: "16%",
          top: 0,
          width: "7%",
          height: "78%",
          background: `linear-gradient(to right, ${t.accent}, ${t.accent}c0)`,
          clipPath: "polygon(0 0, 100% 0, 100% 92%, 50% 100%, 0 92%)",
          boxShadow: "2px 0 7px -2px rgba(0,0,0,.5)",
          zIndex: 5,
        }}
        animate={
          opening
            ? { y: reduced ? 0 : "34%", rotate: reduced ? 0 : 4, opacity: reduced ? 1 : 0.9 }
            : { y: 0, rotate: 0, opacity: 1 }
        }
        transition={{ duration: reduced ? 0.2 : 1.1, ease: [0.3, 0.8, 0.25, 1] }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The last page                                                       */
/* ------------------------------------------------------------------ */

function ClosingSpread({ content, onReopen }: { content: DigitalScrapbookContent; onReopen: () => void }) {
  const reduced = useReducedMotion();
  const t = getTheme(content.theme);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const timer = setTimeout(() => setClosed(true), 7200);
    return () => clearTimeout(timer);
  }, [reduced]);

  return (
    <motion.div
      className="relative flex w-full flex-col items-center gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
    >
      <motion.div
        className="relative w-full overflow-hidden rounded-[3px]"
        style={{
          maxWidth: 1120,
          aspectRatio: "3 / 2",
          background: `linear-gradient(100deg, ${t.paperEdge}, ${t.paper} 14%)`,
          boxShadow: "0 40px 70px -34px rgba(30,18,8,.7)",
          transformOrigin: "left center",
          perspective: 1600,
        }}
        animate={closed ? { rotateY: -12, scale: 0.97 } : { rotateY: 0, scale: 1 }}
        transition={{ duration: 2.2, ease: [0.36, 0.02, 0.22, 1] }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: PAPER_GRAIN, opacity: 0.34, mixBlendMode: "multiply" }}
        />

        {/* one photograph, taped on */}
        <div
          className="absolute"
          style={{ left: "12%", top: "18%", width: "30%", transform: "rotate(-3deg)" }}
        >
          <div className="relative" style={{ padding: "4%", background: "#fffdf6", boxShadow: "0 14px 28px -14px rgba(58,40,22,.5)" }}>
            <div style={{ aspectRatio: "4 / 3", background: t.paperEdge, overflow: "hidden" }}>
              {content.closingImageUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={content.closingImageUrl} alt="" className="h-full w-full object-cover" />
              )}
            </div>
          </div>
          <span
            aria-hidden
            className="absolute"
            style={{
              left: "-8%",
              top: "-6%",
              width: "42%",
              aspectRatio: "5 / 1.5",
              background: t.tape[0],
              transform: "rotate(-14deg)",
              clipPath: "polygon(0 8%, 100% 0, 100% 92%, 0 100%)",
            }}
          />
        </div>

        {/* the note */}
        <div className="absolute" style={{ left: "50%", top: "24%", width: "38%" }}>
          <motion.p
            className="m-0"
            style={{ fontFamily: t.handFont, fontSize: "clamp(17px,2.5vw,32px)", lineHeight: 1.32, color: t.ink }}
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.3, delay: 0.6 }}
          >
            {content.closingNote || DS_FALLBACKS.closingNote}
          </motion.p>
          <motion.p
            className="m-0 mt-4"
            style={{ fontFamily: t.handFont, fontSize: "clamp(13px,1.7vw,21px)", lineHeight: 1.5, color: t.inkSoft }}
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.3, delay: 2 }}
          >
            {content.closingSubnote || DS_FALLBACKS.closingSubnote}
          </motion.p>

          {/* a fountain pen draws a small heart */}
          <svg viewBox="0 0 80 70" className="mt-5 block" style={{ width: "34%" }} aria-hidden>
            <motion.path
              d="M40 62 C 10 40, 12 14, 28 14 C 35 14, 40 22, 40 25 C 40 22, 45 14, 52 14 C 68 14, 70 40, 40 62 Z"
              fill="none"
              stroke={t.accent}
              strokeWidth="3"
              strokeLinecap="round"
              initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 3, ease: "easeInOut", delay: 3.4 }}
            />
          </svg>
        </div>

        {/* the ribbon stays visible after it closes */}
        <span
          aria-hidden
          className="absolute"
          style={{
            right: "22%",
            top: 0,
            width: "2.4%",
            height: "44%",
            background: t.accent,
            clipPath: "polygon(0 0, 100% 0, 100% 92%, 50% 100%, 0 92%)",
          }}
        />
      </motion.div>

      <button
        type="button"
        onClick={onReopen}
        className="cursor-pointer rounded-full px-6 py-3 text-[12px]"
        style={{
          fontFamily: t.titleFont,
          letterSpacing: ".12em",
          background: "rgba(253,246,230,.92)",
          border: `1px solid ${t.accent}55`,
          color: t.ink,
        }}
      >
        read it again
      </button>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */

export function DigitalScrapbookView({
  content,
  embedded = false,
}: {
  content: DigitalScrapbookContent;
  embedded?: boolean;
}) {
  const reduced = useReducedMotion();
  const t = getTheme(content.theme);
  const [stage, setStage] = useState<Stage>(embedded ? "book" : "desk");
  const [soundOn, setSoundOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  /* Tracked so it can be cancelled — a fire-and-forget timer kept running after
     the view unmounted, which matters most in the editor preview, where it is
     remounted every time the creator replays it. */
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (openTimer.current) clearTimeout(openTimer.current);
    },
    []
  );

  const open = () => {
    if (stage !== "desk") return;
    setStage("opening");
    if (content.ambientUrl && audioRef.current) {
      void audioRef.current.play().then(() => setSoundOn(true)).catch(() => setSoundOn(false));
    }
    if (openTimer.current) clearTimeout(openTimer.current);
    openTimer.current = setTimeout(() => setStage("book"), reduced ? 300 : 2000);
  };

  const toggleSound = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) void el.play().then(() => setSoundOn(true)).catch(() => undefined);
    else {
      el.pause();
      setSoundOn(false);
    }
  };

  return (
    <div
      className={`${fraunces.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable} ${gochiHand.variable} relative w-full overflow-hidden`}
      style={{ height: embedded ? "100%" : "100dvh", fontFamily: "var(--font-space-grotesk), system-ui, sans-serif" }}
      aria-label={`${content.title || DS_FALLBACKS.title} — a scrapbook`}
    >
      <SunlitDesk deskColor={t.desk} accent={t.deskAccent} />
      {!embedded && <DeskProps accent={t.deskAccent} />}

      {content.ambientUrl && (
        <audio ref={audioRef} src={content.ambientUrl} loop preload="none" className="sr-only" />
      )}

      <div className="relative z-10 flex h-full w-full items-center justify-center overflow-y-auto px-4 py-6 sm:px-8">
        <AnimatePresence mode="wait">
          {(stage === "desk" || stage === "opening") && (
            <motion.div
              key="closed"
              className="flex flex-col items-center gap-8"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.06, transition: { duration: 0.7 } }}
              transition={{ duration: 1.1, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <AnimatePresence>
                {stage === "desk" && (
                  <motion.p
                    className="m-0 max-w-md text-center"
                    style={{
                      fontFamily: t.handFont,
                      fontSize: "clamp(18px,3vw,30px)",
                      lineHeight: 1.35,
                      color: "#ffeccb",
                      textShadow: "0 2px 10px rgba(20,12,4,.7)",
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 1.6, delay: 0.7 }}
                  >
                    {content.openingNote || DS_FALLBACKS.openingNote}
                  </motion.p>
                )}
              </AnimatePresence>

              <ClosedBook content={content} stage={stage} onOpen={open} />

              {stage === "desk" && (
                <motion.span
                  className="text-[10.5px] tracking-[0.22em] uppercase"
                  style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", color: "rgba(255,236,203,.6)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.2, delay: 2.2 }}
                >
                  Tap the cover to open
                </motion.span>
              )}
            </motion.div>
          )}

          {stage === "book" && (
            <motion.div
              key="book"
              className="w-full"
              initial={{ opacity: 0, scale: 0.965 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, ease: [0.2, 0.8, 0.2, 1] }}
            >
              {content.spreads.length > 0 ? (
                <Book content={content} compact={embedded} onReachedEnd={() => setStage("closing")} />
              ) : (
                <p
                  className="m-0 text-center"
                  style={{ fontFamily: t.handFont, fontSize: 20, color: "#ffeccb" }}
                >
                  There are no pages in this scrapbook yet.
                </p>
              )}
            </motion.div>
          )}

          {stage === "closing" && (
            <ClosingSpread key="closing" content={content} onReopen={() => setStage("book")} />
          )}
        </AnimatePresence>
      </div>

      {content.ambientUrl && stage !== "desk" && (
        <button
          type="button"
          onClick={toggleSound}
          aria-label={soundOn ? "Turn ambient sound off" : "Turn ambient sound on"}
          className="absolute right-4 top-4 z-30 cursor-pointer rounded-full px-4 py-2.5 text-[10px] tracking-[0.18em] uppercase"
          style={{
            fontFamily: "var(--font-ibm-plex-mono), monospace",
            background: "rgba(28,18,8,.6)",
            border: "1px solid rgba(255,236,203,.24)",
            color: soundOn ? t.deskAccent : "rgba(255,236,203,.6)",
            backdropFilter: "blur(8px)",
          }}
        >
          {soundOn ? "♪ on" : "♪ off"}
        </button>
      )}
    </div>
  );
}
