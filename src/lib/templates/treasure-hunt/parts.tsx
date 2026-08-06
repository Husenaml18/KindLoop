"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { GRAIN } from "@/lib/engines/scene/ambient";
import { routePath, routePoints, type Stop } from "./schema";
import { DISPLAY_FONT, HAND_FONT, MONO_FONT, PIN_LABELS, type MapStyle, type PinId } from "./theme";

/**
 * The things this experience is made of. All drawn — a treasure map made of stock
 * photography would be a different, worse product, and hand-drawn is the whole
 * visual premise.
 */

/* ------------------------------------------------------------------ */
/* The lantern                                                         */
/* ------------------------------------------------------------------ */

/** The first thing on screen. It never stops flickering — it's the light source. */
export function Lantern({ style, size = 96, lit = true }: { style: MapStyle; size?: number; lit?: boolean }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="relative"
      style={{ width: size, height: size * 1.35 }}
      animate={reduced || !lit ? {} : { y: [0, -4, 0], rotate: [-0.8, 0.8, -0.8] }}
      transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* the light it throws */}
      <motion.span
        aria-hidden
        className="absolute rounded-full"
        style={{
          left: "50%",
          top: "42%",
          width: size * 3.4,
          height: size * 3.4,
          transform: "translate(-50%,-50%)",
          background: `radial-gradient(circle, ${style.glow} 0%, transparent 62%)`,
          filter: "blur(12px)",
        }}
        animate={reduced || !lit ? { opacity: 0.34 } : { opacity: [0.26, 0.42, 0.3, 0.4, 0.26] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
      />

      <svg viewBox="0 0 60 82" className="relative h-full w-full" aria-hidden>
        {/* handle */}
        <path d="M22 12 C 22 3, 38 3, 38 12" fill="none" stroke={style.gilt} strokeWidth="2.4" strokeLinecap="round" />
        {/* cap and base */}
        <path d="M14 16 H46 L42 22 H18 Z" fill={style.gilt} />
        <path d="M16 66 H44 L47 74 H13 Z" fill={style.gilt} />
        {/* glass */}
        <path d="M18 22 H42 L44 66 H16 Z" fill={style.dark ? "rgba(255,232,168,.16)" : "rgba(255,236,190,.28)"} stroke={style.gilt} strokeWidth="1.6" />
        {/* the flame */}
        {lit && (
          <motion.path
            d="M30 58 C 24 52, 25 44, 30 38 C 35 44, 36 52, 30 58 Z"
            fill={style.glow}
            animate={reduced ? { opacity: 0.9 } : { scaleY: [1, 1.16, 0.94, 1.1, 1], opacity: [0.82, 1, 0.86, 1, 0.82] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            style={{ originX: "30px", originY: "58px" }}
          />
        )}
        {lit && <circle cx="30" cy="52" r="3.4" fill="#fffbe8" opacity="0.9" />}
      </svg>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* The compass                                                         */
/* ------------------------------------------------------------------ */

/**
 * The needle follows the cursor, on a spring, and drifts when nothing is moving.
 * On the last screen it stops dead — the journey is over.
 */
export function Compass({
  style,
  size = 86,
  stopped = false,
}: {
  style: MapStyle;
  size?: number;
  stopped?: boolean;
}) {
  const reduced = useReducedMotion();
  const angle = useMotionValue(0);
  const spun = useSpring(angle, { stiffness: 42, damping: 14, mass: 1.1 });
  const rotate = useTransform(spun, (v) => `${v}deg`);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced || stopped) return;
    const onMove = (e: PointerEvent) => {
      const rect = boxRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      /* Degrees clockwise from north, which is how a compass is read. */
      angle.set((Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI + 90);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [angle, reduced, stopped]);

  useEffect(() => {
    if (!stopped) return;
    /* It swings past north a couple of times and settles, like a real one. */
    angle.set(0);
  }, [stopped, angle]);

  return (
    <div ref={boxRef} className="relative" style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        {/* case */}
        <circle cx="50" cy="50" r="47" fill={style.dark ? "rgba(255,255,255,.05)" : "rgba(74,52,24,.08)"} stroke={style.gilt} strokeWidth="2.4" />
        <circle cx="50" cy="50" r="39" fill="none" stroke={style.giltSoft} strokeWidth="1" />
        {/* the rose */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <line
            key={a}
            x1="50"
            y1="50"
            x2={50 + 39 * Math.cos((a - 90) * (Math.PI / 180))}
            y2={50 + 39 * Math.sin((a - 90) * (Math.PI / 180))}
            stroke={style.giltSoft}
            strokeWidth={a % 90 === 0 ? 1.4 : 0.7}
          />
        ))}
        <text x="50" y="17" textAnchor="middle" style={{ fontFamily: MONO_FONT, fontSize: 9, fill: style.gilt }}>
          N
        </text>
      </svg>

      {/* the needle */}
      <motion.div className="absolute inset-0" style={{ rotate }}>
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <path d="M50 12 L56 50 L50 58 L44 50 Z" fill={style.gilt} />
          <path d="M50 88 L44 50 L50 42 L56 50 Z" fill={style.inkSoft} />
          <circle cx="50" cy="50" r="4.2" fill={style.gilt} />
        </svg>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Terrain — what's drawn behind the route                             */
/* ------------------------------------------------------------------ */

function Terrain({ style }: { style: MapStyle }) {
  const s = style.inkSoft;
  const thin = { fill: "none", stroke: s, strokeWidth: 0.5, opacity: 0.55 } as const;

  switch (style.terrain) {
    case "coast":
      return (
        <>
          <path d="M0 74 C 14 68, 24 78, 38 72 C 54 65, 62 76, 78 70 C 90 65, 96 72, 100 68" {...thin} />
          <path d="M0 82 C 16 76, 28 86, 44 80 C 60 74, 70 84, 86 78 C 94 74, 98 80, 100 77" {...thin} />
          <path d="M10 22 C 22 16, 30 24, 42 19" {...thin} strokeDasharray="2 3" />
          <path d="M62 14 L68 24 L74 14 Z" {...thin} />
          <path d="M70 20 L76 30 L82 20 Z" {...thin} />
        </>
      );
    case "hills":
      return (
        <>
          <path d="M6 70 L16 54 L26 70 Z M20 72 L32 50 L44 72 Z M40 70 L52 56 L64 70 Z" {...thin} />
          <path d="M60 66 L72 46 L84 66 Z M78 70 L88 56 L98 70 Z" {...thin} />
          <path d="M8 84 C 26 80, 44 88, 62 83 C 80 78, 92 86, 100 82" {...thin} />
        </>
      );
    case "grid":
      return (
        <>
          {[16, 32, 48, 64, 80].map((y) => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} {...thin} />
          ))}
          {[14, 30, 46, 62, 78, 92].map((x) => (
            <line key={x} x1={x} y1="0" x2={x} y2="100" {...thin} />
          ))}
        </>
      );
    case "trees":
      return (
        <>
          {[8, 20, 34, 48, 62, 76, 90].map((x, i) => (
            <g key={x}>
              <path d={`M${x} ${76 + (i % 3) * 4} L${x} ${64 + (i % 3) * 4}`} {...thin} />
              <path d={`M${x} ${66 + (i % 3) * 4} C ${x - 5} ${62 + (i % 3) * 4}, ${x - 4} ${54 + (i % 3) * 4}, ${x} ${50 + (i % 3) * 4} C ${x + 4} ${54 + (i % 3) * 4}, ${x + 5} ${62 + (i % 3) * 4}, ${x} ${66 + (i % 3) * 4} Z`} {...thin} />
            </g>
          ))}
        </>
      );
    case "stars":
      return (
        <>
          {[
            [12, 20], [28, 12], [44, 24], [58, 14], [72, 26], [88, 18],
            [18, 40], [36, 48], [52, 38], [68, 50], [84, 42],
            [10, 66], [30, 74], [50, 64], [70, 76], [92, 68],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1 : 0.6} fill={s} opacity="0.7" />
          ))}
          <path d="M12 20 L28 12 L44 24" {...thin} strokeDasharray="1 2" />
        </>
      );
    case "isles":
      return (
        <>
          <path d="M14 30 C 22 24, 32 28, 30 36 C 26 42, 14 40, 14 30 Z" {...thin} />
          <path d="M56 22 C 68 18, 76 26, 70 34 C 62 38, 52 32, 56 22 Z" {...thin} />
          <path d="M34 62 C 46 56, 60 62, 56 72 C 46 78, 30 72, 34 62 Z" {...thin} />
          <path d="M76 60 C 86 56, 94 62, 90 70 C 82 74, 72 68, 76 60 Z" {...thin} />
          <path d="M0 88 C 20 84, 40 92, 60 87 C 80 82, 92 90, 100 86" {...thin} />
        </>
      );
    case "ruled":
      return (
        <>
          {[14, 24, 34, 44, 54, 64, 74, 84].map((y) => (
            <line key={y} x1="8" y1={y} x2="92" y2={y} {...thin} />
          ))}
          <line x1="16" y1="6" x2="16" y2="94" stroke={s} strokeWidth="0.6" opacity="0.5" />
        </>
      );
    case "collage":
      return (
        <>
          <rect x="8" y="14" width="18" height="14" {...thin} transform="rotate(-6 17 21)" />
          <rect x="70" y="18" width="20" height="15" {...thin} transform="rotate(5 80 25)" />
          <rect x="14" y="66" width="16" height="20" {...thin} transform="rotate(4 22 76)" />
          <rect x="66" y="64" width="22" height="16" {...thin} transform="rotate(-5 77 72)" />
          <path d="M36 40 L48 34 L60 42" {...thin} strokeDasharray="2 2" />
        </>
      );
  }
}

/* ------------------------------------------------------------------ */
/* The map                                                             */
/* ------------------------------------------------------------------ */

/**
 * The map itself: parchment, terrain, the route drawing itself on, and a marker at
 * every stop. It tilts very slightly toward the cursor so it reads as a sheet of
 * paper on a table rather than a background image.
 */
export function TreasureMap({
  style,
  stops,
  solved,
  current,
  unrolled,
  routeDrawn,
  onPick,
  compact = false,
}: {
  style: MapStyle;
  stops: Stop[];
  /** How many stops are done. */
  solved: number;
  /** Which one they're at. -1 once every stop is done. */
  current: number;
  unrolled: boolean;
  routeDrawn: boolean;
  onPick?: (index: number) => void;
  /** Skip the tilt and the flourishes — used on the ending screen. */
  compact?: boolean;
}) {
  const reduced = useReducedMotion();
  const points = routePoints(stops.length);
  const path = routePath(points);
  const wrapRef = useRef<HTMLDivElement>(null);
  const tiltX = useSpring(0, { stiffness: 60, damping: 18 });
  const tiltY = useSpring(0, { stiffness: 60, damping: 18 });

  useEffect(() => {
    if (reduced || compact) return;
    const onMove = (e: PointerEvent) => {
      const rect = wrapRef.current?.getBoundingClientRect();
      if (!rect) return;
      tiltY.set(((e.clientX - (rect.left + rect.width / 2)) / rect.width) * 6);
      tiltX.set(-((e.clientY - (rect.top + rect.height / 2)) / rect.height) * 5);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced, compact, tiltX, tiltY]);

  return (
    <div ref={wrapRef} className="w-full" style={{ perspective: 1400 }}>
      <motion.div
        className="relative w-full"
        style={{
          aspectRatio: "3 / 2",
          rotateX: compact ? 0 : tiltX,
          rotateY: compact ? 0 : tiltY,
          transformStyle: "preserve-3d",
        }}
        /* Unrolling: the sheet grows from a rolled tube at the top. */
        initial={reduced ? { opacity: 0 } : { scaleY: 0.04, opacity: 0.4 }}
        animate={unrolled ? { scaleY: 1, opacity: 1 } : reduced ? { opacity: 0 } : { scaleY: 0.04, opacity: 0.4 }}
        transition={{ duration: reduced ? 0.3 : 2.1, ease: [0.16, 0.9, 0.2, 1] }}
      >
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            background: style.paper,
            borderRadius: 3,
            boxShadow: `0 40px 80px -34px rgba(0,0,0,.7), inset 0 0 60px ${style.paperEdge}`,
          }}
        >
          <span aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: GRAIN, opacity: 0.07, mixBlendMode: "multiply" }} />
          {/* burnt, softened edges */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: `radial-gradient(ellipse 118% 108% at 50% 50%, transparent 56%, ${style.paperEdge})` }}
          />

          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            <Terrain style={style} />

            {/* the route */}
            {stops.length > 1 && (
              <>
                <motion.path
                  d={path}
                  fill="none"
                  stroke={style.gilt}
                  strokeWidth="0.9"
                  strokeDasharray="2.4 2.2"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
                  animate={{ pathLength: routeDrawn ? 1 : 0 }}
                  transition={{ duration: reduced ? 0.3 : 2.8, ease: "easeInOut" }}
                />
                {/* the part already walked, drawn solid over it */}
                <motion.path
                  d={path}
                  fill="none"
                  stroke={style.gilt}
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: stops.length <= 1 ? 0 : Math.max(0, solved) / (stops.length - 1) }}
                  transition={{ duration: 1.4, ease: [0.2, 0.8, 0.2, 1] }}
                />
              </>
            )}
          </svg>

          {/* the stops */}
          {points.map((p, i) => {
            const done = i < solved;
            const here = i === current;
            const reachable = i <= solved;
            return (
              <motion.button
                key={stops[i].id}
                type="button"
                onClick={() => reachable && onPick?.(i)}
                disabled={!reachable || !onPick}
                aria-label={
                  done
                    ? `${stops[i].clue.place || `Stop ${i + 1}`} — found`
                    : here
                      ? `${stops[i].clue.place || `Stop ${i + 1}`} — you're here`
                      : `${stops[i].clue.place || `Stop ${i + 1}`} — not yet`
                }
                className={`absolute ${reachable && onPick ? "cursor-pointer" : "cursor-default"} border-0 bg-transparent p-0`}
                style={{ left: `${p.x}%`, top: `${p.y}%`, width: 34, height: 34, transform: "translate(-50%,-50%)" }}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: routeDrawn ? 1 : 0, scale: 1 }}
                transition={{ duration: 0.6, delay: routeDrawn && !reduced ? 0.5 + i * 0.16 : 0 }}
                whileHover={reachable && onPick && !reduced ? { scale: 1.22 } : undefined}
              >
                <svg viewBox="0 0 34 34" className="h-full w-full">
                  {done ? (
                    /* an X, struck through once it's been found */
                    <>
                      <path d="M9 9 L25 25 M25 9 L9 25" stroke={style.gilt} strokeWidth="3" strokeLinecap="round" />
                    </>
                  ) : (
                    <>
                      <circle
                        cx="17"
                        cy="17"
                        r="7.5"
                        fill={here ? style.gilt : "none"}
                        stroke={style.gilt}
                        strokeWidth="2"
                        strokeDasharray={here ? undefined : "3 3"}
                        opacity={reachable ? 1 : 0.4}
                      />
                      {here && <circle cx="17" cy="17" r="3" fill={style.paper.includes("#20") ? "#0e102a" : "#f4e8c8"} />}
                    </>
                  )}
                </svg>

                {/* the pulse on the one they're at */}
                {here && !reduced && (
                  <motion.span
                    aria-hidden
                    className="absolute left-1/2 top-1/2 rounded-full"
                    style={{ width: 34, height: 34, transform: "translate(-50%,-50%)", border: `1.5px solid ${style.gilt}` }}
                    animate={{ scale: [0.7, 1.9], opacity: [0.8, 0] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
                  />
                )}

                {/* its name, written on the map */}
                {stops[i].clue.place && (
                  <span
                    className="pointer-events-none absolute left-1/2 whitespace-nowrap"
                    style={{
                      top: i % 2 ? 30 : -20,
                      transform: "translateX(-50%)",
                      fontFamily: HAND_FONT,
                      fontSize: 14,
                      color: style.ink,
                      opacity: reachable ? 0.95 : 0.42,
                    }}
                  >
                    {stops[i].clue.place}
                  </span>
                )}
              </motion.button>
            );
          })}

          {/* the compass rose, in the corner where it belongs */}
          {!compact && (
            <span aria-hidden className="absolute" style={{ right: "3%", bottom: "4%", width: 62, opacity: 0.55 }}>
              <Compass style={style} size={62} />
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The journey board                                                   */
/* ------------------------------------------------------------------ */

/** One reward, pinned. Each pin kind is a different physical object. */
export function PinnedThing({
  stop,
  index,
  style,
  onOpen,
}: {
  stop: Stop;
  index: number;
  style: MapStyle;
  onOpen: () => void;
}) {
  const reduced = useReducedMotion();
  const pin: PinId = stop.pin;
  const tilt = index % 2 ? 2.6 : -2.4;
  const title = stop.reward.title || stop.clue.place || PIN_LABELS[pin];

  const face = () => {
    switch (pin) {
      case "polaroid":
        return (
          <span className="block p-[7%] pb-[18%]" style={{ background: "#fdf8ec" }}>
            <span className="block overflow-hidden" style={{ aspectRatio: "1", background: "#ddd4c2" }}>
              {stop.reward.imageUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={stop.reward.imageUrl} alt="" className="h-full w-full object-cover" />
              )}
            </span>
            <span className="mt-[6%] block truncate text-center" style={{ fontFamily: HAND_FONT, fontSize: 12, color: "#4a3a26" }}>
              {title}
            </span>
          </span>
        );
      case "stamp":
        return (
          <span
            className="flex aspect-square items-center justify-center p-2 text-center"
            style={{
              border: `2px dashed ${style.gilt}`,
              borderRadius: "50%",
              transform: "rotate(-8deg)",
              color: style.gilt,
              fontFamily: MONO_FONT,
              fontSize: 8,
              letterSpacing: ".12em",
              textTransform: "uppercase",
              background: "rgba(255,255,255,.06)",
            }}
          >
            {title}
          </span>
        );
      case "ticket":
      case "stub":
        return (
          <span className="relative block px-3 py-3.5" style={{ background: pin === "ticket" ? "#f2e2b8" : "#e8dcc6" }}>
            <span className="block" style={{ fontFamily: MONO_FONT, fontSize: 7.5, letterSpacing: ".2em", textTransform: "uppercase", color: "#8a6a3c" }}>
              admit one
            </span>
            <span className="mt-1.5 block truncate" style={{ fontFamily: HAND_FONT, fontSize: 15, color: "#4a3a26" }}>
              {title}
            </span>
            <span aria-hidden className="absolute" style={{ left: 0, top: "50%", width: 6, height: 6, borderRadius: "50%", background: "rgba(0,0,0,.4)", transform: "translate(-50%,-50%)" }} />
            <span aria-hidden className="absolute" style={{ right: 0, top: "50%", width: 6, height: 6, borderRadius: "50%", background: "rgba(0,0,0,.4)", transform: "translate(50%,-50%)" }} />
          </span>
        );
      case "flower":
        return (
          <span className="flex aspect-square items-center justify-center" style={{ background: "#efe6d0" }}>
            <svg viewBox="0 0 40 40" width="70%" height="70%" aria-hidden>
              <path d="M20 38 L20 22" stroke={style.inkSoft} strokeWidth="1.4" fill="none" />
              <path d="M20 30 C 13 27, 10 21, 12 18" stroke={style.inkSoft} strokeWidth="1.1" fill="none" />
              {[0, 72, 144, 216, 288].map((a) => (
                <ellipse key={a} cx="20" cy="12" rx="3.6" ry="6.4" fill={style.gilt} opacity="0.62" transform={`rotate(${a} 20 20)`} />
              ))}
              <circle cx="20" cy="20" r="2.6" fill={style.inkSoft} />
            </svg>
          </span>
        );
      case "coin":
        return (
          <motion.span
            className="flex aspect-square items-center justify-center rounded-full"
            style={{ background: `radial-gradient(circle at 34% 30%, #f4dc9c, ${style.gilt})`, boxShadow: "inset 0 -2px 6px rgba(0,0,0,.3)" }}
            animate={reduced ? {} : { rotateY: [0, 360] }}
            transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
          >
            <span style={{ fontFamily: DISPLAY_FONT, fontSize: 19, color: "#5a3c10" }}>{index + 1}</span>
          </motion.span>
        );
      case "postcard":
        return (
          <span className="block" style={{ background: "#f2ead4" }}>
            <span className="block overflow-hidden" style={{ aspectRatio: "3 / 2", background: "#d8ccb0" }}>
              {stop.reward.imageUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={stop.reward.imageUrl} alt="" className="h-full w-full object-cover" />
              )}
            </span>
            <span className="block px-2 py-1.5 truncate" style={{ fontFamily: HAND_FONT, fontSize: 12, color: "#4a3a26" }}>
              {title}
            </span>
          </span>
        );
      case "note":
      default:
        return (
          <span className="block px-3 py-3" style={{ background: "#f6eeda" }}>
            <span className="block" style={{ fontFamily: HAND_FONT, fontSize: 14, lineHeight: 1.35, color: "#4a3a26" }}>
              {title}
            </span>
          </span>
        );
    }
  };

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      aria-label={`Look at ${title} again`}
      className="relative cursor-pointer border-0 bg-transparent p-0"
      style={{ width: "100%" }}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: -22, rotate: tilt * 3, scale: 0.86 }}
      animate={{ opacity: 1, y: 0, rotate: tilt, scale: 1 }}
      transition={{ type: reduced ? "tween" : "spring", stiffness: 260, damping: 18, delay: 0.1 }}
      whileHover={reduced ? undefined : { rotate: 0, scale: 1.05, zIndex: 5 }}
    >
      <span className="block" style={{ boxShadow: "0 10px 22px -10px rgba(0,0,0,.55)" }}>
        {face()}
      </span>
      {/* the pin holding it down */}
      <span
        aria-hidden
        className="absolute rounded-full"
        style={{
          left: "50%",
          top: -5,
          width: 10,
          height: 10,
          transform: "translateX(-50%)",
          background: `radial-gradient(circle at 34% 30%, #fff, ${style.gilt})`,
          boxShadow: "0 2px 4px rgba(0,0,0,.5)",
        }}
      />
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/* The chest                                                           */
/* ------------------------------------------------------------------ */

/**
 * The end of the journey. Wood, brass corners, a domed lid, and light coming out
 * of the seam before it opens — so the payoff is visible a beat before it arrives.
 */
export function Chest({
  style,
  open,
  plate,
  onOpen,
}: {
  style: MapStyle;
  open: boolean;
  plate: string;
  onOpen: () => void;
}) {
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  return (
    <div className="relative mx-auto" style={{ width: "min(430px, 90%)", perspective: 1200 }}>
      {/* the light escaping */}
      <motion.span
        aria-hidden
        className="absolute rounded-full"
        style={{
          left: "50%",
          top: "34%",
          width: "150%",
          height: "150%",
          transform: "translate(-50%,-50%)",
          background: `radial-gradient(circle, ${style.glow} 0%, transparent 58%)`,
          filter: "blur(20px)",
        }}
        animate={open ? { opacity: [0.3, 1] } : reduced ? { opacity: 0.2 } : { opacity: [0.14, 0.3, 0.14] }}
        transition={open ? { duration: 2 } : { duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative" style={{ aspectRatio: "3 / 2", transformStyle: "preserve-3d" }}>
        {/* the body */}
        <div
          className="absolute inset-x-0 bottom-0 overflow-hidden"
          style={{
            height: "58%",
            background: "linear-gradient(168deg, #6b4526 0%, #4a2f19 100%)",
            border: "1px solid #33200f",
            borderRadius: "2px 2px 5px 5px",
            boxShadow: "0 26px 50px -18px rgba(0,0,0,.7)",
          }}
        >
          {/* planks */}
          {[26, 52, 78].map((x) => (
            <span key={x} aria-hidden className="absolute top-0 h-full" style={{ left: `${x}%`, width: 1, background: "rgba(0,0,0,.28)" }} />
          ))}
          {/* brass bands */}
          {[16, 84].map((x) => (
            <span key={x} aria-hidden className="absolute top-0 h-full" style={{ left: `${x}%`, width: 9, background: `linear-gradient(90deg, #8a6a2c, #d8b46e, #8a6a2c)` }} />
          ))}
          {/* the light from inside, once the lid is up */}
          <motion.span
            aria-hidden
            className="absolute inset-x-0 top-0"
            style={{ height: "60%", background: `linear-gradient(to bottom, ${style.glow}, transparent)` }}
            animate={{ opacity: open ? 1 : 0 }}
            transition={{ duration: 1.6, delay: open ? 0.6 : 0 }}
          />
        </div>

        {/* the lid */}
        <motion.button
          type="button"
          onClick={() => !open && onOpen()}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          disabled={open}
          aria-label={open ? "The chest is open" : "Open the chest"}
          aria-expanded={open}
          className={`absolute inset-x-0 top-0 overflow-hidden border-0 p-0 ${open ? "cursor-default" : "cursor-pointer"}`}
          style={{
            height: "46%",
            background: "linear-gradient(178deg, #7d5230 0%, #5a3a1f 100%)",
            border: "1px solid #33200f",
            borderRadius: "44% 44% 3px 3px / 60% 60% 3px 3px",
            transformOrigin: "50% 100%",
            transformStyle: "preserve-3d",
            boxShadow: "inset 0 2px 0 rgba(255,226,180,.2)",
          }}
          animate={
            open
              ? { rotateX: reduced ? 0 : -112, opacity: reduced ? 0 : 1 }
              : { rotateX: hovered && !reduced ? -7 : 0, opacity: 1 }
          }
          transition={{ duration: reduced ? 0.3 : 2, ease: [0.32, 0.04, 0.18, 1] }}
        >
          {/* brass bands continuing over the lid */}
          {[16, 84].map((x) => (
            <span key={x} aria-hidden className="absolute top-0 h-full" style={{ left: `${x}%`, width: 9, background: `linear-gradient(90deg, #8a6a2c, #d8b46e, #8a6a2c)` }} />
          ))}
          {/* the plate */}
          {plate && (
            <span
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-sm px-3 py-1"
              style={{
                background: "linear-gradient(158deg, #d8b46e, #8a6a2c)",
                fontFamily: DISPLAY_FONT,
                fontSize: 13,
                color: "#3a2810",
                letterSpacing: ".04em",
              }}
            >
              {plate}
            </span>
          )}
        </motion.button>

        {/* the lock, which falls away as it opens */}
        <motion.span
          aria-hidden
          className="absolute left-1/2 flex items-center justify-center"
          style={{ top: "38%", width: 40, height: 46, transform: "translateX(-50%)", zIndex: 4 }}
          animate={open ? { y: 70, rotate: 26, opacity: 0 } : { y: 0, rotate: 0, opacity: 1 }}
          transition={{ duration: reduced ? 0.2 : 1, ease: "easeIn" }}
        >
          <svg viewBox="0 0 40 46" className="h-full w-full">
            <path d="M13 20 V14 a7 7 0 0 1 14 0 V20" fill="none" stroke="#d8b46e" strokeWidth="3" strokeLinecap="round" />
            <rect x="8" y="20" width="24" height="20" rx="3" fill="url(#th-brass)" />
            <defs>
              <linearGradient id="th-brass" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#e8ca8a" />
                <stop offset="1" stopColor="#8a6a2c" />
              </linearGradient>
            </defs>
            <circle cx="20" cy="30" r="2.6" fill="#3a2810" />
          </svg>
        </motion.span>

        {/* the seam glowing before it opens, so the payoff is visible coming */}
        {!open && (
          <motion.span
            aria-hidden
            className="absolute inset-x-[6%]"
            style={{ top: "45%", height: 3, background: style.glow, filter: "blur(1.5px)" }}
            animate={reduced ? { opacity: 0.5 } : { opacity: [0.2, 0.85, 0.2] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small delights                                                      */
/* ------------------------------------------------------------------ */

/** A bird crossing the screen every so often. Rare enough to feel like luck. */
export function PassingBird({ color }: { color: string }) {
  const reduced = useReducedMotion();
  const [flight, setFlight] = useState(0);

  useEffect(() => {
    if (reduced) return;
    /* Every 40 seconds or so, not on a tidy loop. */
    const id = setInterval(() => setFlight((n) => n + 1), 41_000);
    return () => clearInterval(id);
  }, [reduced]);

  if (reduced || flight === 0) return null;

  return (
    <motion.span
      key={flight}
      aria-hidden
      className="pointer-events-none absolute"
      style={{ top: `${12 + (flight % 3) * 9}%`, left: "-8%", width: 26, color }}
      animate={{ left: "108%", y: [0, -18, 6, -10, 0] }}
      transition={{ duration: 13, ease: "linear" }}
    >
      <motion.svg viewBox="0 0 30 14" className="h-full w-full" animate={{ scaleY: [1, 0.55, 1] }} transition={{ duration: 0.9, repeat: Infinity }}>
        <path d="M2 8 C 8 1, 12 1, 15 7 C 18 1, 22 1, 28 8" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </motion.svg>
    </motion.span>
  );
}
