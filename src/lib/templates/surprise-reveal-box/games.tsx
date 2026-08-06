"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ScratchFoil } from "@/lib/engines/gift/ScratchFoil";
import { normaliseCode, type Layer } from "./schema";
import { HAND_FONT, MONO_FONT, type Scheme } from "./theme";

/**
 * The small things standing between a person and the next box.
 *
 * Every one of them can be given up on. The point of a guard is to make somebody
 * slow down for ten seconds — not to test them — so a "let me in" escape appears
 * after a short while on all of them, and none of them can be failed. A gift that
 * locks you out of itself is not a gift.
 */

const GIVE_UP_AFTER = 18_000;

/* Drop targets, as fractions of their play area. Module constants so they are
   stable identities and can sit in dependency lists honestly. */
const LOCK_AT = { x: 0.5, y: 0.3 };
const SLOT_AT = { x: 0.62, y: 0.34 };
/** How close counts as "on it" — generous, because this is theatre, not aim. */
const DROP_RADIUS = 0.21;

function GiveUp({ onSkip, scheme, show }: { onSkip: () => void; scheme: Scheme; show: boolean }) {
  if (!show) return null;
  return (
    <motion.button
      type="button"
      onClick={onSkip}
      className="cursor-pointer border-0 bg-transparent"
      style={{ fontFamily: MONO_FONT, fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: scheme.inkSoft }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      just open it
    </motion.button>
  );
}

/** True once enough time has passed to offer a way out. */
function useGiveUp(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setReady(true), GIVE_UP_AFTER);
    return () => clearTimeout(id);
  }, []);
  return ready;
}

/* ------------------------------------------------------------------ */
/* The key                                                             */
/* ------------------------------------------------------------------ */

/**
 * A key lying on the table, and a lock on the box. Drag one to the other.
 * The key is small, so the drop target is deliberately huge — this is a moment of
 * theatre, not a test of aim.
 */
function KeyGuard({ scheme, onSolved }: { scheme: Scheme; onSolved: () => void }) {
  const reduced = useReducedMotion();
  const [at, setAt] = useState({ x: 0.12, y: 0.72 });
  const [dragging, setDragging] = useState(false);
  const [turned, setTurned] = useState(false);
  const areaRef = useRef<HTMLDivElement>(null);
  const canSkip = useGiveUp();

  const move = (clientX: number, clientY: number) => {
    const rect = areaRef.current?.getBoundingClientRect();
    if (!rect) return;
    setAt({
      x: Math.max(0.02, Math.min(0.94, (clientX - rect.left) / rect.width)),
      y: Math.max(0.04, Math.min(0.9, (clientY - rect.top) / rect.height)),
    });
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => move(e.clientX, e.clientY);
    const onUp = () => {
      setDragging(false);
      setAt((p) => {
        const near = Math.hypot(p.x - LOCK_AT.x, p.y - LOCK_AT.y) < DROP_RADIUS;
        if (near) {
          setTurned(true);
          setTimeout(onSolved, 900);
          return LOCK_AT;
        }
        return p;
      });
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragging, onSolved]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={areaRef}
        className="relative w-full"
        style={{ aspectRatio: "2 / 1", touchAction: "none" }}
      >
        {/* the lock */}
        <motion.span
          aria-hidden
          className="absolute flex items-center justify-center rounded-[5px]"
          style={{
            left: `${LOCK_AT.x * 100}%`,
            top: `${LOCK_AT.y * 100}%`,
            width: 62,
            height: 74,
            transform: "translate(-50%,-50%)",
            background: `linear-gradient(158deg, ${scheme.accent}, ${scheme.accentSoft})`,
            boxShadow: `0 10px 20px -8px rgba(0,0,0,.5)`,
          }}
          animate={turned ? { rotate: [0, -8, 4, 0], scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.8 }}
        >
          <svg viewBox="0 0 40 48" width="34" height="41">
            <path d="M12 20 V13 a8 8 0 0 1 16 0 V20" fill="none" stroke={scheme.ink} strokeWidth="3.2" strokeLinecap="round" />
            <rect x="7" y="20" width="26" height="22" rx="3" fill={scheme.ink} opacity="0.82" />
            <motion.circle cx="20" cy="31" r="3.4" fill={scheme.glow} animate={turned ? { r: [3.4, 5, 3.4] } : {}} transition={{ duration: 0.6 }} />
          </svg>
        </motion.span>

        {/* the key */}
        <motion.button
          type="button"
          aria-label={turned ? "Unlocked" : "Drag the key to the lock"}
          onPointerDown={(e) => {
            if (turned) return;
            e.preventDefault();
            setDragging(true);
            move(e.clientX, e.clientY);
          }}
          onKeyDown={(e) => {
            if (turned) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setAt(LOCK_AT);
              setTurned(true);
              setTimeout(onSolved, 900);
            }
          }}
          className={`absolute border-0 bg-transparent p-0 ${turned ? "" : "cursor-grab active:cursor-grabbing"}`}
          style={{ left: `${at.x * 100}%`, top: `${at.y * 100}%`, width: 54, height: 22, transform: "translate(-50%,-50%)" }}
          animate={{
            opacity: turned ? 0 : 1,
            rotate: dragging ? -14 : 0,
            scale: dragging ? 1.12 : 1,
            filter: reduced || dragging ? "none" : `drop-shadow(0 0 7px ${scheme.glow})`,
          }}
          transition={{ type: reduced ? "tween" : "spring", stiffness: 380, damping: 28 }}
        >
          <svg viewBox="0 0 60 24" className="h-full w-full">
            <circle cx="11" cy="12" r="8.4" fill="none" stroke={scheme.accent} strokeWidth="3.4" />
            <path d="M19 12 H54" stroke={scheme.accent} strokeWidth="3.4" strokeLinecap="round" />
            <path d="M46 12 V19 M52 12 V17" stroke={scheme.accent} strokeWidth="3.4" strokeLinecap="round" />
          </svg>
        </motion.button>
      </div>
      <GiveUp onSkip={onSolved} scheme={scheme} show={canSkip && !turned} />
    </div>
  );
}

/**
 * Where the dials start.
 *
 * Never on the answer. A creator who picks the combination lock and leaves the
 * code at its default of "000" would otherwise ship a lock that springs open on
 * its own before anyone touches it — the dials all start at zero too. So the
 * start is derived from the code and nudged off it.
 */
function startingDials(target: string): number[] {
  const want = target.split("").map((d) => Number(d) || 0);
  const start = want.map((d) => (d + 5) % 10);
  /* Cannot coincide with the answer: +5 on every wheel can only land back on it
     if all three moved 5, which the modulo makes impossible for a 3-digit code. */
  return start.join("") === target ? want.map((d) => (d + 3) % 10) : start;
}

/* ------------------------------------------------------------------ */
/* The combination                                                     */
/* ------------------------------------------------------------------ */

function CombinationGuard({ code, scheme, onSolved }: { code: string; scheme: Scheme; onSolved: () => void }) {
  const target = normaliseCode(code);
  const [dials, setDials] = useState(() => startingDials(target));
  const canSkip = useGiveUp();

  /* Derived, not stored: the lock *is* open when the dials read the code, so
     there is no second copy of that fact to keep in step. */
  const open = dials.join("") === target;

  /* The callback fires after the digits land, never during render. */
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(onSolved, 1000);
    return () => clearTimeout(id);
  }, [open, onSolved]);

  const nudge = (i: number, by: 1 | -1) =>
    setDials((d) => d.map((n, idx) => (idx === i ? (n + by + 10) % 10 : n)));

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2.5">
        {dials.map((n, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={() => nudge(i, 1)}
              aria-label={`Dial ${i + 1} up`}
              className="cursor-pointer border-0 bg-transparent px-2 text-[11px]"
              style={{ color: scheme.inkSoft }}
            >
              ▲
            </button>
            <div
              className="flex items-center justify-center overflow-hidden rounded-[4px]"
              style={{
                width: 46,
                height: 60,
                background: open ? scheme.accent : "rgba(0,0,0,.24)",
                boxShadow: `inset 0 3px 9px rgba(0,0,0,.45)`,
                border: `1px solid ${scheme.accentSoft}`,
              }}
            >
              <motion.span
                key={n}
                style={{ fontFamily: MONO_FONT, fontSize: 27, color: open ? "#fff" : scheme.ink, fontVariantNumeric: "tabular-nums" }}
                initial={{ y: 22, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.22 }}
                aria-live="off"
              >
                {n}
              </motion.span>
            </div>
            <button
              type="button"
              onClick={() => nudge(i, -1)}
              aria-label={`Dial ${i + 1} down`}
              className="cursor-pointer border-0 bg-transparent px-2 text-[11px]"
              style={{ color: scheme.inkSoft }}
            >
              ▼
            </button>
          </div>
        ))}
      </div>
      <span role="status" style={{ fontFamily: MONO_FONT, fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: scheme.inkSoft }}>
        {open ? "it opens" : "three digits"}
      </span>
      <GiveUp onSkip={onSolved} scheme={scheme} show={canSkip && !open} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The piece that fits                                                 */
/* ------------------------------------------------------------------ */

function FitGuard({ layer, scheme, onSolved }: { layer: Layer; scheme: Scheme; onSolved: () => void }) {
  const reduced = useReducedMotion();
  const [at, setAt] = useState({ x: 0.16, y: 0.7 });
  const [dragging, setDragging] = useState(false);
  const [fitted, setFitted] = useState(false);
  const areaRef = useRef<HTMLDivElement>(null);
  const canSkip = useGiveUp();

  const image = layer.reward.imageUrl;

  const move = (clientX: number, clientY: number) => {
    const rect = areaRef.current?.getBoundingClientRect();
    if (!rect) return;
    setAt({
      x: Math.max(0.04, Math.min(0.9, (clientX - rect.left) / rect.width)),
      y: Math.max(0.06, Math.min(0.88, (clientY - rect.top) / rect.height)),
    });
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => move(e.clientX, e.clientY);
    const onUp = () => {
      setDragging(false);
      setAt((p) => {
        if (Math.hypot(p.x - SLOT_AT.x, p.y - SLOT_AT.y) < DROP_RADIUS) {
          setFitted(true);
          setTimeout(onSolved, 950);
          return SLOT_AT;
        }
        return p;
      });
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragging, onSolved]);

  const PIECE = "M4 4 H60 C60 18, 78 18, 78 4 H96 V60 C82 60, 82 78, 96 78 V96 H40 C40 82, 22 82, 22 96 H4 Z";

  return (
    <div className="flex flex-col items-center gap-3">
      <div ref={areaRef} className="relative w-full" style={{ aspectRatio: "2 / 1", touchAction: "none" }}>
        {/* the slot */}
        <span
          aria-hidden
          className="absolute"
          style={{ left: `${SLOT_AT.x * 100}%`, top: `${SLOT_AT.y * 100}%`, width: 92, height: 92, transform: "translate(-50%,-50%)" }}
        >
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <path d={PIECE} fill="rgba(0,0,0,.3)" stroke={scheme.accentSoft} strokeWidth="2" strokeDasharray="5 4" />
          </svg>
        </span>

        {/* the piece */}
        <motion.button
          type="button"
          aria-label={fitted ? "It fits" : "Drag the piece into the slot"}
          onPointerDown={(e) => {
            if (fitted) return;
            e.preventDefault();
            setDragging(true);
            move(e.clientX, e.clientY);
          }}
          onKeyDown={(e) => {
            if (fitted) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setAt(SLOT_AT);
              setFitted(true);
              setTimeout(onSolved, 950);
            }
          }}
          className={`absolute border-0 bg-transparent p-0 ${fitted ? "" : "cursor-grab active:cursor-grabbing"}`}
          style={{ left: `${at.x * 100}%`, top: `${at.y * 100}%`, width: 92, height: 92, transform: "translate(-50%,-50%)" }}
          animate={{ rotate: fitted ? 0 : dragging ? -7 : -3, scale: dragging ? 1.08 : 1 }}
          transition={{ type: reduced ? "tween" : "spring", stiffness: 400, damping: 30 }}
        >
          <svg viewBox="0 0 100 100" className="h-full w-full" style={{ filter: `drop-shadow(0 6px 12px rgba(0,0,0,.45))` }}>
            <defs>
              <clipPath id={`sb-fit-${layer.id}`}>
                <path d={PIECE} />
              </clipPath>
            </defs>
            {image ? (
              <image href={image} x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid slice" clipPath={`url(#sb-fit-${layer.id})`} />
            ) : (
              <path d={PIECE} fill={scheme.accent} />
            )}
            <path d={PIECE} fill="none" stroke={scheme.paperB} strokeWidth="2" />
          </svg>
        </motion.button>
      </div>
      <GiveUp onSkip={onSolved} scheme={scheme} show={canSkip && !fitted} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The map                                                            */
/* ------------------------------------------------------------------ */

/**
 * Four places, one right. A wrong guess is not punished — the spot just shakes its
 * head and stays where it is, and the right one is always reachable.
 */
function MapGuard({ layer, scheme, onSolved }: { layer: Layer; scheme: Scheme; onSolved: () => void }) {
  const reduced = useReducedMotion();
  const [wrong, setWrong] = useState<number | null>(null);
  const [found, setFound] = useState(false);
  const canSkip = useGiveUp();

  /* Which spot is right comes from the layer id, so it is stable between the
     server and the browser and different from one layer to the next. */
  let h = 2166136261;
  for (let i = 0; i < layer.id.length; i += 1) {
    h ^= layer.id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const answer = (h >>> 0) % 4;

  const SPOTS = [
    { x: 22, y: 30 },
    { x: 68, y: 22 },
    { x: 38, y: 68 },
    { x: 78, y: 62 },
  ];

  useEffect(() => {
    if (wrong === null) return;
    const id = setTimeout(() => setWrong(null), 700);
    return () => clearTimeout(id);
  }, [wrong]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative w-full overflow-hidden rounded-[4px]"
        style={{
          aspectRatio: "2 / 1",
          background: `${scheme.paperB}`,
          boxShadow: `inset 0 0 0 1px ${scheme.accentSoft}, inset 0 4px 14px rgba(0,0,0,.14)`,
        }}
      >
        {/* the map: coastline and a few contours, drawn */}
        <svg viewBox="0 0 200 100" className="absolute inset-0 h-full w-full" aria-hidden>
          <path d="M0 74 C 26 64, 40 78, 62 70 C 84 62, 96 74, 120 66 C 146 58, 168 70, 200 60" fill="none" stroke={scheme.accentSoft} strokeWidth="1.6" />
          <path d="M0 86 C 30 78, 46 90, 70 82 C 96 74, 110 86, 134 78 C 160 70, 176 82, 200 74" fill="none" stroke={scheme.accentSoft} strokeWidth="1" />
          <path d="M18 14 C 44 8, 58 24, 84 18" fill="none" stroke={scheme.accentSoft} strokeWidth="1" strokeDasharray="3 4" />
          <circle cx="150" cy="26" r="13" fill="none" stroke={scheme.accentSoft} strokeWidth="1" />
          <path d="M150 15 L150 37 M139 26 L161 26" stroke={scheme.accentSoft} strokeWidth="0.8" />
        </svg>

        {SPOTS.map((s, i) => (
          <motion.button
            key={i}
            type="button"
            onClick={() => {
              if (found) return;
              if (i === answer) {
                setFound(true);
                setTimeout(onSolved, 1000);
              } else {
                setWrong(i);
              }
            }}
            aria-label={found && i === answer ? "Found it" : `Place ${i + 1}`}
            className="absolute cursor-pointer border-0 bg-transparent p-0"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: 30, height: 30, transform: "translate(-50%,-50%)" }}
            animate={
              wrong === i && !reduced
                ? { x: [0, -5, 5, -3, 0] }
                : found && i === answer
                  ? { scale: [1, 1.5, 1.2] }
                  : {}
            }
            transition={{ duration: wrong === i ? 0.5 : 0.8 }}
            whileHover={found ? undefined : { scale: 1.18 }}
          >
            <svg viewBox="0 0 30 30" className="h-full w-full">
              {found && i === answer ? (
                <path d="M7 7 L23 23 M23 7 L7 23" stroke={scheme.accent} strokeWidth="3.6" strokeLinecap="round" />
              ) : (
                <circle cx="15" cy="15" r="6.5" fill="none" stroke={scheme.accent} strokeWidth="2.4" strokeDasharray="3 3" />
              )}
            </svg>
          </motion.button>
        ))}
      </div>
      <span role="status" style={{ fontFamily: MONO_FONT, fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: scheme.inkSoft }}>
        {found ? "that's the one" : wrong !== null ? "not there" : "which one was it?"}
      </span>
      <GiveUp onSkip={onSolved} scheme={scheme} show={canSkip && !found} />
    </div>
  );
}

/* ------------------------------------------------------------------ */

/** Whatever stands in the way of this layer's lid. */
export function Guard({
  layer,
  scheme,
  onSolved,
}: {
  layer: Layer;
  scheme: Scheme;
  onSolved: () => void;
}) {
  const clue = layer.clue.trim();

  return (
    <div className="flex w-full flex-col items-center gap-5">
      {clue && (
        <p
          className="m-0 max-w-sm text-center"
          style={{ fontFamily: HAND_FONT, fontSize: "clamp(18px,2.8vw,24px)", lineHeight: 1.4, color: scheme.ink }}
        >
          {clue}
        </p>
      )}

      {layer.guard === "scratch" && (
        <div style={{ width: "min(420px, 94%)", color: scheme.inkSoft }}>
          <ScratchFoil
            foil={scheme.accent}
            foilSheen={scheme.paperB}
            label="the way in"
            onRevealed={() => setTimeout(onSolved, 700)}
          >
            <span style={{ fontFamily: HAND_FONT, fontSize: "clamp(17px,2.4vw,24px)", color: scheme.ink }}>
              open it
            </span>
          </ScratchFoil>
        </div>
      )}

      {layer.guard === "key" && (
        <div style={{ width: "min(420px, 94%)" }}>
          <KeyGuard scheme={scheme} onSolved={onSolved} />
        </div>
      )}

      {layer.guard === "combination" && <CombinationGuard code={layer.code} scheme={scheme} onSolved={onSolved} />}

      {layer.guard === "fit" && (
        <div style={{ width: "min(440px, 94%)" }}>
          <FitGuard layer={layer} scheme={scheme} onSolved={onSolved} />
        </div>
      )}

      {layer.guard === "map" && (
        <div style={{ width: "min(460px, 96%)" }}>
          <MapGuard layer={layer} scheme={scheme} onSolved={onSolved} />
        </div>
      )}
    </div>
  );
}
