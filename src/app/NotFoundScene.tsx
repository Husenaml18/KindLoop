"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { DustMotes, Sunbeam, Fireflies, Grain } from "@/lib/engines/scene/ambient";
import { useAmbientSound } from "@/lib/engines/sound";
import { FountainPenCursor } from "./FountainPenCursor";
import { SiteHeader } from "./SiteHeader";
import { SHELF_KEEPSAKES, Polaroid, WaxSeal, TinyStar } from "./MemoryObjects";
import { fraunces, spaceGrotesk, ibmPlexMono, gochiHand } from "./fonts";
import theme from "./theme.module.css";
import styles from "./notfound.module.css";

/**
 * The page for a memory that wandered off.
 *
 * Nothing here says "error", because nothing here is one from where the visitor is
 * standing: they followed a link to something they expected to find, and it isn't
 * there. The honest reading of that is loss, not failure, so the page is built as a
 * desk at the end of an afternoon, with the envelope open and empty.
 *
 * The whole page is one object: the 0 in "404" *is* the envelope, and opening it is
 * the only thing to do here. An envelope in the numeral and a second one below it
 * was the same idea told twice, and the second telling made the first decorative.
 *
 * The one hard rule: it must be quicker to leave here than to arrive. Three ways
 * out sit above the fold, and the shelf below is eight more — every one an
 * experience that exists and opens immediately.
 */

/* Fairy lights strung across the scene, below the header rather than through it.
   Fixed positions: the string should hang the same way on every visit. */
const LIGHTS = [4, 12, 21, 29, 38, 47, 55, 64, 72, 81, 89, 96];

export function NotFoundScene({ signedIn, account }: { signedIn: boolean; account: React.ReactNode }) {
  const reduced = useReducedMotion();
  const sound = useAmbientSound({ notesEvery: 6400, gain: 0.12 });
  const [opened, setOpened] = useState(false);

  const open = () => {
    setOpened((o) => !o);
    sound.play("paper");
    sound.note();
  };

  return (
    <div
      className={`${theme.themeRoot} ${styles.scene} ${fraunces.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable} ${gochiHand.variable}`}
    >
      <FountainPenCursor />

      {/* ---------- the room ---------- */}
      <div aria-hidden className={styles.air}>
        <Sunbeam color="rgba(255,226,160,.3)" angle={-16} width="40%" from="6%" />
        <Sunbeam color="rgba(255,214,150,.2)" angle={13} width="30%" from="62%" />
        <DustMotes count={26} />
        <Fireflies count={7} color="#ffe2a0" seed="lost" />
        <Grain opacity={0.05} />
      </div>

      <SiteHeader signedIn={signedIn} account={account} />

      {/* The string hangs under the bar, not across it — run through the header it
          read as a stray rule rather than as something in the room. */}
      <div aria-hidden className={styles.lights}>
        <svg viewBox="0 0 100 12" preserveAspectRatio="none" className={styles.lightsWire}>
          <path d="M0 1.5 Q 25 10, 50 6.5 T 100 2" stroke="rgba(90,64,34,.28)" strokeWidth=".26" fill="none" />
        </svg>
        {LIGHTS.map((left, i) => (
          <motion.span
            key={left}
            className={styles.bulb}
            style={{ left: `${left}%`, top: `${(9 + Math.sin(i * 0.9) * 14 + i * 0.5).toFixed(2)}px` }}
            animate={reduced ? undefined : { opacity: [0.5, 1, 0.62], scale: [1, 1.14, 1] }}
            transition={{ duration: 3.2 + (i % 5) * 0.7, repeat: Infinity, ease: "easeInOut", delay: i * 0.28 }}
          />
        ))}
      </div>

      {/* ---------- the story ---------- */}
      <main className={styles.stage}>
        <Numerals opened={opened} onOpen={open} />

        <motion.p
          className={styles.whisper}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Oh no… this memory wandered somewhere else.
        </motion.p>

        <AnimatePresence initial={false}>
          {opened && (
            <motion.div
              className={styles.unfolded}
              initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0, y: -10 }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, height: "auto", y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0, y: -10 }}
              transition={{ duration: reduced ? 0.2 : 0.6, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <div className={styles.unfoldedInner}>
                <p className={styles.unfoldedLine}>
                  I guess this page became someone else&apos;s memory.
                </p>
                <p className={styles.unfoldedHeart} aria-hidden>
                  ❤️
                </p>
                <p className={styles.unfoldedAsk}>
                  While you&apos;re here, would you like to create a new one?
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.h1
          className={styles.headline}
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
        >
          This memory couldn&apos;t be found.
        </motion.h1>

        <motion.p
          className={styles.sub}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          Sometimes memories wander.
          <br />
          Let&apos;s help you discover another one.
        </motion.p>

        <motion.div
          className={styles.ctas}
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.62 }}
        >
          <Link href="/" className={`${styles.cta} ${styles.ctaPrimary}`}>
            <HouseMark />
            Return home
          </Link>
          <Link href="/templates" className={`${styles.cta} ${styles.ctaSecondary}`}>
            <SparkMark />
            Explore experiences
          </Link>
          <Link href="/templates" className={styles.ctaQuiet}>
            <GiftMark />
            Create a new memory
          </Link>
        </motion.div>
      </main>

      {/* ---------- the shelf, instead of a footer ---------- */}
      <Shelf />

      {/* ---------- sound ---------- */}
      {sound.supported && (
        <button type="button" onClick={sound.toggle} className={styles.soundToggle} aria-pressed={sound.on}>
          <span className={`${styles.soundDot} ${sound.on ? styles.soundDotOn : ""}`} aria-hidden />
          {sound.on ? "Sound on" : "Sound off"}
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Marks                                                               */
/* ------------------------------------------------------------------ */

/*
 * Drawn, not emoji.
 *
 * A 🏠 beside hand-cut paper is somebody else's illustration in somebody else's
 * style, drawn differently by every operating system — three in a row were the
 * loudest thing on a page built out of quiet.
 */
function HouseMark() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M2 7.2 L8 2.2 L14 7.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.6 8.4 V13.4 H12.4 V8.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.6 13.4 V10 H9.4 V13.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SparkMark() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 1.6 L9.3 6.2 L13.9 7.5 L9.3 8.8 L8 13.4 L6.7 8.8 L2.1 7.5 L6.7 6.2 Z" fill="currentColor" />
    </svg>
  );
}

function GiftMark() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M2.4 7.4 H13.6 V13.4 H2.4 Z" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" />
      <path d="M1.6 4.9 H14.4 V7.4 H1.6 Z" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" />
      <path d="M8 4.9 V13.4" stroke="currentColor" strokeWidth="1.35" />
      <path d="M8 4.9 C 5.6 4.9, 4.4 1.6, 6.4 1.6 C 7.8 1.6, 8 3.6, 8 4.9 Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
      <path d="M8 4.9 C 10.4 4.9, 11.6 1.6, 9.6 1.6 C 8.2 1.6, 8 3.6, 8 4.9 Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* 404, built out of the things it lost                                */
/* ------------------------------------------------------------------ */

/**
 * The numerals are made, not typed.
 *
 * Each 4 is three strips of paper laid at angles — photographs on the left, a
 * written letter on the right — and the 0 is the envelope itself, which is also the
 * only thing on the page you can touch. A hundred-and-eighty point Helvetica "404"
 * is the most generic object on the internet; this had to be the one thing here
 * that could only have come from Kindloop.
 */
function Numerals({ opened, onOpen }: { opened: boolean; onOpen: () => void }) {
  const reduced = useReducedMotion();
  const rise = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 26, rotate: -4 },
          animate: { opacity: 1, y: 0, rotate: 0 },
          transition: { duration: 0.9, delay, ease: [0.2, 0.8, 0.2, 1] as const },
        };

  return (
    <div className={styles.numerals}>
      {/* The shape is made of paper, so the number itself has to be said out loud
          for anything that cannot see it. */}
      <span className="sr-only">Error 404. </span>

      <motion.div className={styles.digit} {...rise(0)} aria-hidden>
        <FourOfPolaroids />
      </motion.div>

      <motion.div className={styles.digit} {...rise(0.12)}>
        <ZeroEnvelope opened={opened} onOpen={onOpen} />
      </motion.div>

      <motion.div className={styles.digit} {...rise(0.24)} aria-hidden>
        <FourOfLetters />
      </motion.div>
    </div>
  );
}

/** The diagonal, the stem and the crossbar — each one a photograph. */
function FourOfPolaroids() {
  /* Each stroke is a polaroid: a white frame, a picture in it, and the wide margin
     along the bottom that makes the shape unmistakable even when it is doing duty
     as part of a numeral. */
  const strip = (cls: string, tilt: number, hue: number) => (
    <span className={`${styles.stroke} ${cls}`}>
      <span className={styles.paperFace} style={{ transform: `rotate(${tilt}deg)` }}>
        <span
          className={styles.photoInset}
          style={{
            /* All three sit in one sunset range. A wider hue sweep read as a colour
               chart rather than as photographs of the same afternoon. */
            background: `linear-gradient(158deg, hsl(${38 + hue} 66% 82%), hsl(${24 + hue} 54% 66%) 50%, hsl(${14 + hue} 38% 48%))`,
          }}
        />
      </span>
    </span>
  );

  return (
    <div className={styles.four}>
      {strip(styles.fourDiagonal, -1.5, 0)}
      {strip(styles.fourBar, 0.8, 8)}
      {strip(styles.fourStem, -1, -6)}
      <span className={styles.pin} style={{ left: "-34%", top: "-6%" }}>
        <Polaroid />
      </span>
    </div>
  );
}

/**
 * The 0: the envelope, and the only thing here you can open.
 *
 * Sealed at rest. Clicking breaks the wax, the flap swings up behind it, and the
 * note that stayed behind rises out of the pocket. The flap is a flat rotation with
 * a fixed z-index rather than a 3D fold: `rotateX` inside a perspective sorts ahead
 * of the note at some viewport widths and behind it at others, and paint order
 * never changes its mind.
 */
function ZeroEnvelope({ opened, onOpen }: { opened: boolean; onOpen: () => void }) {
  const reduced = useReducedMotion();

  return (
    <div className={styles.zeroWrap}>
      <button
        type="button"
        onClick={onOpen}
        className={styles.zero}
        aria-expanded={opened}
        aria-label={opened ? "Fold the note back into the envelope" : "Open the envelope"}
      >
        {/* the flap: folded down over the pocket, or standing up behind it */}
        <motion.span
          className={styles.zeroFlap}
          animate={{ rotate: opened ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 110, damping: 15 }}
        />

        <span className={styles.zeroBack} />

        {/* the note that stayed behind */}
        <motion.span
          className={styles.zeroNote}
          animate={{ y: opened ? "-46%" : "2%" }}
          transition={{ type: "spring", stiffness: 150, damping: 20, delay: opened ? 0.16 : 0 }}
        >
          <span className={styles.zeroNoteLines} aria-hidden />
        </motion.span>

        <span className={styles.zeroFront} />

        {/* the seal, which drops away once it has been broken */}
        <motion.span
          className={styles.zeroSeal}
          animate={
            opened
              ? { opacity: 0, y: 30, rotate: -24, scale: 0.9 }
              : reduced
                ? { opacity: 1, y: 0, rotate: 0, scale: 1 }
                : { opacity: 1, y: 0, rotate: [-2, 2, -2], scale: 1 }
          }
          transition={
            opened
              ? { duration: 0.45, ease: "easeIn" }
              : { rotate: { duration: 7, repeat: Infinity, ease: "easeInOut" } }
          }
        >
          <WaxSeal size={54} />
        </motion.span>
      </button>

      <span className={styles.hint} aria-hidden>
        {opened ? "there was a note inside" : "click to open"}
      </span>
    </div>
  );
}

/** The same shape again, written on stationery. */
function FourOfLetters() {
  return (
    <div className={styles.four}>
      <span className={`${styles.stroke} ${styles.fourDiagonal}`}>
        <span className={`${styles.paperFace} ${styles.ruled}`} style={{ transform: "rotate(1.2deg)" }} />
      </span>
      <span className={`${styles.stroke} ${styles.fourBar}`}>
        <span className={`${styles.paperFace} ${styles.ruled}`} style={{ transform: "rotate(-.9deg)" }} />
      </span>
      <span className={`${styles.stroke} ${styles.fourStem}`}>
        <span className={`${styles.paperFace} ${styles.ruled}`} style={{ transform: "rotate(1deg)" }} />
      </span>
      <span className={styles.scribble} aria-hidden>
        love, always
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The shelf                                                           */
/* ------------------------------------------------------------------ */

function Shelf() {
  const reduced = useReducedMotion();

  return (
    <section className={styles.shelfSection} aria-labelledby="lost-memories">
      <div className={styles.shelfHead}>
        <span className={styles.shelfLabel}>Lost memories</span>
        <h2 id="lost-memories" className={styles.shelfTitle}>
          Things other people left behind.
        </h2>
        <p className={styles.shelfSub}>Pick one up. They all still open.</p>
      </div>

      <div className={styles.shelfWrap}>
        <ul className={styles.shelf}>
          {SHELF_KEEPSAKES.map((item, i) => (
            <li key={item.id} className={styles.shelfItem}>
              <Link href={item.href} className={styles.keepsake}>
                {/* The experience it opens, on a paper tag above the object.
                    Underneath, it was rust ink on dark wood and unreadable. */}
                <span className={styles.keepsakeNote}>{item.note}</span>
                <motion.span
                  className={styles.keepsakeArt}
                  animate={reduced ? undefined : { y: [0, -3.5, 0], rotate: [0, i % 2 ? 1.4 : -1.4, 0] }}
                  transition={{ duration: 5 + (i % 4), repeat: Infinity, ease: "easeInOut", delay: i * 0.35 }}
                  whileHover={reduced ? undefined : { y: -12, scale: 1.06 }}
                >
                  {item.render()}
                </motion.span>
                <span className={styles.keepsakeLabel}>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <p className={styles.shelfFoot}>
        <TinyStar size={12} />
        <span>Kindloop — small gestures, kept.</span>
        <TinyStar size={12} />
      </p>
    </section>
  );
}
