"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ibmPlexMono } from "@/app/fonts";
import { LETTER_FONT_VARS } from "@/app/letterFonts";
import { Curtain, LoadingVeil, SceneStage, useNarration, useScene, useSettled, type Beat } from "@/lib/engines/scene";
import { Bloom, DustMotes, Glow, Grain } from "@/lib/engines/scene/ambient";
import { BOX_MATERIALS, Confetti, GiftTag, RIBBONS, Ribbon, SoftParticles, WRAPPINGS } from "@/lib/engines/gift";
import { MemoryBlockView } from "@/lib/engines/memory-block";
import type { BlockSkin } from "@/lib/engines/memory-block/schema";
import { Guard } from "./games";
import { SB_FALLBACKS, depthNote, isGuarded, type Layer, type SurpriseBoxContent } from "./schema";
import { BODY_FONT, DISPLAY_FONT, HAND_FONT, MONO_FONT, SCHEMES, type Scheme } from "./theme";

/**
 * Surprise Reveal Box — the recipient's experience.
 *
 * One box at a time, each smaller than the last, and the ones already opened stack
 * up along the bottom of the table so the person can see how far in they are. The
 * pacing per layer is always: ribbon → (whatever's in the way) → lid → what's
 * inside → next box. Repetition is the point; it's a ritual.
 */

type BeatId = "table" | "unwrapping" | "finale";

const BEATS: readonly Beat<BeatId>[] = [
  { id: "table", hold: 2600 },
  { id: "unwrapping" },
  { id: "finale" },
];

/** Each box is a little smaller than the one it came out of. */
function boxWidth(index: number, total: number): string {
  const shrink = total <= 1 ? 0 : (index / (total - 1)) * 0.3;
  return `min(${Math.round((1 - shrink) * 420)}px, ${Math.round((1 - shrink) * 88)}%)`;
}

/* ------------------------------------------------------------------ */

function Sticker({ kind, scheme }: { kind: Layer["sticker"]; scheme: Scheme }) {
  if (kind === "none") return null;
  const common = { fill: "none", stroke: scheme.paperB, strokeWidth: 2.2, strokeLinecap: "round" as const };

  return (
    <span
      aria-hidden
      className="absolute flex items-center justify-center rounded-full"
      style={{
        right: "-4%",
        top: "-4%",
        width: 52,
        height: 52,
        background: kind === "stamp" ? scheme.paperB : scheme.accent,
        borderRadius: kind === "stamp" ? 3 : "50%",
        boxShadow: "0 5px 12px -4px rgba(0,0,0,.5)",
        transform: "rotate(9deg)",
      }}
    >
      <svg viewBox="0 0 40 40" width="30" height="30">
        {kind === "seal" && (
          <>
            <circle cx="20" cy="20" r="12" {...common} strokeDasharray="3 3" />
            <circle cx="20" cy="20" r="5" fill={scheme.paperB} />
          </>
        )}
        {kind === "star" && (
          <path d="M20 7 L23.4 16 L33 16.6 L25.6 22.6 L28 32 L20 26.8 L12 32 L14.4 22.6 L7 16.6 L16.6 16 Z" fill={scheme.paperB} />
        )}
        {kind === "heart" && (
          <path d="M20 31 C 8 22, 9 12, 15 12 C 18 12, 20 15.5, 20 17 C 20 15.5, 22 12, 25 12 C 31 12, 32 22, 20 31 Z" fill={scheme.paperB} />
        )}
        {kind === "bow" && (
          <>
            <path d="M20 20 C 12 12, 4 15, 6 20 C 4 25, 12 28, 20 20 Z" fill={scheme.paperB} />
            <path d="M20 20 C 28 12, 36 15, 34 20 C 36 25, 28 28, 20 20 Z" fill={scheme.paperB} />
            <circle cx="20" cy="20" r="3" fill={scheme.accent} />
          </>
        )}
        {kind === "stamp" && (
          <>
            <rect x="8" y="9" width="24" height="22" fill={scheme.accent} />
            <path d="M13 24 L18 16 L23 24 M22 20 L26 24" stroke={scheme.paperB} strokeWidth="1.8" fill="none" />
          </>
        )}
      </svg>
    </span>
  );
}

/**
 * One wrapped box. The ribbon has to come off before the lid will lift, and the
 * lid won't lift at all while something is guarding it — the order is fixed
 * because that's the order it happens in real life.
 */
function WrappedBox({
  layer,
  index,
  total,
  scheme,
  untied,
  unlocked,
  open,
  onUntie,
  onLift,
}: {
  layer: Layer;
  index: number;
  total: number;
  scheme: Scheme;
  untied: boolean;
  unlocked: boolean;
  open: boolean;
  onUntie: () => void;
  onLift: () => void;
}) {
  const reduced = useReducedMotion();
  const material = BOX_MATERIALS[layer.material];
  const ribbon = RIBBONS[layer.ribbon];
  const paper = WRAPPINGS[layer.wrapping].pattern(scheme.paperA, scheme.paperB);
  const liftable = untied && unlocked && !open;

  return (
    <div className="relative mx-auto" style={{ width: boxWidth(index, total), perspective: 1200 }}>
      <div className="relative" style={{ aspectRatio: "5 / 4", transformStyle: "preserve-3d" }}>
        {/* the inside of the box, and the light in it */}
        <div
          className="absolute inset-0 overflow-hidden rounded-[5px]"
          style={{ background: material.inner, boxShadow: "inset 0 14px 36px rgba(0,0,0,.6)" }}
        >
          <motion.span
            aria-hidden
            className="absolute inset-0"
            style={{ background: `radial-gradient(ellipse 78% 64% at 50% 64%, ${scheme.glow}, transparent 74%)` }}
            animate={{ opacity: open ? 1 : 0 }}
            transition={{ duration: 1.3, delay: open ? 0.3 : 0 }}
          />
        </div>

        {/* the lid, wrapped */}
        <motion.button
          type="button"
          onClick={() => liftable && onLift()}
          disabled={!liftable}
          aria-label={
            open
              ? `Box ${index + 1} is open`
              : !untied
                ? "Untie the ribbon first"
                : !unlocked
                  ? "Something is keeping this shut"
                  : `Lift the lid off box ${index + 1}`
          }
          className={`absolute inset-0 overflow-hidden rounded-[5px] border-0 p-0 ${liftable ? "cursor-pointer" : "cursor-default"}`}
          style={{
            background: paper,
            border: `1px solid ${material.edge}`,
            boxShadow: "0 24px 46px -18px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.24)",
            transformOrigin: "50% 100%",
            transformStyle: "preserve-3d",
          }}
          animate={
            open
              ? { y: "-78%", rotateX: reduced ? 0 : 24, opacity: 0 }
              : { y: 0, rotateX: 0, opacity: 1 }
          }
          transition={{ duration: reduced ? 0.25 : 1.4, ease: [0.3, 0.05, 0.2, 1] }}
          whileHover={liftable && !reduced ? { y: -8 } : undefined}
        >
          {/* a hint of light along the seam once it can actually be lifted */}
          {liftable && (
            <motion.span
              aria-hidden
              className="absolute inset-x-0 top-0"
              style={{ height: 3, background: scheme.glow }}
              animate={reduced ? { opacity: 0.6 } : { opacity: [0.25, 0.9, 0.25] }}
              transition={{ duration: 2.4, repeat: Infinity }}
            />
          )}
          <Sticker kind={layer.sticker} scheme={scheme} />
        </motion.button>

        {/* the ribbon, over the lid */}
        {!open && (
          <Ribbon
            untied={untied}
            color={ribbon.hex}
            sheen={ribbon.sheen}
            onUntie={untied ? undefined : onUntie}
            width={index === 0 ? 26 : 20}
          />
        )}
      </div>

      {/* the tag, hanging off it */}
      {layer.tag && !open && (
        <motion.div
          className="absolute z-20"
          style={{ right: "-6%", bottom: "-8%" }}
          animate={untied ? { opacity: 0, y: 24, rotate: -14 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: untied ? 0.5 : 0 }}
        >
          <GiftTag color={scheme.paperB} ink={scheme.ink} rotate={-8}>
            <span style={{ fontFamily: HAND_FONT, fontSize: 16, whiteSpace: "nowrap" }}>{layer.tag}</span>
          </GiftTag>
        </motion.div>
      )}
    </div>
  );
}

/** The boxes already dealt with, stacked along the table. */
function OpenedStack({ layers, scheme, onRevisit }: { layers: Layer[]; scheme: Scheme; onRevisit: (i: number) => void }) {
  if (layers.length === 0) return null;
  return (
    <div className="flex flex-wrap items-end justify-center gap-2">
      {layers.map((layer, i) => (
        <button
          key={layer.id}
          type="button"
          onClick={() => onRevisit(i)}
          aria-label={`Look in box ${i + 1} again`}
          className="cursor-pointer border-0 p-0"
          style={{
            width: 34,
            height: 26,
            borderRadius: 2,
            background: WRAPPINGS[layer.wrapping].pattern(scheme.paperA, scheme.paperB),
            border: `1px solid ${BOX_MATERIALS[layer.material].edge}`,
            opacity: 0.72,
            transform: `rotate(${i % 2 ? 4 : -4}deg)`,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function SurpriseBoxView({
  content,
  embedded = false,
}: {
  content: SurpriseBoxContent;
  embedded?: boolean;
}) {
  const reduced = useReducedMotion();
  const scheme = SCHEMES[content.scheme] ?? SCHEMES.party;
  const scene = useScene<BeatId>(BEATS);
  const settled = useSettled(embedded ? 200 : 1000);

  const layers = content.layers;
  const [at, setAt] = useState(0);
  const [untied, setUntied] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [open, setOpen] = useState(false);
  const [revisiting, setRevisiting] = useState<number | null>(null);
  const [music, setMusic] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const lines = content.openingLines.length > 0 ? content.openingLines : [...SB_FALLBACKS.openingLines];
  const narrated = useNarration(lines.length, 1400, 700);

  const layer = layers[at];
  const isLast = at >= layers.length - 1;

  /* A layer with nothing guarding it is unlocked the moment it appears. */
  useEffect(() => {
    if (!layer) return;
    const id = setTimeout(() => setUnlocked(!isGuarded(layer)), 0);
    return () => clearTimeout(id);
  }, [layer]);

  const blockSkin: BlockSkin = useMemo(
    () => ({
      ink: scheme.ink,
      inkSoft: scheme.inkSoft,
      accent: scheme.accent,
      accentSoft: scheme.accentSoft,
      surface: scheme.paperB,
      edge: scheme.accentSoft,
      display: DISPLAY_FONT,
      hand: HAND_FONT,
      body: BODY_FONT,
      mono: MONO_FONT,
    }),
    [scheme]
  );

  const startMusic = useCallback(() => {
    const el = audioRef.current;
    if (!el || !el.paused) return;
    void el.play().then(() => setMusic(true)).catch(() => setMusic(false));
  }, []);

  const nextLayer = () => {
    if (isLast) {
      scene.go("finale");
      return;
    }
    setAt((i) => i + 1);
    setUntied(false);
    setUnlocked(false);
    setOpen(false);
  };

  const beginUnwrapping = () => {
    scene.go("unwrapping");
    startMusic();
  };

  const opened = layers.slice(0, at);

  return (
    <div className={`${ibmPlexMono.variable} ${LETTER_FONT_VARS} relative w-full`}>
      {!embedded && (
        <LoadingVeil show={!settled} background={scheme.bg} color={scheme.inkSoft} label="wrapping it">
          <motion.span
            aria-hidden
            style={{ width: 50, height: 50, display: "block" }}
            animate={reduced ? undefined : { rotate: [0, 12, -12, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg viewBox="0 0 40 40" className="h-full w-full">
              <rect x="6" y="14" width="28" height="22" rx="2" fill="none" stroke={scheme.accent} strokeWidth="2.2" />
              <path d="M20 14 V36 M6 22 H34" stroke={scheme.accent} strokeWidth="2.2" />
              <path d="M20 14 C 13 8, 7 11, 9 14 M20 14 C 27 8, 33 11, 31 14" fill="none" stroke={scheme.accent} strokeWidth="2.2" />
            </svg>
          </motion.span>
        </LoadingVeil>
      )}

      <SceneStage background={scheme.bg} embedded={embedded} vignette="rgba(60,32,10,.24)">
        <Glow color={scheme.glow} at="50% 22%" size="58% 40%" />
        <DustMotes count={20} color="#fffaf0" seed="sb-dust" opacity={0.5} />
        <Grain opacity={0.04} />

        {/* the table it's all sitting on */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0"
          style={{ height: "34%", background: scheme.table, boxShadow: "0 -24px 44px -20px rgba(0,0,0,.4)" }}
        />

        <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-5 py-12 sm:px-8 sm:py-16">
          <Curtain beat={scene.beat} kind="fade" duration={0.9} className="w-full">
            {/* ---------- the table ---------- */}
            {scene.beat === "table" && (
              <div className="flex flex-col items-center gap-9">
                <div className="min-h-[86px] text-center">
                  {lines.map((line, i) => (
                    <motion.p
                      key={i}
                      className="m-0"
                      style={{ fontFamily: HAND_FONT, fontSize: "clamp(21px,3.4vw,31px)", lineHeight: 1.45, color: scheme.ink }}
                      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10, rotate: -1.5 }}
                      animate={narrated > i ? { opacity: 1, y: 0, rotate: -1 } : { opacity: 0, y: 10 }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                    >
                      {line}
                    </motion.p>
                  ))}
                </div>

                {(content.toLine || content.fromLine) && (
                  <GiftTag color={scheme.paperB} ink={scheme.ink} rotate={-5}>
                    <span className="block" style={{ fontFamily: HAND_FONT, fontSize: 19, lineHeight: 1.35 }}>
                      {content.toLine && <span className="block">To {content.toLine}</span>}
                      {content.fromLine && (
                        <span className="block" style={{ opacity: 0.75 }}>
                          from {content.fromLine}
                        </span>
                      )}
                    </span>
                  </GiftTag>
                )}

                {layers.length === 0 ? (
                  <p className="m-0" style={{ fontFamily: BODY_FONT, fontSize: 13.5, color: scheme.inkSoft }}>
                    No boxes yet.
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={beginUnwrapping}
                    className="cursor-pointer rounded-full border-0 px-8 py-3.5"
                    style={{
                      background: scheme.accent,
                      color: scheme.paperB,
                      fontFamily: MONO_FONT,
                      fontSize: 10.5,
                      letterSpacing: ".2em",
                      textTransform: "uppercase",
                      boxShadow: `0 16px 32px -14px ${scheme.accent}`,
                    }}
                  >
                    Open it
                  </button>
                )}
              </div>
            )}

            {/* ---------- one box at a time ---------- */}
            {scene.beat === "unwrapping" && layer && (
              <div className="flex flex-col items-center gap-7">
                <div className="text-center">
                  <div style={{ fontFamily: MONO_FONT, fontSize: 9, letterSpacing: ".3em", textTransform: "uppercase", color: scheme.accent }}>
                    box {at + 1} of {layers.length}
                  </div>
                  <p className="m-0 mt-2.5" style={{ fontFamily: HAND_FONT, fontSize: 20, color: scheme.inkSoft }} role="status">
                    {open ? "" : depthNote(at, layers.length)}
                  </p>
                </div>

                <WrappedBox
                  layer={layer}
                  index={at}
                  total={layers.length}
                  scheme={scheme}
                  untied={untied}
                  unlocked={unlocked}
                  open={open}
                  onUntie={() => setUntied(true)}
                  onLift={() => setOpen(true)}
                />

                {/* what's in the way, once the ribbon is off */}
                {untied && !unlocked && !open && (
                  <motion.div
                    className="w-full"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                  >
                    <Guard layer={layer} scheme={scheme} onSolved={() => setUnlocked(true)} />
                  </motion.div>
                )}

                {/* what was inside */}
                <AnimatePresence>
                  {open && (
                    <motion.div
                      className="relative w-full"
                      style={{ transformOrigin: "50% 0%" }}
                      /* Hinges open, like everything made of paper here. */
                      initial={reduced ? { opacity: 0 } : { opacity: 0, rotateX: -80, scaleY: 0.34 }}
                      animate={{ opacity: 1, rotateX: 0, scaleY: 1 }}
                      transition={{ duration: reduced ? 0.25 : 1, ease: [0.2, 0.8, 0.2, 1], delay: 0.5 }}
                    >
                      <SoftParticles play color={scheme.accent} count={16} seed={`sb-${layer.id}`} />
                      <div
                        className="relative px-5 py-8 sm:px-9"
                        style={{ background: scheme.paperB, borderRadius: 5, boxShadow: `0 30px 60px -28px rgba(0,0,0,.5)` }}
                      >
                        <Grain opacity={0.04} />
                        <MemoryBlockView block={layer.reward} skin={blockSkin} writeOn showLabel />
                      </div>

                      <div className="mt-7 flex justify-center">
                        <button
                          type="button"
                          onClick={nextLayer}
                          className="cursor-pointer rounded-full border-0 px-7 py-3"
                          style={{
                            background: scheme.accent,
                            color: scheme.paperB,
                            fontFamily: MONO_FONT,
                            fontSize: 10,
                            letterSpacing: ".2em",
                            textTransform: "uppercase",
                          }}
                        >
                          {isLast ? "That's the last one" : "There's another one"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <OpenedStack layers={opened} scheme={scheme} onRevisit={setRevisiting} />
              </div>
            )}

            {/* ---------- the end ---------- */}
            {scene.beat === "finale" && (
              <div className="relative flex flex-col items-center gap-9">
                <Bloom color={scheme.glow} play />
                {content.confetti && <Confetti play colors={scheme.confetti} count={44} seed="sb-finale" />}
                <SoftParticles play color={scheme.accent} count={20} seed="sb-final-soft" />

                <motion.h2
                  className="m-0 max-w-lg text-center"
                  style={{ fontFamily: DISPLAY_FONT, fontSize: "clamp(27px,5vw,50px)", lineHeight: 1.12, color: scheme.ink }}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18, filter: "blur(9px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 1.5 }}
                >
                  {content.closingLine || SB_FALLBACKS.closingLine}
                </motion.h2>

                {/* everything they got, in order */}
                <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
                  {layers.map((l, i) => (
                    <motion.button
                      key={l.id}
                      type="button"
                      onClick={() => setRevisiting(i)}
                      className="cursor-pointer overflow-hidden border-0 p-0 text-left"
                      style={{
                        background: scheme.paperB,
                        borderRadius: 4,
                        boxShadow: "0 14px 28px -14px rgba(0,0,0,.4)",
                      }}
                      initial={{ opacity: 0, y: 20, rotate: i % 2 ? 2 : -2 }}
                      animate={{ opacity: 1, y: 0, rotate: i % 2 ? 1.2 : -1.2 }}
                      transition={{ duration: 0.8, delay: 0.5 + i * 0.09 }}
                      whileHover={reduced ? undefined : { rotate: 0, scale: 1.04 }}
                    >
                      <span
                        className="block h-2"
                        style={{ background: WRAPPINGS[l.wrapping].pattern(scheme.paperA, scheme.paperB) }}
                      />
                      <span className="block px-3.5 py-3.5">
                        <span
                          className="block"
                          style={{ fontFamily: MONO_FONT, fontSize: 8.5, letterSpacing: ".2em", textTransform: "uppercase", color: scheme.accent }}
                        >
                          box {i + 1}
                        </span>
                        <span className="mt-1.5 block" style={{ fontFamily: HAND_FONT, fontSize: 17, color: scheme.ink }}>
                          {l.reward.title || l.tag || "have another look"}
                        </span>
                      </span>
                    </motion.button>
                  ))}
                </div>

                {!embedded && (
                  <a
                    href="/templates"
                    className="rounded-full border px-6 py-3 no-underline"
                    style={{ borderColor: scheme.accentSoft, color: scheme.ink, fontFamily: MONO_FONT, fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase" }}
                  >
                    Wrap one yourself
                  </a>
                )}
              </div>
            )}
          </Curtain>
        </div>

        {content.musicUrl && (
          <>
            <audio ref={audioRef} src={content.musicUrl} loop preload="none" className="sr-only" />
            <button
              type="button"
              onClick={() => {
                const el = audioRef.current;
                if (!el) return;
                if (el.paused) startMusic();
                else {
                  el.pause();
                  setMusic(false);
                }
              }}
              className="absolute bottom-5 right-5 cursor-pointer rounded-full border px-3.5 py-2"
              style={{ background: "rgba(0,0,0,.2)", borderColor: scheme.accentSoft, color: scheme.inkSoft, fontFamily: MONO_FONT, fontSize: 9, letterSpacing: ".16em", textTransform: "uppercase" }}
            >
              {music ? "❙❙" : "▶"} music
            </button>
          </>
        )}
      </SceneStage>

      {/* ---------- looking in a box again ---------- */}
      <AnimatePresence>
        {revisiting !== null && layers[revisiting] && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-5 sm:p-9"
            style={{ background: "rgba(40,20,6,.82)", backdropFilter: "blur(6px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Box ${revisiting + 1}`}
            onClick={() => setRevisiting(null)}
          >
            <motion.div
              className="relative my-auto w-full max-w-xl"
              style={{ background: scheme.paperB, borderRadius: 5, transformOrigin: "50% 0%", boxShadow: "0 50px 100px -40px #000" }}
              initial={reduced ? { opacity: 0 } : { opacity: 0, rotateX: -80, scaleY: 0.34 }}
              animate={{ opacity: 1, rotateX: 0, scaleY: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, rotateX: -52, scaleY: 0.5 }}
              transition={{ duration: reduced ? 0.25 : 0.9, ease: [0.2, 0.8, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setRevisiting(null)}
                aria-label="Close"
                className="absolute right-3.5 top-3.5 z-10 cursor-pointer rounded-full border-0"
                style={{ width: 34, height: 34, background: scheme.accentSoft, color: scheme.ink, fontSize: 15 }}
              >
                ✕
              </button>
              <div className="px-6 py-11 sm:px-10">
                <MemoryBlockView block={layers[revisiting].reward} skin={blockSkin} showLabel />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
