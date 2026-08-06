"use client";

import { useEffect, useRef, useState } from "react";

const TRAIL_LENGTH = 9;
const INK = "#232a3d";
const INK_LIGHT = "#3a4566";

interface Point {
  x: number;
  y: number;
}

export function FountainPenCursor() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const nibRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [drops, setDrops] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const wrap = wrapRef.current;
    const nib = nibRef.current;
    if (!wrap || !nib) return;

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

    // "Hover text: pen begins writing" — detected by tag, not a data
    // attribute, so it works on any prose element without manual tagging.
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
      x += dx * 0.16;
      y += dy * 0.16;

      points.unshift({ x, y });
      points.length = TRAIL_LENGTH + 1;

      const angle = Math.max(-14, Math.min(14, dx * 2.2));

      wrap.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      nib.style.transform = `rotate(${35 + angle}deg)`;

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
        line.setAttribute("opacity", String(fade * 0.55));
        line.setAttribute("stroke-width", String(2.6 * fade + 0.4));
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
        <div
          ref={nibRef}
          style={{
            position: "relative",
            marginLeft: -3,
            marginTop: -16,
            width: 16,
            height: 24,
            transformOrigin: "50% 15%",
            clipPath: "polygon(50% 0%, 100% 38%, 58% 100%, 42% 100%, 0% 38%)",
            background: "linear-gradient(135deg, #e3c27e, #9a752f 60%, #6e5320)",
            boxShadow: "0 4px 8px rgba(30,25,15,.4)",
            animation: isWriting ? "penWriting .38s ease-in-out infinite" : "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "40%",
              width: 1,
              height: "55%",
              background: "rgba(30,20,10,.55)",
              transform: "translateX(-50%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: -2,
              width: 3,
              height: 3,
              borderRadius: "50%",
              background: INK,
              transform: "translateX(-50%)",
              boxShadow: isWriting ? `0 0 4px 1px ${INK_LIGHT}` : "none",
            }}
          />
        </div>
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
