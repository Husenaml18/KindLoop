"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Faq } from "@/lib/faq";
import styles from "./chrome.module.css";

/**
 * The questions, opening and closing smoothly.
 *
 * Driven by state rather than `<details>`. `<details>` is the better element on
 * paper — free semantics, works without JavaScript, findable by the browser's own
 * in-page search — but it cannot animate its own height in any way that works
 * across browsers today: the modern `::details-content` transition is Chromium and
 * recent Safari only, and everything else snaps open. Since "smooth" is the
 * requirement, this uses a real height animation and puts the semantics back by
 * hand: a button, `aria-expanded`, `aria-controls`, and a labelled region.
 *
 * Only one is open at a time. With a list this long, several open at once turns
 * scanning into scrolling.
 */
export function FaqAccordion({
  items,
  idPrefix = "faq",
  /** What was typed in the search box, so the matched words can be marked. */
  query = "",
}: {
  items: Faq[];
  idPrefix?: string;
  query?: string;
}) {
  const reduced = useReducedMotion();
  /* Keyed by the question itself, not by position — filtering the list would
     otherwise leave a different question open than the one you clicked. */
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {items.map((item) => {
        const isOpen = open === item.q;
        const slug = item.q.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
        const panelId = `${idPrefix}-panel-${slug}`;
        const buttonId = `${idPrefix}-button-${slug}`;

        return (
          <div key={item.q} className={`${styles.faq} ${isOpen ? styles.faqOpen : ""}`}>
            <button
              type="button"
              id={buttonId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpen(isOpen ? null : item.q)}
              className={styles.faqQ}
            >
              <span>
                <Marked text={item.q} query={query} />
              </span>
              <span aria-hidden className={`${styles.faqMark} ${isOpen ? styles.faqMarkOpen : ""}`}>
                <svg width="13" height="8" viewBox="0 0 13 8" fill="none">
                  <path
                    d="M1.2 1.4 L6.5 6.6 L11.8 1.4"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="panel"
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  animate={reduced ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                  exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{
                    height: { duration: reduced ? 0 : 0.34, ease: [0.2, 0.8, 0.2, 1] },
                    /* The words fade a touch faster than the box moves, so the
                       text never appears to stretch. */
                    opacity: { duration: reduced ? 0.15 : 0.22, ease: "easeOut" },
                  }}
                  style={{ overflow: "hidden" }}
                >
                  <div className={styles.faqA}>{item.a}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

/**
 * The searched-for words, marked in the question.
 *
 * Only in the question, never in the answer: answers are written as JSX, and
 * walking into them to wrap matches would mean rebuilding somebody's markup from
 * the outside — a good way to lose an `<em>` or an entity.
 */
function Marked({ text, query }: { text: string; query: string }) {
  const needle = query.trim();
  if (needle.length < 2) return <>{text}</>;

  const parts = text.split(new RegExp(`(${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === needle.toLowerCase() ? (
          <mark key={i} className={styles.faqHit}>
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}
