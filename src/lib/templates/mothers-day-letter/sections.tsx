"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { GARDEN, DISPLAY_FONT, MONO_FONT, type Hand, type SealColourId } from "./theme";
import { SEAL_COLOURS } from "./theme";
import type { Decor, Lesson, Polaroid, Thanks } from "./schema";

/**
 * The parts of the letter that are not the letter: the cards, the pinned notes,
 * the framed photograph, the voice seal and everything laid on the paper.
 *
 * All drawn. A Mother's Day letter decorated with stock clip-art would be exactly
 * the greeting card this is supposed to replace.
 */

/* ------------------------------------------------------------------ */
/* Decorations                                                        */
/* ------------------------------------------------------------------ */

/** The twelve things that can be laid on the page, each drawn. */
export function Decoration({ decor, ink }: { decor: Decor; ink: string }) {
  const reduced = useReducedMotion();
  const sway = reduced
    ? {}
    : { rotate: [decor.rotate - 1.4, decor.rotate + 1.4, decor.rotate - 1.4] };

  const art = () => {
    switch (decor.kind) {
      case "babysBreath":
        return (
          <svg viewBox="0 0 60 60" className="h-full w-full">
            <path d="M30 58 L30 30 M30 40 C 22 36, 18 28, 20 22 M30 44 C 38 40, 43 32, 41 26" stroke={GARDEN.stem} strokeWidth="1.1" fill="none" strokeLinecap="round" />
            {[[20, 20], [41, 24], [30, 14], [24, 30], [37, 34], [30, 24], [16, 26], [46, 30]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={1.8 + (i % 2) * 0.8} fill="#fdfaf2" stroke={GARDEN.leaf} strokeWidth="0.5" />
            ))}
          </svg>
        );
      case "lavender":
        return (
          <svg viewBox="0 0 60 60" className="h-full w-full">
            <path d="M30 58 L30 22" stroke={GARDEN.stemDeep} strokeWidth="1.3" fill="none" strokeLinecap="round" />
            {Array.from({ length: 7 }).map((_, i) => (
              <ellipse key={i} cx={30 + (i % 2 ? 3.4 : -3.4)} cy={20 - i * 2.6 + 8} rx="3" ry="4" fill={GARDEN.bloomD} opacity="0.72" />
            ))}
            <ellipse cx="30" cy="10" rx="2.6" ry="4" fill={GARDEN.bloomD} opacity="0.8" />
          </svg>
        );
      case "pressedFlower":
        return (
          <svg viewBox="0 0 60 60" className="h-full w-full">
            <path d="M30 58 L30 34" stroke={GARDEN.stemDeep} strokeWidth="1.2" fill="none" />
            <ellipse cx="22" cy="44" rx="7" ry="3" fill={GARDEN.leaf} opacity="0.7" transform="rotate(-24 22 44)" />
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <ellipse key={a} cx="30" cy="22" rx="4.4" ry="9" fill={GARDEN.bloomA} opacity="0.62" transform={`rotate(${a} 30 30)`} />
            ))}
            <circle cx="30" cy="30" r="3.4" fill={GARDEN.centre} />
          </svg>
        );
      case "rosePetal":
        return (
          <svg viewBox="0 0 60 60" className="h-full w-full">
            <path d="M30 6 C 50 20, 50 44, 30 54 C 10 44, 10 20, 30 6 Z" fill={GARDEN.bloomA} opacity="0.66" />
            <path d="M30 10 C 42 22, 42 40, 30 50" stroke={GARDEN.bloomB} strokeWidth="1" fill="none" opacity="0.8" />
          </svg>
        );
      case "butterfly":
        return (
          <svg viewBox="0 0 60 60" className="h-full w-full">
            <path d="M30 32 C 18 14, 4 18, 10 32 C 4 46, 18 50, 30 32 Z" fill={GARDEN.bloomD} opacity="0.6" />
            <path d="M30 32 C 42 14, 56 18, 50 32 C 56 46, 42 50, 30 32 Z" fill={GARDEN.bloomD} opacity="0.6" />
            <path d="M30 24 L30 42" stroke={ink} strokeWidth="1.4" opacity="0.7" />
          </svg>
        );
      case "leaf":
        return (
          <svg viewBox="0 0 60 60" className="h-full w-full">
            <path d="M12 48 C 24 40, 44 20, 50 10 C 44 30, 26 46, 12 48 Z" fill={GARDEN.leaf} opacity="0.66" />
            <path d="M12 48 C 26 40, 42 24, 50 10" stroke={GARDEN.stemDeep} strokeWidth="0.9" fill="none" />
          </svg>
        );
      case "watercolourBloom":
        return (
          <svg viewBox="0 0 60 60" className="h-full w-full">
            <circle cx="26" cy="28" r="16" fill={GARDEN.bloomB} opacity="0.4" />
            <circle cx="36" cy="34" r="12" fill={GARDEN.bloomA} opacity="0.34" />
            <circle cx="31" cy="22" r="9" fill={GARDEN.bloomC} opacity="0.3" />
          </svg>
        );
      case "ribbon":
        return (
          <svg viewBox="0 0 60 60" className="h-full w-full">
            <path d="M30 30 C 18 18, 4 22, 10 30 C 4 38, 18 42, 30 30 Z" fill={GARDEN.bloomA} opacity="0.8" />
            <path d="M30 30 C 42 18, 56 22, 50 30 C 56 38, 42 42, 30 30 Z" fill={GARDEN.bloomA} opacity="0.8" />
            <path d="M30 32 L22 56 M30 32 L38 56" stroke={GARDEN.bloomA} strokeWidth="4" strokeLinecap="round" opacity="0.8" />
            <circle cx="30" cy="30" r="4.4" fill={GARDEN.bloomB} />
          </svg>
        );
      case "paperclip":
        return (
          <svg viewBox="0 0 60 60" className="h-full w-full">
            <path d="M22 8 V44 a8 8 0 0 0 16 0 V16 a5 5 0 0 0-10 0 V40" fill="none" stroke="#a8a294" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );
      case "stamp":
        return (
          <svg viewBox="0 0 60 60" className="h-full w-full">
            <rect x="8" y="12" width="44" height="36" fill="#f2e6d0" stroke={ink} strokeWidth="0.8" strokeDasharray="2 2" opacity="0.9" />
            <rect x="14" y="18" width="32" height="24" fill={GARDEN.bloomB} opacity="0.5" />
            <path d="M18 38 L26 26 L34 38 M30 32 L38 38" stroke={ink} strokeWidth="1.1" fill="none" opacity="0.7" />
          </svg>
        );
      case "heart":
        return (
          <svg viewBox="0 0 60 60" className="h-full w-full">
            <path d="M30 50 C 8 34, 10 16, 22 16 C 27 16, 30 22, 30 24 C 30 22, 33 16, 38 16 C 50 16, 52 34, 30 50 Z" fill={GARDEN.bloomA} opacity="0.6" />
          </svg>
        );
      case "doodle":
      default:
        return (
          <svg viewBox="0 0 60 60" className="h-full w-full">
            {/* three figures, holding hands — a child's drawing of the family */}
            <circle cx="16" cy="20" r="5" fill="none" stroke={ink} strokeWidth="1.4" />
            <path d="M16 25 V40 M16 30 L8 34 M16 30 L26 32 M16 40 L11 52 M16 40 L21 52" stroke={ink} strokeWidth="1.4" fill="none" strokeLinecap="round" />
            <circle cx="34" cy="18" r="6" fill="none" stroke={ink} strokeWidth="1.4" />
            <path d="M34 24 V42 M34 30 L26 32 M34 30 L46 34 M34 42 L29 54 M34 42 L39 54" stroke={ink} strokeWidth="1.4" fill="none" strokeLinecap="round" />
            <circle cx="50" cy="26" r="4" fill="none" stroke={ink} strokeWidth="1.4" />
            <path d="M50 30 V42 M50 34 L46 34 M50 42 L47 52 M50 42 L53 52" stroke={ink} strokeWidth="1.4" fill="none" strokeLinecap="round" />
          </svg>
        );
    }
  };

  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute"
      style={{
        left: `${decor.x}%`,
        top: `${decor.y}%`,
        width: 60 * decor.scale,
        height: 60 * decor.scale,
        marginLeft: -30 * decor.scale,
        marginTop: -30 * decor.scale,
      }}
      initial={{ opacity: 0, scale: 0.7, rotate: decor.rotate }}
      animate={{ opacity: 1, scale: 1, ...sway }}
      transition={{
        opacity: { duration: 1.4 },
        scale: { duration: 1.1, ease: [0.2, 1.3, 0.4, 1] },
        rotate: { duration: 7 + (decor.x % 5), repeat: Infinity, ease: "easeInOut" },
      }}
    >
      {art()}
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
/* A photograph tucked between paragraphs                              */
/* ------------------------------------------------------------------ */

export function TuckedPolaroid({
  polaroid,
  ink,
  onOpen,
}: {
  polaroid: Polaroid;
  ink: string;
  onOpen: () => void;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      aria-label={polaroid.caption ? `Photograph: ${polaroid.caption}` : "A photograph"}
      className="relative block cursor-pointer border-0 bg-transparent p-0"
      style={{ width: "min(190px, 46%)" }}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14, rotate: polaroid.tilt * 2 }}
      whileInView={{ opacity: 1, y: 0, rotate: polaroid.tilt }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
      whileHover={reduced ? undefined : { rotate: 0, y: -6, scale: 1.04 }}
    >
      <span
        className="block p-[7%] pb-[16%]"
        style={{ background: "#fdfaf2", boxShadow: "0 12px 26px -12px rgba(60,40,20,.44)" }}
      >
        <span className="block overflow-hidden" style={{ aspectRatio: "1", background: "#ded4c2" }}>
          {polaroid.url && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={polaroid.url} alt="" className="h-full w-full object-cover" />
          )}
        </span>
        {polaroid.caption && (
          <span
            className="mt-[6%] block text-center"
            style={{ fontFamily: "var(--hw-journal), cursive", fontSize: 13, color: ink, opacity: 0.82 }}
          >
            {polaroid.caption}
          </span>
        )}
      </span>
      {/* the corner it's tucked under */}
      <span
        aria-hidden
        className="absolute"
        style={{
          right: -3,
          bottom: "16%",
          width: 26,
          height: 18,
          background: "rgba(140,110,70,.2)",
          clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
        }}
      />
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/* "My favourite memory"                                              */
/* ------------------------------------------------------------------ */

export function FavouriteMemory({
  title,
  photo,
  story,
  hand,
  ink,
}: {
  title: string;
  photo: string;
  story: string;
  hand: Hand;
  ink: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.section
      className="mx-auto w-full"
      style={{ maxWidth: "min(520px, 100%)" }}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <div className="mb-5 text-center">
        <span style={{ fontFamily: MONO_FONT, fontSize: 9, letterSpacing: ".3em", textTransform: "uppercase", color: ink, opacity: 0.55 }}>
          my favourite memory
        </span>
      </div>

      {photo && (
        <div
          className="mx-auto"
          style={{
            padding: "5%",
            background: "linear-gradient(158deg, #d8c4a0, #b89a6c)",
            borderRadius: 2,
            boxShadow: "0 22px 44px -20px rgba(60,40,20,.5)",
          }}
        >
          <div className="overflow-hidden" style={{ aspectRatio: "4 / 3", background: "#ded4c2", boxShadow: "inset 0 0 0 3px #fdfaf2" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt={title || "A favourite memory"} className="h-full w-full object-cover" />
          </div>
        </div>
      )}

      {title && (
        <h3
          className="m-0 mt-6 text-center"
          style={{ fontFamily: DISPLAY_FONT, fontSize: "clamp(20px,3vw,27px)", lineHeight: 1.25, color: ink }}
        >
          {title}
        </h3>
      )}
      {story && (
        <p
          className="m-0 mt-4 whitespace-pre-line text-center"
          style={{ fontFamily: hand.family, fontSize: 19 * hand.scale, lineHeight: hand.lineHeight, color: ink }}
        >
          {story}
        </p>
      )}
    </motion.section>
  );
}

/* ------------------------------------------------------------------ */
/* "What you taught me"                                                */
/* ------------------------------------------------------------------ */

const MOTIFS: Record<Lesson["motif"], (c: string) => React.ReactNode> = {
  flower: (c) => (
    <>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="20" cy="12" rx="3.6" ry="6.4" fill={c} opacity="0.6" transform={`rotate(${a} 20 20)`} />
      ))}
      <circle cx="20" cy="20" r="2.6" fill={c} />
    </>
  ),
  cup: (c) => (
    <>
      <path d="M9 14 H27 V24 a9 9 0 0 1-18 0 Z" fill="none" stroke={c} strokeWidth="1.6" />
      <path d="M27 16 a5 5 0 0 1 0 8" fill="none" stroke={c} strokeWidth="1.6" />
      <path d="M14 9 C 16 6, 16 5, 14 3 M20 9 C 22 6, 22 5, 20 3" fill="none" stroke={c} strokeWidth="1.2" opacity="0.7" />
    </>
  ),
  hands: (c) => (
    <>
      <path d="M12 30 C 8 24, 10 16, 15 18 C 15 12, 21 12, 21 18 C 25 15, 29 20, 25 26 Z" fill="none" stroke={c} strokeWidth="1.5" />
      <path d="M28 32 C 32 27, 31 21, 27 22" fill="none" stroke={c} strokeWidth="1.3" />
    </>
  ),
  thread: (c) => (
    <>
      <ellipse cx="20" cy="16" rx="9" ry="7" fill="none" stroke={c} strokeWidth="1.5" />
      <path d="M20 23 C 20 28, 14 30, 14 34 C 14 37, 24 37, 26 33" fill="none" stroke={c} strokeWidth="1.2" />
      <path d="M13 14 C 18 12, 24 14, 27 18" fill="none" stroke={c} strokeWidth="0.9" opacity="0.7" />
    </>
  ),
  sun: (c) => (
    <>
      <circle cx="20" cy="20" r="7" fill="none" stroke={c} strokeWidth="1.6" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <line key={a} x1={20 + 10 * Math.cos((a * Math.PI) / 180)} y1={20 + 10 * Math.sin((a * Math.PI) / 180)} x2={20 + 14 * Math.cos((a * Math.PI) / 180)} y2={20 + 14 * Math.sin((a * Math.PI) / 180)} stroke={c} strokeWidth="1.3" strokeLinecap="round" />
      ))}
    </>
  ),
  house: (c) => (
    <>
      <path d="M8 20 L20 9 L32 20" fill="none" stroke={c} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M11 19 V32 H29 V19" fill="none" stroke={c} strokeWidth="1.6" />
      <rect x="17" y="24" width="6" height="8" fill="none" stroke={c} strokeWidth="1.2" />
    </>
  ),
  bird: (c) => (
    <>
      <path d="M8 24 C 16 16, 22 12, 30 10 C 28 18, 22 26, 12 30 Z" fill="none" stroke={c} strokeWidth="1.5" />
      <circle cx="27" cy="13" r="1.2" fill={c} />
    </>
  ),
  book: (c) => (
    <>
      <path d="M20 12 C 15 9, 9 10, 8 12 V30 C 9 28, 15 27, 20 30" fill="none" stroke={c} strokeWidth="1.5" />
      <path d="M20 12 C 25 9, 31 10, 32 12 V30 C 31 28, 25 27, 20 30" fill="none" stroke={c} strokeWidth="1.5" />
      <path d="M20 12 V30" stroke={c} strokeWidth="1.1" />
    </>
  ),
};

export function LessonCards({ lessons, hand, ink, accent }: { lessons: Lesson[]; hand: Hand; ink: string; accent: string }) {
  const reduced = useReducedMotion();
  if (lessons.length === 0) return null;

  return (
    <section className="w-full">
      <div className="mb-6 text-center">
        <span style={{ fontFamily: MONO_FONT, fontSize: 9, letterSpacing: ".3em", textTransform: "uppercase", color: ink, opacity: 0.55 }}>
          what you taught me
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {lessons.map((l, i) => (
          <motion.div
            key={l.id}
            className="relative px-5 py-5"
            style={{
              background: "rgba(255,255,255,.44)",
              border: `1px solid ${accent}44`,
              borderRadius: 3,
              boxShadow: "0 8px 20px -12px rgba(60,40,20,.3)",
            }}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18, rotate: i % 2 ? 0.8 : -0.8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.9, delay: (i % 2) * 0.14, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <span aria-hidden className="mb-3 block" style={{ width: 40, height: 40, color: accent }}>
              <svg viewBox="0 0 40 40" className="h-full w-full">
                {MOTIFS[l.motif](accent)}
              </svg>
            </span>
            {l.title && (
              <h4 className="m-0" style={{ fontFamily: DISPLAY_FONT, fontSize: 18, lineHeight: 1.3, color: ink }}>
                {l.title}
              </h4>
            )}
            {l.body && (
              <p
                className="m-0 mt-2.5 whitespace-pre-line"
                style={{ fontFamily: hand.family, fontSize: 17 * hand.scale, lineHeight: hand.lineHeight * 0.92, color: ink, opacity: 0.9 }}
              >
                {l.body}
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* "Thank you" — notes pinned round the page                           */
/* ------------------------------------------------------------------ */

export function ThankYouNotes({ notes, hand, ink, accent }: { notes: Thanks[]; hand: Hand; ink: string; accent: string }) {
  const reduced = useReducedMotion();
  if (notes.length === 0) return null;

  return (
    <section className="w-full">
      <div className="mb-6 text-center">
        <span style={{ fontFamily: MONO_FONT, fontSize: 9, letterSpacing: ".3em", textTransform: "uppercase", color: ink, opacity: 0.55 }}>
          thank you for
        </span>
      </div>
      <div className="flex flex-wrap items-start justify-center gap-4">
        {notes.map((n, i) => (
          <motion.div
            key={n.id}
            className="relative px-4 pb-4 pt-5"
            style={{
              width: "min(220px, 100%)",
              background: i % 3 === 0 ? "#fdf6e2" : i % 3 === 1 ? "#fbeeec" : "#eef2e6",
              boxShadow: "0 8px 18px -10px rgba(60,40,20,.36)",
              transform: `rotate(${i % 2 ? 1.6 : -1.8}deg)`,
            }}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -14, scale: 0.94 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ type: reduced ? "tween" : "spring", stiffness: 240, damping: 18, delay: (i % 3) * 0.1 }}
          >
            {/* the pin */}
            <span
              aria-hidden
              className="absolute rounded-full"
              style={{
                left: "50%",
                top: -5,
                width: 10,
                height: 10,
                transform: "translateX(-50%)",
                background: `radial-gradient(circle at 34% 30%, #fff, ${accent})`,
                boxShadow: "0 2px 4px rgba(0,0,0,.4)",
              }}
            />
            <p className="m-0" style={{ fontFamily: hand.family, fontSize: 16.5 * hand.scale, lineHeight: hand.lineHeight * 0.9, color: ink }}>
              {n.text}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Her voice, under a floral seal                                      */
/* ------------------------------------------------------------------ */

export function VoiceSeal({
  url,
  label,
  colourId,
  ink,
}: {
  url: string;
  label: string;
  colourId: SealColourId;
  ink: string;
}) {
  const reduced = useReducedMotion();
  const [el, setEl] = useState<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const c = SEAL_COLOURS[colourId];

  const toggle = () => {
    if (!el) return;
    if (el.paused) void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    else {
      el.pause();
      setPlaying(false);
    }
  };

  /* Fixed bar heights — a random waveform would differ between server and client. */
  const bars = [24, 46, 32, 62, 40, 74, 52, 84, 38, 58, 28, 50, 70, 36, 60, 26];

  return (
    <div className="flex flex-col items-center gap-5">
      <span style={{ fontFamily: MONO_FONT, fontSize: 9, letterSpacing: ".3em", textTransform: "uppercase", color: ink, opacity: 0.55 }}>
        {label || "press here"}
      </span>

      <motion.button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause the message" : "Play the message"}
        className="relative flex cursor-pointer items-center justify-center rounded-full border-0"
        style={{
          width: 84,
          height: 84,
          background: `radial-gradient(circle at 34% 28%, ${c.light}, ${c.base} 58%, ${c.deep})`,
          boxShadow: `0 12px 26px -10px ${c.deep}aa, inset 0 2px 5px rgba(255,255,255,.4)`,
          color: c.on,
        }}
        whileHover={reduced ? undefined : { scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        animate={playing || reduced ? {} : { boxShadow: [`0 12px 26px -10px ${c.deep}aa, 0 0 0 0 ${c.base}88`, `0 12px 26px -10px ${c.deep}aa, 0 0 0 18px ${c.base}00`] }}
        transition={playing || reduced ? {} : { duration: 2.6, repeat: Infinity }}
      >
        {/* a flower pressed into the wax */}
        <svg viewBox="0 0 40 40" width="46" height="46" aria-hidden>
          {playing ? (
            <>
              <rect x="14" y="12" width="4" height="16" rx="1" fill="currentColor" />
              <rect x="22" y="12" width="4" height="16" rx="1" fill="currentColor" />
            </>
          ) : (
            <>
              {[0, 72, 144, 216, 288].map((a) => (
                <ellipse key={a} cx="20" cy="12" rx="3.6" ry="6.6" fill="currentColor" opacity="0.85" transform={`rotate(${a} 20 20)`} />
              ))}
              <circle cx="20" cy="20" r="2.8" fill="currentColor" />
            </>
          )}
        </svg>
      </motion.button>

      <div className="flex h-8 w-full max-w-xs items-end justify-center gap-[3px]" aria-hidden>
        {bars.map((h, i) => (
          <motion.span
            key={i}
            className="flex-1 rounded-full"
            style={{ background: c.base, opacity: playing ? 0.9 : 0.34, maxWidth: 6 }}
            animate={playing && !reduced ? { height: [`${h}%`, `${Math.max(14, 104 - h)}%`, `${h}%`] } : { height: `${h}%` }}
            transition={playing && !reduced ? { duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: i * 0.035 } : { duration: 0.3 }}
          />
        ))}
      </div>

      {url ? (
        <audio ref={setEl} src={url} preload="none" className="sr-only" onEnded={() => setPlaying(false)} />
      ) : (
        <span style={{ fontFamily: MONO_FONT, fontSize: 8.5, letterSpacing: ".16em", textTransform: "uppercase", color: ink, opacity: 0.4 }}>
          no recording attached
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

/** A photograph opened up. */
export function PhotoLightbox({
  polaroid,
  onClose,
  hand,
  ink,
}: {
  polaroid: Polaroid | null;
  onClose: () => void;
  hand: Hand;
  ink: string;
}) {
  const reduced = useReducedMotion();
  return (
    <AnimatePresence>
      {polaroid && (
        <motion.button
          type="button"
          className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center border-0 p-6"
          style={{ background: "rgba(40,26,12,.8)", backdropFilter: "blur(6px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          aria-label="Close the photograph"
          onClick={onClose}
        >
          <motion.span
            className="block"
            style={{ width: "min(560px, 92vw)", background: "#fdfaf2", padding: "3.5%", boxShadow: "0 40px 80px -30px #000" }}
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9, rotate: polaroid.tilt }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <span className="block overflow-hidden" style={{ background: "#ded4c2" }}>
              {polaroid.url && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={polaroid.url} alt={polaroid.caption || "A photograph"} className="block h-auto w-full" />
              )}
            </span>
            {polaroid.caption && (
              <span
                className="mt-4 block text-center"
                style={{ fontFamily: hand.family, fontSize: 19 * hand.scale, color: ink }}
              >
                {polaroid.caption}
              </span>
            )}
          </motion.span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
