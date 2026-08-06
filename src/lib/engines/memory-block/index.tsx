"use client";

/**
 * Memory Block Engine — the renderer.
 *
 * Draws any block kind in a supplied skin. Every experience gets the same set of
 * memory types for free while keeping its own look, because nothing here picks a
 * colour or a font: the skin does.
 */

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Handwritten, countWords, useWriteCursor, type InkStyle } from "../paper/ink";
import { BLOCK_LABELS, type BlockSkin, type MemoryBlock } from "./schema";

/* ------------------------------------------------------------------ */

/** A play control with a waveform beside it. Used by voice blocks. */
export function AudioBlock({ url, skin, label }: { url: string; skin: BlockSkin; label: string }) {
  const [el, setEl] = useState<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const reduced = useReducedMotion();

  const toggle = () => {
    if (!el) {
      setPlaying((p) => !p);
      return;
    }
    if (el.paused) void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    else {
      el.pause();
      setPlaying(false);
    }
  };

  /* Fixed bar heights — a random waveform would differ between server and client. */
  const bars = [26, 52, 34, 74, 46, 88, 58, 96, 40, 68, 30, 60, 82, 44, 70, 28];

  return (
    <div className="flex items-center gap-3.5">
      <motion.button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause" : label}
        className="flex flex-none cursor-pointer items-center justify-center rounded-full border-0"
        style={{ width: 52, height: 52, background: skin.accent, color: skin.surface, fontSize: 15 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        animate={playing || reduced ? {} : { boxShadow: [`0 0 0 0 ${skin.accentSoft}`, `0 0 0 15px transparent`] }}
        transition={playing || reduced ? {} : { duration: 2.2, repeat: Infinity }}
      >
        {playing ? "❙❙" : "▶"}
      </motion.button>
      <div className="flex h-9 flex-1 items-end gap-[3px]" aria-hidden>
        {bars.map((h, i) => (
          <motion.span
            key={i}
            className="flex-1 rounded-full"
            style={{ background: playing ? skin.accent : skin.accentSoft }}
            animate={playing && !reduced ? { height: [`${h}%`, `${Math.max(14, 108 - h)}%`, `${h}%`] } : { height: `${h}%` }}
            transition={playing && !reduced ? { duration: 0.85, repeat: Infinity, ease: "easeInOut", delay: i * 0.035 } : { duration: 0.3 }}
          />
        ))}
      </div>
      {url && <audio ref={setEl} src={url} preload="none" className="sr-only" onEnded={() => setPlaying(false)} />}
    </div>
  );
}

/**
 * A place, drawn rather than fetched. No map tiles: an embedded map would need a
 * key, leak the recipient's IP to a third party and look nothing like the rest of
 * the experience. A hand-drawn pin on a compass rose says "this place mattered"
 * far better than a grey street grid.
 */
export function PlaceBlock({ block, skin }: { block: MemoryBlock; skin: BlockSkin }) {
  const reduced = useReducedMotion();
  const coords =
    block.lat || block.lng
      ? `${Math.abs(block.lat).toFixed(4)}° ${block.lat >= 0 ? "N" : "S"}, ${Math.abs(block.lng).toFixed(4)}° ${block.lng >= 0 ? "E" : "W"}`
      : "";

  return (
    <div className="flex flex-col items-center gap-3.5">
      <div className="relative" style={{ width: "min(180px, 48%)", aspectRatio: "1" }}>
        <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
          {/* compass rose */}
          <circle cx="50" cy="50" r="42" fill="none" stroke={skin.accentSoft} strokeWidth="1" />
          <circle cx="50" cy="50" r="31" fill="none" stroke={skin.accentSoft} strokeWidth="0.6" strokeDasharray="2 4" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line
              key={a}
              x1="50"
              y1="50"
              x2={50 + 42 * Math.cos((a - 90) * (Math.PI / 180))}
              y2={50 + 42 * Math.sin((a - 90) * (Math.PI / 180))}
              stroke={skin.accentSoft}
              strokeWidth={a % 90 === 0 ? 0.9 : 0.4}
            />
          ))}
          {/* the pin */}
          <motion.path
            d="M50 62 C 40 50, 40 40, 50 40 C 60 40, 60 50, 50 62 Z"
            fill={skin.accent}
            initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.2, 1.4, 0.4, 1], delay: 0.3 }}
          />
          <motion.circle
            cx="50"
            cy="47"
            r="3.4"
            fill={skin.surface}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          />
          {!reduced && (
            <motion.circle
              cx="50"
              cy="64"
              r="4"
              fill="none"
              stroke={skin.accent}
              strokeWidth="1"
              animate={{ r: [3, 14], opacity: [0.7, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, delay: 1 }}
            />
          )}
        </svg>
      </div>
      <div className="text-center">
        <div style={{ fontFamily: skin.display, fontSize: "clamp(19px,2.8vw,27px)", color: skin.ink, lineHeight: 1.2 }}>
          {block.place}
        </div>
        {coords && (
          <div className="mt-2" style={{ fontFamily: skin.mono, fontSize: 9.5, letterSpacing: ".18em", color: skin.inkSoft }}>
            {coords}
          </div>
        )}
        {block.body && (
          <p className="m-0 mx-auto mt-3 max-w-sm" style={{ fontFamily: skin.hand, fontSize: 18, lineHeight: 1.5, color: skin.inkSoft }}>
            {block.body}
          </p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

/**
 * Render one block.
 *
 * `writeOn` asks text and letter blocks to arrive a word at a time rather than
 * appearing at once — an experience that has just made someone work for this
 * usually wants the pacing; a grid of many blocks usually doesn't.
 */
export function MemoryBlockView({
  block,
  skin,
  writeOn = false,
  showLabel = false,
}: {
  block: MemoryBlock;
  skin: BlockSkin;
  writeOn?: boolean;
  showLabel?: boolean;
}) {
  const reduced = useReducedMotion();
  const wordCount = countWords(block.body);
  const written = useWriteCursor(wordCount, 175, writeOn && (block.kind === "letter" || block.kind === "text"), []);
  const ink: InkStyle = {
    family: skin.hand,
    size: 20,
    lineHeight: 1.75,
    tracking: "0",
    hex: skin.ink,
    wet: skin.accent,
  };

  const heading = (
    <>
      {showLabel && (
        <div style={{ fontFamily: skin.mono, fontSize: 9.5, letterSpacing: ".26em", textTransform: "uppercase", color: skin.accent }}>
          {BLOCK_LABELS[block.kind]}
        </div>
      )}
      {block.title && (
        <motion.h3
          className="m-0 mt-2.5"
          style={{ fontFamily: skin.display, fontSize: "clamp(21px,3.4vw,36px)", lineHeight: 1.14, color: skin.ink }}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 11 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.12 }}
        >
          {block.title}
        </motion.h3>
      )}
    </>
  );

  return (
    <div className="flex flex-col gap-5">
      {(showLabel || block.title) && <div className="text-center">{heading}</div>}

      {(block.kind === "text" || block.kind === "letter") &&
        (writeOn ? (
          <Handwritten text={block.body} ink={ink} seed={block.id} written={written} startAt={0} showNib className="flex flex-col gap-2.5" />
        ) : (
          <p
            className="m-0 whitespace-pre-line"
            style={{ fontFamily: skin.hand, fontSize: 19, lineHeight: 1.65, color: skin.ink }}
          >
            {block.body}
          </p>
        ))}

      {(block.kind === "photo" || block.kind === "artwork") && block.imageUrl && (
        <motion.figure
          className="m-0 mx-auto"
          style={{ width: "min(360px, 92%)" }}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9 }}
        >
          <span className="block overflow-hidden" style={{ background: skin.accentSoft, borderRadius: 2 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={block.imageUrl} alt={block.title || BLOCK_LABELS[block.kind]} className="block h-auto w-full" />
          </span>
          {(block.body || block.credit) && (
            <figcaption className="mt-2.5 text-center">
              {block.body && (
                <span className="block" style={{ fontFamily: skin.hand, fontSize: 17, color: skin.inkSoft }}>
                  {block.body}
                </span>
              )}
              {block.credit && (
                <span className="mt-1 block" style={{ fontFamily: skin.mono, fontSize: 9, letterSpacing: ".14em", color: skin.inkSoft }}>
                  {block.credit}
                </span>
              )}
            </figcaption>
          )}
        </motion.figure>
      )}

      {block.kind === "voice" && <AudioBlock url={block.audioUrl} skin={skin} label={block.title || "Play the message"} />}

      {block.kind === "video" && (
        <div className="mx-auto overflow-hidden" style={{ width: "min(540px, 96%)", background: "#000", borderRadius: 3 }}>
          {block.videoUrl ? (
            <video src={block.videoUrl} controls playsInline preload="metadata" className="block w-full" aria-label={block.title || "Video"} />
          ) : (
            <div className="flex items-center justify-center" style={{ aspectRatio: "16/9", color: skin.inkSoft, fontFamily: skin.body, fontSize: 13 }}>
              No video attached yet
            </div>
          )}
        </div>
      )}

      {block.kind === "song" && (
        <div className="flex flex-col items-center gap-4">
          <motion.div
            className="relative rounded-full"
            style={{
              width: "min(170px, 50%)",
              aspectRatio: "1",
              background: "repeating-radial-gradient(circle, #14121a 0 3px, #1d1a24 3px 6px)",
              boxShadow: "0 18px 36px -16px rgba(0,0,0,.75)",
            }}
            animate={reduced ? undefined : { rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ width: "34%", aspectRatio: "1", background: skin.accent }} />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ width: "6%", aspectRatio: "1", background: "#14121a" }} />
          </motion.div>
          <div className="text-center">
            <div style={{ fontFamily: skin.display, fontSize: 21, color: skin.ink }}>{block.body || "A song"}</div>
            {block.credit && (
              <div className="mt-1.5" style={{ fontFamily: skin.mono, fontSize: 9.5, letterSpacing: ".16em", textTransform: "uppercase", color: skin.inkSoft }}>
                {block.credit}
              </div>
            )}
          </div>
          {block.linkUrl && (
            <a
              href={block.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-5 py-2.5 no-underline"
              style={{ fontFamily: skin.mono, fontSize: 10.5, letterSpacing: ".16em", textTransform: "uppercase", background: skin.accent, color: skin.surface }}
            >
              Play it ↗
            </a>
          )}
        </div>
      )}

      {block.kind === "quote" && (
        <div className="text-center">
          <motion.span
            aria-hidden
            className="block leading-[0.7]"
            style={{ fontFamily: skin.display, fontSize: 58, color: skin.accentSoft }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            &ldquo;
          </motion.span>
          <motion.blockquote
            className="m-0 mx-auto max-w-xl"
            style={{ fontFamily: skin.display, fontSize: "clamp(20px,3.2vw,34px)", lineHeight: 1.3, color: skin.ink }}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 13, filter: "blur(7px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.4, delay: 0.2 }}
          >
            {block.body}
          </motion.blockquote>
          {block.credit && (
            <div className="mt-4" style={{ fontFamily: skin.mono, fontSize: 10.5, letterSpacing: ".2em", textTransform: "uppercase", color: skin.inkSoft }}>
              — {block.credit}
            </div>
          )}
        </div>
      )}

      {block.kind === "map" && <PlaceBlock block={block} skin={skin} />}

      {block.kind === "date" && (
        <div className="text-center">
          <motion.div
            style={{ fontFamily: skin.display, fontSize: "clamp(30px,6vw,64px)", lineHeight: 1, color: skin.accent, fontVariantNumeric: "tabular-nums" }}
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.2 }}
          >
            {block.when}
          </motion.div>
          {block.body && (
            <p className="m-0 mx-auto mt-4 max-w-sm" style={{ fontFamily: skin.hand, fontSize: 19, lineHeight: 1.5, color: skin.inkSoft }}>
              {block.body}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
