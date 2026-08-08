"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { getSectionTemplate } from "@/lib/templates/sections";
import { SECRET_PLACES, WORLDS, archetypeFor, type World } from "./theme";
import { WorldStage } from "./World";
import { TinyPerson, seeded } from "./parts";
import type { District, MiniWorldContent } from "./schema";

/**
 * Mini World.
 *
 * An orchestration layer, and almost nothing else. It owns a sky, a piece of
 * ground and a camera; everything a recipient actually *reads* is one of the
 * existing experiences, mounted unchanged through the section registry. Opening
 * the Post Office mounts Love Letter's own `View` with Love Letter's own content
 * — the same component `/g/[slug]` serves.
 *
 * Three things make that safe, all of them proven elsewhere in this codebase:
 *
 *   - `contain: paint` on the overlay makes it the containing block for the
 *     `position: fixed` layers six of the experiences use for their opened
 *     items, so an opened letter fills the building rather than the world;
 *   - `embedded` asks each view to fill its container instead of the viewport,
 *     which every one of them already honours;
 *   - the parallax listener is bound to the stage element rather than `window`,
 *     so a Mini World nested inside a Personalized Website doesn't react to a
 *     mouse three sections away.
 *
 * The shape of the visit is fixed and short: arrive, explore in any order,
 * find the secret, pull back. Nothing is gated, nothing is counted, and the
 * ending is reachable from the first screen.
 */

const MONO = "var(--font-ibm-plex-mono), monospace";
const SERIF = "var(--font-fraunces), serif";
const HAND = "var(--font-gochi), var(--hw-elegant), cursive";

type Phase = "asleep" | "waking" | "exploring" | "ending";

export function MiniWorldView({
  content,
  embedded = false,
}: {
  content: MiniWorldContent;
  embedded?: boolean;
}) {
  const world = WORLDS[content.world] ?? WORLDS["cozy-town"];
  const reduced = Boolean(useReducedMotion());

  const [phase, setPhase] = useState<Phase>(embedded ? "exploring" : "asleep");
  const [open, setOpen] = useState<District | null>(null);
  const [secretOpen, setSecretOpen] = useState(false);
  const [visited, setVisited] = useState<Set<string>>(new Set());

  const live = useMemo(
    () => content.districts.filter((d) => getSectionTemplate(d.type)),
    [content.districts]
  );

  const focus = open
    ? { x: open.x, y: open.y }
    : secretOpen
      ? { x: 84, y: 47 }
      : null;

  const enterDistrict = (d: District) => {
    setOpen(d);
    setVisited((v) => new Set(v).add(d.id));
  };

  return (
    <div
      style={{
        position: "relative",
        minHeight: embedded ? "100%" : "100dvh",
        overflow: "hidden",
        background: world.sky,
        color: world.ink,
        fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
      }}
    >
      <WorldStage
        content={{ ...content, districts: live }}
        world={world}
        visited={visited}
        reduced={reduced}
        focus={focus}
        interactive={phase === "exploring"}
        onOpen={enterDistrict}
        onOpenSecret={() => setSecretOpen(true)}
      />

      {/* ---------- the world asleep, then waking ---------- */}
      <AnimatePresence>
        {phase !== "exploring" && phase !== "ending" && (
          <motion.div
            key="gate"
            className="absolute inset-0 grid place-items-center px-6 text-center"
            style={{
              background:
                phase === "asleep"
                  ? "linear-gradient(180deg, rgba(6,6,14,.86), rgba(6,6,14,.72))"
                  : "linear-gradient(180deg, rgba(6,6,14,.4), rgba(6,6,14,.18))",
              backdropFilter: "blur(1.5px)",
            }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.25 : 1.6 }}
          >
            <Gate
              content={content}
              reduced={reduced}
              waking={phase === "waking"}
              onWake={() => setPhase("waking")}
              onEnter={() => setPhase("exploring")}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- the little heads-up display ---------- */}
      {phase === "exploring" && !open && !secretOpen && (
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0 : 0.6, duration: 0.8 }}
        >
          <div
            className="rounded-full px-4 py-2"
            style={{ background: "rgba(12,10,18,.5)", backdropFilter: "blur(8px)" }}
          >
            <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: world.inkSoft }}>
              {visited.size} of {live.length} visited
            </span>
          </div>

          <button
            type="button"
            onClick={() => setPhase("ending")}
            className="pointer-events-auto cursor-pointer rounded-full px-4 py-2"
            style={{
              background: "rgba(12,10,18,.5)",
              border: "none",
              backdropFilter: "blur(8px)",
              fontFamily: MONO,
              fontSize: 9,
              letterSpacing: ".2em",
              textTransform: "uppercase",
              color: world.inkSoft,
            }}
          >
            see it all →
          </button>
        </motion.div>
      )}

      {/* ---------- inside a building ---------- */}
      <AnimatePresence>
        {open && (
          <DistrictOverlay
            key={open.id}
            district={open}
            world={world}
            reduced={reduced}
            onClose={() => setOpen(null)}
          />
        )}
      </AnimatePresence>

      {/* ---------- the secret place ---------- */}
      <AnimatePresence>
        {secretOpen && (
          <SecretOverlay
            key="secret"
            content={content}
            world={world}
            reduced={reduced}
            onClose={() => setSecretOpen(false)}
            onEnd={() => {
              setSecretOpen(false);
              setPhase("ending");
            }}
          />
        )}
      </AnimatePresence>

      {/* ---------- pulling back ---------- */}
      <AnimatePresence>
        {phase === "ending" && (
          <Ending
            key="end"
            content={content}
            world={world}
            reduced={reduced}
            visited={visited.size}
            onBack={() => setPhase("exploring")}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Arriving                                                            */
/* ------------------------------------------------------------------ */

/**
 * The wooden sign at the gate.
 *
 * Two beats rather than one: the world is asleep and you wake it, then the lights
 * come up and you choose to go in. The pause between them is the whole trick —
 * it is the moment a page stops being a page.
 */
function Gate({
  content,
  reduced,
  waking,
  onWake,
  onEnter,
}: {
  content: MiniWorldContent;
  reduced: boolean;
  waking: boolean;
  onWake: () => void;
  onEnter: () => void;
}) {
  const world = WORLDS[content.world] ?? WORLDS["cozy-town"];

  return (
    <motion.div style={{ maxWidth: 560 }} layout>
      {content.recipient && (
        <motion.p
          className="m-0 mb-5"
          style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".26em", textTransform: "uppercase", color: world.accent }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduced ? 0 : 0.5, duration: 1.1 }}
        >
          Built for {content.recipient}
        </motion.p>
      )}

      {/* the sign */}
      <motion.div
        style={{
          display: "inline-block",
          position: "relative",
          padding: "22px 34px",
          borderRadius: 8,
          background: "linear-gradient(160deg, #7d5c3a, #5d4228)",
          border: "1px solid rgba(30,20,10,.5)",
          boxShadow: "0 30px 50px -28px rgba(0,0,0,.8)",
        }}
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18, rotate: -1.4 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ delay: reduced ? 0 : 0.9, duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <h1
          className="m-0"
          style={{
            fontFamily: SERIF,
            fontWeight: 500,
            fontSize: "clamp(22px, 4vw, 34px)",
            lineHeight: 1.15,
            color: "#f6e3c4",
            textWrap: "balance",
          }}
        >
          {content.title || "Welcome to Our Mini World"}
        </h1>
      </motion.div>

      {content.subtitle && (
        <motion.p
          className="m-0 mt-6"
          style={{ fontFamily: HAND, fontSize: "clamp(18px,2.8vw,23px)", lineHeight: 1.55, color: "#f0e0c8" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduced ? 0 : 1.5, duration: 1.1 }}
        >
          {content.subtitle}
        </motion.p>
      )}

      {/* the little crowd who live here, waiting */}
      {content.characters.length > 0 && (
        <motion.svg
          viewBox="-46 -22 92 26"
          style={{ width: "min(300px, 74%)", marginTop: 26, overflow: "visible" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0 : 1.9, duration: 1 }}
        >
          {content.characters.slice(0, 5).map((c, i, arr) => (
            <g key={c.id} transform={`translate(${(i - (arr.length - 1) / 2) * 15} 0) scale(.95)`}>
              <TinyPerson ch={c} i={i} />
            </g>
          ))}
        </motion.svg>
      )}

      <motion.button
        type="button"
        onClick={waking ? onEnter : onWake}
        className="cursor-pointer"
        style={{
          marginTop: 30,
          height: 52,
          padding: "0 34px",
          borderRadius: 999,
          border: "none",
          background: world.accent,
          color: "#1a1208",
          fontFamily: "inherit",
          fontSize: 15,
          fontWeight: 500,
          boxShadow: `0 0 44px -6px ${world.glow}`,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, boxShadow: [`0 0 30px -8px ${world.glow}`, `0 0 54px -4px ${world.glow}`, `0 0 30px -8px ${world.glow}`] }}
        transition={{
          opacity: { delay: reduced ? 0 : 2.2, duration: 0.9 },
          boxShadow: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        {waking ? "Enter →" : "Turn on the lights"}
      </motion.button>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Inside a building                                                   */
/* ------------------------------------------------------------------ */

/**
 * The experience itself, mounted unchanged.
 *
 * `contain: paint` is the load-bearing line. Six of the experiences use
 * `position: fixed` for their opened-item overlays; without a containing block
 * here, an opened Love Letter would cover the whole world including the way out.
 * Measured behaviour, not a hope — the same trick `SectionShell` uses.
 */
function DistrictOverlay({
  district,
  world,
  reduced,
  onClose,
}: {
  district: District;
  world: World;
  reduced: boolean;
  onClose: () => void;
}) {
  const def = getSectionTemplate(district.type);
  if (!def) return null;

  const parsed = def.contentSchema.safeParse(district.content ?? def.emptyContent);
  const inner = parsed.success ? parsed.data : def.emptyContent;
  const name = district.label || archetypeFor(district.type).name;

  return (
    <motion.div
      className="absolute inset-0 z-40 flex flex-col"
      style={{ background: "rgba(8,6,12,.55)", backdropFilter: "blur(3px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0.2 : 0.55 }}
    >
      {/* the door opening: the room grows out of the building */}
      <motion.div
        className="relative m-auto flex w-full flex-col overflow-hidden"
        style={{
          maxWidth: "min(1180px, 96%)",
          height: "min(88%, 900px)",
          borderRadius: 14,
          border: `1px solid ${world.accentSoft}`,
          boxShadow: "0 60px 110px -50px rgba(0,0,0,.85)",
          background: "#000",
        }}
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.82, y: 26 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 16 }}
        transition={{ duration: reduced ? 0.2 : 0.7, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <div
          className="flex shrink-0 flex-wrap items-center justify-between gap-3 px-4 py-3"
          style={{ background: "rgba(14,11,18,.92)" }}
        >
          <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: world.inkSoft }}>
            {name}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full px-4 py-1.5"
            style={{
              background: "transparent",
              border: `1px solid ${world.inkSoft}44`,
              color: world.ink,
              fontFamily: MONO,
              fontSize: 9,
              letterSpacing: ".18em",
              textTransform: "uppercase",
            }}
          >
            back outside
          </button>
        </div>

        {/* The room. `contain: paint` — see above. */}
        <div style={{ position: "relative", flex: 1, minHeight: 0, contain: "paint" }}>
          <def.View content={inner} embedded />
        </div>
      </motion.div>
    </motion.div>
  );
}


/* ------------------------------------------------------------------ */
/* The secret place                                                    */
/* ------------------------------------------------------------------ */

/** Where the whole thing has been going. Deliberately the plainest screen here. */
function SecretOverlay({
  content,
  world,
  reduced,
  onClose,
  onEnd,
}: {
  content: MiniWorldContent;
  world: World;
  reduced: boolean;
  onClose: () => void;
  onEnd: () => void;
}) {
  const place = SECRET_PLACES[content.secret];

  return (
    <motion.div
      className="absolute inset-0 z-40 grid place-items-center overflow-y-auto p-6"
      style={{ background: "rgba(8,6,12,.72)", backdropFilter: "blur(6px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0.2 : 0.9 }}
    >
      <motion.div
        className="text-center"
        style={{ maxWidth: 560 }}
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduced ? 0.25 : 1.1, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <div style={{ fontSize: 32, lineHeight: 1 }}>{place.emoji}</div>
        <p className="m-0 mt-4" style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".24em", textTransform: "uppercase", color: world.accent }}>
          {place.label}
        </p>

        <h2
          className="m-0 mt-5"
          style={{ fontFamily: SERIF, fontWeight: 500, fontSize: "clamp(24px,4vw,38px)", lineHeight: 1.2, color: world.ink }}
        >
          {content.secretTitle || "There's one more thing."}
        </h2>

        {content.secretMessage && (
          <p
            className="m-0 mt-6"
            style={{ fontFamily: HAND, fontSize: "clamp(18px,2.8vw,24px)", lineHeight: 1.65, color: world.ink, whiteSpace: "pre-line" }}
          >
            {content.secretMessage}
          </p>
        )}

        {content.from && (
          <p className="m-0 mt-7" style={{ fontFamily: HAND, fontSize: 21, color: world.accent }}>
            — {content.from}
          </p>
        )}

        <div className="mt-9 flex flex-wrap justify-center gap-2.5">
          <button
            type="button"
            onClick={onEnd}
            className="cursor-pointer rounded-full px-6 py-3"
            style={{ background: world.accent, border: "none", color: "#1a1208", fontFamily: "inherit", fontSize: 14 }}
          >
            See the whole world →
          </button>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full px-6 py-3"
            style={{
              background: "transparent",
              border: `1px solid ${world.inkSoft}44`,
              color: world.inkSoft,
              fontFamily: "inherit",
              fontSize: 14,
            }}
          >
            Keep exploring
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Pulling back                                                        */
/* ------------------------------------------------------------------ */

/** The camera lifts, the constellation forms, and nothing asks for anything. */
function Ending({
  content,
  world,
  reduced,
  visited,
  onBack,
}: {
  content: MiniWorldContent;
  world: World;
  reduced: boolean;
  visited: number;
  onBack: () => void;
}) {
  /* A heart, plotted once and reused — the constellation the brief asks for,
     drawn rather than approximated with scattered dots. */
  const heart = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => {
        const t = (i / 22) * Math.PI * 2;
        const x = 16 * Math.sin(t) ** 3;
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        return { x, y, d: seeded(i, 4.2) };
      }),
    []
  );

  return (
    <motion.div
      className="absolute inset-0 z-50 grid place-items-center overflow-y-auto px-6 py-10 text-center"
      style={{ background: "linear-gradient(180deg, rgba(6,6,14,.62), rgba(6,6,14,.86))" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0.25 : 1.6 }}
    >
      <div style={{ maxWidth: 620 }}>
        <motion.svg
          viewBox="-24 -24 48 44"
          style={{ width: "min(230px, 56%)", overflow: "visible" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduced ? 0 : 0.8, duration: 1.4 }}
        >
          {heart.map((p, i) => (
            <motion.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={0.8}
              fill={world.glow}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0.75], scale: 1 }}
              transition={{
                delay: reduced ? 0 : 1 + i * 0.075,
                duration: 1.6,
                repeat: Infinity,
                repeatType: "reverse",
                repeatDelay: 2.4,
              }}
            />
          ))}
        </motion.svg>

        <motion.p
          className="m-0 mt-8"
          style={{ fontFamily: SERIF, fontWeight: 500, fontSize: "clamp(22px,3.6vw,34px)", lineHeight: 1.3, color: world.ink, textWrap: "balance" }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0.2 : 2.6, duration: 1.3 }}
        >
          {content.endingLine || "Some stories deserve their own world."}
        </motion.p>

        <motion.p
          className="m-0 mt-5"
          style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".2em", textTransform: "uppercase", color: world.inkSoft }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduced ? 0.3 : 3.4, duration: 1 }}
        >
          {visited > 0 ? `${visited} place${visited > 1 ? "s" : ""} visited` : "the world is still yours to walk"}
        </motion.p>

        <motion.button
          type="button"
          onClick={onBack}
          className="cursor-pointer"
          style={{
            marginTop: 30,
            background: "transparent",
            border: `1px solid ${world.inkSoft}40`,
            borderRadius: 999,
            padding: "11px 24px",
            color: world.inkSoft,
            fontFamily: MONO,
            fontSize: 9.5,
            letterSpacing: ".2em",
            textTransform: "uppercase",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduced ? 0.4 : 4, duration: 1 }}
        >
          go back in
        </motion.button>
      </div>
    </motion.div>
  );
}
