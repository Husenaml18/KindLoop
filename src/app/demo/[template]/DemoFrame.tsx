"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import type { ComponentType } from "react";

/**
 * Wraps any template's real recipient experience with the two things a demo
 * needs and a real gift must never have: an honest "this is a sample" marker,
 * and a way to go build your own.
 *
 * All of it lives in one bar at the top, and that is the whole point of this
 * file's layout. The demo chrome used to sit at `bottom-right`, which is the
 * corner seven of the templates put their own controls in — the ambience toggle,
 * the sound button, the teddy, the restart. The two overlapped on almost every
 * demo, with the experience's own control buried under a marketing button.
 *
 * The top strip is the one zone nothing else claims, because it is already
 * occupied by this same bar. One piece of furniture, in a place the experiences
 * have already agreed to leave alone.
 */
export function DemoFrame({
  View,
  content,
  templateName,
  createHref,
}: {
  View: ComponentType<{ content: unknown; embedded?: boolean }>;
  content: unknown;
  templateName: string;
  createHref: string;
}) {
  /* Collapses the explanation, never the way out — see below. */
  const [compact, setCompact] = useState(false);

  return (
    /* Scrolls rather than clipping: several experiences are taller than one
       viewport, and a demo that hides its own second half is worse than no demo.
       The bar is fixed so it stays put while it scrolls. */
    <div className="relative min-h-[100dvh] w-full">
      <View content={content} />

      <motion.div
        className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4"
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div
          className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-full py-2 pl-4 pr-2"
          style={{
            background: "rgba(10,8,6,.74)",
            border: "1px solid rgba(244,238,227,.18)",
            backdropFilter: "blur(12px)",
          }}
        >
          <span
            className="text-[9.5px] tracking-[0.2em] uppercase"
            style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", color: "#e8b26a" }}
          >
            Sample story
          </span>

          {/*
           * Hidden on a phone whatever the state, and hidden everywhere once
           * collapsed. It is the least important thing here and the widest.
           */}
          {!compact && (
            <span className="hidden text-[11.5px] sm:inline" style={{ color: "rgba(244,238,227,.72)" }}>
              Yours will hold your own memories
            </span>
          )}

          <span aria-hidden className="hidden h-4 w-px sm:block" style={{ background: "rgba(244,238,227,.18)" }} />

          {/*
           * The way out, and it survives every state.
           *
           * Dismissing used to remove the notice while the buttons lived
           * elsewhere; folding them together means "×" must not be able to take
           * the exit with it. It collapses the sentence, nothing more.
           */}
          <Link
            href={createHref}
            className="rounded-full px-4 py-2 text-[11px] tracking-[0.12em] uppercase no-underline transition-transform hover:scale-[1.03]"
            style={{
              fontFamily: "var(--font-ibm-plex-mono), monospace",
              background: "#e8b26a",
              color: "#0a0806",
              whiteSpace: "nowrap",
            }}
          >
            {/* The full name on a wide screen, something that fits on a narrow one. */}
            <span className="hidden md:inline">Make your own {templateName} →</span>
            <span className="md:hidden">Make your own →</span>
          </Link>

          <Link
            href="/templates"
            className="hidden px-1 text-[10.5px] tracking-[0.16em] uppercase no-underline sm:inline"
            style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", color: "rgba(244,238,227,.55)", whiteSpace: "nowrap" }}
          >
            See others
          </Link>

          {!compact && (
            <button
              type="button"
              onClick={() => setCompact(true)}
              aria-label="Shrink the sample notice"
              className="cursor-pointer border-0 bg-transparent px-1.5 text-[13px] leading-none"
              style={{ color: "rgba(244,238,227,.5)" }}
            >
              ×
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
