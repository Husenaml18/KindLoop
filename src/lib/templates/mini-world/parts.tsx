"use client";

import { motion } from "framer-motion";
import {
  HAIR_COLORS,
  OUTFIT_COLORS,
  SKIN_TONES,
  archetypeFor,
  type SecretId,
  type World,
} from "./theme";
import type { Character } from "./schema";

/**
 * Everything in the world that isn't an experience.
 *
 * All of it is drawn — inline SVG paths, no images, no 3D — for three reasons
 * that matter more than the technique. It weighs almost nothing, so a world with
 * twenty props still opens instantly on a phone. It recolours per world from the
 * palette alone, so seven settings cost one drawing each rather than seven. And
 * hand-cut shapes with flat fills and one shadow read as *made*, which is the
 * whole brief — a low-poly 3D village would have looked rendered, and rendered is
 * the one thing this must never look.
 *
 * Every position and phase here is derived from an index, never from `Math.random`.
 * Two reasons: the server and client must agree on the markup, and a world should
 * look the same every time it is opened. It is somebody's place; it shouldn't
 * rearrange itself behind their back.
 */

/**
 * Deterministic 0..1 from an integer. Used for every scatter in this file.
 *
 * Integer arithmetic, not `Math.sin(x) * 43758.5453` — the usual shader trick,
 * which is subtly wrong in a server-rendered app. `Math.sin` is not required by
 * the spec to be correctly rounded, so Node's V8 and the browser's V8 disagree in
 * the final bits. Measured on this very component: the same seed produced
 *
 *     server   top: 11.105926896561868%
 *     client   top: 11.10592689672194%
 *
 * which React reports as a hydration mismatch and refuses to patch. `Math.imul`
 * and the bitwise operators are exact 32-bit integer ops in every engine, so this
 * agrees everywhere by construction. The result is rounded to four decimals as
 * well — enough precision for a position, and it keeps the markup short.
 */
export function seeded(i: number, salt = 12.9898): number {
  let x = Math.imul(i + 1, 0x27d4eb2d) ^ Math.imul(Math.round(salt * 1000), 0x165667b1);
  x = Math.imul(x ^ (x >>> 15), 0x85ebca6b);
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
  x ^= x >>> 16;
  return Math.round(((x >>> 0) / 4294967296) * 10000) / 10000;
}

/* ------------------------------------------------------------------ */
/* Buildings                                                           */
/* ------------------------------------------------------------------ */

/**
 * One district, as a little model building.
 *
 * Drawn as a *volume*, not an elevation, and that is the whole difference between
 * a diagram and a model. Three planes do the work: a lit front wall, a shaded
 * right wall raked back on an isometric offset, and a roof split into a front
 * pitch and a side pitch that meet at a ridge. Add an overhanging eave, a plinth
 * the walls sit on, and a single soft shadow on the ground, and the eye reads it
 * as an object it could pick up.
 *
 * It renders in its own SVG with its own viewBox and a uniform scale. The first
 * version shared one stretched `viewBox="0 0 100 100"` for the entire world,
 * which scaled x about ten times and y about six — so every building was squashed
 * and every sign came out stretched wide. Each building owning its own frame is
 * what keeps the proportions true at any stage size.
 */
export function Building({
  templateId,
  world,
  lit,
  locked,
}: {
  templateId: string;
  world: World;
  lit: boolean;
  locked: boolean;
}) {
  const a = archetypeFor(templateId);
  const W = a.w;
  const H = a.h;

  /* The isometric rake. One angle for every building in the world, so they all
     agree about where the light and the viewer are. */
  const dx = W * 0.34;
  const dy = -W * 0.2;
  const rh = a.roof === "tower" ? H * 0.62 : a.roof === "tent" ? H * 0.6 : H * 0.44;
  const o = 1.1;

  const vb = `${-o - 2} ${-rh - 5} ${W + dx + o * 2 + 5} ${H + rh + 12}`;

  const glow = locked ? world.wallShade : lit ? world.glow : world.wallShade;

  return (
    <svg viewBox={vb} style={{ width: "100%", display: "block", overflow: "visible" }}>
      {/* the shadow it casts */}
      <ellipse cx={W / 2 + dx / 2} cy={H + 1.4} rx={W * 0.72} ry={2.2} fill="rgba(0,0,0,.3)" />

      {/* ---- the body ---- */}
      {/* side wall, raked back */}
      <path d={`M${W} 0 L${W + dx} ${dy} L${W + dx} ${H + dy} L${W} ${H} Z`} fill={world.wallShade} />
      {/* front wall */}
      <rect x={0} y={0} width={W} height={H} fill={world.wall} />
      {/* the plinth the whole thing stands on */}
      <path d={`M0 ${H - 1.2} L${W} ${H - 1.2} L${W + dx} ${H - 1.2 + dy} L${W + dx} ${H + dy} L${W} ${H} L0 ${H} Z`}
        fill={world.roofShade} opacity={0.45} />

      {/* ---- the roof ---- */}
      <Roof kind={a.roof} W={W} H={H} rh={rh} dx={dx} dy={dy} o={o} world={world} />

      {/* ---- windows ---- */}
      {a.roof !== "tower" ? (
        <>
          {[0, 1].map((i) => (
            <Window key={i} x={W * (0.13 + i * 0.46)} y={H * 0.2} w={W * 0.24} h={H * 0.24}
              world={world} glow={glow} lit={lit && !locked} i={i} />
          ))}
          {/* a smaller pair on the shaded side, to sell the corner */}
          <path d={`M${W + dx * 0.28} ${H * 0.24 + dy * 0.28} l${dx * 0.4} ${dy * 0.4} l0 ${H * 0.2} l${-dx * 0.4} ${-dy * 0.4} Z`}
            fill={glow} opacity={lit && !locked ? 0.55 : 0.3} />
        </>
      ) : (
        [0, 1].map((i) => (
          <Window key={i} x={W * 0.3} y={H * (0.16 + i * 0.3)} w={W * 0.4} h={H * 0.16}
            world={world} glow={glow} lit={lit && !locked} i={i} />
        ))
      )}

      {/* ---- the door ---- */}
      <g>
        <rect x={W * 0.38} y={H * 0.56} width={W * 0.24} height={H * 0.44}
          rx={W * 0.12} fill={world.roofShade} />
        <rect x={W * 0.41} y={H * 0.6} width={W * 0.18} height={H * 0.4}
          rx={W * 0.09} fill={locked ? world.wallShade : world.roof} />
        <circle cx={W * 0.555} cy={H * 0.79} r={0.32} fill={world.glow} opacity={0.9} />
        {/* the step */}
        <rect x={W * 0.33} y={H - 0.5} width={W * 0.34} height={1} rx={0.4} fill={world.roofShade} opacity={0.7} />
        {/* the lamp above it */}
        {lit && !locked && (
          <motion.circle cx={W * 0.5} cy={H * 0.5} r={0.85} fill={world.glow}
            animate={{ opacity: [0.7, 1, 0.8] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
        )}
      </g>

      <Ornament kind={a.ornament} w={W} h={H} world={world} lit={lit && !locked} />
    </svg>
  );
}

/** The five rooflines. The silhouette is what identifies a building at a glance. */
function Roof({
  kind, W, H, rh, dx, dy, o, world,
}: {
  kind: ReturnType<typeof archetypeFor>["roof"];
  W: number; H: number; rh: number; dx: number; dy: number; o: number; world: World;
}) {
  const ridge = <path d={`M${W / 2} ${-rh} L${W / 2 + dx} ${-rh + dy}`} stroke={world.roofShade} strokeWidth={0.5} />;

  switch (kind) {
    case "gable":
    case "tower":
    case "tent":
      return (
        <g>
          {/* side pitch, in shade */}
          <path d={`M${W / 2} ${-rh} L${W / 2 + dx} ${-rh + dy} L${W + o + dx} ${dy} L${W + o} 0 Z`} fill={world.roofShade} />
          {/* front pitch */}
          <path d={`M${-o} 0 L${W / 2} ${-rh} L${W + o} 0 Z`} fill={world.roof} />
          {/* eave */}
          <path d={`M${-o} 0 L${W + o} 0`} stroke={world.roofShade} strokeWidth={0.7} />
          {ridge}
          {kind === "tent" && <path d={`M${W / 2} ${-rh} L${W / 2} ${H}`} stroke={world.roofShade} strokeWidth={0.4} opacity={0.5} />}
        </g>
      );
    case "hip":
      return (
        <g>
          <path d={`M${W * 0.72} ${-rh} L${W * 0.72 + dx} ${-rh + dy} L${W + o + dx} ${dy} L${W + o} 0 Z`} fill={world.roofShade} />
          <path d={`M${-o} 0 L${W * 0.28} ${-rh} L${W * 0.72} ${-rh} L${W + o} 0 Z`} fill={world.roof} />
          <path d={`M${-o} 0 L${W + o} 0`} stroke={world.roofShade} strokeWidth={0.7} />
          <path d={`M${W * 0.28} ${-rh} L${W * 0.72} ${-rh}`} stroke={world.roofShade} strokeWidth={0.5} />
        </g>
      );
    case "dome":
      return (
        <g>
          <path d={`M${W + o} 0 L${W + o + dx} ${dy} A ${(W + o * 2) / 2} ${rh} 0 0 0 ${W / 2 + dx} ${-rh + dy} L${W / 2} ${-rh} Z`}
            fill={world.roofShade} />
          <path d={`M${-o} 0 A ${(W + o * 2) / 2} ${rh} 0 0 1 ${W + o} 0 Z`} fill={world.roof} />
          <circle cx={W / 2} cy={-rh - 0.6} r={0.7} fill={world.glow} />
        </g>
      );
    default:
      return (
        <g>
          <path d={`M${-o} 0 L${W + o} 0 L${W + o + dx} ${dy} L${-o + dx} ${dy} Z`} fill={world.roof} />
          <rect x={-o} y={-1.5} width={W + o * 2} height={1.6} rx={0.4} fill={world.roofShade} />
        </g>
      );
  }
}

/** A real window: frame, sill, mullion, and a pane that is on or off. */
function Window({
  x, y, w, h, world, glow, lit, i,
}: {
  x: number; y: number; w: number; h: number;
  world: World; glow: string; lit: boolean; i: number;
}) {
  return (
    <g>
      <rect x={x - 0.35} y={y - 0.35} width={w + 0.7} height={h + 0.7} rx={0.4} fill={world.roofShade} opacity={0.75} />
      <motion.rect
        x={x} y={y} width={w} height={h} rx={0.2} fill={glow}
        animate={lit ? { opacity: [0.86, 1, 0.9, 1] } : { opacity: 0.45 }}
        transition={{ duration: 4 + seeded(i, 2.3) * 3, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* the cross bars */}
      <path d={`M${x + w / 2} ${y} L${x + w / 2} ${y + h} M${x} ${y + h / 2} L${x + w} ${y + h / 2}`}
        stroke={world.roofShade} strokeWidth={0.24} opacity={0.7} />
      {/* the sill */}
      <rect x={x - 0.6} y={y + h + 0.35} width={w + 1.2} height={0.5} rx={0.25} fill={world.roofShade} opacity={0.8} />
    </g>
  );
}

function Ornament({
  kind,
  w,
  h,
  world,
  lit,
}: {
  kind: ReturnType<typeof archetypeFor>["ornament"];
  w: number;
  h: number;
  world: World;
  lit: boolean;
}) {
  switch (kind) {
    case "projector":
      return (
        <>
          <path d={`M${w * 0.5} ${h * 0.3} L${w * 1.5} ${h * 0.05} L${w * 1.5} ${h * 0.62} Z`}
            fill={world.glow} opacity={lit ? 0.2 : 0.06} />
          <rect x={w * 0.42} y={h * 0.26} width={w * 0.16} height={h * 0.1} rx={0.5} fill={world.roofShade} />
        </>
      );
    case "postbox":
      return (
        <g transform={`translate(${w + 2.4} ${h - 6})`}>
          <rect x={-1.6} y={0} width={3.2} height={6} rx={1.4} fill={world.accent} />
          <rect x={-1} y={1.4} width={2} height={0.7} rx={0.3} fill="rgba(0,0,0,.45)" />
        </g>
      );
    case "books":
      return (
        <g transform={`translate(${w * 0.14} ${h * 0.44})`}>
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={i * 1.5} y={-3.4 - seeded(i) * 1.2} width={1.1}
              height={3.4 + seeded(i) * 1.2} rx={0.2}
              fill={[world.accent, world.roof, world.foliage, world.roofShade, world.accent][i]} />
          ))}
        </g>
      );
    case "mailboxes":
      return (
        <g transform={`translate(1 ${h + 0.4})`}>
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(${i * (w / 4.2) + 1} 0)`}>
              <rect x={-0.35} y={-3.4} width={0.7} height={3.4} fill={world.roofShade} />
              <rect x={-1.5} y={-5.4} width={3} height={2.2} rx={1} fill={i % 2 ? world.accent : world.roof} />
            </g>
          ))}
        </g>
      );
    case "clock":
      return (
        <g transform={`translate(${w / 2} ${h * 0.26})`}>
          <circle r={w * 0.28} fill={lit ? world.glow : world.wallShade} />
          <circle r={w * 0.28} fill="none" stroke={world.roofShade} strokeWidth={0.5} />
          <motion.line x1={0} y1={0} x2={0} y2={-w * 0.19} stroke={world.roofShade} strokeWidth={0.4}
            style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
            animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} />
          <line x1={0} y1={0} x2={w * 0.13} y2={0} stroke={world.roofShade} strokeWidth={0.4} />
        </g>
      );
    case "gifts":
      return (
        <g transform={`translate(${w + 1.6} ${h - 4.2})`}>
          {[0, 1].map((i) => (
            <g key={i} transform={`translate(${i * 3.4} ${i * -2.6})`}>
              <rect x={0} y={0} width={3} height={2.8} rx={0.4} fill={i ? world.roof : world.accent} />
              <rect x={1.25} y={0} width={0.5} height={2.8} fill={world.glow} opacity={0.8} />
            </g>
          ))}
        </g>
      );
    case "gears":
      return (
        <g transform={`translate(${w * 0.5} ${h * 0.3})`}>
          {[0, 1].map((i) => (
            <motion.g key={i} transform={`translate(${i * 4 - 2} ${i * 2})`}
              style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
              animate={{ rotate: i ? -360 : 360 }}
              transition={{ duration: 14 + i * 5, repeat: Infinity, ease: "linear" }}>
              <circle r={1.9 - i * 0.5} fill="none" stroke={world.roofShade} strokeWidth={0.8} />
              {[0, 1, 2, 3].map((k) => (
                <rect key={k} x={-0.35} y={-2.5 + i * 0.5} width={0.7} height={1}
                  fill={world.roofShade} transform={`rotate(${k * 90})`} />
              ))}
            </motion.g>
          ))}
        </g>
      );
    case "map":
      return (
        <g transform={`translate(${w + 2} ${h - 5})`}>
          <path d="M0 0 L4 -1.2 L4 3.4 L0 4.6 Z" fill={world.wall} stroke={world.roofShade} strokeWidth={0.3} />
          <path d="M0.9 3.4 Q2 1.4 3.2 0.4" fill="none" stroke={world.accent} strokeWidth={0.35} strokeDasharray="0.6 0.5" />
          <circle cx={3.2} cy={0.4} r={0.45} fill={world.accent} />
        </g>
      );
    case "wreath":
      return (
        <g transform={`translate(${w / 2} ${h * 0.66})`}>
          <circle r={1.7} fill="none" stroke={world.foliage} strokeWidth={0.9} />
          <circle cy={-1.7} r={0.5} fill={world.accent} />
        </g>
      );
    case "mask":
      return (
        <g transform={`translate(${w / 2} ${h * 0.28})`}>
          <path d="M-2.6 -1.4 Q0 -3.2 2.6 -1.4 Q2.6 1.8 0 2.6 Q-2.6 1.8 -2.6 -1.4 Z"
            fill={lit ? world.glow : world.wallShade} />
          <circle cx={-1} cy={-0.5} r={0.35} fill={world.roofShade} />
          <circle cx={1} cy={-0.5} r={0.35} fill={world.roofShade} />
        </g>
      );
    case "plant":
      return (
        <g transform={`translate(${w / 2} ${h - 0.4})`}>
          <path d="M0 0 L0 -4" stroke={world.foliageDeep} strokeWidth={0.5} />
          {[-1, 1].map((s) => (
            <path key={s} d={`M0 ${-1.6 * (s > 0 ? 1 : 1.7)} q ${2.2 * s} -1.4 ${3 * s} 0.4 q ${-2 * s} 0.9 ${-3 * s} -0.4`}
              fill={world.foliage} />
          ))}
          <circle cy={-4.4} r={0.9} fill={world.accent} />
        </g>
      );
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/* The people                                                          */
/* ------------------------------------------------------------------ */

/**
 * A tiny person.
 *
 * Proportion is the entire character design, and the first version got it wrong:
 * a head the same width as the shoulders on a rectangular body reads as a figure
 * on a fire-exit sign. Cute reads from a head roughly *half the total height*,
 * shoulders narrower than the head, stubby limbs with mitten hands, and no straight
 * lines anywhere. Every silhouette here is built from circles and rounded
 * rectangles for that reason.
 *
 * The face is four marks — two eyes with a catchlight, two soft cheeks, one
 * small mouth — placed low on the head, which is the trick that makes a big head
 * look young rather than merely large.
 *
 * The idle bob is the single most important animation in the world: a village of
 * perfectly still figures reads as a diagram, and the same village breathing
 * reads as inhabited. It costs one transform.
 *
 * Drawn feet-at-origin and growing upward, so a character can be dropped at a
 * point on the ground and simply stand there.
 */
export function TinyPerson({
  ch,
  i = 0,
  scale = 1,
}: {
  ch: Character;
  i?: number;
  scale?: number;
}) {
  const skin = SKIN_TONES[ch.skin] ?? SKIN_TONES[1];
  const hair = HAIR_COLORS[ch.hairColor] ?? HAIR_COLORS[0];
  const cloth = OUTFIT_COLORS[ch.outfitColor] ?? OUTFIT_COLORS[0];
  const dark = shade(cloth, 0.74);

  const HEAD_Y = -12.6;
  const HEAD_R = 4.7;

  return (
    <motion.g
      transform={`scale(${scale})`}
      animate={{ y: [0, -0.5, 0] }}
      transition={{ duration: 2.4 + seeded(i, 3.7) * 1.4, repeat: Infinity, ease: "easeInOut" }}
    >
      <ellipse cx={0} cy={0.7} rx={3.9} ry={1.05} fill="rgba(0,0,0,.24)" />

      {/* ---- legs and shoes, stubby on purpose ---- */}
      {ch.outfit !== "dress" && ch.outfit !== "coat" && (
        <>
          <rect x={-1.85} y={-3.4} width={1.7} height={3} rx={0.85} fill={dark} />
          <rect x={0.15} y={-3.4} width={1.7} height={3} rx={0.85} fill={dark} />
        </>
      )}
      <ellipse cx={-1.05} cy={-0.25} rx={1.55} ry={0.85} fill={dark} />
      <ellipse cx={1.05} cy={-0.25} rx={1.55} ry={0.85} fill={dark} />

      {/*
        The hood rests on the shoulders rather than wrapping the skull. Drawn as a
        full circle behind the head it was wider than the face, swallowed the
        features, and fought every hat — a hood pushed back is both truer and
        leaves the face alone.
      */}
      {ch.outfit === "hoodie" && (
        <ellipse cx={0} cy={HEAD_Y + HEAD_R - 0.4} rx={HEAD_R * 0.94} ry={1.75} fill={dark} />
      )}

      {/* ---- body ---- */}
      <Body kind={ch.outfit} cloth={cloth} dark={dark} />

      {/* ---- arms, with mitten hands ---- */}
      {/* Tucked in against the body and started below the rounded shoulder — set
          wider they left a wedge of background between arm and torso, and a limb
          with daylight behind it reads as a floating bar. */}
      <g>
        <rect x={-4.15} y={-7.5} width={1.7} height={3.9} rx={0.85} fill={cloth} />
        <circle cx={-3.3} cy={-3.75} r={1.15} fill={skin} />
      </g>
      <motion.g
        /*
          `transform-box: fill-box` makes the origin relative to this element's own
          bounding box. Without it an SVG transform-origin given in px is measured
          from the *viewBox* corner — and since the frames here start at negative
          coordinates, the arm was pivoting about a point several body-widths away
          and swinging clean off the torso. Every rotation in this file has the
          same trap; they all set fill-box now.
        */
        style={{ transformBox: "fill-box", transformOrigin: "50% 8%" }}
        animate={{ rotate: [0, -24, 0] }}
        transition={{ duration: 3.8 + seeded(i, 7.1) * 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.8 }}
      >
        <rect x={2.45} y={-7.5} width={1.7} height={3.9} rx={0.85} fill={cloth} />
        <circle cx={3.3} cy={-3.75} r={1.15} fill={skin} />
      </motion.g>

      {/* ---- head ---- */}
      <circle cx={-HEAD_R + 0.25} cy={HEAD_Y + 0.6} r={1.15} fill={skin} />
      <circle cx={HEAD_R - 0.25} cy={HEAD_Y + 0.6} r={1.15} fill={skin} />
      <circle cx={0} cy={HEAD_Y} r={HEAD_R} fill={skin} />

      {/* the face sits low — this is what reads as young rather than just big */}
      <g>
        <ellipse cx={-1.75} cy={HEAD_Y + 0.9} rx={0.62} ry={0.82} fill="#2b2119" />
        <ellipse cx={1.75} cy={HEAD_Y + 0.9} rx={0.62} ry={0.82} fill="#2b2119" />
        <circle cx={-1.5} cy={HEAD_Y + 0.5} r={0.22} fill="#fff" opacity={0.9} />
        <circle cx={2} cy={HEAD_Y + 0.5} r={0.22} fill="#fff" opacity={0.9} />
        <ellipse cx={-3.1} cy={HEAD_Y + 1.9} rx={1.05} ry={0.62} fill="#e08a7e" opacity={0.4} />
        <ellipse cx={3.1} cy={HEAD_Y + 1.9} rx={1.05} ry={0.62} fill="#e08a7e" opacity={0.4} />
        <path
          d={`M-0.85 ${HEAD_Y + 2.35} q0.85 0.8 1.7 0`}
          stroke="#2b2119"
          strokeWidth={0.3}
          fill="none"
          strokeLinecap="round"
        />
      </g>

      <Hair kind={ch.hair} color={hair} r={HEAD_R} y={HEAD_Y} />
      {ch.glasses && (
        <g stroke="#3a2f24" strokeWidth={0.26} fill="none">
          <circle cx={-1.75} cy={HEAD_Y + 0.9} r={1.35} />
          <circle cx={1.75} cy={HEAD_Y + 0.9} r={1.35} />
          <path d={`M-0.4 ${HEAD_Y + 0.9} L0.4 ${HEAD_Y + 0.9}`} />
        </g>
      )}
      <Hat kind={ch.hat} color={cloth} accent={hair} r={HEAD_R} y={HEAD_Y} />
      <Prop kind={ch.prop} />
    </motion.g>
  );
}

/** Multiply a hex colour toward black. Used for trousers, shoes and hoods. */
function shade(hex: string, k: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * k);
  const g = Math.round(((n >> 8) & 255) * k);
  const b = Math.round((n & 255) * k);
  return `rgb(${r},${g},${b})`;
}

/** Five silhouettes, all of them narrower at the shoulder than the head. */
function Body({ kind, cloth, dark }: { kind: Character["outfit"]; cloth: string; dark: string }) {
  switch (kind) {
    case "dress":
      return (
        <>
          <path d="M-2.9 -8.2 Q0 -9 2.9 -8.2 L4.5 -1.6 Q0 -0.6 -4.5 -1.6 Z" fill={cloth} />
          <path d="M-4.5 -1.6 Q0 -0.6 4.5 -1.6 L4.2 -2.4 Q0 -1.5 -4.2 -2.4 Z" fill={dark} opacity={0.5} />
        </>
      );
    case "coat":
      return (
        <>
          <rect x={-3.2} y={-8.4} width={6.4} height={7.4} rx={2.6} fill={cloth} />
          <path d="M0 -8.2 L0 -1.2" stroke={dark} strokeWidth={0.3} opacity={0.6} />
          <circle cx={0} cy={-5.6} r={0.32} fill={dark} />
          <circle cx={0} cy={-3.8} r={0.32} fill={dark} />
        </>
      );
    case "dungarees":
      return (
        <>
          <rect x={-3} y={-8.2} width={6} height={5.9} rx={2.3} fill={cloth} />
          <rect x={-2.5} y={-8.9} width={0.85} height={1.6} rx={0.42} fill={cloth} />
          <rect x={1.65} y={-8.9} width={0.85} height={1.6} rx={0.42} fill={cloth} />
          <rect x={-1.5} y={-6.2} width={3} height={1.9} rx={0.5} fill={dark} opacity={0.35} />
        </>
      );
    case "hoodie":
      return (
        <>
          <rect x={-3.1} y={-8.2} width={6.2} height={6.1} rx={2.4} fill={cloth} />
          <path d="M-1.9 -4.4 Q0 -3.4 1.9 -4.4 L1.9 -2.9 Q0 -2 -1.9 -2.9 Z" fill={dark} opacity={0.4} />
        </>
      );
    default:
      return (
        <>
          <rect x={-3} y={-8.2} width={6} height={5.9} rx={2.3} fill={cloth} />
          <path d="M-3 -5.4 Q0 -4.6 3 -5.4" stroke={dark} strokeWidth={0.28} fill="none" opacity={0.4} />
        </>
      );
  }
}

function Hair({ kind, color, r, y }: { kind: Character["hair"]; color: string; r: number; y: number }) {
  switch (kind) {
    case "buzz":
      return <path d={`M${-r} ${y - 0.4} A${r} ${r} 0 0 1 ${r} ${y - 0.4} Z`} fill={color} opacity={0.9} />;
    case "bob":
      return (
        <>
          <path d={`M${-r - 0.3} ${y - 0.2} A${r + 0.3} ${r + 0.3} 0 0 1 ${r + 0.3} ${y - 0.2} L${r + 0.3} ${y + 2.2} L${r - 1} ${y + 1.4} L${r - 1} ${y - 1.4} L${-r + 1} ${y - 1.4} L${-r + 1} ${y + 1.4} L${-r - 0.3} ${y + 2.2} Z`} fill={color} />
          <path d={`M${-r + 0.6} ${y - 1.8} Q0 ${y - r - 0.6} ${r - 0.6} ${y - 1.8}`} fill={color} />
        </>
      );
    case "long":
      return (
        <>
          <path d={`M${-r - 0.5} ${y - 0.2} A${r + 0.5} ${r + 0.5} 0 0 1 ${r + 0.5} ${y - 0.2} L${r + 0.5} ${y + 7} L${r - 1.2} ${y + 6.2} L${r - 1.2} ${y - 1.2} L${-r + 1.2} ${y - 1.2} L${-r + 1.2} ${y + 6.2} L${-r - 0.5} ${y + 7} Z`} fill={color} />
          <path d={`M${-r + 0.5} ${y - 1.6} Q0 ${y - r - 0.8} ${r - 0.5} ${y - 1.6}`} fill={color} />
        </>
      );
    case "bun":
      return (
        <>
          <circle cx={0} cy={y - r - 0.9} r={1.9} fill={color} />
          <path d={`M${-r - 0.2} ${y - 0.4} A${r + 0.2} ${r + 0.2} 0 0 1 ${r + 0.2} ${y - 0.4} Z`} fill={color} />
        </>
      );
    case "curly":
      return (
        <g fill={color}>
          {[-2.9, -1.5, 0, 1.5, 2.9].map((k, n) => (
            <circle key={k} cx={k} cy={y - r + 0.4 + Math.abs(n - 2) * 0.5} r={1.85} />
          ))}
          <circle cx={-r + 0.4} cy={y - 1} r={1.5} />
          <circle cx={r - 0.4} cy={y - 1} r={1.5} />
        </g>
      );
    default:
      return (
        <path d={`M${-r - 0.2} ${y - 0.6} A${r + 0.2} ${r + 0.2} 0 0 1 ${r + 0.2} ${y - 0.6} Q${r * 0.5} ${y - r * 0.55} 0 ${y - r * 0.9} Q${-r * 0.5} ${y - r * 0.55} ${-r - 0.2} ${y - 0.6} Z`} fill={color} />
      );
  }
}

function Hat({ kind, color, accent, r, y }: { kind: Character["hat"]; color: string; accent: string; r: number; y: number }) {
  switch (kind) {
    case "beanie":
      return (
        <>
          <path d={`M${-r - 0.3} ${y - 1.2} A${r + 0.3} ${r + 0.3} 0 0 1 ${r + 0.3} ${y - 1.2} Z`} fill={color} />
          <rect x={-r - 0.5} y={y - 1.9} width={r * 2 + 1} height={1.5} rx={0.75} fill={accent} />
          <circle cx={0} cy={y - r - 1.2} r={0.85} fill={accent} />
        </>
      );
    case "cap":
      return (
        <>
          <path d={`M${-r - 0.2} ${y - 1.4} A${r + 0.2} ${r + 0.2} 0 0 1 ${r + 0.2} ${y - 1.4} Z`} fill={color} />
          <ellipse cx={r * 0.75} cy={y - 1.3} rx={r * 0.85} ry={0.65} fill={color} />
        </>
      );
    case "sunhat":
      return (
        <>
          <ellipse cx={0} cy={y - 1.6} rx={r * 1.75} ry={1.1} fill={color} />
          <path d={`M${-r * 0.72} ${y - 1.8} A${r * 0.72} ${r * 0.72} 0 0 1 ${r * 0.72} ${y - 1.8} Z`} fill={color} />
          <rect x={-r * 0.75} y={y - 2.3} width={r * 1.5} height={0.7} rx={0.35} fill={accent} opacity={0.7} />
        </>
      );
    case "flower":
      return (
        <g transform={`translate(${r * 0.7} ${y - r * 0.72})`}>
          {[0, 1, 2, 3, 4].map((k) => (
            <ellipse key={k} rx={0.85} ry={0.5} fill="#e88aa6" transform={`rotate(${k * 72}) translate(0.95 0)`} />
          ))}
          <circle r={0.5} fill="#f2c14e" />
        </g>
      );
    default:
      return null;
  }
}

function Prop({ kind }: { kind: Character["prop"] }) {
  switch (kind) {
    case "balloon":
      return (
        <motion.g
          style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
          animate={{ rotate: [-5, 5, -5] }}
          transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <path d="M3.3 -3.75 Q5 -8 5.5 -12.4" stroke="rgba(60,44,28,.55)" strokeWidth={0.2} fill="none" />
          <ellipse cx={5.6} cy={-14.2} rx={2.1} ry={2.5} fill="#e0655f" />
          <ellipse cx={4.9} cy={-15} rx={0.6} ry={0.85} fill="#fff" opacity={0.35} />
        </motion.g>
      );
    case "camera":
      return (
        <g transform="translate(3.3 -3.75)">
          <rect x={-1.5} y={-1.1} width={3} height={2.2} rx={0.5} fill="#3d3830" />
          <circle cx={0} cy={0} r={0.75} fill="#8fb8c9" />
          <circle cx={0} cy={0} r={0.32} fill="#2b3540" />
        </g>
      );
    case "book":
      return (
        <g transform="translate(3.3 -3.75)">
          <rect x={-1.3} y={-1.3} width={2.6} height={2.6} rx={0.3} fill="#b5643f" />
          <rect x={-1.3} y={-1.3} width={0.55} height={2.6} fill="#8a4a2c" />
        </g>
      );
    case "coffee":
      return (
        <g transform="translate(3.3 -3.75)">
          <path d="M-0.85 -1.1 L0.85 -1.1 L0.6 1.1 L-0.6 1.1 Z" fill="#f2ece0" />
          <rect x={-0.9} y={-1.35} width={1.8} height={0.55} rx={0.27} fill="#b5643f" />
        </g>
      );
    case "flowers":
      return (
        <g transform="translate(3.3 -4.3)">
          <path d="M0 1.6 L0 -0.7" stroke="#5c7a52" strokeWidth={0.3} />
          {[-0.85, 0, 0.85].map((x, k) => (
            <circle key={x} cx={x} cy={-1.3 - Math.abs(k - 1) * 0.35} r={0.62}
              fill={["#e88aa6", "#f2c14e", "#c78ad9"][k]} />
          ))}
        </g>
      );
    case "umbrella":
      return (
        <g transform="translate(3.5 -4.1)">
          <path d="M-2.6 0 A2.6 2.6 0 0 1 2.6 0 Z" fill="#5f8ab0" />
          <path d="M-2.6 0 q1.3 0.7 2.6 0 q1.3 -0.7 2.6 0" fill="#5f8ab0" />
          <path d="M0 0 L0 3.6" stroke="#6b5540" strokeWidth={0.28} />
        </g>
      );
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/* Scenery                                                             */
/* ------------------------------------------------------------------ */

export function Tree({ i, world }: { i: number; world: World }) {
  const tall = seeded(i, 5.3) > 0.5;
  return (
    <svg viewBox="-4 -12 8 13" style={{ width: "100%", display: "block", overflow: "visible" }}>
    <motion.g
      style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
      animate={{ rotate: [-1.1, 1.1, -1.1] }}
      transition={{ duration: 5 + seeded(i, 9.1) * 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <ellipse cx={0} cy={0.4} rx={2.6} ry={0.7} fill="rgba(0,0,0,.2)" />
      <rect x={-0.5} y={-4} width={1} height={4.2} rx={0.4} fill={world.foliageDeep} />
      {tall ? (
        <path d="M0 -11 L3 -3.6 L-3 -3.6 Z" fill={world.foliage} />
      ) : (
        <>
          <circle cx={0} cy={-5.6} r={3} fill={world.foliage} />
          <circle cx={-1.7} cy={-4.2} r={2.1} fill={world.foliageDeep} opacity={0.85} />
        </>
      )}
    </motion.g>
    </svg>
  );
}

export function Lantern({ i, world }: { i: number; world: World }) {
  return (
    <svg viewBox="-3 -10 6 11" style={{ width: "100%", display: "block", overflow: "visible" }}>
      <rect x={-0.22} y={-6} width={0.44} height={6} fill={world.roofShade} />
      <motion.g
        animate={{ opacity: [0.65, 1, 0.78, 1] }}
        transition={{ duration: 3 + seeded(i, 2.7) * 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <circle cx={0} cy={-6.6} r={2.6} fill={world.glow} opacity={0.16} />
        <rect x={-0.85} y={-7.5} width={1.7} height={2} rx={0.5} fill={world.glow} />
      </motion.g>
    </svg>
  );
}

/** The little hills or spires along the horizon. */
export function FarBand({ world }: { world: World }) {
  return (
    <svg viewBox="0 0 100 14" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
      <path
        d="M0 14 L0 8 Q6 3.5 12 7 Q18 10 24 6 Q31 1.6 38 6.4 Q45 10.6 52 6 Q60 1 67 6.6 Q74 11 81 6.2 Q88 2 94 7 Q97 9 100 7.4 L100 14 Z"
        fill={world.far}
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* The things that move                                                */
/* ------------------------------------------------------------------ */

export function Ambience({ world, reduced }: { world: World; reduced: boolean }) {
  if (reduced) return null;
  return (
    <>
      {world.ambience.includes("clouds") && <Clouds world={world} />}
      {world.ambience.includes("stars") && <Stars world={world} />}
      {world.ambience.includes("petals") && <Petals />}
      {world.ambience.includes("birds") && <Birds world={world} />}
      {world.ambience.includes("fireflies") && <Fireflies world={world} />}
    </>
  );
}

function Clouds({ world }: { world: World }) {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            top: `${5 + seeded(i, 4.4) * 22}%`,
            width: `${16 + seeded(i, 8.2) * 14}%`,
            /* `aspect-ratio` rather than the height:0 + padding-bottom trick —
               React normalises a numeric `0` to `"0px"` on one side of the
               hydration boundary and not the other. */
            aspectRatio: "4 / 1",
            borderRadius: 999,
            background: world.night ? "rgba(255,255,255,.07)" : "rgba(255,255,255,.5)",
            filter: "blur(6px)",
          }}
          initial={{ x: "-30vw" }}
          animate={{ x: "130vw" }}
          transition={{ duration: 90 + seeded(i, 6.1) * 70, repeat: Infinity, ease: "linear", delay: i * -28 }}
        />
      ))}
    </>
  );
}

function Stars({ world }: { world: World }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0" style={{ height: "62%" }}>
      {Array.from({ length: 46 }, (_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${seeded(i, 12.9) * 100}%`,
            top: `${seeded(i, 78.2) * 100}%`,
            width: 1 + seeded(i, 3.3) * 1.8,
            height: 1 + seeded(i, 3.3) * 1.8,
            background: world.glow,
          }}
          animate={{ opacity: [0.25, 1, 0.4] }}
          transition={{ duration: 2.4 + seeded(i, 5.5) * 3.6, repeat: Infinity, ease: "easeInOut", delay: seeded(i, 1.7) * 3 }}
        />
      ))}
    </div>
  );
}

function Petals() {
  return (
    <>
      {Array.from({ length: 16 }, (_, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            left: `${seeded(i, 12.9) * 100}%`,
            width: 6 + seeded(i, 4.1) * 5,
            height: 5 + seeded(i, 4.1) * 4,
            borderRadius: "60% 0 60% 0",
            background: i % 3 ? "#f6b7c8" : "#fbd0dc",
            opacity: 0.85,
          }}
          initial={{ y: "-10%", rotate: 0 }}
          animate={{ y: "115%", x: [0, 26, -18, 12], rotate: 420 }}
          transition={{
            duration: 13 + seeded(i, 7.7) * 12,
            repeat: Infinity,
            ease: "linear",
            delay: seeded(i, 2.2) * -18,
          }}
        />
      ))}
    </>
  );
}

function Birds({ world }: { world: World }) {
  return (
    <>
      {[0, 1].map((flock) => (
        <motion.div
          key={flock}
          aria-hidden
          className="pointer-events-none absolute"
          style={{ top: `${12 + flock * 9}%` }}
          initial={{ x: "-12vw" }}
          animate={{ x: "112vw" }}
          transition={{ duration: 46 + flock * 22, repeat: Infinity, ease: "linear", delay: flock * -20 }}
        >
          <svg width="52" height="18" viewBox="0 0 52 18" fill="none"
            stroke={world.night ? world.inkSoft : "rgba(60,50,40,.55)"} strokeWidth="1.3" strokeLinecap="round">
            {[0, 1, 2].map((b) => (
              /*
                The flap is a vertical squash, not a path tween.
                Framer cannot interpolate `d` — handing it keyframes of path data
                sets the attribute to the string "undefined" and the browser
                rejects the whole path. Scaling a fixed wing shape about its own
                middle gives the same beat and animates on the compositor.
              */
              <motion.path
                key={b}
                d={`M${b * 17 + 2} 9 q4 -4 8 0`}
                style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
                animate={{ scaleY: [1, -0.45, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: b * 0.14 }}
              />
            ))}
          </svg>
        </motion.div>
      ))}
    </>
  );
}

function Fireflies({ world }: { world: World }) {
  return (
    <>
      {Array.from({ length: 18 }, (_, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="pointer-events-none absolute rounded-full"
          style={{
            left: `${8 + seeded(i, 12.9) * 84}%`,
            top: `${52 + seeded(i, 78.2) * 40}%`,
            width: 3.5,
            height: 3.5,
            background: world.glow,
            boxShadow: `0 0 8px 2px ${world.glow}88`,
          }}
          animate={{
            y: [0, -18 - seeded(i, 3.1) * 26, 0],
            x: [0, 14 - seeded(i, 6.6) * 28, 0],
            opacity: [0, 0.95, 0],
          }}
          transition={{
            duration: 7 + seeded(i, 9.9) * 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: seeded(i, 2.5) * -10,
          }}
        />
      ))}
    </>
  );
}

/** The little train, the ferris wheel, the boats — one per world that wants it. */
export function Landmark({ world }: { world: World }) {
  if (world.ambience.includes("ferris")) {
    return (
      <div aria-hidden className="pointer-events-none absolute" style={{ left: "6%", bottom: "34%", width: "17%" }}>
        <svg viewBox="-26 -26 52 34" style={{ width: "100%", display: "block", overflow: "visible" }}>
          <path d="M-7 8 L0 -2 L7 8" stroke={world.roofShade} strokeWidth="1.4" fill="none" />
          <motion.g style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
            animate={{ rotate: 360 }} transition={{ duration: 44, repeat: Infinity, ease: "linear" }}>
            <circle r="18" fill="none" stroke={world.roofShade} strokeWidth="1" />
            {Array.from({ length: 10 }, (_, i) => {
              const a = (i / 10) * Math.PI * 2;
              return (
                <g key={i} transform={`translate(${Math.cos(a) * 18} ${Math.sin(a) * 18})`}>
                  <circle r="2" fill={i % 2 ? world.accent : world.glow} />
                </g>
              );
            })}
          </motion.g>
          <circle r="2.2" fill={world.roofShade} />
        </svg>
      </div>
    );
  }

  if (world.ambience.includes("train")) {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-x-0" style={{ bottom: "13%", height: 26 }}>
        <div style={{ position: "absolute", inset: "auto 0 6px", height: 2, background: world.roofShade, opacity: 0.55 }} />
        <motion.div
          className="absolute"
          style={{ bottom: 8 }}
          initial={{ x: "-16vw" }}
          animate={{ x: "116vw" }}
          transition={{ duration: 34, repeat: Infinity, ease: "linear" }}
        >
          <svg width="86" height="22" viewBox="0 0 86 22">
            <rect x="2" y="6" width="22" height="11" rx="2" fill={world.accent} />
            <rect x="6" y="1" width="5" height="6" rx="1" fill={world.accent} />
            {[26, 46, 66].map((x) => (
              <rect key={x} x={x} y="8" width="17" height="9" rx="1.6" fill={world.roof} />
            ))}
            {[7, 19, 31, 41, 51, 61, 71, 79].map((x) => (
              <circle key={x} cx={x} cy="18.5" r="2.1" fill={world.roofShade} />
            ))}
          </svg>
        </motion.div>
      </div>
    );
  }

  if (world.ambience.includes("boats")) {
    return (
      <>
        {[0, 1].map((i) => (
          <motion.div
            key={i}
            aria-hidden
            className="pointer-events-none absolute"
            style={{ bottom: `${44 + i * 6}%` }}
            initial={{ x: i ? "108vw" : "-8vw" }}
            animate={{ x: i ? "-8vw" : "108vw" }}
            transition={{ duration: 70 + i * 26, repeat: Infinity, ease: "linear", delay: i * -30 }}
          >
            <motion.svg width="44" height="30" viewBox="0 0 44 30"
              style={{ transformBox: "fill-box", transformOrigin: "50% 90%" }}
              animate={{ rotate: [-2.5, 2.5, -2.5] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}>
              <path d="M6 22 L38 22 L33 27 L11 27 Z" fill={world.roof} />
              <path d="M22 3 L22 21" stroke={world.roofShade} strokeWidth="1.4" />
              <path d="M23 5 L34 19 L23 19 Z" fill={world.wall} />
            </motion.svg>
          </motion.div>
        ))}
      </>
    );
  }

  if (world.ambience.includes("windmill")) {
    return (
      <div aria-hidden className="pointer-events-none absolute" style={{ right: "8%", bottom: "36%", width: "11%" }}>
        <svg viewBox="-20 -22 40 42" style={{ width: "100%", display: "block" }}>
          <path d="M-6 20 L-3 -4 L3 -4 L6 20 Z" fill={world.wall} />
          <path d="M-4 -4 L0 -11 L4 -4 Z" fill={world.roof} />
          <motion.g animate={{ rotate: 360 }} transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
            style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}>
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x={-0.9} y={-19} width={1.8} height={12} rx={0.6} fill={world.roofShade}
                transform={`rotate(${i * 90} 0 -7)`} />
            ))}
          </motion.g>
        </svg>
      </div>
    );
  }

  return null;
}

/* ------------------------------------------------------------------ */
/* The secret place                                                    */
/* ------------------------------------------------------------------ */

/** Small, off to one side, and drawn to look like it was always there. */
export function SecretMarker({ kind, world }: { kind: SecretId; world: World }) {
  /* A radial falloff, not a flat disc — a solid circle at low opacity still has a
     hard edge, and on a dark sky it read as a grey plate behind the building. */
  const gid = `secret-glow-${kind}`;
  const glow = (
    <>
      <defs>
        <radialGradient id={gid}>
          <stop offset="0%" stopColor={world.glow} stopOpacity=".3" />
          <stop offset="60%" stopColor={world.glow} stopOpacity=".1" />
          <stop offset="100%" stopColor={world.glow} stopOpacity="0" />
        </radialGradient>
      </defs>
      <motion.circle
        r={12}
        fill={`url(#${gid})`}
        animate={{ opacity: [0.65, 1, 0.65], scale: [1, 1.1, 1] }}
        transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );

  const art = () => {
    switch (kind) {
      case "mountain":
        return <path d="M-11 6 L-3 -9 L2 -2 L6 -7 L12 6 Z" fill={world.far} stroke={world.inkSoft} strokeWidth={0.4} />;
      case "observatory":
        return (
          <>
            <path d="M-7 6 L-7 -1 A7 7 0 0 1 7 -1 L7 6 Z" fill={world.wall} />
            <path d="M1 -4 L11 -9" stroke={world.roofShade} strokeWidth={1.4} />
          </>
        );
      case "lighthouse":
        return (
          <>
            <path d="M-4 6 L-2.6 -8 L2.6 -8 L4 6 Z" fill={world.wall} />
            <rect x={-3.4} y={-4} width={6.8} height={2} fill={world.accent} />
            <circle cy={-9.4} r={1.9} fill={world.glow} />
          </>
        );
      case "treehouse":
        return (
          <>
            <rect x={-0.8} y={-3} width={1.6} height={9} fill={world.foliageDeep} />
            <circle cy={-8} r={6.4} fill={world.foliage} />
            <rect x={-3.4} y={-8} width={6.8} height={4.4} rx={0.6} fill={world.roof} />
            <rect x={-1} y={-6.4} width={2} height={2.8} fill={world.glow} />
          </>
        );
      case "tower":
        return (
          <>
            <path d="M-4 6 L-4 -7 L4 -7 L4 6 Z" fill={world.wall} />
            <path d="M-5.4 -7 L0 -14 L5.4 -7 Z" fill={world.roof} />
            <rect x={-1.2} y={-5} width={2.4} height={3.2} rx={1.2} fill={world.glow} />
          </>
        );
      default:
        return (
          <>
            <path d="M-10 6 L-10 0 A10 6 0 0 1 10 0 L10 6 Z" fill={world.foliageDeep} />
            <rect x={-2.4} y={-1} width={4.8} height={7} rx={2.4} fill={world.roofShade} />
            <circle cx={-6} cy={-2} r={1.4} fill={world.accent} opacity={0.8} />
            <circle cx={6.5} cy={-1} r={1.2} fill={world.glow} opacity={0.8} />
          </>
        );
    }
  };

  return (
    <svg viewBox="-13 -16 26 24" style={{ width: "100%", display: "block", overflow: "visible" }}>
      {glow}
      {art()}
    </svg>
  );
}
