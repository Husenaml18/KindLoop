"use client";

import type { CSSProperties, ReactNode } from "react";

/**
 * The things that fell out of the envelope.
 *
 * Small objects, each standing for one Kindloop experience — a polaroid for the
 * scrapbook, a vinyl record for a voice memory, a boarding pass for the hunt. They
 * are drawn rather than photographed, because a stock photograph of a polaroid is
 * somebody else's picture of somebody else's memory, and because a dozen images is
 * a megabyte of loading on a page nobody meant to visit.
 *
 * Each is small, high-contrast at a glance, and readable at 60px — they are seen
 * in motion, at an angle, out of the corner of an eye.
 */

const PAPER = "#fdfaf1";
const PAPER_WARM = "#f6ead2";
const INK = "#4a3722";
const INK_SOFT = "#8a7458";
const RUST = "#b5502e";
const BRASS = "#c9922f";

/** The card every paper object is built on. */
function Card({
  w,
  h,
  children,
  style,
}: {
  w: number;
  h: number;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 3,
        background: PAPER,
        boxShadow: "0 14px 26px -14px rgba(58,36,14,.55), 0 1px 2px rgba(58,36,14,.14)",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** A stand-in for a photograph: warm bands, never a real picture. */
function Snap({ w, h, hue = 0 }: { w: number; h: number; hue?: number }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 1.5,
        background: `linear-gradient(155deg, hsl(${28 + hue} 62% 74%), hsl(${12 + hue} 48% 56%) 52%, hsl(${200 + hue} 26% 46%))`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <span
        style={{
          position: "absolute",
          left: "14%",
          bottom: 0,
          width: "72%",
          height: "38%",
          background: "rgba(52,38,22,.34)",
          borderRadius: "50% 50% 0 0",
        }}
      />
      <span
        style={{
          position: "absolute",
          right: "18%",
          top: "16%",
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "rgba(255,240,200,.9)",
        }}
      />
    </div>
  );
}

/** Ruled lines standing in for handwriting. */
function Lines({ n = 3, width = 34, color = INK_SOFT }: { n?: number; width?: number; color?: string }) {
  return (
    <div style={{ display: "grid", gap: 3.5 }}>
      {Array.from({ length: n }, (_, i) => (
        <span
          key={i}
          style={{
            height: 1.5,
            borderRadius: 1,
            background: color,
            opacity: 0.42,
            width: i === n - 1 ? width * 0.55 : width,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The pieces                                                          */
/* ------------------------------------------------------------------ */

export function Polaroid() {
  return (
    <Card w={62} h={74} style={{ padding: 5, paddingBottom: 16, background: PAPER }}>
      <Snap w={52} h={52} />
      <span
        style={{
          position: "absolute",
          left: 9,
          bottom: 3,
          fontFamily: "var(--font-gochi), cursive",
          fontSize: 9,
          color: INK_SOFT,
        }}
      >
        us, that day
      </span>
    </Card>
  );
}

export function LoveLetter() {
  return (
    <Card w={64} h={50} style={{ padding: "9px 10px", background: PAPER_WARM }}>
      <span style={{ fontFamily: "var(--font-gochi), cursive", fontSize: 10, color: RUST }}>My love,</span>
      <div style={{ marginTop: 5 }}>
        <Lines n={3} width={42} />
      </div>
    </Card>
  );
}

export function VoiceCard() {
  return (
    <Card w={70} h={38} style={{ padding: "0 10px", display: "flex", alignItems: "center", gap: 7 }}>
      <span
        style={{
          width: 15,
          height: 15,
          borderRadius: "50%",
          background: RUST,
          display: "grid",
          placeItems: "center",
          flex: "0 0 auto",
        }}
      >
        <span
          style={{
            width: 0,
            height: 0,
            borderTop: "3.5px solid transparent",
            borderBottom: "3.5px solid transparent",
            borderLeft: "5px solid #fff6e6",
            marginLeft: 1.5,
          }}
        />
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
        {[6, 11, 5, 14, 8, 12, 4, 9, 6].map((bar, i) => (
          <span key={i} style={{ width: 2, height: bar, borderRadius: 1, background: INK_SOFT, opacity: 0.6 }} />
        ))}
      </span>
    </Card>
  );
}

export function Cassette() {
  return (
    <Card w={72} h={46} style={{ background: "#3d2b1a", padding: 6 }}>
      <div style={{ height: 12, borderRadius: 2, background: PAPER_WARM, opacity: 0.9 }} />
      <div
        style={{
          marginTop: 5,
          height: 20,
          borderRadius: 3,
          background: "rgba(255,236,196,.16)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          padding: "0 8px",
        }}
      >
        {[0, 1].map((i) => (
          <span
            key={i}
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              border: `2px solid ${BRASS}`,
              background: "#2c1f12",
            }}
          />
        ))}
      </div>
    </Card>
  );
}

export function TravelTicket() {
  return (
    <Card w={80} h={36} style={{ display: "flex", background: PAPER_WARM }}>
      <div style={{ flex: 1, padding: "6px 8px" }}>
        <span
          style={{
            fontFamily: "var(--font-ibm-plex-mono), monospace",
            fontSize: 6.5,
            letterSpacing: ".14em",
            color: INK_SOFT,
          }}
        >
          BOARDING
        </span>
        <div style={{ marginTop: 3 }}>
          <Lines n={2} width={38} />
        </div>
      </div>
      {/* The perforation, drawn as a dashed rule rather than notched out. */}
      <div style={{ width: 1, borderLeft: `1.5px dashed ${INK_SOFT}`, opacity: 0.5 }} />
      <div
        style={{
          width: 22,
          display: "grid",
          placeItems: "center",
          fontFamily: "var(--font-fraunces), serif",
          fontSize: 13,
          color: RUST,
        }}
      >
        ✈
      </div>
    </Card>
  );
}

export function WaxSeal({ size = 40 }: { size?: number }) {
  return (
    <span
      style={{
        display: "grid",
        placeItems: "center",
        width: size,
        height: size,
        borderRadius: "50%",
        background: "radial-gradient(circle at 34% 28%, #c95a34, #8a3a1e 60%, #64270f)",
        boxShadow: "0 8px 18px -8px rgba(90,30,12,.85), inset 0 1.5px 2px rgba(255,220,190,.45)",
        color: "#ffd9b0",
        fontFamily: "var(--font-fraunces), serif",
        fontSize: size * 0.4,
      }}
    >
      K
    </span>
  );
}

export function CountdownCard() {
  return (
    <Card w={66} h={44} style={{ display: "grid", placeItems: "center", gap: 2, background: "#33240f" }}>
      <span style={{ display: "flex", gap: 4 }}>
        {["07", "12", "45"].map((n) => (
          <span
            key={n}
            style={{
              fontFamily: "var(--font-ibm-plex-mono), monospace",
              fontSize: 13,
              color: BRASS,
              background: "rgba(255,236,190,.08)",
              borderRadius: 2,
              padding: "1px 3px",
            }}
          >
            {n}
          </span>
        ))}
      </span>
      <span
        style={{
          fontFamily: "var(--font-ibm-plex-mono), monospace",
          fontSize: 5.5,
          letterSpacing: ".2em",
          color: "rgba(255,236,190,.5)",
        }}
      >
        DAYS HRS MIN
      </span>
    </Card>
  );
}

export function PressedFlower() {
  return (
    <span style={{ display: "block", width: 52, height: 52 }}>
      <svg viewBox="0 0 52 52" width="52" height="52" aria-hidden>
        <g transform="translate(26 27)">
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <ellipse
              key={a}
              cx="0"
              cy="-11"
              rx="6.5"
              ry="11"
              transform={`rotate(${a})`}
              fill="#e9a9b8"
              opacity="0.86"
            />
          ))}
          <circle cx="0" cy="0" r="5" fill={BRASS} />
        </g>
        <path d="M26 34 C 24 42, 22 46, 18 50" stroke="#7d8f5a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function FilmStrip() {
  return (
    <div
      style={{
        width: 40,
        height: 78,
        borderRadius: 3,
        background: "#2c2016",
        padding: "5px 4px",
        display: "grid",
        gap: 4,
        boxShadow: "0 14px 26px -14px rgba(58,36,14,.6)",
      }}
    >
      {[0, 22, 44].map((hue) => (
        <div key={hue} style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Sprockets />
          <Snap w={20} h={18} hue={hue} />
          <Sprockets />
        </div>
      ))}
    </div>
  );
}

function Sprockets() {
  return (
    <span style={{ display: "grid", gap: 2 }}>
      {[0, 1].map((i) => (
        <span key={i} style={{ width: 3, height: 3, borderRadius: 0.5, background: "rgba(255,236,196,.55)" }} />
      ))}
    </span>
  );
}

export function TinyHeart() {
  return (
    <svg viewBox="0 0 32 30" width="30" height="28" aria-hidden>
      <path
        d="M16 28 C 4 19, 1 12, 4.5 7 C 7.6 2.6, 13.4 3.4, 16 8 C 18.6 3.4, 24.4 2.6, 27.5 7 C 31 12, 28 19, 16 28 Z"
        fill="#e0748b"
      />
    </svg>
  );
}

export function DigitalRose() {
  return (
    <span style={{ display: "block", width: 44, height: 58 }}>
      <svg viewBox="0 0 44 58" width="44" height="58" aria-hidden>
        <path d="M22 26 L22 55" stroke="#7d8f5a" strokeWidth="2" strokeLinecap="round" />
        <path d="M22 40 C 15 38, 12 42, 12 45 C 17 46, 21 44, 22 40 Z" fill="#7d8f5a" />
        <g transform="translate(22 20)">
          <circle r="14" fill="#c9455f" />
          <circle r="10" fill="#d9566f" />
          <path d="M-6 0 A 6 6 0 1 1 6 0 A 4 4 0 1 0 -2 0" fill="#a83248" opacity=".8" />
          <circle r="3" fill="#8e2438" />
        </g>
      </svg>
    </span>
  );
}

export function SmallEnvelope() {
  return (
    <div
      style={{
        width: 66,
        height: 44,
        borderRadius: 3,
        background: PAPER_WARM,
        boxShadow: "0 14px 26px -14px rgba(58,36,14,.55)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderTop: `22px solid ${PAPER}`,
          borderLeft: "33px solid transparent",
          borderRight: "33px solid transparent",
          filter: "brightness(.97)",
        }}
      />
      <span
        style={{
          position: "absolute",
          left: "50%",
          top: 17,
          transform: "translateX(-50%)",
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: "radial-gradient(circle at 34% 28%, #c95a34, #8a3a1e)",
        }}
      />
    </div>
  );
}

export function TreasureMap() {
  return (
    <Card w={78} h={58} style={{ background: "#e8d6ac", padding: 6 }}>
      <svg viewBox="0 0 66 46" width="66" height="46" aria-hidden>
        <path
          d="M4 34 C 14 26, 12 16, 24 14 C 34 12.5, 36 24, 46 22 C 54 20.5, 56 12, 62 10"
          stroke={RUST}
          strokeWidth="1.6"
          strokeDasharray="3 3.5"
          fill="none"
          strokeLinecap="round"
        />
        <path d="M2 40 C 16 44, 30 38, 44 41" stroke={INK_SOFT} strokeWidth="1" opacity=".45" fill="none" />
        <g transform="translate(60 9)" stroke={INK} strokeWidth="2" strokeLinecap="round">
          <path d="M-4 -4 L4 4" />
          <path d="M4 -4 L-4 4" />
        </g>
        <circle cx="4" cy="34" r="2.4" fill={INK} />
      </svg>
    </Card>
  );
}

export function PuzzlePiece() {
  return (
    <svg viewBox="0 0 54 54" width="50" height="50" aria-hidden>
      <defs>
        <linearGradient id="kl-puz" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e2b877" />
          <stop offset="1" stopColor="#b98442" />
        </linearGradient>
      </defs>
      <path
        d="M6 6 H21 A5.5 5.5 0 0 1 32 6 H47 V21 A5.5 5.5 0 0 0 47 32 V47 H32 A5.5 5.5 0 0 0 21 47 H6 V32 A5.5 5.5 0 0 0 6 21 Z"
        fill="url(#kl-puz)"
        stroke="rgba(90,58,24,.35)"
        strokeWidth="1.2"
      />
      <path d="M13 14 H26" stroke="rgba(255,246,224,.5)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function VinylRecord({ size = 60 }: { size?: number }) {
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} aria-hidden>
      <circle cx="30" cy="30" r="29" fill="#2a1f14" />
      {[24, 19, 14].map((r) => (
        <circle key={r} cx="30" cy="30" r={r} fill="none" stroke="rgba(255,236,196,.1)" strokeWidth="1" />
      ))}
      {/* The sheen a record catches under a lamp. */}
      <path d="M8 44 A 29 29 0 0 1 44 8" stroke="rgba(255,240,210,.16)" strokeWidth="7" fill="none" strokeLinecap="round" />
      <circle cx="30" cy="30" r="10" fill={RUST} />
      <circle cx="30" cy="30" r="2.4" fill="#f6ead2" />
    </svg>
  );
}

export function GiftBox({ size = 56 }: { size?: number }) {
  return (
    <svg viewBox="0 0 56 56" width={size} height={size} aria-hidden>
      <rect x="6" y="20" width="44" height="30" rx="3" fill="#c95a34" />
      <rect x="3" y="13" width="50" height="10" rx="2.5" fill="#e07a4c" />
      <rect x="24" y="13" width="8" height="37" fill="#f2cf87" />
      {/* The bow, two loops and a knot. */}
      <path d="M28 13 C 20 13, 16 5, 22 4 C 27 3.2, 28 9, 28 13 Z" fill="#f2cf87" />
      <path d="M28 13 C 36 13, 40 5, 34 4 C 29 3.2, 28 9, 28 13 Z" fill="#f2cf87" />
      <circle cx="28" cy="12" r="3" fill="#e8bd6a" />
    </svg>
  );
}

export function TinyStar({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden>
      <path d="M10 0 L11.6 8.4 L20 10 L11.6 11.6 L10 20 L8.4 11.6 L0 10 L8.4 8.4 Z" fill="#f2cf87" />
    </svg>
  );
}

/**
 * The shelf at the bottom of the 404.
 *
 * Eight keepsakes somebody left behind, each one a way into a real experience.
 * A footer here would have been a list of links under a story about lost
 * memories, which is the moment the story stops being one; a shelf keeps the
 * fiction and does the footer's job anyway.
 *
 * Every item points at something that actually exists and can be opened right
 * now — a shelf of things you cannot pick up is a worse dead end than the 404.
 */
export const SHELF_KEEPSAKES: {
  id: string;
  label: string;
  note: string;
  href: string;
  render: () => ReactNode;
}[] = [
  { id: "s-polaroid", label: "A faded Polaroid", note: "Digital Scrapbook", href: "/demo/digital-scrapbook", render: () => <Polaroid /> },
  { id: "s-letter", label: "An unopened letter", note: "Love Letter", href: "/demo/love-letter", render: () => <SmallEnvelope /> },
  { id: "s-puzzle", label: "One missing piece", note: "Memory Puzzle", href: "/demo/memory-puzzle", render: () => <PuzzlePiece /> },
  { id: "s-rose", label: "A digital rose", note: "Mother's Day Letter", href: "/demo/mothers-day-letter", render: () => <DigitalRose /> },
  { id: "s-vinyl", label: "A vinyl record", note: "Memoryverse", href: "/demo/memoryverse", render: () => <VinylRecord /> },
  { id: "s-gift", label: "A tiny gift box", note: "Surprise Reveal Box", href: "/demo/surprise-reveal-box", render: () => <GiftBox /> },
  { id: "s-ticket", label: "A boarding pass", note: "Treasure Hunt", href: "/demo/treasure-hunt", render: () => <TravelTicket /> },
  { id: "s-flower", label: "A pressed flower", note: "Open When", href: "/demo/open-when", render: () => <PressedFlower /> },
];
