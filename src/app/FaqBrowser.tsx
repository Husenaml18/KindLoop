"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { FAQ_GROUPS, faqHaystack, type Faq, type FaqGroup } from "@/lib/faq";
import { FaqAccordion } from "./FaqAccordion";
import styles from "./chrome.module.css";

/**
 * Search and filters over the whole list.
 *
 * With sixteen questions in five groups, jump-links to headings were making people
 * scroll past four sections to reach the one they wanted. A box you can type into
 * answers the actual question — *is the thing I'm worried about in here* — in one
 * move, and the filters are there for browsing rather than looking.
 *
 * Both narrow the same single list rather than switching between views, so
 * whatever is on screen is always the honest answer to what you asked for,
 * including when that answer is nothing.
 */
export function FaqBrowser({ items }: { items: Faq[] }) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<FaqGroup | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Ctrl/Cmd+K puts the cursor in the box. Advertised on the control itself, so
     it has to actually work — a shortcut hint that does nothing is worse than no
     hint. `preventDefault` keeps Firefox from stealing it for its own search bar. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* Built once. Walking sixteen JSX answers on every keystroke is wasteful, and
     it is the sort of wasteful that only shows up on a slow phone. */
  const haystacks = useMemo(() => new Map(items.map((f) => [f.q, faqHaystack(f)])), [items]);

  const needle = query.trim().toLowerCase();
  const shown = items.filter((f) => {
    if (group && f.group !== group) return false;
    if (!needle) return true;
    return (haystacks.get(f.q) ?? "").includes(needle);
  });

  /* Groups with nothing in them are not offered — a filter that can only lead to
     an empty page is a dead end with a label on it. */
  const available = FAQ_GROUPS.filter((g) =>
    items.some((f) => f.group === g && (!needle || (haystacks.get(f.q) ?? "").includes(needle)))
  );

  return (
    <div>
      {/* ---------- search + filters ---------- */}
      <div className={styles.faqBand} style={{ padding: "26px 0 24px" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div
            className={styles.faqSearch}
            onKeyDown={(e) => {
              if (e.key === "Escape") setQuery("");
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden style={{ flex: "0 0 auto" }}>
              <circle cx="7" cy="7" r="4.6" stroke="var(--ink-faint)" strokeWidth="1.5" />
              <path d="M10.6 10.6 L14 14" stroke="var(--ink-faint)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              type="search"
              className={styles.faqSearchInput}
              placeholder="Search something…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search the questions"
            />
            <span className={styles.faqKbd} aria-hidden>
              CTRL<span style={{ opacity: 0.5 }}>+</span>K
            </span>
          </div>
        </div>

        <div
          style={{
            /* Same column as the box above it, so the two read as one control. */
            maxWidth: 560,
            margin: "18px auto 0",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-ibm-plex-mono), monospace",
              fontSize: 9.5,
              letterSpacing: ".16em",
              textTransform: "uppercase",
              color: "var(--label-on-paper)",
            }}
          >
            Filter by
          </span>
          <div className={styles.faqChips}>
            <button
              type="button"
              onClick={() => setGroup(null)}
              aria-pressed={group === null}
              className={`${styles.faqChip} ${group === null ? styles.faqChipOn : ""}`}
            >
              All
            </button>
            {available.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGroup(group === g ? null : g)}
                aria-pressed={group === g}
                className={`${styles.faqChip} ${group === g ? styles.faqChipOn : ""}`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ---------- the list ---------- */}
      <div style={{ padding: "30px 0 8px" }}>
        {shown.length > 0 ? (
          <FaqAccordion items={shown} idPrefix="faq" query={query} />
        ) : (
          <div style={{ padding: "44px 0 30px", textAlign: "center" }}>
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-gochi), cursive",
                fontSize: 23,
                color: "var(--ink)",
              }}
            >
              Nothing here about that.
            </p>
            <p style={{ margin: "10px auto 0", maxWidth: 380, fontSize: 14.5, lineHeight: 1.65 }}>
              Which is worth knowing on its own — write and ask, and the answer
              usually ends up on this page.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-block rounded-full px-6 py-3 no-underline"
              style={{ background: "var(--brass)", color: "var(--on-dark)", fontSize: 14, fontWeight: 500 }}
            >
              Ask us
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
