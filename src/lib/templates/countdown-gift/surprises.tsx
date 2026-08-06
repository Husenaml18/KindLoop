"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ScratchFoil } from "@/lib/engines/gift/ScratchFoil";
import { Handwritten, countWords, useWriteCursor, type InkStyle } from "../love-letter/ink";
import { GIFT_LABELS, type CountdownDay, type IllustrationId } from "./schema";
import { BODY_FONT, HAND_FONT, MONO_FONT, NUMERAL_FONT, type Skin } from "./theme";

/* ------------------------------------------------------------------ */
/* Small line illustrations — drawn, so no assets are needed           */
/* ------------------------------------------------------------------ */

function LineArt({ id, color }: { id: IllustrationId; color: string }) {
  const reduced = useReducedMotion();
  const paths: Record<IllustrationId, string> = {
    star: "M50 12 L58 38 L86 40 L64 58 L71 86 L50 70 L29 86 L36 58 L14 40 L42 38 Z",
    moon: "M62 14 A38 38 0 1 0 62 86 A30 30 0 1 1 62 14 Z",
    sprig: "M50 92 L50 22 M50 40 C 36 34, 30 22, 32 14 M50 40 C 64 34, 70 22, 68 14 M50 62 C 38 57, 33 47, 35 40 M50 62 C 62 57, 67 47, 65 40",
    heart: "M50 84 C 14 58, 16 22, 34 22 C 43 22, 50 32, 50 36 C 50 32, 57 22, 66 22 C 84 22, 86 58, 50 84 Z",
    bird: "M14 62 C 32 50, 44 34, 56 20 C 60 34, 74 40, 88 38 C 74 52, 52 70, 26 74 Z",
    mountain: "M8 80 L34 36 L50 58 L64 30 L92 80 Z M34 36 L42 47",
  };
  const filled = id === "star" || id === "heart" || id === "moon" || id === "bird";

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
      <motion.path
        d={paths[id]}
        fill={filled ? `${color}33` : "none"}
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2.2, ease: "easeInOut", delay: 0.3 }}
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* The day that has to be earned — the Gift Engine's foil, in gilt      */
/* ------------------------------------------------------------------ */

function ScratchCard({ prize, skin }: { prize: string; skin: Skin }) {
  return (
    <div style={{ color: skin.inkSoft }}>
      <ScratchFoil foil={skin.gold} foilSheen={skin.goldSoft} label={prize}>
        <span style={{ fontFamily: HAND_FONT, fontSize: "clamp(17px,2.4vw,25px)", color: skin.ink, lineHeight: 1.35 }}>
          {prize}
        </span>
      </ScratchFoil>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function AudioSeal({ url, skin, label }: { url: string; skin: Skin; label: string }) {
  const [playing, setPlaying] = useState(false);
  const [el, setEl] = useState<HTMLAudioElement | null>(null);
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

  return (
    <div className="flex items-center gap-3.5">
      <motion.button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause" : label}
        className="flex flex-none cursor-pointer items-center justify-center rounded-full border-0"
        style={{ width: 54, height: 54, background: skin.gold, color: "#20180a", fontSize: 16 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        animate={playing || reduced ? {} : { boxShadow: [`0 0 0 0 ${skin.glow}88`, `0 0 0 16px ${skin.glow}00`] }}
        transition={playing || reduced ? {} : { duration: 2.2, repeat: Infinity }}
      >
        {playing ? "❙❙" : "▶"}
      </motion.button>
      <div className="flex h-9 flex-1 items-end gap-[3px]" aria-hidden>
        {[26, 52, 34, 74, 46, 88, 58, 96, 40, 68, 30, 60, 82, 44, 70, 28].map((h, i) => (
          <motion.span
            key={i}
            className="flex-1 rounded-full"
            style={{ background: playing ? skin.gold : skin.goldSoft }}
            animate={playing && !reduced ? { height: [`${h}%`, `${Math.max(14, 108 - h)}%`, `${h}%`] } : { height: `${h}%` }}
            transition={playing && !reduced ? { duration: 0.85, repeat: Infinity, ease: "easeInOut", delay: i * 0.035 } : { duration: 0.3 }}
          />
        ))}
      </div>
      {url && <audio ref={setEl} src={url} preload="none" className="sr-only" onEnded={() => setPlaying(false)} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* What's behind the door                                              */
/* ------------------------------------------------------------------ */

export function Surprise({ day, skin, dayNumber }: { day: CountdownDay; skin: Skin; dayNumber: number }) {
  const reduced = useReducedMotion();

  /* Letters write themselves on, reusing the letter template's ink engine. */
  const total = countWords(day.text);
  const written = useWriteCursor(total, 170, day.kind === "letter" || day.kind === "memory", []);
  const ink: InkStyle = {
    family: HAND_FONT,
    size: 20,
    lineHeight: 1.75,
    tracking: "0",
    hex: skin.ink,
    wet: skin.glow,
  };

  const body = (
    <>
      {day.kind === "photo" && day.imageUrl && (
        <motion.div
          className="mx-auto"
          style={{ width: "min(340px, 88%)", padding: "4% 4% 12%", background: "#fdf8ec", boxShadow: "0 22px 44px -20px rgba(0,0,0,.7)" }}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14, rotate: -2 }}
          animate={{ opacity: 1, y: 0, rotate: -2 }}
          transition={{ duration: 0.9 }}
          whileHover={reduced ? undefined : { rotate: 0, scale: 1.03 }}
        >
          <span className="block overflow-hidden" style={{ aspectRatio: "1", background: "#ddd4c2" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={day.imageUrl} alt={day.title || `Day ${dayNumber}`} className="h-full w-full object-cover" />
          </span>
          {day.text && (
            <span className="mt-[5%] block text-center" style={{ fontFamily: HAND_FONT, fontSize: 16, color: "#3a3026" }}>
              {day.text}
            </span>
          )}
        </motion.div>
      )}

      {(day.kind === "letter" || day.kind === "memory") && (
        <Handwritten text={day.text} ink={ink} seed={day.id} written={written} startAt={0} showNib className="flex flex-col gap-3" />
      )}

      {day.kind === "quote" && (
        <div className="text-center">
          <motion.span
            aria-hidden
            className="block leading-[0.7]"
            style={{ fontFamily: NUMERAL_FONT, fontSize: 62, color: `${skin.gold}55` }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1 }}
          >
            &ldquo;
          </motion.span>
          <motion.blockquote
            className="m-0 mx-auto max-w-xl"
            style={{ fontFamily: NUMERAL_FONT, fontSize: "clamp(21px,3.2vw,36px)", lineHeight: 1.28, color: skin.ink }}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14, filter: "blur(7px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.5, delay: 0.25 }}
          >
            {day.text}
          </motion.blockquote>
          {day.attribution && (
            <div className="mt-4" style={{ fontFamily: MONO_FONT, fontSize: 10.5, letterSpacing: ".2em", textTransform: "uppercase", color: skin.inkSoft }}>
              — {day.attribution}
            </div>
          )}
        </div>
      )}

      {day.kind === "video" && (
        <div className="mx-auto overflow-hidden rounded-[4px]" style={{ width: "min(520px, 94%)", background: "#000", boxShadow: "0 24px 48px -22px rgba(0,0,0,.8)" }}>
          {day.videoUrl ? (
            <video src={day.videoUrl} controls playsInline preload="metadata" className="block h-full w-full" aria-label={day.title || "Video"} />
          ) : (
            <div className="flex items-center justify-center" style={{ aspectRatio: "16/9", color: skin.inkSoft, fontFamily: BODY_FONT, fontSize: 13 }}>
              No video attached yet
            </div>
          )}
        </div>
      )}

      {day.kind === "voice" && <AudioSeal url={day.audioUrl} skin={skin} label="Play the voice note" />}

      {day.kind === "song" && (
        <div className="flex flex-col items-center gap-4">
          <motion.div
            className="relative rounded-full"
            style={{
              width: "min(190px, 54%)",
              aspectRatio: "1",
              background: `repeating-radial-gradient(circle, #14121a 0 3px, #1d1a24 3px 6px)`,
              boxShadow: "0 20px 40px -18px rgba(0,0,0,.8)",
            }}
            animate={reduced ? undefined : { rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ width: "34%", aspectRatio: "1", background: skin.gold }} />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ width: "6%", aspectRatio: "1", background: "#14121a" }} />
          </motion.div>
          <div className="text-center">
            <div style={{ fontFamily: NUMERAL_FONT, fontSize: 21, color: skin.ink }}>{day.text || "A song for today"}</div>
            {day.songArtist && <div style={{ fontFamily: MONO_FONT, fontSize: 10.5, letterSpacing: ".16em", textTransform: "uppercase", color: skin.inkSoft, marginTop: 6 }}>{day.songArtist}</div>}
          </div>
          {day.songUrl && (
            <a
              href={day.songUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-5 py-2.5 no-underline"
              style={{ fontFamily: MONO_FONT, fontSize: 10.5, letterSpacing: ".16em", textTransform: "uppercase", background: skin.gold, color: "#20180a" }}
            >
              Play it ↗
            </a>
          )}
        </div>
      )}

      {day.kind === "game" && <ScratchCard prize={day.scratchPrize || day.text || "You found it."} skin={skin} />}

      {day.kind === "illustration" && (
        <div className="flex flex-col items-center gap-4">
          <div style={{ width: "min(180px, 46%)" }}>
            <LineArt id={day.illustration} color={skin.gold} />
          </div>
          {day.text && (
            <p className="m-0 max-w-md text-center" style={{ fontFamily: HAND_FONT, fontSize: 19, lineHeight: 1.5, color: skin.ink }}>
              {day.text}
            </p>
          )}
        </div>
      )}

      {day.kind === "coupon" && (
        <motion.div
          className="relative mx-auto overflow-hidden"
          style={{
            width: "min(420px, 94%)",
            background: `linear-gradient(158deg, ${skin.gold}, ${skin.goldSoft})`,
            borderRadius: 4,
            boxShadow: "0 22px 44px -20px rgba(0,0,0,.7)",
          }}
          initial={reduced ? { opacity: 0 } : { opacity: 0, rotate: -2, y: 14 }}
          animate={{ opacity: 1, rotate: -1.5, y: 0 }}
          transition={{ duration: 0.9 }}
        >
          <div className="px-7 py-7 text-center">
            <div style={{ fontFamily: MONO_FONT, fontSize: 9.5, letterSpacing: ".26em", textTransform: "uppercase", color: "rgba(32,24,10,.7)" }}>
              redeemable, indefinitely
            </div>
            <div className="my-3" style={{ borderTop: "1.5px dashed rgba(32,24,10,.35)" }} />
            <div style={{ fontFamily: NUMERAL_FONT, fontSize: "clamp(19px,2.8vw,28px)", lineHeight: 1.25, color: "#20180a" }}>
              {day.text || "One favour, no questions asked"}
            </div>
            {day.couponTerms && (
              <div className="mt-3" style={{ fontFamily: MONO_FONT, fontSize: 9, letterSpacing: ".1em", color: "rgba(32,24,10,.6)" }}>
                {day.couponTerms}
              </div>
            )}
          </div>
          <span aria-hidden className="absolute rounded-full" style={{ left: "-3%", top: "50%", width: "7%", aspectRatio: "1", transform: "translateY(-50%)", background: "rgba(0,0,0,.5)" }} />
          <span aria-hidden className="absolute rounded-full" style={{ right: "-3%", top: "50%", width: "7%", aspectRatio: "1", transform: "translateY(-50%)", background: "rgba(0,0,0,.5)" }} />
        </motion.div>
      )}
    </>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <div style={{ fontFamily: MONO_FONT, fontSize: 9.5, letterSpacing: ".26em", textTransform: "uppercase", color: skin.gold }}>
          Day {dayNumber} · {GIFT_LABELS[day.kind]}
        </div>
        {day.title && (
          <motion.h3
            className="m-0 mt-3"
            style={{ fontFamily: NUMERAL_FONT, fontSize: "clamp(23px,3.6vw,40px)", lineHeight: 1.12, color: skin.ink }}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.15 }}
          >
            {day.title}
          </motion.h3>
        )}
      </div>
      {body}
    </div>
  );
}

/** A tiny card of one day, used in the finale montage. */
export function MontageCard({ day, index, skin }: { day: CountdownDay; index: number; skin: Skin }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="relative overflow-hidden rounded-[4px]"
      style={{ background: "rgba(255,255,255,.05)", border: `1px solid ${skin.goldSoft}`, aspectRatio: "3 / 4" }}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, rotate: index % 2 ? 2 : -2, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, rotate: index % 2 ? 1.4 : -1.4, scale: 1 }}
      transition={{ duration: 0.85, delay: 0.4 + index * 0.11, ease: [0.2, 0.8, 0.2, 1] }}
      whileHover={reduced ? undefined : { rotate: 0, scale: 1.05, zIndex: 5 }}
    >
      {day.imageUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={day.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center" style={{ fontSize: 26, color: skin.gold }}>
          {GIFT_LABELS[day.kind].charAt(0)}
        </span>
      )}
      <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,.8), transparent 58%)" }} />
      <span
        className="absolute inset-x-2 bottom-2 block"
        style={{ fontFamily: MONO_FONT, fontSize: 8.5, letterSpacing: ".14em", color: skin.ink, opacity: 0.9 }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>
    </motion.div>
  );
}
