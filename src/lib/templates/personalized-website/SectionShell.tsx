"use client";

import type { ReactNode } from "react";

/**
 * The box one experience lives in when it is a section of a website.
 *
 * `contain: paint` is doing the load-bearing work here, and it is worth knowing
 * why, because it is what makes this whole feature possible without editing a
 * single experience.
 *
 * Six of the ten use `position: fixed` for their opened-item overlays — the
 * letter that fills the screen in Open When, the piece you tap in Memory Puzzle,
 * the door in Countdown Gift. Fixed normally resolves against the viewport, so
 * inside a scrolling page each of those would cover the *entire website*,
 * including the sections above and below it.
 *
 * A `transform`, `filter`, `perspective` or `contain` on an ancestor makes that
 * ancestor the containing block for fixed descendants instead. Measured, rather
 * than taken on faith:
 *
 *     plain wrapper            overlay 1200x800   host 400x300   escaped
 *     transform: translateZ(0) overlay  400x300   host 400x300   contained
 *     contain: paint           overlay  400x300   host 400x300   contained
 *
 * `contain: paint` is preferred over a transform because it says what it means
 * and does not create a compositing layer per section — ten of those on one page
 * is a lot of memory for a hint.
 *
 * The other half of the contract is `embedded`, which every experience already
 * accepts and honours: it asks the view to fill its container rather than the
 * viewport. That prop was built for editor previews long before websites existed;
 * it happens to be exactly the section/page distinction this needs.
 */
export function SectionShell({
  children,
  /** Sections are full-bleed by default — each experience owns its atmosphere. */
  inset = false,
}: {
  children: ReactNode;
  inset?: boolean;
}) {
  return (
    <section
      style={{
        position: "relative",
        /* The containing block. See above. */
        contain: "paint",
        /*
         * A grid, purely so the experience inside stretches to fill it.
         *
         * This is not cosmetic. Embedded, every view sizes itself `height: 100%`,
         * and a percentage height against a parent that only has `min-height`
         * resolves to auto — so each one collapsed to its content and the shell's
         * floor showed through underneath as a band of the website's own
         * background. Measured at a 800px viewport, before and after:
         *
         *     memoryverse   shell 736  child   0  →  736px of dead ground
         *     love letter   shell 736  child 425  →  311px
         *     memory puzzle shell 736  child 644  →   92px
         *
         * A single-cell grid stretches the child to the row instead, and the row
         * is max(floor, content) — so nothing is padded and nothing is clipped.
         */
        display: "grid",
        /*
         * Tall enough to read as a place, short enough that several fit in one
         * scroll. Experiences that need more grow past it; experiences that need
         * less now fill it with their own atmosphere rather than the website's.
         */
        minHeight: "min(720px, 88vh)",
        ...(inset ? { borderRadius: 18, overflow: "hidden", margin: "0 auto", maxWidth: 1200 } : null),
      }}
    >
      {children}
    </section>
  );
}
