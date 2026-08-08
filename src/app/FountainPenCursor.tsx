"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The pointer, as a fountain pen.
 *
 * An earlier version read as a kite on a string, and the reasons were structural
 * rather than a matter of taste:
 *
 *   - the nib was a five-point diamond — a point on top, wide shoulders, tapering
 *     tail. That is a kite silhouette, not a nib;
 *   - it floated 16px *above* the pointer while the ink trail was drawn *at* the
 *     pointer, so the body hovered over its own line exactly like a kite over its
 *     string;
 *   - a fixed 35° tilt and a slow 0.16 follow made it drift behind the cursor as
 *     though caught in wind.
 *
 * All three are answered by one idea: **the nib tip is the pointer**. The pen is
 * drawn from that tip going up and to the right, the way a right hand holds one,
 * and the trail starts at the same point — so the ink comes out of the nib rather
 * than trailing beneath a floating object.
 *
 * Drawn as SVG rather than clip-paths so the nib can have the things that make a
 * nib recognisable at 40px: the slit, the breather hole, the shoulders, and a
 * brass band on the barrel.
 *
 * These pages set `cursor: none`, so this *is* the pointer. `FOLLOW` is therefore
 * a usability number, not a stylistic one — too low and the tip sits behind where
 * somebody is actually clicking.
 */

const TRAIL_LENGTH = 7;
const INK = "#232a3d";
const INK_LIGHT = "#3a4566";

/** How far the tip moves toward the pointer each frame. Higher is tighter. */
const FOLLOW = 0.34;

interface Point {
  x: number;
  y: number;
}

export function FountainPenCursor() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const penRef = useRef<SVGGElement>(null);
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [drops, setDrops] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const wrap = wrapRef.current;
    const pen = penRef.current;
    if (!wrap || !pen) return;

    let px = window.innerWidth / 2;
    let py = window.innerHeight / 2;
    let x = px;
    let y = py;
    let shown = false;
    const points: Point[] = Array.from({ length: TRAIL_LENGTH + 1 }, () => ({ x, y }));

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (!shown) {
        shown = true;
        wrap.style.opacity = "1";
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const onWindowLeave = () => {
      shown = false;
      wrap.style.opacity = "0";
    };
    document.addEventListener("mouseleave", onWindowLeave);

    /* "Hover text: the pen begins writing" — detected by tag rather than a data
       attribute, so it works on any prose without manual tagging. */
    const onOver = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      setIsWriting(Boolean(target?.closest("h1, h2, h3, p, blockquote")));
    };
    window.addEventListener("pointerover", onOver, { passive: true });

    let dropId = 0;
    const onDown = (e: PointerEvent) => {
      const id = ++dropId;
      setDrops((d) => [...d, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setDrops((d) => d.filter((it) => it.id !== id)), 1100);
    };
    window.addEventListener("pointerdown", onDown);

    let raf = 0;
    const tick = () => {
      const dx = px - x;
      const dy = py - y;
      x += dx * FOLLOW;
      y += dy * FOLLOW;

      points.unshift({ x, y });
      points.length = TRAIL_LENGTH + 1;

      /* A small lean into the direction of travel — a pen flexes, it doesn't
         weathervane. About the resting angle of a held pen, give or take. */
      const lean = Math.max(-7, Math.min(7, dx * 1.1));

      wrap.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      pen.setAttribute("transform", `rotate(${34 + lean})`);

      lineRefs.current.forEach((line, i) => {
        if (!line) return;
        const a = points[i];
        const b = points[i + 1];
        if (!a || !b) {
          line.setAttribute("opacity", "0");
          return;
        }
        line.setAttribute("x1", String(a.x));
        line.setAttribute("y1", String(a.y));
        line.setAttribute("x2", String(b.x));
        line.setAttribute("y2", String(b.y));
        const fade = 1 - i / TRAIL_LENGTH;
        /* Thin and short: ink laid by a nib, not a comet tail. */
        line.setAttribute("opacity", String(fade * 0.4));
        line.setAttribute("stroke-width", String(1.7 * fade + 0.3));
      });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("mouseleave", onWindowLeave);
    };
  }, []);

  return (
    <>
      <svg
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 9997,
          pointerEvents: "none",
        }}
      >
        {Array.from({ length: TRAIL_LENGTH }).map((_, i) => (
          <line
            key={i}
            ref={(el) => {
              lineRefs.current[i] = el;
            }}
            stroke={INK}
            strokeLinecap="round"
            opacity={0}
          />
        ))}
      </svg>

      <div
        ref={wrapRef}
        aria-hidden
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 9999,
          pointerEvents: "none",
          opacity: 0,
          transition: "opacity .4s ease",
          willChange: "transform",
        }}
      >
        {/*
          The viewBox is placed so user-space (0,0) — the nib tip — lands exactly
          on the pointer. Everything else is drawn up and to the right of it.
        */}
        <svg
          width={54}
          height={54}
          viewBox="-8 -46 54 54"
          style={{ display: "block", marginLeft: -8, marginTop: -46, overflow: "visible" }}
        >
          <defs>
            <linearGradient id="kl-nib" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#f0dcab" />
              <stop offset="45%" stopColor="#c9a24f" />
              <stop offset="100%" stopColor="#8f6d28" />
            </linearGradient>
            <linearGradient id="kl-barrel" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4a5069" />
              <stop offset="34%" stopColor="#232a3d" />
              <stop offset="100%" stopColor="#141926" />
            </linearGradient>
          </defs>

          {/* Drawn upright from the tip, then leaned over as a whole — so the tip
              stays put no matter how far it leans. */}
          <g ref={penRef} transform="rotate(34)" style={{ transformOrigin: "0px 0px" }}>
            {/* barrel */}
            <rect x={-3.4} y={-41} width={6.8} height={22} rx={3.4} fill="url(#kl-barrel)" />
            <rect x={-2.6} y={-40} width={1.5} height={20} rx={0.75} fill="#fff" opacity={0.14} />
            {/* the clip */}
            <path
              d="M2.4 -40.2 q2.5 .4 2.5 3 l0 4.4 q0 1-1 1 t-1-1 l0-3.6"
              fill="none"
              stroke="#c9a24f"
              strokeWidth={1.1}
              strokeLinecap="round"
            />
            {/* brass band where barrel meets grip */}
            <rect x={-3.5} y={-19.6} width={7} height={2.1} rx={0.7} fill="#d9b768" />
            {/* grip section, tapering to the nib */}
            <path d="M-3.4 -17.6 L3.4 -17.6 L2.9 -12.2 L-2.9 -12.2 Z" fill="#1b202e" />

            {/* the nib — the shape that has to be unmistakable */}
            <path
              d="M-2.9 -12.4 L2.9 -12.4 L2.5 -8.4 Q1.9 -3.6 0 0 Q-1.9 -3.6 -2.5 -8.4 Z"
              fill="url(#kl-nib)"
            />
            {/* breather hole, slit and shoulders */}
            <circle cx={0} cy={-8.2} r={0.95} fill="#1b202e" opacity={0.85} />
            <path d="M0 -7.4 L0 -0.6" stroke="#1b202e" strokeWidth={0.55} strokeLinecap="round" opacity={0.8} />
            <path d="M-2.5 -8.4 Q0 -9.6 2.5 -8.4" fill="none" stroke="#8f6d28" strokeWidth={0.4} opacity={0.7} />

            {/* a bead of ink at the very tip, fuller while writing */}
            <circle
              cx={0}
              cy={0}
              r={isWriting ? 1.7 : 1.05}
              fill={INK}
              style={{
                transition: "r .18s ease",
                filter: isWriting ? `drop-shadow(0 0 3px ${INK_LIGHT})` : "none",
              }}
            />
          </g>
        </svg>
      </div>

      {drops.map((d) => (
        <div
          key={d.id}
          aria-hidden
          style={{
            position: "fixed",
            left: d.x,
            top: d.y,
            zIndex: 9998,
            pointerEvents: "none",
            width: 16,
            height: 16,
            marginLeft: -8,
            marginTop: -8,
            borderRadius: "46% 54% 40% 60% / 55% 45% 55% 45%",
            background: INK,
            animation: "inkDropFade 1.1s ease-out forwards",
          }}
        />
      ))}
    </>
  );
}
