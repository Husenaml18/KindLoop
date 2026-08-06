/**
 * Unlock Engine.
 *
 * Everything in Kindloop that refuses to open yet. Dates, countdowns, moods,
 * passwords, progress thresholds — one place, because the *feeling* of being
 * refused has to be identical everywhere: never a rejection, always a promise.
 *
 * A gate answers three questions: is it open, when does it open, and what does
 * it say while it waits. Experiences supply their own wording for the third.
 */

export const GATE_KINDS = ["now", "date", "countdown", "password", "mood", "progress"] as const;
export type GateKind = (typeof GATE_KINDS)[number];

export interface Remaining {
  days: number;
  hours: number;
  mins: number;
  secs: number;
  /** Milliseconds left. Zero means it's time. */
  total: number;
}

export function remainingUntil(target: number, now: number): Remaining {
  const total = Math.max(0, target - now);
  return {
    days: Math.floor(total / 86_400_000),
    hours: Math.floor((total / 3_600_000) % 24),
    mins: Math.floor((total / 60_000) % 60),
    secs: Math.floor((total / 1000) % 60),
    total,
  };
}

/** Midnight, local time, of whatever day a `YYYY-MM-DD` (or datetime) falls on. */
export function startOfDay(value: string): number {
  const d = value ? new Date(value) : new Date(NaN);
  if (Number.isNaN(d.getTime())) return NaN;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/**
 * How many items in a daily sequence are open. Nothing can be skipped: item `i`
 * needs its own midnight to have passed. An unset or unparseable start date
 * means there is no waiting at all — everything is open.
 */
export function openedByDay(startDate: string, count: number, now: number): number {
  const base = startOfDay(startDate);
  if (Number.isNaN(base)) return count;
  if (now < base) return 0;
  return Math.min(count, Math.floor((now - base) / 86_400_000) + 1);
}

/** When item `index` in a daily sequence becomes openable. */
export function dayUnlockAt(startDate: string, index: number): number {
  const base = startOfDay(startDate);
  if (Number.isNaN(base)) return 0;
  return base + index * 86_400_000;
}

/** Whole days from now until `target`, rounded up — what a person would say. */
export function daysAway(target: number, now: number): number {
  if (!target || !now) return 0;
  return Math.max(0, Math.ceil((target - now) / 86_400_000));
}

/**
 * What a gate says while it waits. Deliberately warmer the closer it gets: the
 * whole premise is that waiting is part of the gift, so this must never read as
 * a refusal.
 */
export function encouragementFor(away: number): string {
  if (away <= 0) return "Any moment now.";
  if (away === 1) return "Tomorrow. Almost there.";
  if (away === 2) return "Two more sleeps ❤️";
  if (away === 3) return "Three more days ❤️";
  if (away <= 6) return `${away} more days — worth the wait.`;
  return "The best surprise is worth waiting for.";
}

/** Case- and punctuation-insensitive, because a password shouldn't be a trap. */
export function passwordMatches(answer: string, expected: string): boolean {
  const norm = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
  const want = norm(expected);
  return want.length > 0 && norm(answer) === want;
}

export interface GateResult {
  open: boolean;
  /** Timestamp it opens at, if it's a clock-based gate. */
  at?: number;
  /** What to show while it's shut. */
  message: string;
}

/**
 * Resolve a gate. `now` of 0 means the clock hasn't been read yet (first render
 * on the server) — clock-based gates report shut rather than guessing, so the
 * server and the client always agree.
 */
export function resolveGate(
  gate:
    | { kind: "now" }
    | { kind: "date" | "countdown"; at: number }
    | { kind: "password"; expected: string; answered: string }
    | { kind: "mood"; chosen: boolean }
    | { kind: "progress"; done: number; needed: number },
  now: number
): GateResult {
  switch (gate.kind) {
    case "now":
      return { open: true, message: "" };
    case "date":
    case "countdown": {
      if (!gate.at) return { open: true, message: "" };
      if (!now) return { open: false, at: gate.at, message: "" };
      const away = daysAway(gate.at, now);
      return { open: now >= gate.at, at: gate.at, message: encouragementFor(away) };
    }
    case "password":
      return {
        open: passwordMatches(gate.answered, gate.expected),
        message: "Not quite. Try again — you know this one.",
      };
    case "mood":
      return { open: gate.chosen, message: "Tell me how you're feeling first." };
    case "progress": {
      const left = Math.max(0, gate.needed - gate.done);
      return {
        open: left === 0,
        message: left === 1 ? "One more piece." : `${left} more pieces.`,
      };
    }
  }
}
