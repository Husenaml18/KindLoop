"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import {
  CANDLE_COLORS,
  FROSTINGS,
  type CakeId,
  type CandleStyleId,
  type CardTheme,
  type DecorId,
  type FrostingId,
} from "./theme";

/**
 * The materials a card is made of.
 *
 * Drawn rather than photographed, and deliberately imperfect: every piece here
 * has a slight rotation, an uneven edge or a shadow that says it was cut by hand
 * and stuck down by hand. A birthday card whose elements are all axis-aligned
 * reads as a template, which is the one thing this must not be.
 *
 * Positions and tilts come from an index, never `Math.random` — the server and
 * client must agree on the markup, and a card should look the same every time
 * somebody opens it. It is theirs; it shouldn't rearrange itself.
 */

/** Deterministic 0..1 from an integer, exact in every JS engine. */
export function seeded(i: number, salt = 1): number {
  let x = Math.imul(i + 1, 0x27d4eb2d) ^ Math.imul(Math.round(salt * 1000), 0x165667b1);
  x = Math.imul(x ^ (x >>> 15), 0x85ebca6b);
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
  x ^= x >>> 16;
  return Math.round(((x >>> 0) / 4294967296) * 10000) / 10000;
}

/* ------------------------------------------------------------------ */
/* Paper materials                                                     */
/* ------------------------------------------------------------------ */

/** The cloth or print behind a cover. Pure CSS, so it costs nothing. */
export function Pattern({ theme }: { theme: CardTheme }) {
  if (theme.pattern === "none") return null;

  const bg =
    theme.pattern === "gingham"
      ? `repeating-linear-gradient(0deg, ${theme.patternColor} 0 11px, transparent 11px 22px),
         repeating-linear-gradient(90deg, ${theme.patternColor} 0 11px, transparent 11px 22px)`
      : theme.pattern === "dots"
        ? `radial-gradient(${theme.patternColor} 1.6px, transparent 1.7px)`
        : `radial-gradient(${theme.patternColor} 2.4px, transparent 2.5px)`;

  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: bg,
        backgroundSize: theme.pattern === "gingham" ? "22px 22px" : "34px 34px",
        opacity: 0.85,
      }}
    />
  );
}

/** A torn strip of gummed tape, holding something to the page. */
export function Tape({
  theme,
  className = "",
  style,
  tilt = -4,
}: {
  theme: CardTheme;
  className?: string;
  style?: CSSProperties;
  tilt?: number;
}) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute ${className}`}
      style={{
        width: 74,
        height: 24,
        background: theme.tape,
        transform: `rotate(${tilt}deg)`,
        boxShadow: "0 2px 5px -2px rgba(60,44,24,.5)",
        /* Torn ends rather than a clean rectangle — the single cheapest thing
           that stops adhesive tape looking like a div. */
        clipPath:
          "polygon(3% 8%, 12% 0%, 28% 9%, 46% 1%, 63% 10%, 80% 2%, 97% 9%, 96% 92%, 79% 100%, 61% 91%, 44% 99%, 27% 90%, 11% 99%, 2% 90%)",
        ...style,
      }}
    />
  );
}

/**
 * Ransom-note lettering — every character snipped from a different magazine.
 *
 * The first pass set all the tiles in one serif in two colours, which read as a
 * typographic *effect* applied to a word. Real cut-out lettering is not an effect,
 * it is an accident: the letters disagree about typeface, weight, size, case and
 * paper, and that disagreement is the entire charm. So each tile draws
 * independently from four families, five paper colours, a size jitter and a
 * baseline jitter, and roughly one in five is a knocked-out letter on a coloured
 * chip rather than ink on white.
 *
 * The word is still real text: `aria-label` carries it and the tiles are
 * `aria-hidden`, so it is announced once, cleanly, however wild it looks.
 *
 * Everything is keyed off the character's index within the whole string, so a
 * given word always cuts out the same way. It is somebody's card — the letters
 * should not reshuffle between visits.
 */

/** Faces that disagree with each other as much as the project's fonts allow. */
const RANSOM_FACES = [
  "var(--font-fraunces), Georgia, serif",
  "var(--font-space-grotesk), Helvetica, sans-serif",
  "var(--font-ibm-plex-mono), monospace",
  "Georgia, 'Times New Roman', serif",
];

export function Cutout({
  text,
  theme,
  size = 34,
  className = "",
}: {
  text: string;
  theme: CardTheme;
  size?: number;
  className?: string;
}) {
  /* Grouped into words, each word `whitespace-nowrap`. Laying every character out
     as its own flex item let a line break fall anywhere — "Happy Birthday"
     wrapped as "Happy Birt / hday" on a phone. */
  const words = text.split(" ").filter(Boolean);
  const chips = [theme.accent, theme.accentAlt, theme.ink];
  let n = -1;

  return (
    <span className={`inline-flex flex-wrap items-end justify-center ${className}`} aria-label={text}>
      {words.map((word, w) => (
        <span key={w} className="inline-flex items-end whitespace-nowrap" style={{ marginInline: size * 0.2 }}>
          {[...word].map((c, k) => {
            n += 1;
            const r = (salt: number) => seeded(n, salt);

            const face = RANSOM_FACES[Math.floor(r(3.1) * RANSOM_FACES.length)];
            const scale = 0.82 + r(5.5) * 0.42;
            const tilt = -9 + r(7.7) * 18;
            const lift = -3 + r(9.3) * 6;
            /* About one in five is knocked out of a coloured chip. */
            const knockout = r(11.1) > 0.78;
            const chip = chips[Math.floor(r(13.7) * chips.length)];
            /* Papers are never quite the same white. */
            const papers = ["#fdfaf2", "#fff", "#f7efdf", "#fdf3e4", "#f2ece0"];
            const paper = papers[Math.floor(r(17.3) * papers.length)];
            const upper = r(19.1) > 0.62;

            return (
              <span
                key={k}
                aria-hidden
                style={{
                  display: "inline-block",
                  padding: `${size * 0.09}px ${size * 0.15}px`,
                  /* Tilted tiles need room at the corners or they clip. */
                  margin: "0 2px",
                  transform: `rotate(${tilt}deg) translateY(${lift}px)`,
                  background: knockout ? chip : paper,
                  color: knockout ? paper : theme.ink,
                  fontFamily: face,
                  fontWeight: r(23.9) > 0.45 ? 700 : 500,
                  fontSize: size * scale,
                  lineHeight: 1,
                  boxShadow: "0 3px 6px -3px rgba(50,36,20,.5)",
                  /* Each snip is cut slightly differently. */
                  clipPath: `polygon(${1 + r(29.3) * 3}% ${2 + r(31.1) * 4}%, ${97 - r(37.7) * 3}% 0%, 100% ${95 - r(41.3) * 3}%, ${2 + r(43.9) * 3}% 100%)`,
                }}
              >
                {upper ? c.toUpperCase() : c.toLowerCase()}
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}

/**
 * A torn edge, revealing whatever is behind it.
 *
 * The references lean on this hard: the red panel behind "blow the candles" is
 * ripped along its bottom so the kraft shows through. One torn edge does more to
 * say *made by hand* than any amount of texture, because a machine would not have
 * left it.
 */
export function TornStrip({
  color,
  height = 46,
  flip = false,
  seed = 1,
}: {
  color: string;
  height?: number;
  flip?: boolean;
  seed?: number;
}) {
  /*
    A rough fibre edge, walked right-to-left.
    Left-to-right was the bug: the polygon already closes at `100% 100%`, so
    starting the tear back at x=0 dragged an edge across the full width and the
    strip rendered as triangular bunting. The tear also lives in the last fifth of
    the height — paper rips a few millimetres off true, not halfway up the sheet.
  */
  const STEPS = 34;
  const pts = Array.from({ length: STEPS + 1 }, (_, i) => {
    const x = 100 - (i / STEPS) * 100;
    const y = 82 + seeded(i, seed) * 18;
    return `${x.toFixed(2)}% ${y.toFixed(1)}%`;
  }).join(", ");

  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-x-0"
      style={{
        [flip ? "bottom" : "top"]: 0,
        height,
        background: color,
        transform: flip ? "scaleY(-1)" : undefined,
        clipPath: `polygon(0% 0%, 100% 0%, 100% 100%, ${pts}, 0% 100%)`,
      }}
    />
  );
}

/** A pushpin, holding something to the page. */
export function Pin({ color, className = "", style }: { color: string; className?: string; style?: CSSProperties }) {
  return (
    <svg
      aria-hidden
      viewBox="-10 -10 20 24"
      className={`pointer-events-none absolute ${className}`}
      style={{ width: 26, ...style }}
    >
      <path d="M0 2 L0 13" stroke="#7d6a52" strokeWidth={1.3} strokeLinecap="round" />
      <ellipse cx={0} cy={0} rx={7} ry={5.4} fill={color} />
      <ellipse cx={-2.4} cy={-1.8} rx={2.4} ry={1.5} fill="#fff" opacity={0.42} />
      <ellipse cx={0} cy={3.2} rx={3.4} ry={1.8} fill="rgba(0,0,0,.28)" />
    </svg>
  );
}

/**
 * A typed label on a cream strip, the kind printed out and glued on.
 *
 * The references use these for every instruction — "CLICK LETTER TO OPEN AND
 * CLOSE", "for denise ♥", "blow the candles". They are how a handmade card gives
 * directions without a button, and they are the reason this experience can carry
 * its own instructions without looking like software.
 */
export function LabelTag({
  children,
  theme,
  tilt = -1.4,
  className = "",
}: {
  children: ReactNode;
  theme: CardTheme;
  tilt?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-block ${className}`}
      style={{
        transform: `rotate(${tilt}deg)`,
        background: "#fdf8ec",
        border: "1px solid rgba(120,96,60,.2)",
        padding: "4px 11px",
        fontFamily: "var(--font-ibm-plex-mono), monospace",
        fontSize: 9.5,
        letterSpacing: ".12em",
        textTransform: "uppercase",
        color: theme.ink,
        boxShadow: "0 3px 7px -4px rgba(50,36,20,.6)",
      }}
    >
      {children}
    </span>
  );
}

/** A photograph, taped or cornered onto the page. */
export function Snapshot({
  url,
  caption,
  theme,
  tilt = -2.5,
  width = "100%",
}: {
  url: string;
  caption?: string;
  theme: CardTheme;
  tilt?: number;
  width?: string | number;
}) {
  if (!url) return null;
  return (
    <div
      style={{
        width,
        transform: `rotate(${tilt}deg)`,
        background: "#fffdf7",
        padding: "8px 8px 26px",
        boxShadow: "0 14px 26px -16px rgba(50,36,20,.6)",
      }}
    >
      {/* Runtime uploads with unknown dimensions, so not next/image. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={caption || "A photo on the card"} style={{ display: "block", width: "100%" }} />
      {caption && (
        <p
          className="m-0 mt-2 text-center"
          style={{ fontFamily: "var(--font-gochi), var(--hw-elegant), cursive", fontSize: 15, color: theme.inkSoft }}
        >
          {caption}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Things stuck round the edges                                        */
/* ------------------------------------------------------------------ */

const DECOR_GLYPH: Record<Exclude<DecorId, "none">, string[]> = {
  stars: ["✦", "★", "✧"],
  hearts: ["♥", "❥", "♡"],
  balloons: ["🎈"],
  sprinkles: ["·", "✳", "❋"],
  petals: ["❀", "✿", "❁"],
};

/** A scatter of small paper shapes, kept out of the middle of the page. */
export function Decor({ kind, theme, count = 7 }: { kind: DecorId; theme: CardTheme; count?: number }) {
  if (kind === "none") return null;
  const glyphs = DECOR_GLYPH[kind];

  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }, (_, i) => {
        /* Pushed to the margins: 0–22% or 78–100% across, so nothing lands on
           the words. */
        const left = seeded(i, 12.9) < 0.5 ? seeded(i, 4.4) * 20 : 80 + seeded(i, 4.4) * 18;
        return (
          <motion.span
            key={i}
            className="absolute"
            style={{
              left: `${left}%`,
              top: `${6 + seeded(i, 78.2) * 84}%`,
              fontSize: 11 + seeded(i, 5.5) * 13,
              color: i % 2 ? theme.accent : theme.accentAlt,
              opacity: 0.75,
            }}
            animate={{ y: [0, -5, 0], rotate: [-6, 6, -6] }}
            transition={{
              duration: 5 + seeded(i, 9.1) * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: seeded(i, 2.2) * 2,
            }}
          >
            {glyphs[i % glyphs.length]}
          </motion.span>
        );
      })}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* The cake                                                            */
/* ------------------------------------------------------------------ */

/**
 * One candle, and the flame is the whole point.
 *
 * `blow` runs 0 → 1 as somebody holds their breath against it. The flame does
 * three things at once as that climbs, because a flame going out does all three:
 * it leans away, it shrinks, and it loses its glow. Any one alone reads as a CSS
 * transition; the three together read as wind.
 */
export function Candle({
  i,
  style,
  colorIndex,
  blow,
  out,
  theme,
  reduced,
}: {
  i: number;
  style: CandleStyleId;
  colorIndex: number;
  /** 0..1 — how far through the blow this candle is. */
  blow: number;
  out: boolean;
  theme: CardTheme;
  reduced: boolean;
}) {
  const wax = CANDLE_COLORS[colorIndex % CANDLE_COLORS.length];
  /* Candles further from the middle feel the breath slightly later, which stops
     eight flames from moving as one object. */
  const lag = 1 - Math.abs(i % 2 === 0 ? 0.12 : 0.24);
  const bend = Math.min(1, blow * lag);

  return (
    <g>
      {/* the flame */}
      {!out && (
        <motion.g
          style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
          animate={
            reduced
              ? {}
              : { rotate: [-3, 3, -3], scaleY: [1, 1.08, 1] }
          }
          transition={{ duration: 0.9 + seeded(i, 3.3) * 0.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <g
            style={{
              transformBox: "fill-box",
              transformOrigin: "50% 100%",
              transform: `rotate(${bend * 46}deg) scale(${1 - bend * 0.72})`,
              opacity: 1 - bend * 0.55,
              transition: "transform .12s linear, opacity .12s linear",
            }}
          >
            <ellipse cx={0} cy={-9.5} rx={5.5} ry={7} fill={theme.glow} opacity={0.28} />
            <path d="M0 -16 Q3.1 -11 2.6 -7.4 Q2.2 -3.6 0 -3 Q-2.2 -3.6 -2.6 -7.4 Q-3.1 -11 0 -16 Z" fill="#ffb64a" />
            <path d="M0 -12.6 Q1.5 -9.4 1.2 -7 Q1 -4.9 0 -4.5 Q-1 -4.9 -1.2 -7 Q-1.5 -9.4 0 -12.6 Z" fill="#fff0b8" />
          </g>
        </motion.g>
      )}

      {/* a wisp of smoke once it's out */}
      {out && !reduced && (
        <motion.path
          d="M0 -4 q3 -4 0 -8 q-3 -4 0 -8"
          fill="none"
          stroke="rgba(180,170,160,.65)"
          strokeWidth={1}
          strokeLinecap="round"
          initial={{ opacity: 0.85, y: 0 }}
          animate={{ opacity: 0, y: -16 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
        />
      )}

      {/* wick */}
      <path d="M0 -3 L0 0" stroke="#3a3026" strokeWidth={1.1} strokeLinecap="round" />

      {/* wax */}
      <rect x={-2.6} y={0} width={5.2} height={20} rx={1.4} fill={wax} />
      {style === "striped" &&
        [0, 1, 2, 3].map((k) => (
          <rect key={k} x={-2.6} y={2 + k * 4.6} width={5.2} height={2} fill="rgba(255,255,255,.62)" />
        ))}
      {style === "twisted" &&
        [0, 1, 2, 3].map((k) => (
          <path
            key={k}
            d={`M-2.6 ${2.5 + k * 4.6} q2.6 2 5.2 0`}
            fill="none"
            stroke="rgba(255,255,255,.55)"
            strokeWidth={1.1}
          />
        ))}
      {style === "sparkler" && (
        <rect x={-1.1} y={0} width={2.2} height={20} rx={1.1} fill="#8d8377" />
      )}
      <rect x={-2.6} y={0} width={1.6} height={20} rx={0.8} fill="rgba(255,255,255,.28)" />
    </g>
  );
}

/**
 * The scalloped oval the cake sits on, drawn in pen.
 *
 * Straight from the references, where the cake is not a rendered object at all —
 * it is a doily outline drawn in red biro on cream, with three simple candles
 * sketched inside it. That drawn quality is most of why the reference reads as
 * handmade rather than illustrated, so the cake gets the same plate.
 */
export function Doily({ color, r = 46 }: { color: string; r?: number }) {
  const scallops = 26;
  const bumps = Array.from({ length: scallops }, (_, i) => {
    const a = (i / scallops) * Math.PI * 2;
    const b = ((i + 1) / scallops) * Math.PI * 2;
    const x1 = Math.cos(a) * r, y1 = Math.sin(a) * r * 0.6;
    const x2 = Math.cos(b) * r, y2 = Math.sin(b) * r * 0.6;
    const mid = (a + b) / 2;
    const cx = Math.cos(mid) * (r + 5.5), cy = Math.sin(mid) * (r + 5.5) * 0.6;
    return `${i === 0 ? `M${x1.toFixed(1)} ${y1.toFixed(1)}` : ""} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  }).join(" ");

  return (
    <g>
      <path d={bumps} fill="#fdf8ec" stroke={color} strokeWidth={1.5} />
      <ellipse cx={0} cy={0} rx={r - 5} ry={(r - 5) * 0.6} fill="none" stroke={color} strokeWidth={0.9} opacity={0.6} />
    </g>
  );
}

/** The cake itself, with its candles standing in it. */
export function Cake({
  cake,
  frosting,
  candleCount,
  candleStyle,
  candleColors,
  blow,
  out,
  theme,
  reduced,
}: {
  cake: CakeId;
  frosting: FrostingId;
  candleCount: number;
  candleStyle: CandleStyleId;
  candleColors: number[];
  blow: number;
  out: boolean;
  theme: CardTheme;
  reduced: boolean;
}) {
  const f = FROSTINGS[frosting];
  const colors = candleColors.length ? candleColors : [0, 1, 2];

  /* Candles are spread across the top of whichever cake this is, so the same
     count sits correctly on a cupcake and on two tiers. */
  const topWidth = cake === "cupcake" ? 46 : cake === "loaf" ? 62 : 66;
  const topY = cake === "cupcake" ? -6 : cake === "layered" ? -30 : -14;
  const step = candleCount > 1 ? topWidth / (candleCount - 1) : 0;
  const startX = candleCount > 1 ? -topWidth / 2 : 0;

  return (
    <svg
      viewBox="-60 -66 120 108"
      preserveAspectRatio="xMidYMid meet"
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      {/* the glow the candles throw on the cake */}
      {!out && (
        <ellipse cx={0} cy={topY + 6} rx={54} ry={26} fill={theme.glow} opacity={0.22 * (1 - blow * 0.8)} />
      )}

      {/* the plate: a scalloped doily drawn in pen, straight from the references */}
      <g transform="translate(0 30)">
        <Doily color={theme.accent} r={50} />
      </g>

      {cake === "cupcake" ? (
        <>
          {/* wrapper */}
          <path d="M-22 -2 L22 -2 L16 34 L-16 34 Z" fill="#d99a86" />
          {[-14, -7, 0, 7, 14].map((x) => (
            <path key={x} d={`M${x} -2 L${x * 0.72} 34`} stroke="rgba(0,0,0,.12)" strokeWidth={2} />
          ))}
          {/* swirl of icing */}
          <path d="M-24 -2 q6 -20 24 -20 q18 0 24 20 Z" fill={f.icing} />
          <path d="M-16 -8 q5 -12 16 -12 q11 0 16 12 Z" fill={f.icingDeep} opacity={0.5} />
        </>
      ) : cake === "loaf" ? (
        <>
          <path d="M-36 4 q36 -18 72 0 L34 34 L-34 34 Z" fill={f.sponge} />
          <path d="M-36 4 q36 -18 72 0 q-36 10 -72 0 Z" fill={f.icing} />
          <path d="M-34 34 L34 34 L32 30 L-32 30 Z" fill={f.spongeDeep} />
        </>
      ) : cake === "round" ? (
        <>
          <rect x={-40} y={-6} width={80} height={40} rx={5} fill={f.sponge} />
          <rect x={-40} y={-6} width={80} height={13} rx={5} fill={f.icing} />
          {/* drips */}
          {[-30, -14, 2, 18, 32].map((x, k) => (
            <path key={x} d={`M${x} 6 q0 ${7 + (k % 3) * 4} 4 ${7 + (k % 3) * 4} q4 0 4 -${7 + (k % 3) * 4} Z`} fill={f.icing} />
          ))}
          <rect x={-40} y={26} width={80} height={8} rx={4} fill={f.spongeDeep} opacity={0.45} />
        </>
      ) : (
        <>
          {/* bottom tier */}
          <rect x={-46} y={4} width={92} height={30} rx={4} fill={f.sponge} />
          <rect x={-46} y={4} width={92} height={11} rx={4} fill={f.icing} />
          {[-36, -20, -4, 12, 28, 40].map((x, k) => (
            <path key={x} d={`M${x} 14 q0 ${6 + (k % 3) * 4} 4 ${6 + (k % 3) * 4} q4 0 4 -${6 + (k % 3) * 4} Z`} fill={f.icing} />
          ))}
          {/* top tier */}
          <rect x={-32} y={-22} width={64} height={28} rx={4} fill={f.sponge} />
          <rect x={-32} y={-22} width={64} height={10} rx={4} fill={f.icing} />
          {[-24, -10, 4, 18].map((x, k) => (
            <path key={x} d={`M${x} -13 q0 ${5 + (k % 2) * 4} 3.5 ${5 + (k % 2) * 4} q3.5 0 3.5 -${5 + (k % 2) * 4} Z`} fill={f.icing} />
          ))}
        </>
      )}

      {/* sprinkles, so the icing isn't a flat shape */}
      {Array.from({ length: 14 }, (_, i) => (
        <rect
          key={i}
          x={-42 + seeded(i, 12.9) * 84}
          y={topY + 12 + seeded(i, 78.2) * 22}
          width={3.2}
          height={1.4}
          rx={0.7}
          fill={CANDLE_COLORS[i % CANDLE_COLORS.length]}
          opacity={0.75}
          transform={`rotate(${-40 + seeded(i, 3.3) * 80} ${-42 + seeded(i, 12.9) * 84} ${topY + 12 + seeded(i, 78.2) * 22})`}
        />
      ))}

      {/* the candles */}
      {Array.from({ length: candleCount }, (_, i) => (
        <g key={i} transform={`translate(${startX + i * step} ${topY})`}>
          <Candle
            i={i}
            style={candleStyle}
            colorIndex={colors[i % colors.length]}
            blow={blow}
            out={out}
            theme={theme}
            reduced={reduced}
          />
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* The celebration                                                     */
/* ------------------------------------------------------------------ */

/**
 * Cut-paper confetti, thrown once.
 *
 * Deliberately finite and deliberately short. The brief asks for charming rather
 * than excessive, and the difference is entirely in whether it stops: confetti
 * that keeps falling turns a moment into a wallpaper.
 */
export function Confetti({ theme, play, reduced }: { theme: CardTheme; play: boolean; reduced: boolean }) {
  if (!play || reduced) return null;
  const palette = [theme.accent, theme.accentAlt, theme.glow, "#f0e2c4", "#e8a0b4"];

  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 34 }, (_, i) => {
        const isRibbon = i % 4 === 0;
        return (
          <motion.span
            key={i}
            className="absolute"
            style={{
              left: `${seeded(i, 12.9) * 100}%`,
              top: "-6%",
              width: isRibbon ? 4 : 7 + seeded(i, 5.1) * 5,
              height: isRibbon ? 13 : 7 + seeded(i, 5.1) * 5,
              borderRadius: isRibbon ? 1 : "50%",
              background: palette[i % palette.length],
            }}
            initial={{ y: 0, opacity: 1, rotate: 0 }}
            animate={{
              y: "112vh",
              opacity: [1, 1, 0],
              rotate: 360 + seeded(i, 7.7) * 540,
              x: [0, (seeded(i, 9.3) - 0.5) * 160],
            }}
            transition={{
              duration: 2.6 + seeded(i, 4.2) * 2.2,
              ease: [0.15, 0.6, 0.4, 1],
              delay: seeded(i, 2.8) * 0.7,
            }}
          />
        );
      })}
    </span>
  );
}

/** The soft ring of light that swells when the candles go out. */
export function Flash({ theme, play }: { theme: CardTheme; play: boolean }) {
  const reduced = useReducedMotion();
  if (!play || reduced) return null;
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ background: `radial-gradient(circle at 50% 46%, ${theme.glow}, transparent 62%)` }}
      initial={{ opacity: 0.7, scale: 0.85 }}
      animate={{ opacity: 0, scale: 1.25 }}
      transition={{ duration: 1.1, ease: "easeOut" }}
    />
  );
}

/* ------------------------------------------------------------------ */

/** A page of the opened card. Used for both halves and for the mobile stack. */
export function Page({
  theme,
  children,
  className = "",
  style,
}: {
  theme: CardTheme;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className="relative flex h-full flex-col"
      style={{
        background: theme.page,
        border: `1px solid ${theme.pageEdge}`,
        /*
          Nothing leaves the paper. The torn band, the doily and the little glued
          labels are all positioned or oversized on purpose, and without this they
          hung off the edges of the sheet and over the fold — which instantly stops
          it reading as one physical card.
        */
        overflow: "hidden",
        ...style,
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 26%, rgba(122,92,52,.06) .7px, transparent 1px), radial-gradient(circle at 72% 64%, rgba(122,92,52,.05) .6px, transparent .9px)",
          backgroundSize: "39px 43px, 57px 51px",
        }}
      />
      {/* The caller's layout classes belong on the element that actually holds the
          content. On the outer box they were being applied to a parent whose only
          child was this flex-1 wrapper, so every `justify-center` was inert and
          both pages sat their contents against the top. */}
      <div className={`relative flex flex-1 flex-col ${className}`}>{children}</div>
    </div>
  );
}
