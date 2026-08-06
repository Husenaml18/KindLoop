"use client";

import { motion } from "framer-motion";
import { cssStyle, photoStyle } from "@/lib/uiStyle";
import { TEMPLATE_CATALOG } from "@/lib/templateCatalog";

export type MemoryKind =
  | "polaroid"
  | "scrapbook"
  | "letter"
  | "voice"
  | "filmstrip"
  | "countdown"
  | "boardingpass"
  | "gifttag";

export interface HeroMemory {
  id: string;
  name: string;
  blurb: string;
  href: string;
  available: boolean;
  kind: MemoryKind;
  photoIndex: number;
  /** Absolute placement inside the hero stage. */
  place: string;
  /** Resting rotation, degrees. */
  rotate: number;
  /** Parallax strength, 0..1 — higher reacts more to the cursor. */
  depth: number;
  /** Rough vector back toward the envelope mouth, used as the emergence origin. */
  from: { x: number; y: number };
  /** Each object's own floating personality. */
  float: { dur: number; y: number; rot: number; delay: number };
  emergeDelay: number;
}

const HERO_MEMORY_SEEDS: Omit<HeroMemory, "href" | "available">[] = [
  {
    id: "memoryverse",
    name: "Memoryverse",
    blurb: "A timeline they scroll from the very beginning.",
    kind: "polaroid",
    photoIndex: 0,
    place: "left:1%;top:3%;width:186px",
    rotate: -7,
    depth: 0.34,
    from: { x: 150, y: 150 },
    float: { dur: 9.5, y: 13, rot: 2.4, delay: 0 },
    emergeDelay: 0,
  },
  {
    id: "love-letter",
    name: "Love Letter",
    blurb: "One long letter, set like a page from a book.",
    kind: "letter",
    photoIndex: 1,
    place: "right:2%;top:1%;width:206px",
    rotate: 5,
    depth: 0.62,
    from: { x: -130, y: 170 },
    float: { dur: 11.5, y: 17, rot: -3.2, delay: 0.6 },
    emergeDelay: 0.14,
  },
  {
    id: "digital-scrapbook",
    name: "Digital Scrapbook",
    blurb: "Pages you lay out yourself, and they actually flip.",
    kind: "scrapbook",
    photoIndex: 2,
    place: "left:20%;top:47%;width:232px",
    rotate: 3,
    depth: 0.46,
    from: { x: 70, y: -30 },
    float: { dur: 13, y: 11, rot: 1.8, delay: 1.2 },
    emergeDelay: 0.28,
  },
  {
    id: "voice-memory",
    name: "Voice Memory",
    blurb: "Your voice over every photo — thirty seconds is plenty.",
    kind: "voice",
    photoIndex: 3,
    place: "right:0%;top:31%;width:196px",
    rotate: -4,
    depth: 0.86,
    from: { x: -150, y: 40 },
    float: { dur: 8.5, y: 15, rot: 2.8, delay: 0.3 },
    emergeDelay: 0.42,
  },
  {
    id: "birthday-surprise",
    name: "Birthday Surprise",
    blurb: "Confetti and a reveal, then the memories underneath.",
    kind: "filmstrip",
    photoIndex: 4,
    place: "left:3%;bottom:5%;width:104px",
    rotate: -11,
    depth: 0.4,
    from: { x: 130, y: -130 },
    float: { dur: 10.5, y: 19, rot: 3.4, delay: 0.9 },
    emergeDelay: 0.56,
  },
  {
    id: "countdown-gift",
    name: "Countdown Gift",
    blurb: "Unwraps a little each day, down to the day that matters.",
    kind: "countdown",
    photoIndex: 5,
    place: "right:17%;bottom:1%;width:146px",
    rotate: 6,
    depth: 0.74,
    from: { x: -80, y: -120 },
    float: { dur: 12, y: 14, rot: -2.6, delay: 1.6 },
    emergeDelay: 0.7,
  },
  {
    id: "memory-time-capsule",
    name: "Memory Time Capsule",
    blurb: "Sealed until the date you choose, then it opens itself.",
    kind: "boardingpass",
    photoIndex: 6,
    place: "right:5%;top:58%;width:180px",
    rotate: -3,
    depth: 0.56,
    from: { x: -110, y: -50 },
    float: { dur: 14, y: 12, rot: 2.2, delay: 2.1 },
    emergeDelay: 0.84,
  },
  {
    id: "proposal-page",
    name: "Proposal Page",
    blurb: "The whole story first, then the question at the end.",
    kind: "gifttag",
    photoIndex: 7,
    place: "left:4%;top:42%;width:126px",
    rotate: -9,
    depth: 0.28,
    from: { x: 140, y: -20 },
    float: { dur: 10, y: 16, rot: -3.8, delay: 1.4 },
    emergeDelay: 0.98,
  },
];

/**
 * Availability and links come from the catalog rather than being repeated here —
 * so a template going live never leaves the landing page saying "coming soon".
 */
export const HERO_MEMORIES: HeroMemory[] = HERO_MEMORY_SEEDS.map((seed) => {
  const entry = TEMPLATE_CATALOG.find((t) => t.id === seed.id);
  const live = entry?.status === "available";
  return {
    ...seed,
    available: live,
    href: live && entry ? entry.href : "#templates",
  };
});


/* ---------- the floating "prop" form of each memory ---------- */

function Polaroid({ photos, m, hovered }: { photos: string[]; m: HeroMemory; hovered: boolean }) {
  return (
    <div style={cssStyle("padding:11px 11px 42px;background:var(--paper);border-radius:4px")}>
      <div style={photoStyle(photos, m.photoIndex, "height:158px;border-radius:2px", "var(--tan)")} />
      <div style={cssStyle("position:absolute;left:13px;bottom:11px;font-family:var(--font-gochi),cursive;font-size:19px;color:var(--ink)")}>
        our first trip
      </div>
      <motion.div
        aria-hidden
        animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 6 }}
        transition={{ duration: 0.25 }}
        style={cssStyle("position:absolute;right:9px;bottom:9px;width:38px;height:30px;border-radius:2px;border:2px solid var(--paper);box-shadow:0 4px 10px rgba(30,20,12,.35)")}
      >
        <div style={photoStyle(photos, m.photoIndex + 3, "position:absolute;inset:0", "var(--tan-deep)")} />
      </motion.div>
      <div style={cssStyle("position:absolute;left:-15px;top:-9px;width:64px;height:20px;transform:rotate(-14deg);background:rgba(217,164,92,.5)")} />
    </div>
  );
}

function Letter({ hovered }: { hovered: boolean }) {
  return (
    <div style={cssStyle("padding:17px;background:var(--paper);border-radius:6px")}>
      <div style={cssStyle("font-family:var(--font-ibm-plex-mono),monospace;font-size:8.5px;letter-spacing:.12em;color:var(--label-on-paper)")}>
        OPEN WHEN YOU MISS ME
      </div>
      <div style={cssStyle("margin-top:10px;font-family:var(--font-fraunces),serif;font-size:20px;line-height:1.22;color:var(--ink)")}>
        You&apos;d already made me laugh twice.
      </div>
      <motion.div
        animate={{ height: hovered ? 26 : 0, opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
        style={{ overflow: "hidden" }}
      >
        <div style={cssStyle("margin-top:9px;font-family:var(--font-gochi),cursive;font-size:16px;color:var(--rust)")}>
          — and I kept the receipt
        </div>
      </motion.div>
      <div style={cssStyle("margin-top:11px;display:grid;gap:6px")}>
        <div style={cssStyle("height:1px;background:rgba(43,32,19,.14)")} />
        <div style={cssStyle("height:1px;background:rgba(43,32,19,.14)")} />
        <div style={cssStyle("height:1px;background:rgba(43,32,19,.14);width:58%")} />
      </div>
    </div>
  );
}

function Scrapbook({ photos, m, hovered }: { photos: string[]; m: HeroMemory; hovered: boolean }) {
  return (
    <div style={cssStyle("position:relative;padding:13px;background:var(--paper);border-radius:6px")}>
      <div style={cssStyle("display:grid;grid-template-columns:1fr 1fr;gap:7px")}>
        <div style={photoStyle(photos, m.photoIndex, "height:76px;border-radius:3px", "var(--khaki-pale)")} />
        <div style={photoStyle(photos, m.photoIndex + 1, "height:76px;border-radius:3px", "var(--tan)")} />
      </div>
      <div style={cssStyle("margin-top:9px;display:flex;align-items:center;justify-content:space-between")}>
        <span style={cssStyle("font-family:var(--font-gochi),cursive;font-size:17px;color:var(--ink-muted)")}>page 4 of 12</span>
        <span style={cssStyle("font-family:var(--font-ibm-plex-mono),monospace;font-size:8px;letter-spacing:.08em;color:var(--label-on-paper)")}>SCRAPBOOK</span>
      </div>
      {/* the page corner peels up on hover */}
      <motion.div
        aria-hidden
        animate={{ rotate: hovered ? -22 : 0, x: hovered ? -3 : 0, y: hovered ? -3 : 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          width: 26,
          height: 26,
          transformOrigin: "100% 100%",
          background: "linear-gradient(135deg, transparent 48%, var(--paper-muted) 50%)",
          borderBottomRightRadius: 6,
          boxShadow: "-2px -2px 5px rgba(30,20,12,.14)",
        }}
      />
    </div>
  );
}

function VoiceCard({ hovered }: { hovered: boolean }) {
  const bars = [38, 78, 52, 100, 60, 32, 72, 44, 88, 56];
  return (
    <div style={cssStyle("padding:14px 15px;background:rgba(242,233,212,.95);border-radius:8px")}>
      <div style={cssStyle("font-family:var(--font-gochi),cursive;font-size:16px;color:var(--ink-muted)")}>
        A voice I never want to forget
      </div>
      <div style={cssStyle("margin-top:10px;display:flex;align-items:center;gap:9px")}>
        <div style={cssStyle("width:26px;height:26px;border-radius:50%;background:var(--deep);display:flex;align-items:center;justify-content:center")}>
          <div style={cssStyle("width:0;height:0;border-left:7px solid var(--paper);border-top:4.5px solid transparent;border-bottom:4.5px solid transparent;margin-left:2px")} />
        </div>
        <div style={cssStyle("display:flex;align-items:flex-end;gap:2.5px;height:24px")}>
          {bars.map((h, i) => (
            <motion.div
              key={i}
              animate={
                hovered
                  ? { height: [`${h}%`, `${Math.max(18, 118 - h)}%`, `${h}%`] }
                  : { height: `${h}%` }
              }
              transition={
                hovered
                  ? { duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.05 }
                  : { duration: 0.3 }
              }
              style={{
                width: 3,
                borderRadius: 2,
                background: h >= 70 ? "var(--deep)" : "var(--tan-deep)",
              }}
            />
          ))}
        </div>
      </div>
      <div style={cssStyle("margin-top:8px;font-family:var(--font-ibm-plex-mono),monospace;font-size:8.5px;letter-spacing:.08em;color:var(--label-on-paper)")}>
        02:36
      </div>
    </div>
  );
}

const CONFETTI = [
  { x: -16, y: -22, r: 24, c: "var(--rust)" },
  { x: 4, y: -30, r: -18, c: "var(--brass-bright)" },
  { x: 20, y: -20, r: 40, c: "var(--rust-light)" },
  { x: -6, y: -34, r: 8, c: "var(--khaki-light)" },
];

function FilmStrip({ photos, m, hovered }: { photos: string[]; m: HeroMemory; hovered: boolean }) {
  return (
    <div style={cssStyle("position:relative;padding:6px;background:var(--deep2);border-radius:4px")}>
      <div style={cssStyle("display:grid;gap:5px")}>
        <div style={photoStyle(photos, m.photoIndex, "height:46px;border-radius:2px", "var(--tan-deep)")} />
        <div style={photoStyle(photos, m.photoIndex + 1, "height:46px;border-radius:2px", "var(--khaki)")} />
        <div style={photoStyle(photos, m.photoIndex + 2, "height:46px;border-radius:2px", "var(--tan)")} />
      </div>
      {CONFETTI.map((c, i) => (
        <motion.span
          key={i}
          aria-hidden
          animate={hovered ? { opacity: [0, 1, 0], x: c.x, y: c.y, rotate: c.r } : { opacity: 0, x: 0, y: 0 }}
          transition={hovered ? { duration: 1.1, repeat: Infinity, delay: i * 0.16 } : { duration: 0.2 }}
          style={{
            position: "absolute",
            left: "50%",
            top: 8,
            width: 5,
            height: 8,
            borderRadius: 1,
            background: c.c,
          }}
        />
      ))}
    </div>
  );
}

function Countdown({ hovered }: { hovered: boolean }) {
  return (
    <div style={cssStyle("padding:12px;background:var(--paper);border-radius:6px")}>
      <div style={cssStyle("font-family:var(--font-gochi),cursive;font-size:15px;color:var(--ink-muted);text-align:center")}>
        Countdown to our next adventure
      </div>
      <div style={cssStyle("margin-top:9px;display:flex;justify-content:center;gap:8px")}>
        {[
          { v: "27", l: "days" },
          { v: "09", l: "hours" },
          { v: "36", l: "mins" },
        ].map((u, i) => (
          <div key={u.l} style={cssStyle("text-align:center")}>
            <motion.div
              animate={hovered && i === 2 ? { rotateX: [0, -90, 0] } : { rotateX: 0 }}
              transition={hovered && i === 2 ? { duration: 0.7, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
              style={{
                fontFamily: "var(--font-fraunces), serif",
                fontSize: 19,
                color: "var(--ink)",
                transformStyle: "preserve-3d",
              }}
            >
              {u.v}
            </motion.div>
            <div style={cssStyle("font-family:var(--font-ibm-plex-mono),monospace;font-size:7.5px;letter-spacing:.06em;color:var(--label-on-paper)")}>
              {u.l}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BoardingPass({ hovered }: { hovered: boolean }) {
  return (
    <div style={cssStyle("border-radius:6px;overflow:hidden;background:var(--deep)")}>
      <div style={cssStyle("padding:7px 11px;font-family:var(--font-ibm-plex-mono),monospace;font-size:7.5px;letter-spacing:.14em;color:var(--on-dark-muted);border-bottom:1px dashed rgba(242,233,212,.25)")}>
        BOARDING PASS
      </div>
      <div style={cssStyle("padding:10px 11px 12px;display:flex;align-items:flex-end;justify-content:space-between;gap:8px")}>
        <div>
          <div style={cssStyle("font-family:var(--font-ibm-plex-mono),monospace;font-size:7px;letter-spacing:.1em;color:var(--on-dark-muted)")}>TO:</div>
          <div style={cssStyle("margin-top:2px;font-family:var(--font-fraunces),serif;font-size:14px;line-height:1.15;color:var(--on-dark)")}>
            Our next
            <br />
            chapter
          </div>
        </div>
        <motion.span
          animate={hovered ? { x: [0, 7, 0] } : { x: 0 }}
          transition={hovered ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
          style={{ fontSize: 14 }}
        >
          ✈
        </motion.span>
      </div>
    </div>
  );
}

function GiftTag({ hovered }: { hovered: boolean }) {
  return (
    <div style={cssStyle("position:relative;padding:12px 12px 14px;background:var(--paper-muted);border-radius:5px")}>
      <div style={cssStyle("position:absolute;left:50%;top:5px;width:8px;height:8px;margin-left:-4px;border-radius:50%;border:1.5px solid rgba(43,32,19,.4)")} />
      <div style={cssStyle("margin-top:11px;font-family:var(--font-gochi),cursive;font-size:15px;line-height:1.32;color:var(--ink);text-align:center")}>
        To the one who makes life beautiful
      </div>
      <motion.div
        animate={{ scale: hovered ? [1, 1.25, 1] : 1 }}
        transition={hovered ? { duration: 1, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
        style={{ marginTop: 6, textAlign: "center", fontSize: 12, color: "var(--rust)" }}
      >
        ♡
      </motion.div>
    </div>
  );
}

export function MemoryProp({
  memory,
  photos,
  hovered,
}: {
  memory: HeroMemory;
  photos: string[];
  hovered: boolean;
}) {
  switch (memory.kind) {
    case "polaroid":
      return <Polaroid photos={photos} m={memory} hovered={hovered} />;
    case "letter":
      return <Letter hovered={hovered} />;
    case "scrapbook":
      return <Scrapbook photos={photos} m={memory} hovered={hovered} />;
    case "voice":
      return <VoiceCard hovered={hovered} />;
    case "filmstrip":
      return <FilmStrip photos={photos} m={memory} hovered={hovered} />;
    case "countdown":
      return <Countdown hovered={hovered} />;
    case "boardingpass":
      return <BoardingPass hovered={hovered} />;
    case "gifttag":
      return <GiftTag hovered={hovered} />;
  }
}
