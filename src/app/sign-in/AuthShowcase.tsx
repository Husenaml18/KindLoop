"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { TEMPLATE_CATALOG } from "@/lib/templateCatalog";
import { templateImage } from "@/lib/templateImages";
import styles from "./auth.module.css";

/**
 * The window beside the form.
 *
 * A sign-in screen is a toll gate: nobody wants to be on it, and every second
 * spent there is spent not doing the thing they came for. The least a toll gate
 * can do is show you what is on the other side — so the right-hand half of the
 * screen is the product, one finished experience at a time, with the artwork you
 * would actually get and a way to look at it without signing in at all.
 *
 * That last part matters. The demo link is not a leak in the wall; it is the point.
 * Nothing here is behind the login except *making* something, and a page that
 * pretends otherwise is asking for an email it has not yet earned.
 */

const SLIDE_MS = 6500;

export function AuthShowcase() {
  const reduced = useReducedMotion();
  /* Only finished experiences, and only ones with their own artwork — a stock
     photograph in this frame would be advertising something we didn't draw. */
  const slides = TEMPLATE_CATALOG.filter(
    (t) => t.status === "available" && templateImage(t.id)
  );

  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dir, setDir] = useState(1);

  const go = useCallback(
    (step: number) => {
      setDir(step);
      setI((n) => (n + step + slides.length) % slides.length);
    },
    [slides.length]
  );

  /* Advances on its own until somebody takes over, and never while the pointer is
     resting on it — a picture that changes under a cursor reads as a misclick. */
  useEffect(() => {
    if (paused || reduced || slides.length < 2) return;
    const t = window.setInterval(() => {
      setDir(1);
      setI((n) => (n + 1) % slides.length);
    }, SLIDE_MS);
    return () => window.clearInterval(t);
  }, [paused, reduced, slides.length]);

  if (slides.length === 0) return null;
  const slide = slides[i];
  const art = templateImage(slide.id);

  return (
    <div
      className={styles.showcase}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <AnimatePresence initial={false} custom={dir} mode="popLayout">
        <motion.div
          key={slide.id}
          className={styles.frame}
          custom={dir}
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.04, x: dir * 26 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, x: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.99, x: dir * -18 }}
          transition={{ duration: reduced ? 0.2 : 0.62, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {art && (
            <Image
              src={art}
              alt={`${slide.name} — ${slide.blurb}`}
              fill
              /* One image, half a screen wide at most, and it is the only picture
                 on the page. */
              sizes="(max-width: 900px) 0px, 50vw"
              placeholder="blur"
              priority={i === 0}
              style={{ objectFit: "cover" }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* the caption, sitting on the picture the way a label sits on a print */}
      <div className={styles.caption}>
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={slide.id}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: reduced ? 0.15 : 0.34, ease: "easeOut" }}
          >
            <p className={styles.captionName}>{slide.name}</p>
            <p className={styles.captionBlurb}>{slide.blurb}</p>

            <div className={styles.captionMeta}>
              <span className={styles.metaItem}>
                <Dot />
                {slide.price ?? "Free"}
              </span>
              <span className={styles.metaItem}>{slide.estimate} to make</span>
              {slide.demo && (
                <Link href={`/demo/${slide.id}`} className={styles.metaLink}>
                  Open it now
                  <span aria-hidden>↗</span>
                </Link>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className={styles.arrows}>
          <button type="button" onClick={() => go(-1)} className={styles.arrow} aria-label="Previous experience">
            <Chevron dir="left" />
          </button>
          <button type="button" onClick={() => go(1)} className={styles.arrow} aria-label="Next experience">
            <Chevron dir="right" />
          </button>
        </div>
      </div>

      {/* Which of them you are on, and a way to jump. Kept to hairlines: it is a
          position indicator, not a control anybody came here to use. */}
      <div className={styles.ticks} role="tablist" aria-label="Experiences">
        {slides.map((s, n) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={n === i}
            aria-label={s.name}
            className={`${styles.tick} ${n === i ? styles.tickOn : ""}`}
            onClick={() => {
              setDir(n > i ? 1 : -1);
              setI(n);
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d={dir === "left" ? "M9 2 L4 7 L9 12" : "M5 2 L10 7 L5 12"}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Dot() {
  return <span aria-hidden className={styles.metaDot} />;
}
