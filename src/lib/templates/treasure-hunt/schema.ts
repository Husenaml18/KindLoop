import { z } from "zod";
import { memoryBlockSchema, makeBlock } from "@/lib/engines/memory-block/schema";
import { passwordMatches } from "@/lib/engines/unlock";
import { JOURNEY_IDS, MAP_STYLE_IDS, PIN_IDS } from "./theme";

/**
 * Treasure Hunt — content.
 *
 * A route of stops. Each stop has a *clue* (the thing they do) and a *reward* (the
 * memory they get for it), and the reward is pinned to a journey board that fills
 * up as they go. The last stop opens the chest.
 *
 * The governing rule, from the brief and enforced throughout: nobody may ever get
 * stuck. Every clue that can be answered wrongly accepts a forgiving match, offers
 * a nudge, and eventually offers to simply let them through. This is an adventure
 * somebody planned for them, not an exam.
 */

export const CLUE_KINDS = [
  "photo",
  "voice",
  "letter",
  "puzzle",
  "location",
  "video",
  "riddle",
  "drawer",
  "combination",
  "candles",
  "constellation",
  "key",
] as const;
export type ClueKind = (typeof CLUE_KINDS)[number];

export const CLUE_LABELS: Record<ClueKind, string> = {
  photo: "Find the memory",
  voice: "Listen carefully",
  letter: "Read the letter",
  puzzle: "Mini puzzle",
  location: "Choose the place",
  video: "Video hint",
  riddle: "Riddle",
  drawer: "Secret drawer",
  combination: "Combination lock",
  candles: "Light the candles",
  constellation: "Connect the stars",
  key: "Hidden key",
};

export const CLUE_GLYPHS: Record<ClueKind, string> = {
  photo: "📸",
  voice: "🎵",
  letter: "💌",
  puzzle: "🧩",
  location: "📍",
  video: "🎬",
  riddle: "🎲",
  drawer: "🎁",
  combination: "🔑",
  candles: "🕯",
  constellation: "🌌",
  key: "🗝",
};

export const CLUE_NOTES: Record<ClueKind, string> = {
  photo: "A blurred photograph that sharpens as they get it. They say where it was taken.",
  voice: "A few seconds of your voice. They say where you were.",
  letter: "A sealed letter. They break the wax and it writes itself on.",
  puzzle: "Three tiles in the wrong order. They put them right.",
  location: "Four places. Only one is the one.",
  video: "A short clip, then they carry on.",
  riddle: "Something only they would know the answer to.",
  drawer: "A drawer they have to pull open.",
  combination: "Three dials. A date that means something.",
  candles: "Candles lit in the right order.",
  constellation: "Stars joined in the right order.",
  key: "A key hidden somewhere on the page. They have to spot it.",
};

/** Whether this kind of clue has an answer that can be got wrong. */
export function clueIsAsked(kind: ClueKind): boolean {
  return kind === "photo" || kind === "voice" || kind === "location" || kind === "riddle" || kind === "combination";
}

export const clueSchema = z.object({
  kind: z.enum(CLUE_KINDS).default("letter"),
  /** What the map calls this stop. */
  place: z.string().max(80).default(""),
  /** The clue itself — read before they do anything. */
  prompt: z.string().max(500).default(""),

  /** The thing to look at or listen to while they work it out. */
  imageUrl: z.string().max(600).default(""),
  audioUrl: z.string().max(600).default(""),
  videoUrl: z.string().max(600).default(""),

  /** The answer, matched forgivingly. */
  answer: z.string().max(120).default(""),
  /** Wrong-but-plausible options, for the ones that offer a choice. */
  decoys: z.array(z.string().max(80)).max(3).default([]),
  /** Three digits, for the lock. */
  code: z.string().max(3).default("000"),
  /** Shown if they ask for help. Never a full giveaway unless the creator writes one. */
  nudge: z.string().max(200).default(""),
});

export type Clue = z.infer<typeof clueSchema>;

export const stopSchema = z.object({
  id: z.string().min(1),
  clue: clueSchema,
  /** What they get for it, pinned to the board. */
  reward: memoryBlockSchema,
  pin: z.enum(PIN_IDS).default("polaroid"),
  /** A line of narration as the reward is pinned. */
  aside: z.string().max(200).default(""),
});

export type Stop = z.infer<typeof stopSchema>;

export const treasureHuntContentSchema = z.object({
  journey: z.enum(JOURNEY_IDS).default("romantic"),
  map: z.enum(MAP_STYLE_IDS).default("vintageTreasure"),

  title: z.string().max(120).default(""),
  /** The two lines before the ribbon unties. */
  openingLines: z.array(z.string().max(120)).max(3).default([]),

  stops: z.array(stopSchema).max(15).default([]),

  /* ---------- the chest ---------- */
  /** Engraved on the lid. */
  chestPlate: z.string().max(60).default(""),
  /** What's actually inside — the whole point of the journey. */
  treasure: memoryBlockSchema,
  /**
   * The chest can also be a doorway to another Kindloop gift, which is often the
   * real answer: a proposal page, a scrapbook, a Memoryverse.
   */
  treasureLinkUrl: z.string().max(600).default(""),
  treasureLinkLabel: z.string().max(80).default(""),

  closingLine: z.string().max(240).default(""),
  /** Creator-supplied ambience, if they want any sound at all. */
  ambienceUrl: z.string().max(600).default(""),
});

export type TreasureHuntContent = z.infer<typeof treasureHuntContentSchema>;

/* ------------------------------------------------------------------ */
/* Answers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Is this near enough?
 *
 * Generous on purpose. Exact matching after case and punctuation is stripped, then
 * a containment check either way, so "paris" passes for "Paris, in the rain" and
 * vice versa. Someone who knows the answer must never be told they're wrong on a
 * technicality — that is the fastest way to ruin the thing.
 */
export function answerAccepted(given: string, expected: string): boolean {
  const norm = (s: string) =>
    s
      .trim()
      .toLowerCase()
      /* Ordinals go: dates are the commonest answer here, and "14th February"
         must not be judged wrong against "14 February". */
      .replace(/(\d+)(st|nd|rd|th)\b/g, "$1")
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  const a = norm(given);
  const b = norm(expected);
  if (!a) return false;
  /* No answer configured — accept anything they say rather than locking them out
     of a stop the creator forgot to finish. Being generous here costs nothing;
     the alternative is an unanswerable clue in a gift somebody already sent. */
  if (!b) return true;
  if (a === b) return true;
  if (a.length >= 3 && b.includes(a)) return true;
  if (b.length >= 3 && a.includes(b)) return true;
  /* Last resort: the unlock engine's alphanumeric-only compare, which catches
     answers run together without spaces. */
  return passwordMatches(norm(given), norm(expected));
}

/** Three digits, always — a short or non-numeric code would jam the dials. */
export function normaliseCode(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 3).padEnd(3, "0");
}

/** The choices for a "pick the place" clue, in a stable order. */
export function choicesFor(stop: Stop): string[] {
  const all = [stop.clue.answer, ...stop.clue.decoys].filter((s) => s.trim().length > 0);
  /* Ordered by a hash of the stop id rather than shuffled, so the right answer
     isn't always first and the order doesn't change under the person's cursor. */
  let h = 2166136261;
  for (let i = 0; i < stop.id.length; i += 1) {
    h ^= stop.id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const offset = (h >>> 0) % Math.max(1, all.length);
  return [...all.slice(offset), ...all.slice(0, offset)];
}

/* ------------------------------------------------------------------ */
/* The route                                                          */
/* ------------------------------------------------------------------ */

export interface RoutePoint {
  x: number;
  y: number;
}

/**
 * Where the stops sit on the map, as percentages.
 *
 * A wandering line rather than a neat arc — a real map's route doubles back. It is
 * derived from the stop count alone, so the same journey always draws the same
 * route on the server and in the browser.
 */
export function routePoints(count: number): RoutePoint[] {
  if (count <= 0) return [];
  if (count === 1) return [{ x: 50, y: 50 }];

  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    /* Left to right, with a lean into the middle of the sheet. */
    const x = 12 + t * 76;
    /* Two overlaid waves so the path never looks like a sine curve. */
    const y = 50 + Math.sin(t * Math.PI * 1.9) * 26 + Math.sin(t * Math.PI * 4.4) * 7;
    return { x, y: Math.max(14, Math.min(84, y)) };
  });
}

/** The route as an SVG path through the stops, curved rather than straight. */
export function routePath(points: RoutePoint[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const next = points[i];
    /* A gentle S between each pair, so it reads as drawn by hand. */
    const cx1 = prev.x + (next.x - prev.x) * 0.42;
    const cx2 = prev.x + (next.x - prev.x) * 0.58;
    d += ` C ${cx1} ${prev.y}, ${cx2} ${next.y}, ${next.x} ${next.y}`;
  }
  return d;
}

/** How far along they are, as words. */
export function journeyNote(solved: number, total: number, stopWord: string): string {
  const left = total - solved;
  if (total === 0) return "No stops yet.";
  if (left <= 0) return "Every stop found.";
  if (solved === 0) return `${total} ${stopWord}s. Start at the first one.`;
  if (left === 1) return `One ${stopWord} left.`;
  return `${left} more ${stopWord}s.`;
}

/* ------------------------------------------------------------------ */

export function makeStop(id: string, kind: ClueKind = "letter"): Stop {
  return stopSchema.parse({
    id,
    clue: { kind },
    reward: makeBlock(`${id}-r`, kind === "photo" ? "photo" : "text"),
  });
}

export function makeClue(kind: ClueKind): Clue {
  return clueSchema.parse({ kind });
}

export const emptyTreasureHuntContent: TreasureHuntContent = treasureHuntContentSchema.parse({
  journey: "romantic",
  map: "vintageTreasure",
  title: "A map, for you",
  openingLines: ["I've hidden something for you.", "But you'll have to find it."],
  stops: [
    {
      id: "s-1",
      clue: { kind: "letter", place: "Where it starts", prompt: "" },
      reward: makeBlock("s-1-r", "text"),
      pin: "note",
    },
  ],
  chestPlate: "For you",
  treasure: makeBlock("treasure", "letter"),
  closingLine: "The treasure was never the prize. It was every memory we made along the way.",
});

export const TH_FALLBACKS = {
  title: "A map, for you",
  chestPlate: "For you",
  closingLine: "The treasure was never the prize. It was every memory we made along the way.",
} as const;
