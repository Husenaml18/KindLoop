"use client";

/**
 * The parts of *this* letter: its decorations, its tucked-in photograph, its
 * hidden fold, its margin notes, its scent. The envelope and the wax seal are
 * not here — they belong to every sealed experience, so they live in the
 * Envelope Engine and are re-exported below for the letter's own use.
 */

import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Decoration, DecorKind } from "./schema";
import { type SealColorId, type SealIconId } from "./theme";
import { WaxSeal } from "@/lib/engines/envelope";

export { Envelope, WaxSeal, type EnvelopePhase } from "@/lib/engines/envelope";

/* ------------------------------------------------------------------ */
/* Decorations laid on the page                                        */
/* ------------------------------------------------------------------ */

function DecorGlyph({ kind, color, accent }: { kind: DecorKind; color: string; accent: string }) {
  const reduced = useReducedMotion();
  const c = color || accent;

  switch (kind) {
    case "pressedFlower":
      return (
        <motion.svg viewBox="0 0 60 60" className="h-full w-full" aria-hidden whileHover={reduced ? undefined : { scale: 1.1 }}>
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <motion.ellipse
              key={a}
              cx="30" cy="17" rx="6.6" ry="12.5"
              fill={c} opacity="0.62"
              transform={`rotate(${a} 30 30)`}
              whileHover={{ ry: 14.5 }}
              transition={{ duration: 0.4 }}
            />
          ))}
          <circle cx="30" cy="30" r="5" fill={c} opacity="0.9" />
        </motion.svg>
      );
    case "petal":
      return (
        <motion.svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden animate={reduced ? undefined : { rotate: [0, 7, -5, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}>
          <path d="M20 4 C 32 14, 32 28, 20 36 C 8 28, 8 14, 20 4 Z" fill={c} opacity="0.58" />
        </motion.svg>
      );
    case "waxStain":
      return (
        <span
          aria-hidden
          className="block h-full w-full"
          style={{
            borderRadius: "48% 52% 44% 56% / 52% 46% 54% 48%",
            background: `radial-gradient(circle at 36% 32%, ${c}, ${c}bb 60%, ${c}77)`,
            boxShadow: "inset -1px -2px 4px rgba(0,0,0,.4)",
          }}
        />
      );
    case "coffeeStain":
      return (
        <span
          aria-hidden
          className="block h-full w-full"
          style={{
            borderRadius: "48% 52% 44% 56% / 52% 46% 54% 48%",
            mixBlendMode: "multiply",
            background: `radial-gradient(circle, transparent 54%, rgba(122,84,46,.22) 59%, rgba(104,70,38,.32) 65%, rgba(122,84,46,.15) 71%, transparent 77%)`,
          }}
        />
      );
    case "doodle":
      return (
        <svg viewBox="0 0 60 60" className="h-full w-full" aria-hidden>
          <motion.path
            d="M8 40 C 8 16, 46 14, 46 33 C 46 45, 22 47, 22 32 C 22 24, 35 24, 35 31"
            fill="none" stroke={c} strokeWidth="2.4" strokeLinecap="round" opacity="0.72"
            initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </svg>
      );
    case "heart":
      return (
        <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden>
          <path d="M20 33 C 6 23, 7 11, 14.5 11 C 18 11, 20 15, 20 16.5 C 20 15, 22 11, 25.5 11 C 33 11, 34 23, 20 33 Z" fill={c} opacity="0.8" />
        </svg>
      );
    case "star":
      return (
        <motion.span
          aria-hidden
          className="block text-center leading-none"
          style={{ color: c, fontSize: "1em" }}
          animate={reduced ? undefined : { opacity: [0.4, 1, 0.4], scale: [0.9, 1.15, 0.9] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        >
          ✦
        </motion.span>
      );
    case "ribbon":
      return (
        <motion.span
          aria-hidden
          className="block h-full w-full origin-top"
          style={{
            background: `linear-gradient(to right, ${c}, ${c}bb)`,
            clipPath: "polygon(0 0, 100% 0, 100% 90%, 50% 100%, 0 90%)",
          }}
          animate={reduced ? undefined : { rotate: [0, 1.4, -1.4, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
      );
    case "sticker":
      return (
        <span
          aria-hidden
          className="flex h-full w-full items-center justify-center rounded-full"
          style={{ background: c, boxShadow: "0 3px 7px rgba(40,26,12,.35)", color: "#fff", fontSize: ".7em" }}
        >
          ♥
        </span>
      );
    case "bookmark":
      return (
        <span
          aria-hidden
          className="block h-full w-full"
          style={{ background: c, clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 84%, 0 100%)" }}
        />
      );
    case "stamp":
      return (
        <span
          aria-hidden
          className="flex h-full w-full items-center justify-center"
          style={{
            background: `${c}22`,
            border: `1.5px dashed ${c}88`,
            color: `${c}cc`,
            fontFamily: "var(--font-ibm-plex-mono), monospace",
            fontSize: ".42em",
            letterSpacing: ".1em",
          }}
        >
          POSTE
        </span>
      );
    case "clip":
      return (
        <svg viewBox="0 0 20 48" className="h-full w-full" aria-hidden>
          <path d="M6 42 L6 10 A4 4 0 0 1 14 10 L14 38 A3 3 0 0 0 8 38 L8 14" fill="none" stroke={c} strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      );
    case "leaf":
      return (
        <motion.svg viewBox="0 0 40 60" className="h-full w-full" aria-hidden animate={reduced ? undefined : { rotate: [0, -4, 4, 0] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}>
          <path d="M20 2 C 36 18, 36 42, 20 58 C 4 42, 4 18, 20 2 Z" fill={c} opacity="0.55" />
          <path d="M20 6 L20 54" stroke={c} strokeWidth="1" opacity="0.5" />
        </motion.svg>
      );
    case "botanical":
      return (
        <svg viewBox="0 0 100 60" className="h-full w-full" aria-hidden>
          <path d="M6 54 C 30 46, 52 30, 94 8" fill="none" stroke={c} strokeWidth="1.6" opacity="0.55" />
          {[0.2, 0.36, 0.52, 0.68, 0.84].map((t, i) => {
            const x = 6 + (94 - 6) * t;
            const y = 54 - (54 - 8) * t;
            return (
              <g key={i}>
                <ellipse cx={x} cy={y - 6} rx="7" ry="3.4" fill={c} opacity="0.4" transform={`rotate(-32 ${x} ${y - 6})`} />
                <ellipse cx={x} cy={y + 6} rx="7" ry="3.4" fill={c} opacity="0.4" transform={`rotate(32 ${x} ${y + 6})`} />
              </g>
            );
          })}
        </svg>
      );
    default:
      return null;
  }
}

export function DecorationView({
  decor,
  accent,
  delay = 0,
}: {
  decor: Decoration;
  accent: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      className="pointer-events-auto absolute"
      style={{
        left: `${decor.x}%`,
        top: `${decor.y}%`,
        width: `${decor.w}%`,
        translateX: "-50%",
        translateY: "-50%",
        rotate: decor.rotate,
      }}
      initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, delay, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <DecorGlyph kind={decor.kind} color={decor.color} accent={accent} />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Page extras                                                         */
/* ------------------------------------------------------------------ */

/** A polaroid tucked between paragraphs; grows when you look at it. */
export function PhotoMemory({
  imageUrl,
  caption,
  handFamily,
  ink,
}: {
  imageUrl: string;
  caption: string;
  handFamily: string;
  ink: string;
}) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={caption ? `Photo: ${caption}` : "A photo"}
        className="my-4 block cursor-pointer border-0 bg-transparent p-0"
        style={{ width: "min(200px, 52%)" }}
        initial={reduced ? undefined : { opacity: 0, y: 10, rotate: -2.5 }}
        animate={{ opacity: 1, y: 0, rotate: -2.5 }}
        transition={{ duration: 0.9 }}
        whileHover={reduced ? undefined : { scale: 1.05, rotate: 0 }}
      >
        <span
          className="block"
          style={{ padding: "6% 6% 16%", background: "#fffdf6", boxShadow: "0 12px 26px -12px rgba(40,26,12,.5)" }}
        >
          <span className="block overflow-hidden" style={{ aspectRatio: "1", background: "#dcd2c0" }}>
            {imageUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={imageUrl} alt={caption} className="h-full w-full object-cover" />
            )}
          </span>
          {caption && (
            <span
              className="mt-[6%] block text-center"
              style={{ fontFamily: handFamily, fontSize: 14, color: ink }}
            >
              {caption}
            </span>
          )}
        </span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center p-6"
            style={{ background: "rgba(30,20,10,.78)", backdropFilter: "blur(4px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={caption || "Photo"}
              className="relative w-full max-w-md"
              style={{ padding: "4% 4% 12%", background: "#fffdf6", boxShadow: "0 40px 80px -30px rgba(0,0,0,.8)" }}
              initial={{ scale: 0.88, opacity: 0, rotate: -2 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.2, 0.85, 0.2, 1] }}
              onClick={(ev) => ev.stopPropagation()}
            >
              <div className="overflow-hidden" style={{ aspectRatio: "1", background: "#dcd2c0" }}>
                {imageUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={imageUrl} alt={caption} className="h-full w-full object-cover" />
                )}
              </div>
              {caption && (
                <p className="m-0 mt-3 text-center" style={{ fontFamily: handFamily, fontSize: 19, color: ink }}>
                  {caption}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/** A creased section that stays folded until it's opened. */
export function HiddenFold({
  label,
  children,
  paperColor,
  ink,
  handFamily,
}: {
  label: string;
  children: React.ReactNode;
  paperColor: string;
  ink: string;
  handFamily: string;
}) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);

  return (
    <div className="my-5" style={{ perspective: 900 }}>
      <AnimatePresence initial={false} mode="wait">
        {!open ? (
          <motion.button
            key="folded"
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={false}
            className="block w-full cursor-pointer border-0 p-0 text-left"
            exit={reduced ? { opacity: 0 } : { rotateX: -80, opacity: 0, transformOrigin: "top center" }}
            transition={{ duration: 0.5 }}
          >
            <span
              className="relative flex items-center justify-between gap-3 px-4 py-3"
              style={{
                background: `linear-gradient(176deg, ${paperColor}, rgba(0,0,0,.05))`,
                borderTop: `1px solid ${ink}22`,
                borderBottom: `1px solid ${ink}22`,
                boxShadow: `inset 0 6px 10px -8px ${ink}55, inset 0 -6px 10px -8px ${ink}55`,
              }}
            >
              <span style={{ fontFamily: handFamily, fontSize: 17, color: `${ink}cc` }}>
                {label || "there's more folded under here"}
              </span>
              <motion.span
                aria-hidden
                style={{ color: `${ink}88`, fontSize: 12 }}
                animate={reduced ? undefined : { y: [0, 2.5, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              >
                ▾ unfold
              </motion.span>
            </span>
          </motion.button>
        ) : (
          <motion.div
            key="unfolded"
            initial={reduced ? { opacity: 0 } : { rotateX: -84, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            transition={{ duration: 1.15, ease: [0.2, 0.85, 0.2, 1] }}
            style={{ transformOrigin: "top center" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** A thought pencilled into the margin. */
export function MarginNoteView({
  text,
  y,
  side,
  handFamily,
  ink,
  delay,
}: {
  text: string;
  y: number;
  side: "left" | "right";
  handFamily: string;
  ink: string;
  delay: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.span
      className="pointer-events-none absolute hidden lg:block"
      style={{
        top: `${y}%`,
        [side]: "-19%",
        width: "17%",
        fontFamily: handFamily,
        fontSize: 15,
        lineHeight: 1.45,
        color: `${ink}b0`,
        transform: `rotate(${side === "left" ? -4 : 4}deg)`,
      }}
      initial={reduced ? { opacity: 0 } : { opacity: 0, x: side === "left" ? 10 : -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1.1, delay }}
    >
      {text}
    </motion.span>
  );
}

/** Scent, as drifting particles rather than a claim we can't keep. */
export function ScentParticles({ color, glyph }: { color: string; glyph: string }) {
  const reduced = useReducedMotion();
  if (reduced || !glyph) return null;
  const seeds = [
    { x: 12, d: 15, delay: 0 },
    { x: 30, d: 19, delay: 3.4 },
    { x: 52, d: 17, delay: 6.8 },
    { x: 71, d: 21, delay: 1.8 },
    { x: 88, d: 18, delay: 9.2 },
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {seeds.map((s, i) => (
        <motion.span
          key={i}
          className="absolute"
          style={{ left: `${s.x}%`, bottom: "-4%", color, fontSize: 13, opacity: 0 }}
          animate={{ y: [0, -420], opacity: [0, 0.5, 0], x: [0, i % 2 ? 26 : -22, 0] }}
          transition={{ duration: s.d, repeat: Infinity, delay: s.delay, ease: "linear" }}
        >
          {glyph}
        </motion.span>
      ))}
    </div>
  );
}

/** Voice note: the seal pressed onto the page, which plays when clicked. */
export function VoiceSeal({
  url,
  sealColor,
  sealIcon,
  monogram,
  handFamily,
  ink,
}: {
  url: string;
  sealColor: SealColorId;
  sealIcon: SealIconId;
  monogram: string;
  handFamily: string;
  ink: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const el = audioRef.current;
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
    <div className="my-6 flex items-center gap-4">
      <WaxSeal
        colorId={sealColor}
        icon={sealIcon}
        monogram={monogram}
        size={62}
        glowOnHover
        playing={playing}
        onClick={toggle}
        ariaLabel={playing ? "Pause the recording" : "Press the seal to hear it read aloud"}
      />
      <span style={{ fontFamily: handFamily, fontSize: 16, color: `${ink}c0` }}>
        {playing ? "listening…" : "press the seal to hear me read it"}
      </span>
      {url && <audio ref={audioRef} src={url} preload="none" className="sr-only" onEnded={() => setPlaying(false)} />}
    </div>
  );
}
