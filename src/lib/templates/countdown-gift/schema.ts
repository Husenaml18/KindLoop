import { z } from "zod";
import {
  dayUnlockAt,
  encouragementFor,
  openedByDay,
  remainingUntil,
  type Remaining,
} from "@/lib/engines/unlock";
import { DOOR_STYLE_IDS, SKIN_IDS } from "./theme";

/** What's behind a door. */
export const GIFT_KINDS = [
  "photo",
  "letter",
  "voice",
  "quote",
  "video",
  "song",
  "game",
  "memory",
  "illustration",
  "coupon",
] as const;
export type GiftKind = (typeof GIFT_KINDS)[number];

export const GIFT_LABELS: Record<GiftKind, string> = {
  photo: "Photo",
  letter: "Letter",
  voice: "Voice note",
  quote: "Quote",
  video: "Video",
  song: "Song",
  game: "Scratch card",
  memory: "Memory",
  illustration: "Illustration",
  coupon: "Coupon",
};

export const GIFT_GLYPHS: Record<GiftKind, string> = {
  photo: "📷",
  letter: "✉",
  voice: "🎙",
  quote: "❝",
  video: "▶",
  song: "♪",
  game: "🪙",
  memory: "✦",
  illustration: "✎",
  coupon: "🎟",
};

/** Small line drawings the illustration day can use — no assets needed. */
export const ILLUSTRATIONS = ["star", "moon", "sprig", "heart", "bird", "mountain"] as const;
export type IllustrationId = (typeof ILLUSTRATIONS)[number];

export const daySchema = z.object({
  id: z.string().min(1),
  kind: z.enum(GIFT_KINDS).default("photo"),
  /** Shown once opened. */
  title: z.string().max(120).default(""),
  text: z.string().max(2000).default(""),

  imageUrl: z.string().max(600).default(""),
  audioUrl: z.string().max(600).default(""),
  videoUrl: z.string().max(600).default(""),
  /** Song days link out rather than pretending to host music. */
  songUrl: z.string().max(600).default(""),
  songArtist: z.string().max(120).default(""),

  attribution: z.string().max(120).default(""),
  illustration: z.enum(ILLUSTRATIONS).default("star"),

  /** Coupon days: the thing being promised, and any small print. */
  couponTerms: z.string().max(200).default(""),

  /** Scratch-card days hide their message until it's been scratched off. */
  scratchPrize: z.string().max(300).default(""),

  openAt: z.string().max(40).default(""),
});

export type CountdownDay = z.infer<typeof daySchema>;

export const countdownContentSchema = z.object({
  skin: z.enum(SKIN_IDS).default("midnight"),
  doorStyle: z.enum(DOOR_STYLE_IDS).default("envelope"),

  title: z.string().max(100).default(""),
  dedication: z.string().max(200).default(""),
  /** What they're counting toward. */
  occasion: z.string().max(100).default(""),

  /**
   * Day 1 unlocks at the start of this date; day N at start of date + (N-1).
   * Stored as a local `YYYY-MM-DD` or datetime string.
   */
  startDate: z.string().max(40).default(""),

  /** Optional bed that starts when a door opens. */
  musicUrl: z.string().max(600).default(""),

  days: z.array(daySchema).max(31).default([]),

  finaleTitle: z.string().max(160).default(""),
  finaleNote: z.string().max(400).default(""),
});

export type CountdownContent = z.infer<typeof countdownContentSchema>;

export function makeDay(id: string, kind: GiftKind = "photo"): CountdownDay {
  return daySchema.parse({ id, kind });
}

/* ------------------------------------------------------------------ */
/* The calendar's arithmetic — the Unlock Engine does the work          */
/* ------------------------------------------------------------------ */


export function unlockAt(content: CountdownContent, index: number): number {
  const own = content.days[index]?.openAt?.trim();
  if (own) {
    const t = new Date(own).getTime();
    if (!Number.isNaN(t)) return t;
  }
  return dayUnlockAt(content.startDate, index);
}

export function openStates(content: CountdownContent, now: number): boolean[] {
  const hasCalendar = content.startDate.trim().length > 0;
  return content.days.map((day, i) => {
    const own = day.openAt?.trim();
    if (own) {
      const t = new Date(own).getTime();
      if (!Number.isNaN(t)) return now >= t;
    }
    if (!hasCalendar) return true;
    return now >= dayUnlockAt(content.startDate, i);
  });
}

/** How many are open. Kept for the copy that counts them. */
export function openedCount(content: CountdownContent, now: number): number {
  if (content.days.some((d) => d.openAt?.trim())) {
    return openStates(content, now).filter(Boolean).length;
  }
  return openedByDay(content.startDate, content.days.length, now);
}

export { remainingUntil, type Remaining };

export const encouragement = encouragementFor;

export const emptyCountdownContent: CountdownContent = countdownContentSchema.parse({
  skin: "midnight",
  doorStyle: "envelope",
  title: "Counting down",
  occasion: "the day itself",
  dedication: "One a day. No peeking.",
  days: [
    {
      id: "d-1",
      kind: "letter",
      title: "Day one",
      text: "I made you something that takes a while.\nThat's on purpose.",
    },
  ],
  finaleTitle: "You waited. Here's all of it at once.",
  finaleNote: "Every door you opened, together in one place.",
});

export const CD_FALLBACKS = {
  title: "Counting down",
  dedication: "One a day. No peeking.",
  finaleTitle: "You waited. Here's all of it at once.",
  finaleNote: "Every door you opened, together in one place.",
} as const;
