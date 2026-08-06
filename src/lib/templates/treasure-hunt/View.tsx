"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ibmPlexMono } from "@/app/fonts";
import { LETTER_FONT_VARS } from "@/app/letterFonts";
import { Curtain, LoadingVeil, SceneStage, useNarration, useScene, useSettled, type Beat } from "@/lib/engines/scene";
import { Bloom, Drift, DustMotes, Fireflies, Glow, Grain, Starfield } from "@/lib/engines/scene/ambient";
import { SoftParticles } from "@/lib/engines/gift";
import { MemoryBlockView } from "@/lib/engines/memory-block";
import type { BlockSkin } from "@/lib/engines/memory-block/schema";
import { ClueView } from "./clues";
import { Chest, Compass, Lantern, PassingBird, PinnedThing, TreasureMap } from "./parts";
import { TH_FALLBACKS, journeyNote, type TreasureHuntContent } from "./schema";
import {
  BODY_FONT,
  DISPLAY_FONT,
  HAND_FONT,
  JOURNEYS,
  MAP_STYLES,
  MONO_FONT,
  type Ambience,
} from "./theme";

/**
 * Treasure Hunt — the recipient's experience.
 *
 * Beats: a lantern in the dark → the map unrolls and the route draws itself → the
 * journey, one stop at a time, with rewards pinned to a board → the chest → the
 * map with every stop struck through.
 *
 * The rule that governs the whole thing: they are never stuck and never told off.
 * Wrong answers are met kindly, a nudge is always available, and after half a
 * minute any clue will simply let them through. Somebody planned this for them —
 * the plan can't be the thing that stops them.
 */

type BeatId = "lantern" | "unrolling" | "journey" | "chest" | "ending";

const BEATS: readonly Beat<BeatId>[] = [
  { id: "lantern", hold: 3400 },
  { id: "unrolling" },
  { id: "journey" },
  { id: "chest" },
  { id: "ending" },
];

/* ------------------------------------------------------------------ */

/** The air this journey moves through. Visual only — see the note in theme.ts. */
function Air({ ambience, glow, gilt }: { ambience: Ambience; glow: string; gilt: string }) {
  return (
    <>
      {ambience === "fireflies" && <Fireflies count={9} color={glow} seed="th-flies" />}
      {ambience === "leaves" && <Drift count={10} color={gilt} seed="th-leaves" glyph="❦" opacity={0.3} speed={26} />}
      {ambience === "waves" && <Drift count={12} color={glow} seed="th-waves" opacity={0.22} speed={30} />}
      {ambience === "snow" && <Drift count={16} color="#ffffff" seed="th-snow" opacity={0.34} speed={22} />}
      {ambience === "embers" && <Drift count={11} color={glow} seed="th-embers" opacity={0.4} speed={18} />}
      {ambience === "stars" && <Starfield count={22} color={glow} seed="th-stars" />}
      <DustMotes count={16} color={glow} seed="th-dust" opacity={0.3} />
    </>
  );
}

/* ------------------------------------------------------------------ */

export function TreasureHuntView({
  content,
  embedded = false,
}: {
  content: TreasureHuntContent;
  embedded?: boolean;
}) {
  const reduced = useReducedMotion();
  const style = MAP_STYLES[content.map] ?? MAP_STYLES.vintageTreasure;
  const journey = JOURNEYS[content.journey] ?? JOURNEYS.romantic;
  const scene = useScene<BeatId>(BEATS);
  const settled = useSettled(embedded ? 200 : 1200);

  const stops = content.stops;
  const [solved, setSolved] = useState(0);
  const [at, setAt] = useState(0);
  const [routeDrawn, setRouteDrawn] = useState(false);
  const [showingReward, setShowingReward] = useState<number | null>(null);
  const [revisiting, setRevisiting] = useState<number | null>(null);
  const [chestOpen, setChestOpen] = useState(false);
  const [sound, setSound] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const lines = content.openingLines.length >= 2 ? content.openingLines : [...journey.opening];
  const narrated = useNarration(lines.length, 1500, 1000);

  const blockSkin: BlockSkin = useMemo(
    () => ({
      ink: style.ink,
      inkSoft: style.inkSoft,
      accent: style.gilt,
      accentSoft: style.giltSoft,
      surface: style.dark ? "#12101f" : "#f6ecd8",
      edge: style.paperEdge,
      display: DISPLAY_FONT,
      hand: HAND_FONT,
      body: BODY_FONT,
      mono: MONO_FONT,
    }),
    [style]
  );

  /* The route draws itself once the map is open — announced, not instant. */
  useEffect(() => {
    if (scene.beat !== "unrolling") return;
    const draw = setTimeout(() => setRouteDrawn(true), reduced ? 200 : 2100);
    const go = setTimeout(() => scene.go("journey"), reduced ? 600 : 6200);
    return () => {
      clearTimeout(draw);
      clearTimeout(go);
    };
  }, [scene, reduced]);

  const startSound = useCallback(() => {
    const el = audioRef.current;
    if (!el || !el.paused) return;
    void el.play().then(() => setSound(true)).catch(() => setSound(false));
  }, []);

  const beginJourney = () => {
    scene.go("unrolling");
    startSound();
  };

  /** A stop has been done: pin the reward, then move on. */
  const solveStop = (index: number) => {
    setSolved((s) => Math.max(s, index + 1));
    setShowingReward(index);
  };

  const closeReward = () => {
    const index = showingReward;
    setShowingReward(null);
    if (index === null) return;
    if (index + 1 >= stops.length) {
      setTimeout(() => scene.go("chest"), 700);
    } else {
      setAt(index + 1);
    }
  };

  const stop = stops[at];
  const done = stops.length > 0 && solved >= stops.length;

  return (
    <div className={`${ibmPlexMono.variable} ${LETTER_FONT_VARS} relative w-full`}>
      {!embedded && (
        <LoadingVeil show={!settled} background="#0d0906" color={style.giltSoft} label="lighting the lamp">
          <Lantern style={style} size={72} />
        </LoadingVeil>
      )}

      <SceneStage background={style.room} embedded={embedded} vignette="rgba(0,0,0,.5)">
        <Air ambience={journey.ambience} glow={style.glow} gilt={style.gilt} />
        <Glow color={style.glow.replace(/[\d.]+\)$/, "0.16)")} at="50% 24%" size="56% 40%" />
        <Grain opacity={0.05} />
        <PassingBird color={style.giltSoft} />

        <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center px-5 py-12 sm:px-8 sm:py-16">
          <Curtain beat={scene.beat} kind="fade" duration={1} className="w-full">
            {/* ---------- a lantern in the dark ---------- */}
            {scene.beat === "lantern" && (
              <div className="flex flex-col items-center gap-10">
                <Lantern style={style} size={104} />

                <div className="min-h-[92px] text-center">
                  {lines.map((line, i) => (
                    <motion.p
                      key={i}
                      className="m-0"
                      style={{ fontFamily: HAND_FONT, fontSize: "clamp(21px,3.6vw,32px)", lineHeight: 1.5, color: style.dark ? style.ink : "#f2e4c4" }}
                      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12, filter: "blur(7px)" }}
                      animate={narrated > i ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 12 }}
                      transition={{ duration: 1.4, ease: "easeOut" }}
                    >
                      {line}
                    </motion.p>
                  ))}
                </div>

                {/* the rolled map, tied with ribbon */}
                <motion.button
                  type="button"
                  onClick={beginJourney}
                  disabled={stops.length === 0}
                  aria-label={stops.length === 0 ? "No route yet" : "Untie the ribbon"}
                  className={`relative border-0 bg-transparent p-0 ${stops.length ? "cursor-pointer" : "cursor-default"}`}
                  style={{ width: "min(340px, 84%)" }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: narrated >= lines.length ? 1 : 0, y: narrated >= lines.length ? 0 : 20 }}
                  transition={{ duration: 1.2 }}
                  whileHover={reduced || !stops.length ? undefined : { scale: 1.03, rotate: -0.6 }}
                >
                  {/* the roll */}
                  <span
                    className="block"
                    style={{
                      height: 46,
                      background: style.paper,
                      borderRadius: 23,
                      boxShadow: `0 16px 34px -14px rgba(0,0,0,.7), inset 0 -8px 14px ${style.paperEdge}`,
                    }}
                  />
                  {/* the ribbon around it */}
                  <span
                    aria-hidden
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ width: 22, height: 62, background: `linear-gradient(90deg, ${style.gilt}, ${style.giltSoft})`, borderRadius: 2 }}
                  />
                  <span
                    className="mt-3.5 block"
                    style={{ fontFamily: MONO_FONT, fontSize: 9, letterSpacing: ".26em", textTransform: "uppercase", color: style.giltSoft }}
                  >
                    {stops.length === 0 ? "nothing mapped yet" : "untie it"}
                  </span>
                </motion.button>
              </div>
            )}

            {/* ---------- the map unrolls and draws its route ---------- */}
            {scene.beat === "unrolling" && (
              <div className="flex flex-col items-center gap-7">
                <TreasureMap
                  style={style}
                  stops={stops}
                  solved={0}
                  current={0}
                  unrolled
                  routeDrawn={routeDrawn}
                />
                <div className="flex items-center gap-5">
                  <Compass style={style} size={64} />
                  <motion.p
                    className="m-0"
                    style={{ fontFamily: HAND_FONT, fontSize: 21, color: style.dark ? style.ink : "#f2e4c4" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: routeDrawn ? 1 : 0 }}
                    transition={{ duration: 1.2 }}
                  >
                    {stops.length} {journey.stopWord}
                    {stops.length === 1 ? "" : "s"}. This way.
                  </motion.p>
                </div>
                <button
                  type="button"
                  onClick={() => scene.go("journey")}
                  className="cursor-pointer border-0 bg-transparent"
                  style={{ fontFamily: MONO_FONT, fontSize: 9, letterSpacing: ".22em", textTransform: "uppercase", color: style.giltSoft }}
                >
                  set off
                </button>
              </div>
            )}

            {/* ---------- the journey ---------- */}
            {scene.beat === "journey" && (
              <div className="flex w-full flex-col items-center gap-8">
                {/* where they are */}
                <div className="w-full">
                  <TreasureMap
                    style={style}
                    stops={stops}
                    solved={solved}
                    current={done ? -1 : at}
                    unrolled
                    routeDrawn
                    onPick={(i) => i <= solved && setAt(i)}
                  />
                </div>

                <p
                  className="m-0"
                  style={{ fontFamily: MONO_FONT, fontSize: 9.5, letterSpacing: ".24em", textTransform: "uppercase", color: style.giltSoft }}
                  role="status"
                >
                  {journeyNote(solved, stops.length, journey.stopWord)}
                </p>

                {/* the clue at this stop */}
                {stop && !done && (
                  <motion.div
                    key={stop.id}
                    className="w-full"
                    style={{
                      maxWidth: "min(640px, 100%)",
                      background: style.dark ? "rgba(255,255,255,.04)" : "rgba(255,248,232,.5)",
                      border: `1px solid ${style.giltSoft}`,
                      borderRadius: 4,
                      backdropFilter: "blur(3px)",
                    }}
                    initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
                  >
                    <div className="px-5 py-9 sm:px-9">
                      <div className="mb-6 text-center">
                        <span style={{ fontFamily: MONO_FONT, fontSize: 9, letterSpacing: ".3em", textTransform: "uppercase", color: style.gilt }}>
                          {stop.clue.place || `${journey.stopWord} ${at + 1}`}
                        </span>
                      </div>
                      <ClueView stop={stop} style={style} blockSkin={blockSkin} onSolve={() => solveStop(at)} />
                    </div>
                  </motion.div>
                )}

                {done && (
                  <motion.button
                    type="button"
                    onClick={() => scene.go("chest")}
                    className="cursor-pointer rounded-full border-0 px-8 py-3.5"
                    style={{ background: style.gilt, color: style.dark ? "#12101f" : "#f6ecd8", fontFamily: MONO_FONT, fontSize: 10.5, letterSpacing: ".2em", textTransform: "uppercase" }}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9 }}
                  >
                    There it is
                  </motion.button>
                )}

                {/* ---------- the journey board ---------- */}
                {solved > 0 && (
                  <div className="w-full">
                    <div className="mb-4 flex items-center gap-3">
                      <span style={{ fontFamily: MONO_FONT, fontSize: 9, letterSpacing: ".26em", textTransform: "uppercase", color: style.giltSoft }}>
                        what you&apos;ve found
                      </span>
                      <span aria-hidden className="h-px flex-1" style={{ background: style.giltSoft }} />
                    </div>
                    <div
                      className="grid grid-cols-3 gap-4 rounded-[4px] p-5 sm:grid-cols-4 sm:gap-5"
                      style={{ background: "rgba(0,0,0,.2)", border: `1px solid ${style.giltSoft}` }}
                    >
                      {stops.slice(0, solved).map((s, i) => (
                        <PinnedThing key={s.id} stop={s} index={i} style={style} onOpen={() => setRevisiting(i)} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ---------- the chest ---------- */}
            {scene.beat === "chest" && (
              <div className="relative flex w-full flex-col items-center gap-9">
                <Bloom color={style.glow} play={chestOpen} />
                <SoftParticles play={chestOpen} color={style.gilt} count={22} seed="th-chest" />

                {!chestOpen && (
                  <motion.p
                    className="m-0 text-center"
                    style={{ fontFamily: HAND_FONT, fontSize: "clamp(20px,3.2vw,28px)", color: style.dark ? style.ink : "#f2e4c4" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.4 }}
                  >
                    You found every one of them.
                  </motion.p>
                )}

                <Chest
                  style={style}
                  open={chestOpen}
                  plate={content.chestPlate || TH_FALLBACKS.chestPlate}
                  onOpen={() => setChestOpen(true)}
                />

                {/* what was inside */}
                <AnimatePresence>
                  {chestOpen && (
                    <motion.div
                      className="w-full"
                      style={{ maxWidth: "min(620px, 100%)", transformOrigin: "50% 0%" }}
                      initial={reduced ? { opacity: 0 } : { opacity: 0, rotateX: -80, scaleY: 0.32 }}
                      animate={{ opacity: 1, rotateX: 0, scaleY: 1 }}
                      transition={{ duration: reduced ? 0.3 : 1.2, ease: [0.2, 0.8, 0.2, 1], delay: 1.4 }}
                    >
                      <div
                        className="relative px-6 py-10 sm:px-10"
                        style={{ background: style.paper, borderRadius: 4, boxShadow: "0 40px 80px -34px rgba(0,0,0,.7)" }}
                      >
                        <Grain opacity={0.06} blend="multiply" />
                        <MemoryBlockView block={content.treasure} skin={blockSkin} writeOn showLabel />

                        {/* the chest as a doorway to another gift */}
                        {content.treasureLinkUrl && (
                          <div className="mt-9 text-center">
                            <a
                              href={content.treasureLinkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-full px-7 py-3.5 no-underline"
                              style={{
                                display: "inline-block",
                                background: style.gilt,
                                color: style.dark ? "#12101f" : "#f6ecd8",
                                fontFamily: MONO_FONT,
                                fontSize: 10.5,
                                letterSpacing: ".18em",
                                textTransform: "uppercase",
                              }}
                            >
                              {content.treasureLinkLabel || "Open it"} ↗
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="mt-8 flex justify-center">
                        <button
                          type="button"
                          onClick={() => scene.go("ending")}
                          className="cursor-pointer border-0 bg-transparent"
                          style={{ fontFamily: MONO_FONT, fontSize: 9.5, letterSpacing: ".22em", textTransform: "uppercase", color: style.giltSoft }}
                        >
                          look at the map once more
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* ---------- the ending ---------- */}
            {scene.beat === "ending" && (
              <div className="flex w-full flex-col items-center gap-9">
                {/* every stop struck through */}
                <TreasureMap
                  style={style}
                  stops={stops}
                  solved={stops.length}
                  current={-1}
                  unrolled
                  routeDrawn
                  compact
                />

                <motion.p
                  className="m-0 max-w-xl text-center"
                  style={{ fontFamily: HAND_FONT, fontSize: "clamp(21px,3.4vw,30px)", lineHeight: 1.5, color: style.dark ? style.ink : "#f2e4c4" }}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 2.2, delay: 0.8 }}
                >
                  {content.closingLine || journey.ending || TH_FALLBACKS.closingLine}
                </motion.p>

                {/* the compass stops moving */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.4, delay: 2.2 }}
                >
                  <Compass style={style} size={74} stopped />
                </motion.div>

                {!embedded && (
                  <motion.a
                    href="/templates"
                    className="rounded-full border px-6 py-3 no-underline"
                    style={{ borderColor: style.giltSoft, color: style.dark ? style.ink : "#f2e4c4", fontFamily: MONO_FONT, fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.2, delay: 3.4 }}
                  >
                    Draw one yourself
                  </motion.a>
                )}
              </div>
            )}
          </Curtain>
        </div>

        {content.ambienceUrl && (
          <>
            <audio ref={audioRef} src={content.ambienceUrl} loop preload="none" className="sr-only" />
            <button
              type="button"
              onClick={() => {
                const el = audioRef.current;
                if (!el) return;
                if (el.paused) startSound();
                else {
                  el.pause();
                  setSound(false);
                }
              }}
              className="absolute bottom-5 right-5 cursor-pointer rounded-full border px-3.5 py-2"
              style={{ background: "rgba(0,0,0,.28)", borderColor: style.giltSoft, color: style.giltSoft, fontFamily: MONO_FONT, fontSize: 9, letterSpacing: ".16em", textTransform: "uppercase" }}
            >
              {sound ? "❙❙" : "▶"} sound
            </button>
          </>
        )}
      </SceneStage>

      {/* ---------- the reward for a stop, as it's pinned ---------- */}
      <AnimatePresence>
        {showingReward !== null && stops[showingReward] && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-5 sm:p-9"
            style={{ background: "rgba(14,9,4,.86)", backdropFilter: "blur(6px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            role="dialog"
            aria-modal="true"
            aria-label="What you found"
          >
            <motion.div
              className="relative my-auto w-full max-w-xl"
              style={{ background: style.paper, borderRadius: 4, transformOrigin: "50% 0%", boxShadow: `0 50px 100px -40px #000, 0 0 80px -30px ${style.glow}` }}
              initial={reduced ? { opacity: 0 } : { opacity: 0, rotateX: -82, scaleY: 0.3 }}
              animate={{ opacity: 1, rotateX: 0, scaleY: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, rotateX: -54, scaleY: 0.5 }}
              transition={{ duration: reduced ? 0.25 : 1, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <Grain opacity={0.06} blend="multiply" />
              <div className="px-6 py-11 sm:px-10">
                <div className="mb-6 text-center">
                  <span style={{ fontFamily: MONO_FONT, fontSize: 9, letterSpacing: ".3em", textTransform: "uppercase", color: style.gilt }}>
                    found it
                  </span>
                  {stops[showingReward].aside && (
                    <p className="m-0 mt-3" style={{ fontFamily: HAND_FONT, fontSize: 20, color: style.inkSoft }}>
                      {stops[showingReward].aside}
                    </p>
                  )}
                </div>
                <MemoryBlockView block={stops[showingReward].reward} skin={blockSkin} writeOn showLabel />
              </div>
              <div className="px-6 pb-9 text-center sm:px-10">
                <button
                  type="button"
                  onClick={closeReward}
                  className="cursor-pointer rounded-full border-0 px-7 py-3"
                  style={{ background: style.gilt, color: style.dark ? "#12101f" : "#f6ecd8", fontFamily: MONO_FONT, fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase" }}
                >
                  {showingReward + 1 >= stops.length ? "to the chest" : "pin it and go on"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- looking at something on the board again ---------- */}
      <AnimatePresence>
        {revisiting !== null && stops[revisiting] && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-5 sm:p-9"
            style={{ background: "rgba(14,9,4,.8)", backdropFilter: "blur(5px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Stop ${revisiting + 1}`}
            onClick={() => setRevisiting(null)}
          >
            <motion.div
              className="relative my-auto w-full max-w-lg"
              style={{ background: style.paper, borderRadius: 4, boxShadow: "0 40px 80px -34px #000" }}
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setRevisiting(null)}
                aria-label="Close"
                className="absolute right-3.5 top-3.5 z-10 cursor-pointer rounded-full border-0"
                style={{ width: 34, height: 34, background: style.giltSoft, color: style.ink, fontSize: 15 }}
              >
                ✕
              </button>
              <div className="px-6 py-10 sm:px-9">
                <MemoryBlockView block={stops[revisiting].reward} skin={blockSkin} showLabel />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
