"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import type { CharacterId, DoodleId, Mood } from "./theme";

/**
 * The drawn things.
 *
 * All of it is SVG and CSS. An apology made of stock illustrations is an apology
 * somebody bought, and the entire claim of this experience is that time was spent
 * on it — so the doodles are wobbly on purpose, the shapes are a little off-square,
 * and nothing is pixel-perfect.
 */

/* ------------------------------------------------------------------ */
/* The character                                                       */
/* ------------------------------------------------------------------ */

/**
 * The sender, as a small creature.
 *
 * `mouth` carries the whole performance: the same body reads as sorry, hopeful or
 * pleased depending on one curve, which is cheaper than four drawings and reads
 * better than any of them.
 */
export function Character({
  id,
  mood,
  face = "sorry",
  size = 90,
}: {
  id: CharacterId;
  mood: Mood;
  face?: "sorry" | "hopeful" | "happy" | "sheepish";
  size?: number;
}) {
  const mouth =
    face === "happy"
      ? "M 40 62 Q 50 72, 60 62"
      : face === "hopeful"
        ? "M 41 64 Q 50 69, 59 64"
        : face === "sheepish"
          ? "M 41 65 Q 50 63, 59 66"
          : "M 41 66 Q 50 60, 59 66";

  const eye = (cx: number) =>
    face === "happy" ? (
      <path
        d={`M ${cx - 5} 50 Q ${cx} 45, ${cx + 5} 50`}
        stroke={mood.ink}
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="round"
      />
    ) : (
      <circle cx={cx} cy={49} r="3.1" fill={mood.ink} />
    );

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
      {/* the body — a different silhouette per creature, one face for all */}
      {id === "bean" && (
        <path
          d="M 50 18 C 74 18, 84 38, 82 58 C 80 78, 66 88, 50 88 C 34 88, 20 78, 18 58 C 16 38, 26 18, 50 18 Z"
          fill={mood.paper}
          stroke={mood.ink}
          strokeWidth="2.4"
        />
      )}
      {id === "cat" && (
        <>
          <path d="M 26 30 L 22 12 L 40 22 Z" fill={mood.paper} stroke={mood.ink} strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M 74 30 L 78 12 L 60 22 Z" fill={mood.paper} stroke={mood.ink} strokeWidth="2.4" strokeLinejoin="round" />
          <ellipse cx="50" cy="56" rx="32" ry="31" fill={mood.paper} stroke={mood.ink} strokeWidth="2.4" />
        </>
      )}
      {id === "bird" && (
        <>
          <ellipse cx="50" cy="58" rx="30" ry="29" fill={mood.paper} stroke={mood.ink} strokeWidth="2.4" />
          <path d="M 50 71 L 44 79 L 56 79 Z" fill={mood.accent} />
          <path d="M 44 22 Q 50 10, 56 22" stroke={mood.ink} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </>
      )}
      {id === "ghost" && (
        <path
          d="M 20 58 C 20 32, 34 20, 50 20 C 66 20, 80 32, 80 58 L 80 84 L 70 76 L 60 84 L 50 76 L 40 84 L 30 76 L 20 84 Z"
          fill={mood.paper}
          stroke={mood.ink}
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
      )}

      {eye(39)}
      {eye(61)}
      <path d={mouth} stroke={mood.ink} strokeWidth="2.6" fill="none" strokeLinecap="round" />

      {/* the blush, which is most of why it reads as sorry rather than blank */}
      <ellipse cx="30" cy="60" rx="5.5" ry="3.4" fill={mood.accent} opacity="0.32" />
      <ellipse cx="70" cy="60" rx="5.5" ry="3.4" fill={mood.accent} opacity="0.32" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Doodles                                                             */
/* ------------------------------------------------------------------ */

export function Doodle({
  id,
  colour,
  size = 22,
}: {
  id: DoodleId;
  colour: string;
  size?: number;
}) {
  const paths: Record<DoodleId, ReactNode> = {
    heart: <path d="M12 21 C 3 14, 1 9, 4 5.6 C 6.6 2.7, 10.4 3.4, 12 6.4 C 13.6 3.4, 17.4 2.7, 20 5.6 C 23 9, 21 14, 12 21 Z" fill={colour} />,
    star: <path d="M12 2 L13.9 9.4 L21.5 10.2 L15.8 15 L17.5 22.4 L12 18.4 L6.5 22.4 L8.2 15 L2.5 10.2 L10.1 9.4 Z" fill={colour} />,
    flower: (
      <g fill={colour}>
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="12" cy="6.6" rx="3.2" ry="5.4" transform={`rotate(${a} 12 12)`} opacity="0.85" />
        ))}
      </g>
    ),
    cloud: <path d="M6.5 18 A 4.5 4.5 0 0 1 6.9 9 A 6 6 0 0 1 18 8.6 A 4.7 4.7 0 0 1 18.2 18 Z" fill={colour} />,
    arrow: (
      <g stroke={colour} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17 C 8 6, 15 4, 21 7" />
        <path d="M21 7 L 15.5 6.5 M21 7 L 19.6 12.4" />
      </g>
    ),
    plane: (
      <g stroke={colour} strokeWidth="2" fill="none" strokeLinejoin="round">
        <path d="M2 12 L22 3 L14 21 L11 13.6 Z" />
        <path d="M11 13.6 L22 3" />
      </g>
    ),
    coffee: (
      <g stroke={colour} strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M4 9 H17 V16 A 4 4 0 0 1 13 20 H8 A 4 4 0 0 1 4 16 Z" />
        <path d="M17 11 H20 A 2.5 2.5 0 0 1 20 16 H17" />
        <path d="M8 3 Q 9.4 5, 8 7 M12 3 Q 13.4 5, 12 7" />
      </g>
    ),
    sparkle: <path d="M12 2 L13.4 9.2 L20.6 10.6 L13.4 12 L12 19.2 L10.6 12 L3.4 10.6 L10.6 9.2 Z" fill={colour} />,
  };

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      {paths[id]}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Paper                                                               */
/* ------------------------------------------------------------------ */

/** A sheet with a slight tilt and a soft shadow. Everything sits on one. */
export function Sheet({
  mood,
  tilt = 0,
  children,
  style,
  className,
}: {
  mood: Mood;
  tilt?: number;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        background: mood.paper,
        border: `1px solid ${mood.paperEdge}`,
        borderRadius: 12,
        boxShadow: "0 18px 40px -26px rgba(60,40,40,.5), 0 1px 2px rgba(60,40,40,.06)",
        transform: `rotate(${tilt}deg)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** A square of sticky-note paper, with the shine of the adhesive strip. */
export function Sticky({
  colour,
  tilt = -2,
  children,
  style,
}: {
  colour: string;
  tilt?: number;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        position: "relative",
        background: colour,
        borderRadius: 3,
        padding: "16px 16px 18px",
        boxShadow: "0 12px 24px -16px rgba(60,40,40,.6)",
        transform: `rotate(${tilt}deg)`,
        ...style,
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: "0 0 auto 0",
          height: "34%",
          background: "linear-gradient(180deg, rgba(255,255,255,.34), transparent)",
          borderRadius: "3px 3px 0 0",
          pointerEvents: "none",
        }}
      />
      {children}
    </div>
  );
}

/** The drawing pin that holds things to the corkboard. */
export function Pin({ colour }: { colour: string }) {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden>
      <circle cx="10" cy="8" r="6" fill={colour} />
      <circle cx="7.6" cy="5.8" r="2" fill="rgba(255,255,255,.5)" />
      <path d="M10 13 L10 18" stroke="rgba(60,40,40,.45)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Ambience                                                            */
/* ------------------------------------------------------------------ */

/**
 * Warm specks drifting up.
 *
 * Positions come from the index rather than `Math.random`, so the server and the
 * browser draw the same first frame.
 */
export function Motes({ colour, count = 14 }: { colour: string; count?: number }) {
  const reduced = useReducedMotion();
  if (reduced) return null;

  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {Array.from({ length: count }, (_, i) => {
        const x = ((i * 37) % 100) + ((i % 3) - 1) * 2;
        const delay = (i % 7) * 1.4;
        const dur = 9 + (i % 5) * 2.2;
        const size = 3 + (i % 3);
        return (
          <motion.span
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              bottom: -12,
              width: size,
              height: size,
              borderRadius: "50%",
              background: colour,
              opacity: 0.5,
            }}
            animate={{ y: [-0, -520], opacity: [0, 0.55, 0], x: [0, (i % 2 ? 26 : -26)] }}
            transition={{ duration: dur, repeat: Infinity, delay, ease: "linear" }}
          />
        );
      })}
    </div>
  );
}

/** The paper airplane that leaves at the end. */
export function PaperPlane({ colour, size = 40 }: { colour: string; size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden>
      <path d="M4 24 L44 6 L30 44 L23 29 Z" fill={colour} opacity="0.92" />
      <path d="M23 29 L44 6" stroke="rgba(255,255,255,.6)" strokeWidth="1.6" fill="none" />
    </svg>
  );
}

/** The teddy that hides the good stuff. */
export function Teddy({ mood, size = 40 }: { mood: Mood; size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden>
      <circle cx="12" cy="12" r="7" fill="#c99a6e" stroke={mood.ink} strokeWidth="1.6" />
      <circle cx="36" cy="12" r="7" fill="#c99a6e" stroke={mood.ink} strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3.4" fill="#e8c6a4" />
      <circle cx="36" cy="12" r="3.4" fill="#e8c6a4" />
      <circle cx="24" cy="27" r="15" fill="#c99a6e" stroke={mood.ink} strokeWidth="1.8" />
      <ellipse cx="24" cy="32" rx="8" ry="6.5" fill="#e8c6a4" />
      <circle cx="19" cy="24" r="1.9" fill={mood.ink} />
      <circle cx="29" cy="24" r="1.9" fill={mood.ink} />
      <ellipse cx="24" cy="30" rx="2.4" ry="1.8" fill={mood.ink} />
      <path d="M24 32 Q 21 35, 19.5 33 M24 32 Q 27 35, 28.5 33" stroke={mood.ink} strokeWidth="1.3" fill="none" strokeLinecap="round" />
    </svg>
  );
}
