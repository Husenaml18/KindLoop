"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { StaticImageData } from "next/image";
import styles from "./demoRoom.module.css";

/**
 * The demo room.
 *
 * Two things it refuses to do, both of which the reference layout invites.
 *
 * Every numbered stop is an experience that actually opens. The reference puts
 * "Try Demo →" under seven things, several of which do not exist yet — that is
 * the one promise this page cannot break, since its whole job is letting somebody
 * see the real thing before committing an evening to it. Anything unfinished is
 * named further down, without a link, under a heading that says so.
 *
 * And "surprise me" opens a real experience rather than a carousel of the same
 * cards restated. A second gallery of what is already on the page is furniture;
 * a button that picks one for you is the thing somebody stuck at the top of a
 * list of nine actually wants.
 */

export interface DemoStop {
  id: string;
  name: string;
  blurb: string;
  interaction: string;
  href: string;
  art?: StaticImageData;
}

/* Fixed positions, so the room looks the same on every visit. */
const BULBS = [6, 18, 31, 44, 57, 70, 83, 94];
const EMBERS = Array.from({ length: 16 }, (_, i) => ({
  left: (i * 61) % 100,
  size: 2 + (i % 3),
  delay: (i % 7) * 1.3,
  dur: 11 + (i % 5) * 2.4,
}));

export function DemoRoom({
  stops,
  soon,
  pinned,
}: {
  stops: DemoStop[];
  soon: string[];
  /** Three pieces of artwork for the polaroids round the door. */
  pinned: StaticImageData[];
}) {
  const router = useRouter();
  const reduced = useReducedMotion();

  /* Random on purpose, and only ever from what exists. */
  const surprise = useCallback(() => {
    if (stops.length === 0) return;
    const pick = stops[Math.floor(Math.random() * stops.length)];
    router.push(pick.href);
  }, [stops, router]);

  return (
    <>
      {/* ---------- the room's air ---------- */}
      {!reduced && (
        <div aria-hidden className={styles.embers}>
          {EMBERS.map((e, i) => (
            <motion.span
              key={i}
              className={styles.ember}
              style={{ left: `${e.left}%`, bottom: -10, width: e.size, height: e.size }}
              animate={{ y: [0, -680], opacity: [0, 0.7, 0], x: [0, i % 2 ? 30 : -30] }}
              transition={{ duration: e.dur, repeat: Infinity, delay: e.delay, ease: "linear" }}
            />
          ))}
        </div>
      )}

      {/* ---------- hero ---------- */}
      <section className={styles.hero}>
        <div>
          <p className={`m-0 ${styles.eyebrow}`}>Demo room ✦</p>
          <h1 className={styles.heroTitle}>
            Try the <em>whole thing</em> before you make one.
          </h1>
          <p className={styles.heroBody}>
            Each of these is the real experience, filled in with somebody else&apos;s
            memories. No account, nothing to install — exactly what the person you
            send one to would open.
          </p>
          <p className={`m-0 ${styles.heroHand}`}>Open a few. See which one feels like yours ♡</p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button type="button" onClick={surprise} className={styles.primary}>
              Surprise me
              <span aria-hidden>✦</span>
            </button>
            <Link href="/templates" className={styles.ghost}>
              Browse all experiences
            </Link>
          </div>
        </div>

        <div className={styles.doorWrap}>
          <span aria-hidden className={styles.doorGlow} />

          <motion.div
            className={styles.door}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 22, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div className={styles.doorInner}>
              <div className={styles.doorSign}>
                memories
                <br />
                start here ♡
              </div>
            </div>

            <div aria-hidden className={styles.doorLights}>
              {BULBS.map((left, i) => (
                <motion.span
                  key={left}
                  className={styles.doorBulb}
                  style={{ left: `${left}%`, top: `${(14 + Math.sin(i * 1.1) * 9).toFixed(1)}%` }}
                  animate={reduced ? undefined : { opacity: [0.55, 1, 0.6] }}
                  transition={{ duration: 2.8 + (i % 4) * 0.7, repeat: Infinity, delay: i * 0.24 }}
                />
              ))}
            </div>
          </motion.div>

          {/* photographs pinned round the frame */}
          {pinned.slice(0, 3).map((art, i) => (
            <motion.div
              key={i}
              aria-hidden
              className={styles.pinned}
              style={{
                left: i === 2 ? "auto" : `${2 + i * 6}%`,
                right: i === 2 ? "6%" : "auto",
                top: `${[18, 54, 68][i]}%`,
                rotate: `${[-7, 5, 8][i]}deg`,
              }}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 + i * 0.16 }}
            >
              <Image src={art} alt="" className={styles.pinnedShot} sizes="120px" />
            </motion.div>
          ))}

          <motion.div
            className={styles.note}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -18, rotate: 8 }}
            animate={{ opacity: 1, y: 0, rotate: 4 }}
            transition={{ duration: 0.9, delay: 0.8 }}
          >
            <span aria-hidden className={styles.noteTape} />
            Psst — these are somebody else&apos;s memories. Yours will hold your
            own, and only the person you send it to ever sees them. ♡
          </motion.div>
        </div>
      </section>

      {/* ---------- the stops ---------- */}
      <div className={styles.pathHead}>
        <h2 className={styles.pathTitle}>Pick one. Any one.</h2>
        <span aria-hidden className={styles.pathRule} />
      </div>

      <div className={styles.path}>
        {stops.map((s, i) => (
          <motion.div
            key={s.id}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
            className={i % 2 === 0 ? styles.stopLeft : styles.stopRight}
          >
            <Link href={s.href} className={styles.stop}>
              <div className={styles.stopArt}>
                {s.art && (
                  <Image
                    src={s.art}
                    alt=""
                    fill
                    sizes="(max-width: 900px) 92vw, 260px"
                    style={{ objectFit: "cover" }}
                  />
                )}
              </div>
              <div>
                <span className={styles.stopNo}>{String(i + 1).padStart(2, "0")}</span>
                <h3 className={styles.stopName}>{s.name}</h3>
                <p className={styles.stopBlurb}>{s.blurb}</p>
                <p className={styles.stopBlurb} style={{ opacity: 0.72, fontSize: 13 }}>
                  {s.interaction}
                </p>
                <span className={styles.stopGo}>
                  Try it <span aria-hidden>→</span>
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* ---------- what is still being made ---------- */}
      {soon.length > 0 && (
        <div className={styles.soon}>
          <p className={styles.soonTitle}>More rooms being built…</p>
          <div className={styles.soonList}>
            {soon.map((name) => (
              <span key={name} className={styles.soonChip}>
                {name}
              </span>
            ))}
          </div>
          <p className="m-0 mt-3" style={{ fontSize: 12, color: "var(--ink-faint)" }}>
            No demo yet, because there is nothing to show you yet.
          </p>
        </div>
      )}

      {/* ---------- the way out ---------- */}
      <section className={styles.closer}>
        <div>
          <h2 className={styles.closerTitle}>Seen one you&apos;d send?</h2>
          <p className={styles.closerBody}>
            Making one is the same thing, with your photographs in it instead. Most
            take about twenty minutes.
          </p>
          <Link href="/templates" className={styles.primary}>
            Make your own
            <span aria-hidden>→</span>
          </Link>
        </div>

        <div className={styles.closerPoints}>
          {[
            { mark: <HeartMark />, title: "Entirely yours", body: "Your words, your photographs, your voice." },
            { mark: <LockMark />, title: "Private by default", body: "One link, for one person. Nothing is listed." },
            { mark: <ClockMark />, title: "Ready in minutes", body: "Made in an evening, kept for years." },
          ].map((p) => (
            <div key={p.title}>
              <span style={{ color: "var(--rust)" }}>{p.mark}</span>
              <p className={styles.pointTitle}>{p.title}</p>
              <p className={styles.pointBody}>{p.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

/* Drawn, not emoji — the same reasoning as everywhere else in the product. */
const strokes = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.3,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function HeartMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 18 18" {...strokes} aria-hidden>
      <path d="M9 15C3.6 11.2 2 8.5 3.6 6.2 5 4.2 7.6 4.7 9 7c1.4-2.3 4-2.8 5.4-.8C16 8.5 14.4 11.2 9 15Z" />
    </svg>
  );
}
function LockMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 18 18" {...strokes} aria-hidden>
      <path d="M5.5 8.5V6a3.5 3.5 0 0 1 7 0v2.5" />
      <rect x="3.6" y="8.5" width="10.8" height="7.4" rx="1.6" />
    </svg>
  );
}
function ClockMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 18 18" {...strokes} aria-hidden>
      <circle cx="9" cy="9.4" r="6" />
      <path d="M9 6v3.4l2.4 1.5" />
    </svg>
  );
}
