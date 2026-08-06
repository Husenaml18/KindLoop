"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { TEMPLATE_CATALOG } from "@/lib/templateCatalog";
import styles from "./chipTable.module.css";

/**
 * The experiences, loose on a table.
 *
 * This card used to be three lanes of the same names scrolling past on a loop. A
 * marquee is the wrong object for this claim: it moves on its own schedule, it
 * repeats itself, and you cannot look at any one thing for longer than it decides.
 * The claim being made here is that each of these is a distinct, handmade object —
 * so they are laid out as a handful of tags tipped onto a table, and you can pick
 * them up.
 *
 * The heading says what a reader gets, not how we test for it. It used to read
 * "side by side, with the titles removed, they look like different products",
 * which is the bar *we* hold a new experience to before it ships — a fine rule and
 * a terrible sentence to hand a stranger, who has no titles to remove and is not
 * comparing products.
 *
 * Drag one and it stays where you drop it. Nothing snaps back, nothing resets on
 * its own, and there is no correct arrangement. That is the whole point: it is a
 * pile of things, not a carousel of them.
 *
 * No emoji. A row of system emoji renders differently on every platform, and next
 * to hand-set type in a hand-made palette it is the loudest thing in the frame —
 * the names are what matter, and they are what you came to read.
 */
export function ChipTable() {
  const reduced = useReducedMotion();
  const tableRef = useRef<HTMLDivElement>(null);
  /* Bumping this remounts the chips, which returns them to their layout position.
     Framer holds the drag offset on the element, so there is nothing to reset. */
  const [arrangement, setArrangement] = useState(0);
  const [moved, setMoved] = useState(false);

  const live = TEMPLATE_CATALOG.filter((t) => t.status === "available");

  return (
    <div className={styles.table}>
      <span aria-hidden className={styles.weave} />

      <div className={styles.head}>
        <div className={styles.label}>One at a time</div>
        <p className={styles.claim}>No two of these open the same way.</p>
        <p className={styles.sub}>
          Different paper, different pacing, a different way in. One is a letter
          that writes itself; one has to be dug up clue by clue.
        </p>
        <p className={styles.aside}>Push them around — they stay where you put them.</p>
      </div>

      <div ref={tableRef} className={styles.field}>
        {live.map((t, i) => (
          <motion.span
            key={`${arrangement}-${t.id}`}
            className={styles.chip}
            /* Laid down by hand rather than in a grid: a tidy row of tags reads as
               a list of features, and a slight tilt reads as objects. */
            style={{ rotate: TILTS[i % TILTS.length] }}
            /* Draggable even under reduced motion. That setting is about motion
               people did not ask for; taking a chip away from somebody who is
               deliberately pulling it is removing a feature, not sparing them one.
               The springy flourishes below are what get dropped instead. */
            drag
            dragConstraints={tableRef}
            dragElastic={0.14}
            dragMomentum={false}
            onDragEnd={() => setMoved(true)}
            whileHover={reduced ? undefined : { y: -4, scale: 1.04, rotate: 0 }}
            whileTap={reduced ? undefined : { scale: 1.07 }}
            whileDrag={{ scale: 1.09, zIndex: 5, cursor: "grabbing" }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
          >
            {t.name}
          </motion.span>
        ))}
      </div>

      {/* Only offered once there is something to undo. */}
      {moved && (
        <button
          type="button"
          className={styles.tidy}
          onClick={() => {
            setArrangement((n) => n + 1);
            setMoved(false);
          }}
        >
          Tidy them up
        </button>
      )}
    </div>
  );
}

/* Fixed tilts, cycled. Deterministic, so the server and the browser agree on where
   everything is lying before anybody touches it. */
const TILTS = [-2.4, 1.6, -0.8, 2.2, -1.7, 0.9, -2.9, 1.2, -1.1];
