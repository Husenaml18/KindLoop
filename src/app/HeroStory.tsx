"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Transition } from "framer-motion";
import { cssStyle } from "@/lib/uiStyle";
import { TemplateArt } from "./TemplateArt";
import { HERO_MEMORIES, MemoryProp, type HeroMemory } from "./heroMemories";

/** Weighty spring with realistic damping and only a very small overshoot. */
const MORPH_SPRING: Transition = { type: "spring", stiffness: 170, damping: 24, mass: 1 };

export type Phase = "closed" | "shimmer" | "crack" | "break" | "open" | "emerge";

const PHASE_AT: [Phase, number][] = [
  ["shimmer", 700],
  ["crack", 1200],
  ["break", 1650],
  ["open", 2150],
  ["emerge", 2650],
];

export function useEnvelopeSequence(): Phase {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("closed");

  useEffect(() => {
    if (reduced) {
      const t = setTimeout(() => setPhase("emerge"), 0);
      return () => clearTimeout(t);
    }
    const timers = PHASE_AT.map(([p, ms]) => setTimeout(() => setPhase(p), ms));
    return () => timers.forEach(clearTimeout);
  }, [reduced]);

  return phase;
}

/* Fixed (not random) so server and client markup always agree. */
const DUST = [
  { x: 8, y: 72, s: 3, d: 11, delay: 0 },
  { x: 22, y: 88, s: 2, d: 14, delay: 1.8 },
  { x: 35, y: 64, s: 2.5, d: 12.5, delay: 3.4 },
  { x: 47, y: 92, s: 2, d: 15.5, delay: 0.9 },
  { x: 58, y: 70, s: 3, d: 13, delay: 2.6 },
  { x: 69, y: 86, s: 2, d: 16, delay: 4.2 },
  { x: 78, y: 66, s: 2.5, d: 12, delay: 1.3 },
  { x: 89, y: 90, s: 2, d: 14.5, delay: 3.1 },
  { x: 15, y: 55, s: 2, d: 17, delay: 5 },
  { x: 63, y: 52, s: 2.5, d: 15, delay: 2.1 },
  { x: 41, y: 46, s: 2, d: 18, delay: 6.1 },
  { x: 84, y: 48, s: 2, d: 13.5, delay: 4.7 },
];

function AmbientDust() {
  const reduced = useReducedMotion();
  if (reduced) return null;
  return (
    <div aria-hidden style={cssStyle("position:absolute;inset:0;pointer-events:none;overflow:hidden")}>
      {DUST.map((p, i) => (
        <motion.span
          key={i}
          animate={{ y: [0, -230], opacity: [0, 0.75, 0], x: [0, i % 2 ? 14 : -12, 0] }}
          transition={{ duration: p.d, repeat: Infinity, delay: p.delay, ease: "linear" }}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.s,
            height: p.s,
            borderRadius: "50%",
            background: "var(--brass-bright)",
            filter: "blur(.4px)",
          }}
        />
      ))}
    </div>
  );
}

/* Wax fragments that break away from the seal. */
const FRAGMENTS = [
  { x: -26, y: 12, r: -48, s: 7 },
  { x: 22, y: 18, r: 62, s: 6 },
  { x: -14, y: 30, r: 24, s: 5 },
  { x: 30, y: -6, r: -30, s: 5.5 },
  { x: 2, y: 34, r: 80, s: 4.5 },
];

function Envelope({ phase }: { phase: Phase }) {
  const reduced = useReducedMotion();
  const lifted = phase === "break" || phase === "open" || phase === "emerge";
  const opened = phase === "open" || phase === "emerge";
  const sealGone = lifted;

  return (
    <div style={cssStyle("position:absolute;left:50%;top:50%;width:224px;height:152px;margin-left:-112px;margin-top:-76px;z-index:2")}>
      {/* warm light spilling out, softly lighting everything nearby */}
      <motion.div
        aria-hidden
        animate={{ opacity: opened ? 1 : 0, scale: opened ? 1 : 0.6 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
        style={{
          position: "absolute",
          inset: -130,
          borderRadius: "50%",
          pointerEvents: "none",
          filter: "blur(34px)",
          background: "radial-gradient(circle, rgba(232,163,61,.62), rgba(217,138,104,.24) 45%, transparent 72%)",
        }}
      />
      {/* volumetric shaft rising from the mouth */}
      <motion.div
        aria-hidden
        animate={{ opacity: opened ? 0.5 : 0, scaleY: opened ? 1 : 0.4 }}
        transition={{ duration: 1.6, ease: "easeOut" }}
        style={{
          position: "absolute",
          left: "50%",
          bottom: "48%",
          width: 150,
          height: 210,
          marginLeft: -75,
          transformOrigin: "50% 100%",
          pointerEvents: "none",
          filter: "blur(16px)",
          clipPath: "polygon(38% 100%, 62% 100%, 96% 0%, 4% 0%)",
          background: "linear-gradient(to top, rgba(232,163,61,.5), transparent 78%)",
        }}
      />

      <motion.div
        animate={{ y: lifted ? -7 : 0 }}
        transition={{ duration: 1.1, ease: [0.2, 0.8, 0.2, 1] }}
        style={{ position: "absolute", inset: 0, perspective: 700 }}
      >
        {/* body */}
        <div
          style={cssStyle(
            "position:absolute;inset:0;border-radius:5px;background:linear-gradient(160deg,var(--paper),var(--paper-muted));box-shadow:0 26px 52px -20px rgba(30,20,12,.42)"
          )}
        />
        {/* inner shadow at the mouth, so the glow reads as coming from inside */}
        <motion.div
          aria-hidden
          animate={{ opacity: opened ? 1 : 0 }}
          transition={{ duration: 1.2 }}
          style={cssStyle(
            "position:absolute;left:6px;right:6px;top:8px;height:56px;border-radius:4px;background:linear-gradient(to bottom,rgba(232,163,61,.55),transparent)"
          )}
        />
        {/* the two lower folds */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 5,
            background: "linear-gradient(215deg, transparent 49.4%, rgba(43,32,19,.07) 50%)",
          }}
        />
        {/* flap — hinges open on its top edge */}
        <motion.div
          animate={{ rotateX: opened ? -158 : 0 }}
          transition={{ duration: reduced ? 0 : 1.35, ease: [0.22, 0.9, 0.24, 1] }}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: 84,
            transformOrigin: "50% 0%",
            transformStyle: "preserve-3d",
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            background: "linear-gradient(170deg, var(--paper), var(--paper-muted))",
            boxShadow: "0 3px 9px rgba(30,20,12,.16)",
            zIndex: 3,
          }}
        />

        {/* wax seal */}
        <AnimatePresence>
          {!sealGone && (
            <motion.div
              key="seal"
              exit={{ scale: 0.55, opacity: 0 }}
              animate={{
                scale: phase === "crack" ? 1.07 : 1,
                rotate: phase === "crack" ? -2 : 0,
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{
                position: "absolute",
                left: "50%",
                top: 68,
                width: 42,
                height: 42,
                marginLeft: -21,
                marginTop: -21,
                borderRadius: "50%",
                zIndex: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "radial-gradient(circle at 34% 28%, #d9a45c, #b5772e 52%, #7c4a18)",
                boxShadow: "inset -2px -3px 6px rgba(60,30,8,.5), inset 2px 3px 5px rgba(255,235,190,.4), 0 5px 12px rgba(30,20,12,.4)",
                overflow: "hidden",
              }}
            >
              <span style={{ fontSize: 15, color: "rgba(70,36,8,.62)" }}>♥</span>
              {/* shimmer sweeping across the wax */}
              <motion.div
                aria-hidden
                animate={
                  phase === "shimmer" || phase === "crack"
                    ? { x: ["-130%", "130%"] }
                    : { x: "-130%" }
                }
                transition={
                  phase === "shimmer" || phase === "crack"
                    ? { duration: 1.1, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0 }
                }
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(72deg, transparent 38%, rgba(255,245,214,.72) 50%, transparent 62%)",
                }}
              />
              {/* hairline crack */}
              <motion.svg
                aria-hidden
                viewBox="0 0 42 42"
                initial={false}
                animate={{ opacity: phase === "crack" ? 1 : 0 }}
                transition={{ duration: 0.35 }}
                style={{ position: "absolute", inset: 0 }}
              >
                <motion.path
                  d="M11 13 L20 21 L16 29 L29 33"
                  fill="none"
                  stroke="rgba(58,28,6,.75)"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: phase === "crack" ? 1 : 0 }}
                  transition={{ duration: 0.45, ease: "easeInOut" }}
                />
              </motion.svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* fragments spinning away as the seal gives */}
        {!reduced &&
          FRAGMENTS.map((f, i) => (
            <motion.div
              key={i}
              aria-hidden
              initial={false}
              animate={
                sealGone
                  ? { x: f.x, y: f.y, rotate: f.r, opacity: 0 }
                  : { x: 0, y: 0, rotate: 0, opacity: 0 }
              }
              transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.045 }}
              style={{
                position: "absolute",
                left: "50%",
                top: 68,
                width: f.s,
                height: f.s * 0.85,
                marginLeft: -f.s / 2,
                borderRadius: 1.5,
                zIndex: 4,
                background: "linear-gradient(140deg, #c98f45, #8a5620)",
              }}
            />
          ))}
      </motion.div>
    </div>
  );
}

/* Small keepsakes that drift out alongside the templates — not interactive,
   just texture. Each has its own drift so nothing moves in lockstep. */
const TRINKETS = [
  { g: "✦", place: "left:17%;top:11%", size: 15, from: { x: 110, y: 120 }, dur: 6.4, y: 12, rot: 22, delay: 0.2, emerge: 0.3 },
  { g: "✦", place: "right:25%;top:23%", size: 11, from: { x: -90, y: 110 }, dur: 7.8, y: 9, rot: -18, delay: 1.1, emerge: 0.5 },
  { g: "✦", place: "left:45%;bottom:13%", size: 13, from: { x: 20, y: -60 }, dur: 6.9, y: 14, rot: 26, delay: 2.2, emerge: 0.7 },
  { g: "✦", place: "right:9%;bottom:36%", size: 10, from: { x: -70, y: -40 }, dur: 8.6, y: 11, rot: -24, delay: 3, emerge: 0.9 },
  { g: "❤", place: "left:36%;top:16%", size: 13, from: { x: 60, y: 100 }, dur: 9.2, y: 18, rot: 14, delay: 0.7, emerge: 0.45 },
  { g: "❤", place: "right:33%;bottom:22%", size: 10, from: { x: -50, y: -70 }, dur: 10.4, y: 15, rot: -12, delay: 2.6, emerge: 1.05 },
  { g: "🌸", place: "left:29%;top:34%", size: 16, from: { x: 70, y: 60 }, dur: 11.5, y: 13, rot: 20, delay: 1.5, emerge: 0.6 },
  { g: "🌸", place: "right:29%;top:44%", size: 13, from: { x: -60, y: 30 }, dur: 12.8, y: 16, rot: -16, delay: 3.4, emerge: 0.8 },
  { g: "🌿", place: "left:11%;bottom:26%", size: 15, from: { x: 90, y: -80 }, dur: 13.6, y: 12, rot: 18, delay: 2, emerge: 1.15 },
];

function Trinkets({ emerged }: { emerged: boolean }) {
  const reduced = useReducedMotion();
  return (
    <div aria-hidden style={cssStyle("position:absolute;inset:0;pointer-events:none;z-index:4")}>
      {TRINKETS.map((t, i) => (
        <div key={i} style={cssStyle(`position:absolute;${t.place}`)}>
          <motion.div
            initial={false}
            animate={emerged ? { x: 0, y: 0, scale: 1, opacity: 1 } : { x: t.from.x, y: t.from.y, scale: 0.1, opacity: 0 }}
            transition={{ type: "spring", stiffness: 58, damping: 15, mass: 1, delay: emerged ? t.emerge : 0 }}
          >
            <motion.span
              animate={
                emerged && !reduced
                  ? { y: [0, -t.y, 0], rotate: [0, t.rot, 0], opacity: [0.55, 1, 0.55] }
                  : { y: 0, rotate: 0, opacity: 0.85 }
              }
              transition={{ duration: t.dur, repeat: Infinity, ease: "easeInOut", delay: t.delay }}
              style={{
                display: "block",
                fontSize: t.size,
                color: t.g === "❤" ? "var(--rust-light)" : "var(--brass-bright)",
                filter: "drop-shadow(0 3px 5px rgba(30,20,12,.2))",
              }}
            >
              {t.g}
            </motion.span>
          </motion.div>
        </div>
      ))}
    </div>
  );
}

function Tooltip({ memory, show }: { memory: HeroMemory; show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.96 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          style={{
            position: "absolute",
            left: "50%",
            bottom: "calc(100% + 12px)",
            transform: "translateX(-50%)",
            zIndex: 20,
            pointerEvents: "none",
            whiteSpace: "nowrap",
            padding: "8px 13px",
            borderRadius: 8,
            background: "var(--deep2)",
            boxShadow: "0 14px 28px -12px rgba(30,20,12,.6)",
            textAlign: "center",
          }}
        >
          <div style={cssStyle("font-family:var(--font-fraunces),serif;font-size:14px;color:var(--on-dark)")}>
            {memory.name}
          </div>
          <div style={cssStyle("margin-top:2px;font-family:var(--font-ibm-plex-mono),monospace;font-size:8.5px;letter-spacing:.1em;color:var(--brass-bright)")}>
            {memory.available ? "OPEN TEMPLATE →" : "COMING SOON"}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** The floating form, living in the hero stage. */
function FloatingMemory({
  memory,
  photos,
  emerged,
  hovered,
  onHover,
}: {
  memory: HeroMemory;
  photos: string[];
  emerged: boolean;
  hovered: boolean;
  onHover: (id: string | null) => void;
}) {
  const reduced = useReducedMotion();

  /*
   * Still while you are pointing at it.
   *
   * These drift on an infinite loop, and a drifting object under a stationary
   * cursor crosses its own edge over and over — every crossing is another
   * mouseenter/mouseleave pair, which is what made the tooltip strobe. Settling
   * on hover fixes the flicker and is the better behaviour anyway: you reach for
   * something and it stops moving.
   */
  const floatAnim =
    emerged && !reduced && !hovered
      ? {
          y: [0, -memory.float.y, 0],
          rotate: [memory.rotate, memory.rotate + memory.float.rot, memory.rotate],
        }
      : { y: 0, rotate: memory.rotate };

  return (
    /*
     * The hover is decided here, on the one box in this stack that does not
     * animate. Everything inside it floats, springs and scales; asking a moving,
     * resizing target whether the pointer is inside it is asking a question whose
     * answer changes sixty times a second.
     */
    <div
      onPointerEnter={() => onHover(memory.id)}
      onPointerLeave={() => onHover(null)}
      style={{
        ...cssStyle(`position:absolute;${memory.place}`),
        zIndex: hovered ? 15 : 5,
        transform: `translate3d(calc(var(--mx, 0px) * ${memory.depth}), calc(var(--my, 0px) * ${memory.depth}), 0)`,
        transition: "transform .5s cubic-bezier(.2,.8,.2,1)",
      }}
    >
      <motion.div
        initial={false}
        animate={
          emerged
            ? { x: 0, y: 0, scale: 1, opacity: 1 }
            : { x: memory.from.x, y: memory.from.y, scale: 0.18, opacity: 0 }
        }
        transition={{
          type: "spring",
          stiffness: 62,
          damping: 15,
          mass: 1.1,
          delay: emerged ? memory.emergeDelay : 0,
        }}
      >
        <motion.div animate={floatAnim} transition={{ duration: memory.float.dur, repeat: Infinity, ease: "easeInOut", delay: memory.float.delay }}>
          <Link
            href={memory.href}
            onFocus={() => onHover(memory.id)}
            onBlur={() => onHover(null)}
            aria-label={`${memory.name} template`}
            style={{ display: "block", position: "relative" }}
          >
            <Tooltip memory={memory} show={hovered} />
            <motion.div
              layoutId={`memory-${memory.id}`}
              animate={{
                scale: hovered ? 1.07 : 1,
                boxShadow: hovered
                  ? "0 34px 62px -24px rgba(30,20,12,.55)"
                  : "0 22px 44px -26px rgba(30,20,12,.36)",
              }}
              transition={MORPH_SPRING}
              style={{ borderRadius: 6, position: "relative" }}
            >
              <MemoryProp memory={memory} photos={photos} hovered={hovered} />
            </motion.div>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

/**
 * The settled form, living in the Templates grid.
 *
 * It used to carry the hero prop's `layoutId`, on the theory that the same object
 * flies down the page and lands here. In practice the two are a whole viewport
 * apart: by the time the grid mounts, its counterpart has scrolled away, so there
 * is nothing to morph *from* and Framer simply drops each card into place. That
 * pop is what the section looked like on the way in. It fades and focuses now
 * instead — see `AssembledMemories`.
 */
function MemoryCard({ memory, photos }: { memory: HeroMemory; photos: string[] }) {
  return (
    <Link href={memory.href} style={{ display: "block", height: "100%" }}>
      <motion.div
        whileHover={{ y: -5 }}
        transition={MORPH_SPRING}
        style={{
          borderRadius: 12,
          overflow: "hidden",
          background: "var(--paper)",
          border: "1px solid rgba(43,38,32,.1)",
          boxShadow: "0 22px 44px -26px rgba(30,20,12,.36)",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={cssStyle("position:relative;aspect-ratio:5 / 4;overflow:hidden")}>
          <TemplateArt
            id={memory.id}
            alt={`${memory.name} — ${memory.blurb}`}
            photos={photos}
            photoIndex={memory.photoIndex}
            dim={!memory.available}
          />
          <div
            style={cssStyle(
              "position:absolute;left:9px;top:9px;padding:3px 9px;border-radius:999px;font-family:var(--font-ibm-plex-mono),monospace;font-size:9px;letter-spacing:.06em;text-transform:uppercase;background:rgba(23,18,14,.75);color:var(--paper)"
            )}
          >
            {memory.available ? "Available now" : "Coming soon"}
          </div>
        </div>
        <div style={cssStyle("padding:14px 15px 16px;display:flex;flex-direction:column;gap:6px;flex:1")}>
          <div style={cssStyle("font-family:var(--font-fraunces),serif;font-size:18px;color:var(--ink)")}>
            {memory.name}
          </div>
          <p style={cssStyle("margin:0;font-size:13px;line-height:1.5;color:var(--ink-muted);flex:1")}>
            {memory.blurb}
          </p>
          <span style={cssStyle("font-family:var(--font-ibm-plex-mono),monospace;font-size:9.5px;letter-spacing:.1em;color:var(--rust)")}>
            {memory.available ? "OPEN TEMPLATE →" : "IN THE WORKSHOP"}
          </span>
        </div>
      </motion.div>
    </Link>
  );
}

export function HeroStage({
  photos,
  phase,
  assembled,
}: {
  photos: string[];
  phase: Phase;
  assembled: boolean;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const reduced = useReducedMotion();
  const emerged = phase === "emerge";

  /* Cursor parallax + a whisper of perspective, driven through CSS vars so
     pointer movement never triggers a React render. */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || reduced) return;

    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      targetX = ((e.clientX - (r.left + r.width / 2)) / r.width) * 34;
      targetY = ((e.clientY - (r.top + r.height / 2)) / r.height) * 26;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const tick = () => {
      x += (targetX - x) * 0.07;
      y += (targetY - y) * 0.07;
      stage.style.setProperty("--mx", `${x.toFixed(2)}px`);
      stage.style.setProperty("--my", `${y.toFixed(2)}px`);
      stage.style.setProperty("--rx", `${(-y * 0.05).toFixed(3)}deg`);
      stage.style.setProperty("--ry", `${(x * 0.05).toFixed(3)}deg`);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [reduced]);

  return (
    <div
      ref={stageRef}
      style={{
        position: "relative",
        height: 620,
        transformStyle: "preserve-3d",
        transform: "perspective(1100px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))",
      }}
    >
      <AmbientDust />
      <Envelope phase={phase} />
      {!assembled && <Trinkets emerged={emerged} />}

      {/* Objects live here until the Templates section claims them. */}
      {!assembled &&
        HERO_MEMORIES.map((m) => (
          <FloatingMemory
            key={m.id}
            memory={m}
            photos={photos}
            emerged={emerged}
            hovered={hoveredId === m.id}
            onHover={setHoveredId}
          />
        ))}

      <motion.div
        aria-hidden
        animate={{ opacity: emerged && !assembled ? 1 : 0 }}
        transition={{ duration: 0.8, delay: emerged ? 1.1 : 0 }}
        style={cssStyle(
          "position:absolute;left:28%;top:-10%;font-family:var(--font-gochi),cursive;font-size:22px;color:var(--khaki);transform:rotate(-3deg)"
        )}
      >
        made in one evening ↘
      </motion.div>
    </div>
  );
}

/**
 * The Templates grid, coming into focus.
 *
 * This used to be gated on a single boolean: cross a scroll threshold and every
 * card mounted at once, which is exactly the jump it looked like. The cards are
 * always in the document now, and each one develops in place as it comes into
 * view — out of focus and slightly small, then sharp and settled, one after
 * another down the grid.
 *
 * Blur rather than a plain fade because of what these are. Every card is a
 * photograph, and a photograph arriving is a photograph coming into focus; the
 * page is already full of paper and ink and this is the one thing on it that
 * behaves like a lens.
 */
export function AssembledMemories({ photos }: { photos: string[] }) {
  const reduced = useReducedMotion();

  return (
    <div
      style={cssStyle(
        "display:grid;grid-template-columns:repeat(auto-fill,minmax(232px,1fr));gap:18px"
      )}
    >
      {HERO_MEMORIES.map((m, i) => (
        <motion.div
          key={m.id}
          style={{ minHeight: 360 }}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 26, scale: 0.97, filter: "blur(9px)" }}
          whileInView={
            reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
          }
          /* Once, and off a small sliver of the card: re-running every time the
             grid passes the fold would turn a first impression into a tic, and
             waiting for the whole card means the last row never fires on a short
             screen. */
          viewport={{ once: true, amount: 0.15, margin: "0px 0px -40px 0px" }}
          transition={{
            duration: reduced ? 0.25 : 0.72,
            delay: reduced ? 0 : (i % 4) * 0.09,
            ease: [0.2, 0.8, 0.2, 1],
          }}
        >
          <MemoryCard memory={m} photos={photos} />
        </motion.div>
      ))}
    </div>
  );
}
