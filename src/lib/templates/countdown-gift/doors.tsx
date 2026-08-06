"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { GILT_GRAIN, MONO_FONT, NUMERAL_FONT, type DoorStyleId, type Skin } from "./theme";
import { GIFT_GLYPHS, type CountdownDay } from "./schema";

export type DoorState = "locked" | "ready" | "opened";

/** Deterministic per-door tilt, so the grid is gilt-precise but not sterile. */
function tilt(i: number): number {
  return [(-1.2), 0.9, -0.6, 1.4, -1.5, 0.5][i % 6];
}

/* ------------------------------------------------------------------ */
/* The face of one door, per style                                     */
/* ------------------------------------------------------------------ */

function Numeral({ n, skin, dim }: { n: number; skin: Skin; dim: boolean }) {
  return (
    <span
      style={{
        fontFamily: NUMERAL_FONT,
        fontSize: "clamp(20px,3.4vw,34px)",
        lineHeight: 1,
        color: skin.gold,
        opacity: dim ? 0.5 : 1,
        textShadow: `0 1px 0 rgba(0,0,0,.5)`,
      }}
    >
      {n}
    </span>
  );
}

function DoorFace({
  style,
  n,
  skin,
  state,
  day,
}: {
  style: DoorStyleId;
  n: number;
  skin: Skin;
  state: DoorState;
  day: CountdownDay;
}) {
  const dim = state === "locked";
  const common = { skin, n, dim };

  switch (style) {
    /* a small sealed envelope */
    case "envelope":
      return (
        <span className="absolute inset-0 overflow-hidden" style={{ background: skin.doorFace }}>
          <span
            aria-hidden
            className="absolute inset-x-0 top-0"
            style={{
              height: "56%",
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              background: "rgba(255,255,255,.055)",
              borderBottom: `1px solid ${skin.doorEdge}`,
            }}
          />
          <span
            aria-hidden
            className="absolute rounded-full"
            style={{
              left: "50%",
              top: "52%",
              width: "26%",
              aspectRatio: "1",
              transform: "translate(-50%,-50%)",
              background: `radial-gradient(circle at 34% 30%, ${skin.glow}, ${skin.gold} 55%, rgba(0,0,0,.5))`,
              opacity: dim ? 0.45 : 0.95,
              boxShadow: "inset -1px -2px 3px rgba(0,0,0,.5)",
            }}
          />
          <span className="absolute left-[10%] top-[8%]">
            <Numeral {...common} />
          </span>
        </span>
      );

    /* a shallow drawer with a brass pull */
    case "drawer":
      return (
        <span className="absolute inset-0 overflow-hidden" style={{ background: skin.doorFace }}>
          <span aria-hidden className="absolute inset-x-[8%] top-[14%] bottom-[14%] rounded-[2px]" style={{ border: `1px solid ${skin.doorEdge}` }} />
          <span
            aria-hidden
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: "36%",
              height: 6,
              background: `linear-gradient(180deg, ${skin.glow}, ${skin.gold})`,
              opacity: dim ? 0.4 : 0.9,
              boxShadow: "0 1px 3px rgba(0,0,0,.6)",
            }}
          />
          <span className="absolute left-[9%] top-[8%]">
            <Numeral {...common} />
          </span>
        </span>
      );

    /* a pair of shutters */
    case "window":
      return (
        <span className="absolute inset-0 overflow-hidden" style={{ background: skin.doorFace }}>
          {[0, 1].map((s) => (
            <span
              key={s}
              aria-hidden
              className="absolute inset-y-0"
              style={{
                [s === 0 ? "left" : "right"]: 0,
                width: "50%",
                borderRight: s === 0 ? `1px solid ${skin.doorEdge}` : undefined,
                background: `repeating-linear-gradient(0deg, rgba(255,255,255,.05) 0 3px, transparent 3px 8px)`,
              }}
            />
          ))}
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Numeral {...common} />
          </span>
        </span>
      );

    /* a tiny wrapped box */
    case "giftbox":
      return (
        <span className="absolute inset-0 overflow-hidden" style={{ background: skin.doorFace }}>
          <span aria-hidden className="absolute inset-y-0 left-1/2 -translate-x-1/2" style={{ width: "16%", background: `${skin.gold}55` }} />
          <span aria-hidden className="absolute inset-x-0 top-1/2 -translate-y-1/2" style={{ height: "16%", background: `${skin.gold}55` }} />
          <span
            aria-hidden
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ width: "22%", aspectRatio: "1", border: `2px solid ${skin.gold}`, opacity: dim ? 0.45 : 0.9 }}
          />
          <span className="absolute left-[9%] top-[8%]">
            <Numeral {...common} />
          </span>
        </span>
      );

    /* a numbered padlock */
    case "lock":
      return (
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-1" style={{ background: skin.doorFace }}>
          <svg viewBox="0 0 40 44" className="w-[34%]" aria-hidden>
            <path d="M12 20 L12 14 A8 8 0 0 1 28 14 L28 20" fill="none" stroke={skin.gold} strokeWidth="3" strokeLinecap="round" opacity={dim ? 0.5 : 0.95} />
            <rect x="7" y="20" width="26" height="19" rx="3" fill={skin.gold} opacity={dim ? 0.42 : 0.9} />
          </svg>
          <Numeral {...common} />
        </span>
      );

    /* a torn-off calendar card */
    case "card":
    default:
      return (
        <span className="absolute inset-0 overflow-hidden" style={{ background: skin.doorFace }}>
          <span aria-hidden className="absolute inset-x-0 top-0" style={{ height: "22%", background: "rgba(255,255,255,.07)", borderBottom: `1px solid ${skin.doorEdge}` }} />
          {[0.3, 0.7].map((t) => (
            <span key={t} aria-hidden className="absolute rounded-full" style={{ left: `${t * 100}%`, top: "11%", width: 5, height: 5, transform: "translate(-50%,-50%)", background: "rgba(0,0,0,.5)" }} />
          ))}
          <span className="absolute inset-x-0 top-[30%] flex flex-col items-center">
            <Numeral {...common} />
            <span style={{ fontFamily: MONO_FONT, fontSize: 8, letterSpacing: ".18em", color: skin.inkSoft, marginTop: 4 }}>
              {dim ? "" : GIFT_GLYPHS[day.kind]}
            </span>
          </span>
        </span>
      );
  }
}

/* ------------------------------------------------------------------ */
/* The door                                                            */
/* ------------------------------------------------------------------ */

export function Door({
  index,
  day,
  skin,
  doorStyle,
  state,
  daysAway,
  onOpen,
  onNudge,
}: {
  index: number;
  day: CountdownDay;
  skin: Skin;
  doorStyle: DoorStyleId;
  state: DoorState;
  daysAway: number;
  onOpen: () => void;
  onNudge: (message: string) => void;
}) {
  const reduced = useReducedMotion();
  const [nudges, setNudges] = useState(0);
  const locked = state === "locked";

  const click = () => {
    if (locked) {
      /* A locked door doesn't scold — it leans away and says something kind. */
      setNudges((n) => n + 1);
      onNudge(String(daysAway));
      return;
    }
    onOpen();
  };

  /* Doors open in the way their style would: envelopes lift a flap, drawers
     slide, shutters swing, boxes lift a lid, padlocks fall away, cards tear. */
  const openedTransform =
    doorStyle === "drawer"
      ? { y: "62%", opacity: 0 }
      : doorStyle === "window"
        ? { rotateY: -78, opacity: 0 }
        : doorStyle === "giftbox"
          ? { y: "-58%", rotate: -8, opacity: 0 }
          : doorStyle === "lock"
            ? { y: "40%", rotate: 14, opacity: 0 }
            : doorStyle === "card"
              ? { rotateX: -74, opacity: 0 }
              : { rotateX: -150, opacity: 0 };

  return (
    <motion.button
      type="button"
      onClick={click}
      aria-label={
        locked
          ? `Day ${index + 1} — locked. ${daysAway === 1 ? "Opens tomorrow" : `Opens in ${daysAway} days`}`
          : `Day ${index + 1} — ${state === "opened" ? "open it again" : "open it"}`
      }
      aria-disabled={locked}
      className="relative block w-full cursor-pointer border-0 bg-transparent p-0"
      style={{ aspectRatio: "1", perspective: 700 }}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14, rotate: tilt(index) }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.18 + index * 0.035, ease: [0.2, 0.8, 0.2, 1] }}
      whileHover={reduced ? undefined : locked ? { rotate: tilt(index) + 1.2 } : { y: -5, scale: 1.03 }}
    >
      {/* the recess behind the door, and the light that comes out of it */}
      <span
        className="absolute inset-0 overflow-hidden rounded-[3px]"
        style={{
          background: "rgba(0,0,0,.55)",
          boxShadow: `inset 0 3px 10px rgba(0,0,0,.7)`,
          border: `1px solid ${skin.doorEdge}`,
        }}
      >
        <motion.span
          aria-hidden
          className="absolute inset-0"
          style={{ background: `radial-gradient(circle at 50% 55%, ${skin.glow}66, transparent 70%)` }}
          animate={{ opacity: state === "opened" ? 1 : 0 }}
          transition={{ duration: 1.1 }}
        />
        {state === "opened" && (
          <span
            className="absolute inset-0 flex flex-col items-center justify-center gap-1"
            style={{ color: skin.gold }}
          >
            <span style={{ fontSize: "clamp(15px,2.6vw,24px)", lineHeight: 1 }}>{GIFT_GLYPHS[day.kind]}</span>
            <span style={{ fontFamily: MONO_FONT, fontSize: 8, letterSpacing: ".14em", opacity: 0.75 }}>
              {index + 1}
            </span>
          </span>
        )}
      </span>

      {/* the door itself */}
      <motion.span
        className="absolute inset-0 overflow-hidden rounded-[3px]"
        style={{
          transformOrigin:
            doorStyle === "envelope" || doorStyle === "card"
              ? "50% 0%"
              : doorStyle === "window"
                ? "0% 50%"
                : "50% 50%",
          transformStyle: "preserve-3d",
          border: `1px solid ${skin.doorEdge}`,
          boxShadow: "0 6px 14px -6px rgba(0,0,0,.7)",
        }}
        animate={state === "opened" ? openedTransform : { y: 0, rotateX: 0, rotateY: 0, rotate: 0, opacity: 1 }}
        transition={{ duration: reduced ? 0.2 : 1.05, ease: [0.34, 0.03, 0.22, 1] }}
      >
        <DoorFace style={doorStyle} n={index + 1} skin={skin} state={state} day={day} />
        <span aria-hidden className="absolute inset-0 opacity-25" style={{ backgroundImage: GILT_GRAIN, mixBlendMode: "overlay" }} />
        {locked && <span aria-hidden className="absolute inset-0" style={{ background: "rgba(0,0,0,.42)" }} />}
      </motion.span>

      {/* the shudder — small, apologetic, never a slam */}
      <motion.span
        key={nudges}
        aria-hidden
        className="pointer-events-none absolute inset-0"
        animate={nudges ? { x: [0, -4, 3, -2, 0], rotate: [0, -0.7, 0.6, -0.3, 0] } : {}}
        transition={{ duration: 0.46, ease: "easeOut" }}
      />

      {/* today's door is the one that glows */}
      {state === "ready" && !reduced && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[3px]"
          animate={{ boxShadow: [`0 0 0 0 ${skin.glow}00`, `0 0 18px 2px ${skin.glow}77`, `0 0 0 0 ${skin.glow}00`] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </motion.button>
  );
}
