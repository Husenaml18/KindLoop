"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Ambience,
  Building,
  FarBand,
  Lantern,
  Landmark,
  SecretMarker,
  TinyPerson,
  Tree,
  seeded,
} from "./parts";
import { SECRET_PLACES, archetypeFor, type World } from "./theme";
import type { Character, District, MiniWorldContent } from "./schema";

/**
 * The diorama.
 *
 * Four layers — sky, far, ground, near — each drifting at its own rate, which is
 * where the depth comes from. There is no 3D here and no perspective transform;
 * a toy village reads as a toy village because of *overlap, scale and shadow*,
 * and those are cheap. What that buys is a world that opens instantly on a phone,
 * recolours across seven settings from a palette, and never shows a loading
 * spinner in the middle of somebody's gift.
 *
 * The camera is one transform on the whole stage. Entering a building pushes it
 * toward that building and scales up; leaving returns it. Because it is a single
 * animated element rather than per-object maths, the move is smooth on anything.
 *
 * The parallax pointer handler is bound to **this element**, never to `window` —
 * a Mini World can be a section inside a Personalized Website, and an experience
 * that listens globally would react to the mouse three screens away.
 */
export function WorldStage({
  content,
  world,
  visited,
  reduced,
  focus,
  onOpen,
  onOpenSecret,
  interactive = true,
  onDragDistrict,
}: {
  content: MiniWorldContent;
  world: World;
  visited: Set<string>;
  reduced: boolean;
  /** The district being zoomed into, or `"secret"`, or null for the wide shot. */
  focus: { x: number; y: number } | null;
  onOpen: (d: District) => void;
  onOpenSecret: () => void;
  /** False in the ending, where the world is a picture rather than a place. */
  interactive?: boolean;
  /** Editor only — dragging a building to a new spot on the ground. */
  onDragDistrict?: (id: string, x: number, y: number) => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  /* Sorted back-to-front so nearer buildings overlap further ones — the single
     strongest depth cue in a flat scene, and free. */
  const districts = [...content.districts].sort((a, b) => a.depth - b.depth || a.y - b.y);

  const secretSpot = { x: 84, y: 47 };

  const camera = focus
    ? { scale: 2.15, x: `${(50 - focus.x) * 2.15}%`, y: `${(48 - focus.y) * 1.5}%` }
    : { scale: 1, x: "0%", y: "0%" };

  return (
    <div
      ref={stageRef}
      className="absolute inset-0 overflow-hidden"
      style={{ background: world.sky }}
      onPointerMove={(e) => {
        if (reduced || !interactive || focus) return;
        const r = stageRef.current?.getBoundingClientRect();
        if (!r) return;
        setTilt({
          x: ((e.clientX - r.left) / r.width - 0.5) * 2,
          y: ((e.clientY - r.top) / r.height - 0.5) * 2,
        });
      }}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
    >
      {/* ---------- sky ---------- */}
      <Ambience world={world} reduced={reduced} />

      {/* ---------- the camera ---------- */}
      <motion.div
        className="absolute inset-0"
        style={{ transformOrigin: "50% 55%" }}
        animate={camera}
        transition={{ duration: reduced ? 0.25 : 1.25, ease: [0.22, 0.75, 0.2, 1] }}
      >
        {/*
          Far hills, sitting *on* the horizon.

          They used to be pinned at `bottom: 38%` and drawn before the ground,
          which painted a 56%-tall slab straight over them — so the sky met the
          ground at a hard ruled line with nothing between. Standing them at the
          ground line instead is what turns a two-tone background into a distance.
        */}
        <motion.div
          className="pointer-events-none absolute inset-x-0"
          style={{ bottom: "54%", height: "15%" }}
          animate={{ x: tilt.x * -8, y: tilt.y * -3 }}
          transition={{ type: "spring", stiffness: 40, damping: 18 }}
        >
          <FarBand world={world} />
        </motion.div>

        {/* the ground, and the haze it meets the sky in */}
        <div className="absolute inset-x-0 bottom-0" style={{ height: "56%", background: world.ground }} />
        {/*
          Haze sits *above* the horizon and fades into the hill colour, never below
          it. Fading toward the near-ground colour instead put a dark strip over a
          lighter one and read as a stripe — the inversion is what the eye catches,
          not the softness.
        */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0"
          style={{
            bottom: "55%",
            height: "9%",
            background: `linear-gradient(180deg, transparent, ${world.far})`,
          }}
        />
        {/* the near ground darkens toward the frame rather than becoming a bar */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0"
          style={{ height: "16%", background: `linear-gradient(180deg, transparent, ${world.groundNear})` }}
        />

        <Landmark world={world} />

        {/* ---------- everything standing on the ground ---------- */}
        {/*
          Positioned with CSS percentages, each object drawn in its own SVG.

          The first version put the whole world inside one
          `viewBox="0 0 100 100"` with `preserveAspectRatio="none"`, which on a
          1000x600 stage scaled x about ten times and y about six. Every building
          came out squashed and every sign came out stretched wide — the shapes
          were fine, the frame was lying about them. Percentages for *placement*
          and a uniform scale for *drawing* is the only combination where a layout
          survives a change of aspect ratio intact.
        */}
        <motion.div
          className="absolute inset-0"
          animate={{ x: tilt.x * -22, y: tilt.y * -8 }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        >
          {/* scenery, scattered deterministically */}
          {Array.from({ length: 13 }, (_, i) => (
            <div
              key={`t${i}`}
              aria-hidden
              className="pointer-events-none absolute"
              style={{
                left: `${4 + seeded(i, 12.9) * 92}%`,
                top: `${62 + seeded(i, 78.2) * 28}%`,
                width: `${3.4 + seeded(i, 3.1) * 3.4}%`,
                transform: "translate(-50%, -100%)",
              }}
            >
              <Tree i={i} world={world} />
            </div>
          ))}

          {world.ambience.includes("lanterns") &&
            Array.from({ length: 6 }, (_, i) => (
              <div
                key={`l${i}`}
                aria-hidden
                className="pointer-events-none absolute"
                style={{
                  left: `${10 + i * 15}%`,
                  top: `${74 + seeded(i, 4.7) * 16}%`,
                  width: "2.4%",
                  transform: "translate(-50%, -100%)",
                }}
              >
                <Lantern i={i} world={world} />
              </div>
            ))}

          {/* ---------- the secret place ---------- */}
          <button
            type="button"
            disabled={!interactive}
            onClick={onOpenSecret}
            className="absolute flex flex-col items-center"
            style={{
              left: `${secretSpot.x}%`,
              top: `${secretSpot.y}%`,
              width: "9.5%",
              zIndex: 9,
              transform: "translate(-50%, -100%)",
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: interactive ? "pointer" : "default",
            }}
            aria-label={`${SECRET_PLACES[content.secret].label} — the last place`}
          >
            <SecretMarker kind={content.secret} world={world} />
            <span
              className="mt-1 whitespace-nowrap"
              style={{
                fontFamily: "var(--font-ibm-plex-mono), monospace",
                fontSize: "clamp(6px, .68vw, 9px)",
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: world.inkSoft,
                opacity: 0.8,
              }}
            >
              {SECRET_PLACES[content.secret].sign}
            </span>
          </button>

          {/* ---------- the districts ---------- */}
          {districts.map((d) => (
            <DistrictPin
              key={d.id}
              d={d}
              world={world}
              visited={visited.has(d.id)}
              interactive={interactive}
              onOpen={() => onOpen(d)}
              onDrag={onDragDistrict}
              stageRef={stageRef}
            />
          ))}

          {/* ---------- the people who live here ---------- */}
          {content.characters.map((c, i) => (
            <Wanderer key={c.id} ch={c} i={i} reduced={reduced} />
          ))}
        </motion.div>
      </motion.div>

      {/* night settles over everything, including the camera move */}
      {world.night && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 78% 62% at 50% 58%, transparent, rgba(8,6,14,.5))" }}
        />
      )}
    </div>
  );
}

/**
 * One building on the ground, optionally draggable.
 *
 * A positioned `<button>` rather than an SVG group, so it is a real focusable
 * control with a real hit area and its sign is real text that never stretches.
 * The building inside draws itself at a uniform scale; only the wrapper's width
 * changes with depth, which is what makes a far building small rather than thin.
 *
 * Drag exists only in the editor, and it moves the building rather than the
 * camera — the sender is arranging a place, not panning a map. Positions stay as
 * percentages so a world laid out on a laptop holds its shape on a phone.
 */
function DistrictPin({
  d,
  world,
  visited,
  interactive,
  onOpen,
  onDrag,
  stageRef,
}: {
  d: District;
  world: World;
  visited: boolean;
  interactive: boolean;
  onOpen: () => void;
  onDrag?: (id: string, x: number, y: number) => void;
  stageRef: React.RefObject<HTMLDivElement | null>;
}) {
  const dragging = useRef(false);
  const moved = useRef(false);
  const [hover, setHover] = useState(false);

  /* Far buildings are smaller *and* slightly hazier — one cue is a trick, two is
     distance. */
  const width = [7.5, 10.5, 14][d.depth];
  const name = d.label || archetypeFor(d.type).name;

  return (
    <button
      type="button"
      disabled={!interactive && !onDrag}
      onClick={() => {
        if (!interactive || moved.current) return;
        onOpen();
      }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onPointerDown={(e) => {
        if (!onDrag) return;
        dragging.current = true;
        moved.current = false;
        e.currentTarget.setPointerCapture?.(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!onDrag || !dragging.current) return;
        moved.current = true;
        const r = stageRef.current?.getBoundingClientRect();
        if (!r) return;
        onDrag(
          d.id,
          Math.min(98, Math.max(2, ((e.clientX - r.left) / r.width) * 100)),
          Math.min(92, Math.max(20, ((e.clientY - r.top) / r.height) * 100))
        );
      }}
      onPointerUp={() => {
        dragging.current = false;
      }}
      className="absolute flex flex-col items-center"
      style={{
        left: `${d.x}%`,
        top: `${d.y}%`,
        width: `${width}%`,
        transform: `translate(-50%, -100%) scale(${hover && interactive ? 1.05 : 1})`,
        transformOrigin: "50% 100%",
        transition: "transform .25s cubic-bezier(.2,.8,.2,1)",
        background: "transparent",
        border: "none",
        padding: 0,
        opacity: d.depth === 0 ? 0.92 : 1,
        filter: d.depth === 0 ? "saturate(.9)" : undefined,
        cursor: onDrag ? "grab" : interactive ? "pointer" : "default",
        zIndex: 10 + d.depth,
      }}
      aria-label={`Open ${name}`}
    >
      <Building templateId={d.type} world={world} lit locked={d.locked} />

      {/* the sign, in real text at a real size */}
      {/* Allowed to overflow the building's width — it is centred, so a long name
          spills evenly either side rather than being cut to "The Clock T…". */}
      <span
        className="mt-1 whitespace-nowrap rounded-full px-2 py-0.5"
        style={{
          background: "rgba(18,13,8,.66)",
          color: visited ? world.accent : world.ink,
          fontFamily: "var(--font-ibm-plex-mono), monospace",
          fontSize: "clamp(6.5px, .72vw, 10px)",
          letterSpacing: ".08em",
          backdropFilter: "blur(3px)",
        }}
      >
        {d.locked ? "🔒 " : visited ? "✓ " : ""}
        {name}
      </span>
    </button>
  );
}

/** A character who walks a short beat and comes back, forever. */
function Wanderer({ ch, i, reduced }: { ch: Character; i: number; reduced: boolean }) {
  const range = 4 + seeded(i, 5.9) * 7;
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute flex flex-col items-center"
      style={{
        left: `${20 + i * 12 + seeded(i, 6.3) * 7}%`,
        top: `${84 - seeded(i, 2.9) * 5}%`,
        width: "3.4%",
        transform: "translate(-50%, -100%)",
        zIndex: 20,
      }}
      animate={reduced ? {} : { x: [0, range, 0, -range * 0.6, 0] }}
      transition={{ duration: 24 + seeded(i, 8.8) * 16, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg viewBox="-8 -20 16 22" style={{ width: "100%", display: "block", overflow: "visible" }}>
        <TinyPerson ch={ch} i={i} />
      </svg>
      {ch.name && (
        <span
          className="whitespace-nowrap"
          style={{
            fontFamily: "var(--font-ibm-plex-mono), monospace",
            fontSize: "clamp(5.5px, .6vw, 8px)",
            color: "rgba(255,255,255,.66)",
            letterSpacing: ".1em",
          }}
        >
          {ch.name}
        </span>
      )}
    </motion.div>
  );
}
