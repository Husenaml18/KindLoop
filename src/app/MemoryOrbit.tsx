"use client";

import Link from "next/link";
import { Wordmark } from "./Wordmark";
import styles from "./orbit.module.css";

/**
 * The ring of photographs.
 *
 * A band with the claim on the left and, on the right, a circle of moments turning
 * slowly around a sealed envelope. The rotation is one CSS animation on the ring
 * and an equal-and-opposite one on each photograph, so the ring turns while the
 * pictures stay the right way up. No JavaScript runs per frame and nothing is
 * measured — it survives any width and costs nothing.
 *
 * What it says matters as much as what it does. The obvious version of this
 * section is a headcount — "N people are using Kindloop" — and Kindloop has not
 * launched, so that number would be invented. The honest claim is the opposite
 * one, and a better one: every single thing here is made for exactly one person.
 * The ring is full of moments, not users.
 */

const RING = 12;
/** Both animations must agree, so the number lives here and in the stylesheet. */
const TURN_SECONDS = 54;

export function MemoryOrbit({ photos }: { photos: string[] }) {
  /* Deterministic, so the server and the browser lay the ring out identically. */
  const seats = Array.from({ length: RING }, (_, i) => {
    const angle = (360 / RING) * i;
    /* Alternating depth: the ones "further round" sit smaller and softer, which is
       what stops a perfect circle of identical discs reading as a loading spinner. */
    const back = i % 3 === 1;
    return {
      i,
      angle,
      size: back ? 0.74 : i % 4 === 2 ? 1.12 : 1,
      dim: back,
      url: photos.length > 0 ? photos[(i + 4) % photos.length] : undefined,
    };
  });

  return (
    <section id="everyone" className={styles.band}>
      <div className={styles.inner}>
        {/* ---------- the claim ---------- */}
        <div data-reveal="1" className={styles.words}>
          <p className={styles.label}>Who they&apos;re for</p>
          <h2 className={styles.title}>
            Everything here is made for exactly one person.
          </h2>
          <p className={styles.body}>
            Not an audience, not a following, not a feed. One link, one person, and
            nothing in it for anybody else — which is why there is no way to browse
            what other people have made, including for us.
          </p>
          <div className={styles.actions}>
            <Link href="/templates" className={`${styles.cta} ${styles.ctaPrimary}`}>
              Choose an experience
              <span aria-hidden>→</span>
            </Link>
            <Link href="/#how" className={`${styles.cta} ${styles.ctaGhost}`}>
              See how it works
            </Link>
          </div>
        </div>

        {/* ---------- the ring ---------- */}
        <div data-reveal="1" className={styles.stage} aria-hidden>
          <span className={styles.halo} />

          <div className={styles.ring}>
            {seats.map((s) => (
              <span
                key={s.i}
                className={styles.seat}
                style={{ transform: `rotate(${s.angle}deg) translateY(calc(var(--radius) * -1))` }}
              >
                <span
                  className={`${styles.photo} ${s.dim ? styles.photoBack : ""}`}
                  style={{
                    width: `calc(var(--face) * ${s.size})`,
                    height: `calc(var(--face) * ${s.size})`,
                    backgroundImage: s.url ? `url(${s.url})` : undefined,
                    /*
                     * Two jobs, one property.
                     *
                     * The photograph has to cancel both the ring's turn and its own
                     * seat's angle. The counter-animation handles the turn; the seat
                     * angle becomes a *negative delay*, which starts the same
                     * animation partway through at exactly the offset needed. The
                     * static `rotate` is what remains when the animation is off for
                     * reduced motion — without it the pictures would sit fixed at
                     * twelve different tilts.
                     */
                    rotate: `${-s.angle}deg`,
                    animationDelay: `${-(s.angle / 360) * TURN_SECONDS}s`,
                  }}
                />
              </span>
            ))}
          </div>

          {/* The centre: the mark itself, pressed into the paper. A letter "K"
              stood in while the disc was being drawn; the actual logo is the thing
              every one of those photographs is circling. */}
          <span className={styles.core}>
            <span className={styles.coreDots} />
            <span className={styles.coreSeal}>
              <Wordmark size={44} markOnly />
            </span>
          </span>
        </div>
      </div>
    </section>
  );
}
