"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ComponentType } from "react";

/**
 * Wraps any template's real recipient experience with the two things a demo
 * needs and a real gift must never have: an honest "this is a sample" marker,
 * and a way to go build your own.
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
  const [dismissed, setDismissed] = useState(false);

  return (
    /* Scrolls rather than clipping: several experiences are taller than one
       viewport, and a demo that hides its own second half is worse than no demo.
       The marker and the CTA are fixed so they stay put while it scrolls. */
    <div className="relative min-h-[100dvh] w-full">
      <View content={content} />

      {/* sample marker */}
      <AnimatePresence>
        {!dismissed && (
          <motion.div
            className="pointer-events-auto fixed left-1/2 top-5 z-[60] -translate-x-1/2"
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div
              className="flex items-center gap-3 rounded-full px-4 py-2"
              style={{
                background: "rgba(10,8,6,.72)",
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
              <span className="text-[11.5px]" style={{ color: "rgba(244,238,227,.72)" }}>
                Yours will hold your own memories
              </span>
              <button
                type="button"
                onClick={() => setDismissed(true)}
                aria-label="Hide the sample notice"
                className="cursor-pointer border-0 bg-transparent px-1 text-[13px] leading-none"
                style={{ color: "rgba(244,238,227,.5)" }}
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* always-available way out of the demo and into the editor */}
      <motion.div
        className="fixed bottom-6 right-5 z-[60] flex flex-col items-end gap-2"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.6 }}
      >
        <Link
          href={createHref}
          className="rounded-full px-6 py-3.5 text-[12.5px] tracking-[0.12em] uppercase no-underline transition-transform hover:scale-[1.04]"
          style={{
            fontFamily: "var(--font-ibm-plex-mono), monospace",
            background: "#e8b26a",
            color: "#0a0806",
            boxShadow: "0 16px 34px -14px rgba(232,178,106,.6)",
          }}
        >
          Make your own {templateName} →
        </Link>
        <Link
          href="/templates"
          className="px-2 text-[10.5px] tracking-[0.16em] uppercase no-underline"
          style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", color: "rgba(244,238,227,.5)" }}
        >
          See other experiences
        </Link>
      </motion.div>
    </div>
  );
}
