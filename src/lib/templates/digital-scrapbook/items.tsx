"use client";

import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { ScrapItem, ItemKind } from "./schema";
import { PAPER_GRAIN, type PageTheme } from "./theme";

/** Items that open into something bigger when touched. */
const OPENABLE: ItemKind[] = ["photo", "polaroid", "letter", "ticket", "postcard", "pocket", "journal", "filmstrip", "tag"];

export function isOpenable(item: ScrapItem): boolean {
  if (!OPENABLE.includes(item.kind)) return false;
  if (item.kind === "pocket" || item.kind === "letter") return true;
  if (item.kind === "tag") return Boolean(item.hiddenText || item.hiddenImageUrl);
  return Boolean(item.imageUrl || item.text || item.hiddenText || item.hiddenImageUrl);
}

/** Deterministic jitter so every item sits slightly imperfectly, but stably. */
function wobble(seed: string, spread: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) % 1000;
  return ((h / 1000) * 2 - 1) * spread;
}

const paperShadow = "0 10px 22px -12px rgba(58,40,22,.45), 0 2px 4px rgba(58,40,22,.16)";

function Grain({ opacity = 0.4 }: { opacity?: number }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ backgroundImage: PAPER_GRAIN, opacity, mixBlendMode: "multiply" }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Individual handmade objects                                         */
/* ------------------------------------------------------------------ */

function Photo({ item, t }: { item: ScrapItem; t: PageTheme }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative" style={{ padding: "3.5%", background: "#fffdf6", boxShadow: paperShadow }}>
      <div className="relative overflow-hidden" style={{ aspectRatio: "4 / 3", background: t.paperEdge }}>
        {item.imageUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={item.imageUrl}
            alt={item.caption || "A photo"}
            onLoad={() => setLoaded(true)}
            className="h-full w-full object-cover"
            style={{ filter: loaded ? "none" : "blur(12px)", transition: "filter .8s ease" }}
          />
        )}
      </div>
      {item.caption && (
        <div className="pt-[3%] text-center" style={{ fontFamily: t.handFont, color: t.ink, fontSize: "clamp(9px,1.1vw,15px)" }}>
          {item.caption}
        </div>
      )}
      <Grain opacity={0.18} />
    </div>
  );
}

function Polaroid({ item, t }: { item: ScrapItem; t: PageTheme }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div
      className="relative"
      style={{ padding: "6% 6% 18%", background: "#fffef8", boxShadow: paperShadow }}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: "1 / 1", background: "#2b2620" }}>
        {item.imageUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={item.imageUrl}
            alt={item.caption || "A polaroid"}
            onLoad={() => setLoaded(true)}
            className="h-full w-full object-cover"
            style={{ filter: loaded ? "none" : "blur(14px)", transition: "filter .9s ease" }}
          />
        )}
      </div>
      {item.caption && (
        <div
          className="absolute inset-x-[8%] bottom-[4%] text-center leading-tight"
          style={{ fontFamily: t.handFont, color: t.ink, fontSize: "clamp(9px,1.15vw,16px)" }}
        >
          {item.caption}
        </div>
      )}
      <Grain opacity={0.14} />
    </div>
  );
}

function Note({ item, t }: { item: ScrapItem; t: PageTheme }) {
  return (
    <div
      className="relative leading-[1.45]"
      style={{
        fontFamily: t.handFont,
        color: item.color || t.ink,
        fontSize: "clamp(11px,1.5vw,21px)",
      }}
    >
      {item.text}
    </div>
  );
}

function Title({ item, t }: { item: ScrapItem; t: PageTheme }) {
  return (
    <div className="relative">
      <div
        style={{
          fontFamily: t.handFont,
          color: item.color || t.ink,
          fontSize: "clamp(17px,2.9vw,44px)",
          lineHeight: 1.1,
        }}
      >
        {item.text}
      </div>
      <svg aria-hidden viewBox="0 0 200 10" preserveAspectRatio="none" className="mt-[3%] block h-[8px] w-full">
        <path
          d="M2 6 C 40 2, 70 9, 108 5 S 168 3, 198 7"
          fill="none"
          stroke={item.color || t.accent}
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity="0.65"
        />
      </svg>
    </div>
  );
}

function Journal({ item, t }: { item: ScrapItem; t: PageTheme }) {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: `repeating-linear-gradient(to bottom, transparent 0 8.5%, ${t.accentSoft} 8.5% 8.7%)`,
        backgroundColor: "#fffdf4",
        padding: "5% 5% 6%",
        boxShadow: paperShadow,
        borderLeft: `2px solid ${t.accent}55`,
      }}
    >
      <p
        className="m-0 whitespace-pre-line"
        style={{ fontFamily: t.handFont, color: t.ink, fontSize: "clamp(10px,1.25vw,17px)", lineHeight: 1.75 }}
      >
        {item.text}
      </p>
      <Grain opacity={0.2} />
    </div>
  );
}

function Sticky({ item, t }: { item: ScrapItem; t: PageTheme }) {
  return (
    <div
      className="relative flex items-center justify-center text-center"
      style={{
        aspectRatio: "1 / 1",
        background: item.color || "#f3e08a",
        padding: "9%",
        boxShadow: "0 8px 16px -8px rgba(58,40,22,.4)",
        fontFamily: t.handFont,
        color: "#4a3f22",
        fontSize: "clamp(9px,1.15vw,16px)",
        lineHeight: 1.3,
      }}
    >
      {item.text}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{ height: "22%", background: "linear-gradient(to bottom, rgba(255,255,255,.35), transparent)" }}
      />
    </div>
  );
}

function Ticket({ item, t }: { item: ScrapItem; t: PageTheme }) {
  return (
    <div
      className="relative overflow-hidden"
      style={{ background: item.color || t.accent, boxShadow: paperShadow, borderRadius: 3 }}
    >
      <div className="px-[7%] py-[8%] text-center">
        <div
          style={{
            fontFamily: t.titleFont,
            color: "#fffdf4",
            fontSize: "clamp(9px,1.05vw,15px)",
            letterSpacing: ".14em",
          }}
        >
          {item.text || "TICKET"}
        </div>
        <div
          aria-hidden
          className="my-[7%]"
          style={{ borderTop: "1.5px dashed rgba(255,253,244,.55)" }}
        />
        <div
          style={{
            fontFamily: t.titleFont,
            color: "rgba(255,253,244,.82)",
            fontSize: "clamp(7px,.85vw,12px)",
            letterSpacing: ".18em",
          }}
        >
          {item.meta || "ADMIT ONE"}
        </div>
      </div>
      {/* punched edges */}
      <span aria-hidden className="absolute left-[-4%] top-1/2 h-[14%] w-[8%] -translate-y-1/2 rounded-full" style={{ background: t.paper }} />
      <span aria-hidden className="absolute right-[-4%] top-1/2 h-[14%] w-[8%] -translate-y-1/2 rounded-full" style={{ background: t.paper }} />
      <Grain opacity={0.22} />
    </div>
  );
}

function Postcard({ item, t }: { item: ScrapItem; t: PageTheme }) {
  return (
    <div className="relative" style={{ background: "#fdf6e6", boxShadow: paperShadow, padding: "3.5%" }}>
      <div className="flex gap-[4%]" style={{ aspectRatio: "3 / 2" }}>
        <div className="relative flex-1 overflow-hidden" style={{ background: t.paperEdge }}>
          {item.imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={item.imageUrl} alt={item.meta || "Postcard"} className="h-full w-full object-cover" />
          ) : (
            <span
              aria-hidden
              className="absolute inset-0"
              style={{
                background: `repeating-linear-gradient(0deg,transparent 0 12%,${t.accentSoft} 12% 13%), repeating-linear-gradient(90deg,transparent 0 16%,${t.accentSoft} 16% 17%)`,
              }}
            />
          )}
        </div>
        <div className="flex flex-[.85] flex-col justify-between">
          <div style={{ fontFamily: t.handFont, color: t.ink, fontSize: "clamp(8px,1vw,14px)", lineHeight: 1.35 }}>
            {item.text}
          </div>
          <div className="self-end" style={{ width: "44%" }}>
            <div
              className="flex items-center justify-center"
              style={{
                aspectRatio: "4 / 5",
                border: `1.5px solid ${t.accent}77`,
                fontFamily: t.titleFont,
                fontSize: "clamp(6px,.7vw,10px)",
                color: t.inkSoft,
                letterSpacing: ".1em",
              }}
            >
              {item.meta || "POST"}
            </div>
          </div>
        </div>
      </div>
      <Grain opacity={0.16} />
    </div>
  );
}

function FilmStrip({ item, t }: { item: ScrapItem; t: PageTheme }) {
  return (
    <div className="relative" style={{ background: "#241f1a", padding: "3% 2%", boxShadow: paperShadow }}>
      <div className="flex flex-col gap-[4%]">
        {[0, 1, 2].map((i) => (
          <div key={i} className="relative overflow-hidden" style={{ aspectRatio: "4 / 3", background: "#3a332c" }}>
            {item.imageUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={item.imageUrl}
                alt=""
                className="h-full w-full object-cover"
                style={{ objectPosition: `${20 + i * 30}% center` }}
              />
            )}
          </div>
        ))}
      </div>
      {/* sprocket holes */}
      {["left", "right"].map((side) => (
        <span
          key={side}
          aria-hidden
          className="absolute inset-y-[2%] flex flex-col justify-around"
          style={{ [side]: "0.5%", width: "3.5%" } as CSSProperties}
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className="block w-full rounded-[1px]" style={{ aspectRatio: "1", background: t.paper }} />
          ))}
        </span>
      ))}
    </div>
  );
}

function FoldedLetter({ t }: { t: PageTheme }) {
  return (
    <div
      className="relative"
      style={{ aspectRatio: "4 / 3", background: "#fdf5e4", boxShadow: paperShadow, borderRadius: 2 }}
    >
      {/* the flap */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0"
        style={{
          height: "58%",
          clipPath: "polygon(0 0, 100% 0, 50% 100%)",
          background: "linear-gradient(170deg,#f7ecd6,#e9dbbe)",
        }}
      />
      <span
        aria-hidden
        className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: "22%",
          aspectRatio: "1",
          background: `radial-gradient(circle at 34% 30%, #d78a5e, ${t.accent} 60%, #7c3f22)`,
          boxShadow: "inset -1px -2px 4px rgba(60,24,8,.5), 0 3px 7px rgba(58,40,22,.4)",
        }}
      />
      <Grain opacity={0.2} />
    </div>
  );
}

function Cassette({ item, t }: { item: ScrapItem; t: PageTheme }) {
  const reduced = useReducedMotion();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const el = audioRef.current;
    if (!el) {
      setPlaying((v) => !v);
      return;
    }
    if (el.paused) void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    else {
      el.pause();
      setPlaying(false);
    }
  };

  return (
    <div
      className="relative"
      style={{ aspectRatio: "8 / 5", background: "#2f2a24", borderRadius: 4, boxShadow: paperShadow, padding: "6%" }}
    >
      <div
        className="relative flex h-full flex-col justify-between rounded-[2px]"
        style={{ background: item.color || "#e5d6b4", padding: "5%" }}
      >
        <div
          className="text-center"
          style={{ fontFamily: t.handFont, color: "#3d3428", fontSize: "clamp(8px,1vw,14px)" }}
        >
          {item.caption || "side A"}
        </div>
        <div className="flex items-center justify-center gap-[12%]">
          {[0, 1].map((i) => (
            <motion.span
              key={i}
              aria-hidden
              className="block rounded-full"
              style={{
                width: "26%",
                aspectRatio: "1",
                background: "#3a332a",
                border: "3px solid #6b5c48",
              }}
              animate={playing && !reduced ? { rotate: 360 } : { rotate: 0 }}
              transition={playing && !reduced ? { duration: 2.4, repeat: Infinity, ease: "linear" } : { duration: 0.3 }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause the voice note" : "Play the voice note"}
          className="mx-auto flex cursor-pointer items-center justify-center rounded-full border-0"
          style={{
            width: "22%",
            aspectRatio: "1",
            background: t.accent,
            color: "#fffdf4",
            fontSize: "clamp(7px,.8vw,11px)",
          }}
        >
          {playing ? "❙❙" : "▶"}
        </button>
      </div>
      {item.audioUrl && (
        <audio
          ref={audioRef}
          src={item.audioUrl}
          preload="none"
          className="sr-only"
          onEnded={() => setPlaying(false)}
        />
      )}
    </div>
  );
}

function Pocket({ item, t }: { item: ScrapItem; t: PageTheme }) {
  const reduced = useReducedMotion();
  return (
    <div className="relative" style={{ aspectRatio: "5 / 4" }}>
      {/* the thing inside, peeking out — rises further on hover */}
      <motion.span
        aria-hidden
        className="absolute inset-x-[10%] top-0 origin-bottom"
        style={{ height: "62%", background: "#fdf6e6", boxShadow: paperShadow, borderRadius: 2 }}
        initial={false}
        whileHover={reduced ? undefined : { y: "-26%" }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
      />
      {/* the stitched pocket itself, in front */}
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 flex items-end justify-center"
        style={{
          height: "68%",
          background: `linear-gradient(to bottom, ${t.paperEdge}, ${t.paper})`,
          border: `1.5px dashed ${t.accent}88`,
          borderRadius: "2px 2px 5px 5px",
          boxShadow: "0 6px 14px -8px rgba(58,40,22,.4)",
        }}
      />
      <span
        className="absolute inset-x-0 bottom-[8%] text-center"
        style={{ fontFamily: t.handFont, color: t.inkSoft, fontSize: "clamp(8px,.95vw,13px)" }}
      >
        {item.text || "pull me out"}
      </span>
    </div>
  );
}

function Flower({ item, t }: { item: ScrapItem; t: PageTheme }) {
  const reduced = useReducedMotion();
  const petals = 6;
  const color = item.color || t.accent;
  return (
    <motion.div
      className="relative"
      style={{ aspectRatio: "1" }}
      animate={reduced ? undefined : { rotate: [0, 3.5, -3.5, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      whileHover={reduced ? undefined : { scale: 1.12 }}
    >
      <svg viewBox="0 0 60 60" className="h-full w-full" aria-hidden>
        {Array.from({ length: petals }).map((_, i) => (
          <motion.ellipse
            key={i}
            cx="30"
            cy="17"
            rx="7"
            ry="13"
            fill={color}
            opacity="0.72"
            style={{ transformOrigin: "30px 30px" }}
            animate={reduced ? undefined : { rotate: (360 / petals) * i }}
            initial={{ rotate: (360 / petals) * i }}
            whileHover={{ ry: 15 }}
          />
        ))}
        <circle cx="30" cy="30" r="5.5" fill={t.deskAccent} opacity="0.9" />
      </svg>
    </motion.div>
  );
}

function Leaf({ item, t }: { item: ScrapItem; t: PageTheme }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="relative"
      style={{ aspectRatio: "2 / 3" }}
      animate={reduced ? undefined : { rotate: [0, -4, 4, 0] }}
      transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg viewBox="0 0 40 60" className="h-full w-full" aria-hidden>
        <path
          d="M20 2 C 36 18, 36 42, 20 58 C 4 42, 4 18, 20 2 Z"
          fill={item.color || "#7f9b52"}
          opacity="0.66"
        />
        <path d="M20 6 L20 54" stroke={t.ink} strokeWidth="1" opacity="0.35" />
      </svg>
    </motion.div>
  );
}

function Tape({ item, t }: { item: ScrapItem; t: PageTheme }) {
  const reduced = useReducedMotion();
  const color = item.color || t.tape[0];
  return (
    <motion.div
      className="relative"
      style={{ aspectRatio: "5 / 1.5" }}
      whileHover={reduced ? undefined : { rotate: item.rotate > 0 ? -3 : 3, y: -2 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
    >
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          background: color,
          clipPath: "polygon(0 8%, 100% 0, 100% 92%, 0 100%)",
          boxShadow: "0 3px 7px -3px rgba(58,40,22,.4)",
        }}
      />
      <span
        aria-hidden
        className="absolute inset-0 opacity-40"
        style={{
          clipPath: "polygon(0 8%, 100% 0, 100% 92%, 0 100%)",
          background: "repeating-linear-gradient(90deg, transparent 0 6px, rgba(255,255,255,.4) 6px 7px)",
        }}
      />
    </motion.div>
  );
}

function Clip({ item, t }: { item: ScrapItem; t: PageTheme }) {
  return (
    <div className="relative" style={{ aspectRatio: "1 / 2.4" }}>
      <svg viewBox="0 0 20 48" className="h-full w-full" aria-hidden>
        <path
          d="M6 42 L6 10 A4 4 0 0 1 14 10 L14 38 A3 3 0 0 0 8 38 L8 14"
          fill="none"
          stroke={item.color || "#9a8a72"}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      </svg>
      <span aria-hidden className="absolute inset-0" style={{ filter: `drop-shadow(0 2px 3px ${t.ink}44)` }} />
    </div>
  );
}

function Stain({ item }: { item: ScrapItem }) {
  return (
    <div
      aria-hidden
      className="relative"
      style={{
        aspectRatio: "1",
        borderRadius: "48% 52% 44% 56% / 52% 46% 54% 48%",
        mixBlendMode: "multiply",
        background: `radial-gradient(circle, transparent 52%, ${
          item.color || "rgba(122,84,46,.2)"
        } 58%, rgba(104,70,38,.3) 64%, ${item.color || "rgba(122,84,46,.14)"} 70%, transparent 76%)`,
      }}
    />
  );
}

function Doodle({ item, t }: { item: ScrapItem; t: PageTheme }) {
  const reduced = useReducedMotion();
  const color = item.color || t.accent;
  const paths: Record<string, string> = {
    heart: "M30 52 C 6 34, 8 12, 22 12 C 28 12, 30 18, 30 20 C 30 18, 32 12, 38 12 C 52 12, 54 34, 30 52 Z",
    arrow: "M6 40 C 22 40, 34 30, 44 16 M44 16 L34 20 M44 16 L46 27",
    swirl: "M8 40 C 8 16, 44 14, 44 32 C 44 44, 22 46, 22 32 C 22 24, 34 24, 34 31",
    underline: "M4 30 C 18 22, 40 38, 56 26",
    burst: "M30 6 L30 22 M30 38 L30 54 M6 30 L22 30 M38 30 L54 30 M13 13 L24 24 M36 36 L47 47 M47 13 L36 24 M24 36 L13 47",
  };
  const isFilled = item.doodle === "heart";

  return (
    <div className="relative" style={{ aspectRatio: "1" }}>
      <svg viewBox="0 0 60 60" className="h-full w-full" aria-hidden>
        <motion.path
          d={paths[item.doodle] ?? paths.heart}
          fill={isFilled ? color : "none"}
          stroke={color}
          strokeWidth="2.6"
          strokeLinecap="round"
          opacity="0.78"
          initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}

function Stamp({ item, t }: { item: ScrapItem; t: PageTheme }) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        aspectRatio: "5 / 2",
        border: `2px solid ${item.color || t.accent}aa`,
        borderRadius: 3,
        transform: "rotate(0deg)",
        opacity: 0.72,
      }}
    >
      <span
        style={{
          fontFamily: t.titleFont,
          color: item.color || t.accent,
          fontSize: "clamp(6px,.8vw,11px)",
          letterSpacing: ".16em",
        }}
      >
        {item.meta || "12 JAN 2024"}
      </span>
    </div>
  );
}

function Ribbon({ item, t }: { item: ScrapItem; t: PageTheme }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="relative origin-top"
      style={{ aspectRatio: "1 / 6" }}
      animate={reduced ? undefined : { rotate: [0, 1.6, -1.6, 0] }}
      transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to right, ${item.color || t.accent}, ${item.color || t.accent}bb)`,
          clipPath: "polygon(0 0, 100% 0, 100% 88%, 50% 100%, 0 88%)",
          boxShadow: "2px 0 6px -2px rgba(58,40,22,.4)",
        }}
      />
    </motion.div>
  );
}

function Star({ item, t }: { item: ScrapItem; t: PageTheme }) {
  const reduced = useReducedMotion();
  return (
    <motion.span
      aria-hidden
      className="block leading-none"
      style={{ color: item.color || t.deskAccent, fontSize: "clamp(8px,1.4vw,22px)" }}
      animate={reduced ? undefined : { opacity: [0.35, 1, 0.35], scale: [0.9, 1.14, 0.9] }}
      transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: wobble(item.id, 2) + 2 }}
    >
      ✦
    </motion.span>
  );
}

function Pin({ item, t }: { item: ScrapItem; t: PageTheme }) {
  return (
    <div className="relative" style={{ aspectRatio: "1" }}>
      <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden>
        <circle cx="20" cy="15" r="10" fill={item.color || "#b8443a"} />
        <circle cx="16.5" cy="11.5" r="3.2" fill="#fff" opacity="0.5" />
        <path d="M20 24 L21.5 38 L18.5 38 Z" fill="#8a8a8a" />
      </svg>
      <span aria-hidden className="absolute inset-0" style={{ filter: `drop-shadow(0 3px 4px ${t.ink}55)` }} />
    </div>
  );
}

function GiftTag({ item, t }: { item: ScrapItem; t: PageTheme }) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        aspectRatio: "3 / 2",
        background: item.color || "#efe0c2",
        clipPath: "polygon(14% 0, 100% 0, 100% 100%, 14% 100%, 0 50%)",
        boxShadow: paperShadow,
      }}
    >
      <span
        aria-hidden
        className="absolute rounded-full"
        style={{ left: "13%", top: "50%", width: "9%", aspectRatio: "1", transform: "translateY(-50%)", border: `1.5px solid ${t.ink}66` }}
      />
      <span
        className="px-[16%] text-center"
        style={{ fontFamily: t.handFont, color: t.ink, fontSize: "clamp(8px,1vw,14px)", lineHeight: 1.2 }}
      >
        {item.text || "for you"}
      </span>
      <Grain opacity={0.2} />
    </div>
  );
}

function Scrap({ item, t }: { item: ScrapItem; t: PageTheme }) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        aspectRatio: "5 / 3",
        background: item.color || "#f6ecd6",
        /* uneven edges, as if torn by hand */
        clipPath:
          "polygon(2% 8%, 18% 2%, 36% 9%, 55% 3%, 74% 10%, 92% 4%, 99% 22%, 96% 44%, 99% 68%, 90% 92%, 70% 97%, 48% 91%, 28% 98%, 9% 93%, 1% 72%, 4% 46%, 0 26%)",
        boxShadow: "0 6px 14px -8px rgba(58,40,22,.4)",
      }}
    >
      {item.text && (
        <span
          className="px-[12%] text-center"
          style={{ fontFamily: t.handFont, color: t.ink, fontSize: "clamp(8px,1.05vw,15px)", lineHeight: 1.3 }}
        >
          {item.text}
        </span>
      )}
      <Grain opacity={0.28} />
    </div>
  );
}

/* ------------------------------------------------------------------ */

/**
 * A piece's artwork on its own, with no positioning of its own.
 *
 * Exported because the editor needs exactly this and nothing else. `ScrapItemView`
 * places itself absolutely, so nesting it inside the editor's own positioned
 * wrapper took it out of flow and collapsed that wrapper to a few pixels tall —
 * the artwork was painted outside the box that receives the clicks, which is why
 * pieces could not be grabbed. The reader view keeps `ScrapItemView`; the editor
 * lays out its own box and puts the body inside it.
 */
export function ScrapItemBody({ item, t }: { item: ScrapItem; t: PageTheme }) {
  /* Opacity lives on the view in the reader; in the editor the wrapper is the
     view, so the body carries it instead. */
  return (
    <div style={{ opacity: item.opacity }}>
      <Inner item={item} t={t} />
    </div>
  );
}

function Inner({ item, t }: { item: ScrapItem; t: PageTheme }) {
  switch (item.kind) {
    case "photo":
      return <Photo item={item} t={t} />;
    case "polaroid":
      return <Polaroid item={item} t={t} />;
    case "note":
      return <Note item={item} t={t} />;
    case "title":
      return <Title item={item} t={t} />;
    case "journal":
      return <Journal item={item} t={t} />;
    case "sticky":
      return <Sticky item={item} t={t} />;
    case "ticket":
      return <Ticket item={item} t={t} />;
    case "postcard":
      return <Postcard item={item} t={t} />;
    case "filmstrip":
      return <FilmStrip item={item} t={t} />;
    case "letter":
      return <FoldedLetter t={t} />;
    case "cassette":
      return <Cassette item={item} t={t} />;
    case "pocket":
      return <Pocket item={item} t={t} />;
    case "flower":
      return <Flower item={item} t={t} />;
    case "leaf":
      return <Leaf item={item} t={t} />;
    case "tape":
      return <Tape item={item} t={t} />;
    case "clip":
      return <Clip item={item} t={t} />;
    case "stain":
      return <Stain item={item} />;
    case "doodle":
      return <Doodle item={item} t={t} />;
    case "stamp":
      return <Stamp item={item} t={t} />;
    case "ribbon":
      return <Ribbon item={item} t={t} />;
    case "star":
      return <Star item={item} t={t} />;
    case "pin":
      return <Pin item={item} t={t} />;
    case "tag":
      return <GiftTag item={item} t={t} />;
    case "scrap":
      return <Scrap item={item} t={t} />;
    default:
      return null;
  }
}

/**
 * Places one item on the spread. Positioning is percentage-based so a
 * composition survives from a phone to a full desktop spread.
 */
export function ScrapItemView({
  item,
  theme,
  onActivate,
  settleDelay = 0,
}: {
  item: ScrapItem;
  theme: PageTheme;
  onActivate?: (item: ScrapItem) => void;
  settleDelay?: number;
}) {
  const reduced = useReducedMotion();
  const openable = Boolean(onActivate) && isOpenable(item);

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${item.x}%`,
        top: `${item.y}%`,
        width: `${item.w}%`,
        zIndex: item.z,
        translateX: "-50%",
        translateY: "-50%",
        /*
         * The angle as laid out, and nothing added to it.
         *
         * This used to add `wobble(item.id, 0.9)` — a per-piece nudge of up to
         * about a degree, meant to keep a page from looking mechanically
         * aligned. The editor has no such nudge, so every piece sat at a
         * slightly different angle in the preview than the one it was placed
         * at, and a piece deliberately squared to an edge came out crooked. A
         * hand-made feel that the person doing the hand-making cannot see or
         * correct is just a discrepancy. Anyone who wants the tilt can drag the
         * rotate grip, which now exists.
         */
        rotate: item.rotate,
        opacity: item.opacity,
        cursor: openable ? "pointer" : "default",
      }}
      initial={reduced ? { opacity: 1 } : { opacity: 0, y: -10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.75, ease: [0.2, 0.8, 0.2, 1], delay: settleDelay }}
      whileHover={openable && !reduced ? { scale: 1.035, zIndex: 900 } : undefined}
      onClick={openable ? () => onActivate?.(item) : undefined}
      onKeyDown={
        openable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onActivate?.(item);
              }
            }
          : undefined
      }
      role={openable ? "button" : undefined}
      tabIndex={openable ? 0 : undefined}
      aria-label={
        openable
          ? `${item.caption || item.text || item.meta || "Memory"} — open`
          : undefined
      }
    >
      <Inner item={item} t={theme} />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* The opened state, rendered above the book                           */
/* ------------------------------------------------------------------ */

export function OpenedItem({
  item,
  theme,
  onClose,
}: {
  item: ScrapItem;
  theme: PageTheme;
  onClose: () => void;
}) {
  const reduced = useReducedMotion();
  const isLetter = item.kind === "letter";
  const isPocket = item.kind === "pocket";
  const bodyText = item.hiddenText || item.text;
  const image = item.hiddenImageUrl || item.imageUrl;

  return (
    <motion.div
      className="absolute inset-0 z-[80] flex items-center justify-center p-5 sm:p-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      style={{ background: "rgba(32,22,12,.72)", backdropFilter: "blur(3px)" }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={item.caption || item.text || "Memory"}
        className="relative w-full max-w-lg overflow-hidden"
        style={{
          background: "#fdf6e6",
          boxShadow: "0 50px 90px -40px rgba(0,0,0,.75)",
          borderRadius: 4,
          transformOrigin: isLetter ? "top center" : "center",
        }}
        initial={
          reduced
            ? { opacity: 0 }
            : isLetter
              ? { rotateX: -86, opacity: 0, y: -26 }
              : isPocket
                ? { y: 70, opacity: 0 }
                : { scale: 0.86, opacity: 0 }
        }
        animate={{ rotateX: 0, scale: 1, y: 0, opacity: 1 }}
        exit={reduced ? { opacity: 0 } : { scale: 0.94, opacity: 0 }}
        transition={{ duration: isLetter ? 1.1 : 0.55, ease: [0.2, 0.85, 0.2, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{ backgroundImage: PAPER_GRAIN, mixBlendMode: "multiply" }}
        />

        {image && (
          <div className="relative" style={{ aspectRatio: "4 / 3", background: theme.paperEdge }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt={item.caption || ""} className="h-full w-full object-cover" />
          </div>
        )}

        <div className="relative flex flex-col gap-3 px-7 py-7">
          {item.meta && (
            <span
              style={{
                fontFamily: theme.titleFont,
                fontSize: 10.5,
                letterSpacing: ".18em",
                color: theme.inkSoft,
                textTransform: "uppercase",
              }}
            >
              {item.meta}
            </span>
          )}
          {item.caption && (
            <span style={{ fontFamily: theme.handFont, fontSize: 22, color: theme.ink }}>{item.caption}</span>
          )}
          {bodyText && (
            <p
              className="m-0 whitespace-pre-line"
              style={{ fontFamily: theme.handFont, fontSize: 18, lineHeight: 1.7, color: theme.ink }}
            >
              {bodyText}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-0"
          style={{ background: "rgba(58,40,22,.14)", color: theme.ink, fontSize: 15 }}
        >
          ×
        </button>
      </motion.div>
    </motion.div>
  );
}
