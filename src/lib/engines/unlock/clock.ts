"use client";

import { useEffect, useState } from "react";

/**
 * The current time, or 0 until it has been read.
 *
 * Two rules are baked in, both learned the hard way:
 *
 * 1. Never read the clock during render. The server and the client would
 *    disagree about which gates are open and React would flag the mismatch.
 *    Callers treat 0 as "not known yet" and render the shut state.
 * 2. Never set state synchronously inside the effect either — that cascades a
 *    second render before paint, which React's lint rules reject. The first
 *    reading is scheduled instead, one tick later.
 */
export function useClock(intervalMs = 1000): number {
  const [now, setNow] = useState(0);

  useEffect(() => {
    const first = setTimeout(() => setNow(Date.now()), 0);
    const tick = setInterval(() => setNow(Date.now()), intervalMs);
    return () => {
      clearTimeout(first);
      clearInterval(tick);
    };
  }, [intervalMs]);

  return now;
}

/**
 * A one-shot reading, for anything that only needs today's date (an editor
 * showing how much of a calendar is currently open, say) and shouldn't hold a
 * timer open for the life of the page.
 */
export function useToday(): number {
  return useClock(60_000);
}
